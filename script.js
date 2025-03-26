document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    
    // Modified theme initialization (don't set initial theme here as it's already set)
    function initializeTheme() {
        // Only update the icon, not the theme itself (already set in <head>)
        updateThemeIcon('dark');
    }

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    // Initialize theme (only icon)
    initializeTheme();

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    
    // Keyboard shortcut for search
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
    });

    // Feature card hover effects
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.feature-icon i');
            if (icon) {
                icon.style.transform = 'scale(1.2) translateY(-2px)';
                icon.style.color = 'var(--accent-light)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.feature-icon i');
            if (icon) {
                icon.style.transform = '';
                icon.style.color = '';
            }
        });
    });
  
    // Social button tooltips
    const socialButtons = document.querySelectorAll('.social-button');
    socialButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            const tooltip = this.querySelector('.tooltip');
            if (tooltip) {
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            const tooltip = this.querySelector('.tooltip');
            if (tooltip) {
                tooltip.style.opacity = '0';
                tooltip.style.visibility = 'hidden';
            }
        });
    });
    
    // Page navigation system
    const mainContent = document.getElementById('mainContent');
    const guideContents = document.querySelectorAll('.guide-content');
    
    // Track current view state without changing URL
    let currentView = {
        isGuide: false,
        guideId: null
    };
    
    // Add this near the top of your script.js file, before the navigation handlers
    let lastScrollPosition = 0;
    // Add this to track guide scroll positions separately
    let guideScrollPositions = {};
    
    // Modify the feature card link handler to save scroll position before navigating to a guide
    const featureCardLinks = document.querySelectorAll('.feature-card-link');
    featureCardLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetGuideId = this.getAttribute('data-guide');
            if (targetGuideId) {
                // Save current scroll position before showing the guide
                lastScrollPosition = window.scrollY;
                
                showGuide(targetGuideId);
                
                // Store state in memory without changing URL
                currentView = {
                    isGuide: true,
                    guideId: targetGuideId
                };
                
                // Save the scroll position along with view state
                localStorage.setItem('currentView', JSON.stringify(currentView));
                localStorage.setItem('lastScrollPosition', lastScrollPosition);
                
                // We still scroll to top for guides
                window.scrollTo(0, 0);
            }
        });
    });
    
    // Modify the back link handler to restore scroll position
    const backLinks = document.querySelectorAll('.back-to-main');
    backLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Save current guide scroll position before going back
            if (currentView.isGuide && currentView.guideId) {
                guideScrollPositions[currentView.guideId] = window.scrollY;
                localStorage.setItem('guideScrollPositions', JSON.stringify(guideScrollPositions));
            }
            
            showMainContent();
            
            // Update state without changing URL
            currentView = {
                isGuide: false,
                guideId: null
            };
            
            // Update localStorage
            localStorage.setItem('currentView', JSON.stringify(currentView));
            
            // Restore last scroll position instead of going to top
            setTimeout(() => {
                window.scrollTo(0, lastScrollPosition);
            }, 10);
        });
    });
    
    // Show a specific guide and hide main content
    function showGuide(guideId) {
        // Hide main content
        mainContent.classList.add('hidden');
        
        // Hide all guides
        guideContents.forEach(guide => {
            guide.classList.remove('active');
        });
        
        // Show the target guide
        const targetGuide = document.getElementById(guideId);
        if (targetGuide) {
            targetGuide.classList.add('active');
        }
    }
    
    // Show main content and hide all guides
    function showMainContent() {
        // Show main content
        mainContent.classList.remove('hidden');
        
        // Hide all guides
        guideContents.forEach(guide => {
            guide.classList.remove('active');
        });
    }
    
    // Handle browser back button - intercept and use our own navigation
    window.addEventListener('popstate', function(event) {
        // Save current guide scroll position before going back
        if (currentView.isGuide && currentView.guideId) {
            guideScrollPositions[currentView.guideId] = window.scrollY;
            localStorage.setItem('guideScrollPositions', JSON.stringify(guideScrollPositions));
        }
        
        // Always return to main content when back button is pressed
        showMainContent();
        
        // Update current view state
        currentView = {
            isGuide: false,
            guideId: null
        };
        
        localStorage.setItem('currentView', JSON.stringify(currentView));
    });
    
    // Add this function to track scroll position in guides
    window.addEventListener('scroll', function() {
        // If we're in a guide, store its scroll position
        if (currentView.isGuide && currentView.guideId) {
            guideScrollPositions[currentView.guideId] = window.scrollY;
            localStorage.setItem('guideScrollPositions', JSON.stringify(guideScrollPositions));
        } else {
            // If we're on main page, store that scroll position
            lastScrollPosition = window.scrollY;
            localStorage.setItem('lastScrollPosition', lastScrollPosition);
        }
    });
    
    // Update the page load state restoration
    // Try to load saved guide scroll positions
    const savedGuideScrollPositions = localStorage.getItem('guideScrollPositions');
    if (savedGuideScrollPositions) {
        try {
            guideScrollPositions = JSON.parse(savedGuideScrollPositions);
        } catch (e) {
            console.error('Error parsing saved guide scroll positions:', e);
            guideScrollPositions = {};
        }
    }
    
    // Check if we should restore a previous view on page load
    const savedView = localStorage.getItem('currentView');
    if (savedView) {
        try {
            const viewState = JSON.parse(savedView);
            if (viewState.isGuide && viewState.guideId) {
                showGuide(viewState.guideId);
                currentView = viewState;
                
                // Restore scroll position for this guide
                setTimeout(() => {
                    const guideScrollPos = guideScrollPositions[viewState.guideId] || 0;
                    window.scrollTo(0, guideScrollPos);
                }, 100);
            } else {
                // Main content is showing, maybe restore scroll
                const savedScrollPosition = localStorage.getItem('lastScrollPosition');
                if (savedScrollPosition) {
                    lastScrollPosition = parseInt(savedScrollPosition);
                    setTimeout(() => {
                        window.scrollTo(0, lastScrollPosition);
                    }, 100);
                } else {
                    // If no saved position for main content, go to top
                    window.scrollTo(0, 0);
                }
            }
        } catch (e) {
            console.error('Error parsing saved view state:', e);
        }
    } else {
        // No saved state, ensure we scroll to top on initial page load
        window.scrollTo(0, 0);
    }

    // Handle back/forward navigation using keyboard or context menu
    document.addEventListener('keydown', function(e) {
        // Add Escape key to return to main page from any guide
        if (e.key === 'Escape' && currentView.isGuide) {
            // Save current guide scroll position before going back
            if (currentView.guideId) {
                guideScrollPositions[currentView.guideId] = window.scrollY;
                localStorage.setItem('guideScrollPositions', JSON.stringify(guideScrollPositions));
            }
            
            showMainContent();
            currentView = {
                isGuide: false,
                guideId: null
            };
            localStorage.setItem('currentView', JSON.stringify(currentView));
            
            // Restore last scroll position on main content
            setTimeout(() => {
                window.scrollTo(0, lastScrollPosition);
            }, 10);
        }
    });

    // Fix for specific guides that might not be working
    const guideIds = ['policy-guide', 'reporting-guide'];
    guideIds.forEach(guideId => {
        const guideElement = document.getElementById(guideId);
        if (guideElement) {
            // Make sure the guide is properly initialized
            guideElement.classList.add('guide-content');
            guideElement.classList.remove('active');
            
            // Find any links pointing to this guide and ensure they have the right attribute
            const links = document.querySelectorAll(`[data-guide="${guideId}"]`);
            links.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    showGuide(guideId);
                    
                    // Update view state
                    currentView = {
                        isGuide: true,
                        guideId: guideId
                    };
                    
                    localStorage.setItem('currentView', JSON.stringify(currentView));
                    window.scrollTo(0, 0);
                });
            });
        }
    });

    // Debug policy guide specifically
    console.log('Available guides:', document.querySelectorAll('.guide-content').length);
    console.log('Policy guide exists:', document.getElementById('policy-guide') !== null);
    const policyLinks = document.querySelectorAll('[data-guide="policy-guide"]');
    console.log('Policy links count:', policyLinks.length);

    // Extra handling for policy guide
    if (document.getElementById('policy-guide')) {
        console.log('Policy guide found in DOM');
        
        // Force the policy guide to be registered
        const policyGuide = document.getElementById('policy-guide');
        policyGuide.classList.add('guide-content');
        
        // Log when policy guide is clicked
        policyLinks.forEach(link => {
            link.addEventListener('click', function() {
                console.log('Policy link clicked');
            });
        });
    }

    // Update the logo click handler
    const logoLink = document.querySelector('.logo');
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Save current guide scroll position if in a guide
            if (currentView.isGuide && currentView.guideId) {
                guideScrollPositions[currentView.guideId] = window.scrollY;
                localStorage.setItem('guideScrollPositions', JSON.stringify(guideScrollPositions));
            }
            
            showMainContent();
            
            // Update state without changing URL
            currentView = {
                isGuide: false,
                guideId: null
            };
            
            // Update localStorage
            localStorage.setItem('currentView', JSON.stringify(currentView));
            
            // Restore last scroll position instead of going to top
            setTimeout(() => {
                window.scrollTo(0, lastScrollPosition);
            }, 10);
        });
    }

    // On page load, restore the saved scroll position if available
    // Check for saved scroll position
    const savedScrollPosition = localStorage.getItem('lastScrollPosition');
    if (savedScrollPosition && !currentView.isGuide) {
        setTimeout(() => {
            window.scrollTo(0, parseInt(savedScrollPosition));
        }, 100);
    }
});
