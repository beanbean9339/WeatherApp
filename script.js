function getCityWeather(cityName) {
    document.getElementById('city').value = cityName;
    getWeather();
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
    const pin = document.getElementById('pin');
    const mapInfo = document.getElementById('map-info');
    
    worldMap.onclick = function(event) {
        const rect = worldMap.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert pixel coordinates to lat/lon
        const lon = (x / rect.width) * 360 - 180;
        const lat = 90 - (y / rect.height) * 180;
        
        // Position the pin
        pin.style.left = x + 'px';
        pin.style.top = y + 'px';
        pin.style.display = 'block';
        
        // Update info
        mapInfo.textContent = `Lat: ${lat.toFixed(2)}°, Lon: ${lon.toFixed(2)}°`;
        
        // Fetch weather for these coordinates
        getWeatherByCoordinates(lat, lon);
    };
    
    // Update cursor position info on hover
    worldMap.onmousemove = function(event) {
        const rect = worldMap.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const lon = (x / rect.width) * 360 - 180;
        const lat = 90 - (y / rect.height) * 180;
        
        mapInfo.textContent = `Lat: ${lat.toFixed(2)}°, Lon: ${lon.toFixed(2)}° (Click to get weather)`;
    };
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
    const displayDiv = document.getElementById('map-weather-display');
    
    if (data.cod === '404' || data.cod === 404) {
        displayDiv.innerHTML = '<p>Location not found or over ocean</p>';
        return;
    }
    
    const cityName = data.name || 'Unknown Location';
    const country = data.sys.country || '';
    const temperature = Math.round(data.main.temp - 273.15);
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const feelsLike = Math.round(data.main.feels_like - 273.15);
    
    const weatherHTML = `
        <div class="map-weather-card">
            <h3>${cityName}${country ? ', ' + country : ''}</h3>
            <img src="${iconUrl}" alt="${description}" style="width: 100px; height: 100px;">
            <div class="map-temp">${temperature}°C</div>
            <p class="map-description">${description}</p>
            <div class="map-details">
                <p>💧 Humidity: ${humidity}%</p>
                <p>💨 Wind: ${windSpeed} m/s</p>
                <p>🌡️ Feels like: ${feelsLike}°C</p>
            </div>
        </div>
    `;
    
    displayDiv.innerHTML = weatherHTML;
    
    // Update background for map view too
    updateBackground(data.weather[0].main, iconCode);
}

function displayMapForecast(hourlyData) {
    const displayDiv = document.getElementById('map-weather-display');
    const forecastHTML = '<div class="map-forecast"><h4>Next 24 Hours</h4><div class="map-hourly">';
    
    const next24Hours = hourlyData.slice(0, 8);
    let hourlyItems = '';
    
    next24Hours.forEach(item => {
        const dateTime = new Date(item.dt * 1000);
        const hour = dateTime.getHours();
        const temperature = Math.round(item.main.temp - 273.15);
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
        
        hourlyItems += `
            <div class="map-hourly-item">
                <span>${hour}:00</span>
                <img src="${iconUrl}" alt="Weather Icon" style="width: 30px; height: 30px;">
                <span>${temperature}°C</span>
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
        const temperature = Math.round(data.main.temp - 273.15); // Convert to Celsius
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        const temperatureHTML = `
            <p>${temperature}°C</p>
        `;

        const weatherHtml = `
            <p>${cityName}</p>
            <p>${description}</p>
        `;

        tempDivInfo.innerHTML = temperatureHTML;
        weatherInfoDiv.innerHTML = weatherHtml;
        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;

        showImage();
        updateBackground(data.weather[0].main, iconCode);
    }
}

function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');

    const next24Hours = hourlyData.slice(0, 8); // Display the next 24 hours (3-hour intervals)

    next24Hours.forEach(item => {
        const dateTime = new Date(item.dt * 1000); // Convert timestamp to milliseconds
        const hour = dateTime.getHours();
        const temperature = Math.round(item.main.temp - 273.15); // Convert to Celsius
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItemHtml = `
            <div class="hourly-item">
                <span>${hour}:00</span>
                <img src="${iconUrl}" alt="Hourly Weather Icon">
                <span>${temperature}°C</span>
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