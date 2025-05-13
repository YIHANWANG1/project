/**
 * config file - contains all API keys and application configurations
 */

const CONFIG = {
    // Mapbox configuration
    mapbox: {
        accessToken: 'pk.eyJ1IjoieWloYW4yIiwiYSI6ImNtNWNoZm5rejRxdGYyanNkZ2dvazc1bGcifQ.RVw7Qp-m7RAnMdU8wqw-rg',  // replace with your Mapbox access token
        style: 'mapbox://styles/mapbox/streets-v11',
        initialCenter: [51.5074, -0.1278], 
        zoom: 12
    },
    
    // Google Maps configuration
    google: {
        apiKey: 'AIzaSyAetWPGveDS7iELpTRQFO6b7_DWQ_0S8OI',  
        libraries: ['places']
    },
    
    // RapidAPI (AI Trip Planner) configuration
    rapidApi: {
        host: 'ai-trip-planner.p.rapidapi.com',
        key: '5feb0c2e6dmshf4f8f7271789ae7p137364jsn12a6ae563979',  
        tripPlanEndpoint: 'https://ai-trip-planner.p.rapidapi.com/plan',
        detailedPlanEndpoint: 'https://ai-trip-planner.p.rapidapi.com/detailed-plan'
    },
    
    // application configuration
    app: {
        defaultDays: 1,
        maxDays: 10,
        defaultTransportModes: ['walking', 'public'],
        maxActivitiesPerDay: 6,
        defaultLocale: 'en',
        defaultCurrency: 'CNY'
    },
    
    // activity types
    activityTypes: {
        attraction: {
            icon: 'fa-monument',
            color: '#3498db',
            label: 'Attraction'
        },
        activity: {
            icon: 'fa-person-hiking',
            color: '#2ecc71',
            label: 'Activity'
        }
    },
    
    // transport modes
    transportModes: {
        walking: {
            icon: 'fa-person-walking',
            color: '#3498db',
            label: 'walking'
        },
        public: {
            icon: 'fa-bus',
            color: '#2ecc71',
            label: 'public transport'
        },
        driving: {
            icon: 'fa-car',
            color: '#f39c12',
            label: 'driving'
        },
        cycling: {
            icon: 'fa-bicycle',
            color: '#9b59b6',
            label: 'cycling'
        }
    }
};

// prevent the config from being modified
Object.freeze(CONFIG); 