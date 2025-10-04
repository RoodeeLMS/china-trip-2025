// Dual Language System (Thai/English)
// Automatically switches all content with data-lang attributes

// Get current language from localStorage or default to English
let currentLang = localStorage.getItem('preferredLanguage') || 'en';

// Thai translations for common UI elements
const translations = {
    // Header
    'Daily Itinerary': 'กำหนดการรายวัน',
    'October 14 - November 5, 2025': '14 ตุลาคม - 5 พฤศจิกายน 2568',

    // Common words
    'Plan': 'แผนการ',
    'Focus': 'จุดเน้น',
    'Hotel': 'โรงแรม',
    'Weather': 'สภาพอากาศ',
    'Tip': 'เคล็ดลับ',
    'Drone Policy': 'นโยบายโดรน',
    'PRACTICAL INFO': 'ข้อมูลเชิงปฏิบัติ',
    'Bad Weather Alternatives': 'ทางเลือกสำหรับสภาพอากาศแย่',
    '24-Hour Forecast': 'พยากรณ์อากาศ 24 ชั่วโมง',
    'Updated': 'อัปเดต',
    '30-day forecast →': 'พยากรณ์ 30 วัน →',
    'Humidity': 'ความชื้น',

    // Days of week
    'Mon': 'จ.',
    'Tue': 'อ.',
    'Wed': 'พ.',
    'Thu': 'พฤ.',
    'Fri': 'ศ.',
    'Sat': 'ส.',
    'Sun': 'อา.',

    // Practical Info titles
    'Airport to Hotel': 'สนามบินถึงโรงแรม',
    'Hotel Address (Chinese)': 'ที่อยู่โรงแรม (ภาษาจีน)',
    'Dinner Recommendations': 'แนะนำร้านอาหารเย็น',
    'Estimated Costs': 'ค่าใช้จ่ายโดยประมาณ',
    'Transport': 'การเดินทาง',
    'Dinner': 'อาหารเย็น',
    'Tips/Misc': 'ทิปและอื่นๆ',
    'Daily Total': 'รวมต่อวัน',

    // Common phrases
    'Night': 'คืน',
    'of': 'จาก',
    'Arrival in': 'มาถึง',
    'Travel': 'เดินทาง',
    'Full Day': 'เต็มวัน',
    'Exploration': 'สำรวจ',
    'Day Trip': 'ทริปไปกลับ',
    'Transit': 'ผ่าน',
    'Departure': 'ออกเดินทาง',

    // Locations
    'Chongqing': 'ฉงชิ่ง',
    'Fenghuang': 'เฟิงหวง',
    'Zhangjiajie': 'จางเจียเจี้ย',
    'Chengdu': 'เฉิงตู',
    'Jiuzhaigou': 'จิ่วจ้ายโก๋ว',
    'Leshan': 'เล่อซาน',
    'Mount Emei': 'ภูเขาเอ๋อเหมย'
};

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
});

// Toggle language function
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'th' : 'en';
    localStorage.setItem('preferredLanguage', currentLang);
    setLanguage(currentLang);
}

// Set language and update all elements
function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    // Update body class for CSS targeting
    document.body.classList.remove('lang-en', 'lang-th');
    document.body.classList.add(`lang-${lang}`);

    // Update all elements with data-lang attributes
    const elements = document.querySelectorAll('[data-lang-en], [data-lang-th]');
    elements.forEach(el => {
        const text = el.getAttribute(`data-lang-${lang}`);
        if (text) {
            el.textContent = text;
        }
    });

    // Update header
    updateHeader(lang);

    // Update common text using translations
    updateCommonText(lang);

    // Update language toggle button visibility
    const langEnButtons = document.querySelectorAll('.lang-en');
    const langThButtons = document.querySelectorAll('.lang-th');

    if (lang === 'en') {
        langEnButtons.forEach(btn => btn.style.display = 'inline');
        langThButtons.forEach(btn => btn.style.display = 'none');
    } else {
        langEnButtons.forEach(btn => btn.style.display = 'none');
        langThButtons.forEach(btn => btn.style.display = 'inline');
    }
}

// Update header text
function updateHeader(lang) {
    const headerTitle = document.querySelector('header h1');
    const headerSubtitle = document.querySelector('header p');

    if (headerTitle && lang === 'th') {
        headerTitle.innerHTML = '🇨🇳 ทริปจีน 2025';
    } else if (headerTitle) {
        headerTitle.innerHTML = '🇨🇳 China Trip 2025';
    }

    if (headerSubtitle && lang === 'th') {
        headerSubtitle.textContent = 'กำหนดการรายวัน | 14 ตุลาคม - 5 พฤศจิกายน 2568';
    } else if (headerSubtitle) {
        headerSubtitle.textContent = 'Daily Itinerary | October 14 - November 5, 2025';
    }
}

// Update common text elements
function updateCommonText(lang) {
    if (lang === 'en') return; // Skip if English (default)

    // Update all text that matches translation keys
    document.querySelectorAll('strong, .info-title, .practical-header strong, .hourly-header strong').forEach(el => {
        const text = el.textContent.trim();
        // Remove emoji and translate
        const textWithoutEmoji = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();

        if (translations[textWithoutEmoji]) {
            const emoji = text.match(/[\u{1F300}-\u{1F9FF}]/gu)?.[0] || '';
            el.textContent = emoji ? `${emoji} ${translations[textWithoutEmoji]}` : translations[textWithoutEmoji];
        }
    });
}

// Export functions for global use
window.toggleLanguage = toggleLanguage;
window.setLanguage = setLanguage;
