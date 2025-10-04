# QWeather API - Fix Instructions

## Problem
Both daily and hourly forecasts are getting **403 "Invalid Host"** errors because QWeather requires a personalized API host instead of the shared domains.

## Solution - Get Your Personalized API Host

### Step 1: Login to QWeather Console
1. Go to: https://console.qweather.com
2. Login with your QWeather account

### Step 2: Find Your API Host
1. Click on **"Settings"** or **"API Management"**
2. Look for **"API Host"** or **"Personalized Domain"**
3. It will look like: `abc1234xyz.def.qweatherapi.com`

### Step 3: Update the Code
Open `qweather-api.js` and update line 23 and 47-48:

**Current (NOT WORKING):**
```javascript
const baseUrl = 'https://devapi.qweather.com/v7/weather/30d';
```

**Replace with YOUR personalized host:**
```javascript
const baseUrl = 'https://YOUR-HOST-HERE.qweatherapi.com/v7/weather/30d';
```

**Example:**
```javascript
const baseUrl = 'https://abc1234xyz.def.qweatherapi.com/v7/weather/30d';
```

Do the same for line 47-48 (hourly endpoints):
```javascript
const endpoints = [
    'https://YOUR-HOST-HERE.qweatherapi.com/v7/weather/24h',
    'https://YOUR-HOST-HERE.qweatherapi.com/v7/weather/24h'
];
```

### Step 4: Test
1. Save the file
2. Refresh your browser (Ctrl+F5)
3. Check browser console (F12) - should see "✅ Hourly forecast fetched successfully!"
4. Click on Day 1 to expand
5. You should see the "📊 24-Hour Forecast" section appear

## Alternative: Use 7-Day Forecast (Free Tier Always Works)

If you can't find the personalized API host, we can switch to 7-day forecasts which work on the free tier:

Change line 23 to:
```javascript
const baseUrl = 'https://devapi.qweather.com/v7/weather/7d';
```

This will give you 7 days of accurate forecasts instead of 30 days.

## Need Help?
- QWeather Docs: https://dev.qweather.com/en/docs/configuration/api-host/
- Error Codes: https://dev.qweather.com/docs/resource/error-code/#invalid-host
