// Daily Overview Generator for Index Page
// Fetches weather data and generates daily overview cards

const DAILY_ITINERARY = [
    { day: 1, date: '2025-10-14', city: 'chongqing', location: 'Chongqing', summary: 'Arrival in Chongqing, settle in' },
    { day: 2, date: '2025-10-15', city: 'wulong', location: 'Wulong', summary: 'Day trip to Wulong Karst' },
    { day: 3, date: '2025-10-16', city: 'chongqing', location: 'Chongqing', summary: 'Explore Chongqing city' },
    { day: 4, date: '2025-10-17', city: 'fenghuang', location: 'Fenghuang', summary: 'Travel to Fenghuang Ancient Town' },
    { day: 5, date: '2025-10-18', city: 'fenghuang', location: 'Fenghuang', summary: 'Full day in Fenghuang' },
    { day: 6, date: '2025-10-19', city: 'furongzhen', location: 'Furong Town', summary: 'Furong Town & overnight' },
    { day: 7, date: '2025-10-20', city: 'wulingyuan', location: 'Zhangjiajie', summary: 'Travel to Zhangjiajie' },
    { day: 8, date: '2025-10-21', city: 'wulingyuan', location: 'Wulingyuan', summary: 'Wulingyuan Park (Upper)' },
    { day: 9, date: '2025-10-22', city: 'zhangjiajie', location: 'Tianmen', summary: 'Tianmen Mountain' },
    { day: 10, date: '2025-10-23', city: 'wulingyuan', location: 'Wulingyuan', summary: 'Wulingyuan Park (Lower)' },
    { day: 11, date: '2025-10-24', city: 'chengdu', location: 'Chengdu', summary: 'High-speed train to Chengdu' },
    { day: 12, date: '2025-10-25', city: 'chengdu', location: 'Chengdu', summary: 'Rest day in Chengdu' },
    { day: 13, date: '2025-10-26', city: 'jiuzhaigou', location: 'Jiuzhaigou', summary: 'Chengdu to Jiuzhaigou' },
    { day: 14, date: '2025-10-27', city: 'jiuzhaigou', location: 'Jiuzhaigou', summary: 'Full day in Jiuzhaigou' },
    { day: 15, date: '2025-10-28', city: 'chengdu', location: 'Huanglong', summary: 'Huanglong to Chengdu' },
    { day: 16, date: '2025-10-29', city: 'shuangqiaogou', location: 'Shuangqiao Valley', summary: 'Shuangqiao Valley exploration' },
    { day: 17, date: '2025-10-30', city: 'bipenggou', location: 'Bipenggou', summary: 'Bipenggou Valley' },
    { day: 18, date: '2025-10-31', city: 'dagu', location: 'Dagu Glacier', summary: 'Dagu Glacier (4860m)' },
    { day: 19, date: '2025-11-01', city: 'chengdu', location: 'Dujiangyan', summary: 'Dagu Glacier & Dujiangyan night lights' },
    { day: 20, date: '2025-11-02', city: 'emeishan', location: 'Mount Emei', summary: 'Leshan Buddha & Emei Summit' },
    { day: 21, date: '2025-11-03', city: 'chengdu', location: 'Chengdu', summary: 'Emei sunrise & return' },
    { day: 22, date: '2025-11-04', city: 'chengdu', location: 'Chengdu', summary: 'Panda Base & spare day' },
    { day: 23, date: '2025-11-05', city: 'chengdu', location: 'Departure', summary: 'Departure from Chengdu' }
];

async function generateDailyOverview() {
    const container = document.getElementById('dailyOverviewGrid');
    if (!container) return;

    // Show loading state
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #666;">Loading weather data...</div>';

    const cards = [];

    for (const dayInfo of DAILY_ITINERARY) {
        try {
            // Get location ID
            let locationId = window.CITY_LOCATIONS ? window.CITY_LOCATIONS[dayInfo.city] : null;

            // Determine API request location (ID or precise coordinates)
            const requestLocation = (window.CITY_COORDS_OVERRIDE && window.CITY_COORDS_OVERRIDE[dayInfo.city])
                ? window.CITY_COORDS_OVERRIDE[dayInfo.city]
                : locationId;

            if (!requestLocation) {
                cards.push(createDayCard(dayInfo, null));
                continue;
            }

            // Fetch weather data
            const weatherData = await fetchDailyWeather(requestLocation, dayInfo.date);
            cards.push(createDayCard(dayInfo, weatherData));

        } catch (error) {
            console.error(`Error fetching weather for Day ${dayInfo.day}:`, error);
            cards.push(createDayCard(dayInfo, null));
        }
    }

    // Render all cards
    container.innerHTML = cards.join('');

    // Add click handlers
    document.querySelectorAll('.day-overview-card').forEach(card => {
        card.addEventListener('click', () => {
            const day = card.dataset.day;
            window.location.href = `itinerary.html#day-${day}`;
        });
    });
}

function createDayCard(dayInfo, weatherData) {
    const temp = weatherData
        ? `${weatherData.tempMin}-${weatherData.tempMax}°C`
        : 'Loading...';

    const weatherIcon = weatherData && weatherData.textDay
        ? getWeatherIcon(weatherData.textDay)
        : '🌤️';

    const precip = weatherData ? `${weatherData.precip}mm` : '--';
    const cloudCover = weatherData ? `${weatherData.cloud}%` : '--';

    const dateObj = new Date(dayInfo.date);
    const dateStr = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });

    return `
        <div class="day-overview-card" data-day="${dayInfo.day}">
            <div class="day-overview-header">
                <div>
                    <div class="day-number">Day ${dayInfo.day}</div>
                    <div class="day-location">${dayInfo.location}</div>
                </div>
                <div style="text-align: right;">
                    <div class="day-weather-icon">${weatherIcon}</div>
                    <div class="day-temp">${temp}</div>
                </div>
            </div>
            <div class="day-date">${dateStr}</div>
            <div class="day-summary">${dayInfo.summary}</div>
            <div class="day-weather-extra">
                <span title="Precipitation">💧 ${precip}</span>
                <span title="Cloud Cover">☁️ ${cloudCover}</span>
            </div>
        </div>
    `;
}

// Wait for QWeather API to be loaded
document.addEventListener('DOMContentLoaded', () => {
    // Give some time for qweather-api.js to load
    setTimeout(() => {
        if (window.fetchDailyWeather && window.getWeatherIcon) {
            generateDailyOverview();
        } else {
            console.error('QWeather API functions not available');
            const container = document.getElementById('dailyOverviewGrid');
            if (container) {
                container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #999;">Weather data unavailable</div>';
            }
        }
    }, 500);
});
