const pages = [
    { url: 'index.html', name: 'Home' },
    { url: 'portfolio.html', name: 'Portfolio' },
    { url: 'about.html', name: 'About' },
    { url: 'contact.html', name: 'Contact' },
    { url: 'resume.html', name: 'Resume' },
    { url: 'box-hill-art-school-app.html', name: 'Box Hill Art School' },
    { url: 'bee-protectors-website.html', name: 'Bee Protectors Website' },
    { url: 'cafeteria-app.html', name: 'Cafeteria App' }
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

// HELPER FUNCTION: Normalizes text to Title Case (e.g., "cAse sTuDy" -> "Case Study")
function toTitleCase(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// HIGHLIGHT ENGINE: Safely wraps the matched term anywhere it appears in clean inline tags
function highlightTextSnippet(snippetText, term) {
    if (!snippetText) return '';
    // Escape special regex characters to ensure safe evaluations
    const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const highlightRegex = new RegExp(`(${escapedTerm})`, 'gi');
    
    // Returns clean tags without punctuation/whitespace anomalies so prose flows naturally
    return snippetText.replace(highlightRegex, '<em>$1</em>');
}

async function performSearch(passedQuery) {
    const input = document.getElementById('search-input');
    const searchTerm = (passedQuery || input.value).trim();
    const resultsContainer = document.getElementById('search-results');
    const searchHeader = document.getElementById('search-term-header');

    if (searchHeader) searchHeader.innerText = searchTerm;

    if (searchTerm.length < 3) {
        resultsContainer.innerHTML = '<li class="search-results-characters"> <p>Please enter more than 3 characters.</p></li>';
        return;
    }

    resultsContainer.innerHTML = '<li> <p>Searching all pages...</p></li>';
    
    let matches = [];
    let seenMatches = new Set();

    for (const page of pages) {
        try {
            const response = await fetch(page.url);
            const htmlText = await response.text();
            const doc = new DOMParser().parseFromString(htmlText, 'text/html');

            // Remove layout containers to avoid false positives
            const cleanDoc = doc.body;
            const extras = cleanDoc.querySelectorAll('nav, footer, script, style');
            extras.forEach(el => el.remove());

            // Traverse text nodes to locate matches securely
            const walker = doc.createTreeWalker(cleanDoc, NodeFilter.SHOW_TEXT, null, false);
            let textNode;

            while (textNode = walker.nextNode()) {
                const textContent = textNode.nodeValue;
                const lowerText = textContent.toLowerCase();
                const lowerSearch = searchTerm.toLowerCase();
                
                // Direct character position lookup (catches standalone words and sub-words smoothly)
                let searchIndex = lowerText.indexOf(lowerSearch);
                
                while (searchIndex !== -1) {
                    const parentElement = textNode.parentElement;

                    // 1. COLLECT ALL ANCESTOR ELEMENTS WITH AN ID OR ARIA-LABEL
                    let current = parentElement;
                    let idContainers = [];
                    let ariaLabels = [];
                    let closestIdElement = null;
                    
                    while (current && current !== doc.body) {
                        if (current.id) {
                            idContainers.push(current.id);
                            if (!closestIdElement) {
                                closestIdElement = current;
                            }
                        }
                        if (current.getAttribute('aria-label')) {
                            const cleanLabel = toTitleCase(current.getAttribute('aria-label').trim());
                            ariaLabels.push(cleanLabel);
                        }
                        current = current.parentElement;
                    }
                    
                    const targetId = idContainers.length > 0 ? `#${idContainers[0]}` : '';
                    const fullUrl = `${page.url}${targetId}`;
                    
                    // 2. CONSTRUCT BREADCRUMB STRINGS
                    let sectionBreadcrumb = '';
                    let headingText = '';

                    if (closestIdElement) {
                        const internalHeading = closestIdElement.querySelector('h1, h2, h3, h4, h5, h6');
                        if (internalHeading) {
                            headingText = toTitleCase(internalHeading.textContent.trim());
                        }
                    }

                    if (!headingText) {
                        const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
                        const precedentHeading = headings
                            .filter(heading => heading.compareDocumentPosition(parentElement) & Node.DOCUMENT_POSITION_FOLLOWING)
                            .pop();
                        if (precedentHeading) {
                            headingText = toTitleCase(precedentHeading.textContent.trim());
                        }
                    }
                    
                    if (ariaLabels.length > 0) {
                        let labelsChain = ariaLabels.reverse().join(' <span class="sep"> / </span> ');
                        sectionBreadcrumb = headingText ? `${labelsChain} <span class="sep"> / </span> ${headingText}` : labelsChain;
                    } else {
                        sectionBreadcrumb = headingText;
                    }

                    // 3. EXTRACT CLEAN CONTEXT BOUNDARIES (Prevents layout fragmentation)
                    const cleanContext = textContent.replace(/[\s\u00A0]+/g, " ");
                    const freshLowerText = cleanContext.toLowerCase();
                    const cleanIndex = freshLowerText.indexOf(lowerSearch);

                    // Isolate standard preview windows around the target match position
                    const startPos = Math.max(0, cleanIndex - 25);
                    const endPos = Math.min(cleanContext.length, cleanIndex + searchTerm.length + 35);
                    
                    let rawSnippet = cleanContext.substring(startPos, endPos).trim();
                    
                    // Call our explicit inline snippet highligting rule processor
                    const finalSnippet = highlightTextSnippet(rawSnippet, searchTerm);
                    
                    const uniqueKey = `${fullUrl}::${finalSnippet}`;
                    if (!seenMatches.has(uniqueKey)) {
                        seenMatches.add(uniqueKey);
                        
                        matches.push({ 
                            url: fullUrl, 
                            name: page.name, 
                            heading: sectionBreadcrumb, 
                            snippet: finalSnippet 
                        });
                    }

                    // Shift focus forward to inspect further matches in the same node
                    searchIndex = lowerText.indexOf(lowerSearch, searchIndex + 1);
                }
            }

        } catch (error) {
            console.error(`Error fetching ${page.url}:`, error);
        }
    }
    displayResults(matches, searchTerm);
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
                <div class="search-breadcrumb">
                     ${match.name}<span class="sep"> / </span> 
                    ${match.heading ? `${match.heading} ` : ''}
                
                </div>
                <p class="--sm" id="extract-text"><span class="dot">...</span>${match.snippet}<span class="dot">...</span></p>
            </a>`;
        fontContainer.appendChild(li);

        
        
    });
}