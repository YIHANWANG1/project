
(function(global) {
    
/**
 * parse the time string to minutes (from midnight)
 * @param {String} timeStr time string, like "10:30 AM"
 * @returns {Number} minutes
 */
function parseTimeToMinutes(timeStr) {
    const match = timeStr.match(/(\d+):(\d+)\s+(AM|PM)/);
    if (!match) return 0;
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3];
    
    // adjust to 24 hours
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
}
    
// London main landmarks coordinates data
const LONDON_COORDINATES = {
    'Big Ben': { lat: 51.5007, lng: -0.1246 },
    'Tower Bridge': { lat: 51.5055, lng: -0.0753 },
    'British Museum': { lat: 51.5194, lng: -0.1276 },
    'Buckingham Palace': { lat: 51.5014, lng: -0.1419 },
    'London Eye': { lat: 51.5033, lng: -0.1195 },
    'Westminster Abbey': { lat: 51.4994, lng: -0.1272 },
    "St Paul's Cathedral": { lat: 51.5138, lng: -0.0983 },
    'Tower of London': { lat: 51.5081, lng: -0.0759 },
    'Hyde Park': { lat: 51.5073, lng: -0.1722 },
    'Trafalgar Square': { lat: 51.5080, lng: -0.1281 },
    'Covent Garden': { lat: 51.5129, lng: -0.1223 },
    "Shakespeare's Globe": { lat: 51.5081, lng: -0.0969 },
    'Natural History Museum': { lat: 51.4967, lng: -0.1763 },
    'Tate Modern': { lat: 51.5076, lng: -0.0989 },
    'Tate Britain': { lat: 51.4911, lng: -0.1278 },
    'Victoria and Albert Museum': { lat: 51.4966, lng: -0.1720 },
    'Science Museum': { lat: 51.4978, lng: -0.1741 },
    'National Gallery': {lat: 51.508859, lng: -0.128389},


    'Borough Market': { lat: 51.5055, lng: -0.0904 },
    'Greenwich Park': { lat: 51.4769, lng: -0.0014 },
    'Royal Observatory': { lat: 51.4769, lng: -0.0015 },
    'London Zoo': { lat: 51.5353, lng: -0.1534 },
    'Richmond Park': { lat: 51.4448, lng: -0.2726 },
    'London Wetland Centre': { lat: 51.4737, lng: -0.2367 },
    'Kew Gardens': { lat: 51.4787, lng: -0.2956 },
    'Hampstead Heath': { lat: 51.560696, lng: -0.162974 },
    'Thames Path': { lat: 51.5080, lng: -0.0890 },
    'Design Museum': { lat: 51.499737, lng: -0.200495 },
    'Saatchi Gallery': { lat: 51.4907, lng: -0.1582 },
    'National Portrait Gallery': { lat: 51.5094, lng: -0.1281 },
    'National Theatre': { lat: 51.5072, lng: -0.1140 },
    'Royal Opera House': { lat: 51.5129, lng: -0.1240 },
    'Churchill War Rooms': { lat: 51.5021, lng: -0.1290 },
    'Hampton Court Palace': { lat: 51.4036, lng: -0.3378 },
    'Barbican Centre': { lat: 51.5200, lng: -0.0957 },
    'Canary Wharf': { lat: 51.5054, lng: -0.0235 },
    'Lee Valley Park': { lat: 51.6839, lng: -0.0105 },
    'The London Honey Company': { lat: 51.5207, lng: -0.0778 },
    'Colne Valley Regional Park': { lat: 51.5679, lng: -0.4839 },
    'Epping Forest': { lat: 51.6538, lng: 0.0500 },
    'West End': { lat: 51.5120, lng: -0.1252 },
    'Little Italy': { lat: 51.5185, lng: -0.1111 },
    'Camden Market': { lat: 51.5414, lng: -0.1465 },
    'Primrose Hill': { lat: 51.5387, lng: -0.1592 },
    'British Library': { lat: 51.5300, lng: -0.1277 },
    'Piccadilly Circus': { lat: 51.5100, lng: -0.1344 },
    'Chinatown': { lat: 51.5118, lng: -0.1320 },
    'Shoreditch': { lat: 51.5238, lng: -0.0799 },
    'The Shard': { lat: 51.5045, lng: -0.0865 },
    'Notting Hill': { lat: 51.5173, lng: -0.2055 },
    'Greenwich Market': { lat: 51.4810, lng: -0.0090 },
    'Photographers\' Gallery': { lat: 51.5148, lng: -0.1399 },
    'Whitechapel Gallery': { lat: 51.5160, lng: -0.0700 },
    'Serpentine Gallery': { lat: 51.5044, lng: -0.1752 },
    'Old Royal Naval College': { lat: 51.4830, lng: -0.0077 },
    'Cutty Sark': { lat: 51.4832, lng: -0.0098 },

    'Guildhall Art Gallery': { lat: 51.5158, lng: -0.0919 },
    'Imperial War Museum': { lat: 51.4970, lng: -0.1086 },
    'Royal Academy of Arts': { lat: 51.5095, lng: -0.1396 },
    'Somerset House': { lat: 51.5111, lng: -0.1171 },
    'Wallace Collection': { lat: 51.5176, lng: -0.1528 },
    'Horniman Museum': { lat: 51.4406, lng: -0.0529 },
    'Dulwich Picture Gallery': { lat: 51.4507, lng: -0.0858 },
    'Wellcome Collection': { lat: 51.5259, lng: -0.1339 },
    'Sir John Soane\'s Museum': { lat: 51.5169, lng: -0.1174 },
    'Hayward Gallery': { lat: 51.5059, lng: -0.1153 },
    'Battersea Park': { lat: 51.4793, lng: -0.1581 },
    'Regent\'s Park': { lat: 51.5314, lng: -0.1571 },
    'Southbank Centre': { lat: 51.5072, lng: -0.1152 },
    'The Globe Pub': { lat: 51.5063, lng: -0.0919 },
    'Bank of England Museum': { lat: 51.5142, lng: -0.0885 },
    'The Old Vic': { lat: 51.5010, lng: -0.1081 },
    'Young Vic': { lat: 51.5026, lng: -0.1070 },
    'Shakespeare Pub': { lat: 51.5169, lng: -0.1268 },
    'Hampstead Village': { lat: 51.5567, lng: -0.1780 },
    'Highgate Cemetery': { lat: 51.5675, lng: -0.1483 },
    'St James\'s Park': { lat: 51.5025, lng: -0.1348 },
    'Houses of Parliament': { lat: 51.4996, lng: -0.1246 },
    'Leadenhall Market': { lat: 51.5128, lng: -0.0835 },
    'The Gherkin': { lat: 51.5144, lng: -0.0803 },
    'The Walkie Talkie': { lat: 51.5113, lng: -0.0836 },
    'The Cheesegrater': { lat: 51.5139, lng: -0.0827 },
    'Lloyd\'s of London': { lat: 51.5130, lng: -0.0848 },
    'Brick Lane': { lat: 51.5207, lng: -0.0723 },
    'Columbia Road Flower Market': { lat: 51.5282, lng: -0.0702 },
    'Spitalfields Market': { lat: 51.5199, lng: -0.0764 },
    'Old Spitalfields Market': { lat: 51.5195, lng: -0.0745 },
    'Queen Elizabeth Olympic Park': { lat: 51.5475, lng: -0.0147 },
    'St Dunstan in the East': { lat: 51.5097, lng: -0.0821 },
    'God\'s Own Junkyard': { lat: 51.5847, lng: -0.0083 },
    'Kyoto Garden': { lat: 51.5025, lng: -0.2039 },
    'Little Venice': { lat: 51.5209, lng: -0.1816 },
    'Strand on the Green': { lat: 51.4868, lng: -0.2812 },
    'Cartoon Museum': { lat: 51.517559, lng: -0.138671 },
    "Bloomsbury": { lat: 51.522121, lng: -0.129420 },
    "Victoria and Albert Museum": { lat: 51.49639, lng: -0.17194 },
    
    "National Maritime Museum": { lat: 51.480984, lng: -0.005332 },
    "Greenwich": { lat: 51.476852, lng: -0.0005 },
    "Photographers' Gallery": { lat: 51.5145, lng: -0.1397 },
    "Sir John Soane's Museum": { lat: 51.516949, lng:-0.117588 },
    'South Bank': { lat: 51.503052, lng: -0.118391 },
    'Kensington': { lat: 51.499176, lng: -0.197901 },
    'Harrods': { lat: 51.499319, lng: -0.163374},
    'Fortnum & Mason or Sketch':{ lat: 51.508348, lng: -0.137982},
    'Oxford': { lat: 51.75222, lng: -1.25595 },
    'Paddington':{ lat: 51.516899, lng: -0.177411},
    'River Cherwell':{ lat: 51.876931, lng: -1.286941},

    'Thames Path East':{ lat: 51.470899, lng: -0.182584},
    'South London Gallery':{ lat: 51.474237, lng: -0.079440 },
    'London Transport Museum':{ lat: 51.511863, lng: -0.121982},
    'Hampstead Theatre':{lat: 51.543486, lng: -0.174197},
    'Almeida Theatre':{ lat: 51.539455, lng: -0.103041},
    'Victoria Palace Theatre':{lat:51.496461, lng: -0.142796},
    "Wilton's Music Hall":{ lat: 51.510908, lng: -0.066918},
    'Menier Chocolate Factory':{ lat: 51.504733, lng: -0.094362},
    'Lyceum Theatre':{ lat: 51.511677, lng: -0.120181},
    'Thames River':{ lat:51.504075, lng: -0.123142},
    'Horniman Museum and Gardens':{ lat: 51.440950, lng: -0.061432},
    'Theatre Royal Drury Lane':{ lat: 51.512783, lng: -0.120618},
    "St James's Park":{ lat: 51.502915, lng: -0.133791},
    'RADA Studios':{ lat: 51.520814, lng: -0.132767},
    'Secret Cinema':{ lat:51.475814, lng: -0.121728},
    "Sadler's Wells Theatre":{ lat: 51.529440, lng: -0.105893},
    "Museum of London Docklands": { lat: 51.5075, lng: -0.0229 },
    'Bankside':{ lat: 51.508189, lng: -0.095013},
    'Parliament Square':{ lat: 51.501041, lng: -0.126802},
    'HMS Belfast':{ lat: 51.506659, lng: -0.081797},
    'London Wall':{ lat: 51.509829, lng: -0.076098},
    "St Bartholomew's Church":{ lat: 51.518888, lng: -0.099967},
    'Royal Courts of Justice':{ lat: 51.513462, lng: -0.113073},
    'The Honourable Society of the Middle Temple':{ lat: 51.511902, lng: -0.110868},
    'Paternoster Square':{ lat: 51.514231, lng: -0.099333},
    'Goldsmiths Centre':{ lat: 51.520860, lng: -0.103259},
    "Queen's House":{ lat: 51.507823, lng: -0.077161},
    'Kenwood House':{ lat: 51.571345, lng: -0.167826},
    "Regent's Canal":{ lat: 51.532965, lng: -0.102277},
    'Islington':{ lat: 51.531859, lng: -0.107831},
    'Kensington Gardens':{ lat: 51.508198, lng: -0.180129},
    "King's Cross":{ lat: 51.529667, lng: -0.124782},
    'Greenwich Pier':{ lat: 51.483935, lng: -0.009321},
    "Regent's Park":{ lat: 51.531765, lng: -0.155910},
    "Barnes":{ lat: 51.486337, lng: -0.235366},
    'Isabella Plantation':{ lat: 51.432970, lng: -0.276767},
    'Richmond Riverside':{ lat: 51.458208, lng: -0.307241},
    'Hackney City Farm':{ lat: 51.531699, lng: -0.066381},
    'Spitalfields City Farm':{ lat: 51.522110, lng: -0.067338},
    'Holland Park':{ lat: 51.503079, lng: -0.203364},
    'Woodberry Wetlands':{ lat: 51.572786, lng: -0.084183},
    'Walthamstow Wetlands':{ lat: 51.584699, lng: -0.051288},
    'Grand Union Canal':{ lat: 52.116661, lng: -0.861076},
    "Fray's Farm Meadows":{ lat: 51.561862, lng: -0.472242},
    'Lee Valley White Water Centre':{ lat: 51.688810, lng: -0.016822},
    'Warwick Avenue':{ lat: 51.523226, lng: -0.184175},
    

    









      


    


};

// define the adjustment coefficients for budget and transport mode
const BUDGET_FACTORS = {
    "low": {
        activitiesPerDay: { min: 3, max: 5 },
        costDescription: "suitable for budget-limited travelers, with free and low-cost attractions",
        preferredTransport: ["walking", "public transport", "bike"],
        accommodationSuggestion: "youth hostel or economy hotel"
    },
    "medium": {
        activitiesPerDay: { min: 4, max: 6 },
        costDescription: "suitable for travelers with medium budget, including some paid attractions",
        preferredTransport: ["public transport", "bike", "guided tours"],
        accommodationSuggestion: "3-4-star hotel or boutique inn"
    },
    "high": {
        activitiesPerDay: { min: 5, max: 7 },
        costDescription: "suitable for high budget travelers, including高端体验和顶级景点",
        preferredTransport: ["private car", "guided tours", "rental car"],
        accommodationSuggestion: "4-5-star hotel or luxury apartment"
    }
};

const TRANSPORT_DESCRIPTIONS = {
    "walking": "walking",
    "public transport": "using London public transport system, including tube, bus and light rail",
    "rental car": "rental car, flexible and convenient, suitable for long-distance attractions",
    "bike": "cycling, experience city风光, suitable for parks and city center",
};

// calculate the maximum number of activities function
function calculateMaxActivities(budget, travelMode, dayIndex) {
    // the basic range of activities
    const baseRange = BUDGET_FACTORS[budget].activitiesPerDay;
    
    // transport mode adjustment
    let transportAdjustment = 0;
    if (travelMode === "walking") {
        // walking reduces the number of activities
        transportAdjustment = -1;
    } else if (travelMode === "bike") {
        // cycling略微减少活动数量
        transportAdjustment = -0.5;
    } else if (travelMode === "public transport") {
        // public transport is suitable for city center
        transportAdjustment = 0.5;
    } else if (travelMode === "guided tours") {
        // guided tours can optimize the itinerary
        transportAdjustment = 0.5;
    } else if (travelMode === "private car" || travelMode === "rental car") {
        // private car or rental car increases the number of activities
        transportAdjustment = 1;
    }
    
    // calculate the preliminary number of activities
    let maxActivities = Math.round(baseRange.min + transportAdjustment);
    
    // if it is the first or last day, the number of activities may be slightly reduced
    if (dayIndex === 0 || dayIndex === 6) {
        maxActivities = Math.max(3, maxActivities - 1);
    } else {
        // in the middle days of the itinerary, more attractions can be arranged for city sightseeing
        maxActivities = Math.min(maxActivities + 1, baseRange.max);
    }
    
    // ensure the number of activities is within a reasonable range
    return Math.max(Math.min(maxActivities, baseRange.max), 3);
}

//Cache Data
const INTEREST_ITINERARIES = {
  
    "general": [
        
        [
            {
                "time": "09:30 AM",
                "activity": "visit Buckingham Palace",
                "location": "Buckingham Palace",
                "description": "Watch the Changing of the Guard and admire the royal residence.",
                "cost": { "low": "Free (outside only)", "medium": "Garden ticket £17", "high": "State Rooms £30" }
            },
            {
                "time": "12:00 PM",
                "activity": "Lunch near St. James's Park",
                "location": "St. James's Park",
                "description": "Relax and dine in a royal park setting.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£30+" }
            },
            {
                "time": "01:30 PM",
                "activity": "visit Westminster Abbey",
                "location": "Westminster Abbey",
                "description": "Explore the history and architecture of the coronation church.",
                "cost": { "low": "£10 (student/concession)", "medium": "£18 adult", "high": "Guided tour £25" }
            },
            {
                "time": "04:00 PM",
                "activity": "walk along Westminster Bridge and London Eye",
                "location": "South Bank",
                "description": "Take in iconic views of Big Ben and the River Thames.",
                "cost": { "low": "Free", "medium": "Photo souvenir £10", "high": "London Eye ride £32" }
            }
        ],

        [
            {
                "time": "10:00 AM",
                "activity": "visit British Museum",
                "location": "British Museum",
                "description": "See world treasures like the Rosetta Stone and the Elgin Marbles.",
                "cost": { "low": "Free", "medium": "Donation £5", "high": "Audio guide £7 or Tour £15" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Great Russell Street",
                "location": "Museum Tavern or nearby bistro",
                "description": "Enjoy a British meal or sandwich lunch.",
                "cost": { "low": "£8-12", "medium": "£15-20", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Churchill War Rooms",
                "location": "Churchill War Rooms",
                "description": "Explore Winston Churchill's secret underground headquarters.",
                "cost": { "low": "£16", "medium": "£22", "high": "Guided visit £30" }
            },
            {
                "time": "05:00 PM",
                "activity": "walk and relax in St. James's Park",
                "location": "St. James's Park",
                "description": "Enjoy nature, ducks, and a peaceful stroll near royal sites.",
                "cost": { "low": "Free", "medium": "Coffee £5", "high": "——" }
            }
        ],

        [
            {
                "time": "09:30 AM",
                "activity": "visit Tower of London",
                "location": "Tower of London",
                "description": "Explore medieval history and see the Crown Jewels.",
                "cost": { "low": "Student £22", "medium": "Adult £30", "high": "Beefeater guided tour £35" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Borough Market",
                "location": "Borough Market",
                "description": "Taste food from all over the world in this vibrant market.",
                "cost": { "low": "£8-12", "medium": "£15-20", "high": "£25+ with wine" }
            },
            {
                "time": "02:00 PM",
                "activity": "walk across Tower Bridge and visit Tower Bridge Exhibition",
                "location": "Tower Bridge",
                "description": "Cross the iconic bridge and enjoy the glass floor walkway.",
                "cost": { "low": "£7", "medium": "£10", "high": "Family ticket or tour £20" }
            },
            {
                "time": "04:30 PM",
                "activity": "Thames Riverside Walk to City Hall",
                "location": "South Bank",
                "description": "Scenic riverside walk with skyline views.",
                "cost": { "low": "Free", "medium": "——", "high": "——" }
            }
        ],

        [
            {
                "time": "10:00 AM",
                "activity": "walk through Hyde Park and visit Kensington Gardens",
                "location": "Hyde Park",
                "description": "Enjoy nature, the Serpentine, and the Princess Diana Memorial Fountain.",
                "cost": { "low": "Free", "medium": "Bike rental £10", "high": "Boat rental £20" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Kensington High Street",
                "location": "Kensington",
                "description": "Relax with lunch in one of West London's vibrant neighborhoods.",
                "cost": { "low": "£10", "medium": "£15-20", "high": "£30+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Harrods or Selfridges for shopping",
                "location": "Harrods",
                "description": "Browse London's most iconic department stores.",
                "cost": { "low": "Window shopping", "medium": "Souvenirs £20", "high": "Luxury items £100+" }
            },
            {
                "time": "05:00 PM",
                "activity": "enjoy tea at a classic English tea room",
                "location": "Fortnum & Mason or Sketch",
                "description": "Experience traditional afternoon tea.",
                "cost": { "low": "£15 cream tea", "medium": "£30 set", "high": "£50+ luxury tea" }
            }
        ],

        [
            {
                "time": "09:30 AM",
                "activity": "visit Museum of London",
                "location": "Natural History Museum",
                "description": "Explore London's history from prehistory to today.",
                "cost": { "low": "Free", "medium": "Donation £5", "high": "Audio guide £7" }
            },
            {
                "time": "12:00 PM",
                "activity": "Lunch at Barbican Centre",
                "location": "Barbican Centre",
                "description": "Dine in London's leading arts centre.",
                "cost": { "low": "£10", "medium": "£15-20", "high": "£30+" }
            },
            {
                "time": "02:00 PM",
                "activity": "explore street life and art in Covent Garden",
                "location": "Covent Garden",
                "description": "Watch live performances and browse independent shops.",
                "cost": { "low": "Free", "medium": "Souvenirs £10", "high": "Handcrafted items £30+" }
            },
            {
                "time": "04:30 PM",
                "activity": "watch a West End musical",
                "location": "West End",
                "description": "Enjoy one of London's famous theatre productions.",
                "cost": { "low": "£20 (day seat)", "medium": "£40 standard seat", "high": "£80+ VIP" }
            }
        ],

        [
            {
                "time": "10:00 AM",
                "activity": "take a Thames river cruise",
                "location": "Thames River",
                "description": "Relax on a scenic cruise from Westminster to Greenwich.",
                "cost": { "low": "£10", "medium": "£15 with commentary", "high": "Private boat £60+" }
            },
            {
                "time": "12:00 PM",
                "activity": "Lunch in Greenwich",
                "location": "Greenwich Market",
                "description": "Try market food or British pub fare.",
                "cost": { "low": "£10", "medium": "£15-20", "high": "£25+" }
            },
            {
                "time": "01:30 PM",
                "activity": "visit Royal Observatory and Prime Meridian",
                "location": "Greenwich Park",
                "description": "Stand on the Prime Meridian line and enjoy the view.",
                "cost": { "low": "£8", "medium": "£12", "high": "All access £18" }
            },
            {
                "time": "04:00 PM",
                "activity": "visit National Maritime Museum",
                "location": "National Maritime Museum",
                "description": "Explore Britain's seafaring history.",
                "cost": { "low": "Free", "medium": "Donation £5", "high": "Audio tour £10" }
            }
        ],

        [
            {
                "time": "08:00 AM",
                "activity": "walk along Regent’s Canal from Little Venice",
                "location": "Little Venice",
                "description": "Start your day with a tranquil canal-side walk past moored houseboats and leafy paths.",
                "cost": { "low": "Free", "medium": "Boat ride £10", "high": "Brunch cruise £25+" }
            },
            {
                "time": "10:30 AM",
                "activity": "explore Clifton Nurseries garden shop",
                "location": "Warwick Avenue",
                "description": "Discover London’s oldest garden center, hidden within a courtyard oasis.",
                "cost": { "low": "Free", "medium": "Plant/souvenir £10", "high": "Garden gift £30+" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at a hidden gem café",
                "location": "Maida Vale or Notting Hill backstreets",
                "description": "Enjoy a quiet café lunch tucked away from the tourist crowds.",
                "cost": { "low": "£10", "medium": "£15-20", "high": "£30+" }
            },
            {
                "time": "02:30 PM",
                "activity": "visit Leighton House Museum",
                "location": "Holland Park",
                "description": "Step inside the opulent former home of artist Frederic Leighton, filled with Middle Eastern and Victorian design.",
                "cost": { "low": "£5", "medium": "£10", "high": "Guided tour £20" }
            },
            {
                "time": "04:30 PM",
                "activity": "relax in Kyoto Garden",
                "location": "Holland Park",
                "description": "Unwind in this serene Japanese garden with koi ponds and waterfalls.",
                "cost": { "low": "Free", "medium": "Snack £5", "high": "Tea nearby £10+" }
            }
        ]
        
    ],


    "art": [
      
        [
            {
                "time": "09:30 AM",
                "activity": "visit Tate Modern",
                "location": "Tate Modern",
                "description": "Enjoy world-class modern art and explore cutting-edge art exhibitions.",
                "cost": { "low": "Free", "medium": "Free + Special Exhibition £15", "high": "Guided Tour £25" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Bankside",
                "location": "Southbank Centre",
                "description": "Enjoy a meal by the Thames and take in the river views.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Saatchi Gallery",
                "location": "Saatchi Gallery",
                "description": "Enjoy contemporary art, especially innovative works by emerging artists.",
                "cost": { "low": "Free", "medium": "Free", "high": "Private Tour £30" }
            },
            {
                "time": "04:30 PM",
                "activity": "visit Serpentine Gallery",
                "location": "Serpentine Gallery",
                "description": "Enjoy modern art exhibitions in Hyde Park.",
                "cost": { "low": "Free", "medium": "Free", "high": "Free" }
            }
        ],
        [
            {
                "time": "10:00 AM",
                "activity": "visit National Gallery",
                "location": "National Gallery",
                "description": "Enjoy masterpieces from the 13th to 19th century.",
                "cost": { "low": "Free", "medium": "Free + Audio Tour £5", "high": "Expert Tour £30" }
            },
            {
                "time": "01:00 PM",
                "activity": "Lunch at Trafalgar Square",
                "location": "Trafalgar Square",
                "description": "Enjoy a meal in the iconic London square.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "02:30 PM",
                "activity": "visit National Portrait Gallery",
                "location": "National Portrait Gallery",
                "description": "Enjoy the collection of portraits of British historical figures.",
                "cost": { "low": "Free", "medium": "Free + Special Exhibition £12", "high": "VIP Lane £20" }
            },
            {
                "time": "05:00 PM",
                "activity": "visit Somerset House",
                "location": "Somerset House",
                "description": "Enjoy the contemporary art exhibitions in this neoclassical building.",
                "cost": { "low": "Free", "medium": "Special Exhibition £10-15", "high": "Special Exhibition + Dining £30" }
            }
        ],
        
        [
            {
                "time": "10:00 AM",
                "activity": "visit Whitechapel Gallery",
                "location": "Whitechapel Gallery",
                "description": "Enjoy contemporary art space, explore avant-garde exhibitions.",
                "cost": { "low": "Free", "medium": "Free + Special Exhibition £10", "high": "Member Experience £30" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Brick Lane",
                "location": "Brick Lane",
                "description": "Experience the diverse culture and street art in East London.",
                "cost": { "low": "£10", "medium": "£15-20", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "explore Shoreditch street art",
                "location": "Shoreditch",
                "description": "Enjoy the vibrant street art and graffiti in East London.",
                "cost": { "low": "Free", "medium": "Street Art Tour £15", "high": "Private Tour £30" }
            },
            {
                "time": "04:30 PM",
                "activity": "visit Old Spitalfields Market",
                "location": "Old Spitalfields Market",
                "description": "Explore the art stalls in the market, find unique handicrafts.",
                "cost": { "low": "Free", "medium": "Small Artwork £20", "high": "Artwork Purchase £50+" }
            }
        ],
        [
            {
                "time": "09:30 AM",
                "activity": "visit Tate Britain",
                "location": "Tate Britain",
                "description": "Enjoy the valuable collection of British art from 1500 to the present.",
                "cost": { "low": "Free", "medium": "Free + Special Exhibition £15", "high": "Member Experience £30" }
            },
            {
                "time": "12:00 PM",
                "activity": "take the Tate boat ride on the Thames",
                "location": "Thames River",
                "description": "Enjoy the art theme boat ride connecting Tate Modern and Tate Britain, enjoy the river views.",
                "cost": { "low": "£5 one-way", "medium": "£8 one-way", "high": "£15 round trip + drinks" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Hayward Gallery",
                "location": "Hayward Gallery",
                "description": "Enjoy the avant-garde contemporary art exhibitions in the Southbank Centre.",
                "cost": { "low": "£10", "medium": "£15", "high": "£20+ Guide" }
            },
            {
                "time": "04:30 PM",
                "activity": "visit Design Museum",
                "location": "Design Museum",
                "description": "Explore the product andarchitecture design exhibitions.",
                "cost": { "low": "Free", "medium": "Special Exhibition £10", "high": "Special Exhibition + Shopping £30" }
            }
        ],
       
        [
            {
                "time": "10:00 AM",
                "activity": "visit Royal Academy of Arts",
                "location": "Royal Academy of Arts",
                "description": "Enjoy the exhibitions in this iconic institution founded by artists.",
                "cost": { "low": "Free/Special Exhibition £15", "medium": "Special Exhibition £20", "high": "VIP Ticket £30" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Fortnum & Mason",
                "location": "Piccadilly",
                "description": "Enjoy the elegant English afternoon tea in this historic department store.",
                "cost": { "low": "£15-20", "medium": "£30-40", "high": "£50+" }
            },
            {
                "time": "02:30 PM",
                "activity": "visit Wallace Collection",
                "location": "Wallace Collection",
                "description": "Explore the art masterpieces in this historic building, including paintings, furniture and weapons collection.",
                "cost": { "low": "Free", "medium": "Free + Guide £10", "high": "Private Guide £25" }
            },
            {
                "time": "05:00 PM",
                "activity": "visit Photographers' Gallery",
                "location": "Photographers' Gallery",
                "description": "Enjoy the first public gallery in the UK dedicated to showcasing photographic art.",
                "cost": { "low": "Free", "medium": "Special Exhibition £5", "high": "Workshop Experience £25" }
            }
        ],
       
        [
            {
                "time": "10:30 AM",
                "activity": "visit Dulwich Picture Gallery",
                "location": "Dulwich Picture Gallery",
                "description": "Explore the oldest public art gallery in the UK, enjoy the Baroque painting masterpieces.",
                "cost": { "low": "£10", "medium": "£12+Guide", "high": "£20 All-Day Ticket" }
            },
            {
                "time": "01:00 PM",
                "activity": "Lunch at Dulwich Village",
                "location": "Dulwich Village",
                "description": "Enjoy the lunch in this historic village.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "03:00 PM",
                "activity": "visit Horniman Museum and Garden",
                "location": "Horniman Museum",
                "description": "Explore the global art and craft collection in this museum.",
                "cost": { "low": "Free", "medium": "Garden £5", "high": "Special Exhibition £10" }
            },
            {
                "time": "05:30 PM",
                "activity": "visit South London Gallery",
                "location": "South London Gallery",
                "description": "Enjoy the innovative exhibitions in this gallery.",
                "cost": { "low": "Free", "medium": "Free + Donation", "high": "Artwork Purchase" }
            }
        ],
       
        [
            {
                "time": "09:30 AM",
                "activity": "visit Sir John Soane's Museum",
                "location": "Sir John Soane's Museum",
                "description": "Explore the collection of paintings, sculptures and antiques in this museum.",
                "cost": { "low": "Free", "medium": "Free + Audio Guide £5", "high": "Private Guide £20" }
            },
            {
                "time": "12:00 PM",
                "activity": "Lunch at Covent Garden",
                "location": "Covent Garden",
                "description": "Enjoy the lunch in this lively market area, enjoy the street performances.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit London Transport Museum",
                "location": "London Transport Museum",
                "description": "Explore the history of London's transport system, enjoy the poster art collection.",
                "cost": { "low": "£18.50", "medium": "£20+Souvenir", "high": "£25+Workshop" }
            },
            {
                "time": "04:30 PM",
                "activity": "visit Victoria and Albert Museum",
                "location": "Victoria and Albert Museum",
                "description": "Explore the evening exhibitions in this world-leading art and design museum.",
                "cost": { "low": "Free", "medium": "Special Exhibition £15", "high": "Member Experience £25" }
            }
        ]
    ],
    

    "theater": [
        [
            {
                "time": "10:00 AM",
                "activity": "visit National Theatre Museum",
                "location": "Victoria and Albert Museum",
                "description": "Enjoy the drama costumes, stage designs, scripts and theatrical history exhibits。",
                "cost": { "low": "Free Entry", "medium": "£5 Donation Suggested", "high": "£10" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Theatre District Café",
                "location": "Covent Garden",
                "description": "Enjoy the local English food in the Theatre District, enjoy the theatre district atmosphere.",
                "cost": { "low": "£10-15", "medium": "£20-25", "high": "£30+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Royal Opera House",
                "location": "Royal Opera House",
                "description": "Join the behind-the-scenes tour, enjoy the world-class theatre operation.",
                "cost": { "low": "£12 Basic Tour", "medium": "£20 Deep Tour", "high": "£30 Expert Tour + Exhibition" }
            },
            {
                "time": "04:30 PM",
                "activity": "visit Shaftesbury Avenue Theatre District",
                "location": "West End",
                "description": "Enjoy the theatre district atmosphere, enjoy the theatre exterior and signboard, enjoy the West End daily performance information, choose souvenirs.",
                "cost": { "low": "Free", "medium": "£5 Postcard & Small Souvenir", "high": "£15 Theatre Souvenir" }
            },
            {
                "time": "07:30 PM",
                "activity": "watch West End classic musicals",
                "location": "Lyceum Theatre",
                "description": "Enjoy the classic musicals in the West End, enjoy the drama charm.",
                "cost": { "low": "£20-30 Rear/Same Day Ticket", "medium": "£40-60 Normal Seat", "high": "£80-100 Preferred Seat" }
            }
            
        ],
       
        [
            {
                "time": "10:30 AM",
                "activity": "visit Theatre Royal Drury Lane",
                "location": "Theatre Royal Drury Lane",
                "description": "Explore the oldest theatre in London, enjoy the 400 years history.",
                "cost": { "low": "£15.50 Tour", "medium": "£20+Afternoon Tea", "high": "£40 Complete Experience" }
            },
            {
                "time": "01:00 PM",
                "activity": "Lunch at Covent Garden",
                "location": "Covent Garden",
                "description": "Enjoy the lunch in the drama district, enjoy the street performances.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "03:00 PM",
                "activity": "visit London Transport Museum",
                "location": "London Transport Museum",
                "description": "Explore the development of London's transport system, including the special poster exhibition designed for theatres.",
                "cost": { "low": "£18.50", "medium": "£20+Souvenir", "high": "£25+Workshop" }
            },
            {
                "time": "07:30 PM",
                "activity": "watch West End musicals",
                "location": "West End",
                "description": "Enjoy the West End musicals.",
                "cost": { "low": "£25-35", "medium": "£45-60", "high": "£70-100 Preferred Seat" }
            }
        ],
       
        [
            {
                "time": "10:00 AM",
                "activity": "visit National Theatre",
                "location": "National Theatre",
                "description": "Explore the modernist building, enjoy the stage technology and production process.",
                "cost": { "low": "Tour £10", "medium": "Tour + Exhibition £15", "high": "Private Tour £30" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Southbank Centre",
                "location": "Southbank Centre",
                "description": "Enjoy the lunch in the Southbank Centre, enjoy the river views.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "02:30 PM",
                "activity": "visit The Old Vic",
                "location": "The Old Vic",
                "description": "Explore the 200 years history.",
                "cost": { "low": "Free", "medium": "Tour £10", "high": "Private Tour £25" }
            },
            {
                "time": "07:00 PM",
                "activity": "watch experimental drama at Young Vic",
                "location": "Young Vic",
                "description": "Experience the avant-garde, innovative modern drama performance.",
                "cost": { "low": "£20", "medium": "£30-40", "high": "£50 Preferred Seat" }
            }
        ],
       
        [
            {
                "time": "10:30 AM",
                "activity": "visit Royal Opera House",
                "location": "Royal Opera House",
                "description": "Explore the world-famous opera house, enjoy the opera and ballet production process.",
                "cost": { "low": "Tour £14", "medium": "Tour + Exhibition £20", "high": "Private Tour £40" }
            },
            {
                "time": "01:00 PM",
                "activity": "Lunch at Covent Garden",
                "location": "Covent Garden",
                "description": "Enjoy the lunch in the drama district, enjoy the street performances.",
                "cost": { "low": "£15", "medium": "£20-30", "high": "£35+" }
            },
            {
                "time": "03:00 PM",
                "activity": "visit Victoria Palace Theatre",
                "location": "Victoria Palace Theatre",
                "description": "Explore the iconic theatre hosting popular musicals like Hamilton.",
                "cost": { "low": "Free", "medium": "Tour £15", "high": "Private Tour £30" }
            },
            {
                "time": "07:30 PM",
                "activity": "watch opera or ballet at Royal Opera House",
                "location": "Royal Opera House",
                "description": "Enjoy the world-class opera or ballet performance.",
                "cost": { "low": "Limited Ticket £30", "medium": "£60-90", "high": "£100-200 Preferred Seat" }
            }
        ],
       
        [
            {
                "time": "11:00 AM",
                "activity": "visit Wilton's Music Hall",
                "location": "Wilton's Music Hall",
                "description": "Explore the oldest music hall in the world, enjoy the Victorian charm.",
                "cost": { "low": "Free", "medium": "Tour £8", "high": "Private Tour £25" }
            },
            {
                "time": "01:30 PM",
                "activity": "Lunch at Spitalfields",
                "location": "Spitalfields",
                "description": "Enjoy the lunch in the vibrant East London area.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "03:30 PM",
                "activity": "visit Barbican Centre",
                "location": "Barbican Centre",
                "description": "Explore the multi-functional art center, enjoy the drama, music and dance projects.",
                "cost": { "low": "Free", "medium": "Tour £15", "high": "Private Tour £25" }
            },
            {
                "time": "07:30 PM",
                "activity": "watch drama at Menier Chocolate Factory",
                "location": "Menier Chocolate Factory",
                "description": "Enjoy the unique drama experience in the chocolate factory converted to a theatre.",
                "cost": { "low": "£25", "medium": "£35", "high": "£45+" }
            }
        ],
       
        [
            {
                "time": "10:00 AM",
                "activity": "attend drama workshop at RADA Studios",
                "location": "RADA Studios",
                "description": "Attend the interactive drama workshop at the Royal Academy of Dramatic Art.",
                "cost": { "low": "Free", "medium": "Workshop £25", "high": "Private Course £50" }
            },
            {
                "time": "01:00 PM",
                "activity": "Lunch at Camden Market",
                "location": "Camden Market",
                "description": "Enjoy the lunch in the vibrant market area.",
                "cost": { "low": "£10", "medium": "£15-20", "high": "£25+" }
            },
            {
                "time": "03:00 PM",
                "activity": "visit Shakespeare's Head Exhibition",
                "location": "British Library",
                "description": "Enjoy the exhibition of Shakespeare's original folio and precious manuscripts.",
                "cost": { "low": "Free", "medium": "Special Exhibition £10", "high": "Tour £20" }
            },
            {
                "time": "07:00 PM",
                "activity": "attend immersive drama experience",
                "location": "Secret Cinema",
                "description": "Experience the innovative immersive drama performance, become part of the story.",
                "cost": { "low": "£35", "medium": "£60", "high": "£85+" }
            }
        ],
       
        [
            {
                "time": "10:30 AM",
                "activity": "visit Sadler's Wells Theatre",
                "location": "Sadler's Wells Theatre",
                "description": "Explore the world-famous theatre focusing on contemporary dance.",
                "cost": { "low": "Free", "medium": "Tour £12", "high": "Workshop £30" }
            },
            {
                "time": "01:00 PM",
                "activity": "Lunch at Islington",
                "location": "Islington",
                "description": "Enjoy the lunch in the artistic North London area.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "03:00 PM",
                "activity": "visit Hampstead Theatre",
                "location": "Hampstead Theatre",
                "description": "Explore the theatre known for discovering new playwrights and plays.",
                "cost": { "low": "Free", "medium": "Performance Rehearsal £10", "high": "Special Event £25" }
            },
            {
                "time": "07:30 PM",
                "activity": "watch avant-garde drama at Almeida Theatre",
                "location": "Almeida Theatre",
                "description": "Enjoy the avant-garde drama in the small theatre.",
                "cost": { "low": "£20", "medium": "£30", "high": "£40+" }
            }
        ]
    ],
    

    "museums": [
       
        [
            {
                "time": "10:00 AM",
                "activity": "visit British Museum",
                "location": "British Museum",
                "description": "Explore treasures from ancient civilizations including Egypt, Greece, and Asia.",
                "cost": { "low": "Free", "medium": "Donation £5", "high": "Audio Guide £7 / Guided Tour £15" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Great Russell Street",
                "location": "Museum Tavern or nearby café",
                "description": "Enjoy a meal near the museum in a historic setting.",
                "cost": { "low": "£10", "medium": "£15-20", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Cartoon Museum",
                "location": "Cartoon Museum",
                "description": "Discover British cartoon art, comic strips, and satire.",
                "cost": { "low": "£5", "medium": "£9", "high": "Guided Entry £15" }
            },
            {
                "time": "04:00 PM",
                "activity": "browse museum shop or nearby bookstores",
                "location": "Bloomsbury",
                "description": "Pick up art books, replicas, or cultural souvenirs.",
                "cost": { "low": "Free to browse", "medium": "£10 souvenir", "high": "£30+ gifts" }
            }
        ],

       
        [
            {
                "time": "10:00 AM",
                "activity": "visit Natural History Museum",
                "location": "Natural History Museum",
                "description": "Explore the wonders of nature, from dinosaurs to minerals.",
                "cost": { "low": "Free", "medium": "Donation £5", "high": "Exhibition £10+" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Museum Lane",
                "location": "Natural History Museum",
                "description": "Dine at one of the cafés between museums.",
                "cost": { "low": "£10", "medium": "£15-20", "high": "£30+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Science Museum",
                "location": "Science Museum",
                "description": "Discover engineering marvels, space tech, and interactive exhibits.",
                "cost": { "low": "Free", "medium": "IMAX £10", "high": "Special Tour £20" }
            },
            {
                "time": "04:30 PM",
                "activity": "relax in Hyde Park",
                "location": "Hyde Park",
                "description": "Stroll and reflect on the day's discoveries.",
                "cost": { "low": "Free", "medium": "Snack £5", "high": "Cafe stop £10+" }
            }
        ],

       
        [
            {
                "time": "10:00 AM",
                "activity": "visit Victoria and Albert Museum",
                "location": "Victoria and Albert Museum",
                "description": "Explore art, fashion, and design from across the centuries.",
                "cost": { "low": "Free", "medium": "Special Exhibition £10-15", "high": "Guided Tour £20" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at V&A Café",
                "location": "Victoria and Albert Museum",
                "description": "Enjoy lunch in the stunning Victorian café.",
                "cost": { "low": "£10", "medium": "£15-20", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Design Museum",
                "location": "Design Museum",
                "description": "Explore contemporary design in product, graphic, and architecture.",
                "cost": { "low": "Free", "medium": "Special Exhibition £10", "high": "Workshop £25" }
            },
            {
                "time": "04:30 PM",
                "activity": "walk and shop at Kensington High Street",
                "location": "Kensington",
                "description": "Browse books and gifts inspired by design and fashion.",
                "cost": { "low": "Free to browse", "medium": "£10-20", "high": "£50+" }
            }
        ],

       
        [
            {
                "time": "10:00 AM",
                "activity": "visit Imperial War Museum",
                "location": "Imperial War Museum",
                "description": "Learn about war history from WWI to present day through immersive exhibits.",
                "cost": { "low": "Free", "medium": "Donation £5", "high": "Audio Guide £7" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch near Elephant & Castle",
                "location": "Lower Marsh or local café",
                "description": "Grab a meal near the museum with local options.",
                "cost": { "low": "£8", "medium": "£12-18", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Churchill War Rooms",
                "location": "Churchill War Rooms",
                "description": "Walk through Churchill's WWII underground headquarters.",
                "cost": { "low": "£16", "medium": "£22", "high": "Guided Visit £30" }
            },
            {
                "time": "04:30 PM",
                "activity": "walk past 10 Downing Street and Whitehall",
                "location": "Westminster",
                "description": "Take in key British political landmarks.",
                "cost": { "low": "Free", "medium": "Coffee £5", "high": "Souvenir shop £15+" }
            }
        ],

       
        [
            {
                "time": "10:00 AM",
                "activity": "take boat to Greenwich",
                "location": "Thames Clipper",
                "description": "Travel to Greenwich by river for scenic views and heritage.",
                "cost": { "low": "£8", "medium": "£12", "high": "River Tour £20+" }
            },
            {
                "time": "11:00 AM",
                "activity": "visit National Maritime Museum",
                "location": "National Maritime Museum",
                "description": "Explore Britain's naval history, ships, and exploration exhibits.",
                "cost": { "low": "Free", "medium": "Donation £5", "high": "Audio guide £10" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Greenwich Market",
                "location": "Greenwich Market",
                "description": "Sample global street food and artisan snacks.",
                "cost": { "low": "£8", "medium": "£12-15", "high": "£20+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Royal Observatory",
                "location": "Greenwich Park",
                "description": "Stand on the Prime Meridian and explore the history of timekeeping.",
                "cost": { "low": "£8", "medium": "£12", "high": "All access £18" }
            },
            {
                "time": "04:00 PM",
                "activity": "visit Cutty Sark",
                "location": "Cutty Sark",
                "description": "Tour the 19th-century British clipper ship.",
                "cost": { "low": "£10", "medium": "£15", "high": "Combined ticket £20+" }
            }
        ],

       
        [
            {
                "time": "10:00 AM",
                "activity": "visit Photographers' Gallery",
                "location": "Photographers' Gallery",
                "description": "See contemporary and historical photography exhibitions.",
                "cost": { "low": "Free", "medium": "Special Exhibition £5", "high": "Workshop £25" }
            },
            {
                "time": "12:00 PM",
                "activity": "Lunch in Soho",
                "location": "Soho",
                "description": "Enjoy the eclectic food scene in London's artsy district.",
                "cost": { "low": "£10", "medium": "£15-20", "high": "£30+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Museum of London",
                "location": "Natural History Museum",
                "description": "Follow the city's story from prehistory to modern times.",
                "cost": { "low": "Free", "medium": "Donation £5", "high": "Audio £7" }
            },
            {
                "time": "04:30 PM",
                "activity": "explore Barbican Centre",
                "location": "Barbican Centre",
                "description": "View exhibitions or simply explore the architectural complex.",
                "cost": { "low": "Free", "medium": "Exhibition £10", "high": "Performance ticket £20+" }
            }
        ],

       
        [
            {
                "time": "10:00 AM",
                "activity": "visit Wallace Collection",
                "location": "Wallace Collection",
                "description": "Admire paintings, arms, porcelain and French furniture in a historic house.",
                "cost": { "low": "Free", "medium": "Donation £5", "high": "Guided Tour £10" }
            },
            {
                "time": "12:00 PM",
                "activity": "Lunch at Marylebone High Street",
                "location": "Marylebone",
                "description": "Relax at a boutique café near the Wallace Collection.",
                "cost": { "low": "£10", "medium": "£15-20", "high": "£30+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Sir John Soane's Museum",
                "location": "Sir John Soane's Museum",
                "description": "Explore architecture and art in a house museum with curated antiquities.",
                "cost": { "low": "Free", "medium": "Audio Guide £5", "high": "Private Tour £20" }
            },
            {
                "time": "04:00 PM",
                "activity": "enjoy final tea or revisit your favorite museum",
                "location": "Sir John Soane's Museum",
                "description": "Wind down the trip or catch what you missed earlier.",
                "cost": { "low": "£5-10", "medium": "Entry/ticket £15", "high": "Custom experience £25+" }
            }
        ]
    ],

    
    "history": [
        [
            {
                "time": "09:30 AM",
                "activity": "visit Tower of London",
                "location": "Tower of London",
                "description": "Explore the ancient castle with a history of nearly 1000 years, visit the Royal Jewels Collection.",
                "cost": { "low": "£25", "medium": "£29.90+Tour", "high": "£40 Early Entry + Jewels Room" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Tower Hill",
                "location": "Tower Hill",
                "description": "Enjoy the lunch in the historical area, enjoy the city views.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit St Paul's Cathedral",
                "location": "St Paul's Cathedral",
                "description": "Explore the iconic cathedral, learn about its history and architecture.",
                "cost": { "low": "£18", "medium": "£21+Tour", "high": "£30 Private Tour" }
            },
            {
                "time": "04:30 PM",
                "activity": "visit Museum of London Docklands",
                "location": "Museum of London Docklands",
                "description": "Explore the story of London as a port city, from slavery to trade to the modern Docklands.",
                "cost": { "low": "Free", "medium": "Donation £5", "high": "Guided Tour £20" }
            }
            
        ],
        
        [
            {
                "time": "09:00 AM",
                "activity": "visit Hampton Court Palace",
                "location": "Hampton Court Palace",
                "description": "Explore the palace of Henry VIII, learn about the history and lifestyle of the Tudor era.",
                "cost": { "low": "£25", "medium": "£25+Audio Tour", "high": "£35 Private Tour" }
            },
            {
                "time": "01:00 PM",
                "activity": "Lunch at Hampton Court Gardens",
                "location": "Hampton Court Gardens",
                "description": "Enjoy the lunch in the historical royal garden, enjoy the various food.",
                "cost": { "low": "£10", "medium": "£15-20", "high": "£25+" }
            },
            {
                "time": "03:00 PM",
                "activity": "Boat along the Thames River",
                "location": "Thames River",
                "description": "Experience the history of the Thames River.",
                "cost": { "low": "£15", "medium": "£20", "high": "£30 Private Boat" }
            },
            {
                "time": "05:30 PM",
                "activity": "visit Bankside",
                "location": "Bankside",
                "description": "Walk through this historical area of the Shakespeare era, learn about the Elizabethan London.",
                "cost": { "low": "Free", "medium": "Tour £15", "high": "Theme Tour £25" }
            }
        ],
        
        [
            {
                "time": "09:30 AM",
                "activity": "visit Houses of Parliament",
                "location": "Houses of Parliament",
                "description": "Explore the heart of British politics, learn about the history of parliamentary democracy.",
                "cost": { "low": "Free", "medium": "Tour £25", "high": "VIP Tour £40" }
            },
            {
                "time": "12:00 PM",
                "activity": "Lunch at Westminster",
                "location": "Westminster",
                "description": "Enjoy the lunch in the historical area, enjoy the traditional British food.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Westminster Abbey",
                "location": "Westminster Abbey",
                "description": "Explore the Gothic church where British monarchs are crowned and buried.",
                "cost": { "low": "£24", "medium": "£27+Audio Tour", "high": "£40 Private Tour" }
            },
            {
                "time": "04:30 PM",
                "activity": "visit Buckingham Palace",
                "location": "Buckingham Palace",
                "description": "Explore the official London residence of the British monarchy or visit the Queen's Gallery.",
                "cost": { "low": "Free", "medium": "Palace Tour £30", "high": "Complete Tour £50" }
            }
        ],
        
        [
            {
                "time": "10:00 AM",
                "activity": "visit Old Royal Naval College",
                "location": "Old Royal Naval College",
                "description": "Explore this Baroque masterpiece, learn about the history of the British Royal Navy.",
                "cost": { "low": "Painted Hall £12", "medium": "£15+Tour", "high": "Private Tour £30" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Greenwich",
                "location": "Greenwich",
                "description": "Enjoy the lunch in the historical area, enjoy the river views.",
                "cost": { "low": "£10", "medium": "£15", "high": "£20+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit National Maritime Museum",
                "location": "National Maritime Museum",
                "description": "Learn about the history of the British Royal Navy as a maritime power.",
                "cost": { "low": "Free", "medium": "Special Exhibition £10", "high": "Private Tour £25" }
            },
            {
                "time": "04:30 PM",
                "activity": "visit Cutty Sark",
                "location": "Cutty Sark",
                "description": "Explore this well-preserved 19th-century fast sailing ship.",
                "cost": { "low": "£16", "medium": "£18+Tour", "high": "VIP Experience £25" }
            }
        ],
        
        [
            {
                "time": "10:00 AM",
                "activity": "visit Churchill War Rooms",
                "location": "Churchill War Rooms",
                "description": "Explore the underground complex where Winston Churchill directed the war effort during World War II.",
                "cost": { "low": "£23", "medium": "£26+Audio Tour", "high": "Private Tour £35" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at St James's Park",
                "location": "St James's Park",
                "description": "Enjoy the lunch in the historical royal park, enjoy the wildlife.",
                "cost": { "low": "£8", "medium": "£12", "high": "£18" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Imperial War Museum",
                "location": "Imperial War Museum",
                "description": "Explore the history of modern wars and conflicts.",
                "cost": { "low": "Free", "medium": "Donation £5 + Special Exhibition", "high": "Special Exhibition + Tour £20" }
            },
            {
                "time": "04:30 PM",
                "activity": "visit HMS Belfast",
                "location": "HMS Belfast",
                "description": "Explore this WWII cruiser docked on the Thames.",
                "cost": { "low": "£20", "medium": "£23+Tour", "high": "VIP Experience £30" }
            }
        ],
        
        [
            {
                "time": "10:00 AM",
                "activity": "visit London Wall",
                "location": "London Wall",
                "description": "Explore the ancient Roman London Wall ruins, learn about the history of Roman rule.",
                "cost": { "low": "Free", "medium": "Tour £10", "high": "Special Exhibition + Tour £20" }
            },
            {
                "time": "12:00 PM",
                "activity": "Lunch at The City",
                "location": "The City",
                "description": "Enjoy the lunch in the historical area, enjoy the history atmosphere.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "01:30 PM",
                "activity": "visit Museum of London",
                "location": "Natural History Museum",
                "description": "Learn about the complete history development of London from prehistoric times to modern times.",
                "cost": { "low": "Free", "medium": "Donation £5 + Tour", "high": "Private Tour £25" }
            },
            {
                "time": "04:00 PM",
                "activity": "visit St Bartholomew's Church",
                "location": "St Bartholomew's Church",
                "description": "Explore the oldest church in London, built in 1123.",
                "cost": { "low": "£5 Donation", "medium": "£8 Tour", "high": "Private Tour £20" }
            }
        ],
        
        [
            {
                "time": "10:00 AM",
                "activity": "visit British Library",
                "location": "British Library",
                "description": "Enjoy the history collection from Magna Carta to Shakespeare's manuscripts.",
                "cost": { "low": "Free", "medium": "Special Exhibition £12", "high": "Special Exhibition + Tour £25" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at British Library",
                "location": "British Library",
                "description": "Enjoy the lunch in the historical area, enjoy the history atmosphere.",
                "cost": { "low": "£10", "medium": "£15", "high": "£20" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Royal Courts of Justice",
                "location": "Royal Courts of Justice",
                "description": "Explore this Gothic building, learn about the history development of the British legal system.",
                "cost": { "low": "Free", "medium": "Tour £10", "high": "Special Exhibition + Tour £25" }
            },
            {
                "time": "04:00 PM",
                "activity": "visit Middle Temple",
                "location": "The Honourable Society of the Middle Temple",
                "description": "Explore the history of the oldest law school in England, learn about the history of the British legal system.",
                "cost": { "low": "£5 Donation", "medium": "£10 Tour", "high": "Special Exhibition + Tour £20" }
            }
        ]
    ],
    
    "architecture": [
  
        [
            {
                "time": "09:30 AM",
                "activity": "visit St Paul's Cathedral",
                "location": "St Paul's Cathedral",
                "description": "Explore this Baroque church designed by Christopher Wren, enjoy the city views from the top of the dome.",
                "cost": { "low": "£18", "medium": "£21+Audio Tour", "high": "£30 Private Tour" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Paternoster Square",
                "location": "Paternoster Square",
                "description": "Enjoy the lunch in the modern square, enjoy the city views.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Tower of London",
                "location": "Tower of London",
                "description": "Explore this Norman castle built in the 11th century, learn about the history of the Royal Fortress.",
                "cost": { "low": "£25", "medium": "£29.90+Tour", "high": "£40 Early Entry + Jewels Room" }
            },
            {
                "time": "04:30 PM",
                "activity": "visit Tower Bridge",
                "location": "Tower Bridge",
                "description": "Visit this Victorian engineering masterpiece, learn about the construction process and mechanical principles.",
                "cost": { "low": "£10", "medium": "£12+Tour", "high": "£25 Private Tour" }
            }
        ],
        [
            {
                "time": "10:00 AM",
                "activity": "visit Westminster Abbey",
                "location": "Westminster Abbey",
                "description": "Explore this Gothic church, enjoy the complex architectural features and historical significance.",
                "cost": { "low": "£24", "medium": "£27+Audio Tour", "high": "£40 Private Tour" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Parliament Square",
                "location": "Parliament Square",
                "description": "Enjoy the lunch in the historical area, enjoy the city views.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Houses of Parliament",
                "location": "Houses of Parliament",
                "description": "Learn about the history and architectural features of this Gothic Revival building.",
                "cost": { "low": "Free", "medium": "Tour £25", "high": "VIP Tour £40" }
            },
            {
                "time": "04:30 PM",
                "activity": "visit Buckingham Palace",
                "location": "Buckingham Palace",
                "description": "Enjoy the history collection from Magna Carta to Shakespeare's manuscripts.",
                "cost": { "low": "Free", "medium": "Palace Tour £30", "high": "Complete Tour £50" }
            }
        ],
        
        [
            {
                "time": "10:00 AM",
                "activity": "visit Tate Modern",
                "location": "Tate Modern",
                "description": "Enjoy the history collection from Magna Carta to Shakespeare's manuscripts.",
                "cost": { "low": "Free", "medium": "Special Exhibition £15", "high": "Special Exhibition + Tour £25" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Southbank",
                "location": "Southbank",
                "description": "Enjoy the lunch in the historical area, enjoy the city views.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit The Shard View",
                "location": "The Shard",
                "description": "Ascend London's tallest building and enjoy panoramic views from the 72nd floor.",
                "cost": { "low": "Advance Ticket £25", "medium": "On-the-day £32", "high": "VIP Skip-the-line £45+" }
            },
            {
                "time": "04:00 PM",
                "activity": "visit Borough Market",
                "location": "Borough Market",
                "description": "Stroll through London's most famous food market, sample local and international delicacies.",
                "cost": { "low": "Free to browse", "medium": "£10-15 for snacks", "high": "£25+ for meal and drinks" }
            }
        ],
        
        [
            {
                "time": "10:00 AM",
                "activity": "visit 30 St Mary Axe (The Gherkin)",
                "location": "The Gherkin",
                "description": "Enjoy the history collection from Magna Carta to Shakespeare's manuscripts.",
                "cost": { "low": "Free", "medium": "Tour £18", "high": "Special Exhibition + Tour £30" }
            },
            {
                "time": "12:00 PM",
                "activity": "Lunch at Leadenhall Market",
                "location": "Leadenhall Market",
                "description": "Enjoy the history collection from Magna Carta to Shakespeare's manuscripts.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit The Walkie Talkie",
                "location": "The Walkie Talkie",
                "description": "Enjoy the history collection from Magna Carta to Shakespeare's manuscripts.",
                "cost": { "low": "Free", "medium": "Tour £15-25", "high": "VIP Restaurant £50+" }
            },
            {
                "time": "04:30 PM",
                "activity": "visit The Cheesegrater",
                "location": "The Cheesegrater",
                "description": "Enjoy the history collection from Magna Carta to Shakespeare's manuscripts.",
                "cost": { "low": "Free", "medium": "Selfie Photo £0", "high": "Nearby Building Tour £20" }
            }
        ],
        
        [
            {
                "time": "10:30 AM",
                "activity": "visit Barbican Centre",
                "location": "Barbican Centre",
                "description": "Explore this Brutalist building, learn about the history of the post-war modernist architecture.",
                "cost": { "low": "Free", "medium": "Tour £15", "high": "Special Exhibition + Tour £30" }
            },
            {
                "time": "01:00 PM",
                "activity": "Lunch at Barbican Centre",
                "location": "Barbican Centre",
                "description": "Enjoy the history collection from Magna Carta to Shakespeare's manuscripts.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "02:30 PM",
                "activity": "visit Goldsmiths Centre",
                "location": "Goldsmiths Centre",
                "description": "Explore this innovative building combining history and modern elements.",
                "cost": { "low": "Free", "medium": "Exhibition £8", "high": "Workshop £25" }
            },
            {
                "time": "04:30 PM",
                "activity": "visit National Theatre",
                "location": "National Theatre",
                "description": "Explore this Brutalist building, learn about the history of the post-war modernist architecture.",
                "cost": { "low": "Free", "medium": "Tour £13.50", "high": "Special Exhibition + Tour £25" }
            }
        ],
        
        [
            {
                "time": "10:00 AM",
                "activity": "visit Old Royal Naval College",
                "location": "Old Royal Naval College",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "£12", "medium": "£15+Tour", "high": "£30" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Greenwich Market",
                "location": "Greenwich Market",
                "description": "Enjoy the history collection from Magna Carta to Shakespeare's manuscripts.",
                "cost": { "low": "£10", "medium": "£15", "high": "£20+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Royal Observatory",
                "location": "Royal Observatory",
                "description": "Explore this scientific building, learn about the history of the navigation and timekeeping.",
                "cost": { "low": "£16", "medium": "£18", "high": "£25" }
            },
            {
                "time": "04:30 PM",
                "activity": "visit Queen's House",
                "location": "Queen's House",
                "description": "Enjoy the history collection from Magna Carta to Shakespeare's manuscripts.",
                "cost": { "low": "Free", "medium": "Tour £10", "high": "Special Exhibition + Tour £25" }
            }
        ],
        
        [
            {
                "time": "10:00 AM",
                "activity": "visit Sir John Soane's Museum",
                "location": "Sir John Soane's Museum",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Donation £5", "high": "Special Exhibition + Tour £25" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Covent Garden",
                "location": "Covent Garden",
                "description": "Enjoy the history collection from Magna Carta to Shakespeare's manuscripts.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit St Dunstan in the East",
                "location": "St Dunstan in the East",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £15", "high": "Special Exhibition + Tour £30" }
            },
            {
                "time": "04:00 PM",
                "activity": "visit London Transport Museum",
                "location": "London Transport Museum",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "£30", "medium": "£40", "high": "£50VIP" }
            }
        ]
    ],
    

    
    "hiking": [
       
        [
            {
                "time": "09:00 AM",
                "activity": "Hampstead Heath",
                "location": "Hampstead Heath",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £10", "high": "Special Exhibition + Tour £30" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Hampstead Village",
                "location": "Hampstead Village",
                "description": "Enjoy the history collection from Magna Carta to Shakespeare's manuscripts.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Kenwood House",
                "location": "Kenwood House",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £10", "high": "Special Exhibition + Tour £30" }
            },
            {
                "time": "04:00 PM",
                "activity": "visit Highgate Cemetery",
                "location": "Highgate Cemetery",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "East £4.5", "medium": "East + West £14", "high": "Private Tour £25" }
            }
        ],

        [
            {
                "time": "09:30 AM",
                "activity": "Thames Path",
                "location": "Thames Path",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £15", "high": "Special Exhibition + Tour £30" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Southbank",
                "location": "Southbank",
                "description": "Enjoy the history collection from Magna Carta to Shakespeare's manuscripts.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Tower Bridge",
                "location": "Tower Bridge",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "£10", "medium": "£12+Tour", "high": "Private Tour £25" }
            },
            {
                "time": "04:00 PM",
                "activity": "continue Thames Path",
                "location": "Thames Path East",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £15", "high": "Special Exhibition + Tour £30" }
            }
        ],

        
        [
            {
                "time": "09:30 AM",
                "activity": "Regent's Canal",
                "location": "Regent's Canal",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £12", "high": "Private Tour £30" }
            },
            {
                "time": "12:30 PM",
                "activity": "visit Camden Market",
                "location": "Camden Market",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £10-15", "high": "£20+精品购物" }
            },
            {
                "time": "02:00 PM",
                "activity": "continue Regent's Canal",
                "location": "Islington",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "£10-15", "medium": "£15-25", "high": "£25+" }
            }
        ],

       
        [
            {
                "time": "10:00 AM",
                "activity": "walk through Hyde Park",
                "location": "Hyde Park",
                "description": "Enjoy a peaceful walk around Serpentine Lake and Kensington Gardens.",
                "cost": { "low": "Free", "medium": "Bike rental £10", "high": "Picnic £20+" }
            },
            {
                "time": "01:00 PM",
                "activity": "Lunch at Serpentine Bar & Kitchen",
                "location": "Hyde Park",
                "description": "Enjoy lakeside dining with views of the water.",
                "cost": { "low": "£10", "medium": "£15-20", "high": "£25+" }
            },
            {
                "time": "03:00 PM",
                "activity": "visit Kensington Palace Gardens",
                "location": "Kensington Gardens",
                "description": "Stroll among statues, fountains and floral landscapes.",
                "cost": { "low": "Free", "medium": "——", "high": "——" }
            }
        ],

       
        [
            {
                "time": "10:00 AM",
                "activity": "walk around Little Venice",
                "location": "Little Venice",
                "description": "Wander along canals with colorful boats and cafés.",
                "cost": { "low": "Free", "medium": "Boat ride £10", "high": "Brunch cruise £25+" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Clifton Nurseries café",
                "location": "Warwick Avenue",
                "description": "Enjoy a light meal in a charming greenhouse café.",
                "cost": { "low": "£10", "medium": "£15-20", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "explore Paddington Basin",
                "location": "Paddington",
                "description": "Relax by the water with modern architecture and gardens.",
                "cost": { "low": "Free", "medium": "Snack £5", "high": "Canal kayak £20" }
            }
        ],

       
        [
            {
                "time": "10:30 AM",
                "activity": "visit British Library courtyard",
                "location": "British Library",
                "description": "Wander among sculptures and literary landmarks outside the library.",
                "cost": { "low": "Free", "medium": "Coffee break £5", "high": "——" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at King's Cross Canopy Market",
                "location": "King's Cross",
                "description": "Enjoy street food and artisanal stalls in a vibrant setting.",
                "cost": { "low": "£10", "medium": "£15-20", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "walk through Coal Drops Yard",
                "location": "King's Cross",
                "description": "Explore a blend of historic viaducts and modern design shops.",
                "cost": { "low": "Free", "medium": "Small shopping £10", "high": "Art object £30+" }
            }
        ],

       
        [
            {
                "time": "10:00 AM",
                "activity": "visit Greenwich Park",
                "location": "Greenwich",
                "description": "Stroll through one of London's most scenic royal parks with hilltop views.",
                "cost": { "low": "Free", "medium": "Coffee/snack £5", "high": "Picnic + views £20" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Greenwich Market",
                "location": "Greenwich",
                "description": "Try street food or local bakery items in this charming market.",
                "cost": { "low": "£8", "medium": "£12-15", "high": "£25+" }
            },
            {
                "time": "02:00 PM",
                "activity": "walk along Thames riverside to Cutty Sark",
                "location": "Greenwich Pier",
                "description": "Enjoy riverside peace and visit the historic sailing ship exterior.",
                "cost": { "low": "Free", "medium": "Tea break £5", "high": "Gift shop £20+" }
            }
        ]
    ],
    
    "wildlife": [
        [
            {
                "time": "09:30 AM",
                "activity": "visit London Zoo",
                "location": "London Zoo",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "£27", "medium": "£30+Tour", "high": "£50VIP Experience" }
            },
            {
                "time": "01:00 PM",
                "activity": "Lunch at London Zoo",
                "location": "London Zoo",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "£10", "medium": "£15", "high": "£20" }
            },
            {
                "time": "02:30 PM",
                "activity": "Extra Activity",
                "location": "London Zoo",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Extra Activity £5", "high": "Behind the Scenes £25" }
            },
            {
                "time": "04:30 PM",
                "activity": "walk in Regent's Park",
                "location": "Regent's Park",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £10", "high": "Photography Tour £25" }
            }
        ],
        
        [
            {
                "time": "10:00 AM",
                "activity": "visit London Wetland Centre",
                "location": "London Wetland Centre",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "£13.40", "medium": "£15+Binoculars Rental", "high": "£25Tour" }
            },
            {
                "time": "01:00 PM",
                "activity": "Lunch at London Wetland Centre",
                "location": "London Wetland Centre",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "£8", "medium": "£12", "high": "£18" }
            },
            {
                "time": "02:30 PM",
                "activity": "Extra Activity",
                "location": "London Wetland Centre",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Extra Activity £5", "high": "Expert Tour £15" }
            },
            {
                "time": "04:30 PM",
                "activity": "walk in Barnes",
                "location": "Barnes",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Wildlife Tour £10", "high": "Private Tour £25" }
            }
        ],
        
        [
            {
                "time": "09:00 AM",
                "activity": "visit Richmond Park",
                "location": "Richmond Park",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £12", "high": "Photography Tour £30" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Pembroke Lodge",
                "location": "Richmond Park",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "£10", "medium": "£15", "high": "£25" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Isabella Plantation",
                "location": "Isabella Plantation",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £10", "high": "Expert Tour £20" }
            },
            {
                "time": "04:30 PM",
                "activity": "walk in Richmond Riverside",
                "location": "Richmond Riverside",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Wildlife Guide £5", "high": "Tour £15" }
            }
        ],
        
        [
            {
                "time": "10:00 AM",
                "activity": "visit Hackney City Farm",
                "location": "Hackney City Farm",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free/Donation", "medium": "Tour £5", "high": "Workshop £15" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Farm Cafe",
                "location": "Hackney City Farm",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "£10", "medium": "£15", "high": "£20" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit The London Honey Company",
                "location": "The London Honey Company",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "£5 Visit", "medium": "£15 Tour", "high": "£25 Beekeeping Experience" }
            },
            {
                "time": "04:00 PM",
                "activity": "visit Spitalfields City Farm",
                "location": "Spitalfields City Farm",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free/Donation", "medium": "Tour £5", "high": "Feeding Animal Experience £10" }
            }
        ],
        
        [
            {
                "time": "09:30 AM",
                "activity": "watch birds in St James's Park",
                "location": "St James's Park",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £8", "high": "Photography Tour £20" }
            },
            {
                "time": "12:00 PM",
                "activity": "Lunch at St James's Park",
                "location": "St James's Park",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "£8", "medium": "£12", "high": "£18" }
            },
            {
                "time": "01:30 PM",
                "activity": "watch wildlife in Hyde Park",
                "location": "Hyde Park",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £10", "high": "Expert Tour £25" }
            },
            {
                "time": "04:00 PM",
                "activity": "visit Holland Park",
                "location": "Holland Park",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £8", "high": "Workshop £15" }
            }
        ],
        
        [
            {
                "time": "10:00 AM",
                "activity": "visit Woodberry Wetlands",
                "location": "Woodberry Wetlands",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £8", "high": "Private Tour £20" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Coal House",
                "location": "Woodberry Wetlands",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "£8", "medium": "£12", "high": "£18" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Walthamstow Wetlands",
                "location": "Walthamstow Wetlands",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £10", "high": "Photography Tour £25" }
            },
            {
                "time": "04:30 PM",
                "activity": "watch birds in Walthamstow Wetlands",
                "location": "Walthamstow Wetlands",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "£5", "medium": "£12", "high": "£20" }
            }
        ],
        
        [
            {
                "time": "09:00 AM",
                "activity": "visit Lee Valley Park",
                "location": "Lee Valley Park",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £10", "high": "Private Tour £25" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Visitor Center",
                "location": "Lee Valley Park",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "£8", "medium": "£12", "high": "£18" }
            },
            {
                "time": "02:00 PM",
                "activity": "watch river wildlife",
                "location": "Lee Valley Park",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "£12", "medium": "£20", "high": "£35" }
            },
            {
                "time": "04:30 PM",
                "activity": "visit Raptor Center",
                "location": "Lee Valley Park",
                "description": "Explore this Baroque building群, enjoy the city views.",
                "cost": { "low": "£8", "medium": "£12+Feeding Experience", "high": "£25 Care Experience" }
            }
        ]
    ],
    
    "national parks": [
        [
            {
                "time": "09:30 AM",
                "activity": "visit Kew Gardens",
                "location": "Kew Gardens",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "£17", "medium": "£19.50+Tour", "high": "£35 Private Tour" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at The Orangery",
                "location": "Kew Gardens",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "£12", "medium": "£18", "high": "£25" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Palm House",
                "location": "Kew Gardens",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "£5", "medium": "£15", "high": "£25" }
            },
            {
                "time": "04:00 PM",
                "activity": "walk in Tree Canopy Walk",
                "location": "Kew Gardens",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "£5", "medium": "£15", "high": "£25" }
            }
        ],
        
        [
            {
                "time": "10:00 AM",
                "activity": "visit Greenwich Park",
                "location": "Greenwich Park",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £10", "high": "History Walk £20" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Greenwich Park",
                "location": "Greenwich Park",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "£10", "medium": "£15", "high": "£20" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Royal Observatory",
                "location": "Royal Observatory",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "£16", "medium": "£18+Tour", "high": "£25 Private Tour" }
            },
            {
                "time": "04:30 PM",
                "activity": "visit Deer Park",
                "location": "Greenwich Park",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £8", "high": "Feeding Experience £15" }
            }
        ],
        
        [
            {
                "time": "09:30 AM",
                "activity": "visit Richmond Park",
                "location": "Richmond Park",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £12", "high": "Photography Tour £30" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Richmond Park",
                "location": "Richmond Park",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "£8", "medium": "£15", "high": "£25" }
            },
            {
                "time": "02:30 PM",
                "activity": "visit London Wetland Centre",
                "location": "London Wetland Centre",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "£13.40", "medium": "£15+Tour", "high": "£25 Expert Tour" }
            },
            {
                "time": "05:00 PM",
                "activity": "watch birds at London Wetland Centre",
                "location": "London Wetland Centre",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "Included in ticket", "medium": "Evening Tour £8", "high": "Photography Tour £20" }
            }
        ],
        
        [
            {
                "time": "09:00 AM",
                "activity": "visit Hampstead Heath",
                "location": "Hampstead Heath",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £10", "high": "Private Tour £25" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Parliament Hill",
                "location": "Hampstead Heath",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "£8", "medium": "£15", "high": "£25" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Kenwood House",
                "location": "Hampstead Heath",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £8", "high": "Private Tour £20" }
            },
            {
                "time": "04:00 PM",
                "activity": "swim in Hampstead Heath Ponds",
                "location": "Hampstead Heath",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "£4", "medium": "£4+Facilities", "high": "£10 Instructor Guide" }
            }
        ],
        
        [
            {
                "time": "10:00 AM",
                "activity": "visit Lee Valley Park",
                "location": "Lee Valley Park",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £10", "high": "Private Tour £25" }
            },
            {
                "time": "12:30 PM",
                "activity": "Lunch at Visitor Center",
                "location": "Lee Valley Park",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "£10", "medium": "£15", "high": "£20" }
            },
            {
                "time": "02:00 PM",
                "activity": "rowing or canoeing",
                "location": "Lee Valley White Water Centre",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "£15", "medium": "£25", "high": "£50 Professional Guide" }
            },
            {
                "time": "04:30 PM",
                "activity": "visit Lee Valley Park Farms",
                "location": "Lee Valley Park Farms",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "£10", "medium": "£12+Feeding Experience", "high": "£20 VIP Experience" }
            }
        ],
        
        [
            {
                "time": "09:30 AM",
                "activity": "visit Epping Forest",
                "location": "Epping Forest",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £12", "high": "Private Tour £30" }
            },
            {
                "time": "12:30 PM",
                "activity": "forest picnic",
                "location": "Epping Forest",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "£8 Self-packed", "medium": "£15 Prepared Picnic", "high": "£25 Premium Picnic" }
            },
            {
                "time": "02:00 PM",
                "activity": "visit Queen Elizabeth's Hunting Lodge",
                "location": "Epping Forest",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £5", "high": "History Lecture £15" }
            },
            {
                "time": "04:00 PM",
                "activity": "cycling in Epping Forest",
                "location": "Epping Forest",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "£15 Rental", "medium": "£25 Rental+Guide", "high": "£45 Guide+Advanced Bike" }
            }
        ],
        
        [
            {
                "time": "10:00 AM",
                "activity": "visit Colne Valley Regional Park",
                "location": "Colne Valley Regional Park",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £10", "high": "Private Guide £25" }
            },
            {
                "time": "01:00 PM",
                "activity": "Lunch at Denham Country Club",
                "location": "Denham Country Club",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "£15", "medium": "£25", "high": "£35+" }
            },
            {
                "time": "02:00 PM",
                "activity": "hiking in Fray's Farm Meadows",
                "location": "Fray's Farm Meadows",
                "description": "Explore this Baroque building, enjoy the city views.",
                "cost": { "low": "Free", "medium": "Tour £8", "high": "Eco-expert Guide £20" }
            }
        ]
    ]
};

/**

 * @param {Object} options config options
 * @returns {Array} trip plan
 */
function generateTripPlan(options) {
    const { days = 3, interests = [], budget = "medium", travelMode = "public transport" } = options;
    
    console.log('mockData2.generateTripPlan was called with parameters:', options);
    
    // store the global visited locations to avoid duplicate visits on different days
    const globalVisitedLocations = new Set();
    
    // store the used option indices for each interest category
    const usedOptionIndices = {};
    
    // the final generated trip plan
    const result = [];
    
    // calculate the transport time adjustment (different transport modes consume different time)
    const transportTimeAdjustment = {
        "walking": 1.5,       // walking consumes more time
        "bike": 1.2,          // cycling is slightly faster than walking
        "public transport": 1, // standard time
        "guided tours": 0.9,   // guided tours usually optimize the route
        "rental car": 0.8,     // rental car is faster
        "private car": 0.7     // private car is the fastest
    };
    
    // create the trip plan for each day
    for (let dayIndex = 0; dayIndex < days; dayIndex++) {
        // the current interest category - if the user provides multiple interests, randomly select one
        let currentInterest = "general"; // default to use general generic itinerary
        
        if (interests.length > 0) {
            if (interests.length === 1) {
                // if there is only one interest, directly use it
                currentInterest = interests[0];
            } else {
                // if there are multiple interests (especially two), randomly select one
                const randomIndex = Math.floor(Math.random() * interests.length);
                currentInterest = interests[randomIndex];
            }
        }
            
        console.log(`The interest category used on day ${dayIndex + 1}:`, currentInterest);
            
        // determine the maximum number of activities that can be arranged on that day
        const maxActivities = calculateMaxActivities(budget, travelMode, dayIndex);
        
        // the day trip plan
        let dayPlan = {
            day: dayIndex + 1,
            activities: []
        };
        
        if (currentInterest && INTEREST_ITINERARIES[currentInterest]) {
            // if there is a specified interest, use the corresponding itinerary data
            const interestOptions = INTEREST_ITINERARIES[currentInterest];
            console.log(`Found ${currentInterest} itinerary options:`, interestOptions.length);
            
            // initialize the used option indices for the current interest category
            if (!usedOptionIndices[currentInterest]) {
                usedOptionIndices[currentInterest] = new Set();
            }
            
            let optionIndex;
            let availableIndices = [];
            
            // find all unused indices
            for (let i = 0; i < interestOptions.length; i++) {
                if (!usedOptionIndices[currentInterest].has(i)) {
                    availableIndices.push(i);
                }
            }
            
            // if there are no available indices, reset (all marked as unused)
            if (availableIndices.length === 0) {
                usedOptionIndices[currentInterest].clear();
                for (let i = 0; i < interestOptions.length; i++) {
                    availableIndices.push(i);
                }
            }
            
            // randomly select an available index
            const randomIdx = Math.floor(Math.random() * availableIndices.length);
            optionIndex = availableIndices[randomIdx];
            
            // mark the index as used
            usedOptionIndices[currentInterest].add(optionIndex);
            
            console.log(`Randomly selected the ${optionIndex+1}th itinerary option of ${currentInterest}`);
            
            // select activities from the itinerary option
            let activitiesFromOption = [...interestOptions[optionIndex]];
            
            // enhance the activity filtering conditions, especially for Camden Market lunch situations
            // filter out non-lunch activities (usually lunch activities contain "lunch" or "lunch" keywords)
            const nonLunchActivities = activitiesFromOption.filter(activity => {
                // check the lunch related keywords in multiple fields
                const lunchKeywords = [
                    "lunch", "lunch", "eat", "dining", "dine", "food", "deal", 
                    "canteen", "restaurant", "cafe", "coffee", "coffee", "market",
                    "meal", "cuisine"
                ];
                
                // check the activity name, location and description
                const activityText = (
                    activity.activity.toLowerCase() + " " + 
                    activity.location.toLowerCase() + " " + 
                    activity.description.toLowerCase()
                );
                
                // check if the activity contains the lunch related keywords
                for (const keyword of lunchKeywords) {
                    if (activityText.includes(keyword)) {
                        // the time is between 11:00 AM and 2:00 PM, it is likely a lunch activity
                        if (activity.time) {
                            const timeInMinutes = parseTimeToMinutes(activity.time);
                            // 11:00 AM - 2:00 PM (660-840 minutes) is a typical lunch time
                            if (timeInMinutes >= 660 && timeInMinutes <= 840) {
                                return false; // filter out lunch activities
                            }
                        }
                    }
                }
                
                return true; // keep non-lunch activities
            });
            
            // optimize: reorder the activities based on the location, so that the activities close to each other are arranged together
            if (nonLunchActivities.length > 0 && nonLunchActivities.length > maxActivities) {
                // use the greedy algorithm to select the activities close to each other
                // always keep the first activity as the starting point
                const firstActivity = nonLunchActivities[0];
                const candidateActivities = nonLunchActivities.slice(1);
                
                // sort the remaining activities based on the distance to the first activity
                if (LONDON_COORDINATES[firstActivity.location]) {
                    const startCoord = LONDON_COORDINATES[firstActivity.location];
                    
                    // sort the remaining activities based on the distance to the first activity
                    candidateActivities.sort((a, b) => {
                        const aCoord = LONDON_COORDINATES[a.location];
                        const bCoord = LONDON_COORDINATES[b.location];
                        
                        if (!aCoord) return 1;
                        if (!bCoord) return -1;
                        
                        const distA = calculateDistance(startCoord, aCoord);
                        const distB = calculateDistance(startCoord, bCoord);
                        
                        return distA - distB;
                    });
                    
                    // prioritize the activities close to each other
                    const optimizedActivities = [firstActivity];
                    let lastCoord = startCoord;
                    
                    // select the nearest point, build the path
                    while (optimizedActivities.length < maxActivities && candidateActivities.length > 0) {
                        let bestIdx = 0;
                        let bestDistance = 999;
                        
                        // find the nearest point
                        for (let i = 0; i < candidateActivities.length; i++) {
                            if (!LONDON_COORDINATES[candidateActivities[i].location]) continue;
                            
                            const dist = calculateDistance(
                                lastCoord, 
                                LONDON_COORDINATES[candidateActivities[i].location]
                            );
                            
                            if (dist < bestDistance) {
                                bestDistance = dist;
                                bestIdx = i;
                            }
                        }
                        
                        // add to the optimized itinerary
                        const nextActivity = candidateActivities[bestIdx];
                        optimizedActivities.push(nextActivity);
                        
                        // update the last location
                        lastCoord = LONDON_COORDINATES[nextActivity.location];
                        
                        // remove from the candidate list
                        candidateActivities.splice(bestIdx, 1);
                    }
                    
                    activitiesFromOption = optimizedActivities;
                } else {
                    // if the first location has no coordinates, simply截取前maxActivities个
                    activitiesFromOption = nonLunchActivities.slice(0, maxActivities);
                }
            } else if (nonLunchActivities.length > maxActivities) {
                // simply
                activitiesFromOption = nonLunchActivities.slice(0, maxActivities);
            } else {
                // if there are not enough non-lunch activities, directly use all non-lunch activities
                activitiesFromOption = nonLunchActivities;
            }
            
   
            activitiesFromOption = activitiesFromOption.map((activity, index) => {
                const activityTime = activity.time;
                // parse the time
                const timeMatch = activityTime.match(/(\d+):(\d+)\s+(AM|PM)/);
                if (timeMatch) {
                    let hours = parseInt(timeMatch[1]);
                    let minutes = parseInt(timeMatch[2]);
                    const period = timeMatch[3];
                    
                    // convert to 24 hours format
                    if (period === 'PM' && hours < 12) hours += 12;
                    if (period === 'AM' && hours === 12) hours = 0;
                    
                    // check if it is the lunch time (11:30 AM - 2:00 PM), if so, adjust the time
                    // the activities in the morning are arranged earlier, and the activities in the afternoon are arranged later
                    if (hours >= 11.5 && hours < 14) {
                        if (index > 0) { // not the first activity, it means the activity is in the afternoon, delay to 2PM
                            hours = 14 + (index - 1);
                            minutes = 0;
                        } else { // the first activity, delay to 10AM
                            hours = 10;
                            minutes = 0;
                        }
                    }
                    
                    // convert to 12 hours format
                    let newPeriod = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    if (hours === 0) hours = 12;
                    
                    // format the new time
                    activity.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${newPeriod}`;
                }
                return activity;
            });
            
            // sort the activities based on the time
            activitiesFromOption.sort((a, b) => {
                const aTime = parseTimeToMinutes(a.time);
                const bTime = parseTimeToMinutes(b.time);
                return aTime - bTime;
            });
            
            // filter the activities that have not been visited
            let availableActivities = activitiesFromOption.filter(activity => 
                !globalVisitedLocations.has(activity.location)
            );
            
            // if there are not enough available activities, relax the limit
            if (availableActivities.length < Math.min(2, maxActivities)) {
                // reselect from all options, but avoid the recently visited locations
                availableActivities = interestOptions[optionIndex].filter(activity => 
                    !Array.from(globalVisitedLocations).slice(-5).includes(activity.location)
                );
            }
            
            // finally determine the activities for that day
            const finalActivities = availableActivities.slice(0, maxActivities);
            
            // add the budget and transport mode information to the activities
            finalActivities.forEach(activity => {
                // record the visited locations
                globalVisitedLocations.add(activity.location);
                
                // add the budget related description
                activity.costDescription = activity.cost ? activity.cost[budget] : "unknown";
                
                // adjust the time description based on the transport mode
                if (dayPlan.activities.length > 0 && 
                    LONDON_COORDINATES[activity.location] && 
                    LONDON_COORDINATES[dayPlan.activities[dayPlan.activities.length-1].location]) {
                    
                    // calculate the distance to the previous location
                    const prevLocation = dayPlan.activities[dayPlan.activities.length-1].location;
                    const distance = calculateDistance(
                        LONDON_COORDINATES[prevLocation],
                        LONDON_COORDINATES[activity.location]
                    );
                    
                    // add the transport information
                    activity.transport = {
                        mode: travelMode,
                        description: TRANSPORT_DESCRIPTIONS[travelMode],
                        distance: distance.toFixed(1) + " km",
                        estimatedTime: Math.round(distance * transportTimeAdjustment[travelMode] * 15) + " minutes"
                    };
                }
            });
            
            dayPlan.activities = finalActivities;
        } else {


            dayPlan.activities = [
                {
                    "time": "10:00 AM",
                    "activity": "explore London Center",
                    "location": "Trafalgar Square",
                    "description": "Explore this Baroque building, enjoy the city views.",
                    "costDescription": "Free"
                },
                {
                    "time": "02:00 PM",
                    "activity": "visit Museum/Art Gallery",
                    "location": "British Museum",
                    "description": "Explore this Baroque building, enjoy the city views.",
                    "costDescription": "Free"
                },
                {
                    "time": "04:00 PM",
                    "activity": "visit London Eye",
                    "location": "London Eye",
                    "description": "Explore this Baroque building, enjoy the city views.",
                    "costDescription": budget === "low" ? "£25 Standard Ticket" : budget === "medium" ? "£35 Fast Track" : "£45 VIP Experience"
                }
            ];
            
            // if the budget is medium or high and the activities are more than 4, add more activities
            if ((budget === "medium" || budget === "high") && maxActivities > 4) {
                dayPlan.activities.push({
                    "time": "06:00 PM",
                    "activity": "visit Trafalgar Square at night",
                    "location": "Trafalgar Square",
                    "description": "Explore this Baroque building, enjoy the city views.",
                    "costDescription": "Free"
                });
            }
        }
        
        // add the accommodation suggestion
        dayPlan.accommodation = BUDGET_FACTORS[budget].accommodationSuggestion;
        
        result.push(dayPlan);
    }
    
    return result;
}

/**
 * calculate the distance between two points (in kilometers)
 * @param {Object} point1 the first coordinate point {lat, lng}
 * @param {Object} point2 the second coordinate point {lat, lng}
 * @returns {Number} the distance (in kilometers)
 */
function calculateDistance(point1, point2) {
    if (!point1 || !point2) return 999;
    
    const R = 6371; // the radius of the earth (in kilometers)
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
}

// create the export object
const mockData2 = {
    generateTripPlan,
    INTEREST_ITINERARIES,
    LONDON_COORDINATES,
    BUDGET_FACTORS,
    TRANSPORT_DESCRIPTIONS
};

// compatible with Node.js and browser environment
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = mockData2;
} else {
    // browser environment
    global.mockData2 = mockData2;
}

})(typeof window !== 'undefined' ? window : global);
