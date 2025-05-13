/**
 * place details service - handle the place details display
 */

class PlaceDetailsService {
    constructor() {
        this.currentPlace = null;
        this.itineraryPanel = null;
        this.itineraryContent = null;
        this.showInPanel = true; // whether to display the details in the panel
        this.pageLevel = 0; // add the page level tracking, 0=itinerary page, 1=details page
    }
    
    /**
     * initialize the place details
     */
    init() {
        // save the itinerary panel and content references
        this.itineraryPanel = document.getElementById('itinerary-container');
        this.itineraryContent = document.getElementById('itinerary-details');
        
        if (!this.itineraryPanel || !this.itineraryContent) {
            console.error('cannot find the itinerary panel element');
        }
        
        // set the close button
        const closeButton = document.getElementById('close-details');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.hidePlaceDetails());
        }
        
        // click the modal outside to close
        const placeDetails = document.getElementById('place-details');
        if (placeDetails) {
            document.addEventListener('click', (event) => {
                if (event.target === placeDetails) {
                    this.hidePlaceDetails();
                }
            });
        }
        
        // create the close button in the itinerary panel
        this.createPanelCloseButton();
    }
    
    /**
     * create the close button in the itinerary panel
     */
    createPanelCloseButton() {
        // check if the close button exists
        let closeButton = document.getElementById('panel-close-details');
        if (!closeButton && this.itineraryPanel) {
            closeButton = document.createElement('button');
            closeButton.id = 'panel-close-details';
            closeButton.className = 'back-button';
            closeButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Itinerary';
            closeButton.style.display = 'none';
            
            // add to the itinerary panel
            if (this.itineraryPanel) {
                this.itineraryPanel.insertBefore(closeButton, this.itineraryPanel.firstChild);
                // use the new return method
                closeButton.addEventListener('click', () => this.backToItinerary());
            }
        }
        return closeButton;
    }
    
    /**
     * display the place details
     * @param {Object} activity - the activity data
     * @param {number} index - the activity index
     */
    async showPlaceDetails(activity, index) {
        this.currentPlace = activity;
        
        if (this.showInPanel) {
            // display the details in the panel
            await this.showPlaceDetailsInPanel(activity, index);
        } else {
            // display the details in the modal
            await this.showPlaceDetailsInModal(activity, index);
        }
    }
    
    /**
     * display the place details in the panel
     * @param {Object} activity - the activity data
     * @param {number} index - the activity index
     */
    async showPlaceDetailsInPanel(activity, index) {
        // set the page level to details page
        this.pageLevel = 1;
        
        // save the current itinerary content
        if (this.itineraryContent) {
            this.originalContent = this.itineraryContent.innerHTML;
        }
        
        // display the close button
        const closeButton = document.getElementById('panel-close-details');
        if (closeButton) {
            closeButton.style.display = 'block';
        }
        
        // hide the return modify button
        const backToFormButton = document.getElementById('back-to-form');
        if (backToFormButton) {
            backToFormButton.style.display = 'none';
        }
        
        // create the details container
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'place-info-container';
        
        // add the loading spinner
        detailsContainer.innerHTML = '<div class="loading-spinner"></div>';
        
        // replace the itinerary content
        if (this.itineraryContent) {
            this.itineraryContent.innerHTML = '';
            this.itineraryContent.appendChild(detailsContainer);
        }
        
        try {
            // try to get the more detailed information from Google Places API
            let placeData = null;
            
            try {
                // prepare the search query
                let searchQuery = '';
                // use the location name as the search query
                if (typeof activity.location === 'object' && activity.location.name) {
                    searchQuery = activity.location.name;
                } else if (typeof activity.location === 'string') {
                    searchQuery = activity.location;
                } else {
                    searchQuery = activity.title; // use the title if no better choice
                }
                
                console.log('use the search query:', searchQuery);
                // try to search this location
                const searchResults = await apiService.searchPlaces(searchQuery, activity.location);
                
                if (searchResults && searchResults.length > 0) {
                    // get the details of the first result
                    placeData = await apiService.getPlaceDetails(searchResults[0].place_id);
                }
            } catch (error) {
                console.warn('cannot get the place details:', error);
                // continue to use the data from the activity
            }
            
            // display the details
            this.displayPlaceInfo(activity, placeData, detailsContainer);
            
        } catch (error) {
            console.error('cannot display the place details:', error);
            detailsContainer.innerHTML = `<p class="error-message">cannot display the place details</p>`;
        }
    }
    
    /**
     * display the place details in the modal
     * @param {Object} activity - the activity data
     * @param {number} index - the activity index
     */
    async showPlaceDetailsInModal(activity, index) {
        const placeDetailsElement = document.getElementById('place-details');
        const placeInfoElement = document.querySelector('.place-info');
        
        if (!placeDetailsElement || !placeInfoElement) return;
        
        // clear the details content
        placeInfoElement.innerHTML = '';
        
        // add the loading spinner
        placeInfoElement.innerHTML = '<div class="loading-spinner"></div>';
        
        // display the details container
        placeDetailsElement.classList.add('visible');
        
        try {
            // try to get the more detailed information from Google Places API
            let placeData = null;
            
            try {
                // prepare the search query
                let searchQuery = '';
                // use the location name as the search query
                if (typeof activity.location === 'object' && activity.location.name) {
                    searchQuery = activity.location.name;
                } else if (typeof activity.location === 'string') {
                    searchQuery = activity.location;
                } else {
                    searchQuery = activity.title; // use the title if no better choice
                }
                
                console.log('use the search query:', searchQuery);
                // try to search this location
                const searchResults = await apiService.searchPlaces(searchQuery, activity.location);
                
                if (searchResults && searchResults.length > 0) {
                    // get the details of the first result
                    placeData = await apiService.getPlaceDetails(searchResults[0].place_id);
                }
            } catch (error) {
                console.warn('cannot get the place details:', error);
                // continue to use the data from the activity
            }
            
            // display the details
            this.displayPlaceInfo(activity, placeData, placeInfoElement);
            
        } catch (error) {
            console.error('cannot display the place details:', error);
            placeInfoElement.innerHTML = `<p class="error-message">cannot display the place details</p>`;
        }
    }
    
    /**
     * display the place information
     * @param {Object} activity - the activity data
     * @param {Object} placeData - the place data from Google Places API
     * @param {HTMLElement} container - the container element
     */
    displayPlaceInfo(activity, placeData, container) {
        // clear the container
        container.innerHTML = '';
        
        // use the Google API data, if not, use the activity data
        const place = placeData || activity;
        const title = placeData ? placeData.name : activity.title;
        
        // add the title
        const titleElement = document.createElement('h3');
        titleElement.textContent = title;
        container.appendChild(titleElement);
        
        // add the photos, if not, use the activity data
        if (placeData && placeData.photos && placeData.photos.length > 0) {
            const photo = placeData.photos[0];
            const photoUrl = photo.getUrl({ maxWidth: 500, maxHeight: 300 });
            
            const photoElement = document.createElement('img');
            photoElement.src = photoUrl;
            photoElement.alt = title;
            photoElement.className = 'place-photo';
            container.appendChild(photoElement);
        }
        
        // add the rating, if not, use the activity data
        if (placeData && placeData.rating) {
            const ratingContainer = document.createElement('div');
            ratingContainer.className = 'place-rating';
            
            // rating
            const rating = parseFloat(placeData.rating);
            const fullStars = Math.floor(rating);
            const halfStar = rating % 1 >= 0.5;
            
            let starsHtml = '';
            for (let i = 0; i < fullStars; i++) {
                starsHtml += '<i class="fas fa-star"></i>';
            }
            
            if (halfStar) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            }
            
            const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
            for (let i = 0; i < emptyStars; i++) {
                starsHtml += '<i class="far fa-star"></i>';
            }
            
            ratingContainer.innerHTML = `
                <div class="stars">${starsHtml}</div>
                <div class="rating-value">${rating} / 5</div>
                <div class="rating-count">(${placeData.user_ratings_total || 0} reviews)</div>
            `;
            
            container.appendChild(ratingContainer);
        }
        
        // add the address, if not, use the activity data
        if (placeData && placeData.formatted_address) {
            const addressElement = document.createElement('p');
            addressElement.className = 'place-address';
            addressElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${placeData.formatted_address}`;
            container.appendChild(addressElement);
        } else if (activity.location && activity.location.name) {
            const addressElement = document.createElement('p');
            addressElement.className = 'place-address';
            addressElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${activity.location.name}`;
            container.appendChild(addressElement);
        }
        
        // add the phone, if not, use the activity data
        if (placeData && placeData.formatted_phone_number) {
            const phoneElement = document.createElement('p');
            phoneElement.className = 'place-phone';
            phoneElement.innerHTML = `<i class="fas fa-phone"></i> ${placeData.formatted_phone_number}`;
            container.appendChild(phoneElement);
        }
        
        // add the website, if not, use the activity data
        if (placeData && placeData.website) {
            const websiteElement = document.createElement('p');
            websiteElement.className = 'place-website';
            websiteElement.innerHTML = `<i class="fas fa-globe"></i> <a href="${placeData.website}" target="_blank">Visit Website</a>`;
            container.appendChild(websiteElement);
        }
        
        // add the opening hours, if not, use the activity data
        if (placeData && placeData.opening_hours) {
            const hoursElement = document.createElement('div');
            hoursElement.className = 'place-hours';
            
            const hoursTitle = document.createElement('h4');
            hoursTitle.textContent = 'Opening Hours';
            hoursElement.appendChild(hoursTitle);
            
            const hoursStatus = document.createElement('p');
            hoursStatus.className = placeData.opening_hours.isOpen() ? 'open' : 'closed';
            hoursStatus.textContent = placeData.opening_hours.isOpen() ? 'Open now' : 'Closed now';
            hoursElement.appendChild(hoursStatus);
            
            if (placeData.opening_hours.weekday_text) {
                const hoursList = document.createElement('ul');
                placeData.opening_hours.weekday_text.forEach(day => {
                    const hoursItem = document.createElement('li');
                    hoursItem.textContent = day;
                    hoursList.appendChild(hoursItem);
                });
                hoursElement.appendChild(hoursList);
            }
            
            container.appendChild(hoursElement);
        }
        
        // add the activity description, if not, use the activity data
        if (activity.description) {
            const descriptionElement = document.createElement('div');
            descriptionElement.className = 'place-description';
            
            const descTitle = document.createElement('h4');
            descTitle.textContent = 'Activity Description';
            descriptionElement.appendChild(descTitle);
            
            const descText = document.createElement('p');
            descText.textContent = activity.description;
            descriptionElement.appendChild(descText);
            
            container.appendChild(descriptionElement);
        }
        
        // add the activity time, if not, use the activity data
        if (activity.time) {
            const timeElement = document.createElement('p');
            timeElement.className = 'place-time';
            timeElement.innerHTML = `<i class="fas fa-clock"></i> Recommended Visit Time: ${activity.time}`;
            container.appendChild(timeElement);
        }
        
        // add the reviews, only display the real reviews from Google Places API
        if (placeData && placeData.reviews && placeData.reviews.length > 0) {
            const reviewsElement = document.createElement('div');
            reviewsElement.className = 'place-reviews';
            
            const reviewsTitle = document.createElement('h4');
            reviewsTitle.textContent = 'Reviews';
            reviewsElement.appendChild(reviewsTitle);
            
            // create the scroll container
            const reviewsScrollContainer = document.createElement('div');
            reviewsScrollContainer.className = 'reviews-scroll-container';
            
            // display all the reviews
            placeData.reviews.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.className = 'review';
                
                // generate the stars rating HTML
                const starsHtml = Array(review.rating).fill('<i class="fas fa-star"></i>').join('');
                
                reviewElement.innerHTML = `
                    <div class="review-header">
                        <span class="review-author">${review.author_name}</span>
                        <span class="review-rating">
                            ${starsHtml}
                        </span>
                    </div>
                    <p class="review-text">${review.text}</p>
                `;
                
                reviewsScrollContainer.appendChild(reviewElement);
            });
            
            reviewsElement.appendChild(reviewsScrollContainer);
            container.appendChild(reviewsElement);
        }
    }
    
    /**
     * back to the itinerary page
     */
    backToItinerary() {
        // back to the itinerary page
        this.pageLevel = 0;
        
        // display the return modify button
        const backToFormButton = document.getElementById('back-to-form');
        if (backToFormButton) {
            backToFormButton.style.display = 'block';
        }
        
        this.hidePlaceDetails();
    }
    
    /**
     * hide the place details
     */
    hidePlaceDetails() {
        if (this.showInPanel) {
            // hide the details in the panel
            const closeButton = document.getElementById('panel-close-details');
            if (closeButton) {
                closeButton.style.display = 'none';
            }
            
            // restore the original itinerary content
            if (this.itineraryContent && this.originalContent) {
                this.itineraryContent.innerHTML = this.originalContent;
                
                // reinitialize the click event of the activity cards
                const activityCards = this.itineraryContent.querySelectorAll('.activity-card');
                activityCards.forEach((card, index) => {
                    // remove the old click event
                    const newCard = card.cloneNode(true);
                    card.parentNode.replaceChild(newCard, card);
                    
                    // get the current activity data
                    const activities = itineraryService.getCurrentDayActivities();
                    if (activities && activities.length > index) {
                        const activity = activities[index];
                        
                        // re-add the click event
                        newCard.addEventListener('click', () => {
                            placeDetailsService.setDisplayMode(true);
                            placeDetailsService.showPlaceDetails(activity, index);
                            mapService.highlightMarker(index);
                        });
                        
                        // re-add the navigation button click event
                        const navButton = newCard.querySelector('.navigation-button');
                        if (navButton) {
                            navButton.addEventListener('click', (e) => {
                                e.stopPropagation();
                                itineraryService.startNavigation(activity, index);
                            });
                        }
                    }
                });
                
                // clear the saved original content, ensure the next time can save correctly
                this.originalContent = null;
            }
        } else {
            // hide the details in the modal
            const placeDetailsElement = document.getElementById('place-details');
            if (placeDetailsElement) {
                placeDetailsElement.classList.remove('visible');
            }
        }
        
        this.currentPlace = null;
    }
    
    /**
     * switch the details display mode (panel/modal)
     * @param {boolean} showInPanel - whether to display the details in the panel
     */
    setDisplayMode(showInPanel) {
        this.showInPanel = showInPanel;
    }
}

// create the place details service singleton
const placeDetailsService = new PlaceDetailsService(); 

/**
 * initialize the route details function
 * this code will be added to the showNavigationPanel method of map.js
 */
if (typeof MapService !== 'undefined' && MapService.prototype.showNavigationPanel) {
    // save the original showNavigationPanel method
    const originalShowNavigationPanel = MapService.prototype.showNavigationPanel;
    
    // override the showNavigationPanel method
    MapService.prototype.showNavigationPanel = function(result, mode, startLocation, endLocation, startName, endName) {
        // check if the details should be displayed in the left panel
        if (placeDetailsService && placeDetailsService.showInPanel) {
            // use the new implemented dedicated method to display the route details in the left panel
            this.showRouteInLeftPanel(result, mode, startName, endName);
            return;
        }
        
        // call the original method to display the details in the default location
        originalShowNavigationPanel.call(this, result, mode, startLocation, endLocation, startName, endName);
    };
} 