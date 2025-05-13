/**
 * map service
 */

class MapService {
    constructor() {
        this.map = null;
        this.mapboxMap = null;
        this.markers = [];
        this.routes = [];
        this.currentDay = 1;
        this.currentDayActivities = [];
        this.activeMarker = null;
        this.activeRoute = null;
        this.showTraffic = false;
        this.userLocation = null; // save the user's current location
        this.exploreDragMarker = null; // for the explore mode, the draggable marker
        this.poiMarkers = []; // store the POI markers
        this.currentWalkingMinutes = 15; // default walking time
    }
    
    /**
     * initialize the map
     */
    async initMap() {
        try {
            console.log('initializing the map...');
            
            // get the map container
            const mapContainer = document.getElementById('map');
            if (!mapContainer) {
                console.error('cannot find the map container');
                return false;
            }
            
            // create and add the initial overlay
            this.createInitialOverlay();
            
            // set the Mapbox access token
            mapboxgl.accessToken = CONFIG.mapbox.accessToken;
            
            // use London as the default center point
            const defaultCenter = [-0.1278, 51.5074]; // London coordinates [longitude, latitude]
            
            // create the map instance
            this.mapboxMap = new mapboxgl.Map({
                container: 'map',
                style: CONFIG.mapbox.style,
                center: defaultCenter,
                zoom: CONFIG.mapbox.zoom,
                attributionControl: false
            });
            
            // add the zoom control
            this.mapboxMap.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
            
            // add the geolocation control
            this.mapboxMap.addControl(
                new mapboxgl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true
                    },
                    trackUserLocation: true
                }),
                'bottom-right'
            );
            
            // wait for the map to load
            await new Promise(resolve => {
                this.mapboxMap.on('load', () => {
                    console.log('map loaded');
                    resolve();
                });
            });
            
            // add the walking radius layer
            this.mapboxMap.addSource('walking-radius', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[]]
                    }
                }
            });
            
            // add the 10 minutes walking radius layer
            this.mapboxMap.addLayer({
                id: 'walking-radius-10',
                type: 'fill',
                source: 'walking-radius',
                paint: {
                    'fill-color': '#3498db',
                    'fill-opacity': 0.3,
                    'fill-outline-color': '#3498db'
                },
                filter: ['==', 'duration', 10],
                layout: {
                    visibility: 'none'
                }
            });
            
            // add the 10 minutes walking radius border line layer
            this.mapboxMap.addLayer({
                id: 'walking-radius-10-border',
                type: 'line',
                source: 'walking-radius',
                paint: {
                    'line-color': '#3498db',
                    'line-width': 2,
                    'line-opacity': 0.8
                },
                filter: ['==', 'duration', 10],
                layout: {
                    visibility: 'none'
                }
            });
            
            // add the 15 minutes walking radius layer
            this.mapboxMap.addLayer({
                id: 'walking-radius-15',
                type: 'fill',
                source: 'walking-radius',
                paint: {
                    'fill-color': '#2ecc71',
                    'fill-opacity': 0.3,
                    'fill-outline-color': '#2ecc71'
                },
                filter: ['==', 'duration', 15],
                layout: {
                    visibility: 'none'
                }
            });
            
            // add the 15 minutes walking radius border line layer
            this.mapboxMap.addLayer({
                id: 'walking-radius-15-border',
                type: 'line',
                source: 'walking-radius',
                paint: {
                    'line-color': '#2ecc71',
                    'line-width': 2,
                    'line-opacity': 0.8
                },
                filter: ['==', 'duration', 15],
                layout: {
                    visibility: 'none'
                }
            });
            
            // initialize the Google services
            this.initGoogleServiceContainer(defaultCenter);
            
            // set the map control buttons
            this.setupMapControls();
            
            // initialize the explore panel button
            this.setupExplorePanelButton();
            
            // try to get the user's location
            this.getUserLocation();
            
            return true;
        } catch (error) {
            console.error('map initialization failed:', error);
            return false;
        }
    }
    
    /**
     * create the initial overlay
     */
    createInitialOverlay() {
        const mapContainer = document.querySelector('.map-container');
        if (!mapContainer) return;
        
        // check if the overlay already exists
        if (document.querySelector('.map-initial-overlay')) return;
        
        // create the overlay element
        const overlay = document.createElement('div');
        overlay.className = 'map-initial-overlay';
        
        // create the prompt content container
        const promptContainer = document.createElement('div');
        promptContainer.className = 'map-prompt-container';
        
        // create the title and text
        const title = document.createElement('div');
        title.className = 'map-prompt-title';
        title.textContent = 'Customize Your Journey';
        
        const text = document.createElement('div');
        text.className = 'map-prompt-text';
        text.textContent = 'Use the panel on the left to create your personalized travel plan';
        
        // assemble the DOM
        promptContainer.appendChild(title);
        promptContainer.appendChild(text);
        overlay.appendChild(promptContainer);
        
        // add to the map container
        mapContainer.appendChild(overlay);
    }
    
    /**
     * hide the initial overlay
     */
    hideInitialOverlay() {
        const overlay = document.querySelector('.map-initial-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            
            // remove the DOM element completely
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 500);
        }
    }
    
    /**
     * set the explore panel button
     */
    setupExplorePanelButton() {
        const explorePanelBtn = document.getElementById('explore-panel-btn');
        if (explorePanelBtn) {
            explorePanelBtn.addEventListener('click', () => {
                // prompt the user to select the point to explore
                const exploreMapBtn = document.getElementById('explore-area');
                
                // if the explore mode is already activated, prompt the user
                if (exploreMapBtn && exploreMapBtn.classList.contains('active')) {
                    alert('explore mode is activated. click the map to select the position to explore, or drag the explore marker to different positions.');
                    return;
                }
                
                // start the explore mode but do not automatically add markers, wait for the user to select
                this.startExploreMode();
            });
        }
        
        // set the POI selector close button
        const poiCloseBtn = document.getElementById('poi-close-btn');
        if (poiCloseBtn) {
            poiCloseBtn.addEventListener('click', () => {
                // close the explore mode
                this.stopExploreMode();
            });
        }
    }
    
    /**
     * get the user's current location
     */
    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                // success callback
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // save the user's location
                    this.userLocation = { lat, lng };
                    
                    console.log('get the user location:', lat, lng);
                    
                    // add the user's location marker
                    this.addUserLocationMarker(lat, lng);
                },
                // failure callback
                (error) => {
                    console.warn('cannot get the user location:', error.message);
                },
                // options
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            console.warn('browser does not support the geolocation feature');
        }
    }
    
    /**
     * add the user location marker
     * @param {number} lat - latitude
     * @param {number} lng - longitude
     */
    addUserLocationMarker(lat, lng) {
        // create the custom marker element
        const el = document.createElement('div');
        el.className = 'user-location-marker';
        el.innerHTML = '<i class="fas fa-circle"></i>';
        
        // create the marker
        const marker = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .addTo(this.mapboxMap);
            
        // add a hover popup
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 25
        }).setHTML('<div class="location-popup">You are here</div>');
        
        // when the mouse hovers over the marker, show the popup
        el.addEventListener('mouseenter', () => {
            marker.setPopup(popup);
            popup.addTo(this.mapboxMap);
        });
        
        // when the mouse leaves the marker, hide the popup
        el.addEventListener('mouseleave', () => {
            popup.remove();
        });
        
        // add the marker to the markers array, but do not associate it with any activity
        this.markers.push({ marker, element: el, isUserLocation: true });
    }
    
    /**
     * initialize the Google service container (for the Places API)
     * @param {Array} center - the center point coordinates [longitude, latitude]
     */
    initGoogleServiceContainer(center) {
        // create an invisible div as the Google Places Service container
        const googleServiceContainer = document.createElement('div');
        googleServiceContainer.style.display = 'none';
        googleServiceContainer.id = 'google-service-container';
        document.body.appendChild(googleServiceContainer);
        
        // create a simple map instance
        if (window.google && window.google.maps) {
            this.map = new google.maps.Map(googleServiceContainer, {
                center: { lat: center[1], lng: center[0] },
                zoom: CONFIG.mapbox.zoom
            });
            
            // initialize the API service
            apiService.initGoogleServices(this.map);
        }
    }
    
    /**
     * set the map control event listeners
     */
    setupMapControls() {
        const centerMapBtn = document.getElementById('center-map');
        if (centerMapBtn) {
            centerMapBtn.addEventListener('click', () => this.centerMap());
        }
        
        const toggleTrafficBtn = document.getElementById('toggle-traffic');
        if (toggleTrafficBtn) {
            toggleTrafficBtn.addEventListener('click', () => this.toggleTraffic());
        }
        
        // 添加探索按钮事件监听器
        const exploreBtn = document.getElementById('explore-area');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => this.toggleExploreMode());
        }
    }
    
    /**
     * reset the map to the initial state
     */
    resetMap() {
        // clear all markers and routes
        this.clearMarkers();
        this.clearRoutes();
        
        // reset the map center and zoom level
        this.mapboxMap.flyTo({
            center: CONFIG.mapbox.initialCenter,
            zoom: CONFIG.mapbox.zoom,
            essential: true
        });
    }
    
    /**
     * toggle the traffic status display
     */
    toggleTraffic() {
        this.showTraffic = !this.showTraffic;
        
        const toggleTrafficBtn = document.getElementById('toggle-traffic');
        if (toggleTrafficBtn) {
            if (this.showTraffic) {
                toggleTrafficBtn.classList.add('active');
            } else {
                toggleTrafficBtn.classList.remove('active');
            }
        }
        
        // toggle the Mapbox traffic layer
        const trafficLayerId = 'mapbox-traffic';
        if (this.showTraffic) {
            // if the layer does not exist, add the traffic layer
            if (!this.mapboxMap.getLayer(trafficLayerId)) {
                this.mapboxMap.addLayer({
                    id: trafficLayerId,
                    type: 'raster',
                    source: {
                        type: 'raster',
                        tiles: ['https://api.mapbox.com/styles/v1/mapbox/traffic-day-v2/tiles/{z}/{x}/{y}?access_token=' + CONFIG.mapbox.accessToken],
                        tileSize: 256
                    },
                    minzoom: 0,
                    maxzoom: 22
                });
            }
        } else {
            // if the layer exists, remove the traffic layer
            if (this.mapboxMap.getLayer(trafficLayerId)) {
                this.mapboxMap.removeLayer(trafficLayerId);
                if (this.mapboxMap.getSource(trafficLayerId)) {
                    this.mapboxMap.removeSource(trafficLayerId);
                }
            }
        }
    }
    
    /**
     * center the map to display all activities
     */
    centerMap() {
        if (!this.currentDayActivities || this.currentDayActivities.length === 0) {
            // if there are no activity points, reset to the default center point
            this.mapboxMap.flyTo({
                center: [-0.1278, 51.5074], // use London as the default center point
                zoom: CONFIG.mapbox.zoom,
                essential: true
            });
            return;
        }
        
        // filter the activities with valid location
        const validActivities = this.currentDayActivities.filter(activity => 
            activity.location && 
            typeof activity.location === 'object' && 
            !isNaN(activity.location.lat) && 
            !isNaN(activity.location.lng)
        );
        
        if (validActivities.length === 0) {
            console.warn('no valid location information, cannot center the map');
            // if there is no valid location, reset to the default center point
            this.mapboxMap.flyTo({
                center: [-0.1278, 51.5074], // use London as the default center point
                zoom: CONFIG.mapbox.zoom,
                essential: true
            });
            return;
        }
        
        try {
            // calculate the bounds of all points
            const bounds = new mapboxgl.LngLatBounds();
            
            validActivities.forEach(activity => {
                bounds.extend([activity.location.lng, activity.location.lat]);
            });
            
            // center the map to display all points
            this.mapboxMap.fitBounds(bounds, {
                padding: 100,
                maxZoom: 15,
                duration: 1000
            });
        } catch (error) {
            console.error('center the map failed:', error);
            // when an error occurs, reset to the default center point
            this.mapboxMap.flyTo({
                center: [-0.1278, 51.5074], // use London as the default center point
                zoom: CONFIG.mapbox.zoom,
                essential: true
            });
        }
    }
    
    /**
     * display the journey for the specified day
     * @param {Object} dayPlan - the day plan
     * @param {number} dayNumber - the day number
     */
    displayDayPlan(dayPlan, dayNumber) {
        console.log(`show the ${dayNumber} day plan:`, dayPlan);
        
        // save the current date and activities
        this.currentDay = dayNumber;
        this.currentDayActivities = dayPlan.activities;
        
        // hide the initial overlay
        this.hideInitialOverlay();
        
        // clear the previous markers and routes
        this.clearMarkers();
        this.clearRoutes();
        
        // if there are no activities, do not continue
        if (!dayPlan.activities || dayPlan.activities.length === 0) {
            console.log('this day has no activities');
            return;
        }
        
        // add the activity markers
        this.addActivityMarkers(dayPlan.activities);
        
        // calculate and display the routes
        this.calculateAndDisplayRoutes(dayPlan.activities);
        
        // center the map to display all points
        this.centerMap();
    }
    
    /**
     * add the activity markers
     * @param {Array} activities - the activities list
     */
    addActivityMarkers(activities) {
        // if there are no activities, return directly
        if (!activities || !Array.isArray(activities) || activities.length === 0) {
            console.warn('no activities data, cannot add the markers');
            return;
        }
        
        activities.forEach((activity, index) => {
            // 处理位置信息为空的情况
            if (!activity.location) {
                console.warn(`activity ${index + 1} "${activity.title}" has no location information, skip adding the markers`);
                return;
            }
            
            // get the location coordinates
            let lat, lng;
            
            // if the location is already an object and contains lat and lng, use it directly
            if (typeof activity.location === 'object' && 
                !isNaN(activity.location.lat) && !isNaN(activity.location.lng)) {
                lat = activity.location.lat;
                lng = activity.location.lng;
            } 
            // if the location is a string, use the geocodeLocation to generate the coordinates
            else if (typeof activity.location === 'string' && activity.location.trim() !== '') {
                // use London as the default location to generate the pseudo-random coordinates
                const londonLat = 51.5074;
                const londonLng = -0.1278;
                
                // use the same algorithm as the API service to generate the pseudo-random coordinates
                let seed = 0;
                for (let i = 0; i < activity.location.length; i++) {
                    seed += activity.location.charCodeAt(i);
                }
                
                // generate a random offset value between -0.02 and 0.02 based on the seed
                const latOffset = (seed % 100) / 2500 - 0.02;
                const lngOffset = ((seed * 13) % 100) / 2500 - 0.02;
                
                lat = londonLat + latOffset;
                lng = londonLng + lngOffset;
            }
            // if the coordinates are invalid, skip
            else {
                console.warn(`activity ${index + 1} "${activity.title}" has invalid location information, skip adding the markers`);
                return;
            }
            
            // ensure the coordinates are valid
            if (isNaN(lat) || isNaN(lng)) {
                console.warn(`activity ${index + 1} "${activity.title}" has invalid coordinates: ${lat}, ${lng}, skip adding the markers`);
                return;
            }
            
            // create the custom marker element
            const el = document.createElement('div');
            el.className = `map-marker marker-${activity.type || 'attraction'}`;
            el.textContent = (index + 1).toString();
            
            // add the click event to the marker
            el.addEventListener('click', () => {
                // show the place details
                placeDetailsService.showPlaceDetails(activity, index);
                
                // highlight the current marker
                this.highlightMarker(index);
            });
            
            try {
                // update or add the coordinates to the activity object
                if (typeof activity.location === 'string') {
                    activity.location = {
                        name: activity.location,
                        lat: lat,
                        lng: lng
                    };
                } else {
                    // ensure the location object contains lat and lng
                    activity.location.lat = lat;
                    activity.location.lng = lng;
                }
                
                // create the Mapbox marker
                const marker = new mapboxgl.Marker(el)
                    .setLngLat([lng, lat])
                    .addTo(this.mapboxMap);
                
                // save the marker reference
                this.markers.push({ marker, element: el, activity, index });
            } catch (error) {
                console.error(`cannot create the marker for activity ${index + 1} "${activity.title}":`, error);
            }
        });
    }
    
    /**
     * highlight the marker
     * @param {number} index - the activity index
     */
    highlightMarker(index) {
        // check if the index is valid
        if (index === null || index === undefined) {
            console.warn('invalid marker index');
            return;
        }
        
        // reset the previous highlighted marker
        if (this.activeMarker !== null) {
            const prevMarker = this.markers.find(m => m.index === this.activeMarker);
            if (prevMarker) {
                prevMarker.element.style.transform = '';
                prevMarker.element.style.zIndex = '';
            }
        }
        
        // set the new highlighted marker
        const marker = this.markers.find(m => m.index === index);
        if (marker) {
            marker.element.style.transform = 'scale(1.3)';
            marker.element.style.zIndex = '10';
            
            // ensure the coordinates are valid
            const lat = marker.activity.location.lat;
            const lng = marker.activity.location.lng;
            
            if (!isNaN(lat) && !isNaN(lng)) {
                // ensure the marker is in the view
                this.mapboxMap.flyTo({
                    center: [lng, lat],
                    zoom: 14,
                    essential: true
                });
            } else {
                console.warn(`cannot move to the marker ${index}, invalid coordinates`);
            }
        } else {
            console.warn(`cannot find the marker with index ${index}`);
        }
        
        this.activeMarker = index;
    }
    
    /**
     * clear all markers
     */
    clearMarkers() {
        this.markers.forEach(marker => {
            marker.marker.remove();
        });
        
        this.markers = [];
        this.activeMarker = null;
    }
    
    /**
     * calculate and display the routes
     * @param {Array} activities - the activities list
     */
    calculateAndDisplayRoutes(activities) {
        // 检查活动数据
        if (!activities || !Array.isArray(activities)) {
            console.warn('invalid activities data, cannot calculate the routes');
            return;
        }
        
        if (activities.length < 1) {
            console.warn('at least one activity point is required to calculate the routes');
            return;
        }
        
        // clear the existing routes
        this.clearRoutes();
        
        // filter the activities with valid location
        const validActivities = activities.filter(activity => 
            activity.location && 
            typeof activity.location === 'object' && 
            !isNaN(activity.location.lat) && 
            !isNaN(activity.location.lng)
        );
        
        if (validActivities.length < 1) {
            console.warn('not enough valid location information to calculate the routes');
            return;
        }
        
        // get the current selected transport modes
        const transportModes = this.getSelectedTransportModes();
        if (transportModes.length === 0) {
            console.warn('no transport mode selected, use the default mode');
            transportModes.push(CONFIG.app.defaultTransportModes[0]);
        }
        
        // use the first transport mode as the default mode
        const defaultMode = transportModes[0];
        
        try {
            // if there is user location, calculate the route from the user location to the first activity point
            if (this.userLocation && validActivities.length > 0) {
                const firstActivity = validActivities[0];
                const startPoint = {
                    lat: this.userLocation.lat,
                    lng: this.userLocation.lng
                };
                const endPoint = {
                    lat: firstActivity.location.lat,
                    lng: firstActivity.location.lng
                };
                
                console.log('calculate the route from the user location to the first activity point');
                
                // use the simple line route to connect the user location and the first activity point
                this.displaySimpleRoute([startPoint, endPoint], defaultMode, 'user-to-first');
                
                // add the user location marker (if not added yet)
                if (!this.markers.some(m => m.isUserLocation)) {
                    this.addUserLocationMarker(this.userLocation.lat, this.userLocation.lng);
                }
            }
            
            // then calculate the routes between the activity points
            for (let i = 0; i < validActivities.length - 1; i++) {
                const currentActivity = validActivities[i];
                const nextActivity = validActivities[i + 1];
                
                const startPoint = {
                    lat: currentActivity.location.lat,
                    lng: currentActivity.location.lng
                };
                const endPoint = {
                    lat: nextActivity.location.lat,
                    lng: nextActivity.location.lng
                };
                
                console.log(`calculate the route from activity ${i+1} to activity ${i+2}`);
                
                // add a unique identifier to each segment
                const routeId = `route-${i}-to-${i+1}`;
                    
                // use the simple line route to connect the two activity points
                this.displaySimpleRoute([startPoint, endPoint], defaultMode, routeId);
            }
            
            // adjust the map view to display all points (including the user location)
            this.fitMapToAllPoints(validActivities);
            
        } catch (error) {
            console.error('calculate the routes failed:', error);
        }
    }
    
    /**
     * get the user selected transport modes
     * @returns {Array} - the transport modes list
     */
    getSelectedTransportModes() {
        const modes = [];
        const transportOptions = document.querySelectorAll('.transport-options input:checked');
        
        transportOptions.forEach(option => {
            modes.push(option.value);
        });
        
        return modes.length > 0 ? modes : CONFIG.app.defaultTransportModes;
    }
    
    /**
     * display the routes returned by Google Directions API
     * @param {Object} result - the routes result
     * @param {string} mode - the transport mode
     */
    displayRoute(result, mode) {
        if (!result.routes || result.routes.length === 0) return;
        
        // get all points in the routes
        const route = result.routes[0];
        const points = [];
        
        route.legs.forEach(leg => {
            leg.steps.forEach(step => {
                if (step.path) {
                    step.path.forEach(point => {
                        points.push([point.lng(), point.lat()]);
                    });
                } else if (step.polyline) {
                    // decode the polyline
                    const decodedPath = google.maps.geometry.encoding.decodePath(step.polyline.points);
                    decodedPath.forEach(point => {
                        points.push([point.lng(), point.lat()]);
                    });
                }
            });
        });
        
        // if there are not enough points, return directly
        if (points.length < 2) return;
        
        // add the routes layer
        const routeId = `route-${mode}-${Date.now()}`;
        
        // add the GeoJSON source
        this.mapboxMap.addSource(routeId, {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: points
                }
            }
        });
        
        // add the line layer
        this.mapboxMap.addLayer({
            id: routeId,
            type: 'line',
            source: routeId,
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': CONFIG.transportModes[mode]?.color,
                'line-width': 4,
                'line-opacity': 0.8
            }
        });
        
        // save the routes reference
        this.routes.push({ id: routeId, mode });
    }
    
    /**
     * display the simple line route (when the detailed routes are not available)
     * @param {Array} waypoints - the route points
     * @param {string} mode - the transport mode
     * @param {string} routeIdSuffix - the route ID suffix (optional)
     */
    displaySimpleRoute(waypoints, mode, routeIdSuffix = '') {
        // check the parameters
        if (!waypoints || !Array.isArray(waypoints) || waypoints.length < 2) {
            console.warn('invalid route points, cannot display the simple route');
            return;
        }
        
        if (!mode) {
            console.warn('no transport mode specified, use the default mode');
            mode = CONFIG.app.defaultTransportModes[0];
        }
        
        try {
            // ensure all coordinates are valid
            const validWaypoints = waypoints.filter(point => 
                point && !isNaN(point.lng) && !isNaN(point.lat)
            );
            
            if (validWaypoints.length < 2) {
                console.warn('not enough valid coordinates to display the route');
                return;
            }
            
            // prepare the coordinates
            const coordinates = validWaypoints.map(point => [point.lng, point.lat]);
            
            // add the routes layer
            const routeId = `simple-route-${mode}-${routeIdSuffix || Date.now()}`;
            
            // add the GeoJSON source
            this.mapboxMap.addSource(routeId, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates
                    }
                }
            });
            
            // get the color of the transport mode
            const color = CONFIG.transportModes[mode]?.color || "#3498db";
            
            // add the line layer
            this.mapboxMap.addLayer({
                id: routeId,
                type: 'line',
                source: routeId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': color,
                    'line-width': 3,
                    'line-opacity': 0.6,
                    'line-dasharray': [2, 1]  // dashed line style, indicating this is a simplified route
                }
            });
            
            // save the routes reference
            this.routes.push({ id: routeId, mode });
        } catch (error) {
            console.error('create the simple route failed:', error);
        }
    }
    
    /**
     * clear all routes
     */
    clearRoutes() {
        // remove all routes layers and sources
        this.routes.forEach(route => {
            if (this.mapboxMap.getLayer(route.id)) {
                this.mapboxMap.removeLayer(route.id);
            }
            if (this.mapboxMap.getSource(route.id)) {
                this.mapboxMap.removeSource(route.id);
            }
        });
        
        // clear the routes array
        this.routes = [];
        
        // if the routes details are displayed, restore the original itinerary content
        if (placeDetailsService && placeDetailsService.showInPanel && placeDetailsService.originalContent) {
            // if the user is in the details page, restore the original itinerary content normally
            if (placeDetailsService.pageLevel === 1) {
                const itineraryContent = document.getElementById('itinerary-details');
                const closeButton = document.getElementById('panel-close-details');
                
                if (itineraryContent) {
                    itineraryContent.innerHTML = placeDetailsService.originalContent;
                    
                    // reinitialize the click events of the activity cards
                    const activityCards = itineraryContent.querySelectorAll('.activity-card');
                    activityCards.forEach((card, index) => {
                        // remove the old click events
                        const newCard = card.cloneNode(true);
                        card.parentNode.replaceChild(newCard, card);
                        
                        // get the current activity data
                        const activities = itineraryService.getCurrentDayActivities();
                        if (activities && activities.length > index) {
                            const activity = activities[index];
                            
                            // re-add the click events
                            newCard.addEventListener('click', () => {
                                placeDetailsService.setDisplayMode(true);
                                placeDetailsService.showPlaceDetails(activity, index);
                                mapService.highlightMarker(index);
                            });
                            
                            // re-add the navigation button click events
                            const navButton = newCard.querySelector('.navigation-button');
                            if (navButton) {
                                navButton.addEventListener('click', (e) => {
                                    e.stopPropagation();
                                    itineraryService.startNavigation(activity, index);
                                });
                            }
                        }
                    });
                }
                
                // hide the close button
                if (closeButton) {
                    closeButton.style.display = 'none';
                }
                
                // show the back to form button
                const backToFormButton = document.getElementById('back-to-form');
                if (backToFormButton) {
                    backToFormButton.style.display = 'block';
                }
                
                // reset the page level and clear the saved original content
                placeDetailsService.pageLevel = 0;
                placeDetailsService.originalContent = null;
            }
        }
    }
    
    /**
     * calculate and display the navigation route to the specified activity
     * @param {Object} targetActivity - the target activity
     * @param {number} activityIndex - the activity index
     * @param {Array} activities - all activities of the current day
     * @param {boolean} useUserLocation - whether to use the user location as the starting point, default is false
     */
    calculateRouteToActivity(targetActivity, activityIndex, activities, useUserLocation = false) {
        // clear the existing routes
        this.clearRoutes();
        
        // get the target location
        let targetLocation;
        let targetName = targetActivity.title || 'Destination';
        
        if (typeof targetActivity.location === 'string') {
            // if it is a string, try to get the coordinates from LONDON_COORDINATES
            const locationName = targetActivity.location;
            if (window.mockData2 && window.mockData2.LONDON_COORDINATES[locationName]) {
                const coords = window.mockData2.LONDON_COORDINATES[locationName];
                targetLocation = { lat: coords.lat, lng: coords.lng };
                // use the location name as the navigation title
                if (!targetActivity.title) {
                    targetName = locationName;
                }
            } else {
                console.warn('cannot find the coordinates of the location:', locationName);
                alert('cannot navigate: cannot find the destination coordinates');
                return;
            }
        } else if (targetActivity.location && !isNaN(targetActivity.location.lat) && !isNaN(targetActivity.location.lng)) {
            // if it is an object, use it directly
            targetLocation = { lat: targetActivity.location.lat, lng: targetActivity.location.lng };
            // if the location has a name property and the activity has no title, use the location.name
            if (!targetActivity.title && targetActivity.location.name) {
                targetName = targetActivity.location.name;
            }
        } else {
            console.warn('invalid target location:', targetActivity.location);
            alert('cannot navigate: invalid destination location');
            return;
        }
        
        // get the starting location
        let startLocation;
        let startName = 'Start';
        
        // 
        if (useUserLocation && this.userLocation) {
            // if the user location is available and the user location is required
            startLocation = this.userLocation;
            startName = 'your location';
            console.log('use your current location as the starting point');
        } 
        // use the previous activity as the starting point (if it exists)
        else if (activityIndex > 0 && activities[activityIndex - 1]) {
            const prevActivity = activities[activityIndex - 1];
            startName = prevActivity.title || 'the previous location';
            console.log('use the previous location as the starting point:', startName);
            
            if (typeof prevActivity.location === 'string') {
                // if the location is a string, try to get the coordinates from LONDON_COORDINATES
                const locationName = prevActivity.location;
                if (window.mockData2 && window.mockData2.LONDON_COORDINATES[locationName]) {
                    const coords = window.mockData2.LONDON_COORDINATES[locationName];
                    startLocation = { lat: coords.lat, lng: coords.lng };
                    // if there is no title, use the location name
                    if (!prevActivity.title) {
                        startName = locationName;
                    }
                }
            } else if (prevActivity.location && !isNaN(prevActivity.location.lat) && !isNaN(prevActivity.location.lng)) {
                // if the location is an object, use it directly
                startLocation = { lat: prevActivity.location.lat, lng: prevActivity.location.lng };
                // if the location has a name property and the activity has no title, use the location.name
                if (!prevActivity.title && prevActivity.location.name) {
                    startName = prevActivity.location.name;
                }
            }
        }
        
        // if there is no valid starting point, use the user location or the center of London
        if (!startLocation) {
            if (this.userLocation) {
                startLocation = this.userLocation;
                startName = 'your location';
                console.log('cannot get the location of the previous activity, use your current location as the starting point');
            } else {
                startLocation = { lat: 51.5074, lng: -0.1278 }; // London Center
                startName = 'London Center';
                console.log('cannot get the location of the previous activity, use the center of London as the starting point');
            }
        }
        
        // get the current selected transport modes
        const transportModes = this.getSelectedTransportModes();
        if (transportModes.length === 0) {
            console.warn('no transport mode selected, use the default mode');
            transportModes.push(CONFIG.app.defaultTransportModes[0]);
        }
        
        // use the first transport mode
        const travelMode = transportModes[0];
        
        // configure the details to be displayed in the left panel
        if (placeDetailsService) {
            placeDetailsService.setDisplayMode(true);
            
            // save the current itinerary content for later restoration (if not saved yet)
            const itineraryContent = document.getElementById('itinerary-details');
            if (itineraryContent && !placeDetailsService.originalContent) {
                placeDetailsService.originalContent = itineraryContent.innerHTML;
            }
        }
        
        // request the route, pass the starting point and the destination name
        this.requestDirections(startLocation, targetLocation, travelMode, startName, targetName);
    }
    
    /**
     * request and display the detailed navigation route
     * @param {Object} start - the starting point coordinates {lat, lng}
     * @param {Object} end - the end point coordinates {lat, lng}
     * @param {string} mode - the transport mode
     * @param {string} startName - the starting point name
     * @param {string} endName - the destination name
     */
    requestDirections(start, end, mode, startName = 'Start', endName = 'Destination') {
        // first calculate the linear distance between the two points
        const distanceInMeters = this.calculateDistance(start, end);
        
        // if the distance is too short (less than 100 meters), display the nearby information instead of the navigation route
        if (distanceInMeters < 100) {
            // clear the existing routes
            this.clearRoutes();
            
            // use the simple line route to connect the two points
            this.showSimpleNavigation(start, end, mode, startName, endName);
            
            // display the nearby destination information
            this.showNearbyDestinationMessage(start, end, distanceInMeters, startName, endName);
            return;
        }
        
        // 确保Google Maps Directions服务可用
        if (!window.google || !window.google.maps || !window.google.maps.DirectionsService) {
            console.error('Google Maps Directions service is not available');
            // use the simple line route to connect the two points
            this.showSimpleNavigation(start, end, mode, startName, endName);
            return;
        }
        
        // create the navigation request parameters
        const request = {
            origin: start,
            destination: end,
            travelMode: this.getGoogleTravelMode(mode),
            language: 'en' // force to display the route instructions in English
        };
        
        // create the Directions service
        const directionsService = new google.maps.DirectionsService();
        
        // send the request
        directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                // display the navigation route
                this.displayNavigationRoute(result, mode);
                
                // display the navigation panel
                this.showNavigationPanel(result, mode, start, end, startName, endName);
                
                // fit the map to the route
                this.fitMapToRoute(result);
            } else {
                console.error('request the navigation route failed:', status);
                
                // check if the failure is because the two points are too close
                if (distanceInMeters < 500) {
                    console.log('the destination is very close, display the simple navigation');
                    // use the simple line route to connect the two points
                    this.showSimpleNavigation(start, end, mode, startName, endName);
                    
                    // display the nearby destination information
                    this.showNearbyDestinationMessage(start, end, distanceInMeters, startName, endName);
                } else {
                    // other failure reasons
                    alert('failed to get the navigation route, display the simple route');
                    // use the simple line route to connect the two points
                    this.showSimpleNavigation(start, end, mode, startName, endName);
                }
            }
        });
    }
    
    /**
     * display the nearby destination information
     * @param {Object} start - the starting point coordinates {lat, lng}
     * @param {Object} end - the end point coordinates {lat, lng}
     * @param {number} distanceInMeters - the distance (meters)
     * @param {string} startName - the starting point name
     * @param {string} endName - the end point name
     */
    showNearbyDestinationMessage(start, end, distanceInMeters, startName, endName) {
        // get or create the navigation panel container
        let navPanel = document.getElementById('navigation-panel');
        if (!navPanel) {
            navPanel = document.createElement('div');
            navPanel.id = 'navigation-panel';
            navPanel.className = 'navigation-panel';
            
            // insert the navigation panel into the main container
            const mainContainer = document.querySelector('main');
            if (mainContainer) {
                mainContainer.insertBefore(navPanel, mainContainer.firstChild);
            } else {
                document.body.appendChild(navPanel);
            }
        }
        
        // clear the navigation panel
        navPanel.innerHTML = '';
        
        // create the navigation panel title
        const panelHeader = document.createElement('div');
        panelHeader.className = 'nav-panel-header';
        
        // add the close button
        const closeButton = document.createElement('button');
        closeButton.className = 'nav-close-button';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.addEventListener('click', () => {
            navPanel.classList.remove('active');
            
            // if the left panel is displayed, use the backToItinerary method
            if (placeDetailsService && placeDetailsService.showInPanel && placeDetailsService.pageLevel === 1) {
                placeDetailsService.backToItinerary();
            } else {
                // otherwise, simply clear the routes
                this.clearRoutes();
                
                // ensure the back to form button is visible
                const backToFormButton = document.getElementById('back-to-form');
                if (backToFormButton) {
                    backToFormButton.style.display = 'block';
                }
            }
        });
        
        // add the title text
        const titleText = document.createElement('h3');
        titleText.textContent = `Destination Nearby`;
        
        // combine the title bar
        panelHeader.appendChild(titleText);
        panelHeader.appendChild(closeButton);
        navPanel.appendChild(panelHeader);
        
        // format the distance
        let distanceText;
        if (distanceInMeters < 100) {
            distanceText = `${Math.round(distanceInMeters)} meters`;
        } else {
            distanceText = `${(distanceInMeters / 1000).toFixed(1)} km`;
        }
        
        // add the route summary information
        const routeSummary = document.createElement('div');
        routeSummary.className = 'route-summary';
        
        // create the distance information
        const distanceElem = document.createElement('div');
        distanceElem.className = 'route-distance';
        distanceElem.innerHTML = `<i class="fas fa-route"></i> ${distanceText} away`;
        
        // estimate the walking time (about 80 meters per minute)
        const walkingMinutes = Math.ceil(distanceInMeters / 80);
        const timeElem = document.createElement('div');
        timeElem.className = 'route-duration';
        timeElem.innerHTML = `<i class="fas fa-walking"></i> About ${walkingMinutes} min walk`;
        
        // add the summary information
        routeSummary.appendChild(distanceElem);
        routeSummary.appendChild(timeElem);
        navPanel.appendChild(routeSummary);
        
        // create the nearby destination information
        const nearbyMessage = document.createElement('div');
        nearbyMessage.className = 'nearby-destination-message';
        
        if (distanceInMeters < 50) {
            nearbyMessage.innerHTML = `
                <p><strong>${endName}</strong> is very close to <strong>${startName}</strong>. You can see it from where you are!</p>
                <p>Just look around - it's only ${distanceText} away.</p>
            `;
        } else {
            nearbyMessage.innerHTML = `
                <p><strong>${endName}</strong> is nearby <strong>${startName}</strong>.</p>
                <p>It's a short ${walkingMinutes} minute walk (${distanceText}).</p>
            `;
        }
        
        navPanel.appendChild(nearbyMessage);
        
        // display the navigation panel
        navPanel.classList.add('active');
    }
    
    /**
     * get the Google Maps travel mode according to the transport mode
     * @param {string} mode - the transport mode
     * @returns {string} - the Google Maps travel mode
     */
    getGoogleTravelMode(mode) {
        const modeMap = {
            'driving': google.maps.TravelMode.DRIVING,
            'walking': google.maps.TravelMode.WALKING,
            'bicycling': google.maps.TravelMode.BICYCLING,
            'transit': google.maps.TravelMode.TRANSIT,
            'public': google.maps.TravelMode.TRANSIT
        };
        
        return modeMap[mode] || google.maps.TravelMode.DRIVING;
    }
    
    /**
     * display the navigation route
     * @param {Object} result - the navigation result
     * @param {string} mode - the transport mode
     */
    displayNavigationRoute(result, mode) {
        if (!result.routes || result.routes.length === 0) {
            console.warn('no routes in the navigation result');
            return;
        }
        
        // clear the existing routes
        this.clearRoutes();
        
        // get the route
        const route = result.routes[0];
        
        // build the route coordinates
        const coordinates = [];
        
        route.legs.forEach(leg => {
            leg.steps.forEach(step => {
                if (step.path) {
                    step.path.forEach(point => {
                        coordinates.push([point.lng(), point.lat()]);
                    });
                } else if (step.polyline) {
                    // decode the polyline
                    const decodedPath = google.maps.geometry.encoding.decodePath(step.polyline.points);
                    decodedPath.forEach(point => {
                        coordinates.push([point.lng(), point.lat()]);
                    });
                }
            });
        });
        
        if (coordinates.length < 2) {
            console.warn('the route coordinates are not enough, cannot display the route');
            return;
        }
        
        // create the route layer
        const routeId = `navigation-route-${mode}-${Date.now()}`;
        
        // add the GeoJSON source
        this.mapboxMap.addSource(routeId, {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates
                }
            }
        });
        
        // get the color according to the transport mode
        const color = CONFIG.transportModes[mode]?.color || "#3498db";
        
        // add the line layer
        this.mapboxMap.addLayer({
            id: routeId,
            type: 'line',
            source: routeId,
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': color,
                'line-width': 5,
                'line-opacity': 0.8
            }
        });
        
        // save the route reference
        this.routes.push({ id: routeId, mode });
    }
    
    /**
     * display the navigation panel
     * @param {Object} result - the navigation result
     * @param {string} mode - the transport mode
     * @param {Object} startLocation - the starting point location
     * @param {Object} endLocation - the end point location
     * @param {string} startName - the starting point name
     * @param {string} endName - the end point name
     */
    showNavigationPanel(result, mode, startLocation, endLocation, startName = 'Start', endName = 'Destination') {
        if (!result.routes || result.routes.length === 0) return;
        
        // get or create the navigation panel container
        let navPanel = document.getElementById('navigation-panel');
        if (!navPanel) {
            navPanel = document.createElement('div');
            navPanel.id = 'navigation-panel';
            navPanel.className = 'navigation-panel';
            
            // insert the navigation panel into the main container
            const mainContainer = document.querySelector('main');
            if (mainContainer) {
                mainContainer.insertBefore(navPanel, mainContainer.firstChild);
            } else {
                document.body.appendChild(navPanel);
            }
        }
        
        // clear the navigation panel
        navPanel.innerHTML = '';
        
        // create the navigation panel title
        const panelHeader = document.createElement('div');
        panelHeader.className = 'nav-panel-header';
        
        // add the close button
        const closeButton = document.createElement('button');
        closeButton.className = 'nav-close-button';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.addEventListener('click', () => {
            navPanel.classList.remove('active');
            // if the left panel is displayed, use the backToItinerary method
            if (placeDetailsService && placeDetailsService.showInPanel && placeDetailsService.pageLevel === 1) {
                placeDetailsService.backToItinerary();
            } else {
                // otherwise, simply clear the routes
                this.clearRoutes();
            }
        });
        
        // add the title text
        const titleText = document.createElement('h3');
        
        // get the English transport mode label
        const transportLabels = {
            'driving': 'Driving',
            'walking': 'Walking',
            'bicycling': 'Cycling',
            'transit': 'Public Transit',
            'public': 'Public Transit'
        };
        const transportLabel = transportLabels[mode] || mode;
        
        titleText.textContent = `${transportLabel} Navigation: ${startName} → ${endName}`;
        
        // combine the title bar
        panelHeader.appendChild(titleText);
        panelHeader.appendChild(closeButton);
        navPanel.appendChild(panelHeader);
        
        // add the route summary information
        const routeSummary = document.createElement('div');
        routeSummary.className = 'route-summary';
        
        // get the information of the first leg
        const leg = result.routes[0].legs[0];
        
        // create the distance information
        const distance = document.createElement('div');
        distance.className = 'route-distance';
        distance.innerHTML = `<i class="fas fa-route"></i> ${leg.distance.text}`;
        
        // create the duration information
        const duration = document.createElement('div');
        duration.className = 'route-duration';
        duration.innerHTML = `<i class="fas fa-clock"></i> ${leg.duration.text}`;
        
        // add the summary information
        routeSummary.appendChild(distance);
        routeSummary.appendChild(duration);
        navPanel.appendChild(routeSummary);
        
        // create the steps container
        const stepsContainer = document.createElement('div');
        stepsContainer.className = 'route-steps';
        
        // add each step
        leg.steps.forEach((step, i) => {
            const stepItem = document.createElement('div');
            stepItem.className = 'route-step';
            
            // step icon (display different icons according to the step type)
            const stepIcon = document.createElement('div');
            stepIcon.className = 'step-icon';
            
            // select the icon according to the step type
            let iconClass = 'fa-arrow-right'; // default icon
            
            if (step.travel_mode === 'TRANSIT') {
                iconClass = 'fa-bus';
                
                // adjust the icon according to the specific type of public transport
                if (step.transit && step.transit.line && step.transit.line.vehicle) {
                    const vehicleType = step.transit.line.vehicle.type.toLowerCase();
                    if (vehicleType === 'subway' || vehicleType === 'metro_rail') {
                        iconClass = 'fa-subway';
                    } else if (vehicleType === 'bus') {
                        iconClass = 'fa-bus';
                    } else if (vehicleType === 'train') {
                        iconClass = 'fa-train';
                    }
                }
            } else if (step.maneuver) {
                const maneuver = step.maneuver.toLowerCase();
                if (maneuver.includes('turn-left')) {
                    iconClass = 'fa-arrow-left';
                } else if (maneuver.includes('turn-right')) {
                    iconClass = 'fa-arrow-right';
                } else if (maneuver.includes('roundabout')) {
                    iconClass = 'fa-sync';
                } else if (maneuver.includes('straight')) {
                    iconClass = 'fa-arrow-up';
                }
            }
            
            stepIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;
            
            // step content
            const stepContent = document.createElement('div');
            stepContent.className = 'step-content';
            
            // step instructions
            const stepInstructions = document.createElement('div');
            stepInstructions.className = 'step-instructions';
            // remove the HTML tags
            const instructions = step.instructions.replace(/<\/?[^>]+(>|$)/g, '');
            stepInstructions.textContent = `${i + 1}. ${instructions}`;
            
            // add the transit line info
            if (step.travel_mode === 'TRANSIT' && step.transit) {
                // create the transit info element
                const transitInfo = document.createElement('div');
                transitInfo.className = 'transit-info';
                
                // get the transit line name
                const lineName = step.transit.line && step.transit.line.short_name 
                    ? step.transit.line.short_name 
                    : (step.transit.line && step.transit.line.name ? step.transit.line.name : '');
                
                // get the vehicle type
                const vehicleType = step.transit.line && step.transit.line.vehicle 
                    ? step.transit.line.vehicle.type.toLowerCase() 
                    : '';
                
                // determine the Chinese name of the vehicle type
                let vehicleTypeName = 'public transport';
                if (vehicleType === 'subway' || vehicleType === 'metro_rail') {
                    vehicleTypeName = 'subway';
                } else if (vehicleType === 'bus') {
                    vehicleTypeName = 'bus';
                } else if (vehicleType === 'tram') {
                    vehicleTypeName = 'tram';
                } else if (vehicleType === 'train') {
                    vehicleTypeName = 'train';
                }
                
                // if there is a line name, display the public transport info
                if (lineName) {
                    transitInfo.innerHTML = `<i class="fas ${iconClass}"></i> take <strong>${vehicleTypeName} ${lineName}</strong> line`;
                    stepContent.appendChild(transitInfo);
                    
                    // if there are departure and arrival station info, also display them
                    if (step.transit.departure_stop && step.transit.arrival_stop) {
                        const transitStops = document.createElement('div');
                        transitStops.className = 'transit-stops';
                        transitStops.textContent = `from ${step.transit.departure_stop.name} to ${step.transit.arrival_stop.name}`;
                        stepContent.appendChild(transitStops);
                    }
                    
                    // if there are departure and arrival time info, also display them
                    if (step.transit.departure_time && step.transit.arrival_time) {
                        const transitTimes = document.createElement('div');
                        transitTimes.className = 'transit-times';
                        transitTimes.textContent = `${step.transit.departure_time.text} → ${step.transit.arrival_time.text}`;
                        stepContent.appendChild(transitTimes);
                    }
                }
            }
            
            // step distance
            const stepDistance = document.createElement('div');
            stepDistance.className = 'step-distance';
            stepDistance.textContent = step.distance ? step.distance.text : '';
            
            // combine the step content
            stepContent.appendChild(stepInstructions);
            if (step.distance) {
                stepContent.appendChild(stepDistance);
            }
            
            // combine the step item
            stepItem.appendChild(stepIcon);
            stepItem.appendChild(stepContent);
            stepsContainer.appendChild(stepItem);
        });
        
        // add the steps container to the navigation panel
        navPanel.appendChild(stepsContainer);
        
        // display the navigation panel
        navPanel.classList.add('active');
    }
    
    /**
     * display the simple navigation route
     * @param {Object} start - the starting point coordinates {lat, lng}
     * @param {Object} end - the end point coordinates {lat, lng}
     * @param {string} mode - the transport mode
     * @param {string} startName - the starting point name
     * @param {string} endName - the end point name
     */
    showSimpleNavigation(start, end, mode, startName = 'Start', endName = 'Destination') {
        // clear the existing routes
        this.clearRoutes();
        
        // create the simple route
        const coordinates = [
            [start.lng, start.lat],
            [end.lng, end.lat]
        ];
        
        // create the route layer
        const routeId = `simple-navigation-${mode}-${Date.now()}`;
        
        // add the GeoJSON source
        this.mapboxMap.addSource(routeId, {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates
                }
            }
        });
        
        // get the color according to the transport mode
        const color = CONFIG.transportModes[mode]?.color || "#3498db";
        
        // add the line layer
        this.mapboxMap.addLayer({
            id: routeId,
            type: 'line',
            source: routeId,
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': color,
                'line-width': 4,
                'line-opacity': 0.7,
                'line-dasharray': [2, 1] // dashed line effect
            }
        });
        
        // save the route reference
        this.routes.push({ id: routeId, mode });
        
        // mark the starting and ending points on the map
        this.addRouteEndpoints(start, end);
        
        // adjust the map view to display the entire route
        const bounds = new mapboxgl.LngLatBounds()
            .extend([start.lng, start.lat])
            .extend([end.lng, end.lat]);
        
        this.mapboxMap.fitBounds(bounds, {
            padding: 100,
            maxZoom: 15
        });
        
        // display the simple navigation panel
        this.showSimpleNavigationPanel(start, end, mode, startName, endName);
    }
    
    /**
     * add the route starting and ending points
     * @param {Object} start - the starting point coordinates {lat, lng}
     * @param {Object} end - the end point coordinates {lat, lng}
     */
    addRouteEndpoints(start, end) {
        // add the starting point marker
        const startMarker = document.createElement('div');
        startMarker.className = 'custom-marker route-start-marker';
        startMarker.innerHTML = '<i class="fas fa-play"></i>';
        
        // add the permanent display label for the starting point
        const startPopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 25,
            className: 'route-endpoint-popup start-popup'
        }).setHTML('<div class="endpoint-label">Start Point</div>');
        
        new mapboxgl.Marker(startMarker)
            .setLngLat([start.lng, start.lat])
            .setPopup(startPopup)
            .addTo(this.mapboxMap);
            
        // display the starting point label
        startPopup.addTo(this.mapboxMap);
        
        // add the ending point marker
        const endMarker = document.createElement('div');
        endMarker.className = 'custom-marker route-end-marker';
        endMarker.innerHTML = '<i class="fas fa-flag-checkered"></i>';
        
        // add the permanent display label for the ending point
        const endPopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 25,
            className: 'route-endpoint-popup end-popup'
        }).setHTML('<div class="endpoint-label">Destination</div>');
        
        new mapboxgl.Marker(endMarker)
            .setLngLat([end.lng, end.lat])
            .setPopup(endPopup)
            .addTo(this.mapboxMap);
            
        // display the ending point label
        endPopup.addTo(this.mapboxMap);
    }
    
    /**
     * display the simple navigation panel
     * @param {Object} start - the starting point coordinates {lat, lng}
     * @param {Object} end - the end point coordinates {lat, lng}
     * @param {string} mode - the transport mode
     * @param {string} startName - the starting point name
     * @param {string} endName - the end point name
     */
    showSimpleNavigationPanel(start, end, mode, startName = 'Start', endName = 'Destination') {
        // get or create the navigation panel container
        let navPanel = document.getElementById('navigation-panel');
        if (!navPanel) {
            navPanel = document.createElement('div');
            navPanel.id = 'navigation-panel';
            navPanel.className = 'navigation-panel';
            
            // insert the navigation panel into the main container
            const mainContainer = document.querySelector('main');
            if (mainContainer) {
                mainContainer.insertBefore(navPanel, mainContainer.firstChild);
            } else {
                document.body.appendChild(navPanel);
            }
        }
        
        // clear the navigation panel
        navPanel.innerHTML = '';
        
        // create the navigation panel title
        const panelHeader = document.createElement('div');
        panelHeader.className = 'nav-panel-header';
        
        // add the close button
        const closeButton = document.createElement('button');
        closeButton.className = 'nav-close-button';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.addEventListener('click', () => {
            navPanel.classList.remove('active');
            // if the left panel is displayed, use the backToItinerary method, it will automatically display the return modify button
            if (placeDetailsService && placeDetailsService.showInPanel && placeDetailsService.pageLevel === 1) {
                placeDetailsService.backToItinerary();
            } else {
                // otherwise, simply clear the routes
                this.clearRoutes();
                
                // ensure the return modify button is visible
                const backToFormButton = document.getElementById('back-to-form');
                if (backToFormButton) {
                    backToFormButton.style.display = 'block';
                }
            }
        });
        
        // add the title text
        const titleText = document.createElement('h3');
        const modeName = CONFIG.transportModes[mode]?.label || "Driving";
        
        // get the English transport mode label
        const transportLabels = {
            'driving': 'Driving',
            'walking': 'Walking',
            'bicycling': 'Cycling',
            'transit': 'Public Transit',
            'public': 'Public Transit'
        };
        const transportLabel = transportLabels[mode] || modeName;
        
        titleText.textContent = `Simple ${transportLabel} Navigation: ${startName} → ${endName}`;
        
        // combine the title bar
        panelHeader.appendChild(titleText);
        panelHeader.appendChild(closeButton);
        navPanel.appendChild(panelHeader);
        
        // calculate the straight line distance
        const distance = this.calculateDistance(start, end);
        
        // add the route summary information
        const routeSummary = document.createElement('div');
        routeSummary.className = 'route-summary';
        
        // create the distance information
        const distanceElem = document.createElement('div');
        distanceElem.className = 'route-distance';
        // according to the distance size, decide to display meters or kilometers
        if (distance < 1000) {
            distanceElem.innerHTML = `<i class="fas fa-route"></i> Approximately ${Math.round(distance)} meters`;
        } else {
            distanceElem.innerHTML = `<i class="fas fa-route"></i> Approximately ${(distance/1000).toFixed(1)} km`;
        }
        
        // add the summary information
        routeSummary.appendChild(distanceElem);
        navPanel.appendChild(routeSummary);
        
        // create the simple prompt
        const simpleMessage = document.createElement('div');
        simpleMessage.className = 'simple-nav-message';
        simpleMessage.innerHTML = `
            <p>This is a simplified direct route from <strong>${startName}</strong> to <strong>${endName}</strong>.</p>
            <p>Actual routes may differ. Please use a professional navigation app for detailed directions.</p>
        `;
        navPanel.appendChild(simpleMessage);
        
        // display the navigation panel
        navPanel.classList.add('active');
    }
    
    /**
     * calculate the straight line distance (meters) between two points
     * @param {Object} point1 - the first point {lat, lng}
     * @param {Object} point2 - the second point {lat, lng}
     * @returns {number} - the distance (meters)
     */
    calculateDistance(point1, point2) {
        const R = 6371000; // the radius of the earth (meters)
        const lat1Rad = this.deg2rad(point1.lat);
        const lat2Rad = this.deg2rad(point2.lat);
        const latDiff = this.deg2rad(point2.lat - point1.lat);
        const lngDiff = this.deg2rad(point2.lng - point1.lng);
        
        const a = Math.sin(latDiff/2) * Math.sin(latDiff/2) +
                  Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                  Math.sin(lngDiff/2) * Math.sin(lngDiff/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const distance = R * c;
        
        return distance; // return the distance in meters
    }
    
    /**
     * convert degrees to radians
     * @param {number} deg - the angle
     * @returns {number} - the radian
     */
    deg2rad(deg) {
        return deg * (Math.PI/180);
    }
    
    /**
     * adjust the map view to display the entire route
     * @param {Object} result - the navigation result
     */
    fitMapToRoute(result) {
        if (!result.routes || result.routes.length === 0) return;
        
        const route = result.routes[0];
        const bounds = new mapboxgl.LngLatBounds();
        
        // add the starting and ending points
        const leg = route.legs[0];
        bounds.extend([leg.start_location.lng(), leg.start_location.lat()]);
        bounds.extend([leg.end_location.lng(), leg.end_location.lat()]);
        
        // add all the points of the steps
        leg.steps.forEach(step => {
            if (step.path) {
                step.path.forEach(point => {
                    bounds.extend([point.lng(), point.lat()]);
                });
            }
        });
        
        // adjust the map view
        this.mapboxMap.fitBounds(bounds, {
            padding: 100,
            maxZoom: 15
        });
    }
    
    /**
     * adjust the map view to display all points (including the user location)
     * @param {Array} activities - the activity list
     */
    fitMapToAllPoints(activities) {
        if (!activities || activities.length === 0) {
            return;
        }
        
        try {
            // create the bounding box
            const bounds = new mapboxgl.LngLatBounds();
            
            // add all the activity points to the bounding box
            activities.forEach(activity => {
                if (activity.location && !isNaN(activity.location.lat) && !isNaN(activity.location.lng)) {
                    bounds.extend([activity.location.lng, activity.location.lat]);
                }
            });
            
            // if there is a user location, also join the bounding box
            if (this.userLocation && !isNaN(this.userLocation.lat) && !isNaN(this.userLocation.lng)) {
                bounds.extend([this.userLocation.lng, this.userLocation.lat]);
            }
            
            // adjust the map view
            if (!bounds.isEmpty()) {
                this.mapboxMap.fitBounds(bounds, {
                    padding: 100,
                    maxZoom: 15,
                    duration: 1000
                });
            }
        } catch (error) {
            console.error('failed to adjust the map view:', error);
        }
    }
    
    /**
     * toggle the explore mode
     */
    toggleExploreMode() {
        // toggle the Explore button status
        const exploreBtn = document.getElementById('explore-area');
        if (exploreBtn) {
            exploreBtn.classList.toggle('active');
        }
        
        // get the status
        const isActive = exploreBtn && exploreBtn.classList.contains('active');
        
        if (isActive) {
            // start the explore mode
            this.startExploreMode();
        } else {
            // stop the explore mode
            this.stopExploreMode();
        }
    }
    
    /**
     * start the explore mode, but wait for the user to select the location
     */
    startExploreMode() {
        // toggle the Explore button status
        const exploreBtn = document.getElementById('explore-area');
        if (exploreBtn) {
            exploreBtn.classList.add('active');
        }
        
        // 添加一次性点击事件，让用户选择位置
        this.mapClickHandler = (e) => {
            // get the coordinates of the clicked location
            const lat = e.lngLat.lat;
            const lng = e.lngLat.lng;
            
            // add the draggable marker at the clicked location
            this.addExploreDragMarker({ lat, lng });
            
            // show the walking radius
            this.showWalkingRadius({ lat, lng });
            
            // explore the nearby POIs
            this.exploreNearbyPOIs({ lat, lng });
            
            // show the POI selector
            const poiSelector = document.querySelector('.poi-type-selector');
            if (poiSelector) {
                poiSelector.style.display = 'block';
            }
            
            // remove the one-time click event
            this.mapboxMap.off('click', this.mapClickHandler);
        };
        
        // add the click event
        this.mapboxMap.on('click', this.mapClickHandler);
        
        // show the instruction toast
        const instructionToast = document.createElement('div');
        instructionToast.className = 'loading-toast';
        instructionToast.innerHTML = '<i class="fas fa-info-circle"></i> Click the map to select the location to explore';
        document.body.appendChild(instructionToast);
        
        // remove the instruction toast after 5 seconds
        setTimeout(() => {
            if (document.body.contains(instructionToast)) {
                document.body.removeChild(instructionToast);
            }
        }, 5000);
    }
    
    /**
     * stop the explore mode
     */
    stopExploreMode() {
        // toggle the Explore button status
        const exploreBtn = document.getElementById('explore-area');
        if (exploreBtn) {
            exploreBtn.classList.remove('active');
        }
        
        // hide the POI selector
        const poiSelector = document.querySelector('.poi-type-selector');
        if (poiSelector) {
            poiSelector.style.display = 'none';
        }
        
        // hide the walking radius layer
        this.mapboxMap.setLayoutProperty('walking-radius-10', 'visibility', 'none');
        this.mapboxMap.setLayoutProperty('walking-radius-10-border', 'visibility', 'none');
        this.mapboxMap.setLayoutProperty('walking-radius-15', 'visibility', 'none');
        this.mapboxMap.setLayoutProperty('walking-radius-15-border', 'visibility', 'none');
        
        // clear the POI markers
        this.clearPOIMarkers();
        
        // remove the draggable marker
        if (this.exploreDragMarker) {
            this.exploreDragMarker.remove();
            this.exploreDragMarker = null;
        }
        
        // remove the click event
        if (this.mapClickHandler) {
            this.mapboxMap.off('click', this.mapClickHandler);
            this.mapClickHandler = null;
        }
    }
    
    /**
     * add the draggable marker for the explore mode
     * @param {Object} center - the center point {lat, lng}
     */
    addExploreDragMarker(center) {
        // create the custom marker element
        const el = document.createElement('div');
        el.className = 'explore-drag-marker';
        el.innerHTML = '<i class="fas fa-map-pin"></i>';
        
        // if there is already a marker, remove it first
        if (this.exploreDragMarker) {
            this.exploreDragMarker.remove();
        }
        
        // create the draggable marker
        this.exploreDragMarker = new mapboxgl.Marker({
            element: el,
            draggable: true
        })
            .setLngLat([center.lng, center.lat])
            .addTo(this.mapboxMap);
        
        // add the drag end event
        this.exploreDragMarker.on('dragend', () => {
            const lngLat = this.exploreDragMarker.getLngLat();
            const position = {
                lat: lngLat.lat,
                lng: lngLat.lng
            };
            
            // show the loading toast
            const loadingToast = document.createElement('div');
            loadingToast.className = 'loading-toast';
            loadingToast.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating the explore range...';
            document.body.appendChild(loadingToast);
            
            // update the walking radius
            this.updateWalkingRadius(position);
            
            // explore the nearby POIs
            this.exploreNearbyPOIs(position);
            
            // remove the loading toast after 2 seconds
            setTimeout(() => {
                if (document.body.contains(loadingToast)) {
                    document.body.removeChild(loadingToast);
                }
            }, 2000);
        });
        
        // setup the walking time selector
        this.setupWalkingTimeSelector();
    }
    
    /**
     * setup the walking time selector
     */
    setupWalkingTimeSelector() {
        // remove the previous event listener
        const walkingTimeOptions = document.querySelectorAll('.walking-time-options .time-badge');
        walkingTimeOptions.forEach(option => {
            option.removeEventListener('click', this.walkingTimeClickHandler);
        });
        
        // setup the walking time selector click event
        this.walkingTimeClickHandler = (e) => {
            // remove the active class from all options
            walkingTimeOptions.forEach(opt => opt.classList.remove('active'));
            
            // add the active class to the current option
            e.target.classList.add('active');
            
            // get the selected time (10 or 15 minutes)
            const minutes = e.target.classList.contains('ten-min') ? 10 : 15;
            this.currentWalkingMinutes = minutes;
            
            // show the loading toast
            const loadingToast = document.createElement('div');
            loadingToast.className = 'loading-toast';
            loadingToast.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Updating the walking range to ${minutes} minutes...`;
            document.body.appendChild(loadingToast);
            
            // get the current marker position
            const markerPosition = this.getExploreDragMarkerPosition();
            
            // update the walking radius
            this.updateWalkingRadius(markerPosition, minutes);
            
            // explore the nearby POIs
            this.exploreNearbyPOIs(markerPosition);
            
            // remove the loading toast after 2 seconds
            setTimeout(() => {
                if (document.body.contains(loadingToast)) {
                    document.body.removeChild(loadingToast);
                }
            }, 2000);
        };
        
        // add the click event
        walkingTimeOptions.forEach(option => {
            option.addEventListener('click', this.walkingTimeClickHandler);
        });
        
        // default select the 15 minutes
        const fifteenMinBadge = document.querySelector('.walking-time-options .fifteen-min');
        const tenMinBadge = document.querySelector('.walking-time-options .ten-min');
        
        if (this.currentWalkingMinutes === 10 && tenMinBadge) {
            tenMinBadge.classList.add('active');
            fifteenMinBadge.classList.remove('active');
        } else if (fifteenMinBadge) {
            fifteenMinBadge.classList.add('active');
            if (tenMinBadge) tenMinBadge.classList.remove('active');
        }
        
        // setup the POI type selector
        this.setupPOITypeSelector();
    }
    
    /**
     * setup the POI type selector
     */
    setupPOITypeSelector() {
        // remove the previous event listener
        const poiCheckboxes = document.querySelectorAll('.poi-type-checkbox');
        poiCheckboxes.forEach(checkbox => {
            checkbox.removeEventListener('change', this.poiTypeChangeHandler);
        });
        
        // setup the POI type selector change event
        this.poiTypeChangeHandler = (e) => {
            // update the selected status style
            const label = e.target.closest('label');
            if (label) {
                if (e.target.checked) {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }
            }
            
            // get the current marker position
            const markerPosition = this.getExploreDragMarkerPosition();
            
            // show the loading toast
            const loadingToast = document.createElement('div');
            loadingToast.className = 'loading-toast';
            loadingToast.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating the POIs...';
            document.body.appendChild(loadingToast);
            
            // explore the nearby POIs
            this.exploreNearbyPOIs(markerPosition);
            
            // remove the loading toast after 2 seconds
            setTimeout(() => {
                if (document.body.contains(loadingToast)) {
                    document.body.removeChild(loadingToast);
                }
            }, 2000);
        };
        
        // add the change event
        poiCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', this.poiTypeChangeHandler);
            
            // initialize the selected status style
            const label = checkbox.closest('label');
            if (checkbox.checked && label) {
                label.classList.add('active');
            }
        });
        
        // default select the Food type
        poiCheckboxes.forEach(checkbox => {
            if (checkbox.value === 'food') {
                checkbox.checked = true;
                const label = checkbox.closest('label');
                if (label) label.classList.add('active');
            } else {
                checkbox.checked = false;
                const label = checkbox.closest('label');
                if (label) label.classList.remove('active');
            }
        });
    }
    
    /**
     * get the position of the explore mode draggable marker
     * @returns {Object} - the position {lat, lng}
     */
    getExploreDragMarkerPosition() {
        if (!this.exploreDragMarker) {
            // 使用地图中心
            const center = this.mapboxMap.getCenter();
            return {
                lat: center.lat,
                lng: center.lng
            };
        }
        
        const lngLat = this.exploreDragMarker.getLngLat();
        return {
            lat: lngLat.lat,
            lng: lngLat.lng
        };
    }
    
    /**
     * update the walking radius
     * @param {Object} center - the center point {lat, lng}
     * @param {number} minutes - the walking time (minutes), default use the current selected time
     */
    updateWalkingRadius(center, minutes) {
        // if the minutes is not specified, get the current selected time
        if (!minutes) {
            const activeBadge = document.querySelector('.walking-time-options .time-badge.active');
            minutes = activeBadge && activeBadge.classList.contains('ten-min') ? 10 : 15;
        }
        
        // update the current walking time
        this.currentWalkingMinutes = minutes;
        
        // use the Mapbox Isochrone API to get the walking range
        const isochroneUrl = `https://api.mapbox.com/isochrone/v1/mapbox/walking/${center.lng},${center.lat}?contours_minutes=${minutes}&polygons=true&access_token=${mapboxgl.accessToken}`;
        
        fetch(isochroneUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('failed to get the walking range');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.features && data.features.length > 0) {
                    // update the walking range layer
                    const source = this.mapboxMap.getSource('walking-radius');
                    if (source) {
                        const featureWithMinutes = {
                            ...data.features[0],
                            properties: {
                                ...data.features[0].properties,
                                duration: minutes
                            }
                        };
                        
                        source.setData(featureWithMinutes);
                        
                        // show the corresponding walking range layer
                        if (minutes === 10) {
                            this.mapboxMap.setLayoutProperty('walking-radius-10', 'visibility', 'visible');
                            this.mapboxMap.setLayoutProperty('walking-radius-10-border', 'visibility', 'visible');
                            this.mapboxMap.setLayoutProperty('walking-radius-15', 'visibility', 'none');
                            this.mapboxMap.setLayoutProperty('walking-radius-15-border', 'visibility', 'none');
                        } else {
                            this.mapboxMap.setLayoutProperty('walking-radius-10', 'visibility', 'none');
                            this.mapboxMap.setLayoutProperty('walking-radius-10-border', 'visibility', 'none');
                            this.mapboxMap.setLayoutProperty('walking-radius-15', 'visibility', 'visible');
                            this.mapboxMap.setLayoutProperty('walking-radius-15-border', 'visibility', 'visible');
                        }
                    }
                } else {
                    // if the API is not available, use the simple circle as the walking range
                    this.showSimpleWalkingCircle(center, minutes);
                }
            })
            .catch(error => {
                console.error('Isochrone API error:', error);
                // if the API is not available, use the simple circle as the walking range
                this.showSimpleWalkingCircle(center, minutes);
            });
    }
    
    /**
     * show the simple circle as the walking range (as the alternative of the Isochrone API)
     * @param {Object} center - the center point {lat, lng}
     * @param {number} minutes - the walking time (minutes)
     */
    showSimpleWalkingCircle(center, minutes) {
        // estimate the walking distance (meters)
        // the average walking speed is about 5 km/h = 83.33 meters/minute
        const walkingSpeed = 83.33; // meters/minute
        const radius = walkingSpeed * minutes;
        
        // create the circle using turf.js
        const options = { steps: 64, units: 'meters' };
        const circle = turf.circle([center.lng, center.lat], radius, options);
        
        // add the duration property
        circle.properties.duration = minutes;
        
        // update the walking range layer
        const source = this.mapboxMap.getSource('walking-radius');
        if (source) {
            source.setData(circle);
            
            // show the corresponding walking range layer
            if (minutes === 10) {
                this.mapboxMap.setLayoutProperty('walking-radius-10', 'visibility', 'visible');
                this.mapboxMap.setLayoutProperty('walking-radius-10-border', 'visibility', 'visible');
                this.mapboxMap.setLayoutProperty('walking-radius-15', 'visibility', 'none');
                this.mapboxMap.setLayoutProperty('walking-radius-15-border', 'visibility', 'none');
            } else {
                this.mapboxMap.setLayoutProperty('walking-radius-10', 'visibility', 'none');
                this.mapboxMap.setLayoutProperty('walking-radius-10-border', 'visibility', 'none');
                this.mapboxMap.setLayoutProperty('walking-radius-15', 'visibility', 'visible');
                this.mapboxMap.setLayoutProperty('walking-radius-15-border', 'visibility', 'visible');
            }
        }
    }
    
    /**
     * explore the nearby POIs
     * @param {Object} center - the center point {lat, lng}
     */
    exploreNearbyPOIs(center) {
        // get the current selected walking time
        const walkingMinutes = this.currentWalkingMinutes;
        
        // get the selected POI types
        const poiTypes = this.getSelectedPOITypes();
        
        // if no POI types are selected, only show the walking range, not search the POIs
        if (poiTypes.length === 0) {
            // clear the previous POI markers
            this.clearPOIMarkers();
            
            // show the instruction toast
            const noTypeToast = document.createElement('div');
            noTypeToast.className = 'loading-toast';
            noTypeToast.innerHTML = '<i class="fas fa-info-circle"></i> Please select the POI types to view the locations';
            document.body.appendChild(noTypeToast);
            
            // remove the instruction toast after 3 seconds
            setTimeout(() => {
                if (document.body.contains(noTypeToast)) {
                    document.body.removeChild(noTypeToast);
                }
            }, 3000);
            
            return;
        }
        
        // show the loading toast
        const loadingToast = document.createElement('div');
        loadingToast.className = 'loading-toast';
        loadingToast.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Searching for locations within ${walkingMinutes} minutes of walking...`;
        document.body.appendChild(loadingToast);
        
        // create the Overpass API query
        const overpassQuery = this.buildOverpassQuery(center, poiTypes);
        
        // execute the query
        this.fetchOverpassData(overpassQuery, center, walkingMinutes)
            .then(places => {
                // remove the loading toast
                if (document.body.contains(loadingToast)) {
                    document.body.removeChild(loadingToast);
                }
                
                // clear the previous POI markers
                this.clearPOIMarkers();
                
                // add the POI markers
                if (places && places.length > 0) {
                    this.addPOIMarkers(places);
                    
                    // show the found POI number
                    const resultsToast = document.createElement('div');
                    resultsToast.className = 'loading-toast';
                    resultsToast.innerHTML = `<i class="fas fa-info-circle"></i> Found ${places.length} locations within ${walkingMinutes} minutes of walking...`;
                    document.body.appendChild(resultsToast);
                    
                    // remove the results toast after 3 seconds
                    setTimeout(() => {
                        if (document.body.contains(resultsToast)) {
                            document.body.removeChild(resultsToast);
                        }
                    }, 3000);
                } else {
                    console.log('no locations found');
                    
                    // show the instruction toast
                    const noResultsToast = document.createElement('div');
                    noResultsToast.className = 'loading-toast';
                    noResultsToast.innerHTML = '<i class="fas fa-info-circle"></i> No locations found in this area';
                    document.body.appendChild(noResultsToast);
                    
                    // remove the instruction toast after 3 seconds
                    setTimeout(() => {
                        if (document.body.contains(noResultsToast)) {
                            document.body.removeChild(noResultsToast);
                        }
                    }, 3000);
                }
            })
            .catch(error => {
                // remove the loading toast
                if (document.body.contains(loadingToast)) {
                    document.body.removeChild(loadingToast);
                }
                
                console.error('explore the POIs failed:', error);
                
                // show the error toast
                const errorToast = document.createElement('div');
                errorToast.className = 'loading-toast';
                errorToast.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error searching for locations';
                document.body.appendChild(errorToast);
                
                // remove the error toast after 3 seconds
                setTimeout(() => {
                    if (document.body.contains(errorToast)) {
                        document.body.removeChild(errorToast);
                    }
                }, 3000);
            });
    }
    
    /**
     * get the data from the Overpass API
     * @param {string} query - the Overpass query string
     * @param {Object} center - the center point {lat, lng}
     * @param {number} walkingMinutes - the walking time (minutes)
     * @returns {Promise<Array>} - the POI array
     */
    async fetchOverpassData(query, center, walkingMinutes = 15) {
        try {
            // send the request to the Overpass API
            const response = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query));
            
            if (!response.ok) {
                throw new Error(`Overpass API returned an error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // use the Isochrone API to get the accurate walking range
            try {
                const isochroneUrl = `https://api.mapbox.com/isochrone/v1/mapbox/walking/${center.lng},${center.lat}?contours_minutes=${walkingMinutes}&polygons=true&access_token=${mapboxgl.accessToken}`;
                const isoResponse = await fetch(isochroneUrl);
                
                if (isoResponse.ok) {
                    const isoData = await isoResponse.json();
                    
                    if (isoData && isoData.features && isoData.features.length > 0) {
                        const isoPolygon = isoData.features[0].geometry;
                        
                        // use the turf.js to filter the POIs within the walking range
                        const filteredPlaces = data.elements.filter(element => {
                            if (element.type === 'node' && element.lat && element.lon) {
                                const point = turf.point([element.lon, element.lat]);
                                return turf.booleanPointInPolygon(point, isoPolygon);
                            }
                            return false;
                        });
                        
                        return filteredPlaces;
                    }
                }
            } catch (isoError) {
                console.error('use the Isochrone API to filter the POIs failed:', isoError);
                // if the Isochrone API failed, use the simple distance calculation as the fallback
            }
            
            // simple distance calculation fallback
            // the average walking speed is about 5 km/h = 83.33 meters/minute
            const walkingSpeed = 83.33; // meters/minute
            const maxDistance = walkingSpeed * walkingMinutes;
            
            // 过滤在最大距离内的POI
            const filteredPlaces = data.elements.filter(element => {
                if (element.type === 'node' && element.lat && element.lon) {
                    const distance = this.calculateDistance(
                        { lat: center.lat, lng: center.lng },
                        { lat: element.lat, lng: element.lon }
                    );
                    // 转换为米
                    return distance * 1000 <= maxDistance;
                }
                return false;
            });
            
            return filteredPlaces;
        } catch (error) {
            console.error('get the data from the Overpass API failed:', error);
            throw error;
        }
    }
    
    /**
     * get the selected POI types
     * @returns {Array} - the selected POI types array
     */
    getSelectedPOITypes() {
        const poiCheckboxes = document.querySelectorAll('.poi-type-checkbox:checked');
        return Array.from(poiCheckboxes).map(checkbox => checkbox.value);
    }
    
    /**
     * clear all the POI markers
     */
    clearPOIMarkers() {
        this.poiMarkers.forEach(marker => {
            if (marker.popup) {
                marker.popup.remove();
            }
            marker.remove();
        });
        this.poiMarkers = [];
    }
    
    /**
     * add the POI markers
     * @param {Array} places - the POI array
     */
    addPOIMarkers(places) {
        // clear the previous POI markers
        this.clearPOIMarkers();
        
        places.forEach(place => {
            // skip the locations without coordinates
            if (!place.lat || !place.lon) return;
            
            // determine the POI type
            let poiType = 'attraction'; // default type
            if (place.tags) {
                if (place.tags.amenity && ['restaurant', 'cafe', 'pub', 'bar', 'fast_food'].includes(place.tags.amenity)) {
                    poiType = 'food';
                } else if (place.tags.cuisine) {
                    poiType = 'food';
                } else if (place.tags.tourism && ['hotel', 'hostel', 'guest_house', 'motel', 'apartment'].includes(place.tags.tourism)) {
                    poiType = 'accommodation';
                } else if (place.tags.railway || place.tags.highway === 'bus_stop' || 
                           (place.tags.amenity && ['bus_station', 'taxi'].includes(place.tags.amenity))) {
                    poiType = 'transport';
                } else if (place.tags.shop || place.tags.amenity === 'marketplace' || place.tags.amenity === 'supermarket') {
                    poiType = 'market';
                }
            }
            
            // get the POI icon
            const icon = this.getPOIIcon(poiType);
            
            // create the marker element
            const el = document.createElement('div');
            el.className = `poi-marker poi-${poiType}`;
            el.innerHTML = `<i class="${icon}"></i>`;
            
            // create the marker
            const marker = new mapboxgl.Marker(el)
                .setLngLat([place.lon, place.lat])
                .addTo(this.mapboxMap);
            
            // add the click event
            el.addEventListener('click', () => {
                this.showOverpassPOIDetails(place);
            });
            
            // add the marker to the array
            this.poiMarkers.push(marker);
        });
    }
    
    /**
     * get the POI icon
     * @param {string} type - the POI type
     * @returns {string} - the Font Awesome icon class name
     */
    getPOIIcon(type) {
        switch (type) {
            case 'food': return 'fas fa-utensils';
            case 'accommodation': return 'fas fa-bed';
            case 'transport': return 'fas fa-bus';
            case 'market': return 'fas fa-shopping-bag';
            case 'attraction': return 'fas fa-landmark';
            default: return 'fas fa-map-marker-alt';
        }
    }
    
    /**
     * show the Overpass POI details
     * @param {Object} place - the POI object
     */
    showOverpassPOIDetails(place) {
        // if there is no tags, cannot show the details
        if (!place.tags) return;
        
        // get the location name
        const name = place.tags.name || 'unnamed location';
        
        // determine the POI type
        let poiType = 'attraction'; // default type
        let poiTypeName = 'attraction';
        if (place.tags) {
            if (place.tags.amenity && ['restaurant', 'cafe', 'pub', 'bar', 'fast_food'].includes(place.tags.amenity)) {
                poiType = 'food';
                poiTypeName = place.tags.amenity === 'restaurant' ? 'restaurant' : 
                              place.tags.amenity === 'cafe' ? 'cafe' : 
                              place.tags.amenity === 'pub' ? 'pub' : 
                              place.tags.amenity === 'bar' ? 'bar' : 'fast_food';
            } else if (place.tags.cuisine) {
                poiType = 'food';
                poiTypeName = 'restaurant';
            } else if (place.tags.tourism && ['hotel', 'hostel', 'guest_house', 'motel', 'apartment'].includes(place.tags.tourism)) {
                poiType = 'accommodation';
                poiTypeName = place.tags.tourism === 'hotel' ? 'hotel' : 
                              place.tags.tourism === 'hostel' ? 'hostel' : 
                              place.tags.tourism === 'guest_house' ? 'guest_house' : 
                              place.tags.tourism === 'motel' ? 'motel' : 'apartment';
            } else if (place.tags.railway || place.tags.highway === 'bus_stop' || 
                       (place.tags.amenity && ['bus_station', 'taxi'].includes(place.tags.amenity))) {
                poiType = 'transport';
                poiTypeName = place.tags.railway === 'station' ? 'station' : 
                              place.tags.railway === 'subway_entrance' ? 'subway_entrance' : 
                              place.tags.highway === 'bus_stop' ? 'bus_stop' : 
                              place.tags.amenity === 'bus_station' ? 'bus_station' : 'taxi';
            } else if (place.tags.shop || place.tags.amenity === 'marketplace' || place.tags.amenity === 'supermarket') {
                poiType = 'market';
                poiTypeName = place.tags.shop ? 'shop' : 
                              place.tags.amenity === 'marketplace' ? 'marketplace' : 'supermarket';
            }
        }
        
        // get the address information
        let address = '';
        if (place.tags.address) {
            address = place.tags.address;
        } else if (place.tags['addr:street']) {
            address = `${place.tags['addr:street']} ${place.tags['addr:housenumber'] || ''}`;
        } else if (place.tags['addr:city']) {
            address = place.tags['addr:city'];
        }
        
        // get the contact information
        const phone = place.tags.phone || place.tags['contact:phone'] || '';
        const website = place.tags.website || place.tags['contact:website'] || '';
        
        // get the other useful information
        const cuisine = place.tags.cuisine ? `cuisine: ${place.tags.cuisine.replace(';', ', ')}` : '';
        const openingHours = place.tags.opening_hours ? `opening hours: ${place.tags.opening_hours}` : '';
        
        // create the popup content - remove the navigation button part
        let popupContent = `
            <div class="poi-popup">
                <h3>${name}</h3>
                <p><strong>${poiTypeName}</strong></p>
                ${address ? `<p><i class="fas fa-map-marker-alt"></i> ${address}</p>` : ''}
                ${phone ? `<p><i class="fas fa-phone"></i> ${phone}</p>` : ''}
                ${website ? `<p><i class="fas fa-globe"></i> <a href="${website}" target="_blank">website</a></p>` : ''}
                ${cuisine ? `<p><i class="fas fa-utensils"></i> ${cuisine}</p>` : ''}
                ${openingHours ? `<p><i class="fas fa-clock"></i> ${openingHours}</p>` : ''}
            </div>
        `;
        
        // create the popup
        const popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: '300px'
        })
            .setLngLat([place.lon, place.lat])
            .setHTML(popupContent)
            .addTo(this.mapboxMap);
    }
    
    /**
     * navigate to the POI
     * @param {number} lat - the latitude
     * @param {number} lng - the longitude
     * @param {string} title - the location name
     */
    navigateToPOI(lat, lng, title) {
        // get the user location or the current position
        const startLocation = this.userLocation || this.getExploreDragMarkerPosition();
        
        // get the current selected transport mode
        const transportMode = this.getSelectedTransportModes()[0] || 'walking';
        
        // use the simple navigation
        this.showSimpleNavigation(
            startLocation,
            { lat, lng },
            transportMode,
            'Current Location',
            title
        );
    }
    
    /**
     * show the walking range of the specified location
     * @param {Object} center - the center point {lat, lng}
     */
    showWalkingRadius(center) {
        // get the current selected time
        const activeBadge = document.querySelector('.walking-time-options .time-badge.active');
        const minutes = activeBadge && activeBadge.classList.contains('ten-min') ? 10 : 15;
        this.currentWalkingMinutes = minutes;
        
        // immediately show the corresponding walking range layer (show the empty range first before updating)
        if (minutes === 10) {
            this.mapboxMap.setLayoutProperty('walking-radius-10', 'visibility', 'visible');
            this.mapboxMap.setLayoutProperty('walking-radius-10-border', 'visibility', 'visible');
            this.mapboxMap.setLayoutProperty('walking-radius-15', 'visibility', 'none');
            this.mapboxMap.setLayoutProperty('walking-radius-15-border', 'visibility', 'none');
        } else {
            this.mapboxMap.setLayoutProperty('walking-radius-10', 'visibility', 'none');
            this.mapboxMap.setLayoutProperty('walking-radius-10-border', 'visibility', 'none');
            this.mapboxMap.setLayoutProperty('walking-radius-15', 'visibility', 'visible');
            this.mapboxMap.setLayoutProperty('walking-radius-15-border', 'visibility', 'visible');
        }
        
        // update the walking range
        this.updateWalkingRadius(center, minutes);
    }
    
    /**
     * build the Overpass API query
     * @param {Object} center - the center point {lat, lng}
     * @param {Array} poiTypes - the POI types array
     * @returns {string} - the Overpass query string
     */
    buildOverpassQuery(center, poiTypes) {
        // if there is no type, return the empty query
        if (!poiTypes || poiTypes.length === 0) {
            return `[out:json];out;`;
        }
        
        // get the current walking time
        const minutes = this.currentWalkingMinutes;
        
        // calculate the walking distance (meters)
        // the average walking speed is about 5 km/h = 83.33 meters/minute
        const walkingSpeed = 83.33; // meters/minute
        const searchRadius = Math.ceil(walkingSpeed * minutes * 1.2); // increase the search range by 20% to ensure all possible points are included
        
        // map the POI types to the Overpass query
        const typeQueries = [];
        
        if (poiTypes.includes('food')) {
            typeQueries.push(`node["amenity"~"restaurant|cafe|pub|bar|fast_food"](around:${searchRadius},${center.lat},${center.lng});`);
            typeQueries.push(`node["cuisine"](around:${searchRadius},${center.lat},${center.lng});`);
        }
        
        if (poiTypes.includes('accommodation')) {
            typeQueries.push(`node["tourism"~"hotel|hostel|guest_house|motel|apartment"](around:${searchRadius},${center.lat},${center.lng});`);
        }
        
        if (poiTypes.includes('transport')) {
            typeQueries.push(`node["railway"~"station|halt|subway_entrance"](around:${searchRadius},${center.lat},${center.lng});`);
            typeQueries.push(`node["highway"="bus_stop"](around:${searchRadius},${center.lat},${center.lng});`);
            typeQueries.push(`node["amenity"~"bus_station|taxi"](around:${searchRadius},${center.lat},${center.lng});`);
        }
        
        if (poiTypes.includes('market')) {
            typeQueries.push(`node["amenity"="marketplace"](around:${searchRadius},${center.lat},${center.lng});`);
            typeQueries.push(`node["shop"](around:${searchRadius},${center.lat},${center.lng});`);
            typeQueries.push(`node["amenity"="supermarket"](around:${searchRadius},${center.lat},${center.lng});`);
        }
        
        // if there is no matching type query, return the empty query
        if (typeQueries.length === 0) {
            return `[out:json];out;`;
        }
        
        // build the query string
        const queryString = `
            [out:json];
            (
                ${typeQueries.join('\n                ')}
            );
            out;
        `;
        
        return queryString;
    }
    
    /**
     * fix the route details display problem
     */
    showRouteInLeftPanel(result, mode, startName, endName) {
        if (!result || !result.routes || result.routes.length === 0) {
            console.error('No available route results');
            return;
        }
        
        // save the original content
        const itineraryContent = document.getElementById('itinerary-details');
        if (!itineraryContent) return;
        
        // save the original content to placeDetailsService, for later restoration
        if (placeDetailsService && !placeDetailsService.originalContent) {
            placeDetailsService.originalContent = itineraryContent.innerHTML;
            
            // set the page level to the details page
            placeDetailsService.pageLevel = 1;
        }
        
        // show the close button
        const closeButton = document.getElementById('panel-close-details');
        if (closeButton) {
            closeButton.style.display = 'block';
        }
        
        // hide the back to form button
        const backToFormButton = document.getElementById('back-to-form');
        if (backToFormButton) {
            backToFormButton.style.display = 'none';
        }
        
        // create the details container
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'route-info-container';
        
        // create the route title
        const routeTitle = document.createElement('h3');
        routeTitle.className = 'route-title';
        routeTitle.innerHTML = `<i class="fas fa-directions"></i> Route from ${startName} to ${endName}`;
        detailsContainer.appendChild(routeTitle);
        
        // get the route information
        const route = result.routes[0];
        const leg = route.legs[0];
        
        // create the route summary
        const routeSummary = document.createElement('div');
        routeSummary.className = 'route-summary';
        
        // create the mode icon mapping
        const modeIcons = {
            'driving': 'fa-car',
            'walking': 'fa-walking',
            'bicycling': 'fa-bicycle',
            'transit': 'fa-bus',
            'public': 'fa-bus'
        };
        
        // get the icon class
        const iconClass = modeIcons[mode] || 'fa-directions';
        
        // get the English transport mode label
        const transportLabels = {
            'driving': 'Driving',
            'walking': 'Walking',
            'bicycling': 'Cycling',
            'transit': 'Public Transit',
            'public': 'Public Transit'
        };
        const transportLabel = transportLabels[mode] || mode;
        
        routeSummary.innerHTML = `
            <div class="route-mode"><i class="fas ${iconClass}"></i> ${transportLabel}</div>
            <div class="route-distance"><i class="fas fa-road"></i> ${leg.distance.text}</div>
            <div class="route-duration"><i class="fas fa-clock"></i> ${leg.duration.text}</div>
        `;
        detailsContainer.appendChild(routeSummary);
        
        // create the route steps list
        const stepsList = document.createElement('div');
        stepsList.className = 'route-steps';
        
        // add the start point
        const startStep = document.createElement('div');
        startStep.className = 'route-step start-point';
        startStep.innerHTML = `
            <div class="step-icon"><i class="fas fa-map-marker-alt"></i></div>
            <div class="step-content">
                <div class="step-instruction">Start: ${startName}</div>
                <div class="step-address">${leg.start_address}</div>
            </div>
        `;
        stepsList.appendChild(startStep);
        
        // add each step route instruction
        leg.steps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'route-step';
            
            // select the icon based on the transport mode
            let stepIcon = 'fa-arrow-right';
            if (step.travel_mode === 'WALKING') stepIcon = 'fa-walking';
            else if (step.travel_mode === 'TRANSIT') stepIcon = 'fa-bus';
            else if (step.travel_mode === 'DRIVING') stepIcon = 'fa-car';
            else if (step.travel_mode === 'BICYCLING') stepIcon = 'fa-bicycle';
            
            // convert the HTML instruction to text
            const instructionDiv = document.createElement('div');
            instructionDiv.innerHTML = step.instructions;
            const instructionText = instructionDiv.textContent || instructionDiv.innerText || '';
            
            // handle the public transport information
            let transitInfo = '';
            if (step.travel_mode === 'TRANSIT' && step.transit) {
                // get the transport line name
                const lineName = step.transit.line && step.transit.line.short_name 
                    ? step.transit.line.short_name 
                    : (step.transit.line && step.transit.line.name ? step.transit.line.name : '');
                
                // get the vehicle type
                const vehicleType = step.transit.line && step.transit.line.vehicle 
                    ? step.transit.line.vehicle.type.toLowerCase() 
                    : '';
                
                // determine the Chinese name of the vehicle type
                let vehicleTypeName = 'public transport';
                if (vehicleType === 'subway' || vehicleType === 'metro_rail') {
                    vehicleTypeName = 'subway';
                    stepIcon = 'fa-subway';
                } else if (vehicleType === 'bus') {
                    vehicleTypeName = 'bus';
                    stepIcon = 'fa-bus';
                } else if (vehicleType === 'tram') {
                    vehicleTypeName = 'tram';
                } else if (vehicleType === 'train') {
                    vehicleTypeName = 'train';
                    stepIcon = 'fa-train';
                }
                
                // if there is a line name, show the public transport information
                if (lineName) {
                    transitInfo = `<div class="transit-info"><i class="fas ${stepIcon}"></i> take the <strong>${vehicleTypeName} ${lineName}</strong> line</div>`;
                    
                    // if there is a departure stop and an arrival stop, also show them
                    if (step.transit.departure_stop && step.transit.arrival_stop) {
                        transitInfo += `<div class="transit-stops">from <strong>${step.transit.departure_stop.name}</strong> to <strong>${step.transit.arrival_stop.name}</strong></div>`;
                    }
                    
                    // if there is a departure time and an arrival time, also show them
                    if (step.transit.departure_time && step.transit.arrival_time) {
                        transitInfo += `<div class="transit-times">${step.transit.departure_time.text} → ${step.transit.arrival_time.text}</div>`;
                    }
                }
            }
            
            stepElement.innerHTML = `
                <div class="step-icon"><i class="fas ${stepIcon}"></i></div>
                <div class="step-content">
                    <div class="step-instruction">${instructionText}</div>
                    ${transitInfo}
                    <div class="step-distance">${step.distance.text}</div>
                </div>
            `;
            stepsList.appendChild(stepElement);
        });
        
        // add the end point
        const endStep = document.createElement('div');
        endStep.className = 'route-step end-point';
        endStep.innerHTML = `
            <div class="step-icon"><i class="fas fa-flag-checkered"></i></div>
            <div class="step-content">
                <div class="step-instruction">Destination: ${endName}</div>
                <div class="step-address">${leg.end_address}</div>
            </div>
        `;
        stepsList.appendChild(endStep);
        
        detailsContainer.appendChild(stepsList);
        
        // replace the itinerary content
        itineraryContent.innerHTML = '';
        itineraryContent.appendChild(detailsContainer);
    }
}

// create the map service singleton
const mapService = new MapService(); 