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
    
    // Handle feature card navigation
    const featureCardLinks = document.querySelectorAll('.feature-card-link');
    featureCardLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetGuideId = this.getAttribute('data-guide');
            if (targetGuideId) {
                showGuide(targetGuideId);
                
                // Update URL without page reload
                history.pushState({guideId: targetGuideId}, '', '#' + targetGuideId);
                
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
            
            // Update URL without page reload
            history.pushState({guideId: null}, '', window.location.pathname);
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
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.guideId) {
            showGuide(event.state.guideId);
        } else {
            showMainContent();
        }
    });
    
    // Check if URL has a hash on page load
    if (window.location.hash) {
        const guideId = window.location.hash.substring(1);
        showGuide(guideId);
        
        // Add state to history
        history.replaceState({guideId: guideId}, '', window.location.hash);
    }
});
