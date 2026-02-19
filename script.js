let currentUnit = 'C'; // 'C' for Celsius, 'F' for Fahrenheit
let currentWeatherData = null;
let currentForecastData = null;
let currentMapWeatherData = null;
let currentMapForecastData = null;

function buildLocationString(city, state, country) {
    let parts = [city];
    if (state && state !== city) {
        parts.push(state);
    }
    if (country) {
        parts.push(country);
    }
    return parts.join(', ');
}

function toggleTemperature(unit) {
    if (currentUnit === unit) return;
    
    currentUnit = unit;
    
    // Update toggle buttons on both tabs
    const toggles = document.querySelectorAll('.temp-unit');
    toggles.forEach(toggle => {
        toggle.classList.remove('active');
        if (toggle.textContent.includes(unit)) {
            toggle.classList.add('active');
        }
    });
    
    // Re-display weather with new unit
    if (currentWeatherData) {
        displayWeather(currentWeatherData);
    }
    if (currentForecastData) {
        displayHourlyForecast(currentForecastData);
    }
    if (currentMapWeatherData) {
        displayMapWeather(currentMapWeatherData);
    }
    if (currentMapForecastData) {
        displayMapForecast(currentMapForecastData);
    }
}

function convertTemp(kelvin) {
    if (currentUnit === 'C') {
        return Math.round(kelvin - 273.15);
    } else {
        return Math.round((kelvin - 273.15) * 9/5 + 32);
    }
}

function getUnitSymbol() {
    return currentUnit === 'C' ? '°C' : '°F';
}

function getCityWeather(cityName) {
    document.getElementById('city').value = cityName;
    getWeather();
    
    // Also update the map pin and weather for this city
    const apiKey = 'ae742a983d97f4208e6e659ba7fda017';
    const geoUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;
    
    fetch(geoUrl)
        .then(response => response.json())
        .then(data => {
            if (data.coord) {
                updateMapPin(data.coord.lat, data.coord.lon);
            }
        })
        .catch(error => {
            console.error('Error fetching coordinates for map:', error);
        });
}

// Weather condition finder - finds random locations with specific weather
function findWeatherByCondition(condition) {
    const status = document.getElementById('finder-status');
    status.textContent = `🔍 Searching for ${condition}...`;
    
    // Large list of cities worldwide to check
    const cities = [
        'London', 'Paris', 'Tokyo', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
        'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Mumbai', 'Delhi', 'Bangalore', 'Kolkata',
        'Moscow', 'Saint Petersburg', 'Berlin', 'Munich', 'Madrid', 'Barcelona', 'Rome', 'Milan',
        'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Mexico City', 'Guadalajara', 'Monterrey',
        'São Paulo', 'Rio de Janeiro', 'Buenos Aires', 'Santiago', 'Lima', 'Bogota', 'Caracas',
        'Istanbul', 'Ankara', 'Cairo', 'Lagos', 'Nairobi', 'Johannesburg', 'Cape Town',
        'Bangkok', 'Singapore', 'Kuala Lumpur', 'Manila', 'Jakarta', 'Ho Chi Minh City',
        'Seoul', 'Beijing', 'Shanghai', 'Hong Kong', 'Taipei', 'Osaka', 'Kyoto',
        'Dubai', 'Abu Dhabi', 'Riyadh', 'Tel Aviv', 'Athens', 'Vienna', 'Prague',
        'Amsterdam', 'Brussels', 'Copenhagen', 'Stockholm', 'Oslo', 'Helsinki', 'Reykjavik',
        'Lisbon', 'Dublin', 'Edinburgh', 'Manchester', 'Birmingham', 'Glasgow',
        'Seattle', 'San Francisco', 'Boston', 'Miami', 'Atlanta', 'Denver', 'Las Vegas',
        'Portland', 'Austin', 'Dallas', 'Philadelphia', 'San Diego', 'Minneapolis',
        'Auckland', 'Wellington', 'Christchurch', 'Fiji', 'Honolulu', 'Anchorage'
    ];
    
    // Shuffle and check cities
    const shuffled = cities.sort(() => Math.random() - 0.5);
    const apiKey = 'ae742a983d97f4208e6e659ba7fda017';
    
    let checked = 0;
    const maxChecks = 20;
    
    const checkNext = async () => {
        if (checked >= maxChecks || checked >= shuffled.length) {
            status.textContent = `😔 No ${condition} found. Try again!`;
            return;
        }
        
        const city = shuffled[checked];
        checked++;
        
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
            const data = await response.json();
            
            if (data.cod === 200) {
                const weatherMain = data.weather[0].main;
                const currentTime = Date.now() / 1000;
                const sunrise = data.sys.sunrise;
                const sunset = data.sys.sunset;
                
                let match = false;
                
                // Check for weather match
                if (condition === 'Mist') {
                    // Match Mist, Fog, Haze, etc.
                    match = ['Mist', 'Fog', 'Haze', 'Smoke'].includes(weatherMain);
                } else if (condition === 'Thunderstorm') {
                    match = weatherMain === 'Thunderstorm';
                } else {
                    match = weatherMain === condition;
                }
                
                if (match) {
                    status.textContent = `✨ Found ${condition} in ${city}!`;
                    getCityWeather(city);
                    return;
                }
            }
        } catch (error) {
            console.log(`Error checking ${city}:`, error);
        }
        
        // Check next city
        setTimeout(checkNext, 100);
    };
    
    checkNext();
}

// Global function to update map pin from coordinates
function updateMapPin(lat, lon) {
    const pin = document.getElementById('pin');
    const worldMap = document.getElementById('world-map');
    const mapWrapper = document.getElementById('map-wrapper');
    const mapInfo = document.getElementById('map-info');
    
    if (!pin || !worldMap || !mapWrapper) return;
    
    // Convert lat/lon to pixel position on map
    // Map uses equirectangular projection
    const rect = worldMap.getBoundingClientRect();
    const wrapperRect = mapWrapper.getBoundingClientRect();
    
    const mapWidth = rect.width;
    const mapHeight = rect.height;
    
    // Convert coordinates to pixel position
    // Longitude: -180 to 180 maps to 0 to mapWidth
    // Latitude: 90 to -90 maps to 0 to mapHeight
    const pixelX = ((lon + 180) / 360) * mapWidth;
    const pixelY = ((90 - lat) / 180) * mapHeight;
    
    // Position relative to wrapper
    const pinX = rect.left - wrapperRect.left + pixelX;
    const pinY = rect.top - wrapperRect.top + pixelY;
    
    pin.style.left = pinX + 'px';
    pin.style.top = pinY + 'px';
    pin.style.display = 'block';
    
    // Store the pin map position for dragging to continue working
    if (window.currentPinMapX !== undefined) {
        window.currentPinMapX = pixelX;
        window.currentPinMapY = pixelY;
    }
    
    // Add placement animation
    pin.classList.remove('placed');
    setTimeout(() => pin.classList.add('placed'), 10);
    
    // Update map info and fetch weather
    mapInfo.innerHTML = `<strong>📍 Lat: ${lat.toFixed(2)}°, Lon: ${lon.toFixed(2)}°</strong> - Fetching...`;
    getWeatherByCoordinates(lat, lon);
}

function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all buttons
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    if (tabName === 'main') {
        document.getElementById('main-tab').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else if (tabName === 'map') {
        document.getElementById('map-tab').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        initializeMap();
    }
}

function initializeMap() {
    const worldMap = document.getElementById('world-map');
    const mapWrapper = document.getElementById('map-wrapper');
    const pin = document.getElementById('pin');
    const mapInfo = document.getElementById('map-info');
    
    let scale = 1;
    let isPanning = false;
    let isDraggingPin = false;
    let hasMouseMoved = false;
    let startX = 0, startY = 0;
    let mapOffsetX = 0, mapOffsetY = 0;
    
    // Store pin position relative to the map (not the wrapper)
    let pinMapX = null;
    let pinMapY = null;
    
    // Zoom functions
    window.zoomIn = function() {
        scale = Math.min(scale + 0.5, 5);
        applyTransform();
        updatePinPosition();
    };
    
    window.zoomOut = function() {
        scale = Math.max(scale - 0.5, 1);
        if (scale === 1) {
            mapOffsetX = 0;
            mapOffsetY = 0;
        }
        applyTransform();
        updatePinPosition();
    };
    
    window.resetZoom = function() {
        scale = 1;
        mapOffsetX = 0;
        mapOffsetY = 0;
        applyTransform();
        pin.style.display = 'none';
        pinMapX = null;
        pinMapY = null;
        mapInfo.innerHTML = 'Click anywhere on the map to check weather';
    };
    
    function applyTransform() {
        worldMap.style.transform = `translate(${mapOffsetX}px, ${mapOffsetY}px) scale(${scale})`;
        document.getElementById('zoom-level').textContent = Math.round(scale * 100) + '%';
    }
    
    function updatePinPosition() {
        if (pinMapX !== null && pinMapY !== null && pin.style.display !== 'none') {
            const rect = worldMap.getBoundingClientRect();
            const wrapperRect = mapWrapper.getBoundingClientRect();
            
            // Calculate pin position in wrapper coordinates based on map position
            const pinX = rect.left - wrapperRect.left + pinMapX * scale;
            const pinY = rect.top - wrapperRect.top + pinMapY * scale;
            
            pin.style.left = pinX + 'px';
            pin.style.top = pinY + 'px';
        }
    }
    
    function getCoordinatesFromPixel(pixelX, pixelY) {
        const rect = worldMap.getBoundingClientRect();
        const wrapperRect = mapWrapper.getBoundingClientRect();
        
        const mapX = (pixelX - rect.left) / scale;
        const mapY = (pixelY - rect.top) / scale;
        
        const mapWidth = rect.width / scale;
        const mapHeight = rect.height / scale;
        
        const lon = Math.max(-180, Math.min(180, (mapX / mapWidth) * 360 - 180));
        const lat = Math.max(-90, Math.min(90, 90 - (mapY / mapHeight) * 180));
        
        return { lon, lat };
    }
    
    // Mouse wheel zoom
    mapWrapper.addEventListener('wheel', function(e) {
        e.preventDefault();
        const oldScale = scale;
        scale = e.deltaY < 0 ? Math.min(scale + 0.2, 5) : Math.max(scale - 0.2, 1);
        
        if (scale === 1) {
            mapOffsetX = 0;
            mapOffsetY = 0;
        } else {
            const rect = mapWrapper.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const scaleChange = scale / oldScale;
            mapOffsetX = mouseX - (mouseX - mapOffsetX) * scaleChange;
            mapOffsetY = mouseY - (mouseY - mapOffsetY) * scaleChange;
        }
        applyTransform();
        updatePinPosition();
    });
    
    // Pin drag start
    pin.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        isDraggingPin = true;
        hasMouseMoved = false;
        pin.classList.add('dragging');
        document.body.style.cursor = 'grabbing';
    });
    
    // Map panning start
    mapWrapper.addEventListener('mousedown', function(e) {
        if (e.target === pin || isDraggingPin) return;
        
        if (scale > 1) {
            isPanning = true;
            hasMouseMoved = false;
            startX = e.clientX - mapOffsetX;
            startY = e.clientY - mapOffsetY;
            worldMap.style.cursor = 'grabbing';
        }
    });
    
    // Mouse move
    document.addEventListener('mousemove', function(e) {
        if (isDraggingPin) {
            hasMouseMoved = true;
            const wrapperRect = mapWrapper.getBoundingClientRect();
            const rect = worldMap.getBoundingClientRect();
            
            const newX = e.clientX - wrapperRect.left;
            const newY = e.clientY - wrapperRect.top;
            
            const boundedX = Math.max(0, Math.min(newX, wrapperRect.width));
            const boundedY = Math.max(0, Math.min(newY, wrapperRect.height));
            
            pin.style.left = boundedX + 'px';
            pin.style.top = boundedY + 'px';
            
            // Update pin's position relative to the map
            pinMapX = (boundedX - (rect.left - wrapperRect.left)) / scale;
            pinMapY = (boundedY - (rect.top - wrapperRect.top)) / scale;
            
            const coords = getCoordinatesFromPixel(e.clientX, e.clientY);
            mapInfo.innerHTML = `<strong>📍 Lat: ${coords.lat.toFixed(2)}°, Lon: ${coords.lon.toFixed(2)}°</strong> <span class="map-hint">(Release to update)</span>`;
            
        } else if (isPanning) {
            hasMouseMoved = true;
            mapOffsetX = e.clientX - startX;
            mapOffsetY = e.clientY - startY;
            applyTransform();
            updatePinPosition();
        }
    });
    
    // Mouse up
    document.addEventListener('mouseup', function(e) {
        if (isDraggingPin) {
            pin.classList.remove('dragging');
            document.body.style.cursor = '';
            
            if (hasMouseMoved) {
                const coords = getCoordinatesFromPixel(e.clientX, e.clientY);
                mapInfo.innerHTML = `<strong>📍 Lat: ${coords.lat.toFixed(2)}°, Lon: ${coords.lon.toFixed(2)}°</strong> - Fetching...`;
                getWeatherByCoordinates(coords.lat, coords.lon);
            }
            
            isDraggingPin = false;
            hasMouseMoved = false;
        }
        
        if (isPanning) {
            isPanning = false;
            hasMouseMoved = false;
            worldMap.style.cursor = scale > 1 ? 'grab' : 'crosshair';
        }
    });
    
    // Click to place pin
    mapWrapper.addEventListener('click', function(e) {
        if (hasMouseMoved || isDraggingPin || isPanning || e.target === pin) return;
        
        const wrapperRect = mapWrapper.getBoundingClientRect();
        const rect = worldMap.getBoundingClientRect();
        
        const x = e.clientX - wrapperRect.left;
        const y = e.clientY - wrapperRect.top;
        
        pin.style.left = x + 'px';
        pin.style.top = y + 'px';
        pin.style.display = 'block';
        
        // Store pin position relative to the map
        pinMapX = (x - (rect.left - wrapperRect.left)) / scale;
        pinMapY = (y - (rect.top - wrapperRect.top)) / scale;
        
        pin.classList.remove('placed');
        setTimeout(() => pin.classList.add('placed'), 10);
        
        const coords = getCoordinatesFromPixel(e.clientX, e.clientY);
        mapInfo.innerHTML = `<strong>📍 Lat: ${coords.lat.toFixed(2)}°, Lon: ${coords.lon.toFixed(2)}°</strong> - Fetching...`;
        getWeatherByCoordinates(coords.lat, coords.lon);
    });
    
    // Pin hover
    pin.addEventListener('mouseenter', function() {
        if (!isDraggingPin) {
            pin.style.transform = 'translate(-50%, -100%) scale(1.2)';
            pin.style.cursor = 'grab';
        }
    });
    
    pin.addEventListener('mouseleave', function() {
        if (!isDraggingPin) {
            pin.style.transform = 'translate(-50%, -100%)';
        }
    });
}

function getWeatherByCoordinates(lat, lon) {
    const apiKey = 'ae742a983d97f4208e6e659ba7fda017';
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    
    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            displayMapWeather(data);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            document.getElementById('map-weather-display').innerHTML = '<p>Error fetching weather data</p>';
        });
    
    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            displayMapForecast(data.list);
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
        });
}

function displayMapWeather(data) {
    currentMapWeatherData = data; // Store for unit conversion
    
    const displayDiv = document.getElementById('map-weather-display');
    
    if (data.cod === '404' || data.cod === 404) {
        displayDiv.innerHTML = '<p>Location not found or over ocean</p>';
        return;
    }
    
    const cityName = data.name || 'Unknown Location';
    const country = data.sys.country || '';
    const temperature = convertTemp(data.main.temp);
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const feelsLike = convertTemp(data.main.feels_like);
    
    // Get detailed location info including state/province
    if (data.coord) {
        const apiKey = 'ae742a983d97f4208e6e659ba7fda017';
        fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${data.coord.lat}&lon=${data.coord.lon}&limit=1&appid=${apiKey}`)
            .then(response => response.json())
            .then(geoData => {
                if (geoData && geoData.length > 0) {
                    const state = geoData[0].state || '';
                    const locationString = buildLocationString(cityName, state, country);
                    displayDiv.querySelector('h3').textContent = locationString;
                }
            })
            .catch(err => console.log('Geocoding error:', err));
    }
    
    const localTime = getLocalTime(data.timezone);
    
    const weatherHTML = `
        <div class="map-weather-card">
            <h3>${cityName}${country ? ', ' + country : ''}</h3>
            <p class="local-time">🕐 Local Time: ${localTime}</p>
            <img src="${iconUrl}" alt="${description}" style="width: 100px; height: 100px;">
            <div class="map-temp">${temperature}${getUnitSymbol()}</div>
            <p class="map-description">${description}</p>
            <div class="map-details">
                <p>💧 Humidity: ${humidity}%</p>
                <p>💨 Wind: ${windSpeed} m/s</p>
                <p>🌡️ Feels like: ${feelsLike}${getUnitSymbol()}</p>
            </div>
        </div>
    `;
    
    displayDiv.innerHTML = weatherHTML;
    
    // Update background for map view too
    updateBackground(data.weather[0].main, iconCode);
}

function displayMapForecast(hourlyData) {
    currentMapForecastData = hourlyData; // Store for unit conversion
    
    const displayDiv = document.getElementById('map-weather-display');
    const forecastHTML = '<div class="map-forecast"><h4>Next 24 Hours</h4><div class="map-hourly">';
    
    const next24Hours = hourlyData.slice(0, 8);
    let hourlyItems = '';
    
    next24Hours.forEach(item => {
        const dateTime = new Date(item.dt * 1000);
        const hour = dateTime.getHours();
        const temperature = convertTemp(item.main.temp);
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
        
        hourlyItems += `
            <div class="map-hourly-item">
                <span>${hour}:00</span>
                <img src="${iconUrl}" alt="Weather Icon" style="width: 30px; height: 30px;">
                <span>${temperature}${getUnitSymbol()}</span>
            </div>
        `;
    });
    
    displayDiv.innerHTML += forecastHTML + hourlyItems + '</div></div>';
}

function getWeather() {
    const apiKey = 'ae742a983d97f4208e6e659ba7fda017';
    const city = document.getElementById('city').value;

    if (!city) {
        alert('Please enter a city');
        return;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
            alert('Error fetching current weather data. Please try again.');
        });

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            displayHourlyForecast(data.list);
        })
        .catch(error => {
            console.error('Error fetching hourly forecast data:', error);
            alert('Error fetching hourly forecast data. Please try again.');
        });
}

function displayWeather(data) {
    currentWeatherData = data; // Store for unit conversion
    
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');
    const hourlyForecastDiv = document.getElementById('hourly-forecast');

    // Clear previous content
    weatherInfoDiv.innerHTML = '';
    hourlyForecastDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const cityName = data.name;
        const country = data.sys.country || '';
        const temperature = convertTemp(data.main.temp);
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
        const localTime = getLocalTime(data.timezone);

        const temperatureHTML = `
            <p>${temperature}${getUnitSymbol()}</p>
        `;

        // Get detailed location info including state/province
        let locationText = cityName;
        if (data.coord) {
            const apiKey = 'ae742a983d97f4208e6e659ba7fda017';
            fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${data.coord.lat}&lon=${data.coord.lon}&limit=1&appid=${apiKey}`)
                .then(response => response.json())
                .then(geoData => {
                    if (geoData && geoData.length > 0) {
                        const state = geoData[0].state || '';
                        const locationString = buildLocationString(cityName, state, country);
                        weatherInfoDiv.querySelector('p:first-child').textContent = locationString;
                    }
                })
                .catch(err => console.log('Geocoding error:', err));
        }

        const weatherHtml = `
            <p>${cityName}${country ? ', ' + country : ''}</p>
            <p class="local-time">🕐 ${localTime}</p>
            <p>${description}</p>
        `;

        tempDivInfo.innerHTML = temperatureHTML;
        weatherInfoDiv.innerHTML = weatherHtml;
        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;

        showImage();
        updateBackground(data.weather[0].main, iconCode);
        
        // Update map pin and weather for this location
        if (data.coord) {
            updateMapPin(data.coord.lat, data.coord.lon);
        }
    }
}

function displayHourlyForecast(hourlyData) {
    currentForecastData = hourlyData; // Store for unit conversion
    
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    hourlyForecastDiv.innerHTML = ''; // Clear previous content

    const next24Hours = hourlyData.slice(0, 8); // Display the next 24 hours (3-hour intervals)

    next24Hours.forEach(item => {
        const dateTime = new Date(item.dt * 1000); // Convert timestamp to milliseconds
        const hour = dateTime.getHours();
        const temperature = convertTemp(item.main.temp);
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItemHtml = `
            <div class="hourly-item">
                <span>${hour}:00</span>
                <img src="${iconUrl}" alt="Hourly Weather Icon">
                <span>${temperature}${getUnitSymbol()}</span>
            </div>
        `;

        hourlyForecastDiv.innerHTML += hourlyItemHtml;
    });
}

function showImage() {
    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.style.display = 'block'; // Make the image visible once it's loaded
}

function updateBackground(weatherMain, iconCode) {
    const body = document.body;
    const rainContainer = document.getElementById('rain-container');
    const snowContainer = document.getElementById('snow-container');
    
    // Clear previous weather effects
    body.className = '';
    rainContainer.innerHTML = '';
    snowContainer.innerHTML = '';
    
    const isNight = iconCode.includes('n');
    
    switch(weatherMain.toLowerCase()) {
        case 'clear':
            body.className = isNight ? 'clear-night' : 'sunny';
            if (isNight) createStars();
            break;
        case 'clouds':
            body.className = 'cloudy';
            break;
        case 'rain':
        case 'drizzle':
            body.className = 'rainy';
            createRain();
            break;
        case 'thunderstorm':
            body.className = 'thunderstorm';
            createRain();
            createLightning();
            break;
        case 'snow':
            body.className = 'snowy';
            createSnow();
            break;
        case 'mist':
        case 'fog':
        case 'haze':
            body.className = 'misty';
            break;
        default:
            body.className = 'default';
    }
}

function createRain() {
    const rainContainer = document.getElementById('rain-container');
    for (let i = 0; i < 100; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.animationDelay = Math.random() * 2 + 's';
        drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
        rainContainer.appendChild(drop);
    }
}

function createSnow() {
    const snowContainer = document.getElementById('snow-container');
    for (let i = 0; i < 50; i++) {
        const flake = document.createElement('div');
        flake.className = 'snow-flake';
        flake.innerHTML = '❄';
        flake.style.left = Math.random() * 100 + '%';
        flake.style.animationDelay = Math.random() * 3 + 's';
        flake.style.animationDuration = (Math.random() * 3 + 2) + 's';
        flake.style.fontSize = (Math.random() * 10 + 10) + 'px';
        snowContainer.appendChild(flake);
    }
}

function createStars() {
    const body = document.body;
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        body.appendChild(star);
    }
}

function createLightning() {
    setInterval(() => {
        if (Math.random() > 0.95) {
            document.body.style.backgroundColor = '#fff';
            setTimeout(() => {
                document.body.style.backgroundColor = '';
            }, 100);
        }
    }, 500);
}

// Draggable window functionality
let isDragging = false;
let currentDraggable = null;
let offsetX = 0;
let offsetY = 0;

function initDraggableWindows() {
    const draggables = document.querySelectorAll('.draggable');
    
    draggables.forEach(draggable => {
        const header = draggable.querySelector('.window-header');
        if (!header) return;
        
        header.addEventListener('mousedown', (e) => {
            // Don't drag if clicking on buttons
            if (e.target.classList.contains('minimize-btn') || 
                e.target.classList.contains('close-btn')) {
                return;
            }
            
            isDragging = true;
            currentDraggable = draggable;
            
            const rect = draggable.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            draggable.classList.add('dragging');
            draggable.style.position = 'fixed';
            draggable.style.zIndex = '1000';
        });
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !currentDraggable) return;
        
        e.preventDefault();
        
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;
        
        // Keep window within viewport
        const rect = currentDraggable.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        currentDraggable.style.left = newX + 'px';
        currentDraggable.style.top = newY + 'px';
        currentDraggable.style.margin = '0';
    });
    
    document.addEventListener('mouseup', () => {
        if (currentDraggable) {
            currentDraggable.classList.remove('dragging');
            currentDraggable.style.zIndex = '100';
        }
        isDragging = false;
        currentDraggable = null;
    });
}

function minimizeWindow(windowId) {
    const window = document.getElementById(windowId);
    const taskbar = document.getElementById('taskbar');
    
    if (!window || !taskbar) return;
    
    window.classList.add('minimized');
    taskbar.style.display = 'flex';
    
    // Create taskbar item if it doesn't exist
    let taskbarItem = document.getElementById(`taskbar-${windowId}`);
    if (!taskbarItem) {
        taskbarItem = document.createElement('div');
        taskbarItem.className = 'taskbar-item';
        taskbarItem.id = `taskbar-${windowId}`;
        
        const title = window.querySelector('.window-title');
        taskbarItem.textContent = title ? title.textContent : windowId;
        
        taskbarItem.onclick = () => restoreWindow(windowId);
        taskbar.appendChild(taskbarItem);
    }
}

function restoreWindow(windowId) {
    const window = document.getElementById(windowId);
    const taskbarItem = document.getElementById(`taskbar-${windowId}`);
    const taskbar = document.getElementById('taskbar');
    
    if (!window) return;
    
    window.classList.remove('minimized');
    
    if (taskbarItem) {
        taskbarItem.remove();
    }
    
    // Hide taskbar if no items
    const remainingItems = taskbar.querySelectorAll('.taskbar-item');
    if (remainingItems.length === 0) {
        taskbar.style.display = 'none';
    }
}

function closeWindow(windowId) {
    const window = document.getElementById(windowId);
    const taskbarItem = document.getElementById(`taskbar-${windowId}`);
    const taskbar = document.getElementById('taskbar');
    
    if (!window) return;
    
    window.style.display = 'none';
    
    if (taskbarItem) {
        taskbarItem.remove();
    }
    
    // Hide taskbar if no items
    const remainingItems = taskbar.querySelectorAll('.taskbar-item');
    if (remainingItems.length === 0) {
        taskbar.style.display = 'none';
    }
    
    // Update launcher checkbox
    updateLauncherCheckboxes();
}

function getLocalTime(timezoneOffset) {
    // timezoneOffset is in seconds, convert to milliseconds
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (timezoneOffset * 1000));
    
    return localTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Resize variables
let isResizing = false;
let currentResizable = null;
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartWidth = 0;
let resizeStartHeight = 0;
let resizeStartLeft = 0;
let resizeStartTop = 0;
let resizeDirection = '';

function initResizableWindows() {
    const resizables = document.querySelectorAll('.resizable');
    
    resizables.forEach(resizable => {
        const handles = resizable.querySelectorAll('.resize-handle');
        
        handles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                isResizing = true;
                currentResizable = resizable;
                
                // Determine resize direction from class name
                const classes = handle.className.split(' ');
                resizeDirection = classes.find(c => c.startsWith('resize-')).replace('resize-', '');
                
                resizeStartX = e.clientX;
                resizeStartY = e.clientY;
                
                const rect = resizable.getBoundingClientRect();
                resizeStartWidth = rect.width;
                resizeStartHeight = rect.height;
                resizeStartLeft = rect.left;
                resizeStartTop = rect.top;
                
                resizable.style.position = 'fixed';
                resizable.style.transition = 'none';
                resizable.classList.add('resizing');
                document.body.style.cursor = handle.style.cursor || window.getComputedStyle(handle).cursor;
                document.body.style.userSelect = 'none';
            });
        });
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isResizing || !currentResizable) return;
        
        e.preventDefault();
        
        const deltaX = e.clientX - resizeStartX;
        const deltaY = e.clientY - resizeStartY;
        
        let newWidth = resizeStartWidth;
        let newHeight = resizeStartHeight;
        let newLeft = resizeStartLeft;
        let newTop = resizeStartTop;
        
        const minWidth = 300;
        const minHeight = 200;
        
        // Apply resize based on direction
        if (resizeDirection.includes('e')) {
            newWidth = resizeStartWidth + deltaX;
        }
        if (resizeDirection.includes('w')) {
            const widthChange = Math.min(deltaX, resizeStartWidth - minWidth);
            newWidth = resizeStartWidth - widthChange;
            newLeft = resizeStartLeft + widthChange;
        }
        if (resizeDirection.includes('s')) {
            newHeight = resizeStartHeight + deltaY;
        }
        if (resizeDirection.includes('n')) {
            const heightChange = Math.min(deltaY, resizeStartHeight - minHeight);
            newHeight = resizeStartHeight - heightChange;
            newTop = resizeStartTop + heightChange;
        }
        
        // Apply minimum and maximum constraints
        newWidth = Math.max(minWidth, Math.min(newWidth, window.innerWidth - newLeft - 20));
        newHeight = Math.max(minHeight, Math.min(newHeight, window.innerHeight - newTop - 80));
        
        currentResizable.style.width = newWidth + 'px';
        currentResizable.style.height = newHeight + 'px';
        currentResizable.style.left = newLeft + 'px';
        currentResizable.style.top = newTop + 'px';
        currentResizable.style.overflow = 'auto';
        
        // Adjust grid layout for narrow widths
        const citiesGrid = currentResizable.querySelector('#cities-grid');
        const finderButtons = currentResizable.querySelector('#weather-finder');
        
        if (citiesGrid && newWidth < 500) {
            citiesGrid.style.gridTemplateColumns = '1fr';
        } else if (citiesGrid) {
            citiesGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        }
        
        if (finderButtons && newWidth < 450) {
            finderButtons.style.gridTemplateColumns = '1fr';
        } else if (finderButtons) {
            finderButtons.style.gridTemplateColumns = 'repeat(2, 1fr)';
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (currentResizable) {
            currentResizable.style.transition = '';
            currentResizable.classList.remove('resizing');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
        isResizing = false;
        currentResizable = null;
        resizeDirection = '';
    });
}

function toggleLauncher() {
    const menu = document.getElementById('launcher-menu');
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'block';
        updateLauncherCheckboxes();
    } else {
        menu.style.display = 'none';
    }
}

function toggleWindowVisibility(windowId) {
    const window = document.getElementById(windowId);
    const checkbox = document.getElementById(`toggle-${windowId}`);
    
    if (!window) return;
    
    if (checkbox.checked) {
        // Show window
        window.style.display = '';
        window.classList.remove('minimized');
        
        // Remove from taskbar if present
        const taskbarItem = document.getElementById(`taskbar-${windowId}`);
        if (taskbarItem) {
            taskbarItem.remove();
        }
        
        // Hide taskbar if empty
        const taskbar = document.getElementById('taskbar');
        const remainingItems = taskbar.querySelectorAll('.taskbar-item');
        if (remainingItems.length === 0) {
            taskbar.style.display = 'none';
        }
    } else {
        // Hide window
        closeWindow(windowId);
    }
}

function updateLauncherCheckboxes() {
    const windows = ['world-view', 'weather-finder-window', 'weather-container', 'map-container'];
    
    windows.forEach(windowId => {
        const window = document.getElementById(windowId);
        const checkbox = document.getElementById(`toggle-${windowId}`);
        
        if (window && checkbox) {
            checkbox.checked = window.style.display !== 'none';
        }
    });
}

// Initialize draggable windows on page load
document.addEventListener('DOMContentLoaded', () => {
    initDraggableWindows();
    initResizableWindows();
    updateLauncherCheckboxes();
});