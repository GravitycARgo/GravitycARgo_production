/**
 * Universal Navbar Toggle Functionality
 * Ensures navbar works consistently across all pages
 * Provides fallback for when Bootstrap JS is not available
 */

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }
    
    // Initialize navbar functionality
    ready(function() {
        initializeNavbarToggle();
        handleNavbarScroll();
        fixNavbarZIndex();
    });
    
    /**
     * Initialize navbar toggle functionality
     */
    function initializeNavbarToggle() {
        const togglers = document.querySelectorAll('.navbar-toggler');
        
        togglers.forEach(toggler => {
            // Remove any existing click listeners to prevent duplicates
            toggler.removeEventListener('click', handleToggleClick);
            
            // Add click listener
            toggler.addEventListener('click', handleToggleClick);
            
            // Add keyboard support
            toggler.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleClick.call(this, e);
                }
            });
            
            // Ensure toggler has proper attributes
            if (!toggler.getAttribute('aria-expanded')) {
                toggler.setAttribute('aria-expanded', 'false');
            }
            
            // Add screen reader text if missing
            if (!toggler.querySelector('.sr-only, .visually-hidden')) {
                const srText = document.createElement('span');
                srText.className = 'visually-hidden';
                srText.textContent = 'Toggle navigation';
                toggler.appendChild(srText);
            }
        });
    }
    
    /**
     * Handle navbar toggle click
     */
    function handleToggleClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const toggler = this;
        const targetSelector = toggler.getAttribute('data-bs-target') || toggler.getAttribute('data-target');
        
        if (!targetSelector) {
            console.warn('Navbar toggler missing target selector');
            return;
        }
        
        const target = document.querySelector(targetSelector);
        
        if (!target) {
            console.warn('Navbar target not found:', targetSelector);
            return;
        }
        
        // Check if Bootstrap collapse is available
        if (window.bootstrap && window.bootstrap.Collapse) {
            // Use Bootstrap collapse
            let bsCollapse = window.bootstrap.Collapse.getInstance(target);
            
            if (!bsCollapse) {
                bsCollapse = new window.bootstrap.Collapse(target, {
                    toggle: false
                });
            }
            
            bsCollapse.toggle();
        } else {
            // Fallback manual toggle
            manualToggle(target, toggler);
        }
    }
    
    /**
     * Manual toggle fallback when Bootstrap JS is not available
     */
    function manualToggle(target, toggler) {
        const isExpanded = toggler.getAttribute('aria-expanded') === 'true';
        const isShowing = target.classList.contains('show') || target.classList.contains('manual-show');
        
        if (isShowing) {
            // Hide
            target.classList.remove('show', 'manual-show');
            target.classList.add('manual-hide');
            toggler.setAttribute('aria-expanded', 'false');
            
            // Animate collapse
            if (target.style.height !== '0px') {
                target.style.height = target.scrollHeight + 'px';
                requestAnimationFrame(() => {
                    target.style.height = '0px';
                    target.style.overflow = 'hidden';
                });
            }
            
            setTimeout(() => {
                target.classList.remove('manual-hide');
                target.style.height = '';
                target.style.overflow = '';
            }, 350);
            
        } else {
            // Show
            target.classList.remove('manual-hide');
            target.classList.add('show', 'manual-show');
            toggler.setAttribute('aria-expanded', 'true');
            
            // Animate expand
            target.style.height = '0px';
            target.style.overflow = 'hidden';
            
            requestAnimationFrame(() => {
                target.style.height = target.scrollHeight + 'px';
            });
            
            setTimeout(() => {
                target.style.height = '';
                target.style.overflow = '';
            }, 350);
        }
    }
    
    /**
     * Handle navbar background change on scroll
     */
    function handleNavbarScroll() {
        const navbars = document.querySelectorAll('.navbar');
        
        if (navbars.length === 0) return;
        
        function updateNavbarOnScroll() {
            const scrollY = window.scrollY;
            
            navbars.forEach(navbar => {
                if (scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
        }
        
        // Throttle scroll event
        let scrollTimer = null;
        window.addEventListener('scroll', function() {
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }
            scrollTimer = setTimeout(updateNavbarOnScroll, 10);
        });
        
        // Initial check
        updateNavbarOnScroll();
    }
    
    /**
     * Fix navbar z-index issues
     */
    function fixNavbarZIndex() {
        const navbars = document.querySelectorAll('.navbar');
        
        navbars.forEach(navbar => {
            // Ensure navbar has proper z-index
            if (!navbar.style.zIndex) {
                navbar.style.zIndex = '1030';
            }
            
            // Fix collapse z-index
            const collapse = navbar.querySelector('.navbar-collapse');
            if (collapse && !collapse.style.zIndex) {
                collapse.style.zIndex = '1031';
            }
        });
    }
    
    /**
     * Close navbar when clicking outside
     */
    function handleOutsideClick(e) {
        const navbars = document.querySelectorAll('.navbar');
        
        navbars.forEach(navbar => {
            const toggler = navbar.querySelector('.navbar-toggler');
            const collapse = navbar.querySelector('.navbar-collapse');
            
            if (!navbar.contains(e.target) && collapse && collapse.classList.contains('show')) {
                if (window.bootstrap && window.bootstrap.Collapse) {
                    const bsCollapse = window.bootstrap.Collapse.getInstance(collapse);
                    if (bsCollapse) {
                        bsCollapse.hide();
                    }
                } else {
                    manualToggle(collapse, toggler);
                }
            }
        });
    }
    
    // Add outside click listener
    document.addEventListener('click', handleOutsideClick);
    
    /**
     * Handle window resize
     */
    function handleResize() {
        const width = window.innerWidth;
        
        // Auto-close mobile menu on desktop resize
        if (width >= 769) {
            const collapses = document.querySelectorAll('.navbar-collapse.show');
            
            collapses.forEach(collapse => {
                if (window.bootstrap && window.bootstrap.Collapse) {
                    const bsCollapse = window.bootstrap.Collapse.getInstance(collapse);
                    if (bsCollapse) {
                        bsCollapse.hide();
                    }
                } else {
                    collapse.classList.remove('show', 'manual-show');
                    const toggler = collapse.closest('.navbar').querySelector('.navbar-toggler');
                    if (toggler) {
                        toggler.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        }
    }
    
    // Throttle resize event
    let resizeTimer = null;
    window.addEventListener('resize', function() {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(handleResize, 100);
    });
    
    /**
     * Debug function to check navbar status
     */
    window.checkNavbarStatus = function() {
        console.log('=== NAVBAR DEBUG INFO ===');
        console.log('Bootstrap available:', !!window.bootstrap);
        console.log('Navbar togglers found:', document.querySelectorAll('.navbar-toggler').length);
        console.log('Navbar collapses found:', document.querySelectorAll('.navbar-collapse').length);
        
        document.querySelectorAll('.navbar-toggler').forEach((toggler, index) => {
            const target = toggler.getAttribute('data-bs-target') || toggler.getAttribute('data-target');
            console.log(`Toggler ${index + 1}:`, {
                hasTarget: !!target,
                targetExists: !!document.querySelector(target),
                ariaExpanded: toggler.getAttribute('aria-expanded')
            });
        });
    };
    
})();
