/**
 * GravitycARgo Navigation Component - ENHANCED
 * Handles unified navigation with stunning step progress animations
 */

// Step navigation URLs
const STEP_URLS = {
    1: '/step1',
    2: '/step2', 
    3: '/step3',
    4: '/step4'
};

/**
 * Initialize Step Progress System
 */
function initializeStepProgress() {
    // Get current step from URL or page context
    const currentPath = window.location.pathname;
    let currentStep = 1;
    
    if (currentPath.includes('step2')) currentStep = 2;
    else if (currentPath.includes('step3')) currentStep = 3;
    else if (currentPath.includes('step4')) currentStep = 4;
    
    // Update step states with animations
    updateStepStates(currentStep);
    
    // Add click handlers for step navigation
    addStepClickHandlers(currentStep);
    
    // Add hover effects
    addStepHoverEffects();
}

/**
 * Update step states with smooth animations
 */
function updateStepStates(currentStep) {
    const stepWrappers = document.querySelectorAll('.step-wrapper');
    const connectors = document.querySelectorAll('.step-connector');
    
    stepWrappers.forEach((wrapper, index) => {
        const stepNumber = index + 1;
        const bubble = wrapper.querySelector('.step-bubble');
        const number = wrapper.querySelector('.step-number');
        const checkIcon = wrapper.querySelector('.step-check-icon');
        
        // Remove all classes first
        wrapper.classList.remove('active', 'completed');
        if (connectors[index]) {
            connectors[index].classList.remove('active', 'completed');
        }
        
        // Add appropriate classes with delay for smooth animation
        setTimeout(() => {
            if (stepNumber < currentStep) {
                // Completed step
                wrapper.classList.add('completed');
                if (connectors[index]) {
                    connectors[index].classList.add('completed');
                }
                
                // Add check icon animation
                if (checkIcon && number) {
                    number.style.display = 'none';
                    checkIcon.style.display = 'block';
                }
            } else if (stepNumber === currentStep) {
                // Active step
                wrapper.classList.add('active');
                if (connectors[index - 1]) {
                    connectors[index - 1].classList.add('active');
                }
                
                // Add pulse animation to active step
                addPulseEffect(bubble);
            }
        }, index * 100); // Stagger animations
    });
}

/**
 * Add pulse effect to active step
 */
function addPulseEffect(element) {
    if (!element) return;
    
    element.style.animation = 'none';
    setTimeout(() => {
        element.style.animation = 'pulseGlow 2.5s ease-in-out infinite';
    }, 100);
}

/**
 * Add click handlers for step navigation
 */
function addStepClickHandlers(currentStep) {
    const stepWrappers = document.querySelectorAll('.step-wrapper');
    
    stepWrappers.forEach((wrapper, index) => {
        const stepNumber = index + 1;
        
        wrapper.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Only allow navigation to previous steps or current step
            if (stepNumber <= currentStep) {
                // Add click animation
                wrapper.style.transform = 'translateY(-3px) scale(0.95)';
                setTimeout(() => {
                    wrapper.style.transform = '';
                    navigateToStep(stepNumber);
                }, 150);
            } else {
                // Shake animation for disabled steps
                addShakeEffect(wrapper);
            }
        });
        
        // Keyboard navigation
        wrapper.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                wrapper.click();
            }
        });
        
        // Make focusable
        wrapper.setAttribute('tabindex', '0');
        wrapper.setAttribute('role', 'button');
        wrapper.setAttribute('aria-label', `Step ${stepNumber}: ${getStepLabel(stepNumber)}`);
    });
}

/**
 * Add hover effects for better interactivity
 */
function addStepHoverEffects() {
    const stepWrappers = document.querySelectorAll('.step-wrapper');
    
    stepWrappers.forEach((wrapper) => {
        const bubble = wrapper.querySelector('.step-bubble');
        const title = wrapper.querySelector('.step-title');
        const subtitle = wrapper.querySelector('.step-subtitle');
        
        wrapper.addEventListener('mouseenter', () => {
            if (!wrapper.classList.contains('active')) {
                bubble.style.transform = 'scale(1.1)';
                title.style.transform = 'translateY(-2px)';
                subtitle.style.transform = 'translateY(-2px)';
            }
        });
        
        wrapper.addEventListener('mouseleave', () => {
            if (!wrapper.classList.contains('active')) {
                bubble.style.transform = '';
                title.style.transform = '';
                subtitle.style.transform = '';
            }
        });
    });
}

/**
 * Add shake effect for disabled steps
 */
function addShakeEffect(element) {
    element.style.animation = 'shake 0.6s ease-in-out';
    setTimeout(() => {
        element.style.animation = '';
    }, 600);
}

/**
 * Get step label text
 */
function getStepLabel(stepNumber) {
    const labels = {
        1: 'Transport Mode Selection',
        2: 'Container Selection',
        3: 'File Upload',
        4: 'Settings Review'
    };
    return labels[stepNumber] || '';
}

/**
 * Enhanced Hamburger Menu Toggle Function with Animations
 */
function toggleHamburgerMenu() {
    const hamburgerButton = document.querySelector('.hamburger-menu');
    const dropdownMenu = document.getElementById('hamburger-dropdown');
    
    if (!hamburgerButton || !dropdownMenu) {
        console.error('Hamburger menu elements not found');
        return;
    }
    
    const isExpanded = hamburgerButton.getAttribute('aria-expanded') === 'true';
    
    hamburgerButton.setAttribute('aria-expanded', !isExpanded);
    
    if (isExpanded) {
        // Closing menu
        dropdownMenu.classList.remove('show');
        hamburgerButton.style.transform = 'rotate(0deg) scale(1)';
        
        // Focus management
        setTimeout(() => {
            hamburgerButton.focus();
        }, 300);
        
        // Remove click outside listener
        document.removeEventListener('click', handleClickOutside);
        
    } else {
        // Opening menu
        dropdownMenu.classList.add('show');
        hamburgerButton.style.transform = 'rotate(90deg) scale(1.05)';
        
        // Add enhanced visual feedback
        setTimeout(() => {
            const firstMenuItem = dropdownMenu.querySelector('.dropdown-item');
            if (firstMenuItem) {
                // Don't auto-focus, let user decide
                // firstMenuItem.focus();
            }
        }, 100);
        
        // Add click outside listener
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 100);
    }
    
    // Add vibration feedback on mobile
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

/**
 * Handle click outside dropdown
 */
function handleClickOutside(event) {
    const hamburgerButton = document.querySelector('.hamburger-menu');
    const dropdownMenu = document.getElementById('hamburger-dropdown');
    
    if (!hamburgerButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        toggleHamburgerMenu();
    }
}

/**
 * Navigate to specific step
 */
function navigateToStep(stepNumber) {
    if (STEP_URLS[stepNumber]) {
        window.location.href = STEP_URLS[stepNumber];
    } else {
        console.error('Invalid step number:', stepNumber);
    }
}

/**
 * Go back to previous step
 */
function goBack() {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('step2')) {
        navigateToStep(1);
    } else if (currentPath.includes('step3')) {
        navigateToStep(2);
    } else if (currentPath.includes('step4')) {
        navigateToStep(3);
    } else {
        window.history.back();
    }
}

/**
 * Proceed to next step (step-specific implementation required)
 */
function proceedToNext() {
    const currentPath = window.location.pathname;
    
    // Each step page should override this function with its specific logic
    console.log('proceedToNext called from:', currentPath);
    
    // Default behavior - just navigate to next step
    if (currentPath.includes('step1')) {
        navigateToStep(2);
    } else if (currentPath.includes('step2')) {
        navigateToStep(3);
    } else if (currentPath.includes('step3')) {
        navigateToStep(4);
    }
}

/**
 * Initialize navigation when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Set up hamburger menu event listeners
    const hamburgerButton = document.querySelector('.hamburger-menu');
    const dropdownMenu = document.getElementById('hamburger-dropdown');
    
    if (hamburgerButton && dropdownMenu) {
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburgerButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
                if (dropdownMenu.classList.contains('show')) {
                    toggleHamburgerMenu();
                }
            }
        });
        
        // Handle keyboard navigation within dropdown
        const menuItems = dropdownMenu.querySelectorAll('.dropdown-item');
        menuItems.forEach((item, index) => {
            item.addEventListener('keydown', function(e) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextItem = menuItems[index + 1] || menuItems[0];
                    nextItem.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevItem = menuItems[index - 1] || menuItems[menuItems.length - 1];
                    prevItem.focus();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    toggleHamburgerMenu();
                }
            });
        });
        
        // Handle escape key for hamburger button
        hamburgerButton.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && dropdownMenu.classList.contains('show')) {
                e.preventDefault();
                toggleHamburgerMenu();
            }
        });
    }
    
    // Add active state management for buttons
    const buttons = document.querySelectorAll('.btn-step');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Add active class temporarily for visual feedback
            this.classList.add('active');
            setTimeout(() => {
                this.classList.remove('active');
            }, 200);
        });
    });
});

/**
 * Session storage utilities
 */
const SessionManager = {
    // Store step data
    setStepData: function(step, key, value) {
        sessionStorage.setItem(`step${step}_${key}`, value);
    },
    
    // Get step data
    getStepData: function(step, key) {
        return sessionStorage.getItem(`step${step}_${key}`);
    },
    
    // Clear step data
    clearStepData: function(step) {
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
            if (key.startsWith(`step${step}_`)) {
                sessionStorage.removeItem(key);
            }
        });
    },
    
    // Get all step data
    getAllStepData: function() {
        const data = {};
        for (let i = 1; i <= 4; i++) {
            data[`step${i}`] = {};
            const keys = Object.keys(sessionStorage);
            keys.forEach(key => {
                if (key.startsWith(`step${i}_`)) {
                    const dataKey = key.replace(`step${i}_`, '');
                    data[`step${i}`][dataKey] = sessionStorage.getItem(key);
                }
            });
        }
        return data;
    }
};

// Make functions globally available
window.toggleHamburgerMenu = toggleHamburgerMenu;
window.navigateToStep = navigateToStep;
window.goBack = goBack;
window.proceedToNext = proceedToNext;
window.SessionManager = SessionManager;
