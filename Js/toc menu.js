/**
 * combined.js
 * Implements full interactive behavior for the Table of Contents (menu).
 * * Features:
 * 1. Mobile menu2 Toggle: Adds/removes 'open' class on button click (NEWLY ADDED).
 * 2. Auto-Close menu2: Closes the mobile menu2 when an anchor link is clicked (NEWLY ADDED).
 * 3. Scroll Highlighting: Highlights the active link based on the user's scroll position (Existing logic).
 * 4. Submenu2 Toggle: Toggles the visibility of the submenu2 when the dropdown span is clicked (Existing logic).
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CORE SELECTORS ---
    const menuContainer = document.querySelector('.menu2__container');
    
    // Select the main toggle element for mobile view.
    const menuToggle = menuContainer && menuContainer.querySelector('.menu2__toogle, .menu2__toogle__link'); 
    
    // Select all links in the menu (both main and submenu2 items)
    const menuLinks = document.querySelectorAll(
        'a.menu2__link, a.submenu2__link'
    );

    // Select all dropdown toggle elements
    const dropdownToggles = document.querySelectorAll(
        '.menu2__span-dropdown'
    );

    // Select all relevant elements in the main content that match menu hrefs.
    const sectionHeadings = Array.from(menuLinks)
        .map(link => link.getAttribute('href'))
        .filter(href => href && href.startsWith('#'))
        .map(href => document.getElementById(href.substring(1)))
        .filter(Boolean);

    // --- 2. CONSTANTS ---
    const ACTIVE_CLASS = '--menu-active';
    const PARENT_ACTIVE_CLASS = '--menu-parent-active';
    const SUBmenu2_OPEN_CLASS = '--submenu2-open';
    const MOBILE_BREAKPOINT = 1024; // Matches CSS media query

    // --- 3. MOBILE TOGGLE FUNCTIONALITY (MISSING PIECE) ---
    if (menuToggle && menuContainer) {
        
        // A. Listener for the main toggle element (handles clicks on all nested icons via bubbling)
        menuToggle.addEventListener('click', (event) => {
            
            // Prevent default behavior if the toggle button itself or an element inside it is an <a> tag.
            if (event.target && (event.target.closest('a') || menuToggle.tagName === 'A')) {
                event.preventDefault(); 
            }
            
            // Toggle the 'open' class on the container element.
            // This triggers all necessary mobile CSS changes (menu2 slide, icon visibility).
            // Toggle the 'menu-open' class (CSS expects `menu-open` on container)
            const isOpen = menuContainer.classList.toggle('menu-open'); 
            
            // NEW: Toggle a specific class on the toggle element for robust icon styling
            menuToggle.classList.toggle('is-open'); 
            // Set aria-expanded for improved accessibility
            try { menuToggle.setAttribute('aria-expanded', isOpen); } catch (e) {/* no-op if not an element */}
        });
        
        // B. Auto-close the menu2 on mobile when an anchor link is clicked
        // This improves user experience for navigation within the page.
        // We look for all anchor tags within the menu2 content wrapper.
        const allAnchorLinks = menuContainer.querySelectorAll('.menu2__wrap a');
        
        allAnchorLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                // Check if the screen width is mobile (matching the CSS media query)
                if (window.innerWidth <= MOBILE_BREAKPOINT) {
                    // If the link points to an internal anchor (href starts with '#'),
                    // do NOT auto-close the menu on mobile so it behaves like desktop.
                    const href = link.getAttribute('href') || '';
                    const isHashLink = href.startsWith('#');

                    // If it's not an internal hash link (e.g., navigates to another page), close the menu.
                    if (!isHashLink) {
                        menuContainer.classList.remove('menu-open');
                        if (menuToggle) menuToggle.classList.remove('is-open'); // Ensure icon is reset on close
                    }
                }
            });
        });
    } 

    // --- 4. SUBmenu2 TOGGLE FUNCTIONALITY (EXISTING) ---
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            event.preventDefault();
            // Prevent the click from bubbling up to the parent anchor handler
            // which would otherwise close the menu2 or navigate away.
            event.stopPropagation();
            // Debug: uncomment for troubleshooting
            // console.debug('menu dropdown clicked', toggle);

            const parentListItem = toggle.closest('li.--has__submenu2');
            if (!parentListItem) return;
            const submenu2 = parentListItem.querySelector('.submenu2');
            const mainLink = parentListItem.querySelector('.menu2__link');

            // Track whether the target submenu2 is currently open
            const isCurrentlyOpen = submenu2 && submenu2.classList.contains(SUBmenu2_OPEN_CLASS);

            // Close all other submenu2s & parent actives first
            closeAllSubmenu2s();
            removeParentActiveFromAll();

            if (!isCurrentlyOpen) {
                // If it wasn't open (we are opening it now), open this one and mark parent active
                if (submenu2) submenu2.classList.add(SUBmenu2_OPEN_CLASS);
                toggle.classList.add(SUBmenu2_OPEN_CLASS);
                setParentActive(mainLink, true);
            } else {
                // It was open — clicking should close it (already closed by closeAllSubmenu2s())
                toggle.classList.remove(SUBmenu2_OPEN_CLASS);
                setParentActive(mainLink, false);
            }
        });
    });


    // --- 5. SCROLL HIGHLIGHTING (EXISTING) ---

    // Function to remove all active and parent active classes from all links
    const removeAllActiveClasses = () => {
        menuLinks.forEach(link => {
            link.classList.remove(ACTIVE_CLASS);
            link.classList.remove(PARENT_ACTIVE_CLASS);
        });
    };

    // --- NEW: Reusable helpers for submenu2 & parent active management ---
    const removeParentActiveFromAll = () => {
        document.querySelectorAll(`.menu2__link.${PARENT_ACTIVE_CLASS}`).forEach(link => link.classList.remove(PARENT_ACTIVE_CLASS));
    };

    const closeAllSubmenu2s = () => {
        document.querySelectorAll(`.submenu2.${SUBmenu2_OPEN_CLASS}`).forEach(menu2 => menu2.classList.remove(SUBmenu2_OPEN_CLASS));
        document.querySelectorAll(`.menu2__span-dropdown.${SUBmenu2_OPEN_CLASS}`).forEach(toggle => toggle.classList.remove(SUBmenu2_OPEN_CLASS));
    };

    const openSubmenu2ForMainLink = (mainLink) => {
        if (!mainLink) return;
        const parentListItem = mainLink.closest('li.--has__submenu2');
        if (!parentListItem) return;
        const submenu2 = parentListItem.querySelector('.submenu2');
        const toggle = parentListItem.querySelector('.menu2__span-dropdown');
        // Close others and then open this submenu2
        closeAllSubmenu2s();
        if (submenu2) submenu2.classList.add(SUBmenu2_OPEN_CLASS);
        if (toggle) toggle.classList.add(SUBmenu2_OPEN_CLASS);
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
                    
                    // If the active link is a top-level link (e.g., #M2), apply PARENT_ACTIVE_CLASS directly to it.
                    // Use shared helpers to ensure only the current parent is marked active
                    // and other submenu2s/parent-active classes are removed.

                    if (correspondingLink.classList.contains('menu2__link')) {
                        // Close other parent actives & submenu2s before setting this one.
                        removeParentActiveFromAll();
                        closeAllSubmenu2s();
                        correspondingLink.classList.add(PARENT_ACTIVE_CLASS);
                        // Optionally open submenu2 for the newly active parent if it has one
                        openSubmenu2ForMainLink(correspondingLink);
                    }
                    
                    // If the active link is a submenu2 item (e.g., #M3-1), find and style its parent.
                    if (correspondingLink.classList.contains('submenu2__link')) {
                        // FIX: Selector matches the HTML class '--has__submenu2'
                        const parentListItem = correspondingLink.closest('li.--has__submenu2'); 
                        if (parentListItem) {
                            const mainLink = parentListItem.querySelector('.menu2__link');
                            if (mainLink) {
                                // Close other parent actives & submenu2s first, then set the new parent active
                                removeParentActiveFromAll();
                                openSubmenu2ForMainLink(mainLink);
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

    // --- NEW: Mark submenu link active based on body id for portfolio pages ---
    try {
        const body = document.body;
        if (body && body.classList && body.classList.contains('--body__portfolio')) {
            const idToHref = {
                'SC1': '/BeeProtectorsWebsite.html',
                'SC2': '/BoxHillArtSchoolApp.html',
                'SC3': '/CafeteriaApp.html'
            };
            const hrefToActivate = idToHref[body.id];
            if (hrefToActivate) {
                // Desktop submenu link
                const desktopLinks = document.querySelectorAll(`a.submenu__link[href="${hrefToActivate}"]`);
                desktopLinks.forEach(link => link.classList.add('--active'));

                // Mobile/menu2 submenu link
                const mobileLinks = document.querySelectorAll(`a.submenu2__link[href="${hrefToActivate}"]`);
                mobileLinks.forEach(link => link.classList.add('--menu-active'));

                // Open parent submenu(s) for mobile
                const mobileMain = mobileLinks[0] && mobileLinks[0].closest('li.--has__submenu2');
                if (mobileMain) {
                    const mainLink = mobileMain.querySelector('.menu2__link');
                    if (mainLink) {
                        mainLink.classList.add('--menu-parent-active');
                        openSubmenu2ForMainLink(mainLink);
                    }
                }

                // For desktop, set main menu active as well
                const desktopMain = desktopLinks[0] && desktopLinks[0].closest('li.--has-submenu');
                if (desktopMain) {
                    const mainDesktopLink = desktopMain.querySelector('.menu__link');
                    if (mainDesktopLink) {
                        mainDesktopLink.classList.add('--active');
                    }
                }
            }
        }
    } catch (e) { /* fail silently */ }
});