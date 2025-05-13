// Configuration
const CONFIG = {
  mapboxToken: 'pk.eyJ1IjoicGhvZWJlMSIsImEiOiJjbTZpMmp2aDMwM2E0MnJxd2wyZzlhaHI4In0.Xpc2A8dU6xI3GVfyyGhKOA',
  mapStyle: 'mapbox://styles/mapbox/light-v10',
  initialCenter: [-0.12, 51.51],
  initialZoom: 9.3,
  layerColors: {
    "Attractions": "#d73027",      
    "Museums": "#67001f",         
    "Galleries": "#081d58",       
    "Parks_&_Gardens": "#41b6c4", 
    "Historic_Sites": "#225ea8"   
  },
  layerFiles: {
    "Attractions": "https://raw.githubusercontent.com/PhoebeLiuyf/mini-project/main/grouped_layers_final5/Attractions.geojson",
    "Museums": "https://raw.githubusercontent.com/PhoebeLiuyf/mini-project/main/grouped_layers_final5/Museums.geojson",
    "Galleries": "https://raw.githubusercontent.com/PhoebeLiuyf/mini-project/main/grouped_layers_final5/Galleries.geojson",
    "Parks_&_Gardens": "https://raw.githubusercontent.com/PhoebeLiuyf/mini-project/main/grouped_layers_final5/Parks_&_Gardens.geojson",
    "Historic_Sites": "https://raw.githubusercontent.com/PhoebeLiuyf/mini-project/main/grouped_layers_final5/Historic_Sites.geojson"
  },
  orderedPointLayers: ["Historic_Sites", "Attractions", "Museums", "Galleries", "Parks_&_Gardens"]
};

// Map Manager Class
class MapManager {
  constructor() {
    this.map = null;
    this.allBoroughs = [];
  }

  async initialize() {
    mapboxgl.accessToken = CONFIG.mapboxToken;
    this.map = new mapboxgl.Map({
      container: 'map',
      style: CONFIG.mapStyle,
      center: CONFIG.initialCenter,
      zoom: CONFIG.initialZoom
    });

    await this.setupMap();
    this.setupInteractions();
  }

  async setupMap() {
    await this.loadBoroughs();
    await this.loadPointLayers();
  }

  async loadBoroughs() {
    const boroughUrl = 'https://raw.githubusercontent.com/PhoebeLiuyf/mini-project/main/london_boroughs_with_counts.geojson';
    const res = await fetch(boroughUrl);
    const boroughData = await res.json();
    this.allBoroughs = boroughData.features.map(f => f.properties);

    this.map.addSource('boroughs', { type: 'geojson', data: boroughData });
    
    // Add borough layers
    this.addBoroughLayers();
  }

  addBoroughLayers() {
    // Choropleth layer
    this.map.addLayer({
      id: 'choropleth-layer',
      type: 'fill',
      source: 'boroughs',
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'total_count'],
          10,   '#081d58',   
          30,  '#225ea8',   
          50,  '#41b6c4',   
          70,  '#f7f7f7',   
          100,  '#fdae61',   
          250,  '#f46d43',   
          300,  '#d73027',   
          700,  '#67001f'    
        ],
        'fill-opacity': 0.5
      }
    });

    // Borough outline
    this.map.addLayer({
      id: 'borough-outline',
      type: 'line',
      source: 'boroughs',
      paint: {
        'line-color': '#fff',
        'line-width': 2.5
      }
    });

    // Highlight layer
    this.map.addLayer({
      id: 'borough-highlight',
      type: 'line',
      source: 'boroughs',
      paint: {
        'line-color': '#b22222',
        'line-width': 4
      },
      layout: { visibility: 'none' }
    });
  }

  async loadPointLayers() {
    for (const layerId of CONFIG.orderedPointLayers) {
      const url = CONFIG.layerFiles[layerId];
      const res = await fetch(url);
      const data = await res.json();
      
      this.map.addSource(layerId, { type: 'geojson', data });
      this.map.addLayer({
        id: layerId,
        type: 'circle',
        source: layerId,
        paint: {
          'circle-radius': 4,
          'circle-color': CONFIG.layerColors[layerId],
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 0.8,
          'circle-opacity': 0.5
        },
        layout: { visibility: 'none' }
      });
    }
  }

  setupInteractions() {
    // Borough click interaction
    this.map.on('click', 'choropleth-layer', (e) => {
      const boroughData = e.features[0].properties;
      this.showBoroughPopup(e.lngLat, boroughData);
      this.scrollToRadarChart(boroughData.NAME);
    });

    // Point layer click interaction
    CONFIG.orderedPointLayers.forEach(layerId => {
      this.map.on('click', layerId, (e) => {
        const props = e.features[0].properties;
        this.showPointPopup(e.lngLat, props);
      });
    });

    // Mouse interactions
    this.setupMouseInteractions();
  }

  setupMouseInteractions() {
    this.map.on('mouseenter', 'choropleth-layer', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'choropleth-layer', () => {
      this.map.getCanvas().style.cursor = '';
    });

    this.map.on('mousemove', 'choropleth-layer', (e) => {
      if (e.features.length > 0) {
        const boroughData = e.features[0].properties;
        this.map.setFilter('borough-highlight', ['==', ['get', 'NAME'], boroughData.NAME]);
        this.map.setLayoutProperty('borough-highlight', 'visibility', 'visible');
      }
    });

    this.map.on('mouseleave', 'choropleth-layer', () => {
      this.map.setLayoutProperty('borough-highlight', 'visibility', 'none');
    });
  }

  showBoroughPopup(lngLat, boroughData) {
    new mapboxgl.Popup()
      .setLngLat(lngLat)
      .setHTML(`
        <strong>${boroughData.NAME}</strong><br>
        Total Sites: ${boroughData.total_count}
      `)
      .addTo(this.map);
  }

  showPointPopup(lngLat, props) {
    let html = `<strong>${props.name || props.NAME || ''}</strong><br>`;
    if (props.website) {
      html += `Website: <a href="${props.website}" target="_blank">${props.website}</a><br>`;
    }
    if (props.address) {
      html += `Address: ${props.address}<br>`;
    }
    if (props.phone) {
      html += `Phone: ${props.phone}<br>`;
    }
    if (props.email) {
      html += `Email: <a href=\"mailto:${props.email}\">${props.email}</a><br>`;
    }
    if (props.wikidata) {
      html += `Wikidata: <a href="https://www.wikidata.org/wiki/${props.wikidata}" target="_blank">${props.wikidata}</a><br>`;
    }
    if (props.wikipedia) {
      // wikipedia 字段可能是 "en:xxx" 形式
      let wikiUrl = '';
      if (props.wikipedia.startsWith('http')) {
        wikiUrl = props.wikipedia;
      } else if (props.wikipedia.includes(':')) {
        const [lang, title] = props.wikipedia.split(':');
        wikiUrl = `https://${lang}.wikipedia.org/wiki/${title}`;
      }
      if (wikiUrl) {
        html += `Wikipedia: <a href="${wikiUrl}" target="_blank">${props.wikipedia}</a><br>`;
      }
    }
    new mapboxgl.Popup()
      .setLngLat(lngLat)
      .setHTML(html)
      .addTo(this.map);
  }

  scrollToRadarChart(boroughName) {
    const radarDiv = document.getElementById(`radar-${boroughName.replace(/\s/g, '_')}`);
    if (radarDiv) {
      radarDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      radarDiv.classList.add('highlight');
      setTimeout(() => radarDiv.classList.remove('highlight'), 1200);
    }
  }
}

// Radar Chart Manager Class
class RadarChartManager {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.barChartInstance = null;
  }

  renderAllCharts() {
    if (!this.mapManager.allBoroughs.length) return;
    const container = document.getElementById('radar-chart');
    container.innerHTML = '';
    const sorted = [...this.mapManager.allBoroughs]
      .sort((a, b) => b.total_count - a.total_count);
    sorted.forEach(borough => this.renderSingleChart(borough, container));
  }

  renderSingleChart(borough, container) {
    const div = document.createElement('div');
    div.className = 'radar-item';
    div.id = `radar-${borough.NAME.replace(/\s/g, '_')}`;
    div.style.marginBottom = '32px';
    const title = document.createElement('div');
    title.style.textAlign = 'center';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '0px';
    title.style.fontSize = '0.9rem';
    title.style.color = '#666';
    title.innerText = borough.NAME;
    const canvas = document.createElement('canvas');
    div.appendChild(title);
    div.appendChild(canvas);
    container.appendChild(div);
    this.createRadarChart(canvas, borough);
  }

  createRadarChart(canvas, boroughData) {
    new Chart(canvas, {
      type: 'radar',
      data: {
        labels: [
          'Attractions',
          'Museums',
          'Galleries',
          'Parks',
          'Historic Sites (/10)'
        ],
        datasets: [{
          label: boroughData.NAME,
          data: [
            boroughData.attractions_count,
            boroughData.museums_count,
            boroughData.galleries_count,
            boroughData.parks_count,
            boroughData.historic_count / 10
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.15)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)'
        }]
      },
      options: {
        scale: {
          ticks: {
            beginAtZero: true,
            maxTicksLimit: 5
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                if (context.dataIndex === 4) {
                  return `${context.label}: ${boroughData.historic_count}`;
                }
                return `${context.label}: ${context.dataset.data[context.dataIndex]}`;
              }
            }
          }
        }
      }
    });
  }

  // 新增：渲染五大类别总数柱状图
  renderCategoryBarChart() {
    if (!this.mapManager.allBoroughs.length) return;
    const container = document.getElementById('radar-chart');
    container.innerHTML = '';
    // 统计全伦敦五大类别总数
    const total = { Attractions: 0, Museums: 0, Galleries: 0, "Parks_&_Gardens": 0, Historic_Sites: 0 };
    this.mapManager.allBoroughs.forEach(b => {
      total.Attractions += b.attractions_count || 0;
      total.Museums += b.museums_count || 0;
      total.Galleries += b.galleries_count || 0;
      total["Parks_&_Gardens"] += b.parks_count || 0;
      total.Historic_Sites += b.historic_count || 0;
    });
    // 配色与点图层一致
    const labels = [
      'Attractions',
      'Museums',
      'Galleries',
      'Parks & Gardens',
      'Historic Sites'
    ];
    const keys = [
      'Attractions',
      'Museums',
      'Galleries',
      'Parks_&_Gardens',
      'Historic_Sites'
    ];
    const colors = keys.map(k => CONFIG.layerColors[k]);
    const data = keys.map(k => total[k]);
    // 创建canvas
    const div = document.createElement('div');
    div.style.margin = '24px 0';
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.height = 260;
    canvas.style.maxWidth = '260px';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto 0 auto';
    div.appendChild(canvas);
    // 新标题放在柱状图下方
    const title = document.createElement('div');
    title.style.textAlign = 'center';
    title.style.fontWeight = 'bold';
    title.style.marginTop = '8px';
    title.style.fontSize = '0.9rem';
    title.style.color = '#666';
    title.innerText = 'Sites Category Distribution';
    div.appendChild(title);
    container.appendChild(div);
    // 销毁旧实例
    if (this.barChartInstance) {
      this.barChartInstance.destroy();
    }
    this.barChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Total',
          data,
          backgroundColor: colors
        }]
      },
      options: {
        indexAxis: 'x',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        },
        scales: {
          x: { beginAtZero: true }
        },
        datasets: {
          bar: {
            barThickness: 23
          }
        }
      }
    });
  }
}

// UI Controller Class
class UIController {
  constructor(mapManager) {
    this.mapManager = mapManager;
  }

  initialize() {
    this.setupModeSwitch();
    this.setupLayerControls();
  }

  setupModeSwitch() {
    document.querySelectorAll('input[name="mode"]').forEach(radio => {
      radio.addEventListener('change', (e) => this.handleModeChange(e.target.value));
    });
  }

  handleModeChange(mode) {
    // 在切换模式时都恢复到初始状态
    this.mapManager.map.setCenter(CONFIG.initialCenter);
    this.mapManager.map.setZoom(CONFIG.initialZoom);

    if (mode === 'choropleth') {
      this.mapManager.map.setLayoutProperty('choropleth-layer', 'visibility', 'visible');
      this.mapManager.map.setLayoutProperty('borough-outline', 'visibility', 'visible');
      this.mapManager.map.setPaintProperty('borough-outline', 'line-color', '#fff');
      CONFIG.orderedPointLayers.forEach(layerId => 
        this.mapManager.map.setLayoutProperty(layerId, 'visibility', 'none')
      );
      document.getElementById('point-layer-controls').style.display = 'none';
      // 切换回雷达图
      this.radarManager.renderAllCharts();
    } else {
      this.mapManager.map.setLayoutProperty('choropleth-layer', 'visibility', 'none');
      this.mapManager.map.setLayoutProperty('borough-outline', 'visibility', 'visible');
      this.mapManager.map.setPaintProperty('borough-outline', 'line-color', '#bdbdbd');
      CONFIG.orderedPointLayers.forEach(layerId => {
        const checkbox = document.querySelector(`#point-layer-controls input[value="${layerId}"]`);
        this.mapManager.map.setLayoutProperty(
          layerId, 
          'visibility', 
          checkbox && checkbox.checked ? 'visible' : 'none'
        );
      });
      document.getElementById('point-layer-controls').style.display = 'block';
      // 切换为类别柱状图
      this.radarManager.renderCategoryBarChart();
    }
  }

  setupLayerControls() {
    document.querySelectorAll('#point-layer-controls input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.mapManager.map.setLayoutProperty(
          e.target.value, 
          'visibility', 
          e.target.checked ? 'visible' : 'none'
        );
      });
    });
  }
}

// SVG切换函数
function setNavIcon(collapsed) {
  const navSvg = document.querySelector('.nav-svg');
  if (!navSvg) return;
  if (collapsed) {
    // 叉号
    navSvg.innerHTML = `
      <svg viewBox="0 0 22 22" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round">
        <line x1="5" y1="5" x2="17" y2="17"/>
        <line x1="17" y1="5" x2="5" y2="17"/>
      </svg>
    `;
  } else {
    // 汉堡
    navSvg.innerHTML = `
      <svg viewBox="0 0 22 22" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round">
        <line x1="4" y1="7" x2="18" y2="7"/>
        <line x1="4" y1="11" x2="18" y2="11"/>
        <line x1="4" y1="15" x2="18" y2="15"/>
      </svg>
    `;
  }
}

// Navigation functionality
function setupNavigation() {
  const sections = document.querySelectorAll('.full-screen-section');
  const navLinks = document.querySelectorAll('.nav-link');
  const navToggle = document.getElementById('nav-toggle');
  const pageNav = document.getElementById('page-nav');

  setNavIcon(false); // 初始为汉堡
  navToggle.addEventListener('click', () => {
    pageNav.classList.toggle('collapsed');
    setNavIcon(pageNav.classList.contains('collapsed'));
  });

  // Function to update active state
  function updateActiveState() {
    const scrollPosition = window.scrollY + window.innerHeight / 3;

    sections.forEach((section, index) => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        navLinks.forEach(link => link.classList.remove('active'));
        navLinks[index].classList.add('active');
      }
    });
  }

  // Add scroll event listener
  window.addEventListener('scroll', updateActiveState);

  // Add click event listeners to nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      window.scrollTo({
        top: targetSection.offsetTop,
        behavior: 'smooth'
      });
    });
  });

  // Initial call to set active state
  updateActiveState();
}

// Initialize application
async function initApp() {
  window.scrollTo({ top: 0, behavior: 'auto' });
  const mapManager = new MapManager();
  await mapManager.initialize();
  
  const radarManager = new RadarChartManager(mapManager);
  radarManager.renderAllCharts();
  
  const uiController = new UIController(mapManager);
  uiController.radarManager = radarManager;
  uiController.initialize();

  // Setup navigation
  setupNavigation();
}

// Start the application
initApp();