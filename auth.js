// Password protection for China Trip itinerary
(function() {
    'use strict';

    // Obfuscated password check using multiple layers
    const _0x4a2b = ['aXRpbmVyYXJ5X2F1dGg=', 'aW5kZXguaHRtbA==', 'UGxlYXNlIGVudGVyIHRoZSBwYXNzd29yZCB0byB2aWV3IHRoaXMgcGFnZTo=',
                    'SW5jb3JyZWN0IHBhc3N3b3JkLiBBY2Nlc3MgZGVuaWVkLg=='];
    const _0x5e3c = (s) => atob(s);
    const _0x7f4d = [53, 57, 53, 55, 52, 57, 50, 49];
    const _0x9e2a = () => _0x7f4d.map(c => String.fromCharCode(c)).join('');

    function _0x3d1f(input) {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    const _0x8b5c = _0x3d1f(_0x9e2a());

    function checkPassword() {
        const stored = sessionStorage.getItem(_0x5e3c(_0x4a2b[0]));

        if (stored && _0x3d1f(stored) === _0x8b5c) {
            return true;
        }

        const entered = prompt(_0x5e3c(_0x4a2b[2]));

        if (entered && _0x3d1f(entered) === _0x8b5c) {
            sessionStorage.setItem(_0x5e3c(_0x4a2b[0]), entered);
            return true;
        } else if (entered !== null) {
            alert(_0x5e3c(_0x4a2b[3]));
        }

        window.location.href = _0x5e3c(_0x4a2b[1]);
        return false;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkPassword);
    } else {
        checkPassword();
    }
})();
