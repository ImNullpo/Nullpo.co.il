document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    
    // Set initial theme to dark mode
    function initializeTheme() {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
        localStorage.setItem('theme', 'dark');
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

    // Initialize theme
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
    
    // Handle feature card navigation
    const featureCardLinks = document.querySelectorAll('.feature-card-link');
    featureCardLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetGuideId = this.getAttribute('data-guide');
            if (targetGuideId) {
                showGuide(targetGuideId);
                
                // Store state in memory without changing URL
                currentView = {
                    isGuide: true,
                    guideId: targetGuideId
                };
                
                // Optionally save to localStorage for persistence across page refreshes
                localStorage.setItem('currentView', JSON.stringify(currentView));
                
                // Scroll to top
                window.scrollTo(0, 0);
            }
        });
    });
    
    // Handle back navigation to main page
    const backLinks = document.querySelectorAll('.back-to-main');
    backLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showMainContent();
            
            // Update state without changing URL
            currentView = {
                isGuide: false,
                guideId: null
            };
            
            // Update localStorage
            localStorage.setItem('currentView', JSON.stringify(currentView));
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
        // Always return to main content when back button is pressed
        showMainContent();
        
        // Update current view state
        currentView = {
            isGuide: false,
            guideId: null
        };
        
        localStorage.setItem('currentView', JSON.stringify(currentView));
    });
    
    // Check if we should restore a previous view on page load
    const savedView = localStorage.getItem('currentView');
    if (savedView) {
        try {
            const viewState = JSON.parse(savedView);
            if (viewState.isGuide && viewState.guideId) {
                showGuide(viewState.guideId);
                currentView = viewState;
            }
        } catch (e) {
            console.error('Error parsing saved view state:', e);
        }
    }

    // Handle back/forward navigation using keyboard or context menu
    document.addEventListener('keydown', function(e) {
        // Add Escape key to return to main page from any guide
        if (e.key === 'Escape' && currentView.isGuide) {
            showMainContent();
            currentView = {
                isGuide: false,
                guideId: null
            };
            localStorage.setItem('currentView', JSON.stringify(currentView));
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
});
