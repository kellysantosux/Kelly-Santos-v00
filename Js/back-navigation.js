/**
 * back-navigation.js
 * Returns to the previous page or falls back to Portfolio.html
 */

document.addEventListener('DOMContentLoaded', () => {
    // Define the fallback URL 
    const FALLBACK_URL = '/portfolio.html';

    // Select the back button element by its class 
    const backButton = document.querySelector('.backButton');

    // Only proceed if the element exists on the current page 
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            // Prevent default link behavior 
            e.preventDefault(); 
            
            // Check if there is a previous page in the session history [cite: 3, 6]
            if (document.referrer.length > 0) {
                // History exists; go back to the previous page [cite: 4, 6]
                window.history.back();
            } else {
                // No history; redirect to the fallback URL [cite: 4, 7]
                window.location.href = FALLBACK_URL;
            }
        });
    }
});