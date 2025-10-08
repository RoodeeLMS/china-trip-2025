// QWeather API Integration - Daily + Hourly Forecasts
// API Documentation: https://dev.qweather.com/en/docs/api/

const QWEATHER_CONFIG = {
    apiKey: 'e575336e2b114523acfd1f3c8c2f362a', // ✅ Your QWeather API Key
    lang: 'en', // or 'zh' for Chinese
    unit: 'm' // metric (Celsius), use 'i' for imperial (Fahrenheit)
};

// GeoAPI host for city lookup (official, does not require personalized subdomain)
const QWEATHER_GEO_HOST = 'https://geoapi.qweather.com';

// City location IDs (from QWeather)
const CITY_LOCATIONS = {
    'chongqing': '101040100',
    // Prefer dynamic lookup for 'wulong' (district) — fallback to central Chongqing ID
    'wulong': '101040100',
    'fenghuang': '101251505',
    // Prefer dynamic lookup for 'furongzhen' (Yongshun) — fallback to Zhangjiajie
    'furongzhen': '101251101',
    'zhangjiajie': '101251101',
    'wulingyuan': '101251101', // Part of Zhangjiajie
    'chengdu': '101270101',
    'jiuzhaigou': '101271906',
    // Prefer dynamic lookup for 'huanglong' (Songpan) — fallback to Jiuzhaigou
    'huanglong': '101271906',
    // Prefer dynamic lookup within Aba Prefecture
    'shuangqiaogou': '101270201', // fallback: Aba Prefecture
    'bipenggou': '101270201',    // fallback: Aba Prefecture
    'dagu': '101270201',         // fallback: Aba Prefecture (Heishui)
    'leshan': '101271401',
    'emeishan': '101271414'
};

// Preferred precise queries for dynamic location resolution via QWeather GeoAPI
// Note: These are more granular than generic city IDs and improve microclimate accuracy
const CITY_LOOKUP_QUERIES = {
    // Municipality → District
    'wulong': { location: 'Wulong', adm: 'Chongqing' },
    // Hunan → Xiangxi (Yongshun) → Furong Zhen (芙蓉镇)
    'furongzhen': { location: 'Furongzhen', adm: 'Yongshun' },
    // Sichuan → Aba → Songpan → Huanglong Scenic Area vicinity
    'huanglong': { location: 'Songpan', adm: 'Aba' },
    // Western Sichuan detailed sites
    'shuangqiaogou': { location: 'Rilong', adm: 'Xiaojin' },
    'bipenggou': { location: 'Li County', adm: 'Aba' },
    'dagu': { location: 'Heishui', adm: 'Aba' }
};

// Cache resolved location IDs to avoid repeated GeoAPI calls per page load
const RESOLVED_LOCATION_CACHE = {};

// Coordinate overrides for microclimate-sensitive sites (lon,lat as string)
// These are sent directly to the Weather API for more precise forecasts
const CITY_COORDS_OVERRIDE = {
    // Mountain/scenic summits or gates
    'zhangjiajie': '110.489,29.057',      // Tianmen Mountain summit vicinity
    'emeishan': '103.332,29.524',         // Emei Golden Summit (Jinding)
    'huanglong': '103.832,32.737',        // Huanglong scenic area (Songpan)
    'jiuzhaigou': '103.918,33.260',       // Zhangzha gate area (valley entrance)
    'shuangqiaogou': '102.897,30.997',    // Rilong / Shuangqiao Valley gate vicinity
    'bipenggou': '102.816,31.208',        // Bipenggou entrance area
    'dagu': '102.851,32.263',             // Dagu Glacier scenic area (base)
    'wulong': '107.756,29.325',           // Three Natural Bridges area
    'furongzhen': '109.649,28.229',       // Furong Town waterfall area
    'leshan': '103.772,29.552'            // Leshan Giant Buddha riverside
};

async function fetchLocationIdByQuery(query) {
    const params = new URLSearchParams({
        location: query.location,
        key: QWEATHER_CONFIG.apiKey,
        lang: QWEATHER_CONFIG.lang
    });
    if (query.adm) params.set('adm', query.adm);

    const url = `${QWEATHER_GEO_HOST}/v2/city/lookup?${params.toString()}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.code === '200' && Array.isArray(data.location) && data.location.length > 0) {
            // Prefer the first match; could refine by country/latlon if needed
            return data.location[0].id;
        }
        console.warn('QWeather GeoAPI lookup returned no results:', data);
        return null;
    } catch (err) {
        console.error('GeoAPI lookup error:', err);
        return null;
    }
}

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

    // Extract all weather data
    const tempMax = weatherData.tempMax;
    const tempMin = weatherData.tempMin;
    const conditionDay = weatherData.textDay;
    const conditionNight = weatherData.textNight;
    const humidity = weatherData.humidity;
    const precip = weatherData.precip;
    const uvIndex = weatherData.uvIndex;
    const sunrise = weatherData.sunrise;
    const sunset = weatherData.sunset;
    const moonrise = weatherData.moonrise;
    const moonset = weatherData.moonset;
    const moonPhase = weatherData.moonPhase;
    const windDirDay = weatherData.windDirDay;
    const windSpeedDay = weatherData.windSpeedDay;
    const windDirNight = weatherData.windDirNight;
    const windSpeedNight = weatherData.windSpeedNight;
    const visibility = weatherData.vis;
    const pressure = weatherData.pressure;
    const cloudCover = weatherData.cloud;

    // Get UV level description
    const getUVLevel = (index) => {
        if (index <= 2) return 'Low';
        if (index <= 5) return 'Moderate';
        if (index <= 7) return 'High';
        if (index <= 10) return 'Very High';
        return 'Extreme';
    };

    const weatherText = `
        <div class="weather-summary">
            <strong>🌤️ Weather Overview:</strong>
            <div class="temp-range">${tempMin}-${tempMax}°C</div>
            <div class="conditions">
                <span>☀️ Day: ${conditionDay}</span> |
                <span>🌙 Night: ${conditionNight}</span>
            </div>
            <div class="weather-quick-info">
                <span>💧 ${precip}mm ${precip > 0 ? '🌧️' : ''}</span>
                <span>☁️ ${cloudCover}% cloud</span>
                <span>☀️ UV ${uvIndex} (${getUVLevel(uvIndex)})</span>
            </div>
        </div>

        <div class="weather-details-collapsible">
            <div class="weather-details-header" onclick="this.parentElement.classList.toggle('expanded')">
                <strong>📊 Detailed Info</strong>
                <span class="toggle-arrow">▼</span>
            </div>
            <div class="weather-details-content">
                <div class="weather-details-grid">
                    <div class="weather-detail-item">
                        <div class="detail-icon">💨</div>
                        <div class="detail-content">
                            <div class="detail-label">Wind</div>
                            <div class="detail-value">☀️ ${windDirDay} ${windSpeedDay}km/h<br>🌙 ${windDirNight} ${windSpeedNight}km/h</div>
                        </div>
                    </div>

                    <div class="weather-detail-item">
                        <div class="detail-icon">👁️</div>
                        <div class="detail-content">
                            <div class="detail-label">Visibility</div>
                            <div class="detail-value">${visibility}km</div>
                        </div>
                    </div>

                    <div class="weather-detail-item">
                        <div class="detail-icon">🌙</div>
                        <div class="detail-content">
                            <div class="detail-label">Moon Phase</div>
                            <div class="detail-value">${moonPhase}</div>
                        </div>
                    </div>
                </div>

                <div class="sun-moon-times">
                    <div class="time-group">
                        <strong>🌅 Sun:</strong> ↑ ${sunrise} / ↓ ${sunset}
                    </div>
                    <div class="time-group">
                        <strong>🌙 Moon:</strong> ↑ ${moonrise} / ↓ ${moonset}
                    </div>
                </div>
            </div>
        </div>

        <div class="weather-footer">
            <a href="https://www.qweather.com/en/weather30d/${dayElement.dataset.city}-${locationId}.html" target="_blank">30-day forecast →</a>
            <span class="update-time">Updated: ${new Date().toLocaleString()}</span>
        </div>
    `;

    weatherBox.innerHTML = weatherText;
}

// Create hourly forecast timeline
function createHourlyTimeline(hourlyData, dayDate) {
    if (!hourlyData || hourlyData.length === 0) return '';

    // Show all 24 hours
    const displayHours = hourlyData.slice(0, 24);

    // Check if this is current conditions (today) or future date
    const today = new Date().toISOString().split('T')[0];
    const isCurrentConditions = dayDate !== today;

    let timelineHTML = `
        <div class="hourly-forecast">
            <div class="hourly-header" onclick="this.parentElement.classList.toggle('expanded')">
                <strong>📊 24-Hour Forecast${isCurrentConditions ? ' (Current Conditions)' : ''}</strong>
                <span class="hourly-toggle">▼</span>
            </div>
            <div class="hourly-content">
                ${isCurrentConditions ? '<div class="hourly-warning" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 0.75rem; margin-bottom: 1rem; color: #856404;"><strong>⚠️ Note:</strong> Hourly data shows current weather conditions (next 24 hours from now), not the forecast for this specific date. Daily forecast above is accurate for this date.</div>' : ''}
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
                    <em>Showing hourly forecast. Precipitation probability and wind speed included.</em>
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
    let locationId = CITY_LOCATIONS[city];

    if (!date) {
        console.warn('Missing city or date data for day:', dayElement.dataset.day);
        return;
    }

    // Attempt dynamic lookup for more precise microclimate IDs if configured
    if (CITY_LOOKUP_QUERIES[city]) {
        const cacheKey = `${city}`;
        if (RESOLVED_LOCATION_CACHE[cacheKey]) {
            locationId = RESOLVED_LOCATION_CACHE[cacheKey];
        } else {
            const resolved = await fetchLocationIdByQuery(CITY_LOOKUP_QUERIES[city]);
            if (resolved) {
                locationId = resolved;
                RESOLVED_LOCATION_CACHE[cacheKey] = resolved;
            }
        }
    }

    if (!locationId) {
        console.warn('No locationId resolved for city:', city, '— skipping weather update.');
        return;
    }

    // Determine API request location (ID or precise coordinates)
    const requestLocation = CITY_COORDS_OVERRIDE[city] || locationId;

    // Fetch daily weather
    const dailyWeather = await fetchDailyWeather(requestLocation, date);
    updateDailyWeather(dayElement, dailyWeather, locationId);

    // Fetch hourly weather
    const hourlyWeather = await fetchHourlyWeather(requestLocation);

    // Insert hourly timeline after weather-box
    const weatherBox = dayElement.querySelector('.weather-box');
    if (weatherBox) {
        // Remove existing hourly forecast if present
        const existing = dayElement.querySelector('.hourly-forecast');
        if (existing) existing.remove();

        if (hourlyWeather) {
            const hourlyHTML = createHourlyTimeline(hourlyWeather, date);
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

// Export for manual updates and external use
window.QWeatherAPI = {
    updateAll: initializeWeatherUpdates,
    updateDay: updateDayWeather,
    fetchDaily: fetchDailyWeather,
    fetchHourly: fetchHourlyWeather
};

// Export helper functions and config for external use
window.fetchDailyWeather = fetchDailyWeather;
window.getWeatherIcon = getWeatherIcon;
window.CITY_LOCATIONS = CITY_LOCATIONS;
window.CITY_COORDS_OVERRIDE = CITY_COORDS_OVERRIDE;
