// 全局变量
let mapInitialized = false;
let chartsInitialized = false;
let map;
let visitorData = [];
let countryCenters = {};
let countryNameMap = {}; // map the country name in the csv to the country name in the countryCenters

// execute initialization after the page loads
document.addEventListener('DOMContentLoaded', function() {
    // get the scroll container and all sections
    const scrollContainer = document.querySelector('.scroll-container');
    const sections = document.querySelectorAll('.section');
    
    // listen to the scroll event
    scrollContainer.addEventListener('scroll', function() {
        // get the current scroll position
        const scrollPosition = scrollContainer.scrollTop;
        
        // check if each section is in the view
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            // if the section is the map section and in the view, ensure the map and charts are initialized
            if (section.id === 'map' && 
                scrollPosition >= sectionTop - 300 &&
                scrollPosition < sectionTop + sectionHeight) {
                if (!mapInitialized) {
                    initMap();
                } else {
                    // ensure the map is fully loaded and rendered
                    if (map && map.loaded()) {
                        // trigger a map resize
                        map.resize();
                        
                        // if there is data but the lines are not displayed, try to update the map data
                        if (!map.getLayer('visitor-lines') && visitorData.length > 0) {
                            console.log('detected the map section is visible, but the lines are not displayed, try to update the map data');
                            updateMapData(visitorData);
                        }
                    }
                }
                
                // initialize the charts (if not initialized)
                if (!chartsInitialized) {
                    initCharts();
                }
            }
        });
    });
    
    // load the data
    loadVisitorData();
});

// initialize the country name map
function initCountryNameMap() {
    console.log('initializing the country name map');
    
    // map the market name in the csv to the country name in the countryCenters
    countryNameMap = {
        'FRANCE': 'France',
        'SPAIN': 'Spain',
        'GERMANY': 'Germany',
        'ITALY': 'Italy',
        'NETHERLANDS': 'Netherlands',
        'POLAND': 'Poland',
        'BELGIUM': 'Belgium',
        'USA': 'USA',
        'NORTH AMERICA': 'USA', 
        'CANADA': 'Canada',
        'AUSTRALIA': 'Australia',
        'CHINA': 'China',
        'HONG KONG': 'Hong Kong',
        'JAPAN': 'Japan',
        'INDIA': 'India',
        'BRAZIL': 'Brazil',
        'RUSSIA': 'Russia',
        'UK': 'UK',
        'BRITISH': 'UK',
        'ENGLAND': 'UK',
        'IRELAND': 'Ireland',
        'SWEDEN': 'Sweden',
        'NORWAY': 'Norway',
        'DENMARK': 'Denmark',
        'SWITZERLAND': 'Switzerland',
        'PORTUGAL': 'Portugal',
        'GREECE': 'Greece',
        'TURKEY': 'Turkey',
        'SOUTH AFRICA': 'South Africa',
        'MEXICO': 'Mexico',
        'ARGENTINA': 'Argentina',
        'NEW ZEALAND': 'New Zealand',
        'SOUTH KOREA': 'South Korea',
        'KOREA': 'South Korea',
        'UAE': 'United Arab Emirates',
        'SAUDI ARABIA': 'Saudi Arabia',
        'ISRAEL': 'Israel',
        'EGYPT': 'Egypt',
        'MOROCCO': 'Morocco',
        'THAILAND': 'Thailand',
        'SINGAPORE': 'Singapore',
        'MALAYSIA': 'Malaysia',
        'INDONESIA': 'Indonesia',
        'PHILIPPINES': 'Philippines',
        'VIETNAM': 'Vietnam',
        'TAIWAN': 'Taiwan',
        'CZECH REPUBLIC': 'Czech Republic',
        'HUNGARY': 'Hungary',
        'ROMANIA': 'Romania',
        'BULGARIA': 'Bulgaria',
        'CROATIA': 'Croatia',
        'ESTONIA': 'Estonia',
        'LATVIA': 'Latvia',
        'LITHUANIA': 'Lithuania',
        'SLOVAKIA': 'Slovakia',
        'SLOVENIA': 'Slovenia',
        'LUXEMBOURG': 'Luxembourg',
        'MALTA': 'Malta',
        'CYPRUS': 'Cyprus',
        'ICELAND': 'Iceland',
        'FINLAND': 'Finland',
        'OTHER COUNTRIES': 'Other'
    };
    
    console.log('country name map initialized, there are', Object.keys(countryNameMap).length, 'mappings');
}

// load the visitor data
function loadVisitorData() {
    // initialize the country name map
    initCountryNameMap();
    
    console.log('start loading the csv data...');
    
    // use the path that has been tested successfully
    const csvFilePath = 'https://raw.githubusercontent.com/PhoebeLiuyf/mini-project/main/travel%20data/international-visitors-london-raw.csv';
    
    console.log('try to load the file:', csvFilePath);
    
    fetch(csvFilePath)
        .then(response => {
            console.log('server response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`failed to load the data file (status code: ${response.status})`);
            }
            return response.text();
        })
        .then(csvData => {
            console.log('CSV data obtained, size:', csvData.length, 'bytes');
            
            // view the first few lines of the csv file to understand the data structure
            const firstFewLines = csvData.split('\n').slice(0, 5).join('\n');
            console.log('first few lines of the csv data:', firstFewLines);
            
            // use PapaParse to parse the csv data
            Papa.parse(csvData, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: function(results) {
                    console.log('CSV parsed, field list:', results.meta.fields);
                    
                    if (results.errors && results.errors.length > 0) {
                        console.warn('warning when parsing the csv:', results.errors);
                    }
                    
                    // filter out incomplete data
                    let parsedData = results.data.filter(row => row.quarter && row.market);
                    
                    // find the spend field name (handle possible encoding issues)
                    let spendField = '';
                    let nightsField = '';
                    const fields = results.meta.fields;
                    for (const field of fields) {
                        if (field.includes('Spend')) {
                            spendField = field;
                            console.log('found the spend field:', spendField);
                        }
                        if (field.includes('Nights')) {
                            nightsField = field;
                            console.log('found the nights field:', nightsField);
                        }
                    }
                    
                    // process the csv data, ensure all fields are parsed correctly
                    visitorData = parsedData.map(item => {
                        // process the stay duration number conversion
                        if (item.dur_stay) {
                            // extract the numbers from the string like "1-3 nights"
                            const match = item.dur_stay.match(/(\d+)(?:-(\d+))?/);
                            if (match) {
                                if (match[2]) {
                                    // there is a range, like "1-3", take the middle value
                                    item.stay = item.dur_stay;
                                    item.stay_nights = Math.floor((parseInt(match[1]) + parseInt(match[2])) / 2);
                                } else {
                                    // single value, like "1"
                                    item.stay = item.dur_stay;
                                    item.stay_nights = parseInt(match[1]);
                                }
                            }
                        }
                        
                        // process the spend amount number conversion
                        if (spendField && item[spendField] !== undefined) {
                            // convert the spend from millions of pounds to the average spend per visitor (pounds)
                            const spendMillions = parseFloat(item[spendField]);
                            const visits = parseFloat(item['Visits (000s)'] || 0) * 1000; // convert to the actual number of visitors
                            
                            if (!isNaN(spendMillions) && !isNaN(visits) && visits > 0) {
                                // calculate the average spend per visitor (pounds)
                                item.spend = (spendMillions * 1000000) / visits;
                            } else if (!isNaN(spendMillions)) {
                                // if there is no visitor data, only store the total spend
                                item.spend = spendMillions * 1000000;
                            }
                        }
                        
                        // process the nights field
                        if (nightsField && item[nightsField] !== undefined) {
                            const nightsThousands = parseFloat(item[nightsField]);
                            const visits = parseFloat(item['Visits (000s)'] || 0) * 1000;
                            
                            if (!isNaN(nightsThousands) && !isNaN(visits) && visits > 0) {
                                // calculate the average number of nights per visitor
                                if (!item.stay_nights) {
                                    item.stay_nights = Math.round((nightsThousands * 1000) / visits);
                                }
                            }
                        }
                        
                        // process the purpose and mode of visit
                        item.purpose = item.purpose || '';
                        item.mode = item.mode || '';
                        
                        return item;
                    });
                    
                    console.log('data loaded, there are ' + visitorData.length + ' records');
                    
                    // view the data content
                    if (visitorData.length > 0) {
                        console.log('data sample:', visitorData.slice(0, 3));
                        
                        // check the different markets (countries)
                        const markets = [...new Set(visitorData.map(item => item.market))].sort();
                        console.log('markets (countries) in the data:', markets);
                        
                        // check the distribution of the spend and the stay duration
                        const spendingSummary = visitorData.reduce((summary, item) => {
                            if (item.spend) summary.count++;
                            if (item.spend > 0) summary.valid++;
                            return summary;
                        }, {count: 0, valid: 0});
                        
                        const stayNightsSummary = visitorData.reduce((summary, item) => {
                            if (item.stay_nights) summary.count++;
                            if (item.stay_nights > 0) summary.valid++;
                            return summary;
                        }, {count: 0, valid: 0});
                        
                        console.log(`spend data: ${spendingSummary.count} items, ${spendingSummary.valid} items are valid`);
                        console.log(`stay duration data: ${stayNightsSummary.count} items, ${stayNightsSummary.valid} items are valid`);
                    }
                    
                    if (visitorData.length === 0) {
                        throw new Error('the parsed data is empty');
                    }
                    
                    // initialize the map
                    initMap();
                    
                    // initialize the charts
                    initCharts();
                },
                error: function(error) {
                    console.error('error when parsing the csv data:', error);
                    throw new Error('CSV parsing failed: ' + error.message);
                }
            });
        })
        .catch(error => {
            console.error('error when loading the data:', error);
            
            // show the error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = `
                <h3>failed to load the data file</h3>
                <p>error when loading the csv file</p>
                <p>error details: ${error.message}</p>
                <button id="reload-btn">reload</button>
            `;
            
            document.body.appendChild(errorMessage);
            document.getElementById('reload-btn').addEventListener('click', () => {
                location.reload();
            });
        });
}
// initialize all charts
function initCharts() {
    if (chartsInitialized) {
        return;
    }
    
    // directly create all charts, no need to rely on the filter function
    createCountryDistributionChart(); // directly use the top 10 data
    createStayDurationChart(visitorData);
    createSpendingAnalysisChart(visitorData);
    
    chartsInitialized = true;
    
    // listen to the window size change, adjust the chart size
    window.addEventListener('resize', function() {
        echarts.getInstanceByDom(document.getElementById('country-distribution-chart'))?.resize();
        echarts.getInstanceByDom(document.getElementById('stay-duration-chart'))?.resize();
        echarts.getInstanceByDom(document.getElementById('spending-analysis-chart'))?.resize();
    });
    
    // remove the border and shadow of the chart containers
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.style.border = 'none';
        container.style.boxShadow = 'none';
        container.style.background = 'transparent';
        container.style.padding = '0';
        container.style.margin = '20px 0';
    });
}

// update all charts, remove the filter function
function updateCharts(data) {
    // the top 10 countries chart uses fixed data, no need to update
    createStayDurationChart(data);
    createSpendingAnalysisChart(data);
}

// apple style chart color scheme
const appleChartColors = [
    '#34C759', // green 
    '#007AFF', // blue
    '#FF9500', // orange
    '#AF52DE', // purple
    '#FF2D55', // pink
    '#5AC8FA', // light blue
    '#FF3B30', // red
    '#5E5CE6', // indigo
    '#BF5AF2', // light purple
    '#FFD60A'  // yellow
];

// white theme chart options
function getWhiteStyleOptions() {
    return {
        backgroundColor: 'transparent',
        textStyle: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
            color: '#333333'
        },
        title: {
            textStyle: {
                fontWeight: 600,
                color: '#111111'
            }
        },
        legend: {
            textStyle: {
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
                color: '#333333',
                fontSize: 12
            },
            itemGap: 10,
            itemWidth: 12,
            itemHeight: 12,
            borderRadius: 6
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: 'rgba(0, 0, 0, 0.05)',
            borderWidth: 1,
            textStyle: {
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
                color: '#333333',
                fontSize: 12
            },
            extraCssText: 'border-radius: 12px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);'
        }
    };
}

// country distribution chart
function createCountryDistributionChart(data) {
    const chartDom = document.getElementById('country-distribution-chart');
    if (!chartDom) return;
    
    // use the top 10 countries data in 2023
    const top10CountriesData = [
        { name: "USA", value: 5122 },
        { name: "France", value: 3172 },
        { name: "Germany", value: 2957 },
        { name: "Ireland", value: 2889 },
        { name: "Spain", value: 2210 },
        { name: "Netherlands", value: 1960 },
        { name: "Italy", value: 1696 },
        { name: "Poland", value: 1628 },
        { name: "Australia", value: 1169 },
        { name: "Canada", value: 1003 }
    ];
    
    // sort the data,使其按值从大到小显示
    top10CountriesData.sort((a, b) => b.value - a.value);
    
    const myChart = echarts.init(chartDom);
    
    // the specified color
    const barColor = '#8a88b3';
    
    // simple text format
    const labelFormatter = function(value) {
        const nameMap = {
            'USA': 'USA',
            'France': 'France',
            'Germany': 'Germany',
            'Ireland': 'Ireland',
            'Spain': 'Spain',
            'Netherlands': 'Netherlands',
            'Italy': 'Italy',
            'Poland': 'Poland',
            'Australia': 'Australia',
            'Canada': 'Canada'
        };
        return nameMap[value] || value;
    };
    
    const option = {
        backgroundColor: 'transparent',
        textStyle: {
            fontFamily: '-apple-system, SF Pro Text, SF Pro Icons, Helvetica Neue, Helvetica, Arial, sans-serif',
            color: '#333333'
        },
        grid: {
            left: '7%',
            right: '10%',
            top: '3%',
            bottom: '3%',
            containLabel: true
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: 'rgba(0, 0, 0, 0.05)',
            borderWidth: 1,
            textStyle: {
                color: '#333333',
                fontSize: 12,
                fontFamily: '-apple-system, SF Pro Text, SF Pro Icons, Helvetica Neue, sans-serif'
            },
            formatter: function(params) {
                const data = params[0];
                return `${labelFormatter(data.name)}: ${data.value} thousand people`;
            },
            extraCssText: 'border-radius: 8px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);'
        },
        xAxis: {
            type: 'value',
            axisLabel: {
                show: false
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            }
        },
        yAxis: {
            type: 'category',
            data: top10CountriesData.map(item => item.name),
            axisLabel: {
                fontSize: 11,
                color: '#333333',
                fontWeight: 'normal', // Changed from 500 to normal to remove bold styling
                formatter: labelFormatter
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            }
        },
        series: [{
            name: 'visitor number',
            type: 'bar',
            barWidth: '55%',
            barGap: '5%',
            showBackground: true,
            backgroundStyle: {
                color: 'rgba(0, 0, 0, 0.03)',
                borderRadius: 0
            },
            itemStyle: {
                color: barColor,
                borderRadius: 0
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.1)'
                }
            },
            data: top10CountriesData.map(item => {
                return {
                    value: item.value,
                    itemStyle: {
                        color: barColor
                    }
                };
            }),
            label: {
                show: true,
                position: 'right',
                fontSize: 11,
                color: '#8E8E93',
                formatter: '{c}',
                distance: 5
            }
        }],
        animationDuration: 800,
        animationEasing: 'cubicOut'
    };
    
    myChart.setOption(option);
}

// stay duration analysis chart
function createStayDurationChart(data) {
    const chartDom = document.getElementById('stay-duration-chart');
    if (!chartDom) return;
    
    // define the six continents and the countries belong to them
    const continentCountries = {
        'Asia': ['China', 'Japan', 'South Korea', 'India', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Philippines', 'Vietnam', 'Hong Kong', 'Taiwan', 'Israel', 'UAE', 'Saudi Arabia'],
        'Europe': ['France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Portugal', 'Greece', 'Turkey', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Croatia', 'Estonia', 'Latvia', 'Lithuania', 'Slovakia', 'Slovenia', 'Luxembourg', 'Malta', 'Cyprus', 'Iceland', 'Ireland', 'UK', 'Russia'],
        'North America': ['USA', 'Canada', 'Mexico'],
        'South America': ['Brazil', 'Argentina', 'Colombia', 'Peru', 'Chile', 'Venezuela', 'Ecuador'],
        'Oceania': ['Australia', 'New Zealand'],
        'Africa': ['South Africa', 'Egypt', 'Morocco', 'Nigeria', 'Kenya', 'Tunisia']
    };
    
    // use the country mapping to match the countries in the data to the continents
    const marketToContinent = {};
    Object.entries(continentCountries).forEach(([continent, countries]) => {
        countries.forEach(country => {
            marketToContinent[country] = continent;
            // also add the uppercase form of the country
            marketToContinent[country.toUpperCase()] = continent;
        });
    });
    
    // analyze the stay duration data, group by the number of days, remove "29+ days"
    const durationRanges = ['1-3 days', '4-7 days', '8-14 days', '15-28 days'];
    
    // store the data for each continent
    const continentData = {
        'Asia': { total: 0, durations: {} },
        'Europe': { total: 0, durations: {} },
        'North America': { total: 0, durations: {} },
        'South America': { total: 0, durations: {} },
        'Oceania': { total: 0, durations: {} },
        'Africa': { total: 0, durations: {} }
    };
    
    // initialize the stay duration object for each continent
    Object.keys(continentData).forEach(continent => {
        durationRanges.forEach(range => {
            continentData[continent].durations[range] = 0;
        });
    });
    
    // count the number of visitors in each stay duration range for different continents
    data.forEach(item => {
        if (item.stay_nights && item.market) {
            const nights = parseInt(item.stay_nights);
            // determine the continent of the data
            let continent = marketToContinent[item.market] || 'other';
            
            // non-six continents are classified as other, here is not displayed
            if (!continentData[continent]) {
                return;
            }
            
            let durationRange = '';
            if (nights >= 1 && nights <= 3) {
                durationRange = '1-3 days';
            } else if (nights >= 4 && nights <= 7) {
                durationRange = '4-7 days';
            } else if (nights >= 8 && nights <= 14) {
                durationRange = '8-14 days';
            } else if (nights >= 15 && nights <= 28) {
                durationRange = '15-28 days';
            }
            // remove the judgment for "29+ days"
            
            if (durationRange) {
                continentData[continent].durations[durationRange]++;
                continentData[continent].total++;
            }
        }
    });
    
    // sort the continents by the total number of people, decide the stacking order (the continent with more people is at the bottom)
    const sortedContinents = Object.keys(continentData)
        .sort((a, b) => continentData[b].total - continentData[a].total);
        
    // assign colors based on the sorting result (the continent with more people uses the lightest color)
    const purpleColors = [
        '#c2c0e0', // the lightest purple - the 1st ranked continent
        '#b0aed7', // the 2nd lightest purple
        '#9e9cce', // the 3rd lightest purple
        '#8a88b3', // the 4th lightest purple
        '#78769c', // the 5th lightest purple
        '#656387'  // the darkest purple - the 6th ranked continent
    ];
    
    // assign colors to each continent, based on the number of people
    sortedContinents.forEach((continent, index) => {
        continentData[continent].color = purpleColors[Math.min(index, purpleColors.length - 1)];
    });
    
    const myChart = echarts.init(chartDom);
    
    // prepare the series data - change to horizontal bar chart
    const series = [];
    
    sortedContinents.forEach(continent => {
        series.push({
            name: continent,
            type: 'bar',
            stack: 'total',
            itemStyle: {
                color: continentData[continent].color
            },
            emphasis: {
                focus: 'series'
            },
            data: durationRanges.map(range => continentData[continent].durations[range]),
            label: {
                show: false  // do not show the label for each part
            }
        });
    });
    
    // add the series of total number of people
    series.push({
        name: 'total number of people',
        type: 'bar',
        stack: 'total',
        silent: true,
        itemStyle: {
            borderColor: 'transparent',
            color: 'transparent'
        },
        emphasis: {
            itemStyle: {
                borderColor: 'transparent',
                color: 'transparent'
            }
        },
        data: durationRanges.map(range => {
            const total = sortedContinents.reduce((sum, continent) => 
                sum + continentData[continent].durations[range], 0);
            return {
                value: 0,  // the value is 0, do not change the stacking height
                label: {
                    show: true,
                    position: 'right',  // change to the right position
                    formatter: `{c| ${total}}`,
                    fontSize: 10,
                    color: '#8E8E93',
                    fontWeight: 'normal',
                    rich: {
                        c: {
                            fontSize: 10,
                            color: '#8E8E93',
                            fontWeight: 'normal'
                        }
                    }
                }
            };
        })
    });
    
    const option = {
        backgroundColor: 'transparent',
        textStyle: {
            fontFamily: '-apple-system, SF Pro Text, SF Pro Icons, Helvetica Neue, Helvetica, Arial, sans-serif',
            color: '#333333'
        },
        grid: {
            left: '7%',
            right: '15%',  // increase the right space to display the label
            top: '5%',     // reduce the top space
            bottom: '25%', // increase bottom space for legend
            containLabel: true
        },
        tooltip: {
            show: false  // disable the tooltip hover prompt
        },
        legend: {
            data: sortedContinents,
            bottom: '0',   // place the legend at the bottom
            left: 'center', // center horizontally
            textStyle: {
                fontSize: 11,
                color: '#333333'
            },
            itemWidth: 12,
            itemHeight: 12,
            padding: [10, 0, 0, 0], // increased top padding to avoid overlapping
            itemGap: 8,  // add space between legend items
            zlevel: 10   // higher z-level to ensure visibility
        },
        // key changes: swap the x-axis and y-axis
        yAxis: {  // now the y-axis is the category axis
            type: 'category',
            data: durationRanges,
            axisTick: {
                show: false
            },
            axisLine: {
                show: false
            },
            axisLabel: {
                interval: 0,
                fontSize: 11,
                color: '#333333'
            }
        },
        xAxis: {  // now the x-axis is the value axis
            type: 'value',
            splitLine: {
                lineStyle: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            axisLabel: {
                show: false
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            }
        },
        series: series,
        animationDuration: 800,
        animationEasing: 'cubicOut'
    };
    
    myChart.setOption(option);
}

// spending analysis chart
function createSpendingAnalysisChart(data) {
    const chartDom = document.getElementById('spending-analysis-chart');
    if (!chartDom) return;
    
    // define the six continents and the countries belong to them
    const continentCountries = {
        'Asia': ['China', 'Japan', 'South Korea', 'India', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Philippines', 'Vietnam', 'Hong Kong', 'Taiwan', 'Israel', 'UAE', 'Saudi Arabia'],
        'Europe': ['France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Portugal', 'Greece', 'Turkey', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Croatia', 'Estonia', 'Latvia', 'Lithuania', 'Slovakia', 'Slovenia', 'Luxembourg', 'Malta', 'Cyprus', 'Iceland', 'Ireland', 'UK', 'Russia'],
        'North America': ['USA', 'Canada', 'Mexico'],
        'South America': ['Brazil', 'Argentina', 'Colombia', 'Peru', 'Chile', 'Venezuela', 'Ecuador'],
        'Oceania': ['Australia', 'New Zealand'],
        'Africa': ['South Africa', 'Egypt', 'Morocco', 'Nigeria', 'Kenya', 'Tunisia']
    };
    
    // create the mapping from country to continent
    const marketToContinent = {};
    Object.entries(continentCountries).forEach(([continent, countries]) => {
        countries.forEach(country => {
            marketToContinent[country] = continent;
            // also add the uppercase form of the country
            marketToContinent[country.toUpperCase()] = continent;
        });
    });
    
    // group by the continent and calculate the average spending
    const spendingByContinent = {
        'Asia': { totalSpend: 0, totalNights: 0, visitCount: 0 },
        'Europe': { totalSpend: 0, totalNights: 0, visitCount: 0 },
        'North America': { totalSpend: 0, totalNights: 0, visitCount: 0 },
        'South America': { totalSpend: 0, totalNights: 0, visitCount: 0 },
        'Oceania': { totalSpend: 0, totalNights: 0, visitCount: 0 },
        'Africa': { totalSpend: 0, totalNights: 0, visitCount: 0 }
    };
    
    // count the data
    data.forEach(item => {
        if (item.market) {
            // determine the continent of the data
            const continent = marketToContinent[item.market] || null;
            
            // only process the data that belongs to the six continents
            if (continent && spendingByContinent[continent]) {
                // count the data
                spendingByContinent[continent].visitCount++;
                
                // accumulate the spending
                if (item.spend && !isNaN(parseFloat(item.spend))) {
                    spendingByContinent[continent].totalSpend += parseFloat(item.spend);
                }
                
                // accumulate the stay nights
                if (item.stay_nights && !isNaN(parseInt(item.stay_nights))) {
                    spendingByContinent[continent].totalNights += parseInt(item.stay_nights);
                }
            }
        }
    });
    
    // calculate the average spending for each continent
    const continentSpendingData = [];
    Object.entries(spendingByContinent).forEach(([continent, data]) => {
        if (data.visitCount > 0) {
            // calculate the average total spending
            const avgTotalSpend = data.totalSpend / data.visitCount;
            
            // calculate the average daily spending (if there is enough stay nights data)
            let avgDailySpend = 0;
            if (data.totalNights > 0) {
                avgDailySpend = data.totalSpend / data.totalNights;
            }
            
            continentSpendingData.push({
                continent: continent,
                avgTotalSpend: avgTotalSpend,
                avgDailySpend: avgDailySpend,
                visitCount: data.visitCount
            });
        }
    });
    
    // set the mapping from continent to English name
    const continentNameMap = {
        'Asia': 'Asia',
        'Europe': 'Europe',
        'North America': 'North America',
        'South America': 'South America',
        'Oceania': 'Oceania',
        'Africa': 'Africa'
    };
    
    const myChart = echarts.init(chartDom);
    
    // prepare the data
    const continents = continentSpendingData.map(item => continentNameMap[item.continent] || item.continent);
    const totalSpending = continentSpendingData.map(item => Math.round(item.avgTotalSpend));
    const dailySpending = continentSpendingData.map(item => Math.round(item.avgDailySpend));
    
    const option = {
        backgroundColor: 'transparent',
        textStyle: {
            fontFamily: '-apple-system, SF Pro Text, SF Pro Icons, Helvetica Neue, Helvetica, Arial, sans-serif',
            color: '#333333'
        },
        grid: {
            left: '0%',    // Increase left margin to ensure continent names are visible
            right: '20%',   // Right margin 
            top: '5%',      // Small top margin
            bottom: '20%',  // Bottom margin for legend
            containLabel: true
        },
        legend: {
            data: ['Average total spending', 'Average daily spending'],
            bottom: '0',    // Position at the bottom
            left: 'center', // Center the legend
            orient: 'horizontal', // Horizontal orientation
            textStyle: {
                fontSize: 11,
                color: '#333333'
            },
            itemWidth: 12,
            itemHeight: 12,
            padding: [5, 0, 0, 0], // Add padding
            zlevel: 5 // Lower z-level than Stay Duration chart's legend
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: 'rgba(0, 0, 0, 0.05)',
            borderWidth: 1,
            textStyle: {
                color: '#333333',
                fontSize: 12,
                fontFamily: '-apple-system, SF Pro Text, SF Pro Icons, Helvetica Neue, sans-serif'
            },
            formatter: function(params) {
                let result = params[0].name + '<br/>';
                params.forEach(param => {
                    const marker = `<span style="display:inline-block;margin-right:4px;border-radius:50%;width:8px;height:8px;background-color:${param.color};"></span>`;
                    result += marker + ' ' + param.seriesName + ': £' + param.value + '<br/>';
                });
                return result;
            },
            extraCssText: 'border-radius: 8px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);'
        },
        // Swap xAxis and yAxis definitions for horizontal bar chart
        xAxis: {
            type: 'value',
            name: 'Pounds (£)',
            nameTextStyle: {
                fontSize: 11,
                color: '#8E8E93',
                padding: [0, 0, 0, -30]  // Add negative left padding to move label to the left
            },
            axisLabel: {
                fontSize: 10,
                color: '#8E8E93'
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            }
        },
        yAxis: {
            type: 'category',
            data: continents,
            axisLabel: {
                interval: 0,
                fontSize: 11,
                color: '#333333',
                overflow: 'break',  // Allow text to break into multiple lines if needed
                padding: [0, -5, 0, 0],  // Remove padding to move labels closer to bars
                align: 'right',    // Right-align the text to get it closer to the bars
                margin: 8,         // Reduce margin to move labels closer to axis
                formatter: function(value) {
                    return value;  // Return original value to preserve continent names
                }
            },
            axisLine: {
                show: true
            },
            axisTick: {
                show: false
            },
            splitLine: {
                show: false
            }
        },
        series: [
            {
                name: 'Average total spending',
                type: 'bar',
                data: totalSpending,
                itemStyle: {
                    color: '#8a88b3'
                },
                barWidth: '40%',  // Reduce bar width
                barGap: '20%',    // Increase gap between bar groups
                label: {
                    show: true,
                    position: 'right',  // Keep position to right for horizontal bars
                    fontSize: 10,
                    color: '#8E8E93',
                    formatter: '{c}'    // Simple value display
                }
            },
            {
                name: 'Average daily spending',
                type: 'bar',
                data: dailySpending,
                itemStyle: {
                    color: '#cac9e0'
                },
                barWidth: '40%',  // Reduce bar width
                label: {
                    show: true,
                    position: 'right',  // Keep position to right for horizontal bars
                    fontSize: 10,
                    color: '#8E8E93',
                    formatter: '{c}'    // Simple value display
                }
            }
        ],
        animationDuration: 800,
        animationEasing: 'cubicOut'
    };
    
    myChart.setOption(option);
}

// Mapbox map initialization
function initMap() {
    // if it has been initialized, do not initialize again
    if (mapInitialized) {
        return;
    }
    
    // check if Mapbox is loaded
    if (typeof mapboxgl === 'undefined') {
        console.error('Mapbox GL JS is not loaded');
        return;
    }
    
    // set the Mapbox access token
    mapboxgl.accessToken = 'pk.eyJ1IjoicGhvZWJlMSIsImEiOiJjbTZpMmp2aDMwM2E0MnJxd2wyZzlhaHI4In0.Xpc2A8dU6xI3GVfyyGhKOA';
    
    try {
        console.log('Start initializing the map...');
        
        // adjust the initial zoom level based on the screen size
        let initialZoom = 2.59; // use the provided zoom level
        if (window.innerWidth < 768) {
            initialZoom = Math.max(1.8, initialZoom - 0.3);
        }
        if (window.innerWidth < 480) {
            initialZoom = Math.max(1.5, initialZoom - 0.5);
        }
        
        // create the map instance
        map = new mapboxgl.Map({
            container: 'globe-container',
            style: 'mapbox://styles/mapbox/light-v10',
            center: [12.29, 39.31], // use the provided center coordinates
            zoom: initialZoom,
            projection: 'globe', // use the spherical projection
            pitch: 0, // the provided tilt angle 0.00°
            bearing: 0, // the provided rotation angle 0.00°
            minZoom: 0.3, // allow more zoom out to view the whole earth
            maxZoom: 10 // limit the maximum zoom level
        });
        
        // customize the map style
        function customizeMapStyle() {
            if (!map.isStyleLoaded()) {
                console.log('The style is not loaded, waiting for the style to be loaded...');
                map.once('style.load', customizeMapStyle);
                return;
            }
            
            console.log('Start customizing the map style...');
            
            // change the color of the water to pure gray
            const layers = map.getStyle().layers;
            for (let i = 0; i < layers.length; i++) {
                const layer = layers[i];
                // find all the layers related to the water
                if (layer.id === 'water' || 
                    layer.id.includes('water') || 
                    layer.id.includes('ocean') || 
                    layer.id.includes('sea')) {
                    if (layer.type === 'fill') {
                        console.log(`Change the color of the water layer ${layer.id}`);
                        map.setPaintProperty(layer.id, 'fill-color', '#ffffff'); // pure white water
                        
                        // try to set the boundary of the water, increase the visibility
                        try {
                            map.setPaintProperty(layer.id, 'fill-outline-color', '#e0e0e0'); // light gray boundary
                        } catch (e) {
                            console.log(`Failed to set the boundary color for ${layer.id}: ${e.message}`);
                        }
                    }
                }
                
                // change the color of the land to light gray
                if (layer.id === 'land' || 
                    layer.id === 'landcover' || 
                    layer.id.includes('land-') || 
                    layer.id.includes('background')) {
                    if (layer.type === 'fill' || layer.type === 'background') {
                        console.log(`Change the color of the land/background layer ${layer.id}`);
                        map.setPaintProperty(layer.id, 'fill-color', '#eeeeee'); // more obvious gray, contrast with the white water
                    }
                }
            }
            
            console.log('Map style customization completed');
        }
        
        // apply the customized style after the map style is loaded
        map.on('style.load', customizeMapStyle);
        
        // add the navigation control, and adjust the size
        const navControl = new mapboxgl.NavigationControl({
            showCompass: true,
            visualizePitch: true
        });
        map.addControl(navControl, 'top-right');
        
        // add the reset view button (globe button) at the position of the removed fullscreen control
        class ResetViewControl {
            onAdd(map) {
                this._map = map;
                this._container = document.createElement('div');
                this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
                
                const button = document.createElement('button');
                button.type = 'button';
                button.title = 'Reset view';
                button.innerHTML = '🌎';
                button.style.fontSize = '18px';
                button.onclick = () => {
                    fitMapToView();
                };
                
                this._container.appendChild(button);
                return this._container;
            }
            
            onRemove() {
                this._container.parentNode.removeChild(this._container);
                this._map = undefined;
            }
        }
        
        map.addControl(new ResetViewControl(), 'top-right');
        
        // add the scale control, control the zoom level
        const scale = new mapboxgl.ScaleControl({
            maxWidth: 100,
            unit: 'metric'
        });
        map.addControl(scale, 'bottom-left');

        // add the operations to be executed after the initialization
        map.once('idle', function() {
            // ensure the initial view can see the whole earth
            fitMapToView();
        });
        
        // add the map loaded event
        map.on('load', function() {
            // set the atmospheric effect - adjusted to a more coordinated gray theme
            map.setFog({
                'color': 'rgb(200, 200, 205)', // atmospheric color - more gray
                'high-color': 'rgb(150, 150, 160)', // high altitude atmospheric color - gray
                'horizon-blend': 0.02, // horizon blend
                'space-color': 'rgb(226,225, 220)', // space color - gray with a little purple
                'star-intensity': 0.05 // star brightness - reduced
            });
            
            // wait for a while after the map is fully loaded to adjust the text size
            setTimeout(reduceMapLabelsSize, 1000);
            
        
            map.on('styledata', function() {
                setTimeout(reduceMapLabelsSize, 500);
            });
            
            console.log('Map loaded');
            
            // load the country center point data
            loadCountryCenters();
            
            // if the data has been loaded, update the map data
            if (visitorData.length > 0) {
                console.log('Map loaded, update the map data immediately');
                updateMapData(visitorData);
            }
            
            // trigger resize to ensure the map is displayed correctly
            setTimeout(() => {
                map.resize();
                // ensure the arc lines are displayed
                if (!map.getLayer('visitor-lines') && visitorData.length > 0) {
                    console.log('Map loaded, check if the arc lines are not displayed, try to update the map data');
                    updateMapData(visitorData);
                }
            }, 1000);
        });
        
        // add the error handling
        map.on('error', function(e) {
            console.error('Map loading error:', e);
        });
        
        // listen to the scroll event of the scroll container to trigger the map re-rendering
        document.querySelector('.scroll-container').addEventListener('scroll', function() {
            if (map) {
                setTimeout(() => map.resize(), 100);
            }
        });
        
        // listen to the window resize event to adjust the map size
        window.addEventListener('resize', function() {
            if (map) {
                setTimeout(() => {
                    map.resize();
                    
                    // adjust the zoom level, but respect the user's custom view settings
                    if (window.innerWidth < 768) {
                        if (map.getZoom() > 3.0) {
                            map.zoomTo(2.59);
                        }
                    } else {
                        if (map.getZoom() < 1.0) {
                            map.zoomTo(2.59);
                        }
                    }
                    
                    // update the moving point positions
                    updateAllMovingPointsPositions();
                }, 200);
            }
        });
        
        // add the map move and zoom end event, update the moving point positions
        map.on('moveend', updateAllMovingPointsPositions);
        map.on('zoomend', updateAllMovingPointsPositions);
        
        mapInitialized = true;
    } catch (error) {
        console.error('Error initializing the map:', error);
    }
}

// function to reduce the map label size
function reduceMapLabelsSize() {
    try {
        // get all the layers
        const layers = map.getStyle().layers;
        
        // iterate through the layers, find the text layer
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            const layerId = layer.id;
            
            // check if it is a text layer or a layer containing the country name
            if (layer.type === 'symbol') {
                // reduce the text size - use a more general way
                try {
                    // apply different zoom levels to different types of labels
                    if (layerId.includes('country')) {
                        // country name - keep a moderate size but not too large
                        map.setLayoutProperty(layerId, 'text-size', ['interpolate', ['linear'], ['zoom'],
                            0, 4, 2, 6, 4, 9, 6, 11, 10, 13
                        ]);
                        // increase the opacity
                        map.setPaintProperty(layerId, 'text-opacity', 0.9);
                    } else if (layerId.includes('state') || layerId.includes('province')) {
                        // state/province name - smaller than the country name
                        map.setLayoutProperty(layerId, 'text-size', ['interpolate', ['linear'], ['zoom'],
                            0, 3, 2, 5, 4, 7, 6, 9, 10, 11
                        ]);
                        // increase the opacity
                        map.setPaintProperty(layerId, 'text-opacity', 0.9);
                    } else if (layerId.includes('city') || layerId.includes('town') || layerId.includes('place')) {
                        // city/place name - slightly smaller
                        map.setLayoutProperty(layerId, 'text-size', ['interpolate', ['linear'], ['zoom'],
                            0, 2, 2, 4, 4, 6, 6, 8, 10, 10
                        ]);
                        // adjust the opacity
                        map.setPaintProperty(layerId, 'text-opacity', 0.9);
                    } else if (layerId.includes('poi') || layerId.includes('label')) {
                        // points of interest and other labels - smaller
                        map.setLayoutProperty(layerId, 'text-size', ['interpolate', ['linear'], ['zoom'],
                            0, 1, 2, 2, 4, 3, 6, 4, 10, 5
                        ]);
                        // slightly increase the opacity
                        map.setPaintProperty(layerId, 'text-opacity', 0.6);
                    }
                    
                    console.log(`Adjusted the text size of the layer ${layerId}`);
                } catch (e) {
                    // ignore the layers that cannot be modified
                    console.log(`Failed to modify the text of the layer ${layerId}: ${e.message}`);
                }
            }
        }
        
        console.log('Completed the map text size adjustment');
    } catch (error) {
        console.warn('Error adjusting the map text size:', error);
    }
}

// create the points of the arc
function createArcPoints(start, end, numPoints, curveVariation = 0, lateralVariation = 0) {
    const points = [];
    
    // convert the longitude and latitude to the Cartesian coordinates
    function toXYZ(lon, lat) {
        const rad = Math.PI / 180;
        const x = Math.cos(lat * rad) * Math.cos(lon * rad);
        const y = Math.cos(lat * rad) * Math.sin(lon * rad);
        const z = Math.sin(lat * rad);
        return [x, y, z];
    }
    
    // convert the Cartesian coordinates back to the longitude and latitude
    function toLonLat(x, y, z) {
        const rad = 180 / Math.PI;
        const lat = Math.asin(z) * rad;
        const lon = Math.atan2(y, x) * rad;
        return [lon, lat];
    }
    
    // get the Cartesian coordinates of the start and end points
    const startXYZ = toXYZ(start[0], start[1]);
    const endXYZ = toXYZ(end[0], end[1]);
    
    // calculate the mid point vector
    const midXYZ = [
        (startXYZ[0] + endXYZ[0]) / 2,
        (startXYZ[1] + endXYZ[1]) / 2,
        (startXYZ[2] + endXYZ[2]) / 2
    ];
    
    // normalize the mid point vector (get a unit vector pointing to the mid point)
    const midLength = Math.sqrt(
        midXYZ[0] * midXYZ[0] +
        midXYZ[1] * midXYZ[1] +
        midXYZ[2] * midXYZ[2]
    );
    
    // calculate the angle between the start and end points (arc length)
    const dotProduct = startXYZ[0] * endXYZ[0] + 
                      startXYZ[1] * endXYZ[1] + 
                      startXYZ[2] * endXYZ[2];
    // ensure the dot product is in the range of [-1,1], avoid the acos error
    const clampedDot = Math.max(-1, Math.min(1, dotProduct));
    const angle = Math.acos(clampedDot);
    
    // calculate the vector perpendicular to the line connecting the start and end points
    // use the cross product to calculate the vector perpendicular to the plane connecting the start and end points
    const crossVector = [
        startXYZ[1] * endXYZ[2] - startXYZ[2] * endXYZ[1],
        startXYZ[2] * endXYZ[0] - startXYZ[0] * endXYZ[2],
        startXYZ[0] * endXYZ[1] - startXYZ[1] * endXYZ[0]
    ];
    
    // normalize the cross vector
    const crossLength = Math.sqrt(
        crossVector[0] * crossVector[0] +
        crossVector[1] * crossVector[1] +
        crossVector[2] * crossVector[2]
    );
    
    const normalizedCross = [
        crossVector[0] / crossLength,
        crossVector[1] / crossLength,
        crossVector[2] / crossLength
    ];
    
    // calculate the control point
    // reduce the base height coefficient, make the curve variation smaller
    const baseHeight = 0.25 + angle * 0.3; // reduce the base height coefficient
    const height = baseHeight * (1 + curveVariation); // apply the curve variation
    
    // calculate the base control point
    const baseControlPoint = [
        midXYZ[0] / midLength * (1 + height),
        midXYZ[1] / midLength * (1 + height),
        midXYZ[2] / midLength * (1 + height)
    ];
    
    // add the lateral offset, reduce the offset coefficient
    const lateralOffset = [
        normalizedCross[0] * lateralVariation * 0.3,
        normalizedCross[1] * lateralVariation * 0.3,
        normalizedCross[2] * lateralVariation * 0.3
    ];
    
    // the final control point
    const controlPoint = [
        baseControlPoint[0] + lateralOffset[0],
        baseControlPoint[1] + lateralOffset[1],
        baseControlPoint[2] + lateralOffset[2]
    ];
    
    // generate the points on the arc
    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        
        // use the quadratic Bezier curve formula
        const x = (1 - t) * (1 - t) * startXYZ[0] + 
                 2 * (1 - t) * t * controlPoint[0] + 
                 t * t * endXYZ[0];
        const y = (1 - t) * (1 - t) * startXYZ[1] + 
                 2 * (1 - t) * t * controlPoint[1] + 
                 t * t * endXYZ[1];
        const z = (1 - t) * (1 - t) * startXYZ[2] + 
                 2 * (1 - t) * t * controlPoint[2] + 
                 t * t * endXYZ[2];
        
        // normalize the coordinate point (x,y,z), ensure it is on the sphere
        const pointLength = Math.sqrt(x*x + y*y + z*z);
        const normalizedPoint = [x/pointLength, y/pointLength, z/pointLength];
        
        // convert the Cartesian coordinates back to the longitude and latitude
        const point = toLonLat(normalizedPoint[0], normalizedPoint[1], normalizedPoint[2]);
        points.push(point);
    }
    
    return points;
}

// add a new function to ensure the map view fits the whole earth
function fitMapToView() {
    if (map) {
        // use the user-provided exact view
        let defaultZoom = 2.59;
        let defaultCenter = [12.29, 39.31];
        
        // slightly adjust the zoom level based on the screen size, but keep it relatively close to the default value
        if (window.innerWidth < 768) {
            defaultZoom = Math.max(1.8, defaultZoom - 0.3);
        }
        if (window.innerWidth < 480) {
            defaultZoom = Math.max(1.5, defaultZoom - 0.5);
        }
        
        // a more smooth animation transition
        map.flyTo({
            center: defaultCenter, 
            zoom: defaultZoom,     
            pitch: 0,              
            bearing: 0,            
            speed: 0.7,
            curve: 1,
            essential: true
        });
        
        // force the map to refresh
        setTimeout(() => {
            map.resize();
            
            // if the data has been loaded but the arc lines are not displayed, try to reload
            if (visitorData.length > 0 && !map.getLayer('visitor-lines')) {
                setTimeout(() => updateMapData(visitorData), 500);
            }
            
            // update the moving point positions
            updateAllMovingPointsPositions();
        }, 500);
        
        console.log('The map view has been adjusted, the current view is:', {
            center: defaultCenter,
            zoom: defaultZoom,
            pitch: '0.00°',
            bearing: '0.00°'
        });
    }
}

// update the positions of all the moving points
function updateAllMovingPointsPositions() {
    if (!window.movingPoints || !map) return;
    
    window.movingPoints.forEach(point => {
        if (point.progress < 1) {
            // calculate the current path segment
            const path = point.path;
            const progress = point.progress;
            const pathLength = path.length - 1;
            const segmentIndex = Math.min(Math.floor(progress * pathLength), pathLength - 1);
            const segmentProgress = (progress * pathLength) - segmentIndex;
            
            // calculate the start and end points of the current segment
            const start = path[segmentIndex];
            const end = path[segmentIndex + 1];
            
            // interpolate to calculate the current position
            const currentLngLat = [
                start[0] + (end[0] - start[0]) * segmentProgress,
                start[1] + (end[1] - start[1]) * segmentProgress
            ];
            
            // update the position of the point
            updatePointPosition(point.element, currentLngLat);
        }
    });
}

// load the country center point data
function loadCountryCenters() {
    console.log('Start loading the country center point data');
    
    // add the center point coordinates of more countries
    countryCenters = {
        'France': [2.2137, 46.2276],
        'Spain': [-3.7492, 40.4637],
        'Germany': [10.4515, 51.1657],
        'Italy': [12.5674, 41.8719],
        'Netherlands': [5.2913, 52.1326],
        'Poland': [19.1451, 51.9194],
        'Belgium': [4.6667, 50.6402],
        'USA': [-95.7129, 37.0902],
        'Canada': [-106.3468, 56.1304],
        'Australia': [133.7751, -25.2744],
        'China': [104.1954, 35.8617],
        'Japan': [138.2529, 36.2048],
        'India': [78.9629, 20.5937],
        'Brazil': [-51.9253, -14.2350],
        'Russia': [105.3188, 61.5240],
        'UK': [-3.4360, 55.3781],
        'Ireland': [-8.2439, 53.4129],
        'Sweden': [18.6435, 60.1282],
        'Norway': [8.4689, 60.4720],
        'Denmark': [9.5018, 56.2639],
        'Switzerland': [8.2275, 46.8182],
        'Portugal': [-8.2245, 39.3999],
        'Greece': [21.8243, 39.0742],
        'Turkey': [35.2433, 38.9637],
        'South Africa': [22.9375, -30.5595],
        'Mexico': [-102.5528, 23.6345],
        'Argentina': [-63.6167, -38.4161],
        'New Zealand': [174.8860, -40.9006],
        'South Korea': [127.7669, 35.9078],
        'United Arab Emirates': [53.8478, 23.4241],
        'Saudi Arabia': [45.0792, 23.8859],
        'Israel': [34.8516, 31.0461],
        'Egypt': [30.8025, 26.8206],
        'Morocco': [-7.0926, 31.7917],
        'Thailand': [100.9925, 15.8700],
        'Singapore': [103.8198, 1.3521],
        'Malaysia': [101.9758, 4.2105],
        'Indonesia': [113.9213, -0.7893],
        'Philippines': [121.7740, 12.8797],
        'Vietnam': [108.2772, 14.0583],
        'Hong Kong': [114.1095, 22.3964],
        'Taiwan': [120.9605, 23.6978],
        'Czech Republic': [15.4730, 49.8175],
        'Hungary': [19.5033, 47.1625],
        'Romania': [24.9668, 45.9432],
        'Bulgaria': [25.4858, 42.7339],
        'Croatia': [15.2000, 45.1000],
        'Estonia': [25.0136, 58.5953],
        'Latvia': [24.6032, 56.8796],
        'Lithuania': [23.8813, 55.1694],
        'Slovakia': [19.6990, 48.6690],
        'Slovenia': [14.9955, 46.1512],
        'Luxembourg': [6.1296, 49.8153],
        'Malta': [14.3754, 35.9375],
        'Cyprus': [33.4299, 35.1264],
        'Iceland': [-19.0208, 64.9631],
        'Finland': [25.7482, 61.9241]
    };
    
    console.log('The country center point data has been loaded, there are', Object.keys(countryCenters).length, 'countries');
}

// update the map data display
function updateMapData(data) {
    console.log('Start updating the map data, the number of data entries is:', data.length);
    
    // ensure the map has been fully loaded
    if (!map) {
        console.error('The map object does not exist, so the map data cannot be updated');
        return;
    }
    
    if (!map.loaded()) {
        console.warn('The map has not been fully loaded, the data will be updated after the map is loaded');
        
        // wait for the map to be loaded and then try again
        map.once('load', function() {
            console.log('The map has been loaded, now try to update the data');
            updateMapData(data);
        });
        return;
    }
    
    // check the London center point data
    const londonCoords = [-0.1278, 51.5074];
    console.log('The London center point coordinates are:', londonCoords);
    
    try {
        // remove the existing layers and sources
        if (map.getLayer('visitor-lines')) {
            console.log('Remove the existing visitor-lines layer');
            map.removeLayer('visitor-lines');
        }
        if (map.getSource('visitor-paths')) {
            console.log('Remove the existing visitor-paths data source');
            map.removeSource('visitor-paths');
        }
        
        // remove the existing flowing light layers
        if (map.getLayer('flowing-light')) {
            map.removeLayer('flowing-light');
        }
        if (map.getLayer('flowing-light-2')) {
            map.removeLayer('flowing-light-2');
        }
        if (map.getLayer('glow-effect')) {
            map.removeLayer('glow-effect');
        }
        
        // clear the moving point animation
        clearMovingPointsAnimation();
        
        // stop the possible running animation
        if (window.animationInterval) {
            clearInterval(window.animationInterval);
            window.animationStarted = false;
        }
        
        // group by country and calculate the number of visitors
        const visitorsByCountry = {};
        data.forEach(item => {
            if (item.market) {
                // use the mapping table to get the standardized country name
                const marketName = (item.market || '').toUpperCase();
                const standardCountryName = countryNameMap[marketName] || marketName;
                
                if (!visitorsByCountry[standardCountryName]) {
                    visitorsByCountry[standardCountryName] = {
                        count: 0,
                        spending: 0,
                        purposes: {},
                        modes: {}
                    };
                }
                visitorsByCountry[standardCountryName].count++;
                
                // accumulate the spending
                if (item.spend) {
                    visitorsByCountry[standardCountryName].spending += item.spend;
                }
                
                // record the purpose of the visit
                if (item.purpose) {
                    if (!visitorsByCountry[standardCountryName].purposes[item.purpose]) {
                        visitorsByCountry[standardCountryName].purposes[item.purpose] = 0;
                    }
                    visitorsByCountry[standardCountryName].purposes[item.purpose]++;
                }
                
                // record the mode of the travel
                if (item.mode) {
                    if (!visitorsByCountry[standardCountryName].modes[item.mode]) {
                        visitorsByCountry[standardCountryName].modes[item.mode] = 0;
                    }
                    visitorsByCountry[standardCountryName].modes[item.mode]++;
                }
            }
        });
        
        console.log('After grouping by country, the number of countries is:', Object.keys(visitorsByCountry).length);
        
        // create the arc lines from each country to London
        const features = [];
        const londonCoords = [-0.1278, 51.5074]; // use the real coordinates of London
        
        // first calculate the total number of visitors and the percentage of visitors in each country
        const totalVisitors = Object.values(visitorsByCountry).reduce((sum, data) => sum + data.count, 0);
        console.log('The total number of visitors is:', totalVisitors);
        
        // set the maximum number of lines, to maintain performance
        const maxTotalLines = 500;
        
        // allocate the lines according to the visitor ratio
        const countryLines = {};
        Object.entries(visitorsByCountry).forEach(([country, data]) => {
            // allocate the lines according to the visitor ratio, at least ensure each country has 1 line
            const percentage = data.count / totalVisitors;
            const allocatedLines = Math.max(1, Math.round(percentage * maxTotalLines));
            // to avoid the main countries having too many lines, apply a logarithmic reduction
            countryLines[country] = Math.min(120, Math.max(1, Math.ceil(allocatedLines * 0.5 + Math.log10(allocatedLines) * 5)));
        });
        
        // actually create the lines
        Object.entries(visitorsByCountry).forEach(([country, data]) => {
            if (countryCenters[country]) {
                // use the allocated number of lines
                const numLines = countryLines[country];
                console.log(`Create ${numLines} lines for ${country}, representing ${data.count} visitors (about ${Math.round(data.count/numLines)} visitors per line)`);
                
                // get the main purpose of the visit and the main mode of the travel
                const mainPurpose = Object.entries(data.purposes)
                    .sort((a, b) => b[1] - a[1])
                    .map(([purpose]) => purpose)[0] || 'Unknown';
                
                const mainMode = Object.entries(data.modes)
                    .sort((a, b) => b[1] - a[1])
                    .map(([mode]) => mode)[0] || 'Unknown';
                
                // calculate the average spending
                const avgSpending = data.spending > 0 ? (data.spending / data.count).toFixed(2) : 'N/A';
                
                try {
                    // create multiple lines to represent different visitor groups
                    for (let i = 0; i < numLines; i++) {
                        // calculate the offset range based on the country's position
                        // the countries that are further away have a larger offset, but not too分散
                        const distanceToLondon = calculateDistance(
                            countryCenters[country][1], countryCenters[country][0],
                            londonCoords[1], londonCoords[0]
                        );
                        
                        // calculate the appropriate offset scale factor
                        const offsetScale = Math.min(1, Math.max(0.1, distanceToLondon / 5000)) * 0.3;
                        
                        // use the sine and cosine functions to create a circular distribution effect
                        const angle = (i / numLines) * Math.PI * 2; // uniformly distributed in the range of 0 to 2π
                        const radiusFactor = 0.5 + Math.random() * 0.5; // random radius factor, making the distribution less regular
                        
                        const startOffset = [
                            Math.cos(angle) * offsetScale * radiusFactor * 2,
                            Math.sin(angle) * offsetScale * radiusFactor
                        ];
                        
                        // the offset at the London end is smaller
                        const endAngle = angle + Math.PI/4 * (Math.random() - 0.5); // slightly rotate
                        const endOffset = [
                            Math.cos(endAngle) * 0.2 * radiusFactor * 0.2,
                            Math.sin(endAngle) * 0.2 * radiusFactor * 0.2
                        ];
                        
                        // calculate the start and end points,加入计算的偏移
                        const start = [
                            countryCenters[country][0] + startOffset[0],
                            countryCenters[country][1] + startOffset[1]
                        ];
                        
                        const end = [
                            londonCoords[0] + endOffset[0],
                            londonCoords[1] + endOffset[1]
                        ];
                        
                        // add random curvature variation to each line
                        // reduce the curvature variation range, making the lines more consistent
                        const curveVariation = -0.15 + 0.3 * Math.sin(angle) + Math.random() * 0.3;
                        
                        // reduce the lateral variation, making the curve smoother
                        const lateralVariation = -0.2 + Math.sin(angle*2) * 0.3 + Math.random() * 0.2;
                        
                        // create the arc path points
                        const points = createArcPoints(start, end, 40, curveVariation, lateralVariation);
                        
                        // set the base color, 80% probability is purple (#4a2b72), 20% probability is red (#bc4740)
                        let baseColor;
                        // use the random number to decide the color, ensure the 80/20 ratio
                        if (Math.random() < 0.8) {
                            baseColor = [74, 43, 114]; // #4a2b72 purple (80% probability)
                        } else {
                            baseColor = [188, 71, 64]; // #bc4740 red (20% probability)
                        }
                        
                        // reduce the color variation, making the color more consistent
                        const colorVariation = [-3 + Math.random() * 6, -3 + Math.random() * 6, -3 + Math.random() * 6];
                        const finalColor = [
                            Math.min(255, Math.max(0, Math.round(baseColor[0] + colorVariation[0]))),
                            Math.min(255, Math.max(0, Math.round(baseColor[1] + colorVariation[1]))),
                            Math.min(255, Math.max(0, Math.round(baseColor[2] + colorVariation[2])))
                        ];
                        
                        // convert to hexadecimal color
                        const lineColor = '#' + finalColor.map(c => c.toString(16).padStart(2, '0')).join('');
                        
                        // the arc line opacity is divided into 5 levels and randomly assigned
                        const opacityLevels = [0.4, 0.5, 0.6, 0.7, 0.8];
                        const opacity = opacityLevels[Math.floor(Math.random() * 5)];
                        
                        features.push({
                            type: 'Feature',
                            properties: {
                                country: country,
                                visitors: data.count,
                                lineWidth: 0.2 + Math.random() * 0.1, // reduce the line width, making the lines thinner
                                opacity: opacity,
                                avgSpending: avgSpending,
                                mainPurpose: mainPurpose,
                                mainMode: mainMode,
                                lineColor: lineColor
                            },
                            geometry: {
                                type: 'LineString',
                                coordinates: points
                            }
                        });
                    }
                } catch (error) {
                    console.error(`Error creating the arc line for ${country}:`, error);
                }
            } else {
                console.warn(`The center coordinates of the country ${country} were not found`);
            }
        });
        
        console.log('The number of arc line features created:', features.length);
        
        // check if there are any features
        if (features.length === 0) {
            console.error('No arc line features were created, cannot continue');
            return;
        }
        
        // add the GeoJSON source and layer
        try {
            // wait for the style to be loaded before adding layers
            if (!map.isStyleLoaded()) {
                map.once('style.load', function() {
                    addMapLayers();
                });
            } else {
                addMapLayers();
            }

            function addMapLayers() {
                // add the source first
                map.addSource('visitor-paths', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: features
                    }
                });

                console.log('Successfully added the visitor-paths data source');

                // add the arc line layer
                map.addLayer({
                    id: 'visitor-lines',
                    type: 'line',
                    source: 'visitor-paths',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-width': ['+', ['get', 'lineWidth'], 0.1],
                        'line-color': ['get', 'lineColor'],
                        'line-opacity': 0
                    }
                });

                // add the glow effect layer
                map.addLayer({
                    id: 'glow-effect',
                    type: 'line',
                    source: 'visitor-paths',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-width': ['+', ['get', 'lineWidth'], 4],
                        'line-color': ['get', 'lineColor'],
                        'line-opacity': 0,
                        'line-blur': 3
                    }
                });

                // add the flowing light effect
                map.addLayer({
                    id: 'flowing-light',
                    type: 'line',
                    source: 'visitor-paths',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-width': ['+', ['get', 'lineWidth'], 2],
                        'line-color': ['get', 'lineColor'],
                        'line-opacity': 0,
                        'line-dasharray': [1, 10],
                        'line-blur': 1.5
                    }
                });

                // add the second glow effect
                map.addLayer({
                    id: 'flowing-light-2',
                    type: 'line',
                    source: 'visitor-paths',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-width': ['+', ['get', 'lineWidth'], 1.5],
                        'line-color': ['get', 'lineColor'],
                        'line-opacity': 0,
                        'line-dasharray': [0.7, 15],
                        'line-blur': 1
                    }
                });

                console.log('Successfully added all layers');

                // initialize animation variables
                window.flowingLightOffset = 0;
                window.flowingLightOffset2 = 7.5;
                window.animationStarted = false;

                // start the fade in animation after a short delay
                setTimeout(startFadeInAnimation, 500);
            }

            function startFadeInAnimation() {
                // fade in the basic lines
                const fadeInInterval = setInterval(function() {
                    try {
                        if (!map.getLayer('visitor-lines')) {
                            console.warn('visitor-lines layer not found, stopping fade in');
                            clearInterval(fadeInInterval);
                            return;
                        }

                        let opacity = map.getPaintProperty('visitor-lines', 'line-opacity');
                        opacity += 0.05;
                        
                        if (opacity >= 0.3) {
                            clearInterval(fadeInInterval);
                            map.setPaintProperty('visitor-lines', 'line-opacity', ['get', 'opacity']);
                            map.setPaintProperty('glow-effect', 'line-opacity', 0.15);
                            
                            // start the flowing light animation after a delay
                            setTimeout(startFlowingLightAnimation, 600);
                        } else {
                            map.setPaintProperty('visitor-lines', 'line-opacity', opacity);
                            map.setPaintProperty('glow-effect', 'line-opacity', opacity * 0.3);
                        }
                    } catch (error) {
                        console.warn('Error during fade in animation:', error);
                        clearInterval(fadeInInterval);
                    }
                }, 40);
            }

            function startFlowingLightAnimation() {
                if (window.animationStarted) {
                    console.log('Animation already running');
                    return;
                }

                window.animationStarted = true;
                console.log('Starting flowing light animation');

                window.animationInterval = setInterval(function() {
                    try {
                        if (!map.getLayer('flowing-light') || !map.getLayer('flowing-light-2')) {
                            console.warn('Required layers not found, stopping animation');
                            clearInterval(window.animationInterval);
                            window.animationStarted = false;
                            return;
                        }

                        // update the light trace animation
                        window.flowingLightOffset = (window.flowingLightOffset + 0.3) % 11;
                        const dashArray1 = [1, 10];
                        const newDashArray1 = [
                            (dashArray1[0] + Math.floor(window.flowingLightOffset)) % 11,
                            dashArray1[1]
                        ];
                        map.setPaintProperty('flowing-light', 'line-dasharray', newDashArray1);

                        // update the second light trace animation
                        window.flowingLightOffset2 = (window.flowingLightOffset2 + 0.4) % 15.5;
                        const dashArray2 = [0.7, 15];
                        const newDashArray2 = [
                            (dashArray2[0] + Math.floor(window.flowingLightOffset2)) % 15.5,
                            dashArray2[1]
                        ];
                        map.setPaintProperty('flowing-light-2', 'line-dasharray', newDashArray2);
                    } catch (error) {
                        console.warn('Error during flowing light animation:', error);
                        clearInterval(window.animationInterval);
                        window.animationStarted = false;
                    }
                }, 30);
            }

            // add the country markers
            addCountryMarkers(visitorsByCountry);

            // create the moving points
            setTimeout(function() {
                createMovingPoints(features);
            }, 1000);

            console.log('Map data update completed');
        } catch (error) {
            console.error('Error updating map data:', error);
        }
    } catch (error) {
        console.error('Error updating the map data:', error);
    }
}

// add the country markers
function addCountryMarkers(visitorsByCountry) {
    // remove the existing markers
    document.querySelectorAll('.country-marker').forEach(el => el.remove());
    
    // get all countries
    const countries = Object.entries(visitorsByCountry);
    
    // directly use the original data to recalculate the statistics
    console.log("Start calculating the country statistics...");
    const countryStats = {};
    
    // country name conversion function, ensure case consistency
    const normalizeCountryName = (marketName) => {
        if (!marketName) return null;
        const upperName = marketName.toUpperCase();
        return countryNameMap[upperName] || marketName;
    };
    
    // traverse all original data
    visitorData.forEach(item => {
        if (!item.market) return;
        
        const country = normalizeCountryName(item.market);
        if (!country) return;
        
        if (!countryStats[country]) {
            countryStats[country] = {
                totalNights: 0,
                totalSpend: 0,
                nightsCount: 0,  // the number of visitors with stay nights
                spendCount: 0,   // the number of visitors with spending
                visitCount: 0    // the total number of visitors
            };
        }
        
        // increase the total visitor count
        countryStats[country].visitCount++;
        
        // handle the stay nights
        if (item.stay_nights && !isNaN(parseInt(item.stay_nights))) {
            const nights = parseInt(item.stay_nights);
            if (nights > 0) {
                countryStats[country].totalNights += nights;
                countryStats[country].nightsCount++;
            }
        }
        
        // handle the spending
        if (item.spend && !isNaN(parseFloat(item.spend))) {
            const spend = parseFloat(item.spend);
            if (spend > 0) {
                countryStats[country].totalSpend += spend;
                countryStats[country].spendCount++;
            }
        }
    });
    
    console.log("The country statistics calculation is completed", countryStats);
    
    // add the deep gray circle markers for each country
    countries.forEach(([country, data]) => {
        if (countryCenters[country]) {
            // get the statistics data of the country
            const stats = countryStats[country] || {
                totalNights: 0, totalSpend: 0, nightsCount: 0, spendCount: 0, visitCount: 0
            };
            
            // modify the popup data logic: get the main travel mode
            const mainMode = data.modes ? 
                Object.entries(data.modes).sort((a, b) => b[1] - a[1])[0]?.[0] : 'Unknown';
            
            // calculate the average stay duration and provide default values
            let avgStayDuration, avgDailySpend, avgTotalSpend;
            
            // calculate the average stay duration and provide default values
            if (stats.nightsCount > 0) {
                avgStayDuration = (stats.totalNights / stats.nightsCount).toFixed(1) + " days";
            } else {
                avgStayDuration = "No data";
            }
            
            // calculate the average daily spending and provide default values
            if (stats.totalSpend > 0 && stats.totalNights > 0) {
                avgDailySpend = "£" + (stats.totalSpend / stats.totalNights).toFixed(2);
            } else {
                avgDailySpend = "No data";
            }
            
            // calculate the average total spending and provide default values
            if (stats.spendCount > 0) {
                avgTotalSpend = "£" + (stats.totalSpend / stats.spendCount).toFixed(2);
            } else if (stats.totalSpend > 0 && stats.visitCount > 0) {
                // alternative calculation method: if there is total spending but no accurate spending record number, use the total number of visitors
                avgTotalSpend = "£" + (stats.totalSpend / stats.visitCount).toFixed(2) + " (estimated)";
            } else {
                avgTotalSpend = "No data";
            }
            
            // create the custom marker element
            const el = document.createElement('div');
            el.className = 'country-marker';
            el.style.backgroundColor = '#222222'; // use the specified deeper gray
            el.style.width = '3.5px'; // shrink by half
            el.style.height = '3.5px'; // shrink by half
            el.style.borderRadius = '50%';
            
            // create the popup content
            const popupContent = `
                <h3>${country}</h3>
                <p>Main travel mode: <b>${mainMode}</b></p>
                <p>Average stay duration: <b>${avgStayDuration}</b></p>
                <p>Average daily spending: <b>${avgDailySpend}</b></p>
                <p>Average total spending: <b>${avgTotalSpend}</b></p>
            `;
            
            // create the popup and set the high z-index to ensure it is displayed on the top layer
            const popup = new mapboxgl.Popup({
                closeButton: true,
                closeOnClick: true,
                offset: 10,
                className: 'high-z-popup' // add the custom class name
            }).setHTML(popupContent);
            
            // add the marker point to the map and bind the popup
            new mapboxgl.Marker(el)
                .setLngLat(countryCenters[country])
                .setPopup(popup)
                .addTo(map);
                
            // listen to the popup open event, reduce the z-index of all moving points
            popup.on('open', function() {
                document.querySelectorAll('.moving-point').forEach(point => {
                    point.style.zIndex = '50'; // reduce the z-index of the moving points
                });
            });
        }
    });
    
    console.log('All country markers have been added');
}

// focus on a specific country on the map
function focusCountryOnMap(countryName) {
    if (!map || !countryCenters[countryName]) return;
    
    map.flyTo({
        center: countryCenters[countryName],
        zoom: 4,
        duration: 2000
    });
}

// calculate the distance between two points (km)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // the radius of the earth (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// add the London glowing marker function
function addLondonGlowingMarker() {
    // remove the existing London marker
    document.querySelectorAll('.london-marker, .light-point').forEach(el => el.remove());
    
    // do not add the London marker
    console.log('London marker has been removed');
}

// create the points that move along the arc
function createMovingPoints(features) {
    console.log('Start creating moving points, total path number:', features.length);
    
    // clear the previous moving points
    clearMovingPointsAnimation();
    
    // create the container
    const pointsContainer = document.createElement('div');
    pointsContainer.id = 'moving-points-container';
    pointsContainer.style.position = 'absolute';
    pointsContainer.style.top = '0';
    pointsContainer.style.left = '0';
    pointsContainer.style.width = '100%';
    pointsContainer.style.height = '100%';
    pointsContainer.style.pointerEvents = 'none';
    pointsContainer.style.zIndex = '10'; // set the whole container to a lower z-index
    document.getElementById('globe-container').appendChild(pointsContainer);
    
    // group by country, ensure each country has a representative
    const countryFeatures = {};
    features.forEach(feature => {
        const country = feature.properties.country;
        if (!countryFeatures[country]) {
            countryFeatures[country] = [];
        }
        countryFeatures[country].push(feature);
    });
    
    // store all points information
    window.movingPoints = [];
    
    // sort the countries by visitor number, prioritize the main source countries
    const countriesByVisitors = Object.entries(countryFeatures)
        .map(([country, paths]) => ({
            country,
            paths,
            visitors: paths[0].properties.visitors || 0
        }))
        .sort((a, b) => b.visitors - a.visitors);
    
    console.log(`Create points for all ${countriesByVisitors.length} countries`);
    
    // get the current map center, for checking the visibility of the points
    const center = map.getCenter();
    const centerLon = center.lng * Math.PI / 180;
    const centerLat = center.lat * Math.PI / 180;
    
    // create points for all countries, remove the number limit
    countriesByVisitors.forEach(({ country, paths }) => {
        // select the first path of the country
        const feature = paths[0];
        const path = feature.geometry.coordinates;
        
        // if the number of path points is insufficient, skip
        if (!path || path.length < 2) {
            console.warn(`The number of path points for country ${country} is insufficient, skip`);
            return;
        }
        
        const purpose = feature.properties.mainPurpose;
        const visitors = feature.properties.visitors;
        const avgSpending = feature.properties.avgSpending;
        const mainMode = feature.properties.mainMode;
        
        // create 1-2 points for each path, adjust according to the number of visitors
        // create 2 points for the main countries (top 20), create 1 point for other countries
        const isMainCountry = countriesByVisitors.indexOf({ country, paths, visitors }) < 20;
        const numPoints = isMainCountry ? 2 : 1;
        
        for (let j = 0; j < numPoints; j++) {
            try {
                // create the point element
                const pointElement = document.createElement('div');
                pointElement.className = 'moving-point';
                
                // set all moving points to a deeper gray
                pointElement.style.backgroundColor = '#222222';
                
                // add to the container
                pointsContainer.appendChild(pointElement);
                
                // calculate the initial progress, single point country located at 50% of the path, double point country one at 30% and one at 70%
                let initialProgress;
                if (numPoints === 1) {
                    initialProgress = 0.5; // single point country located at the middle
                } else {
                    initialProgress = j * 0.4 + 0.3; // two point country distributed at 30% and 70%
                }
                
                // handle the undefined values
                const safeMode = mainMode || 'Unknown';
                const safePurpose = purpose || 'Unknown';
                const safeSpending = avgSpending && avgSpending !== 'N/A' ? 
                    `£${avgSpending}` : 'No data';
                
                // record the point information
                window.movingPoints.push({
                    element: pointElement,
                    path: path,
                    pathIndex: 0,
                    progress: initialProgress,
                    country: country,
                    purpose: safePurpose,
                    visitors: visitors,
                    avgSpending: safeSpending,
                    mainMode: safeMode,
                    // set slightly different speed
                    speed: 0.006 + (j * 0.002)
                });
                
                // check if the initial point is in the visible hemisphere, and set the initial position
                const pointIndex = Math.floor(initialProgress * (path.length - 1));
                const segmentProgress = (initialProgress * (path.length - 1)) - pointIndex;
                
                const start = path[pointIndex];
                const end = path[pointIndex + 1] || start; // prevent out of bounds
                
                const initialPosition = [
                    start[0] + (end[0] - start[0]) * segmentProgress,
                    start[1] + (end[1] - start[1]) * segmentProgress
                ];
                
                // check if the point is in the visible hemisphere
                const lon2 = initialPosition[0] * Math.PI / 180;
                const lat2 = initialPosition[1] * Math.PI / 180;
                
                const cosAngle = Math.sin(centerLat) * Math.sin(lat2) + 
                                Math.cos(centerLat) * Math.cos(lat2) * Math.cos(centerLon - lon2);
                const angleInDegrees = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI;
                
                // set the initial position and decide whether to display according to the visibility
                const isVisible = angleInDegrees < 85;
                updatePointPosition(pointElement, initialPosition, !isVisible);
                
                // ensure the point cannot be interacted
                pointElement.style.pointerEvents = 'none';
                
                // display information when hovering
                pointElement.addEventListener('mouseenter', function(e) {
                    const point = window.movingPoints.find(p => p.element === this);
                    if (!point) return;
                    
                    // pause the animation, enlarge the point
                    this.style.width = '9px';
                    this.style.height = '9px';
                    this.style.zIndex = '200';
                    
                    // display the popup information, ensure all fields have valid values
                    const popup = document.createElement('div');
                    popup.className = 'point-popup';
                    popup.innerHTML = `
                        <strong>${point.country || 'Unknown country'}</strong>
                        <p>Transportation: <b>${point.mainMode || 'Unknown'}</b></p>
                        <p>Purpose: <b>${point.purpose || 'Unknown'}</b></p>
                        <p>Average spending: <b>${point.avgSpending || 'No data'}</b></p>
                    `;
                    
                    // place the popup in the appropriate position
                    const rect = this.getBoundingClientRect();
                    popup.style.position = 'absolute';
                    popup.style.left = `${rect.right + 10}px`;
                    popup.style.top = `${rect.top - 10}px`;
                    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                    popup.style.color = 'white';
                    popup.style.padding = '5px 10px';
                    popup.style.borderRadius = '5px';
                    popup.style.fontSize = '12px';
                    popup.style.zIndex = '300';
                    popup.style.pointerEvents = 'none';
                    
                    document.body.appendChild(popup);
                    this.setAttribute('data-popup-id', Date.now().toString());
                    popup.id = this.getAttribute('data-popup-id');
                });
                
                // remove the popup when hovering
                pointElement.addEventListener('mouseleave', function(e) {
                    // restore the original size
                    this.style.width = '2.25px';
                    this.style.height = '2.25px';
                    this.style.zIndex = '100';
                    
                    // remove the popup information
                    const popupId = this.getAttribute('data-popup-id');
                    if (popupId) {
                        const popup = document.getElementById(popupId);
                        if (popup) {
                            popup.remove();
                        }
                    }
                });
            } catch (error) {
                console.error(`Error creating the ${j}th moving point for country ${country}:`, error);
            }
        }
    });
    
    console.log(`Successfully created ${window.movingPoints.length} moving points, covering ${Object.keys(countryFeatures).length} countries`);
    
    // start the animation
    startMovingPointsAnimation();
    
    // close all popups when clicking on the map
    map.getCanvas().addEventListener('click', function(e) {
        // check if the click is on the point
        const clickedOnPoint = e.target.classList && 
                              (e.target.classList.contains('moving-point') || 
                               e.target.classList.contains('country-marker'));
        
        // if the click is not on the point, remove all popups
        if (!clickedOnPoint) {
            document.querySelectorAll('.point-popup').forEach(popup => {
                popup.remove();
            });
        }
    });
}

// clear the moving points animation
function clearMovingPointsAnimation() {
    console.log('Clear the moving points animation');
    
    // stop the animation
    if (window.movingPointsInterval) {
        clearInterval(window.movingPointsInterval);
        window.movingPointsInterval = null;
    }
    
    // remove the point element
    const container = document.getElementById('moving-points-container');
    if (container) {
        container.remove();
    }
    
    // clear the point array
    window.movingPoints = [];
}

// start the moving points animation
function startMovingPointsAnimation() {
    console.log('Start the moving points animation');
    
    // check if there are any points to animate
    if (!window.movingPoints || window.movingPoints.length === 0) {
        console.warn('No available moving points, cannot start the animation');
        return;
    }
    
    // update the visibility and position of all moving points, ensure the first rendering is correct
    updateAllMovingPointsPositions();
    
    // create the animation interval - reduce the update frequency, improve performance
    window.movingPointsInterval = setInterval(updateMovingPoints, 60); // increase from 30ms to 60ms
}

// update the moving points position
function updateMovingPoints() {
    if (!map || !window.movingPoints) return;
    
    // iterate through all points and update the position
    window.movingPoints.forEach(point => {
        try {
            // calculate the current position of the point on the path
            const path = point.path;
            const progress = point.progress;
            
            // if the point has reached the end (progress >= 0.95), reset back to the start immediately
            // 0.95 is a threshold, representing 95% of the path, close to London
            if (progress >= 0.95) {
                // hide the point, display it at the start position in the next frame, avoid seeing the return animation
                point.element.style.display = 'none';
                
                // reset the progress to the start
                point.progress = 0;
                point.pathIndex = 0;
                
                // set the point position to the start of the path, but do not update the DOM immediately
                // check the visibility of the point after that
                const startPoint = path[0];
                
                // check if the start point is in the current visible hemisphere
                const center = map.getCenter();
                const lon1 = center.lng * Math.PI / 180;
                const lat1 = center.lat * Math.PI / 180;
                const lon2 = startPoint[0] * Math.PI / 180;
                const lat2 = startPoint[1] * Math.PI / 180;
                
                // calculate the angle between the point and the center of the visible hemisphere using the spherical cosine theorem
                const cosAngle = Math.sin(lat1) * Math.sin(lat2) + 
                                Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2);
                const angleInDegrees = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI;
                
                // only display the point after a delay if the start point is in the visible hemisphere
                if (angleInDegrees < 85) {
                    setTimeout(() => {
                        // update the position to the start
                        updatePointPosition(point.element, startPoint);
                        // let the updatePointPosition function decide whether to display the point
                    }, 300); // increase the delay time, ensure the transition is smoother
                } else {
                    // if the start point is in the invisible hemisphere, update the position but keep it hidden
                    updatePointPosition(point.element, startPoint, true);
                }
                
                return;
            }
            
            // calculate the actual position on the path
            const pathLength = path.length - 1;
            const pointIndex = Math.floor(progress * pathLength);
            
            if (pointIndex >= pathLength) {
                // reached the end
                updatePointPosition(point.element, path[pathLength]);
            } else {
                // interpolate between the two path points
                const start = path[pointIndex];
                const end = path[pointIndex + 1];
                const segmentProgress = (progress * pathLength) - pointIndex;
                
                // interpolate to calculate the current position
                const currentLngLat = [
                    start[0] + (end[0] - start[0]) * segmentProgress,
                    start[1] + (end[1] - start[1]) * segmentProgress
                ];
                
                updatePointPosition(point.element, currentLngLat);
            }
            
            // increase the progress - slightly increase the speed due to the reduced frame rate
            point.progress += point.speed * 1.5;
            
        } catch (error) {
            console.error('Error updating the moving points position:', error);
        }
    });
}

// update the point position on the map
function updatePointPosition(element, lngLat, forceHide = false) {
    try {
        // convert the longitude and latitude to pixel coordinates
        const pixelPos = map.project(lngLat);
        
        // set the element position
        element.style.transform = `translate(${pixelPos.x}px, ${pixelPos.y}px)`;
        
        // if the point is forced to be hidden, hide it and return immediately
        if (forceHide) {
            element.style.display = 'none';
            return;
        }
        
        // check if the point is in the viewport
        const mapContainer = map.getContainer();
        const mapWidth = mapContainer.offsetWidth;
        const mapHeight = mapContainer.offsetHeight;
        
        // add a buffer to the viewport check
        const buffer = 20; 
        const isInView = 
            pixelPos.x >= -buffer && 
            pixelPos.x <= mapWidth + buffer && 
            pixelPos.y >= -buffer && 
            pixelPos.y <= mapHeight + buffer;
        
        // check if the point is on the current visible hemisphere (not blocked by the earth)
        // use the spherical cosine theorem to calculate the spherical distance between the point and the center
        const center = map.getCenter();
        
        // convert the longitude and latitude to radians
        const lon1 = center.lng * Math.PI / 180;
        const lat1 = center.lat * Math.PI / 180;
        const lon2 = lngLat[0] * Math.PI / 180;
        const lat2 = lngLat[1] * Math.PI / 180;
        
        // calculate the angle between the point and the center of the visible hemisphere using the spherical cosine theorem
        const cosAngle = Math.sin(lat1) * Math.sin(lat2) + 
                         Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2);
        
        // convert to degrees and check if it is less than 90 degrees (on the visible hemisphere)
        // use 85 degrees instead of 90 degrees, hide the edge area as well, avoid edge artifacts
        const angleInDegrees = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI;
        const isOnVisibleSide = angleInDegrees < 85;
        
        // only display the point if it is in the viewport and on the visible hemisphere
        element.style.display = (isInView && isOnVisibleSide) ? 'block' : 'none';
        
        // when the point is in the viewport but near the edge of the map, adjust the z-index to display it above
        if (isInView && isOnVisibleSide) {
            const isNearEdge = 
                pixelPos.x < 50 || 
                pixelPos.x > mapWidth - 50 || 
                pixelPos.y < 50 || 
                pixelPos.y > mapHeight - 50;
            
            if (isNearEdge) {
                element.style.zIndex = '150';
            } else {
                element.style.zIndex = '100';
            }
            
            // check if there is an active popup, if so, ensure the current point is below the popup
            const activePopup = document.querySelector('.mapboxgl-popup, .point-popup');
            if (activePopup) {
                element.style.zIndex = '50'; // set a lower z-index, ensure it is below the popup
            }
        }
    } catch (error) {
        // if an error occurs, hide the point
        element.style.display = 'none';
    }
}

