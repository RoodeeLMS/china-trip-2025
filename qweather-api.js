// QWeather API Integration - Daily + Hourly Forecasts
// API Documentation: https://dev.qweather.com/en/docs/api/

const QWEATHER_CONFIG = {
    apiKey: 'e575336e2b114523acfd1f3c8c2f362a', // ✅ Your QWeather API Key
    lang: 'en', // or 'zh' for Chinese
    unit: 'm' // metric (Celsius), use 'i' for imperial (Fahrenheit)
};

// City location IDs (from QWeather)
const CITY_LOCATIONS = {
    'chongqing': '101040100',
    'wulong': '101040100', // Part of Chongqing
    'fenghuang': '101251505',
    'furongzhen': '101251101', // Near Zhangjiajie
    'zhangjiajie': '101251101',
    'wulingyuan': '101251101', // Part of Zhangjiajie
    'chengdu': '101270101',
    'jiuzhaigou': '101271906',
    'huanglong': '101271906', // Near Jiuzhaigou
    'shuangqiaogou': '101270201', // Aba Prefecture
    'bipenggou': '101270201', // Aba Prefecture
    'dagu': '101270201', // Aba Prefecture/Dagu Glacier
    'leshan': '101271401',
    'emeishan': '101271414'
};

// Fetch 30-day weather forecast
async function fetchDailyWeather(locationId, date) {
    const baseUrl = 'https://nv7aaqbdwy.re.qweatherapi.com/v7/weather/30d';
    const url = `${baseUrl}?location=${locationId}&key=${QWEATHER_CONFIG.apiKey}&lang=${QWEATHER_CONFIG.lang}&unit=${QWEATHER_CONFIG.unit}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === '200') {
            const forecast = data.daily.find(day => day.fxDate === date);
            return forecast;
        } else {
            console.error('QWeather Daily API Error:', data.code, data);
            return null;
        }
    } catch (error) {
        console.error('Daily fetch error:', error);
        return null;
    }
}

// Fetch 24-hour hourly forecast
async function fetchHourlyWeather(locationId) {
    // Try multiple API endpoints (free tier sometimes has different access)
    const endpoints = [
        'https://nv7aaqbdwy.re.qweatherapi.com/v7/weather/24h',
        'https://api.qweather.com/v7/weather/24h'
    ];

    for (const baseUrl of endpoints) {
        const url = `${baseUrl}?location=${locationId}&key=${QWEATHER_CONFIG.apiKey}&lang=${QWEATHER_CONFIG.lang}&unit=${QWEATHER_CONFIG.unit}`;

        try {
            console.log(`Trying hourly forecast from: ${baseUrl}`);
            const response = await fetch(url);
            const data = await response.json();

            if (data.code === '200') {
                console.log('✅ Hourly forecast fetched successfully!');
                return data.hourly;
            } else if (data.code === '403') {
                console.warn(`403 error from ${baseUrl} - trying next endpoint...`);
                continue;
            } else {
                console.error('QWeather Hourly API Error:', data.code, data);
                continue;
            }
        } catch (error) {
            console.error(`Hourly fetch error from ${baseUrl}:`, error);
            continue;
        }
    }

    console.warn('⚠️ Hourly forecast unavailable - this may require a paid plan or personalized API host');
    return null;
}

// Get weather icon emoji
function getWeatherIcon(condition) {
    const iconMap = {
        'sunny': '☀️',
        'clear': '🌙',
        'partly cloudy': '⛅',
        'cloudy': '☁️',
        'overcast': '☁️',
        'shower': '🌧️',
        'rain': '🌧️',
        'thunderstorm': '⛈️',
        'snow': '❄️',
        'fog': '🌫️',
        'haze': '😶‍🌫️'
    };

    const key = Object.keys(iconMap).find(k => condition.toLowerCase().includes(k));
    return iconMap[key] || '🌤️';
}

// Format time from "2025-10-14T14:00+08:00" to "2:00 PM"
function formatHourTime(fxTime) {
    const date = new Date(fxTime);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Update daily weather display
function updateDailyWeather(dayElement, weatherData, locationId) {
    if (!weatherData) return;

    const weatherBox = dayElement.querySelector('.weather-box');
    if (!weatherBox) return;

    const tempMax = weatherData.tempMax;
    const tempMin = weatherData.tempMin;
    const condition = weatherData.textDay;
    const humidity = weatherData.humidity;
    const precip = weatherData.precip;

    const weatherText = `
        <strong>🌤️ Weather:</strong>
        ${tempMin}-${tempMax}°C (${Math.round(tempMin*1.8+32)}-${Math.round(tempMax*1.8+32)}°F),
        ${condition.toLowerCase()}${precip > 0 ? `, ${precip}mm rain` : ''}.
        Humidity: ${humidity}%.
        <a href="https://www.qweather.com/en/weather30d/${dayElement.dataset.city}-${locationId}.html" target="_blank">30-day forecast →</a>
        <span class="update-time">Updated: ${new Date().toLocaleString()}</span>
    `;

    weatherBox.innerHTML = weatherText;
}

// Create hourly forecast timeline
function createHourlyTimeline(hourlyData) {
    if (!hourlyData || hourlyData.length === 0) return '';

    // Show 24 hours: every 2 hours = 12 time slots
    const displayHours = hourlyData.filter((_, index) => index % 2 === 0).slice(0, 12);

    let timelineHTML = `
        <div class="hourly-forecast">
            <div class="hourly-header" onclick="this.parentElement.classList.toggle('expanded')">
                <strong>📊 24-Hour Forecast</strong>
                <span class="hourly-toggle">▼</span>
            </div>
            <div class="hourly-content">
                <div class="hourly-timeline">
    `;

    displayHours.forEach(hour => {
        const icon = getWeatherIcon(hour.text);
        const time = formatHourTime(hour.fxTime);
        const temp = hour.temp;
        const precipProb = hour.pop; // Precipitation probability
        const wind = hour.windSpeed;

        timelineHTML += `
            <div class="hour-item">
                <div class="hour-time">${time}</div>
                <div class="hour-icon">${icon}</div>
                <div class="hour-temp">${temp}°C</div>
                <div class="hour-precip">${precipProb}% 💧</div>
                <div class="hour-wind">${wind}km/h</div>
            </div>
        `;
    });

    timelineHTML += `
                </div>
                <div class="hourly-note">
                    <em>Showing every 2 hours. Precipitation probability and wind speed included.</em>
                </div>
            </div>
        </div>
    `;

    return timelineHTML;
}

// Update both daily and hourly weather for a day
async function updateDayWeather(dayElement) {
    const city = dayElement.dataset.city;
    const date = dayElement.dataset.date;
    const locationId = CITY_LOCATIONS[city];

    if (!locationId || !date) {
        console.warn('Missing city or date data for day:', dayElement.dataset.day);
        return;
    }

    // Fetch daily weather
    const dailyWeather = await fetchDailyWeather(locationId, date);
    updateDailyWeather(dayElement, dailyWeather, locationId);

    // Fetch hourly weather
    const hourlyWeather = await fetchHourlyWeather(locationId);

    // Insert hourly timeline after weather-box
    const weatherBox = dayElement.querySelector('.weather-box');
    if (weatherBox) {
        // Remove existing hourly forecast if present
        const existing = dayElement.querySelector('.hourly-forecast');
        if (existing) existing.remove();

        if (hourlyWeather) {
            const hourlyHTML = createHourlyTimeline(hourlyWeather);
            weatherBox.insertAdjacentHTML('afterend', hourlyHTML);
        } else {
            // Show message if hourly forecast unavailable
            const fallbackHTML = `
                <div class="hourly-forecast-unavailable" style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 1rem; margin: 1rem 0; color: #856404;">
                    <strong>ℹ️ 24-Hour Forecast Unavailable</strong><br>
                    <small>Hourly forecasts may require a personalized API host. Daily forecasts are still active!</small>
                </div>
            `;
            weatherBox.insertAdjacentHTML('afterend', fallbackHTML);
        }
    }
}

// Initialize weather updates for all days
async function initializeWeatherUpdates() {
    console.log('Initializing QWeather API (Daily + Hourly)...');

    // Find all days with data attributes
    const days = document.querySelectorAll('.day[data-day][data-city][data-date]');

    if (days.length === 0) {
        console.warn('No days found with proper data attributes (data-day, data-city, data-date)');
        return;
    }

    // Update each day
    for (const day of days) {
        await updateDayWeather(day);
        console.log(`✅ Weather updated for Day ${day.dataset.day}`);
    }

    console.log('✅ All weather updates complete!');
}

// Auto-run when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if API key is set
    if (QWEATHER_CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
        console.warn('⚠️ QWeather API key not set! Please update QWEATHER_CONFIG.apiKey');
        return;
    }

    initializeWeatherUpdates();
});

// Export for manual updates
window.QWeatherAPI = {
    updateAll: initializeWeatherUpdates,
    updateDay: updateDayWeather,
    fetchDaily: fetchDailyWeather,
    fetchHourly: fetchHourlyWeather
};
