// QWeather API Integration
// Replace 'YOUR_API_KEY_HERE' with your actual API key from https://console.qweather.com

const QWEATHER_CONFIG = {
    apiKey: 'e575336e2b114523acfd1f3c8c2f362a', // ✅ Your QWeather API Key
    lang: 'en', // or 'zh' for Chinese
    unit: 'm' // metric (Celsius), use 'i' for imperial (Fahrenheit)
};

// City location IDs (from QWeather)
const CITY_LOCATIONS = {
    'chongqing': '101040100',
    'fenghuang': '101251505',
    'zhangjiajie': '101251101',
    'chengdu': '101270101',
    'jiuzhaigou': '101271906',
    'leshan': '101271401',
    'emeishan': '101271414'
};

// Fetch weather data from QWeather API
async function fetchQWeather(locationId, date) {
    const baseUrl = 'https://devapi.qweather.com/v7/weather/30d';
    const url = `${baseUrl}?location=${locationId}&key=${QWEATHER_CONFIG.apiKey}&lang=${QWEATHER_CONFIG.lang}&unit=${QWEATHER_CONFIG.unit}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === '200') {
            // Find forecast for specific date
            const forecast = data.daily.find(day => day.fxDate === date);
            return forecast;
        } else {
            console.error('QWeather API Error:', data.code, data);
            return null;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

// Update weather display on page
function updateWeatherDisplay(dayElement, weatherData) {
    if (!weatherData) return;

    const weatherBox = dayElement.querySelector('.weather-box');
    if (!weatherBox) return;

    const tempMax = weatherData.tempMax;
    const tempMin = weatherData.tempMin;
    const condition = weatherData.textDay;
    const humidity = weatherData.humidity;
    const precip = weatherData.precip;

    // Update weather text
    const weatherText = `
        <strong>🌤️ Weather:</strong>
        ${tempMin}-${tempMax}°C (${Math.round(tempMin*1.8+32)}-${Math.round(tempMax*1.8+32)}°F),
        ${condition.toLowerCase()}${precip > 0 ? `, ${precip}mm rain` : ''}.
        Humidity: ${humidity}%.
        <a href="https://www.qweather.com/en/weather30d/location-${weatherData.location}.html" target="_blank">30-day forecast →</a>
        <span class="update-time">Updated: ${new Date().toLocaleString()}</span>
    `;

    weatherBox.innerHTML = weatherText;
}

// Initialize weather updates for all days
async function initializeWeatherUpdates() {
    // Day 1-3: Chongqing (Oct 14-16)
    const day1 = document.querySelector('[data-day="1"]');
    if (day1) {
        const weather = await fetchQWeather(CITY_LOCATIONS.chongqing, '2025-10-14');
        updateWeatherDisplay(day1, weather);
    }

    // Day 4-5: Fenghuang (Oct 17-18)
    const day4 = document.querySelector('[data-day="4"]');
    if (day4) {
        const weather = await fetchQWeather(CITY_LOCATIONS.fenghuang, '2025-10-17');
        updateWeatherDisplay(day4, weather);
    }

    // Add more days as needed...
    // You can add all 23 days following this pattern
}

// Auto-run when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing QWeather API...');

    // Check if API key is set
    if (QWEATHER_CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
        console.warn('⚠️ QWeather API key not set! Please update QWEATHER_CONFIG.apiKey');
        return;
    }

    initializeWeatherUpdates();
});

// Export for manual updates
window.QWeatherAPI = {
    update: initializeWeatherUpdates,
    fetch: fetchQWeather
};
