# AI旅行规划助手

一个使用HTML、CSS和JavaScript构建的交互式旅行规划工具，结合了AI生成行程和地图可视化功能。

## 功能特点

- **AI旅行计划生成**：根据目的地、天数、兴趣、预算和交通方式生成个性化旅行计划
- **地图可视化**：在地图上显示旅行路线和地点
- **详细行程**：按天显示旅行行程，包含时间安排和活动描述
- **路线规划**：为不同交通方式显示颜色编码的路线
- **地点详情**：点击地点获取详细信息，包括评分、评论、开放时间等
- **人气图表**：显示地点的人气趋势图表
- **响应式设计**：适配桌面和移动设备
- **明暗主题切换**：支持明亮和暗黑显示模式

## 技术栈

- **前端**：纯HTML、CSS和JavaScript（无框架）
- **地图服务**：
  - Mapbox GL JS：用于地图显示和渲染
  - Google Maps API：用于路线规划和地点查询
- **API集成**：
  - AI Trip Planner API（通过RapidAPI）：用于生成AI旅行计划
- **图表库**：
  - Chart.js：用于数据可视化
- **图标**：
  - Font Awesome：提供UI图标

## 使用说明

### 前提条件

在使用本项目前，您需要：

1. 获取Mapbox访问令牌（[注册Mapbox](https://account.mapbox.com/auth/signup/)）
2. 获取Google Maps API密钥（[获取API密钥](https://developers.google.com/maps/documentation/javascript/get-api-key)）
3. 获取RapidAPI密钥（[RapidAPI](https://rapidapi.com/)上订阅AI旅行规划API）

### 设置API密钥

1. 打开`js/config.js`文件
2. 替换以下占位符：
   ```javascript
   mapbox: {
       accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN',  // 替换为您的Mapbox访问令牌
       ...
   },
   google: {
       apiKey: 'YOUR_GOOGLE_API_KEY',  // 替换为您的Google API密钥
       ...
   },
   rapidApi: {
       ...
       key: 'YOUR_RAPIDAPI_KEY',  // 替换为您的RapidAPI密钥
       ...
   }
   ```
3. 在`index.html`中更新Google Maps API脚本标签：
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_API_KEY&libraries=places" defer></script>
   ```

### 运行项目

本项目是纯前端应用，您可以：

1. 使用任何Web服务器托管这些文件
2. 使用VS Code的Live Server扩展
3. 使用Python的简易HTTP服务器：
   ```bash
   python -m http.server
   ```

然后在浏览器中访问相应地址（如`http://localhost:8000`）

## 项目结构

```
/
├── index.html              # 主HTML文件
├── css/
│   ├── style.css           # 主样式文件
│   └── map.css             # 地图相关样式
├── js/
│   ├── config.js           # 配置文件（API密钥等）
│   ├── api.js              # API服务（处理API调用）
│   ├── map.js              # 地图服务（处理地图显示和交互）
│   ├── itinerary.js        # 行程服务（处理行程显示和交互）
│   ├── placeDetails.js     # 地点详情服务（处理地点信息的显示）
│   └── app.js              # 主应用逻辑（协调所有服务）
└── README.md               # 项目文档
```

## 注意事项

- 本项目包含模拟数据功能，当API不可用时会自动生成示例行程
- 为了完整体验所有功能，建议配置所有必要的API密钥
- Google Maps API和Mapbox可能会根据使用量收费，请查阅各自的定价政策

## 后续开发建议

- 添加用户账户系统，保存和共享行程
- 集成实时天气信息
- 添加多语言支持
- 实现离线模式
- 集成旅行预订服务 