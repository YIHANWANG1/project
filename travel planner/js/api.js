/**
 * API service - handles interactions with external APIs
 */

class ApiService {
    constructor() {
        this.mapboxToken = CONFIG.mapbox.accessToken;
        this.googleApiKey = CONFIG.google.apiKey;
        this.rapidApiKey = CONFIG.rapidApi.key;
        this.rapidApiHost = CONFIG.rapidApi.host;
        
        // initialize google services
        this.placesService = null;
        this.directionsService = null;
        
        // request cache
        this.cache = new Map();
    }
    
    /**
     * initialize google services
     * @param {Object} map - google maps instance
     */
    initGoogleServices(map) {
        if (window.google && window.google.maps) {
            this.placesService = new google.maps.places.PlacesService(map);
            this.directionsService = new google.maps.DirectionsService();
        } else {
            console.error('Google Maps API is not loaded');
        }
    }
    
    /**
     * generate ai travel plan
     * @param {Object} params - travel parameters
     * @returns {Promise<Object>} - travel plan
     */
    async generateTripPlan(params) {
        try {
            const cacheKey = JSON.stringify(params);
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            
            const options = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'X-RapidAPI-Key': this.rapidApiKey,
                    'X-RapidAPI-Host': this.rapidApiHost
                },
                body: JSON.stringify({
                    destination: params.destination,
                    days: params.days,
                    interests: params.interests.join(','),
                    budget: params.budget,
                    transportation: params.transportModes.join(',')
                })
            };
            
            const response = await fetch(CONFIG.rapidApi.tripPlanEndpoint, options);
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            
            const data = await response.json();
            this.cache.set(cacheKey, data);
            return data;
            
        } catch (error) {
            console.error('Generate ai travel plan failed:', error);
        }
    }
    
    /**
     * use mock data
     * @param {Object} params - travel parameters
     * @returns {Object} - mock travel plan
     */
    useMockData(params) {
        console.log('Using mock data:', params);
        
        // if mockData2 is available, use it first
        if (window.mockData2) {
            return this.useMockData2(params);
        }
        
        // use the original MockData
        // use the new getTripByDestination method to get the matching destination mock data
        let mockData = window.MockData.getTripByDestination(params.destination, params.days);
        
        // if no matching destination is found, return the default London trip
        if (mockData && params.destination.toLowerCase() !== 'london' && 
            !params.destination.toLowerCase().includes('London') && 
            !params.destination.toLowerCase().includes(mockData.destination.toLowerCase())) {
            console.warn(`No ${params.destination}  ${mockData.destination} `);
        }
        
        // add a flag to indicate this is mock data
        mockData._useMockData = true;
        
        return mockData;
    }
    
    /**
     * use mockData2 mock data
     * @param {Object} params - travel parameters
     * @returns {Object} - mock travel plan
     */
    useMockData2(params) {
        console.log('Using mockData2 to generate trip:', params);
        
        try {
            // check if user has selected interests
            let selectedInterests = params.interests && params.interests.length > 0 
                ? [...params.interests]  // create a copy to avoid modifying the original parameters
                : ["general"];  // if no selection, default to general
            
            console.log('User selected interests:', selectedInterests);
                
            // prepare options for generating trip
            const options = {
                days: params.days || 3,
                interests: selectedInterests,
                budget: params.budget || "medium",
                travelMode: this.convertTransportMode(params.transportModes)
            };
            
            console.log('Options passed to mockData2:', options);
            
            // use the generateTripPlan function of mockData2 to generate trip
            const itinerary = window.mockData2.generateTripPlan(options);
            
            // build the return data structure
            const mockPlan = {
                plan: {
                    days: params.days,
                    destination: params.destination || "London",
                    budget: params.budget,
                    travelMode: options.travelMode,
                    interests: options.interests,
                    itinerary: itinerary
                },
                _useMockData: true
            };
            
            console.log('mockData2 generated trip:', mockPlan);
            return mockPlan;
        } catch (error) {
            console.error('Using mockData2 to generate trip failed:', error);
            console.warn('Fallback to using original MockData');
            
            // if mockData2 generation fails, fallback to original MockData
            let mockData = window.MockData && window.MockData.getTripByDestination 
                ? window.MockData.getTripByDestination(params.destination, params.days)
                : null;
                
            
            
            mockData._useMockData = true;
            return mockData;
        }
    }
    
    /**
     * convert the internal transport mode to the format accepted by mockData2
     * @param {Array} transportModes - application internal transport mode array
     * @returns {string} - mockData2 transport mode
     */
    convertTransportMode(transportModes) {
        if (!transportModes || !Array.isArray(transportModes) || transportModes.length === 0) {
            return "public transport"; // default value
        }
        
        const modeMap = {
            "walking": "walking",
            "public": "public transport",
            "driving": "rental car",
            "cycling": "bike"
        };
        
        // use the first valid transport mode in the array
        for (const mode of transportModes) {
            if (modeMap[mode]) {
                return modeMap[mode];
            }
        }
        
        return "public transport"; // default value
    }
    
    /**
     * generate detailed ai travel plan
     * @param {Object} params - travel parameters
     * @returns {Promise<Object>} - detailed travel plan
     */
    async generateDetailedTripPlan(params) {
        try {
            const cacheKey = `detailed_${JSON.stringify(params)}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            
            // prefer API if available
            if (window.mockData2) {
                console.log('Found mockData2, using mock data directly');
                const mockData = this.useMockData2(params);
                this.cache.set(cacheKey, mockData);
                return this.processDetailedPlanResponse(mockData, params);
            }
            
            // convert the transport mode to the format accepted by the API
            let travelMode = "public transport"; // default value
            if (params.transportModes && params.transportModes.length > 0) {
                if (params.transportModes.includes("driving")) {
                    travelMode = "car";
                } else if (params.transportModes.includes("walking")) {
                    travelMode = "walking";
                } else if (params.transportModes.includes("public")) {
                    travelMode = "public transport";
                } else if (params.transportModes.includes("cycling")) {
                    travelMode = "bicycle";
                }
            }
            
            // prepare the API request parameters
            const options = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'X-RapidAPI-Key': this.rapidApiKey,
                    'X-RapidAPI-Host': this.rapidApiHost
                },
                body: JSON.stringify({
                    days: params.days,
                    destination: params.destination,
                    interests: params.interests,
                    budget: params.budget,
                    travelMode: travelMode
                })
            };
            
            console.log('Request parameters:', options.body);
            
            try {
                const response = await fetch(CONFIG.rapidApi.detailedPlanEndpoint, options);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`API returned status code: ${response.status}, error message: ${errorText}`);
                    
                    // if 502 error, it means the API is unavailable, use mock data
                    if (response.status === 502) {
                        console.warn('API service temporarily unavailable, using mock data');
                        const mockData = this.useMockData(params);
                        this.cache.set(cacheKey, mockData);
                        return this.processDetailedPlanResponse(mockData, params);
                    }
                    
                    throw new Error(`API returned error: ${response.status} - ${errorText}`);
                }
                
                const data = await response.json();
                console.log('Detailed plan API response:', data);
                
                // cache the result
                this.cache.set(cacheKey, data);
                
                // 
                const processedData = this.processDetailedPlanResponse(data, params);
                return processedData;
            } catch (fetchError) {
                console.warn('API request failed:', fetchError.message);
                
                // 
                console.warn('Using mock data instead of API');
                const mockData = this.useMockData(params);
                this.cache.set(cacheKey, mockData);
                return this.processDetailedPlanResponse(mockData, params);
            }
            
        } catch (error) {
            console.error('Failed to get detailed ai travel plan:', error);
            
            // 
            console.warn('Using mock data as a fallback');
            const mockData = this.useMockData(params);
            return this.processDetailedPlanResponse(mockData, params);
        }
    }
    
    /**
     * process detailed plan API response
     * @param {Object} apiResponse - API response data
     * @param {Object} params - original request parameters
     * @returns {Object} - processed travel data
     */
    processDetailedPlanResponse(apiResponse, params) {
        console.log('Processing API response:', apiResponse);
        
        // set basic travel information
        const processedPlan = {
            destination: params.destination,
            days: params.days,
            currency: CONFIG.app.defaultCurrency,
            itinerary: [],
            _useMockData: apiResponse._useMockData 
        };
        
        // process the response format containing the plan property
        if (apiResponse.plan) {
            apiResponse = apiResponse.plan;
        }
        
        // parse the destination location, for geocoding
        const destinationLatLng = this.getDefaultCityLocation(params.destination);
        
        // process the data format provided by mockData2.js
        if (window.mockData2 && apiResponse && apiResponse.itinerary && Array.isArray(apiResponse.itinerary)) {
            processedPlan.itinerary = apiResponse.itinerary.map(day => {
                return {
                    day: day.day,
                    activities: day.activities.map(activity => {
                        // check if the location already contains coordinates
                        let locationInfo;
                        
                        // if the location is a string, try to get the coordinates from LONDON_COORDINATES
                        if (typeof activity.location === 'string' && window.mockData2.LONDON_COORDINATES[activity.location]) {
                            const coords = window.mockData2.LONDON_COORDINATES[activity.location];
                            locationInfo = {
                                name: activity.location,
                                lat: coords.lat,
                                lng: coords.lng
                            };
                        } else {
                            // use the default processing method
                            locationInfo = this.processLocationInfo(
                                activity.location,
                                destinationLatLng,
                                activity.coordinates
                            );
                        }
                        
                        // process the cost information
                        let costDescription = '';
                        if (activity.cost && params.budget && activity.cost[params.budget]) {
                            costDescription = activity.cost[params.budget];
                        }
                        
                        return {
                            title: activity.activity || activity.name || activity.title || '',
                            time: activity.time || '',
                            description: activity.description || '',
                            type: this.determineActivityType(activity),
                            location: locationInfo,
                            costDescription: costDescription
                        };
                    })
                };
            });
            
            console.log('Processed itinerary data:', processedPlan.itinerary);
        }
        // process the response format containing the itinerary array (original logic)
        else if (apiResponse && apiResponse.itinerary && Array.isArray(apiResponse.itinerary)) {
            processedPlan.itinerary = apiResponse.itinerary.map(day => {
                return {
                    day: day.day,
                    activities: day.activities.map(activity => {
                        // process location information, create coordinates from text address
                        const locationInfo = this.processLocationInfo(
                            activity.location,
                            destinationLatLng,
                            activity.coordinates
                        );
                        
                        return {
                            title: activity.activity || activity.name || activity.title || '',
                            time: activity.time || '',
                            description: activity.description || '',
                            type: this.determineActivityType(activity),
                            location: locationInfo
                        };
                    })
                };
            });
            
            console.log('Processed itinerary data:', processedPlan.itinerary);
        } 
        // process the response format using day1/day2/day3 as keys
        else {
            for (let i = 1; i <= params.days; i++) {
                const dayKey = `day${i}`;
                if (apiResponse[dayKey]) {
                    // if the day key corresponds to an object, and each key is a time point
                    if (typeof apiResponse[dayKey] === 'object' && !Array.isArray(apiResponse[dayKey])) {
                        const activities = [];
                        
                        // iterate over each time point
                        Object.keys(apiResponse[dayKey]).forEach(timeKey => {
                            const activityData = apiResponse[dayKey][timeKey];
                            if (typeof activityData === 'string') {
                                // if the activity data is a string
                                activities.push({
                                    title: activityData,
                                    time: timeKey,
                                    description: '',
                                    type: this.determineActivityType({ activity: activityData }),
                                    location: this.processLocationInfo('', destinationLatLng)
                                });
                            } else if (typeof activityData === 'object') {
                                // if the activity data is an object
                                const locationInfo = this.processLocationInfo(
                                    activityData.location,
                                    destinationLatLng,
                                    activityData.coordinates
                                );
                                
                                activities.push({
                                    title: activityData.activity || activityData.name || activityData.title || '',
                                    time: timeKey,
                                    description: activityData.description || '',
                                    type: this.determineActivityType(activityData),
                                    location: locationInfo
                                });
                            }
                        });
                        
                        if (activities.length > 0) {
                            processedPlan.itinerary.push({
                                day: i,
                                activities: activities
                            });
                        }
                    } 
                    // if the day key corresponds to an object containing an activities array
                    else if (apiResponse[dayKey].activities && Array.isArray(apiResponse[dayKey].activities)) {
                        processedPlan.itinerary.push({
                            day: i,
                            activities: apiResponse[dayKey].activities.map(activity => {
                                const locationInfo = this.processLocationInfo(
                                    activity.location,
                                    destinationLatLng,
                                    activity.coordinates
                                );
                                
                                return {
                                    title: activity.activity || activity.name || activity.title || '',
                                    time: activity.time || '',
                                    description: activity.description || '',
                                    type: this.determineActivityType(activity),
                                    location: locationInfo
                                };
                            })
                        });
                    }
                }
            }
        }
        
        console.log('Processed itinerary data:', processedPlan);
        return processedPlan;
    }
    
    /**
     * process location information, create coordinates from text address
     * @param {string|object} location - location information (may be a text address or already an object)
     * @param {object} defaultLocation - default location coordinates
     * @param {object} coordinates - possible coordinates data
     * @returns {object} - processed location information object
     */
    processLocationInfo(location, defaultLocation, coordinates) {
        // if the location is already an object containing lat and lng, return it directly
        if (location && typeof location === 'object' && location.lat && location.lng) {
            return location;
        }
        
        // if there is coordinates data, use the coordinates data
        if (coordinates && coordinates.latitude && coordinates.longitude) {
            return {
                name: typeof location === 'string' ? location : '',
                lat: coordinates.latitude,
                lng: coordinates.longitude
            };
        }
        
        // if the location is a string, try to generate reasonable coordinates
        if (typeof location === 'string' && location.trim() !== '') {
            // generate random coordinates based on the destination, simulating real location
            return this.geocodeLocation(location, defaultLocation);
        }
        
        // default return the default location
        return {
            name: typeof location === 'string' ? location : '',
            lat: defaultLocation.lat,
            lng: defaultLocation.lng
        };
    }
    
    /**
     * generate coordinates based on location name (simulating geocoding)
     * @param {string} locationName - location name
     * @param {object} baseLocation - base location coordinates
     * @returns {object} - generated coordinates
     */
    geocodeLocation(locationName, baseLocation) {
        // extract the features of the text to generate a pseudo-random but consistent offset
        let seed = 0;
        for (let i = 0; i < locationName.length; i++) {
            seed += locationName.charCodeAt(i);
        }
        
        // generate a random offset value between -0.02 and 0.02 based on the seed
        const latOffset = (seed % 100) / 2500 - 0.02;
        const lngOffset = ((seed * 13) % 100) / 2500 - 0.02;
        
        return {
            name: locationName,
            lat: baseLocation.lat + latOffset,
            lng: baseLocation.lng + lngOffset
        };
    }
    
    /**
     * get the default coordinates of the city
     * @param {string} cityName - city name
     * @returns {object} - city coordinates
     */
    getDefaultCityLocation(cityName) {
        // common city coordinates
        const cityCoordinates = {
            'london': { lat: 51.5074, lng: -0.1278 },
            'paris': { lat: 48.8566, lng: 2.3522 },
            'new york': { lat: 40.7128, lng: -74.0060 },
            'tokyo': { lat: 35.6762, lng: 139.6503 },
            'beijing': { lat: 39.9042, lng: 116.4074 },
            'shanghai': { lat: 31.2304, lng: 121.4737 },
            'hong kong': { lat: 22.3193, lng: 114.1694 },
            'sydney': { lat: -33.8688, lng: 151.2093 },
            'rome': { lat: 41.9028, lng: 12.4964 },
            'barcelona': { lat: 41.3851, lng: 2.1734 },
            'islamabad': { lat: 33.6844, lng: 73.0479 }
        };
        
        // convert to lowercase and find
        const normalizedCity = cityName.toLowerCase();
        
        // return the found coordinates or the default value (London)
        return cityCoordinates[normalizedCity] || { lat: 51.5074, lng: -0.1278 };
    }
    
    /**
     * determine the activity type
     * @param {Object} activity - activity object
     * @returns {string} - activity type
     */
    determineActivityType(activity) {
       
        const type = activity.type || activity.category;
        
        
        if (type && /activity|tour|experience/i.test(type)) {
            return 'activity';
        }
        
        const title = activity.title || activity.name || activity.activity || '';
        const desc = activity.description || '';
        const location = typeof activity.location === 'string' ? activity.location : '';
        const content = [title, desc, location].join(' ').toLowerCase();
        
        // activity related content
        if (/tour|activity|adventure|experience|show|performance|theater|theatre|concert|festival|watch|see|attend|workshop|class|lesson|event|restaurant|food|dining|cafe|breakfast|lunch|dinner|eat|brunch|bar|pub|cuisine|tea|coffee|bakery|dessert|pastry|market|shop|store|mall|shopping|boutique|bazaar|outlet|souvenir|retail|cinema|movie|theme park|amusement|zoo|aquarium|fun|game|play/i.test(content)) {
            return 'activity';
        } 
        
        // all other cases are classified as attraction type
        return 'attraction';
    }
    
    /**
     * search for locations
     * @param {string} query - search query
     * @param {Object} location - location coordinates {lat, lng}
     * @returns {Promise<Array>} - location results
     */
    searchPlaces(query, location) {
        return new Promise((resolve, reject) => {
            if (!this.placesService) {
                console.warn('Google Places service not initialized, using fallback');
                // provide a mock result instead of rejecting the Promise
                resolve([{
                    place_id: 'mock_place_id',
                    name: query,
                    formatted_address: 'cannot get accurate address',
                    geometry: {
                        location: new google.maps.LatLng(location.lat, location.lng)
                    }
                }]);
                return;
            }
            
            const request = {
                query,
                location: new google.maps.LatLng(location.lat, location.lng),
                radius: 5000,
                language: CONFIG.app.defaultLocale
            };
            
            this.placesService.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    resolve(results);
                } else {
                    console.warn(`location search failed: ${status}, using fallback`);
                    // provide a mock result instead of rejecting the Promise
                    resolve([{
                        place_id: 'mock_place_id',
                        name: query,
                        formatted_address: 'cannot get accurate address',
                        geometry: {
                            location: new google.maps.LatLng(location.lat, location.lng)
                        }
                    }]);
                }
            });
        });
    }
    
    /**
     * get the details of a location
     * @param {string} placeId - Google location ID
     * @returns {Promise<Object>} - location details
     */
    getPlaceDetails(placeId) {
        return new Promise((resolve, reject) => {
            if (!this.placesService) {
                console.warn('Google Places service not initialized, using fallback');
                // provide a mock result instead of rejecting the Promise
                resolve({
                    name: 'location information',
                    formatted_address: 'cannot get accurate address',
                    rating: 4.0,
                    user_ratings_total: 10
                });
                return;
            }
            
            // if the placeId is a mock ID, return the mock data
            if (placeId === 'mock_place_id') {
                resolve({
                    name: 'location information',
                    formatted_address: 'cannot get accurate address',
                    rating: 4.0,
                    user_ratings_total: 10
                });
                return;
            }
            
            const request = {
                placeId,
                fields: ['name', 'rating', 'formatted_address', 'formatted_phone_number', 
                         'opening_hours', 'website', 'photos', 'reviews', 'geometry', 
                         'price_level', 'types', 'user_ratings_total'],
                language: CONFIG.app.defaultLocale
            };
            
            this.placesService.getDetails(request, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    resolve(place);
                } else {
                    console.warn(`get location details failed: ${status}, using fallback`);
                    // provide a mock result instead of rejecting the Promise
                    resolve({
                        name: 'location information',
                        formatted_address: 'cannot get accurate address',
                        rating: 4.0,
                        user_ratings_total: 10
                    });
                }
            });
        });
    }
    
    /**
     * get the route plan
     * @param {Array} waypoints - route points [{lat, lng}]
     * @param {string} mode - transportation mode
     * @returns {Promise<Object>} - route plan result
     */
    getDirections(waypoints, mode) {
        return new Promise((resolve, reject) => {
            if (!this.directionsService) {
                console.warn('Google Directions service not initialized, using fallback');
                // create a simple straight line route result instead of rejecting the Promise
                resolve(this.createSimpleDirectionsResult(waypoints));
                return;
            }
            
            // at least need start and end point
            if (waypoints.length < 2) {
                console.warn('route plan requires at least start and end point, using fallback');
                reject(new Error('route plan requires at least start and end point'));
                return;
            }
            
            // build the waypoints
            const waypointsFormatted = waypoints.slice(1, -1).map(wp => ({
                location: new google.maps.LatLng(wp.lat, wp.lng),
                stopover: true
            }));
            
            const request = {
                origin: new google.maps.LatLng(waypoints[0].lat, waypoints[0].lng),
                destination: new google.maps.LatLng(waypoints[waypoints.length - 1].lat, waypoints[waypoints.length - 1].lng),
                waypoints: waypointsFormatted,
                travelMode: this.getGoogleTravelMode(mode),
                optimizeWaypoints: true,
                language: CONFIG.app.defaultLocale
            };
            
            this.directionsService.route(request, (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    resolve(result);
                } else {
                    console.warn(`get route plan failed: ${status}, using fallback`);
                    // create a simple straight line route result instead of rejecting the Promise
                    resolve(this.createSimpleDirectionsResult(waypoints));
                }
            });
        });
    }
    
    /**
     * create a simple straight line route result
     * @param {Array} waypoints - route points [{lat, lng}]
     * @returns {Object} - simple route result
     */
    createSimpleDirectionsResult(waypoints) {
        // create a fake route result, containing all points connected in a straight line
        const legs = [];
        
        for (let i = 0; i < waypoints.length - 1; i++) {
            const start = waypoints[i];
            const end = waypoints[i + 1];
            
            legs.push({
                start_location: new google.maps.LatLng(start.lat, start.lng),
                end_location: new google.maps.LatLng(end.lat, end.lng),
                steps: [{
                    path: [
                        new google.maps.LatLng(start.lat, start.lng),
                        new google.maps.LatLng(end.lat, end.lng)
                    ]
                }]
            });
        }
        
        return {
            routes: [{
                legs: legs,
                overview_path: waypoints.map(wp => new google.maps.LatLng(wp.lat, wp.lng))
            }]
        };
    }
    
    /**
     * convert the internal transportation mode to Google API transportation mode
     * @param {string} mode - internal transportation mode
     * @returns {string} - Google transportation mode
     */
    getGoogleTravelMode(mode) {
        const modeMap = {
            'walking': google.maps.TravelMode.WALKING,
            'driving': google.maps.TravelMode.DRIVING,
            'public': google.maps.TravelMode.TRANSIT,
            'cycling': google.maps.TravelMode.BICYCLING
        };
        
        return modeMap[mode] || google.maps.TravelMode.WALKING;
    }
    
}

// create a singleton instance of the API service
const apiService = new ApiService(); 