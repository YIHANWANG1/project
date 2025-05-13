mapboxgl.accessToken = 'pk.eyJ1IjoiY2FzYS1jaGFvIiwiYSI6ImNtN2d1endoejB6dHIya3I1cXdxNjFlN3cifQ.azeTX61TfwoVQPogEPRmbQ';

// Define London landmarks array with descriptions
const landmarks = [
    {
        name: 'British Museum',
        coordinates: [-0.1270, 51.5194],
        zoom: 17.2,
        pitch: 60,
        bearing: -10,
        description: 'The British Museum is one of the oldest and largest museums in the world, established in 1753, housing about 8 million artifacts that span world cultures and history. Famous collections include the Rosetta Stone, the Elgin Marbles, and Egyptian mummies. The museum attracts about 6 million visitors annually and is one of London\'s most popular free attractions.'
    },
    {
        name: 'National Gallery',
        coordinates: [-0.1281, 51.5086],
        zoom: 17.8,
        pitch: 60,
        bearing: 30,
        description: 'The National Gallery in London is located on the north side of Trafalgar Square and houses over 2,300 paintings from the 13th to 19th centuries. Its treasures include works by Leonardo da Vinci, Van Gogh, Monet, and Rembrandt. Established in 1824, the current building was completed in 1838 and welcomes about 6 million visitors annually, making it one of Europe\'s most important art institutions.'
    },
    {
        name: 'Big Ben',
        coordinates: [-0.125, 51.5002],
        zoom: 17.2,
        pitch: 60,
        bearing: -120,
        description: 'Big Ben is an iconic London landmark located in the clock tower of the Palace of Westminster (Houses of Parliament). The tower stands 96 meters tall and was built in 1859, with its official name being "Elizabeth Tower." Big Ben actually refers to the 13.7-ton Great Bell inside the tower, known for its accurate timekeeping and distinctive chimes. It is one of London\'s most recognizable landmarks and an important part of British cultural heritage.'
    },
    {
        name: 'Westminster Abbey',
        coordinates: [-0.1276, 51.4994],
        zoom: 17.5,
        pitch: 60,
        bearing: 100,
        description: 'Westminster Abbey is a Gothic church in London that dates back to 960 AD, though most of the current structure was built in the 13th century. Since 1066, almost all British monarchs have been crowned here, and it has hosted numerous royal weddings. The Abbey is also the final resting place of many famous figures, including Newton, Darwin, and Dickens. In 1987, it was designated a UNESCO World Heritage Site and symbolizes British history and religious tradition.'
    },
    {
        name: 'London Eye',
        coordinates: [-0.1185, 51.503],
        zoom: 16.6,
        pitch: 62,
        bearing: 130,
        description: 'The London Eye is a famous giant observation wheel located on the South Bank of the Thames. Built in 2000, it stands 135 meters tall and was the world\'s largest Ferris wheel at the time. The London Eye has 32 sealed glass observation pods, each holding up to 25 people, and takes 30 minutes to complete one rotation. It offers 360-degree panoramic views of London with visibility up to 40 kilometers. It\'s one of London\'s most popular paid attractions, receiving over 3.5 million visitors annually.'
    },
    {
        name: 'St. Paul\'s Cathedral',
        coordinates: [-0.0983, 51.5141],
        zoom: 17,
        pitch: 60,
        bearing: 50,
        description: 'St. Paul\'s Cathedral is an Anglican cathedral built between 1675 and 1710 after the Great Fire of London. Designed by Sir Christopher Wren in English Baroque style, its iconic dome dominates London\'s skyline at 111 meters high. The cathedral has hosted many significant events including the funeral of Winston Churchill, the marriage of Prince Charles and Princess Diana, and thanksgiving services for both Queen Elizabeth\'s Silver and Golden Jubilees. Visitors can climb 528 steps to the Golden Gallery for panoramic views of London and explore the Whispering Gallery known for its acoustic properties.'
    },
    {
        name: 'Tower of London',
        coordinates: [-0.0759, 51.5081],
        zoom: 17.5,
        pitch: 60,
        bearing: 25,
        description: 'The Tower of London is a historic castle located on the north bank of the River Thames. Built in 1078 by William the Conqueror, it has served as a royal palace, armory, treasury, prison, and public records office. Today it houses the Crown Jewels of England, including the famous Imperial State Crown and Cullinan Diamond. The Tower is guarded by the Yeomen Warders ("Beefeaters") and is home to ceremonial ravens. As one of London\'s oldest building complexes, it was designated a UNESCO World Heritage Site in 1988.'
    },
    {
        name: 'Buckingham Palace',
        coordinates: [-0.1419, 51.5014],
        zoom: 17.5,
        pitch: 60,
        bearing: -100,
        description: 'Buckingham Palace is the London residence and administrative headquarters of the British monarch, as well as the focal point for royal ceremonies. The palace has 775 rooms, including 19 State rooms. It has served as the primary royal residence since Queen Victoria\'s accession in 1837. The Changing of the Guard ceremony outside the palace is a famous tourist attraction. Parts of the palace are open to the public when the monarch is not in residence. Buckingham Palace symbolizes the British monarchy and is an essential London landmark.'
    },
    {
        name: 'Hyde Park',
        coordinates: [-0.1650, 51.5073],
        zoom: 15,
        pitch: 55,
        bearing: 0,
        description: 'Hyde Park is one of London\'s largest royal parks, covering 142 hectares. Established in 1536 by Henry VIII as a hunting ground, it opened to the public in 1637. The park features the famous Serpentine lake, Speakers\' Corner, and various monuments. Throughout the year, it hosts numerous events including summer concerts, Winter Wonderland, and sporting competitions. Hyde Park is a vital recreational space for Londoners and tourists alike, and forms a core part of London\'s green space system.'
    },
    {
        name: 'Natural History Museum',
        coordinates: [-0.1763, 51.4967],
        zoom: 17.5,
        pitch: 60,
        bearing: 15,
        description: 'The Natural History Museum in London is one of the world\'s most important natural history museums, established in 1881. The museum houses approximately 80 million specimens of animals, plants, minerals, fossils, and rocks. Its most famous exhibits include giant dinosaur skeletons, the blue whale model, and specimens collected by Darwin. The museum is not only a scientific research institution but also an important venue for the public to learn about the natural world, welcoming about 5 million visitors annually and providing valuable educational and research resources for the public and scholars.'
    }
];

// Initialize map with British Museum parameters
const britishMuseum = landmarks[0]; // Get British Museum parameters
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',
    center: britishMuseum.coordinates, // Use British Museum coordinates
    zoom: britishMuseum.zoom, // Use British Museum zoom level
    pitch: britishMuseum.pitch, // Use British Museum pitch
    bearing: britishMuseum.bearing // Use British Museum bearing
});

// Define image-related variables and functions globally (placed after rotationAnimation variable declaration)
let currentIndex = 0;
let tourTimeout = null;
let isPlaying = false;
let rotationAnimation = null; // ID for storing rotation animation

// Add global variables to store animation states
let animationState = {
    // Image-related
    imageAnimationPhase: null, // 'fadeIn', 'waiting', 'fadeOut', 'complete'
    imageTimerId: null,
    imageStartTime: null,
    imageElapsedTime: 0,
    
    // Rotation-related
    rotationStartTime: null,
    rotationElapsedTime: 0,
    rotationStartBearing: 0,
    
    // Navigation-related
    navigationTimerId: null,
    navigationElapsedTime: 0
};

// Modify image-related variable definitions
let imageVisible = false; // Whether to display the image
let mosaicTiles = []; // Mosaic tiles
let mosaicAnimationInProgress = false;
let toggleImageBtn = null;
let imageOverlay = null;
let mosaicContainer = null;

// Add an object to store whether each landmark shows an image
let landmarkImageVisibility = {};

// Initialize image visibility state for each landmark
for (let i = 0; i < landmarks.length; i++) {
    landmarkImageVisibility[i] = false;
}

// Add a global variable to track animation sequence state
let sequenceState = {
    introAnimationComplete: false,
    firstPlayback: true // Add flag to track if this is the first time user clicks play
};

// Add a flag to track if the map is moving
let isMapMoving = false;

// Add a variable to track the current target index
let targetIndex = 0;
let flyInProgress = false;

// Set flag when map starts moving
map.on('movestart', () => {
    isMapMoving = true;
    
    // If image is being displayed, hide it immediately
    if (imageVisible && imageOverlay.style.display === 'block') {
        imageOverlay.style.display = 'none';
    }
});

// Reset flag when map stops moving
map.on('moveend', () => {
    isMapMoving = false;
    
    // If current location is British Museum and image should be shown, display it after map stops moving
    if (currentIndex === 0 && imageVisible && !isPlaying) {
        // Delay showing image a bit to ensure map is completely static
        setTimeout(() => {
            imageOverlay.style.display = 'block';
            createMosaicTiles();
            revealMosaicTiles();
        }, 100);
    }
});

// Function to create mosaic tiles
function createMosaicTiles() {
    // Clear previous tiles
    mosaicContainer.innerHTML = '';
    mosaicTiles = [];
    
    const tilesX = 40;
    const tilesY = 30;
    const tileWidth = 600 / tilesX;
    const tileHeight = 450 / tilesY;
    
    // Create tiles
    for (let y = 0; y < tilesY; y++) {
        for (let x = 0; x < tilesX; x++) {
            const tile = document.createElement('div');
            tile.className = 'mosaic-tile';
            tile.style.width = `${tileWidth}px`;
            tile.style.height = `${tileHeight}px`;
            tile.style.left = `${x * tileWidth}px`;
            tile.style.top = `${y * tileHeight}px`;
            tile.style.backgroundPosition = `-${x * tileWidth}px -${y * tileHeight}px`;
            // Don't set background image here, use CSS variable instead
            
            mosaicContainer.appendChild(tile);
            mosaicTiles.push(tile);
        }
    }
}

// Function to reveal tiles with random order
function revealMosaicTiles(callback) {
    // Shuffle tiles array for random order
    const shuffledTiles = [...mosaicTiles].sort(() => Math.random() - 0.5);
    
    // Reveal tiles one by one
    mosaicAnimationInProgress = true;
    let tileIndex = 0;
    
    // Store interval ID so it can be cancelled
    const revealInterval = setInterval(() => {
        if (tileIndex >= shuffledTiles.length) {
            clearInterval(revealInterval);
            mosaicAnimationInProgress = false;
            if (callback) callback();
            return;
        }
        
        // Show 5 blocks at once to speed up animation
        for (let i = 0; i < 5 && tileIndex < shuffledTiles.length; i++) {
            shuffledTiles[tileIndex].style.opacity = '1';
            tileIndex++;
        }
    }, 10);
    
    // Store this interval so it can be cancelled
    currentMosaicInterval = revealInterval;
}

// Function to hide tiles with random order
function hideMosaicTiles(callback) {
    // Shuffle tiles array for random order
    const shuffledTiles = [...mosaicTiles].sort(() => Math.random() - 0.5);
    
    // Hide tiles one by one
    mosaicAnimationInProgress = true;
    let tileIndex = 0;
    
    const hideInterval = setInterval(() => {
        if (tileIndex >= shuffledTiles.length) {
            clearInterval(hideInterval);
            mosaicAnimationInProgress = false;
            if (callback) callback();
            return;
        }
        
        // Hide 5 blocks at once to speed up animation
        for (let i = 0; i < 5 && tileIndex < shuffledTiles.length; i++) {
            shuffledTiles[tileIndex].style.opacity = '0';
            tileIndex++;
        }
    }, 10); // Faster speed
}

// Function to show image only at British Museum
function updateImageVisibility() {
    // Always show image button regardless of current landmark
    if (toggleImageBtn) {
        toggleImageBtn.style.display = 'flex';
        
        // Update button state based on current landmark's image visibility
        toggleImageBtn.classList.toggle('active', landmarkImageVisibility[currentIndex]);
    }
    
    // Handle image display logic
    const currentlyVisible = landmarkImageVisibility[currentIndex];
    
    if (currentlyVisible && !isMapMoving) {
        // Get corresponding landmark image name with Photo/ prefix
        const imageName = `Photo/${(currentIndex + 1).toString().padStart(2, '0')}.png`;
        
        // Clear container
        mosaicContainer.innerHTML = '';
        
        // Create image element
        const img = document.createElement('img');
        img.className = 'full-image';
        img.src = imageName;
        
        // Add to container
        mosaicContainer.appendChild(img);
        
        // Show image
        imageOverlay.style.display = 'block';
        imageOverlay.style.opacity = '1';
    } else {
        // If map is moving, hide image immediately
        if (isMapMoving && imageOverlay.style.display === 'block') {
            imageOverlay.style.display = 'none';
        }
        // If current landmark shouldn't show image, ensure it's hidden
        else if (!currentlyVisible && imageOverlay.style.display === 'block') {
            imageOverlay.style.opacity = '0';
            
            // Wait for fade-out to complete before hiding
            setTimeout(() => {
                imageOverlay.style.display = 'none';
                mosaicContainer.innerHTML = ''; // Clear container
            }, 1000);
        }
    }
}

// Function to update information box
function updateInfoBox(landmark) {
    const infoTitle = document.getElementById('infoTitle');
    const infoDescription = document.getElementById('infoDescription');
    
    if (infoTitle && infoDescription) {
        // Get current landmark index in the array, add 1, then format as two digits
        const index = landmarks.findIndex(item => item.name === landmark.name);
        const formattedIndex = (index + 1).toString().padStart(2, '0'); // Example: 1 -> "01"
        
        // Add number prefix to title but preserve the toggle button
        const toggleButton = infoTitle.querySelector('.info-box-toggle');
        infoTitle.innerHTML = `${formattedIndex}. ${landmark.name}`;
        
        // Re-add the toggle button if it exists
        if (toggleButton) {
            infoTitle.appendChild(toggleButton);
        }
        
        infoDescription.textContent = landmark.description;
    }
}

// Function for rotating camera around landmark - with smooth consistent speed
function rotateCameraAroundLandmark(coordinates, duration = 4500) {
    const startTime = Date.now();
    const startBearing = map.getBearing();
    const totalRotation = -150; // Counter-clockwise rotation of 150 degrees
    
    // Store rotation initial state for recovery
    animationState.rotationStartTime = startTime;
    animationState.rotationElapsedTime = 0; // Reset rotation elapsed time
    animationState.rotationStartBearing = startBearing;
    
    console.log("Starting new rotation animation, initial angle:", startBearing);
    
    cancelRotationAnimation(); // Cancel any previous rotation animation
    
    function animate() {
        const currentTime = Date.now();
        // Calculate actual elapsed time (including time before pause)
        const elapsedTime = animationState.rotationElapsedTime + (currentTime - animationState.rotationStartTime);
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Use linear interpolation for consistent rotation speed
        const easedProgress = progress;
        
        // Calculate current rotation angle
        const newBearing = animationState.rotationStartBearing + (totalRotation * easedProgress);
        
        map.setBearing(newBearing);
        
        if (progress < 1) {
            rotationAnimation = requestAnimationFrame(animate);
        } else {
            // Rotation complete
            console.log("Rotation animation completed");
            console.log("Current index before navigation: " + currentIndex);
            if (currentIndex + 1 < landmarks.length) {
                console.log("Next landmark should be: " + landmarks[currentIndex + 1].name);
            }
            animationState.rotationElapsedTime = 0;
            rotationAnimation = null;
            
            // Check if current landmark is the last one (Natural History Museum)
            if (currentIndex === landmarks.length - 1) {
                // Stop playback if it's the last landmark
                console.log("Last landmark rotation complete, stopping playback");
                isPlaying = false;
                updateButtonStates();
                
                // After a short delay, navigate back to British Museum with image
                setTimeout(() => {
                    console.log("Automatically returning to British Museum with image");
                    returnToBritishMuseumWithImage();
                }, 1500);
                
                return;
            }
            
            // Only fly to next landmark if in playing state
            if (isPlaying) {
                console.log("Rotation ended, immediately flying to next landmark");
                
                // Ensure navigation to the correct next landmark
                let nextIndex = (currentIndex + 1) % landmarks.length;
                
                // If current landmark is British Museum (index 0), specifically navigate to National Gallery (index 1)
                if (currentIndex === 0) { // If it's British Museum
                    nextIndex = 1; // Force set to National Gallery
                    console.log("Forcing navigation to index 1: " + landmarks[1].name);
                }
                
                console.log("Next index calculated: " + nextIndex + " (Should be landmark: " + landmarks[nextIndex].name + ")");
                
                // Ensure currentIndex won't be accidentally modified before navigation
                const targetLandmarkIndex = nextIndex; 
                navigateToIndex(targetLandmarkIndex);
            }
        }
    }
    
    rotationAnimation = requestAnimationFrame(animate);
}

// Function to cancel rotation animation
function cancelRotationAnimation() {
    if (rotationAnimation) {
        cancelAnimationFrame(rotationAnimation);
        rotationAnimation = null;
    }
}

// Function to update landmark name display
function updateLandmarkName(landmarkName) {
    const landmarkNameElement = document.getElementById('currentLandmark');
    if (landmarkNameElement) {
        landmarkNameElement.innerHTML = `London Top 10 Sites <span class="divider">|</span> ${landmarkName}`;
    }
}

// Animation transition function
function flyToNextLandmark(index = null) {
    // Cancel current rotation animation
    cancelRotationAnimation();
    
    // Clear previous timer
    if (tourTimeout) {
        clearTimeout(tourTimeout);
        tourTimeout = null;
    }
    
    // Calculate index to navigate to
    let nextIndex = index;
    if (nextIndex === null) {
        nextIndex = currentIndex + 1;
    }
    
    if (nextIndex >= landmarks.length) {
        nextIndex = 0;
    }
    
    if (nextIndex < 0) {
        nextIndex = landmarks.length - 1;
    }
    
    // Check if we're going from British Museum to last landmark
    const isBritishMuseumToLastLandmark = (currentIndex === 0 && nextIndex === landmarks.length - 1);
    
    // Use unified navigation function with appropriate flag
    navigateToIndex(nextIndex, isBritishMuseumToLastLandmark);
    
    // If resetting to first landmark, also reset sequence state
    if (nextIndex === 0) {
        sequenceState.introAnimationComplete = false;
    }
}

function updateButtonStates() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    
    if (playPauseBtn) {
        // Only update play/pause button icon
        playPauseBtn.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    }
}

// Modified togglePlayPause function
function togglePlayPause() {
    // Update playback state
    isPlaying = !isPlaying;
    updateButtonStates();

    if (isPlaying) {
        // Check if this is the first playback since page load
        if (sequenceState.firstPlayback) {
            // Check if current view is one of the known landmarks (except British Museum)
            const currentLandmarkIndex = getCurrentLandmarkIndex();
            console.log("First time playback detected, current landmark index:", currentLandmarkIndex);
            
            sequenceState.firstPlayback = false; // Mark that first playback has been handled
            
            // If we're at one of the known landmarks (not British Museum), start from there
            if (currentLandmarkIndex > 0) {
                console.log("Starting playback from current landmark:", landmarks[currentLandmarkIndex].name);
                
                // Cancel any active animations
                cancelRotationAnimation();
                if (tourTimeout) {
                    clearTimeout(tourTimeout);
                    tourTimeout = null;
                }
                
                // Reset animation state
                resetAnimationState();
                
                // Set currentIndex to the current landmark
                currentIndex = currentLandmarkIndex;
                
                // Update UI
                updateLandmarkName(landmarks[currentIndex].name);
                updateInfoBox(landmarks[currentIndex]);
                
                // Start playing from current landmark
                const landmark = landmarks[currentIndex];
                
                // Set current landmark image to visible
                landmarkImageVisibility[currentIndex] = true;
                if (toggleImageBtn) toggleImageBtn.classList.add('active');
                
                // Display image and start sequence for current landmark
                displayImageWithPhases(currentIndex, () => {
                    // Start landmark sequence after image animation completes
                    startLandmarkSequence(landmark);
                });
                
                return;
            }
            
            // If not at a known landmark or at British Museum, use the original behavior
            // to reset to British Museum
            console.log("Not at a known landmark or at British Museum, resetting to British Museum view");
            
            // Cancel any active animations
            cancelRotationAnimation();
            if (tourTimeout) {
                clearTimeout(tourTimeout);
                tourTimeout = null;
            }
            
            // Reset animation state
            resetAnimationState();
            
            // Force navigation to British Museum with its initial parameters
            map.flyTo({
                center: landmarks[0].coordinates,
                zoom: landmarks[0].zoom,
                pitch: landmarks[0].pitch,
                bearing: landmarks[0].bearing,
                duration: 2000,
                essential: true
            });
            
            // Set currentIndex to British Museum
            currentIndex = 0;
            
            // Update UI
            updateLandmarkName(landmarks[0].name);
            updateInfoBox(landmarks[0]);
            
            // Wait for flyTo to complete before starting the sequence
            map.once('moveend', () => {
                console.log("Moved to British Museum initial view, starting sequence");
                startBritishMuseumSequence();
            });
            
            return;
        }
        
        // Resume playing state for subsequent play clicks
        const landmark = landmarks[currentIndex];
        
        // Update landmark name and information
        updateLandmarkName(landmark.name);
        updateInfoBox(landmark);
        
        console.log("Resuming play state, image phase:", animationState.imageAnimationPhase, ", rotation time:", animationState.rotationElapsedTime, "ms, navigation time:", animationState.navigationElapsedTime, "ms");
        
        // Resume paused animation state
        if (animationState.imageAnimationPhase === 'fadeIn') {
            // Resume image fade-in animation
            displayImageWithResume(currentIndex, 'fadeIn');
        } else if (animationState.imageAnimationPhase === 'waiting') {
            // Resume waiting state
            displayImageWithResume(currentIndex, 'waiting');
        } else if (animationState.imageAnimationPhase === 'fadeOut') {
            // Resume image fade-out animation
            displayImageWithResume(currentIndex, 'fadeOut');
        } else if (animationState.rotationElapsedTime > 0) {
            // Resume rotation animation
            resumeRotationAnimation(landmark.coordinates, 4500);
        } else if (animationState.navigationElapsedTime > 0) {
            // Resume navigation timer
            const remainingNavTime = Math.max(0, 5000 - animationState.navigationElapsedTime);
            console.log("Resuming navigation timer, remaining time:", remainingNavTime, "ms");
            
            tourTimeout = setTimeout(() => {
                // Ensure navigation to the correct next landmark
                let nextIndex = (currentIndex + 1) % landmarks.length;
                
                // If current landmark is British Museum (index 0), specifically navigate to National Gallery (index 1)
                if (currentIndex === 0) { // If it's British Museum
                    nextIndex = 1; // Force set to National Gallery
                    console.log("togglePlayPause resuming navigation timer, forcing navigation to index 1: " + landmarks[1].name);
                }
                
                console.log("Navigation timer resumed and triggered, next index: " + nextIndex);
                navigateToIndex(nextIndex);
            }, remainingNavTime);
            
            // Reset navigation timing
            animationState.navigationElapsedTime = 0;
        } else {
            // Start new animation sequence from beginning
            if (currentIndex === 0) {
                // Special handling for British Museum
                startBritishMuseumSequence();
            } else {
                // Other landmarks - start with displaying image
                // Set current landmark image to visible
                landmarkImageVisibility[currentIndex] = true;
                if (toggleImageBtn) toggleImageBtn.classList.add('active');
                
                // Display image and set complete callback for other landmarks
                displayImageWithPhases(currentIndex, () => {
                    // Start landmark sequence after image animation completes
                    startLandmarkSequence(landmark);
                });
            }
        }
    } else {
        // Pause state handling
        pauseAllAnimations();
    }
}

// Helper function to determine if we're at a known landmark
function getCurrentLandmarkIndex() {
    // Get current map center
    const currentCenter = map.getCenter();
    const currentLat = currentCenter.lat;
    const currentLng = currentCenter.lng;
    
    // Check each landmark to see if we're close to it
    for (let i = 0; i < landmarks.length; i++) {
        const landmark = landmarks[i];
        const landmarkLat = landmark.coordinates[1];
        const landmarkLng = landmark.coordinates[0];
        
        // Calculate distance between current position and landmark
        const distance = Math.sqrt(
            Math.pow(currentLat - landmarkLat, 2) + 
            Math.pow(currentLng - landmarkLng, 2)
        );
        
        // If close enough to a landmark (threshold can be adjusted)
        if (distance < 0.002) { // Approximately 200 meters
            console.log("Detected we are at landmark:", landmark.name, "with distance:", distance);
            return i;
        }
    }
    
    // Not at a known landmark
    return -1;
}

// Pause all animations and timers
function pauseAllAnimations() {
    // Pause rotation animation
    if (rotationAnimation) {
        cancelAnimationFrame(rotationAnimation);
        rotationAnimation = null;
        // Record rotation time elapsed
        if (animationState.rotationStartTime) {
            animationState.rotationElapsedTime += (Date.now() - animationState.rotationStartTime);
        }
    }
    
    // Pause image animation timer
    if (animationState.imageTimerId) {
        clearTimeout(animationState.imageTimerId);
        animationState.imageTimerId = null;
        // Record elapsed time
        if (animationState.imageStartTime) {
            animationState.imageElapsedTime += (Date.now() - animationState.imageStartTime);
        }
    }
    
    // Pause navigation timer
    if (tourTimeout) {
        clearTimeout(tourTimeout);
        tourTimeout = null;
        // Record navigation time
        if (animationState.rotationStartTime) {
            animationState.navigationElapsedTime += (Date.now() - animationState.rotationStartTime);
        }
    }
    
    // Pause mosaic animation
    clearMosaicAnimations();
    
    console.log("All animations paused, rotation time elapsed:", animationState.rotationElapsedTime, "ms");
}

// Resume rotation animation
function resumeRotationAnimation(coordinates, duration) {
    // Update rotation start time to current time
    animationState.rotationStartTime = Date.now();
    
    // Get current bearing angle as starting point
    const currentBearing = map.getBearing();
    animationState.rotationStartBearing = currentBearing;
    
    // Start rotation animation, keeping total duration constant but subtracting elapsed time
    const remainingDuration = Math.max(0, duration - animationState.rotationElapsedTime);
    console.log("Resuming rotation, remaining time:", remainingDuration, "ms, rotation time elapsed:", animationState.rotationElapsedTime, "ms");
    
    // If there's remaining time, continue rotation
    if (remainingDuration > 0) {
        // Calculate completed proportion of total rotation angle
        const totalRotation = -150; // Total rotation angle
        const progressMade = animationState.rotationElapsedTime / duration;
        const remainingRotation = totalRotation * (1 - progressMade);
        
        // Use custom rotation function, only rotate remaining angle
        customRotateCamera(coordinates, remainingDuration, remainingRotation);
    } else {
        // If rotation is complete, immediately navigate to next landmark
        animationState.rotationElapsedTime = 0;
        console.log("Rotation completed, immediately navigating to next landmark");
        
        // Ensure navigation to the correct next landmark
        let nextIndex = (currentIndex + 1) % landmarks.length;
        
        // If current landmark is British Museum (index 0), specifically navigate to National Gallery (index 1)
        if (currentIndex === 0) { // If it's British Museum
            nextIndex = 1; // Force set to National Gallery
            console.log("Forcing navigation to index 1: " + landmarks[1].name);
        }
        
        console.log("Next index calculated in resumeRotationAnimation: " + nextIndex);
        navigateToIndex(nextIndex);
    }
}

// Custom rotation function supporting specified remaining rotation angle
function customRotateCamera(coordinates, duration, remainingRotation) {
    const startTime = Date.now();
    const startBearing = map.getBearing();
    
    // Store rotation start state for recovery
    animationState.rotationStartTime = startTime;
    
    cancelRotationAnimation(); // Cancel any previous rotation animation
    
    function animate() {
        const currentTime = Date.now();
        // Calculate current animation elapsed time
        const currentElapsedTime = currentTime - startTime;
        const progress = Math.min(currentElapsedTime / duration, 1);
        
        // Use linear interpolation for consistent rotation speed
        const easedProgress = progress;
        
        // Calculate current rotation angle (only considering remaining rotation)
        const newBearing = startBearing + (remainingRotation * easedProgress);
        
        map.setBearing(newBearing);
        
        if (progress < 1) {
            rotationAnimation = requestAnimationFrame(animate);
        } else {
            // Rotation complete
            console.log("Rotation animation completed in customRotateCamera");
            console.log("Current index in customRotateCamera: " + currentIndex);
            animationState.rotationElapsedTime = 0;
            rotationAnimation = null;
            
            // Check if current landmark is the last one (Natural History Museum)
            if (currentIndex === landmarks.length - 1) {
                // Stop playback if it's the last landmark
                console.log("Last landmark rotation complete in customRotateCamera, stopping playback");
                isPlaying = false;
                updateButtonStates();
                
                // After a short delay, navigate back to British Museum with image
                setTimeout(() => {
                    console.log("Automatically returning to British Museum with image from customRotateCamera");
                    returnToBritishMuseumWithImage();
                }, 1500);
                
                return;
            }
            
            // Only fly to next landmark if in playing state
            if (isPlaying) {
                console.log("Rotation ended in customRotateCamera, immediately flying to next landmark");
                
                // Ensure navigation to the correct next landmark
                let nextIndex = (currentIndex + 1) % landmarks.length;
                
                // If current landmark is British Museum (index 0), specifically navigate to National Gallery (index 1)
                if (currentIndex === 0) { // If it's British Museum
                    nextIndex = 1; // Force set to National Gallery
                    console.log("Forcing navigation to index 1 (in customRotateCamera): " + landmarks[1].name);
                }
                
                console.log("Next index calculated in customRotateCamera: " + nextIndex + " (Should be landmark: " + landmarks[nextIndex].name + ")");
                
                // Ensure currentIndex won't be accidentally modified before navigation
                const targetLandmarkIndex = nextIndex; 
                navigateToIndex(targetLandmarkIndex);
            }
        }
    }
    
    rotationAnimation = requestAnimationFrame(animate);
}

// British Museum sequence
function startBritishMuseumSequence() {
    // Reset animation state
    resetAnimationState();
    
    // Show image
    landmarkImageVisibility[0] = true;
    if (toggleImageBtn) toggleImageBtn.classList.add('active');
    
    displayImageWithPhases(0, () => {
        // Start rotation after image sequence completes
        sequenceState.introAnimationComplete = true;
        rotateCameraAroundLandmark(landmarks[0].coordinates, 4500);
        
        // Set navigation timer
        animationState.rotationStartTime = Date.now();
        tourTimeout = setTimeout(() => {
            // For British Museum, force the next destination to be National Gallery
            console.log("British Museum navigation timer triggered, forcing navigation to National Gallery");
            navigateToIndex(1); // Force navigation to National Gallery
        }, 5000);
    });
}

// Other landmarks sequence
function startLandmarkSequence(landmark) {
    // Reset animation state
    resetAnimationState();
    
    if (rotationAnimation === null) {
        console.log('Starting rotation for current landmark');
        rotateCameraAroundLandmark(landmark.coordinates, 4500);
        
        // Set navigation timer
        animationState.rotationStartTime = Date.now();
        tourTimeout = setTimeout(() => {
            // Ensure navigation to the correct next landmark
            let nextIndex = (currentIndex + 1) % landmarks.length;
            
            // If current landmark is British Museum (index 0), specifically navigate to National Gallery (index 1)
            if (currentIndex === 0) { // If it's British Museum
                nextIndex = 1; // Force set to National Gallery
                console.log("Forcing navigation to index 1 (in startLandmarkSequence timer): " + landmarks[1].name);
            }
            
            console.log("Navigation timer triggered, next index: " + nextIndex);
            navigateToIndex(nextIndex);
        }, 5000);
    } else {
        navigateToIndex(currentIndex);
    }
}

// Reset animation state
function resetAnimationState() {
    animationState.imageAnimationPhase = null;
    animationState.imageTimerId = null;
    animationState.imageStartTime = null;
    animationState.imageElapsedTime = 0;
    animationState.rotationStartTime = null;
    animationState.rotationElapsedTime = 0;
    animationState.rotationStartBearing = 0;
    animationState.navigationTimerId = null;
    animationState.navigationElapsedTime = 0;
}

// Display image using phases
function displayImageWithPhases(index, onComplete) {
    // Get image path
    const imageName = `Photo/${(index + 1).toString().padStart(2, '0')}.png`;
    
    // Clear container
    mosaicContainer.innerHTML = '';
    
    // Create image element
    const img = document.createElement('img');
    img.className = 'full-image';
    img.src = imageName;
    
    // Add to container
    mosaicContainer.appendChild(img);
    
    // Show container and set fade-in effect
    imageOverlay.style.display = 'block';
    imageOverlay.style.opacity = '0';
    
    // Set phase to fade-in
    animationState.imageAnimationPhase = 'fadeIn';
    animationState.imageStartTime = Date.now();
    
    // Trigger fade-in animation
    setTimeout(() => {
        imageOverlay.style.transition = 'opacity 1s ease-in-out';
        imageOverlay.style.opacity = '1';
        
        // Set waiting time
        animationState.imageTimerId = setTimeout(() => {
            // Set phase to waiting
            animationState.imageAnimationPhase = 'waiting';
            animationState.imageStartTime = Date.now();
            
            // Start fade-out
            animationState.imageTimerId = setTimeout(() => {
                // Set phase to fade-out
                animationState.imageAnimationPhase = 'fadeOut';
                animationState.imageStartTime = Date.now();
                
                // Fade out image
                imageOverlay.style.transition = 'opacity 2s ease-in-out';
                imageOverlay.style.opacity = '0';
                
                // Wait for fade-out to complete
                animationState.imageTimerId = setTimeout(() => {
                    // Hide image
                    imageOverlay.style.display = 'none';
                    landmarkImageVisibility[index] = false;
                    if (toggleImageBtn) toggleImageBtn.classList.remove('active');
                    
                    // Set phase to complete
                    animationState.imageAnimationPhase = 'complete';
                    
                    console.log("Image animation ended, starting rotation");
                    
                    // Execute completion callback, ensure rotation animation starts after image animation completely ends
                    if (onComplete) onComplete();
                }, 2000);
            }, 2000);
        }, 1000);
    }, 10);
}

// Resume displaying image
function displayImageWithResume(index, phase) {
    // Get image path
    const imageName = `Photo/${(index + 1).toString().padStart(2, '0')}.png`;
    
    // Clear container
    mosaicContainer.innerHTML = '';
    
    // Create image element
    const img = document.createElement('img');
    img.className = 'full-image';
    img.src = imageName;
    
    // Add to container
    mosaicContainer.appendChild(img);
    
    // Resume different states based on phase
    if (phase === 'fadeIn') {
        // Resume fade-in state
        imageOverlay.style.display = 'block';
        imageOverlay.style.transition = 'opacity 1s ease-in-out';
        imageOverlay.style.opacity = '1';
        
        // Set waiting timer, subtracting elapsed time
        const remainingTime = Math.max(0, 1000 - animationState.imageElapsedTime);
        animationState.imageTimerId = setTimeout(() => {
            // Enter waiting phase
            animationState.imageAnimationPhase = 'waiting';
            animationState.imageStartTime = Date.now();
            animationState.imageElapsedTime = 0;
            
            // Set fade-out timer
            animationState.imageTimerId = setTimeout(() => {
                startFadeOutSequence(index);
            }, 2000);
        }, remainingTime);
    } else if (phase === 'waiting') {
        // Resume waiting state
        imageOverlay.style.display = 'block';
        imageOverlay.style.opacity = '1';
        
        // Calculate remaining waiting time
        const remainingTime = Math.max(0, 2000 - animationState.imageElapsedTime);
        animationState.imageTimerId = setTimeout(() => {
            startFadeOutSequence(index);
        }, remainingTime);
    } else if (phase === 'fadeOut') {
        // Resume fade-out state
        imageOverlay.style.display = 'block';
        imageOverlay.style.transition = 'opacity 2s ease-in-out';
        imageOverlay.style.opacity = '0';
        
        // Calculate remaining fade-out time
        const remainingTime = Math.max(0, 2000 - animationState.imageElapsedTime);
        animationState.imageTimerId = setTimeout(() => {
            // Hide image
            imageOverlay.style.display = 'none';
            landmarkImageVisibility[index] = false;
            if (toggleImageBtn) toggleImageBtn.classList.remove('active');
            
            // Set phase to complete
            animationState.imageAnimationPhase = 'complete';
            
            console.log("Image fade-out complete, starting rotation");
            
            // Start rotation animation - only after image completely fades out
            const landmark = landmarks[currentIndex];
            rotateCameraAroundLandmark(landmark.coordinates, 4500);
        }, remainingTime);
    }
}

// Start fade-out sequence
function startFadeOutSequence(index) {
    // Set phase to fade-out
    animationState.imageAnimationPhase = 'fadeOut';
    animationState.imageStartTime = Date.now();
    animationState.imageElapsedTime = 0;
    
    // Fade out image
    imageOverlay.style.transition = 'opacity 2s ease-in-out';
    imageOverlay.style.opacity = '0';
    
    // Wait for fade-out to complete
    animationState.imageTimerId = setTimeout(() => {
        // Hide image
        imageOverlay.style.display = 'none';
        landmarkImageVisibility[index] = false;
        if (toggleImageBtn) toggleImageBtn.classList.remove('active');
        
        // Set phase to complete
        animationState.imageAnimationPhase = 'complete';
        
        console.log("Image fade-out complete, starting rotation");
        
        // Start rotation animation - ensure rotation starts only after image completely fades out
        const landmark = landmarks[currentIndex];
        rotateCameraAroundLandmark(landmark.coordinates, 4500);
    }, 2000);
}

// Modified navigation function
function goToNext() {
    // Immediately hide any displayed image
    if (imageOverlay && imageOverlay.style.display === 'block') {
        imageVisible = false;
        if (toggleImageBtn) toggleImageBtn.classList.remove('active');
        imageOverlay.style.display = 'none';
        clearMosaicAnimations();
    }
    
    // Cancel current rotation and timer
    cancelRotationAnimation(); 
    if (tourTimeout) {
        clearTimeout(tourTimeout);
        tourTimeout = null;
    }
    
    // Calculate next index
    let nextIndex = currentIndex + 1;
    if (nextIndex >= landmarks.length) {
        nextIndex = 0;
    }
    
    // Set target index and execute flight
    navigateToIndex(nextIndex);
}

function goToPrevious() {
    // Immediately hide any displayed image
    if (imageOverlay && imageOverlay.style.display === 'block') {
        imageVisible = false;
        if (toggleImageBtn) toggleImageBtn.classList.remove('active');
        imageOverlay.style.display = 'none';
        clearMosaicAnimations();
    }
    
    // Cancel current rotation and timer
    cancelRotationAnimation();
    if (tourTimeout) {
        clearTimeout(tourTimeout);
        tourTimeout = null;
    }
    
    // Calculate previous index
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
        prevIndex = landmarks.length - 1;
    }
    
    console.log("Going to previous landmark, current:", currentIndex, "target:", prevIndex);
    
    // Special handling: Allow navigation from British Museum to Natural History Museum
    // by explicitly setting a flag
    const isBritishMuseumToLastLandmark = (currentIndex === 0 && prevIndex === landmarks.length - 1);
    
    // Set target index and execute flight, with special flag if needed
    navigateToIndex(prevIndex, isBritishMuseumToLastLandmark);
}

// New unified navigation function, ensuring flight to correct target
function navigateToIndex(index, allowBritishMuseumToLastLandmark = false) {
    // Add more debug information
    console.log("navigateToIndex was called, target index:", index);
    
    // Ensure index value is within valid range
    if (index < 0 || index >= landmarks.length) {
        console.error("Invalid index:", index);
        index = 0; // Default back to British Museum
    }
    
    // Only enforce British Museum -> National Gallery rule when navigating FROM British Museum
    // BUT allow exception when explicitly requested (for previous button)
    if (currentIndex === 0 && index !== 1 && index !== 0 && isPlaying && !allowBritishMuseumToLastLandmark) {
        console.warn("Detected attempt to navigate from British Museum to non-National Gallery during playback, forcing correction to National Gallery");
        index = 1; // Force ensure that from British Museum can only go to National Gallery during playback
    }
    
    // Save target index
    targetIndex = index;
    console.log("navigateToIndex processed index: " + index + " (Landmark: " + landmarks[index].name + ")");
    
    // Cancel any moveend listener for in-progress flight
    map.off('moveend', onNavigationComplete);
    
    // If an image is displayed, hide it first
    if (imageOverlay && imageOverlay.style.display === 'block') {
        // Note we don't change visibility state here, just temporarily hide
        imageOverlay.style.display = 'none';
        clearMosaicAnimations();
    }
    
    // Update UI with target location info
    currentIndex = index;
    const landmark = landmarks[currentIndex];
    updateLandmarkName(landmark.name);
    updateInfoBox(landmark);
    
    console.log(`Navigating to: ${landmark.name} (index ${index})`);
    
    // Mark flight as started
    flyInProgress = true;
    
    // Execute flight action
    map.flyTo({
        center: landmark.coordinates,
        zoom: landmark.zoom,
        pitch: landmark.pitch,
        bearing: landmark.bearing,
        duration: 3500,
        essential: true,
        easing: function(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }
    });
    
    // Add one-time moveend event listener
    map.once('moveend', onNavigationComplete);
}

// Modified onNavigationComplete function, ensuring all landmarks have same image fade in/out flow
function onNavigationComplete() {
    console.log(`Flight completed, current location: ${landmarks[currentIndex].name} (index ${currentIndex})`);
    
    // Confirm current index matches targetIndex
    if (currentIndex !== targetIndex) {
        console.error("Index mismatch! currentIndex:", currentIndex, "targetIndex:", targetIndex);
        // Fix current index
        currentIndex = targetIndex;
    }
    
    // Mark flight as ended
    flyInProgress = false;
    
    // If playing, display image and start sequence
    if (isPlaying) {
        // Set current landmark image to visible
        landmarkImageVisibility[currentIndex] = true;
        if (toggleImageBtn) toggleImageBtn.classList.add('active');
        
        // Handle British Museum specially
        if (currentIndex === 0) {
            console.log("Navigation complete to British Museum, starting sequence");
            startBritishMuseumSequence();
        } else {
            // Display image and set complete callback for other landmarks
        displayImageWithPhases(currentIndex, () => {
            // Only start rotation after image animation completes
            // If still playing, start rotation
            if (isPlaying) {
                // Start rotation animation
                    console.log("Starting rotation for: " + landmarks[currentIndex].name);
                rotateCameraAroundLandmark(landmarks[currentIndex].coordinates, 4500);
            }
        });
        }
    }
}

// Add style loading error handling
map.on('error', (e) => {
    console.error('Map loading error:', e);
});

// Handle missing icons
map.on('styleimagemissing', (e) => {
    console.log('Missing icon:', e.id);
});

// Add function to toggle info box
function toggleInfoBox(event) {
    // Prevent event bubbling if clicked on the button
    if (event) {
        event.stopPropagation();
    }
    
    const infoBox = document.getElementById('infoBox');
    if (infoBox) {
        infoBox.classList.toggle('collapsed');
    }
}

// Set lighting after style is fully loaded
map.on('style.load', () => {
    console.log('Base style loading complete');
    
    // Hide all vegetation layers and label layers
    const layers = map.getStyle().layers;
    for (const layer of layers) {
        // Hide vegetation layers
        if (layer.id.includes('vegetation') || layer.id.includes('tree') || layer.id.includes('wood')) {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
        
        // Hide all label layers
        if (layer.id.includes('label') || layer.id.includes('text') || layer.id.includes('place') || 
            layer.id.includes('poi') || layer.id.includes('road') || layer.id.includes('transit')) {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
    }
    
    // Disable all label display configuration properties
    map.setConfigProperty('basemap', 'showPlaceLabels', false);
    map.setConfigProperty('basemap', 'showPointOfInterestLabels', false);
    map.setConfigProperty('basemap', 'showRoadLabels', false);
    map.setConfigProperty('basemap', 'showTransitLabels', false);
    
    // Set maximum brightness
    map.setConfigProperty('basemap', 'lightIntensity', 1.0);
    map.setConfigProperty('basemap', 'ambientIntensity', 1.0);
    map.setConfigProperty('basemap', 'lightPreset', 'day');

    // Add white fog layer
    map.addSource('fog-overlay', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'Polygon',
                'coordinates': [[
                    [-180, -90],
                    [180, -90],
                    [180, 90],
                    [-180, 90],
                    [-180, -90]
                ]]
            }
        }
    });

    map.addLayer({
        'id': 'fog-layer',
        'type': 'fill',
        'source': 'fog-overlay',
        'paint': {
            'fill-color': '#ffffff',
            'fill-opacity': 0.05
        }
    });

    // Create control buttons container
    const controls = document.createElement('div');
    controls.className = 'controls';

    // Add previous button
    const prevBtn = document.createElement('button');
    prevBtn.id = 'prevBtn';
    prevBtn.className = 'control-button';
    prevBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
    prevBtn.title = 'Previous Landmark';
    prevBtn.addEventListener('click', goToPrevious);

    // Add next button
    const nextBtn = document.createElement('button');
    nextBtn.id = 'nextBtn';
    nextBtn.className = 'control-button';
    nextBtn.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';
    nextBtn.title = 'Next Landmark';
    nextBtn.addEventListener('click', goToNext);
    
    // Create image toggle button, add to control area
    const imgBtn = document.createElement('button');
    imgBtn.id = 'toggleImageBtn';
    imgBtn.className = 'control-button';
    imgBtn.innerHTML = '<i class="fa-solid fa-image"></i>';
    imgBtn.title = 'Toggle Image';
    imgBtn.addEventListener('click', toggleImage); // Use new toggleImage function
    
    // Create play/pause button
    const playPauseBtn = document.createElement('button');
    playPauseBtn.id = 'playPauseBtn';
    playPauseBtn.className = 'control-button';
    playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    playPauseBtn.title = 'Play/Pause';
    playPauseBtn.addEventListener('click', togglePlayPause);

    // Create reset button, add to control area
    const resetBtn = document.createElement('button');
    resetBtn.id = 'resetBtn';
    resetBtn.className = 'control-button';
    resetBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
    resetBtn.title = 'Reset to British Museum';
    resetBtn.addEventListener('click', resetToStart);

    // Add buttons in new order: left, right, image, play/pause, reset
    controls.appendChild(prevBtn);
    controls.appendChild(nextBtn);
    controls.appendChild(imgBtn); // Add image button to control area
    controls.appendChild(playPauseBtn);
    controls.appendChild(resetBtn); // Add reset button to control area
    document.body.appendChild(controls);
    
    // Set image button reference to newly created button
    toggleImageBtn = imgBtn;

    updateButtonStates();

    // Initialize first landmark name display
    const landmarkNameElement = document.getElementById('currentLandmark');
    if (landmarkNameElement) {
        landmarkNameElement.innerHTML = `London Top 10 Sites <span class="divider">|</span> ${landmarks[0].name}`;
    }

    // Set up info box toggle functionality
    const infoBox = document.getElementById('infoBox');
    const infoTitle = document.getElementById('infoTitle');
    const toggleBtn = document.querySelector('.info-box-toggle');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleInfoBox);
    }
    
    if (infoTitle) {
        infoTitle.addEventListener('click', toggleInfoBox);
    }

    // Initialize information box
    updateInfoBox(landmarks[0]);

    // Initialize image visibility
    updateImageVisibility();

    // Get DOM element references
    imageOverlay = document.getElementById('imageOverlay');
    mosaicContainer = document.getElementById('mosaicContainer');
});

// Function to cancel mosaic animations
let currentMosaicInterval = null;
let currentMosaicTimeout = null;

function clearMosaicAnimations() {
    if (currentMosaicInterval) {
        clearInterval(currentMosaicInterval);
        currentMosaicInterval = null;
    }
    
    if (currentMosaicTimeout) {
        clearTimeout(currentMosaicTimeout);
        currentMosaicTimeout = null;
    }
    
    mosaicAnimationInProgress = false;
}

// Reset sequence state when resetting tour
function resetTour() {
    currentIndex = 0;
    sequenceState.introAnimationComplete = false;
    // Other reset logic...
}

// Add DOMContentLoaded event listener to ensure document is fully loaded before initialization
document.addEventListener('DOMContentLoaded', () => {
    // Here we can get initial DOM elements, but don't use them before style.load event
    // because map is not fully loaded yet
    imageOverlay = document.getElementById('imageOverlay');
    mosaicContainer = document.getElementById('mosaicContainer');
});

// Modify function to update image source using Photo folder
function updateDirectImageSource(index) {
    // Get corresponding landmark image name with Photo/ prefix
    const imageName = `Photo/${(index + 1).toString().padStart(2, '0')}.png`;
    
    // Clear container
    mosaicContainer.innerHTML = '';
    
    // Create full-screen image element
    const fullImage = document.createElement('img');
    fullImage.className = 'full-image';
    fullImage.src = imageName;
    
    // Add to container
    mosaicContainer.appendChild(fullImage);
}

// Modify toggleImage function image path
function toggleImage() {
    // Only respond to click when map is not moving
    if (!isMapMoving) {
        // Get current visibility state
        const isCurrentlyVisible = landmarkImageVisibility[currentIndex];
        
        // Toggle current landmark's image visibility
        landmarkImageVisibility[currentIndex] = !isCurrentlyVisible;
        
        // Update button state
        toggleImageBtn.classList.toggle('active', !isCurrentlyVisible);
        
        // Get corresponding landmark image name
        const imageName = `Photo/${(currentIndex + 1).toString().padStart(2, '0')}.png`;
        
        if (!isCurrentlyVisible) {
            // Show image - direct display with fade-in
            
            // Clear container
            mosaicContainer.innerHTML = '';
            
            // Create image element
            const img = document.createElement('img');
            img.className = 'full-image';
            img.src = imageName;
            
            // Add to container
            mosaicContainer.appendChild(img);
            
            // Show container and set fade-in effect
            imageOverlay.style.display = 'block';
            imageOverlay.style.opacity = '0';
            
            // Trigger reflow then set transition effect and modify opacity
            setTimeout(() => {
                imageOverlay.style.transition = 'opacity 1s ease-in-out';
                imageOverlay.style.opacity = '1';
            }, 10);
        } else {
            // Hide image - fade-out effect
            imageOverlay.style.transition = 'opacity 1s ease-in-out';
            imageOverlay.style.opacity = '0';
            
            // Wait for fade-out to complete before hiding
            setTimeout(() => {
                imageOverlay.style.display = 'none';
                mosaicContainer.innerHTML = ''; // Clear container
            }, 1000);
        }
    }
}

// Add new reset function
function resetToStart() {
    console.log("Resetting to British Museum initial view");
    
    // Cancel all ongoing animations and timers
    cancelRotationAnimation();
    if (tourTimeout) {
        clearTimeout(tourTimeout);
        tourTimeout = null;
    }
    
    // Hide any displayed image
    if (imageOverlay && imageOverlay.style.display === 'block') {
        imageVisible = false;
        if (toggleImageBtn) toggleImageBtn.classList.remove('active');
        imageOverlay.style.display = 'none';
        clearMosaicAnimations();
    }
    
    // Pause playback if currently playing
    if (isPlaying) {
        isPlaying = false;
        updateButtonStates();
    }
    
    // Reset animation and sequence states
    resetAnimationState();
    sequenceState.introAnimationComplete = false;
    sequenceState.firstPlayback = true; // Reset first playback flag
    
    // Navigate to British Museum
    currentIndex = 0;
    
    // Update UI
    updateLandmarkName(landmarks[0].name);
    updateInfoBox(landmarks[0]);
    
    // Fly to British Museum view
    map.flyTo({
        center: landmarks[0].coordinates,
        zoom: landmarks[0].zoom,
        pitch: landmarks[0].pitch,
        bearing: landmarks[0].bearing,
        duration: 2000,
        essential: true
    });
    
    console.log("Reset completed, ready for first playback");
}

// Function to return to British Museum and show image after tour completes
function returnToBritishMuseumWithImage() {
    console.log("Returning to British Museum after tour completion");
    
    // Cancel all ongoing animations and timers
    cancelRotationAnimation();
    if (tourTimeout) {
        clearTimeout(tourTimeout);
        tourTimeout = null;
    }
    
    // Hide any displayed image
    if (imageOverlay && imageOverlay.style.display === 'block') {
        imageVisible = false;
        if (toggleImageBtn) toggleImageBtn.classList.remove('active');
        imageOverlay.style.display = 'none';
        clearMosaicAnimations();
    }
    
    // Reset animation state
    resetAnimationState();
    
    // Navigate to British Museum
    currentIndex = 0;
    
    // Update UI
    updateLandmarkName(landmarks[0].name);
    updateInfoBox(landmarks[0]);
    
    // Fly to British Museum view
    map.flyTo({
        center: landmarks[0].coordinates,
        zoom: landmarks[0].zoom,
        pitch: landmarks[0].pitch,
        bearing: landmarks[0].bearing,
        duration: 2000,
        essential: true
    });
    
    // When flight completes, show British Museum image
    map.once('moveend', () => {
        console.log("Flight to British Museum completed, showing image");
        
        // Set British Museum image visibility to true
        landmarkImageVisibility[0] = true;
        if (toggleImageBtn) toggleImageBtn.classList.add('active');
        
        // Display the image with fade-in effect
        // Get image path
        const imageName = `Photo/${(0 + 1).toString().padStart(2, '0')}.png`;
        
        // Clear container
        mosaicContainer.innerHTML = '';
        
        // Create image element
        const img = document.createElement('img');
        img.className = 'full-image';
        img.src = imageName;
        
        // Add to container
        mosaicContainer.appendChild(img);
        
        // Show container with fade-in effect
        imageOverlay.style.display = 'block';
        imageOverlay.style.opacity = '0';
        
        // Trigger fade-in animation
        setTimeout(() => {
            imageOverlay.style.transition = 'opacity 1s ease-in-out';
            imageOverlay.style.opacity = '1';
        }, 10);
    });
    
    console.log("Return to British Museum initiated");
}