# 🌤️ Weather Dashboard

A beautiful, interactive weather application with a windowed interface. Built with vanilla JavaScript, HTML, and CSS, featuring draggable/resizable windows, animated elements, and multiple ways to explore weather around the world.

## ✨ Features

### 🪟 Multi-Window Interface
- **Draggable Windows**: All components live in moveable windows that can be dragged anywhere
- **8-Direction Resizing**: Resize windows from any edge or corner (N, S, E, W, NE, NW, SE, SW)
- **Window Controls**: Minimize, maximize, and close buttons for each window
- **Z-Index Management**: Click any window to bring it to the front
- **Window Manager**: Toggle visibility of any window using the menu (☰)
- **Taskbar**: Minimized windows appear in the taskbar for easy restoration

### 🌍 Weather Exploration Tools

#### Popular Destinations
- Quick access grid of 12 major cities worldwide
- One-click weather lookup for: Tokyo, New York, London, Paris, Dubai, Sydney, Mumbai, Moscow, Rio, Singapore, Toronto, and Cairo
- Instantly updates all connected windows (clock, map, weather dashboard)

#### Weather Finder 🎲
- Discover random cities based on weather conditions:
  - 🌧️ Rainy
  - ❄️ Snowy
  - ☀️ Clear
  - ☁️ Cloudy
  - ⛈️ Stormy
  - 🌫️ Foggy
- Searches through 100+ cities worldwide to find your desired weather

#### Weather Dashboard
- Current weather conditions with animated icons
- Temperature display with °C/°F toggle
- Detailed weather information:
  - Feels like temperature
  - Humidity percentage
  - Wind speed
  - Weather description
- **24-Hour Forecast**: Scrollable hourly forecast with icons and temperatures

#### Interactive World Map 🗺️
- Click anywhere on the map to explore weather at that location
- Draggable pin (📍) for precise location selection
- Zoom controls: Zoom in, zoom out, reset
- Displays current zoom level
- Equirectangular projection for accurate coordinate mapping
- Shows weather and forecast for any clicked location

#### Flip Clock 🕐
- Beautiful animated flip-clock display
- Shows local time for any explored location
- Automatically updates when you search for a new city
- Displays AM/PM and current date
- Smooth flip animations

#### My Location 📍
- One-click weather for your current GPS coordinates
- Uses browser geolocation API
- Automatically updates weather dashboard with your location

### 🎨 Visual Effects
- **Dynamic Weather Animations**:
  - Rain drops for rainy weather
  - Snowflakes for snowy conditions
- **Smooth Transitions**: All elements feature smooth animations
- **Warm Color Palette**: Designed with a cozy brown and gold theme
- **Welcome Screen**: Beautiful onboarding modal with feature overview
- **Responsive Design**: Works on various screen sizes

### 🌡️ Temperature Units
- Toggle between Celsius (°C) and Fahrenheit (°F)
- Instant conversion of all displayed temperatures
- Preference persists across all windows

## 🚀 Getting Started

### Prerequisites
- Modern web browser
- Internet connection

### Installation
Simply open `index.html` in your web browser. No build process or dependencies required!

### API Key

The application uses the **OpenWeatherMap API**. The current API key in the code is:
```javascript
const apiKey = 'ae742a983d97f4208e6e659ba7fda017';
```

For production use, you should:
1. Sign up for a free API key at [OpenWeatherMap](https://openweathermap.org/api)
2. Replace the API key in [script.js](script.js)

## 📖 Usage Guide

### First Launch
1. A welcome modal will appear explaining all features
2. Click "Get Started →" to begin

### Exploring Weather

**Method 1: Popular Destinations**
- Click any city card in the "Popular Destinations" window

**Method 2: Search by City**
- Type a city name in the "Weather Dashboard" search box
- Click "Search" or press Enter

**Method 3: Weather Finder**
- Click a weather condition button (e.g., "Rainy")
- The app searches for a random city with that weather

**Method 4: Interactive Map**
- Click anywhere on the world map
- Or drag the 📍 pin to a location

**Method 5: Current Location**
- Click "Get My Location" button
- Allow browser location access when prompted

### Window Management
- **Move**: Click and drag the window header
- **Resize**: Drag any edge or corner
- **Minimize**: Click the "−" button
- **Maximize**: Click the "⛶" button
- **Close**: Click the "×" button
- **Toggle Visibility**: Click the ☰ menu and use checkboxes

## 🏗️ Project Structure

```
WeatherApp-1/
│
├── index.html          # Main HTML structure
├── script.js           # Application logic (1346 lines)
├── style.css           # Styling and animations (2362 lines)
├── favicon.svg         # Weather icon favicon
└── README.md           # This file
```

### Files

#### [index.html](index.html)
- Welcome screen modal
- Window structure for all components:
  - How It Works (directions)
  - Popular Destinations
  - Weather Finder
  - Local Time Clock
  - My Location
  - Weather Dashboard
  - Interactive Map
- Taskbar for minimized windows
- Window launcher menu

#### [script.js](script.js)
**Core Functions:**
- `getWeather()` - Fetch weather for city name
- `getWeatherByCoordinates(lat, lon)` - Fetch weather by coordinates
- `getCityWeather(cityName)` - Quick city lookup
- `getMyLocation()` - Get user's GPS location
- `findWeatherByCondition(condition)` - Find random city with specific weather

**Display Functions:**
- `displayWeather(data)` - Render current weather
- `displayHourlyForecast(data)` - Render 24-hour forecast
- `updateClock(timezone)` - Update flip clock animation

**UI Functions:**
- `toggleTemperature(unit)` - Switch °C/°F
- `toggleFullscreen(windowId)` - Toggle fullscreen mode
- `minimizeWindow(windowId)` - Minimize to taskbar
- `bringWindowToFront(windowId)` - Z-index management

**Map Functions:**
- `initializeMap()` - Set up interactive map
- `updateMapPin(lat, lon)` - Position pin on map
- Zoom controls and panning

#### [style.css](style.css)
**Key Styling:**
- Window system (draggable, resizable)
- Warm color palette (#3d2c29, #4a3530, #f2cc8f, #f4a259)
- Flip clock animations
- Weather card animations
- Rain and snow particle effects
- Responsive layouts
- Hover effects and transitions

## 🎨 Design Principles

### Color Scheme
- **Primary Background**: `#3d2c29` (warm brown)
- **Secondary Background**: `#4a3530` (darker brown)
- **Accent Gold**: `#f2cc8f`
- **Bright Orange**: `#f4a259`
- **Text**: Light colors (#f2cc8f, #e0e0e0)

### Typography
- **Primary Font**: 'Varela Round' (headers and UI)
- **Secondary Font**: 'Quicksand' (body text)
- Weights: 400, 500, 600, 700

### User Experience
- Smooth animations (0.3s transitions)
- Clear visual feedback (hover states, active states)
- Intuitive window management
- Consistent spacing and padding
- Responsive to user actions

## 🔌 API Integration

### OpenWeatherMap API
The app makes requests to three endpoints:

1. **Current Weather by City**:
```javascript
https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}
```

2. **Current Weather by Coordinates**:
```javascript
https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}
```

3. **5-Day Forecast** (used for hourly):
```javascript
https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}
```

### Weather Icon URLs
Weather icons are loaded from OpenWeatherMap:
```javascript
https://openweathermap.org/img/wn/${iconCode}@4x.png
```

## 🌟 Advanced Features

### Draggable Windows
- Implemented with mouse event listeners
- Click and hold window header to drag
- Snap prevention and boundary checking

### 8-Direction Resizing
- Resize handles on all sides and corners
- Maintains minimum width/height (250px × 200px)
- Smooth cursor changes for visual feedback

### Flip Clock Animation
- Custom CSS animations for flip effect
- Updates every second
- Timezone-aware using UTC offset from API

### Weather Animations
- Rain drops generated dynamically
- Snowflakes with CSS animations
- Triggered based on current weather conditions

### Map Interaction
- Equirectangular projection calculations
- Zoom with transform scaling
- Pan functionality when zoomed
- Pin dragging with coordinate updates

## 🐛 Known Limitations

1. **API Rate Limits**: Free tier OpenWeatherMap has rate limits (60 calls/minute)
2. **Browser Compatibility**: Requires modern browser with ES6 support
3. **Geolocation**: Requires HTTPS in production for geolocation API
4. **Map Image**: Uses external image from Wikipedia (requires internet)

## 🚧 Potential Improvements

- [ ] Add weather alerts and warnings
- [ ] Implement weather map overlays (radar, temperature, etc.)
- [ ] Save favorite locations
- [ ] Add more weather data (UV index, air quality, etc.)
- [ ] Implement unit preferences persistence (localStorage)
- [ ] Add keyboard shortcuts
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Export/share weather reports
- [ ] Weather comparison between cities

## 🔧 Customization

### Change Color Scheme
Edit the CSS variables or color values in [style.css](style.css):
```css
/* Main colors to modify */
background: linear-gradient(135deg, #3d2c29 0%, #4a3530 100%);
border: 4px solid #f2cc8f;
color: #f2cc8f;
```

### Add More Cities
Edit the cities array in [script.js](script.js):
```javascript
const cities = [
    'Tokyo', 'New York', 'London', 'Paris', 
    // Add your cities here
];
```

### Modify Window Positions
Change default CSS positions in [style.css](style.css):
```css
#world-view {
    top: 20px;
    left: 20px;
}
```

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ❌ Internet Explorer (not supported)

## � Credits

- **OpenWeatherMap** for the weather API
- **Google Fonts** for Quicksand and Varela Round fonts
- **Wikipedia** for the world map image
