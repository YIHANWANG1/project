/**
 * main application logic - coordinate all services and components
 */

class App {
    constructor() {
        this.mapInitialized = false;
        this.selectedInterests = []; // initialized as an empty array
    }
    
    /**
     * initialize the application
     */
    async init() {
        try {
            console.log('Initializing London Travel Planner...');
            
            // initialize the tag selector
            this.initTagSelector();
            
            // initialize the form submission
            this.initFormSubmit();
            
            // initialize the map
            this.mapInitialized = await mapService.initMap();
            if (!this.mapInitialized) {
                throw new Error('Map initialization failed');
            }
            
            // initialize the itinerary service
            itineraryService.init();
            
            // initialize the place details service
            placeDetailsService.init();
            
            // complete initialization
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            this.showErrorMessage('Failed to initialize application. Please refresh the page and try again.');
        }
    }
    
    /**
     * initialize the tag selector
     */
    initTagSelector() {
        const tagsInput = document.querySelector('.tags-input');
        const tagsDropdown = document.querySelector('.tags-dropdown');
        const tagOptions = document.querySelectorAll('.tag-option');
        const selectedTagsContainer = document.getElementById('selected-interests');
        const hiddenInput = document.getElementById('interests-hidden');
        
        // click the input field to show the dropdown menu
        tagsInput.addEventListener('click', () => {
            tagsDropdown.classList.toggle('active');
        });
        
        // click the tag options
        tagOptions.forEach(option => {
            const value = option.getAttribute('data-value');
            
            option.addEventListener('click', () => {
                const isSelected = option.classList.contains('selected');
                const value = option.getAttribute('data-value');
                const text = option.textContent.trim();
                
                if (isSelected) {
                    // unselect
                    option.classList.remove('selected');
                    this.removeTag(value);
                } else {
                    // calculate the current number of selected interests
                    const interestCount = this.selectedInterests.length;
                    
                    // check if the tag can be added
                    const canAddTag = interestCount < 2;
                    
                    // try to add the tag
                    const added = this.addTag(value, text);
                    
                    // only update the visual state when the tag is successfully added
                    if (added) {
                        option.classList.add('selected');
                    }
                }
                
                // update the hidden input field value
                hiddenInput.value = this.selectedInterests.join(',');
            });
        });
        
        // click other parts of the page to close the dropdown menu
        document.addEventListener('click', (event) => {
            if (!tagsDropdown.contains(event.target) && event.target !== tagsInput) {
                tagsDropdown.classList.remove('active');
            }
        });
    }
    
    /**
     * add a tag
     * @param {string} value - the tag value
     * @param {string} text - the tag display text
     * @returns {boolean} - whether the tag is successfully added
     */
    addTag(value, text) {
        // if the tag is already included, do nothing
        if (this.selectedInterests.includes(value)) {
            return false;
        }
        
        // limit the maximum number of selected interests to 2
        if (this.selectedInterests.length >= 2) {
            // if there are already 2 interests, return false, do not show a warning
            return false;
        }
        
        // add to the selected list
        this.selectedInterests.push(value);
        
        // create a visual tag
        const selectedTagsContainer = document.getElementById('selected-interests');
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.setAttribute('data-value', value);
        tag.innerHTML = `
            ${text}
            <span class="remove-tag">&times;</span>
        `;
        
        // add the event of removing the tag
        const removeBtn = tag.querySelector('.remove-tag');
        removeBtn.addEventListener('click', () => {
            this.removeTag(value);
            
            // update the selected state of the tag options
            const option = document.querySelector(`.tag-option[data-value="${value}"]`);
            if (option) {
                option.classList.remove('selected');
            }
            
            // update the hidden input value
            document.getElementById('interests-hidden').value = this.selectedInterests.join(',');
        });
        
        selectedTagsContainer.appendChild(tag);
        return true;
    }
    
    /**
     * remove a tag
     * @param {string} value - the tag value
     */
    removeTag(value) {
        const index = this.selectedInterests.indexOf(value);
        if (index > -1) {
            this.selectedInterests.splice(index, 1);
            
            const selectedTagsContainer = document.getElementById('selected-interests');
            const tag = selectedTagsContainer.querySelector(`.tag[data-value="${value}"]`);
            if (tag) {
                selectedTagsContainer.removeChild(tag);
            }
        }
    }
    
    /**
     * initialize the form submission
     */
    initFormSubmit() {
        const form = document.getElementById('trip-form');
        if (form) {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                this.handleFormSubmit();
            });
        }
    }
    
    /**
     * handle the form submission
     */
    handleFormSubmit() {
        
        const days = document.getElementById('days').value;
        const budget = document.getElementById('budget').value;
        const transport = document.querySelector('input[name="transport"]:checked').value;
        
        
        let interests = this.selectedInterests;
        if (interests.length === 0) {
            interests = ["general"];
        }
        
        console.log('Form submitted with values:', {
            destination: 'London',
            days,
            interests,
            budget,
            transport
        });
        
        // 生成行程...
    }
    
    /**
     * show the error message
     * @param {string} message - the error message
     */
    showErrorMessage(message) {
        alert(message);  // 简单实现，实际应用中可以使用更友好的提示
    }
}

// 创建应用实例
const app = new App();

// 当文档加载完成时初始化应用
document.addEventListener('DOMContentLoaded', () => {
    app.init();
}); 