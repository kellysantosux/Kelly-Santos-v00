/**
 * toc-combined.js
 * Implements full interactive behavior for the Table of Contents (TOC).
 * * Features:
 * 1. Mobile Menu Toggle: Adds/removes 'toc-open' class on button click (NEWLY ADDED).
 * 2. Auto-Close Menu: Closes the mobile menu when an anchor link is clicked (NEWLY ADDED).
 * 3. Scroll Highlighting: Highlights the active link based on the user's scroll position (Existing logic).
 * 4. Submenu Toggle: Toggles the visibility of the submenu when the dropdown span is clicked (Existing logic).
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CORE SELECTORS ---
    const tocContainer = document.querySelector('.table-of-contents__container');
    
    // Select the main toggle element for mobile view.
    const tocToggle = tocContainer && tocContainer.querySelector('.table-of-contents__toogle, .table-of-contents__toogle__link'); 
    
    // Select all links in the TOC (both main and submenu items)
    const tocLinks = document.querySelectorAll(
        'a.table-of-contents__link, a.toc-submenu__link'
    );

    // Select all dropdown toggle elements
    const dropdownToggles = document.querySelectorAll(
        '.table-of-contents__span-dropdown'
    );

    // Select all relevant elements in the main content that match TOC hrefs.
    const sectionHeadings = Array.from(tocLinks)
        .map(link => link.getAttribute('href'))
        .filter(href => href && href.startsWith('#'))
        .map(href => document.getElementById(href.substring(1)))
        .filter(Boolean);

    // --- 2. CONSTANTS ---
    const ACTIVE_CLASS = '--toc-active';
    const PARENT_ACTIVE_CLASS = '--toc-parent-active';
    const SUBMENU_OPEN_CLASS = '--toc-submenu-open';
    const MOBILE_BREAKPOINT = 1024; // Matches CSS media query

    // --- 3. MOBILE TOGGLE FUNCTIONALITY (MISSING PIECE) ---
    if (tocToggle && tocContainer) {
        
        // A. Listener for the main toggle element (handles clicks on all nested icons via bubbling)
        tocToggle.addEventListener('click', (event) => {
            
            // Prevent default behavior if the toggle button itself or an element inside it is an <a> tag.
            if (event.target && (event.target.closest('a') || tocToggle.tagName === 'A')) {
                event.preventDefault(); 
            }
            
            // Toggle the 'toc-open' class on the container element.
            // This triggers all necessary mobile CSS changes (menu slide, icon visibility).
            tocContainer.classList.toggle('toc-open'); 
            
            // NEW: Toggle a specific class on the toggle element for robust icon styling
            tocToggle.classList.toggle('is-open'); 
        });
        
        // B. Auto-close the menu on mobile when an anchor link is clicked
        // This improves user experience for navigation within the page.
        // We look for all anchor tags within the menu content wrapper.
        const allAnchorLinks = tocContainer.querySelectorAll('.table-of-contents__wrap a');
        
        allAnchorLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                // Check if the screen width is mobile (matching the CSS media query)
                if (window.innerWidth <= MOBILE_BREAKPOINT) {
                    // If the link points to an internal anchor (href starts with '#'),
                    // do NOT auto-close the TOC on mobile so it behaves like desktop.
                    const href = link.getAttribute('href') || '';
                    const isHashLink = href.startsWith('#');

                    // If it's not an internal hash link (e.g., navigates to another page), close the TOC.
                    if (!isHashLink) {
                        tocContainer.classList.remove('toc-open');
                        if (tocToggle) tocToggle.classList.remove('is-open'); // Ensure icon is reset on close
                    }
                }
            });
        });
    } 

    // --- 4. SUBMENU TOGGLE FUNCTIONALITY (EXISTING) ---
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            event.preventDefault();
            // Prevent the click from bubbling up to the parent anchor handler
            // which would otherwise close the menu or navigate away.
            event.stopPropagation();
            // Debug: uncomment for troubleshooting
            // console.debug('TOC dropdown clicked', toggle);

            const parentListItem = toggle.closest('li.--has__toc-submenu');
            if (!parentListItem) return;
            const submenu = parentListItem.querySelector('.toc-submenu');
            const mainLink = parentListItem.querySelector('.table-of-contents__link');

            // Track whether the target submenu is currently open
            const isCurrentlyOpen = submenu && submenu.classList.contains(SUBMENU_OPEN_CLASS);

            // Close all other submenus & parent actives first
            closeAllSubmenus();
            removeParentActiveFromAll();

            if (!isCurrentlyOpen) {
                // If it wasn't open (we are opening it now), open this one and mark parent active
                if (submenu) submenu.classList.add(SUBMENU_OPEN_CLASS);
                toggle.classList.add(SUBMENU_OPEN_CLASS);
                setParentActive(mainLink, true);
            } else {
                // It was open — clicking should close it (already closed by closeAllSubmenus())
                toggle.classList.remove(SUBMENU_OPEN_CLASS);
                setParentActive(mainLink, false);
            }
        });
    });


    // --- 5. SCROLL HIGHLIGHTING (EXISTING) ---

    // Function to remove all active and parent active classes from all links
    const removeAllActiveClasses = () => {
        tocLinks.forEach(link => {
            link.classList.remove(ACTIVE_CLASS);
            link.classList.remove(PARENT_ACTIVE_CLASS);
        });
    };

    // --- NEW: Reusable helpers for submenu & parent active management ---
    const removeParentActiveFromAll = () => {
        document.querySelectorAll(`.table-of-contents__link.${PARENT_ACTIVE_CLASS}`).forEach(link => link.classList.remove(PARENT_ACTIVE_CLASS));
    };

    const closeAllSubmenus = () => {
        document.querySelectorAll(`.toc-submenu.${SUBMENU_OPEN_CLASS}`).forEach(menu => menu.classList.remove(SUBMENU_OPEN_CLASS));
        document.querySelectorAll(`.table-of-contents__span-dropdown.${SUBMENU_OPEN_CLASS}`).forEach(toggle => toggle.classList.remove(SUBMENU_OPEN_CLASS));
    };

    const openSubmenuForMainLink = (mainLink) => {
        if (!mainLink) return;
        const parentListItem = mainLink.closest('li.--has__toc-submenu');
        if (!parentListItem) return;
        const submenu = parentListItem.querySelector('.toc-submenu');
        const toggle = parentListItem.querySelector('.table-of-contents__span-dropdown');
        // Close others and then open this submenu
        closeAllSubmenus();
        if (submenu) submenu.classList.add(SUBMENU_OPEN_CLASS);
        if (toggle) toggle.classList.add(SUBMENU_OPEN_CLASS);
    };

    const setParentActive = (mainLink, active = true) => {
        if (!mainLink) return;
        if (active) {
            removeParentActiveFromAll();
            mainLink.classList.add(PARENT_ACTIVE_CLASS);
        } else {
            mainLink.classList.remove(PARENT_ACTIVE_CLASS);
        }
    };

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px 0px -60% 0px', // Target the top 40% of the viewport (or adjust margin as needed)
        threshold: 0 // As soon as the element enters or exits the rootMargin
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const correspondingLink = document.querySelector(`a[href="#${id}"]`);

            if (correspondingLink) {
                // 4A. Determine if the element is crossing the "active" threshold
                if (entry.isIntersecting) {
                    removeAllActiveClasses();

                    // 4B. Set current link as active
                    correspondingLink.classList.add(ACTIVE_CLASS);
                 
                    // 4C. Apply PARENT_ACTIVE_CLASS Logic
                    
                    // If the active link is a top-level link (e.g., #C2), apply PARENT_ACTIVE_CLASS directly to it.
                    // Use shared helpers to ensure only the current parent is marked active
                    // and other submenus/parent-active classes are removed.

                    if (correspondingLink.classList.contains('table-of-contents__link')) {
                        // Close other parent actives & submenus before setting this one.
                        removeParentActiveFromAll();
                        closeAllSubmenus();
                        correspondingLink.classList.add(PARENT_ACTIVE_CLASS);
                        // Optionally open submenu for the newly active parent if it has one
                        openSubmenuForMainLink(correspondingLink);
                    }
                    
                    // If the active link is a submenu item (e.g., #C3-1), find and style its parent.
                    if (correspondingLink.classList.contains('toc-submenu__link')) {
                        // FIX: Selector matches the HTML class '--has__toc-submenu'
                        const parentListItem = correspondingLink.closest('li.--has__toc-submenu'); 
                        if (parentListItem) {
                            const mainLink = parentListItem.querySelector('.table-of-contents__link');
                            if (mainLink) {
                                // Close other parent actives & submenus first, then set the new parent active
                                removeParentActiveFromAll();
                                openSubmenuForMainLink(mainLink);
                                mainLink.classList.add(PARENT_ACTIVE_CLASS);
                            }
                        }
                    }
                }
            }
        });
    }, observerOptions);

    // Start observing each section heading
    sectionHeadings.forEach(section => {
        observer.observe(section);
    });
});