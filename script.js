// Constants
const DEFAULT_CITY = "Jakarta"; // Kota default
const WEATHERAPI_KEY = "f9ef2f0e7c6d4e7f9c6123456789abc"; // API key gratis dari WeatherAPI.com

// DOM Elements
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const weatherContainer = document.getElementById('weather-container');
const loadingIndicator = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon = themeToggleBtn.querySelector('i');
const themeText = themeToggleBtn.querySelector('span');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Cek tema yang tersimpan
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        enableDarkTheme();
    }
    
    // Muat cuaca untuk kota default
    getWeatherData(DEFAULT_CITY);
});

searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

themeToggleBtn.addEventListener('click', toggleTheme);

// Toggle Theme Function
function toggleTheme() {
    if (document.body.classList.contains('dark-theme')) {
        enableLightTheme();
    } else {
        enableDarkTheme();
    }
}

function enableDarkTheme() {
    document.body.classList.add('dark-theme');
    themeIcon.className = 'fas fa-sun';
    themeText.textContent = 'Mode Terang';
    localStorage.setItem('theme', 'dark');
}

function enableLightTheme() {
    document.body.classList.remove('dark-theme');
    themeIcon.className = 'fas fa-moon';
    themeText.textContent = 'Mode Gelap';
    localStorage.setItem('theme', 'light');
}

// Fetch Weather Data
async function getWeatherData(city) {
    showLoading();
    
    try {
        // Menggunakan WeatherAPI.com (gratis tanpa API key)
        const weatherResponse = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${city}&days=5&aqi=yes&lang=id`
        );
        
        if (!weatherResponse.ok) {
            throw new Error('Kota tidak ditemukan atau batas penggunaan API tercapai');
        }
        
        const weatherData = await weatherResponse.json();
        
        // Update UI with data
        updateUI(weatherData);
        
        // Save last searched city
        localStorage.setItem('lastCity', city);
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        
        // Jika WeatherAPI gagal, coba gunakan API alternatif (MET Norway)
        try {
            // Konversi nama kota ke koordinat menggunakan Nominatim OpenStreetMap API
            const geoResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
            );
            
            if (!geoResponse.ok) {
                throw new Error('Gagal mendapatkan koordinat lokasi');
            }
            
            const geoData = await geoResponse.json();
            
            if (geoData.length === 0) {
                throw new Error('Lokasi tidak ditemukan');
            }
            
            const lat = geoData[0].lat;
            const lon = geoData[0].lon;
            const locationName = geoData[0].display_name;
            
            // Ambil data cuaca dari MET Norway API (gratis, tanpa API key)
            const metResponse = await fetch(
                `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`
            );
            
            if (!metResponse.ok) {
                throw new Error('Gagal mendapatkan data cuaca');
            }
            
            const metData = await metResponse.json();
            
            // Update UI dengan data dari MET Norway
            updateUIFromMET(metData, locationName);
            
            // Save last searched city
            localStorage.setItem('lastCity', city);
            
        } catch (metError) {
            console.error('Error fetching from alternative API:', metError);
            showError(error.message);
        }
    }
}

// Update UI with WeatherAPI Data
function updateUI(data) {
    // Hide loading and error, show weather container
    hideLoading();
    errorContainer.style.display = 'none';
    weatherContainer.style.display = 'block';
    
    // Update current weather
    updateCurrentWeather(data);
    
    // Update forecast
    updateForecast(data);
}

// Update Current Weather UI from WeatherAPI
function updateCurrentWeather(data) {
    // Location and date
    document.getElementById('location').textContent = `${data.location.name}, ${data.location.country}`;
    
    const currentDate = new Date(data.location.localtime);
    document.getElementById('date-time').textContent = formatDate(currentDate, true);
    
    // Weather icon
    const iconUrl = data.current.condition.icon;
    document.getElementById('weather-icon').src = iconUrl;
    document.getElementById('weather-icon').alt = data.current.condition.text;
    
    // Temperature and description
    document.getElementById('temperature').textContent = `${Math.round(data.current.temp_c)}°C`;
    document.getElementById('weather-description').textContent = capitalizeFirstLetter(data.current.condition.text);
    
    // Weather details
    document.getElementById('feels-like').textContent = `${Math.round(data.current.feelslike_c)}°C`;
    document.getElementById('humidity').textContent = `${data.current.humidity}%`;
    document.getElementById('wind-speed').textContent = `${data.current.wind_kph} km/h`;
    document.getElementById('pressure').textContent = `${data.current.pressure_mb} hPa`;
}

// Update Forecast UI from WeatherAPI
function updateForecast(data) {
    const forecastCardsContainer = document.getElementById('forecast-cards');
    forecastCardsContainer.innerHTML = '';
    
    // Get daily forecast
    const dailyForecast = data.forecast.forecastday;
    
    dailyForecast.forEach(day => {
        const date = new Date(day.date);
        const iconUrl = day.day.condition.icon;
        const tempMax = Math.round(day.day.maxtemp_c);
        const tempMin = Math.round(day.day.mintemp_c);
        const description = capitalizeFirstLetter(day.day.condition.text);
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-date">${formatDate(date)}</div>
            <div class="forecast-icon">
                <img src="${iconUrl}" alt="${description}">
            </div>
            <div class="forecast-temp">${tempMax}°C</div>
            <div class="forecast-description">${description}</div>
            <div class="forecast-details">
                <span><i class="fas fa-temperature-low"></i> ${tempMin}°C</span>
                <span><i class="fas fa-tint"></i> ${day.day.avghumidity}%</span>
            </div>
        `;
        
        forecastCardsContainer.appendChild(forecastCard);
    });
}

// Update UI with MET Norway Data
function updateUIFromMET(data, locationName) {
    // Hide loading and error, show weather container
    hideLoading();
    errorContainer.style.display = 'none';
    weatherContainer.style.display = 'block';
    
    // Current weather data (first time step)
    const currentData = data.properties.timeseries[0];
    const currentDetails = currentData.data.instant.details;
    const currentSymbol = currentData.data.next_1_hours?.summary?.symbol_code || 
                         currentData.data.next_6_hours?.summary?.symbol_code || 
                         'cloudy';
    
    // Location and date
    document.getElementById('location').textContent = locationName.split(',')[0];
    
    const currentDate = new Date(currentData.time);
    document.getElementById('date-time').textContent = formatDate(currentDate, true);
    
    // Weather icon (using MET Norway symbols)
    const iconUrl = `https://api.met.no/images/weathericons/png/${currentSymbol}.png`;
    document.getElementById('weather-icon').src = iconUrl;
    document.getElementById('weather-icon').alt = getWeatherDescription(currentSymbol);
    
    // Temperature and description
    document.getElementById('temperature').textContent = `${Math.round(currentDetails.air_temperature)}°C`;
    document.getElementById('weather-description').textContent = getWeatherDescription(currentSymbol);
    
    // Weather details
    document.getElementById('feels-like').textContent = `${Math.round(currentDetails.air_temperature)}°C`;
    document.getElementById('humidity').textContent = `${Math.round(currentDetails.relative_humidity)}%`;
    document.getElementById('wind-speed').textContent = `${(currentDetails.wind_speed * 3.6).toFixed(1)} km/h`;
    document.getElementById('pressure').textContent = `${Math.round(currentDetails.air_pressure_at_sea_level)} hPa`;
    
    // Forecast
    updateForecastFromMET(data);
}

// Update Forecast UI from MET Norway
function updateForecastFromMET(data) {
    const forecastCardsContainer = document.getElementById('forecast-cards');
    forecastCardsContainer.innerHTML = '';
    
    // Get daily forecast (every 24 hours for 5 days)
    const dailyForecast = [];
    const timeseriesData = data.properties.timeseries;
    
    // Group by day
    const days = {};
    timeseriesData.forEach(item => {
        const date = new Date(item.time);
        const dateStr = date.toISOString().split('T')[0];
        
        if (!days[dateStr]) {
            days[dateStr] = [];
        }
        
        days[dateStr].push(item);
    });
    
    // Get one entry per day (noon time preferably)
    Object.keys(days).slice(0, 5).forEach(dateStr => {
        const dayData = days[dateStr];
        
        // Try to get noon time data
        let selectedData = dayData[0];
        for (const item of dayData) {
            const date = new Date(item.time);
            if (date.getHours() >= 12 && date.getHours() <= 14) {
                selectedData = item;
                break;
            }
        }
        
        dailyForecast.push(selectedData);
    });
    
    // Create forecast cards
    dailyForecast.forEach(day => {
        const date = new Date(day.time);
        const details = day.data.instant.details;
        const symbol = day.data.next_6_hours?.summary?.symbol_code || 
                      day.data.next_1_hours?.summary?.symbol_code || 
                      'cloudy';
        
        const iconUrl = `https://api.met.no/images/weathericons/png/${symbol}.png`;
        const tempMax = Math.round(details.air_temperature);
        const tempMin = Math.round(details.air_temperature - 2); // Approximation
        const description = getWeatherDescription(symbol);
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-date">${formatDate(date)}</div>
            <div class="forecast-icon">
                <img src="${iconUrl}" alt="${description}">
            </div>
            <div class="forecast-temp">${tempMax}°C</div>
            <div class="forecast-description">${description}</div>
            <div class="forecast-details">
                <span><i class="fas fa-temperature-low"></i> ${tempMin}°C</span>
                <span><i class="fas fa-tint"></i> ${Math.round(details.relative_humidity)}%</span>
            </div>
        `;
        
        forecastCardsContainer.appendChild(forecastCard);
    });
}

// Helper function to get weather description from MET Norway symbol code
function getWeatherDescription(symbolCode) {
    const descriptions = {
        'clearsky': 'Cerah',
        'fair': 'Cerah Berawan',
        'partlycloudy': 'Berawan Sebagian',
        'cloudy': 'Berawan',
        'rainshowers': 'Hujan Ringan',
        'rainshowersandthunder': 'Hujan Petir',
        'sleetshowers': 'Hujan Es',
        'snowshowers': 'Hujan Salju',
        'rain': 'Hujan',
        'heavyrain': 'Hujan Lebat',
        'heavyrainandthunder': 'Hujan Lebat dan Petir',
        'sleet': 'Hujan Es',
        'snow': 'Salju',
        'snowandthunder': 'Salju dan Petir',
        'fog': 'Berkabut',
        'sleetshowersandthunder': 'Hujan Es dan Petir',
        'snowshowersandthunder': 'Hujan Salju dan Petir',
        'rainandthunder': 'Hujan dan Petir',
        'sleetandthunder': 'Hujan Es dan Petir'
    };
    
    // Handle day/night variations
    const baseCode = symbolCode.split('_')[0];
    return descriptions[baseCode] || 'Tidak Diketahui';
}

// Helper Functions
function formatDate(date, includeTime = false) {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('id-ID', options);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showLoading() {
    weatherContainer.style.display = 'none';
    errorContainer.style.display = 'none';
    loadingIndicator.style.display = 'flex';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
}

function showError(message) {
    hideLoading();
    weatherContainer.style.display = 'none';
    errorContainer.style.display = 'flex';
    errorMessage.textContent = message;
}

// Check if there's a last searched city in localStorage
document.addEventListener('DOMContentLoaded', function() {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        getWeatherData(lastCity);
    } else {
        getWeatherData(DEFAULT_CITY);
    }
});
