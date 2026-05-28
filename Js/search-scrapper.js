const pages = [
    { url: 'index.html', name: 'Home' },
    { url: 'portfolio.html', name: 'Portfolio' },
    { url: 'aboutme.html', name: 'About me' },
    { url: 'contact.html', name: 'Contact' },
    { url: 'resume.html', name: 'Resume' },
    { url: 'boxhillartschoolapp.html', name: 'Box Hill Art School' },
    { url: 'beeprotectorswebsite.html', name: 'Bee Protectors' },
    { url: 'cafeteriaapp.html', name: 'Cafeteria App' }
];

// 1. AUTO-RUN ON LOAD: Check URL for ?q=word
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
        document.getElementById('search-input').value = query;
        performSearch(query);
    }
});

async function performSearch(passedQuery) {
    const input = document.getElementById('search-input');
    const searchTerm = (passedQuery || input.value).trim().toLowerCase();
    const resultsContainer = document.getElementById('search-results');
    const searchHeader = document.getElementById('search-term-header');

    if (searchHeader) searchHeader.innerText = searchTerm;

    if (searchTerm.length < 3) {
        resultsContainer.innerHTML = '<li class="search-results-characters"> <p>Please enter more than 3 characters.</p></li>';
        return;
    }

    resultsContainer.innerHTML = '<li> <p>Searching all pages...</p></li>';
    
    let matches = [];

    for (const page of pages) {
        try {
            const response = await fetch(page.url);
            const htmlText = await response.text();
            const doc = new DOMParser().parseFromString(htmlText, 'text/html');
            
            // Remove navigation/footer to avoid "false" results
            const cleanDoc = doc.body;
            const extras = cleanDoc.querySelectorAll('nav, footer, script, style');
            extras.forEach(el => el.remove());

            const plainText = cleanDoc.innerText;
            const words = plainText.split(/\s+/);
            
            // 2. MULTIPLE MATCHES: Find every instance of the word
            words.forEach((word, index) => {
                if (word.toLowerCase().includes(searchTerm)) {
                    const snippet = getSnippetFromArray(words, index, searchTerm);
                    matches.push({ 
                        url: page.url, 
                        name: page.name, 
                        snippet: snippet 
                    });
                }
            });
        } catch (error) {
            console.error(`Error fetching ${page.url}:`, error);
        }
    }
    displayResults(matches, searchTerm);
}

function getSnippetFromArray(words, index, term) {
    const start = Math.max(0, index - 2);
    const end = Math.min(words.length, index + 3);
    let snippet = words.slice(start, end).join(" ");
    const regex = new RegExp(`(${term})`, 'gi');
    return snippet.replace(regex, '<em>$1</em>');
}

function displayResults(matches, searchTerm) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    if (matches.length === 0) {
        resultsContainer.innerHTML = `<li class="search-results-no-results"><p>No results found for <em>${searchTerm}</em></p></li>`;
        return;
    }

    matches.forEach(match => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a class="search-results-card" href="${match.url}">
                <p class="--sm" id="extract-text">...${match.snippet}...</p>
                <div class="location">
                    <p class="--xs" id="page-location">${match.name}</p>
                    <div class="leading_arrow"><i class="material-icons">arrow_forward</i></div>
                </div>
            </a>`;
        resultsContainer.appendChild(li);
    });
}