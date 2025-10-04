# 🌤️ QWeather API Setup Guide

## Overview
This guide will help you integrate QWeather API for auto-updating weather forecasts on your China Trip 2025 itinerary website.

---

## 📊 Free Tier Benefits
- ✅ **50,000 requests/month FREE**
- ✅ ~1,666 requests/day
- ✅ After free tier: Only ¥0.0007 (~$0.0001) per request
- ✅ Perfect for your 23-day itinerary

---

## Step 1: Register & Get API Key

### 1.1 Register Account
1. Go to: **https://dev.qweather.com**
2. Click **"免费注册"** (Free Registration)
3. Complete registration at: **https://id.qweather.com/#/register**
4. Verify your email

### 1.2 Get API Key
1. Login to console: **https://console.qweather.com**
2. Click **"Create Project"** or **"创建项目"**
3. Choose **"Web API"** as platform
4. Give it a name (e.g., "China Trip Weather")
5. Copy your **API Key** (looks like: `abc123def456ghi789...`)

---

## Step 2: Configure API Key

### 2.1 Open the JavaScript File
1. Open file: **`qweather-api.js`** in your project
2. Find line 5:
   ```javascript
   apiKey: 'YOUR_API_KEY_HERE', // ⚠️ REPLACE THIS!
   ```

### 2.2 Replace with Your API Key
```javascript
const QWEATHER_CONFIG = {
    apiKey: 'abc123def456ghi789', // ✅ YOUR ACTUAL KEY HERE!
    lang: 'en', // or 'zh' for Chinese
    unit: 'm'   // 'm' = Celsius, 'i' = Fahrenheit
};
```

---

## Step 3: Add Script to HTML

### 3.1 Add Before </body> Tag
Open **`itinerary.html`** and add this line before `</body>`:

```html
    <script src="qweather-api.js"></script>
</body>
```

### 3.2 Add Data Attributes to Days
Already done in Day 1! Each day needs these attributes:

```html
<div class="day" data-day="1" data-city="chongqing" data-date="2025-10-14">
```

---

## Step 4: Test It!

### 4.1 Open Browser Console
1. Open **itinerary.html** in browser
2. Press **F12** to open Developer Tools
3. Check **Console** tab

### 4.2 What You Should See
✅ **Success:**
```
Initializing QWeather API...
Weather data loaded for Day 1
Weather data loaded for Day 2
...
```

❌ **API Key Not Set:**
```
⚠️ QWeather API key not set! Please update QWEATHER_CONFIG.apiKey
```

❌ **API Error:**
```
QWeather API Error: 401 (Invalid key)
```

---

## Step 5: Customize (Optional)

### 5.1 Change Language to Chinese
```javascript
lang: 'zh', // Chinese weather descriptions
```

### 5.2 Use Fahrenheit
```javascript
unit: 'i', // Imperial (Fahrenheit)
```

### 5.3 Add Update Time Display
The current code shows "Updated: [timestamp]" automatically!

---

## 🚨 Troubleshooting

### Problem: "Invalid API Key" Error
**Solution:**
- Check if key is correct (no spaces, complete)
- Make sure you created a **Web API** project (not mobile)
- Check if key is active in console.qweather.com

### Problem: CORS Error
**Solution:**
- QWeather supports CORS for web browsers ✅
- Make sure you're using `https://devapi.qweather.com` (dev API)
- For production, use `https://api.qweather.com` (paid)

### Problem: No Weather Updates
**Solution:**
1. Check browser console for errors
2. Verify data attributes are set: `data-city`, `data-date`
3. Make sure dates are in format: `YYYY-MM-DD`
4. Check if API key has credits remaining

### Problem: Request Limit Reached
**Solution:**
- Free tier: 50,000/month
- Check usage: https://console.qweather.com/usage
- Consider caching weather data (update once per day)

---

## 📈 API Usage Tips

### Optimize API Calls
**Current Setup:** Updates on every page load
- 23 days × 1 request = 23 requests per visitor
- 100 visitors/day = 2,300 requests/day
- Still well under 50,000/month! ✅

### Cache Weather Data (Advanced)
To reduce API calls, add localStorage caching:

```javascript
// Cache weather for 6 hours
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

async function fetchQWeatherCached(locationId, date) {
    const cacheKey = `weather_${locationId}_${date}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < CACHE_DURATION) {
            return data.weather;
        }
    }

    const weather = await fetchQWeather(locationId, date);
    localStorage.setItem(cacheKey, JSON.stringify({
        weather,
        timestamp: Date.now()
    }));

    return weather;
}
```

---

## 🔐 Security Notes

### ⚠️ API Key Visible in Browser
**Current setup:** API key is in JavaScript (visible to users)
- ✅ OK for free tier with low limits
- ✅ QWeather allows this for client-side apps
- ❌ NOT recommended for paid tier

### 🔒 For Production (Paid Tier)
Use server-side proxy:
1. Create backend API endpoint
2. Store API key on server (hidden)
3. Frontend calls YOUR server
4. YOUR server calls QWeather

---

## 📝 City Location IDs Reference

| City | Location ID |
|------|------------|
| Chongqing | 101040100 |
| Fenghuang | 101251505 |
| Zhangjiajie | 101251101 |
| Chengdu | 101270101 |
| Jiuzhaigou | 101271906 |
| Leshan | 101271401 |
| Emeishan | 101271414 |

Find more: https://github.com/qwd/LocationList

---

## 🎯 Next Steps

1. ✅ Get API key from console.qweather.com
2. ✅ Update `qweather-api.js` with your key
3. ✅ Add `<script src="qweather-api.js"></script>` to itinerary.html
4. ✅ Test in browser (F12 console)
5. ✅ Deploy to GitHub Pages

---

## 📚 Resources

- **QWeather Docs:** https://dev.qweather.com/en/docs/
- **API Reference:** https://dev.qweather.com/en/docs/api/
- **Console:** https://console.qweather.com
- **Pricing:** https://dev.qweather.com/en/price/

---

## ✅ Success Checklist

- [ ] Registered QWeather account
- [ ] Created Web API project
- [ ] Got API key
- [ ] Updated `qweather-api.js` with key
- [ ] Added script tag to HTML
- [ ] Tested in browser (F12 console shows success)
- [ ] Weather auto-updates on page load! 🎉

---

**Need Help?**
- Check browser console (F12) for errors
- Review QWeather docs: https://dev.qweather.com/en/help/
- Email QWeather support: support@qweather.com
