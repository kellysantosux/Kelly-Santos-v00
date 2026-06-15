const pages = [
    { url: 'index.html', name: 'Page: Home' },
    { url: 'portfolio.html', name: 'Page: Portfolio' },
    { url: 'about.html', name: 'Page: About' },
    { url: 'contact.html', name: 'Page: Contact' },
    { url: 'resume.html', name: 'Page: Resume' },
    { url: 'box-hill-art-school-app.html', name: 'Page: Box Hill Art School' },
    { url: 'bee-protectors-website.html', name: 'Page: Bee Protectors Website' },
    { url: 'cafeteria-app.html', name: 'Page: Cafeteria App' }
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

            // Remove navigation/footer/scripts/styles to avoid false positive matches
            const cleanDoc = doc.body;
            const extras = cleanDoc.querySelectorAll('nav, footer, script, style');
            extras.forEach(el => el.remove());

            // Use a TreeWalker to find text elements containing the term
            const walker = doc.createTreeWalker(cleanDoc, NodeFilter.SHOW_TEXT, null, false);
            let textNode;

            while (textNode = walker.nextNode()) {
                const textContent = textNode.nodeValue;
                if (textContent.toLowerCase().includes(searchTerm)) {
                    
                    const parentElement = textNode.parentElement;
                    
                    // Locate the closest preceding heading (h1-h6) relative to this element
                    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
                    const precedentHeading = headings
                        .filter(heading => heading.compareDocumentPosition(parentElement) & Node.DOCUMENT_POSITION_FOLLOWING)
                        .pop();

                    // --- STRIP CLASSES AND ATTRIBUTES HERE ---
                    let headingHTML = '';
                    if (precedentHeading) {
                        const tagName = precedentHeading.tagName.toLowerCase(); // Gets 'h1', 'h2', 'h3', etc.
                        const text = precedentHeading.textContent.trim();       // Extract clean text only
                        headingHTML = `<${tagName}>${text}</${tagName}>`;       // Rebuild without classes/IDs
                    }

                    // Generate your snippet using the text structure
                    const words = textContent.trim().split(/\s+/);
                    words.forEach((word, index) => {
                        if (word.toLowerCase().includes(searchTerm)) {
                            const snippet = getSnippetFromArray(words, index, searchTerm);
                            
                            matches.push({ 
                                url: page.url, 
                                name: page.name, 
                                heading: headingHTML, 
                                snippet: snippet 
                            });
                        }
                    });
                }
            }

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
    const regex = new RegExp(`\\b(${term})\\b`, 'gi');
    return snippet.replace(regex, '&thinsp;<em>$1</em>&thinsp;');
}

function displayResults(matches, searchTerm) {
    const fontContainer = document.getElementById('search-results');
    fontContainer.innerHTML = '';

    if (matches.length === 0) {
        fontContainer.innerHTML = `<li class="search-results-no-results"><p>No results found for <em>${searchTerm}</em></p></li>`;
        return;
    }

    matches.forEach(match => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a class="search-results-card" href="${match.url}">
                ${match.heading}
                <p class="--sm" id="extract-text">...${match.snippet}...</p>
                <div class="location">
                    <p class="--xs" id="page-location">${match.name}</p>
                    <div class="leading_arrow"><i class="material-icons">arrow_forward</i></div>
                </div>
            </a>`;
        fontContainer.appendChild(li);
    });
}