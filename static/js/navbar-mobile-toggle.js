/**
 * Mobile Navbar Toggle Functionality
 * Handles Bootstrap navbar collapse on mobile devices
 */

(function() {
    'use strict';

    let navbar = null;
    let navbarToggler = null;
    let navbarCollapse = null;
    let isNavOpen = false;

    /**
     * Initialize mobile navbar functionality
     */
    function initMobileNavbar() {
        // Get DOM elements
        navbar = document.querySelector('.navbar');
        navbarToggler = document.querySelector('.navbar-toggler');
        navbarCollapse = document.querySelector('.navbar-collapse');

        if (!navbar || !navbarToggler || !navbarCollapse) {
            console.warn('Mobile navbar elements not found');
            return;
        }

        console.log('Initializing mobile navbar functionality...');

        // Set up event listeners
        setupMobileEventListeners();
        
        // Initialize ARIA attributes
        setupMobileAccessibility();
        
        // Handle initial state
        handleInitialState();
        
        console.log('Mobile navbar initialized successfully');
    }

    /**
     * Set up event listeners for mobile navbar
     */
    function setupMobileEventListeners() {
        // Toggle button click
        navbarToggler.addEventListener('click', handleToggleClick);
        
        // Close navbar when clicking nav links
        const navLinks = navbarCollapse.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileNavbar);
        });
        
        // Close navbar when clicking outside
        document.addEventListener('click', handleOutsideClick);
        
        // Handle keyboard navigation
        document.addEventListener('keydown', handleKeydown);
        
        // Handle window resize
        window.addEventListener('resize', handleResize);
        
        // Handle orientation change on mobile
        window.addEventListener('orientationchange', handleOrientationChange);

        // Handle scroll on mobile (close menu when scrolling)
        let scrollTimeout = null;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) return;
            
            scrollTimeout = setTimeout(() => {
                if (window.innerWidth <= 768 && isNavOpen) {
                    closeMobileNavbar();
                }
                scrollTimeout = null;
            }, 100);
        }, { passive: true });
    }

    /**
     * Set up accessibility attributes
     */
    function setupMobileAccessibility() {
        navbarToggler.setAttribute('aria-expanded', 'false');
        navbarToggler.setAttribute('aria-controls', 'navbarNav');
        navbarToggler.setAttribute('aria-label', 'Toggle navigation menu');
        
        if (!navbarCollapse.id) {
            navbarCollapse.setAttribute('id', 'navbarNav');
        }
    }

    /**
     * Handle initial state
     */
    function handleInitialState() {
        // Ensure navbar is closed on page load
        isNavOpen = false;
        navbarCollapse.classList.remove('show');
        navbarToggler.setAttribute('aria-expanded', 'false');
        
        // Add scrolled class if page is already scrolled
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        }
    }

    /**
     * Handle toggle button click
     */
    function handleToggleClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('Navbar toggle clicked');
        
        if (isNavOpen) {
            closeMobileNavbar();
        } else {
            openMobileNavbar();
        }
    }

    /**
     * Open mobile navbar
     */
    function openMobileNavbar() {
        console.log('Opening mobile navbar');
        
        isNavOpen = true;
        
        // Show the collapse element
        navbarCollapse.style.display = 'block';
        
        // Add show class with slight delay for animation
        requestAnimationFrame(() => {
            navbarCollapse.classList.add('show');
            navbarToggler.setAttribute('aria-expanded', 'true');
            
            // Focus first nav link for accessibility
            const firstNavLink = navbarCollapse.querySelector('.nav-link');
            if (firstNavLink) {
                setTimeout(() => firstNavLink.focus(), 150);
            }
        });
        
        // Prevent body scroll on mobile when menu is open
        if (window.innerWidth <= 768) {
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Close mobile navbar
     */
    function closeMobileNavbar() {
        if (!isNavOpen) return;
        
        console.log('Closing mobile navbar');
        
        isNavOpen = false;
        
        navbarCollapse.classList.remove('show');
        navbarToggler.setAttribute('aria-expanded', 'false');
        
        // Hide the collapse element after animation
        setTimeout(() => {
            if (!isNavOpen) {
                navbarCollapse.style.display = 'none';
            }
        }, 300);
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    /**
     * Handle clicks outside the navbar
     */
    function handleOutsideClick(event) {
        if (!isNavOpen) return;
        
        // Don't close if clicking inside navbar
        if (navbar.contains(event.target)) return;
        
        closeMobileNavbar();
    }

    /**
     * Handle keyboard navigation
     */
    function handleKeydown(event) {
        // Close navbar on Escape key
        if (event.key === 'Escape' && isNavOpen) {
            closeMobileNavbar();
            navbarToggler.focus();
            return;
        }
        
        // Handle Tab navigation within open navbar
        if (isNavOpen && event.key === 'Tab') {
            handleTabNavigation(event);
        }
    }

    /**
     * Handle Tab key navigation within navbar
     */
    function handleTabNavigation(event) {
        const focusableElements = navbarCollapse.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // If Shift+Tab on first element, go to toggler
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            navbarToggler.focus();
        }
        // If Tab on last element, go to toggler
        else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            navbarToggler.focus();
        }
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        // Close mobile menu if resizing to desktop
        if (window.innerWidth > 768 && isNavOpen) {
            closeMobileNavbar();
        }
        
        // Reset body overflow on desktop
        if (window.innerWidth > 768) {
            document.body.style.overflow = '';
        }
    }

    /**
     * Handle orientation change on mobile devices
     */
    function handleOrientationChange() {
        // Close navbar on orientation change
        if (isNavOpen) {
            closeMobileNavbar();
        }
        
        // Recalculate layout after orientation change
        setTimeout(() => {
            handleScrollEffect();
        }, 100);
    }

    /**
     * Handle scroll effects for navbar background
     */
    function handleScrollEffect() {
        const currentScrollY = window.scrollY;
        
        // Add/remove scrolled class based on scroll position
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    /**
     * Initialize when DOM is ready
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initMobileNavbar);
        } else {
            initMobileNavbar();
        }

        // Set up scroll effects
        let scrollTimeout = null;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) return;
            
            scrollTimeout = setTimeout(() => {
                handleScrollEffect();
                scrollTimeout = null;
            }, 16); // ~60fps
        }, { passive: true });
    }

    // Public API
    window.MobileNavbar = {
        init: init,
        toggle: handleToggleClick,
        open: openMobileNavbar,
        close: closeMobileNavbar,
        isOpen: () => isNavOpen
    };

    // Auto-initialize
    init();

    console.log('Mobile navbar toggle script loaded');

})();

// Also handle Bootstrap's native collapse functionality as fallback
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap collapse if available
    if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Collapse) {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse) {
            new window.bootstrap.Collapse(navbarCollapse, {
                toggle: false
            });
        }
    }
    
    // Manual toggle handler as primary method
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapseEl = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapseEl) {
        navbarToggler.addEventListener('click', function(e) {
            e.preventDefault();
            
            const isCurrentlyShown = navbarCollapseEl.classList.contains('show');
            
            if (isCurrentlyShown) {
                navbarCollapseEl.classList.remove('show');
                navbarToggler.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            } else {
                navbarCollapseEl.classList.add('show');
                navbarToggler.setAttribute('aria-expanded', 'true');
                if (window.innerWidth <= 768) {
                    document.body.style.overflow = 'hidden';
                }
            }
        });
        
        // Close on nav link click
        const navLinks = navbarCollapseEl.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navbarCollapseEl.classList.remove('show');
                navbarToggler.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }
});
