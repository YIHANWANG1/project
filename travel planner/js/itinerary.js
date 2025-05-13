/**
 * itinerary service - handle the itinerary display and interaction
 */

class ItineraryService {
    constructor() {
        this.currentTrip = null;
        this.currentDay = 1;
        this.formVisible = true; // track the form visibility state
        
        // bind the event handlers
        this.init = this.init.bind(this);
        this.handleTripFormSubmit = this.handleTripFormSubmit.bind(this);
        this.displayItinerary = this.displayItinerary.bind(this);
        this.switchDay = this.switchDay.bind(this);
    }
    
    /**
     * initialize the itinerary component
     */
    init() {
        console.log('initializing the itinerary service...');
        
        // listen to the itinerary form submission
        const tripForm = document.getElementById('trip-form');
        if (tripForm) {
            tripForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleTripFormSubmit();
            });
        }
        
        // add the return button
        this.createBackButton();
    }
    
    /**
     * create the return form button
     */
    createBackButton() {
        const itineraryContainer = document.getElementById('itinerary-container');
        if (!itineraryContainer) return;
        
        // check if the return button already exists
        let backButton = document.getElementById('back-to-form');
        if (!backButton) {
            backButton = document.createElement('button');
            backButton.id = 'back-to-form';
            backButton.className = 'back-button';
            backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Return to customize';
            
            // insert into the itinerary container
            itineraryContainer.insertBefore(backButton, itineraryContainer.firstChild);
            
            // add the click event
            backButton.addEventListener('click', () => {
                this.toggleFormAndItinerary();
            });
            
            console.log('created the return button');
        }
    }
    
    /**
     * toggle the form and itinerary view
     */
    toggleFormAndItinerary() {
        const plannerForm = document.querySelector('.planner-form');
        const itineraryContainer = document.getElementById('itinerary-container');
        
        if (!plannerForm || !itineraryContainer) return;
        
        if (this.formVisible) {
            // display the itinerary, hide the form
            plannerForm.style.display = 'none';
            itineraryContainer.style.display = 'block';
            this.formVisible = false;
            console.log('switched to the itinerary view');
        } else {
            // display the form, hide the itinerary
            plannerForm.style.display = 'block';
            itineraryContainer.style.display = 'none';
            this.formVisible = true;
            console.log('switched to the form view');
        }
    }
    
    /**
     * handle the trip form submission
     */
    async handleTripFormSubmit() {
        const form = document.getElementById('trip-form');
        if (!form) return;
        
        // show the loading indicator
        this.showLoadingIndicator();
        
        // get the form data, ensure the destination is always London
        const destination = "London"; // fixed destination as London
        const days = parseInt(document.getElementById('days').value);
        
        // get the selected interests - get the value from the app instance
        let interests = app.selectedInterests;
        
        // if no interests are selected, use the default value "general"
        if (!interests || interests.length === 0) {
            interests = ["general"];
        }
        
        console.log('user selected interests:', interests);
        
        // get the budget
        const budget = document.getElementById('budget').value;
        
        // get the selected transport modes
        const transportModes = [];
        document.querySelectorAll('.transport-options input:checked').forEach(checkbox => {
            transportModes.push(checkbox.value);
        });
        
        // build the request parameters
        const params = {
            destination,
            days,
            interests,
            budget,
            transportModes
        };
        
        try {
            // call the API to generate the trip plan - use the detailed plan API
            const tripPlan = await apiService.generateDetailedTripPlan(params);
            
            // save the current trip
            this.currentTrip = tripPlan;
            this.currentDay = 1;
            
            // display the itinerary
            this.displayItinerary(tripPlan);
            
            // switch to the itinerary view
            this.formVisible = true; // set to true so toggleFormAndItinerary can switch to false
            this.toggleFormAndItinerary();
            
        } catch (error) {
            console.error('failed to generate the trip plan:', error);
            
            // display the detailed error information
            let errorMessage = 'cannot generate the trip plan';
            
            // check if the error message contains API error information
            if (error.message.includes('API returned error')) {
                if (error.message.includes('502')) {
                    errorMessage = 'API service is temporarily unavailable, please try again later. (error code: 502)';
                } else {
                    errorMessage = `API service error: ${error.message}`;
                }
            } else {
                errorMessage = `error: ${error.message}`;
            }
            
            this.showErrorMessage(errorMessage);
        } finally {
            this.hideLoadingIndicator();
        }
    }
    
    /**
     * test the detailed plan API (only for testing)
     */
    async testDetailedPlanApi() {
        try {
            // show the loading indicator
            this.showLoadingIndicator();
            
            // use the sample data instead of calling the API
            const sampleData = {
                "_id": "676e3c54ee932bacc663ce3b",
                "plan": {
                    "days": 3,
                    "destination": "London",
                    "budget": "medium",
                    "travelMode": "public transport",
                    "interests": [
                        "cuisine",
                        "fine dining",
                        "local markets"
                    ],
                    "itinerary": [
                        {
                            "day": 1,
                            "activities": [
                                {
                                    "time": "09:00",
                                    "activity": "Breakfast at Dishoom",
                                    "location": "Dishoom, Covent Garden"
                                },
                                {
                                    "time": "11:00",
                                    "activity": "Visit Borough Market",
                                    "location": "Borough Market"
                                },
                                {
                                    "time": "13:00",
                                    "activity": "Lunch at Padella",
                                    "location": "Padella, Borough Market"
                                },
                                {
                                    "time": "15:00",
                                    "activity": "Visit The Shard",
                                    "location": "The Shard"
                                },
                                {
                                    "time": "17:00",
                                    "activity": "Afternoon tea at Aqua Shard",
                                    "location": "Aqua Shard"
                                },
                                {
                                    "time": "19:30",
                                    "activity": "Dinner at The Ivy",
                                    "location": "The Ivy, Covent Garden"
                                }
                            ]
                        },
                        {
                            "day": 2,
                            "activities": [
                                {
                                    "time": "09:00",
                                    "activity": "Breakfast at The Breakfast Club",
                                    "location": "The Breakfast Club, Soho"
                                },
                                {
                                    "time": "11:00",
                                    "activity": "Explore Covent Garden Market",
                                    "location": "Covent Garden"
                                },
                                {
                                    "time": "13:00",
                                    "activity": "Lunch at Hawksmoor Seven Dials",
                                    "location": "Hawksmoor, Seven Dials"
                                },
                                {
                                    "time": "15:00",
                                    "activity": "Visit the Tate Modern",
                                    "location": "Tate Modern"
                                },
                                {
                                    "time": "18:00",
                                    "activity": "Dinner at St John",
                                    "location": "St John, Smithfield"
                                },
                                {
                                    "time": "20:30",
                                    "activity": "Enjoy a West End show",
                                    "location": "West End"
                                }
                            ]
                        },
                        {
                            "day": 3,
                            "activities": [
                                {
                                    "time": "09:00",
                                    "activity": "Breakfast at Sketch",
                                    "location": "Sketch, Mayfair"
                                },
                                {
                                    "time": "11:00",
                                    "activity": "Visit Notting Hill and Portobello Road Market",
                                    "location": "Notting Hill"
                                },
                                {
                                    "time": "13:00",
                                    "activity": "Lunch at The Ledbury",
                                    "location": "The Ledbury, Notting Hill"
                                },
                                {
                                    "time": "15:00",
                                    "activity": "Explore Kensington Gardens",
                                    "location": "Kensington Gardens"
                                },
                                {
                                    "time": "17:00",
                                    "activity": "Indulge in dessert at The Connaught",
                                    "location": "The Connaught, Mayfair"
                                },
                                {
                                    "time": "19:30",
                                    "activity": "Final dinner at Noble Rot",
                                    "location": "Noble Rot, Bloomsbury"
                                }
                            ]
                        }
                    ]
                },
                "key": "3-london-fine dining,cuisine-medium-public transport"
            };
            
            console.log('use the sample data for testing:', sampleData);
            
            // process the data and convert to the format needed by the app
            const testParams = {
                days: 3,
                destination: "London",
                interests: ["fine dining", "cuisine"],
                budget: "medium",
                transportModes: ["public"]
            };
            
            // use the API service to process the data
            const tripPlan = apiService.processDetailedPlanResponse(sampleData, testParams);
            console.log('processed itinerary data:', tripPlan);
            
            // save the current trip
            this.currentTrip = tripPlan;
            this.currentDay = 1;
            
            // display the itinerary
            this.displayItinerary(tripPlan);
            
            // switch to the itinerary view
            this.formVisible = true; // set to true so toggleFormAndItinerary can switch to false
            this.toggleFormAndItinerary();
            
        } catch (error) {
            console.error('failed to test the detailed plan API:', error);
            this.showErrorMessage(`test failed: ${error.message}`);
        } finally {
            this.hideLoadingIndicator();
        }
    }
    
    /**
     * 显示行程
     * @param {Object} tripPlan - 旅行计划
     */
    displayItinerary(tripPlan) {
        console.log('display the itinerary data:', tripPlan);
        
        // display the itinerary container
        const itineraryContainer = document.getElementById('itinerary-container');
        if (itineraryContainer) {
            itineraryContainer.style.display = 'block';
        }
        
        // ensure we have the correct itinerary data
        let itineraryData = tripPlan.itinerary;
        
        // if there is no itinerary property but there is a plan property, try to get the itinerary from the plan
        if (!itineraryData && tripPlan.plan && tripPlan.plan.itinerary) {
            itineraryData = tripPlan.plan.itinerary;
            console.log('obtain itinerary from plan:', itineraryData);
        }
        
        if (!itineraryData || !Array.isArray(itineraryData) || itineraryData.length === 0) {
            console.error('invalid itinerary data:', tripPlan);
            this.showErrorMessage('cannot display itinerary, invalid data format');
            return;
        }
        
        // generate the days navigation
        const days = tripPlan.days || tripPlan.plan?.days || itineraryData.length;
        this.generateDaysNavigation(days);
        
        // display the first day itinerary
        this.displayDayItinerary(itineraryData[0], 1);
        console.log('display the first day itinerary:', itineraryData[0]);
    }
    
    /**
     * generate the days navigation
     * @param {number} days - the number of days
     */
    generateDaysNavigation(days) {
        const daysNavigation = document.getElementById('days-navigation');
        if (!daysNavigation) return;
        
        // clear the navigation
        daysNavigation.innerHTML = '';
        
        // generate the day buttons
        for (let i = 1; i <= days; i++) {
            const dayButton = document.createElement('button');
            dayButton.className = `day-button ${i === 1 ? 'active' : ''}`;
            dayButton.textContent = `Day ${i}`;
            dayButton.dataset.day = i;
            
            // add the click event
            dayButton.addEventListener('click', () => {
                this.switchDay(i);
            });
            
            daysNavigation.appendChild(dayButton);
        }
    }
    
    /**
     * switch to the specified day
     * @param {number} day - the number of days
     */
    switchDay(day) {
        if (!this.currentTrip) return;
        
        // get the itinerary data
        let itineraryData = this.currentTrip.itinerary;
        if (!itineraryData && this.currentTrip.plan && this.currentTrip.plan.itinerary) {
            itineraryData = this.currentTrip.plan.itinerary;
        }
        
        if (!itineraryData || !Array.isArray(itineraryData)) {
            console.error('cannot switch to the specified day, no itinerary data:', this.currentTrip);
            return;
        }
        
        // clear the current routes and details (if any)
        if (mapService) {
            mapService.clearRoutes();
        }
        
        // if the place details are currently being displayed, close it
        if (placeDetailsService && placeDetailsService.currentPlace) {
            placeDetailsService.hidePlaceDetails();
        }
        
        // update the current day
        this.currentDay = day;
        
        // update the navigation button status
        const dayButtons = document.querySelectorAll('.day-button');
        dayButtons.forEach(button => {
            if (parseInt(button.dataset.day, 10) === day) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // display the itinerary for the specified day
        const dayPlan = itineraryData.find(d => d.day === day);
        if (dayPlan) {
            this.displayDayItinerary(dayPlan, day);
        }
    }
    
    /**
     * display the itinerary for the specified day
     * @param {Object} dayPlan - the itinerary for one day
     * @param {number} dayNumber - the number of days
     */
    displayDayItinerary(dayPlan, dayNumber) {
        const itineraryDetails = document.getElementById('itinerary-details');
        if (!itineraryDetails) return;
        
        // clear the itinerary details
        itineraryDetails.innerHTML = '';
        
        // create the day container
        const dayContainer = document.createElement('div');
        dayContainer.className = 'day-container';
        
        // create the title
        const dayTitle = document.createElement('div');
        dayTitle.className = 'day-title';
        dayTitle.textContent = `Day ${dayNumber}`;
        dayContainer.appendChild(dayTitle);
        
        // if there are no activities, display the prompt
        if (!dayPlan.activities || dayPlan.activities.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'This day has no activities。';
            emptyMessage.className = 'empty-message';
            dayContainer.appendChild(emptyMessage);
            itineraryDetails.appendChild(dayContainer);
            return;
        }
        
        // create the activity list
        dayPlan.activities.forEach((activity, index) => {
            const activityCard = this.createActivityCard(activity, index);
            dayContainer.appendChild(activityCard);
        });
        
        itineraryDetails.appendChild(dayContainer);
        
        // display the itinerary on the map
        mapService.displayDayPlan(dayPlan, dayNumber);
    }
    
    /**
     * create the activity card
     * @param {Object} activity - the activity data
     * @param {number} index - the activity index
     * @returns {HTMLElement} - the activity card element
     */
    createActivityCard(activity, index) {
        const activityCard = document.createElement('div');
        activityCard.className = 'activity-card';
        activityCard.dataset.index = index;
        
        // 添加点击事件
        activityCard.addEventListener('click', () => {
            // display the details in the left panel
            placeDetailsService.setDisplayMode(true); // set to display in the panel
            placeDetailsService.showPlaceDetails(activity, index);
            mapService.highlightMarker(index);
        });
        
        // activity time
        const activityTime = document.createElement('div');
        activityTime.className = 'activity-time';
        activityTime.textContent = activity.time || '';
        
        // activity content area
        const activityContent = document.createElement('div');
        activityContent.className = 'activity-content';
        
        // activity title
        const activityTitle = document.createElement('div');
        activityTitle.className = 'activity-title';
        activityTitle.textContent = activity.title || '';
        
        // activity location
        const activityLocation = document.createElement('div');
        activityLocation.className = 'activity-location';
        // handle the case where location is a string or an object
        const locationText = typeof activity.location === 'string' 
            ? activity.location 
            : (activity.location?.name || '');
        activityLocation.textContent = locationText;
        
        // combine the content
        activityContent.appendChild(activityTitle);
        if (locationText) {
            activityContent.appendChild(activityLocation);
        }
        
        // if there is a description, add the description
        if (activity.description) {
            const description = document.createElement('div');
            description.className = 'activity-description';
            description.textContent = activity.description;
            activityContent.appendChild(description);
        }
        
        // if there is a cost information, add the cost label
        if (activity.costDescription) {
            const costInfo = document.createElement('div');
            costInfo.className = 'activity-cost';
            costInfo.textContent = activity.costDescription;
            activityContent.appendChild(costInfo);
        }
        
        // add the navigation button
        const navigationButton = document.createElement('button');
        navigationButton.className = 'navigation-button';
        navigationButton.innerHTML = '<i class="fas fa-directions"></i>';
        navigationButton.title = 'Check the navigation route to here';
        
        // navigation button click event - prevent bubbling to avoid triggering the card click event
        navigationButton.addEventListener('click', (e) => {
            e.stopPropagation();
            // trigger the navigation function
            this.startNavigation(activity, index);
        });
        
        // activity type label
        const activityType = document.createElement('div');
        // determine the activity type, only keep activity and attraction
        let type = activity.type || 'attraction';
        
        // special handling: for some specific activities, ensure they are classified as activities rather than attractions
        const title = (activity.title || '').toLowerCase();
        const desc = (activity.description || '').toLowerCase();
        const location = locationText.toLowerCase();
        const fullText = title + ' ' + desc + ' ' + location;
        
        // if it contains these keywords, classify it as "activity"
        if (/theater|theatre|drama|opera|show|play|stage|concert|演出|剧院|歌剧|舞台|戏剧|restaurant|food|dining|cafe|breakfast|lunch|dinner|eat|brunch|bar|pub|cuisine|tea|coffee|bakery|museum|gallery|exhibition|shop|store|mall|shopping|market/i.test(fullText)) {
            type = 'activity';
        } else {
            type = 'attraction'; // other cases are classified as attractions
        }
        
        activityType.className = `activity-type type-${type}`;
        const typeInfo = CONFIG.activityTypes[type];
        activityType.textContent = typeInfo ? typeInfo.label : 'attraction';
        
        // combine the card
        activityCard.appendChild(activityTime);
        activityCard.appendChild(activityContent);
        activityCard.appendChild(navigationButton); // add the navigation button
        activityCard.appendChild(activityType);
        
        return activityCard;
    }
    
    /**
     * start navigation to the specified activity
     * @param {Object} activity - the target activity
     * @param {number} index - the activity index
     */
    startNavigation(activity, index) {
        console.log('start navigation to:', activity.title || 'destination', 'index:', index);
        
        // ensure the activity has location information
        if (!activity.location || (typeof activity.location === 'object' && 
            (isNaN(activity.location.lat) || isNaN(activity.location.lng)))) {
            console.warn('activity lacks valid location information, cannot navigate');
            alert('cannot navigate: the location has no valid information');
            return;
        }
        
        // get all activities
        const activities = this.getCurrentDayActivities();
        if (!activities || activities.length === 0) {
            console.warn('no activities for the current day');
            return;
        }
        
        // use the map service to calculate the route to the specified activity
        // based on the index of the clicked activity, determine the starting point
        if (index === 0) {
            // if it is the first activity, the starting point is the user's current location
            mapService.calculateRouteToActivity(activity, index, activities, true);
        } else {
            // if it is not the first activity, the starting point is the previous activity
            mapService.calculateRouteToActivity(activity, index, activities, false);
        }
    }
    
    /**
     * show the loading indicator
     */
    showLoadingIndicator() {
        // create the loading indicator
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Generating your专属旅行计划...</p>
        `;
        
        // add to the document
        document.body.appendChild(loadingOverlay);
    }
    
    /**
     * hide the loading indicator
     */
    hideLoadingIndicator() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }
    
    /**
     * show the error message
     * @param {string} message - the error message
     */
    showErrorMessage(message) {
        const form = document.getElementById('trip-form');
        if (!form) return;
        
        // remove the old error message
        const oldError = document.querySelector('.error-message');
        if (oldError) {
            oldError.remove();
        }
        
        // create the error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        // insert the error message after the form
        form.insertAdjacentElement('afterend', errorElement);
        
        // remove the error message after 5 seconds
        setTimeout(() => {
            errorElement.classList.add('fade-out');
            setTimeout(() => {
                if (errorElement.parentNode) {
                    errorElement.remove();
                }
            }, 500);
        }, 5000);
    }
    
    /**
     * get the activities for the current selected day
     * @returns {Array} - the activity list
     */
    getCurrentDayActivities() {
        if (!this.currentTrip) return [];
        
        // get the itinerary data
        let itineraryData = this.currentTrip.itinerary;
        if (!itineraryData && this.currentTrip.plan && this.currentTrip.plan.itinerary) {
            itineraryData = this.currentTrip.plan.itinerary;
        }
        
        if (!itineraryData || !Array.isArray(itineraryData)) {
            return [];
        }
        
        const dayPlan = itineraryData.find(d => d.day === this.currentDay);
        return dayPlan ? dayPlan.activities : [];
    }
    
    /**
     * show the info message
     * @param {string} message - the info message
     */
    showInfoMessage(message) {
        const form = document.getElementById('trip-form');
        if (!form) return;
        
        // remove the old message
        const oldInfo = document.querySelector('.info-message');
        if (oldInfo) {
            oldInfo.remove();
        }
        
        // create the info message element
        const infoElement = document.createElement('div');
        infoElement.className = 'info-message';
        infoElement.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        `;
        
        // insert the info message above the itinerary container
        const itineraryContainer = document.getElementById('itinerary-container');
        if (itineraryContainer) {
            itineraryContainer.insertAdjacentElement('beforebegin', infoElement);
            
            // remove the info message after 8 seconds
            setTimeout(() => {
                infoElement.classList.add('fade-out');
                setTimeout(() => {
                    if (infoElement.parentNode) {
                        infoElement.remove();
                    }
                }, 500);
            }, 8000);
        }
    }
}

// create the itinerary service singleton
const itineraryService = new ItineraryService(); 