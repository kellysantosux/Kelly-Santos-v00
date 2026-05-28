const pages = [
    'index.html',
    'portfolio.html',
    'aboutme.html',
    'contact.html',
    'resume.html',
    'boxhillartschoolapp.html',
    'beeprotectorswebsite.html',
    'cafeteriaapp.html'
];

// search.js - Linked in the header/nav of all pages
const searchInputHeader = document.getElementById('search-input');
const recentSearchesDropdown = document.getElementById('recent-searches');

// Show/Hide recent searches when typing
if (searchInputHeader) {
    searchInputHeader.addEventListener('input', function() {
        if (this.value.trim().length > 0) {
            recentSearchesDropdown.style.display = 'block';
        } else {
            recentSearchesDropdown.style.display = 'none';
        }
    });

    // Close dropdown if user clicks outside
    document.addEventListener('click', function(event) {
        if (!searchInputHeader.contains(event.target)) {
            recentSearchesDropdown.style.display = 'none';
        }
    });
}

// Function to prevent submission if empty
function validateSearch() {
    const query = searchInputHeader.value.trim();
    if (query.length === 0) {
        return false; // Don't submit
    }
    // Optional: Save query to localStorage for "recent searches" here
    return true; // Allow submit/redirect to searchresults.html
}