/**
 * back-navigation.js
 * Handles the "Back" link within the .backButton container.
 */

document.addEventListener('DOMContentLoaded', () => {
    // URL to go to if the user has no browsing history (e.g., opened in a new tab)
    const FALLBACK_URL = '/Index.html';

    // Target the link inside the backButton container
    const backBtn = document.querySelector('.backButton a');

    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            // Prevent default anchor behavior
            e.preventDefault(); 
            
            // Check if there's a referrer (the page the user came from)
            if (document.referrer && document.referrer !== "") {
                window.history.back();
            } else {
                // Fallback if history is unavailable
                window.location.href = FALLBACK_URL;
            }
        });
    }
});