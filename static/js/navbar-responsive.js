/**
 * Responsive Navbar JavaScript
 * Handles mobile navigation toggle, scroll effects, and accessibility
 */

(function() {
    'use strict';

    // Navbar elements
    let navbar = null;
    let navbarToggler = null;
    let navbarCollapse = null;
    let navLinks = [];

    // State variables
    let isNavOpen = false;
    let lastScrollY = 0;
    let scrollTimeout = null;

    /**
     * Initialize navbar functionality
     */
    function initNavbar() {
        // Get DOM elements
        navbar = document.querySelector('.navbar');
        navbarToggler = document.querySelector('.navbar-toggler');
        navbarCollapse = document.querySelector('.navbar-collapse');
        navLinks = document.querySelectorAll('.nav-link');

        if (!navbar || !navbarToggler || !navbarCollapse) {
            console.warn('Navbar elements not found');
            return;
        }

        // Set up event listeners
        setupEventListeners();
        
        // Initialize ARIA attributes
        setupAccessibility();
        
        // Handle initial scroll state
        handleScroll();
        
        console.log('Responsive navbar initialized');
    }

    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Toggle button click
        navbarToggler.addEventListener('click', toggleNavbar);
        
        // Close navbar when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', closeNavbar);
        });
        
        // Close navbar when clicking outside
        document.addEventListener('click', handleOutsideClick);
        
        // Handle keyboard navigation
        document.addEventListener('keydown', handleKeydown);
        
        // Scroll effects
        window.addEventListener('scroll', throttledScroll, { passive: true });
        
        // Handle window resize
        window.addEventListener('resize', handleResize);
        
        // Handle orientation change on mobile
        window.addEventListener('orientationchange', handleOrientationChange);
    }

    /**
     * Set up accessibility attributes
     */
    function setupAccessibility() {
        // Set initial ARIA attributes
        navbarToggler.setAttribute('aria-expanded', 'false');
        navbarToggler.setAttribute('aria-controls', 'navbarNav');
        navbarToggler.setAttribute('aria-label', 'Toggle navigation menu');
        
        navbarCollapse.setAttribute('id', 'navbarNav');
        navbarCollapse.setAttribute('aria-labelledby', 'navbar-toggler');
    }

    /**
     * Toggle navbar open/closed state
     */
    function toggleNavbar(event) {
        event.preventDefault();
        event.stopPropagation();
        
        isNavOpen = !isNavOpen;
        
        if (isNavOpen) {
            openNavbar();
        } else {
            closeNavbar();
        }
    }

    /**
     * Open the mobile navbar
     */
    function openNavbar() {
        isNavOpen = true;
        
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
        
        console.log('Mobile navbar opened');
    }

    /**
     * Close the mobile navbar
     */
    function closeNavbar() {
        if (!isNavOpen) return;
        
        isNavOpen = false;
        
        navbarCollapse.classList.remove('show');
        navbarToggler.setAttribute('aria-expanded', 'false');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        console.log('Mobile navbar closed');
    }

    /**
     * Handle clicks outside the navbar
     */
    function handleOutsideClick(event) {
        if (!isNavOpen) return;
        
        // Don't close if clicking inside navbar
        if (navbar.contains(event.target)) return;
        
        closeNavbar();
    }

    /**
     * Handle keyboard navigation
     */
    function handleKeydown(event) {
        // Close navbar on Escape key
        if (event.key === 'Escape' && isNavOpen) {
            closeNavbar();
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
        
        // If Shift+Tab on first element, go to last
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        }
        // If Tab on last element, go to first
        else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }

    /**
     * Throttled scroll handler
     */
    function throttledScroll() {
        if (scrollTimeout) return;
        
        scrollTimeout = setTimeout(() => {
            handleScroll();
            scrollTimeout = null;
        }, 16); // ~60fps
    }

    /**
     * Handle scroll effects
     */
    function handleScroll() {
        const currentScrollY = window.scrollY;
        
        // Add/remove scrolled class based on scroll position
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Close mobile menu on scroll (mobile only)
        if (window.innerWidth <= 768 && isNavOpen && Math.abs(currentScrollY - lastScrollY) > 5) {
            closeNavbar();
        }
        
        lastScrollY = currentScrollY;
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        // Close mobile menu if resizing to desktop
        if (window.innerWidth > 768 && isNavOpen) {
            closeNavbar();
        }
        
        // Reset body overflow
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
            closeNavbar();
        }
        
        // Recalculate layout after orientation change
        setTimeout(() => {
            handleScroll();
        }, 100);
    }

    /**
     * Smooth scroll to section (for anchor links)
     */
    function smoothScrollToSection(targetId) {
        const targetElement = document.getElementById(targetId.replace('#', ''));
        
        if (!targetElement) return;
        
        const navbarHeight = navbar.offsetHeight;
        const targetPosition = targetElement.offsetTop - navbarHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Handle nav link clicks with smooth scrolling
     */
    function handleNavLinkClick(event) {
        const href = event.target.getAttribute('href');
        
        // Handle internal anchor links
        if (href && href.startsWith('#')) {
            event.preventDefault();
            smoothScrollToSection(href);
            closeNavbar();
        }
    }

    /**
     * Add smooth scrolling to nav links
     */
    function setupSmoothScrolling() {
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavLinkClick);
        });
    }

    /**
     * Initialize active link highlighting
     */
    function updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const navbarHeight = navbar.offsetHeight;
        
        let activeSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbarHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                activeSection = section.getAttribute('id');
            }
        });
        
        // Update active nav link
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('active');
            
            if (href === `#${activeSection}`) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Enhanced scroll handler with active link updates
     */
    function enhancedScrollHandler() {
        handleScroll();
        updateActiveLink();
    }

    /**
     * Initialize when DOM is ready
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initNavbar);
        } else {
            initNavbar();
        }
        
        // Setup smooth scrolling
        setTimeout(setupSmoothScrolling, 100);
        
        // Enhanced scroll handling
        window.addEventListener('scroll', throttledScroll, { passive: true });
        window.addEventListener('scroll', updateActiveLink, { passive: true });
    }

    // Public API
    window.ResponsiveNavbar = {
        init: init,
        toggle: toggleNavbar,
        open: openNavbar,
        close: closeNavbar,
        isOpen: () => isNavOpen
    };

    // Auto-initialize
    init();

})();
