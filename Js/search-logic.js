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

async function initSearch() {
    // 1. Get the "q" parameter from the URL (e.g., ?q=bee)
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    const header = document.getElementById('search-header');
    const displayArea = document.getElementById('results-display-area');

    if (!query) {
        displayArea.innerHTML = "<p>No search term entered.</p>";
        return;
    }

    header.innerText = `Search Results for: "${query}"`;
    let matches = [];

    // 2. Fetch and Scan (Your Scraping Method)
    for (const url of pages) {
        try {
            const response = await fetch(url);
            if (!response.ok) continue;
            
            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            
            // Search the body text
            const bodyText = doc.body.innerText.toLowerCase();
            if (bodyText.includes(query.toLowerCase())) {
                const title = doc.querySelector('title')?.innerText || url;
                // Get a small snippet of text to show in results (optional)
                const snippet = bodyText.substring(0, 150) + "..."; 
                matches.push({ url, title, snippet });
            }
        } catch (e) {
            console.error("Error fetching " + url);
        }
    }

    // 3. Output to the page
    renderResults(matches);
}

function renderResults(matches) {
    const displayArea = document.getElementById('results-display-area');
    displayArea.innerHTML = ""; // Clear "Searching..." message

    if (matches.length === 0) {
        displayArea.innerHTML = "<p>No matches found on any page.</p>";
        return;
    }

    matches.forEach(match => {
        const resultItem = document.createElement('div');
        resultItem.className = "result-item"; // Style this in your CSS
        resultItem.innerHTML = `
            <h3 style="margin-bottom: 5px;">
                <a href="${match.url}" style="color: #007bff; text-decoration: none;">${match.title}</a>
            </h3>
            <p style="font-size: 0.9em; color: #555;">${match.snippet}</p>
            <small style="color: green;">${window.location.origin}/${match.url}</small>
            <hr style="border: 0.5px solid #eee; margin: 20px 0;">
        `;
        displayArea.appendChild(resultItem);
    });
}

// Run the search when the page loads
window.onload = initSearch;