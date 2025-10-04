// Password protection for China Trip itinerary
const CORRECT_PASSWORD = "59574921";

function checkPassword() {
    const password = sessionStorage.getItem('itinerary_auth');

    if (password === CORRECT_PASSWORD) {
        return true;
    }

    // Show password prompt
    const enteredPassword = prompt("Please enter the password to view this page:");

    if (enteredPassword === CORRECT_PASSWORD) {
        sessionStorage.setItem('itinerary_auth', enteredPassword);
        return true;
    } else if (enteredPassword !== null) {
        alert("Incorrect password. Access denied.");
    }

    // Redirect to home page if password is wrong or cancelled
    window.location.href = 'index.html';
    return false;
}

// Run password check when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkPassword);
} else {
    checkPassword();
}
