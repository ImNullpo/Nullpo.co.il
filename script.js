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
    
    // Initialize animation properties - UPDATED FOR FASTER LOADING
    featureCards.forEach((card, index) => {
        // Keep the hover effects
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
        
        // Set up animation on scroll with faster timing
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)'; // Reduced distance
        card.style.transition = 'opacity 0.4s ease, transform 0.5s ease'; // Explicit transition
        card.style.transitionDelay = `${index * 0.05}s`; // Reduced stagger time
    });
    
    // Create intersection observer for animation on scroll - IMPROVED VERSION
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Use setTimeout with minimal delay to make animations smoother
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 10);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05, // Lower threshold to trigger earlier
        rootMargin: '0px 0px -10% 0px' // Start animation before completely in view
    });
    
    // Observe all feature cards
    featureCards.forEach(card => {
        observer.observe(card);
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
            
            // Initialize guide navigation if not already done
            initializeGuideNavigation();
            
            // Add section navigation
            addSectionNavigation();
            
            // Add back to top button
            addBackToTopButton();
            
            // Activate the first section by default
            const firstSection = targetGuide.querySelector('.guide-section');
            if (firstSection) {
                targetGuide.querySelectorAll('.guide-section').forEach(section => {
                    section.classList.remove('active-section');
                });
                firstSection.classList.add('active-section');
                
                // Update active menu item
                targetGuide.querySelectorAll('.guide-menu-link').forEach(link => {
                    link.classList.remove('active');
                });
                const firstMenuItem = targetGuide.querySelector('.guide-menu-link');
                if (firstMenuItem) {
                    firstMenuItem.classList.add('active');
                }
            }
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
        
        // Remove back to top button
        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) {
            backToTop.remove();
        }
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
    
    // Handle back/forward navigation using keyboard or context menu
    document.addEventListener('keydown', function(e) {
        // Skip if user is typing in an input field or textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        // Existing Escape key binding for guide exit
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
        
        // Navigation shortcuts
        
        // "G" or "Home" - Go to main page
        if ((e.key === 'g' || e.key === 'G' || e.key === 'Home') && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            showMainContent();
            currentView = {
                isGuide: false,
                guideId: null
            };
            localStorage.setItem('currentView', JSON.stringify(currentView));
            window.scrollTo(0, 0);
        }
        
        // "T" - Toggle theme
        if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const themeToggle = document.querySelector('.theme-toggle');
            if (themeToggle) themeToggle.click();
        }
        
        // "/" - Focus search (similar to GitHub, Google, etc.)
        if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) searchInput.focus();
        }
        
        // "?" - Show keyboard shortcuts help
        if (e.key === '?') {
            e.preventDefault();
            showKeyboardShortcutsHelp();
        }
        
        // J/K - Scroll down/up (inspired by Vim, Reddit, Twitter)
        if (e.key === 'j' || e.key === 'J') {
            e.preventDefault();
            window.scrollBy(0, 100);
        }
        if (e.key === 'k' || e.key === 'K') {
            e.preventDefault();
            window.scrollBy(0, -100);
        }
        
        // Number keys (1-9) to navigate to guides
        if (!e.ctrlKey && !e.metaKey && !e.altKey && /^[1-9]$/.test(e.key)) {
            const guideIndex = parseInt(e.key) - 1;
            const guideLinks = document.querySelectorAll('.feature-card-link[data-guide]');
            if (guideLinks.length > guideIndex) {
                e.preventDefault();
                const targetGuide = guideLinks[guideIndex].getAttribute('data-guide');
                showGuide(targetGuide);
                currentView = {
                    isGuide: true,
                    guideId: targetGuide
                };
                localStorage.setItem('currentView', JSON.stringify(currentView));
                window.scrollTo(0, 0);
            }
        }
        
        // Space - Page down 
        if (e.key === ' ' && !e.shiftKey) {
            // Prevent default only if not in an editable element
            if (!(e.target.isContentEditable || 
                  e.target.tagName === 'INPUT' || 
                  e.target.tagName === 'TEXTAREA' || 
                  e.target.tagName === 'SELECT')) {
                e.preventDefault();
                // Scroll by a fixed amount - 80% of viewport height
                const scrollAmount = Math.floor(window.innerHeight * 0.8);
                window.scrollBy({
                    top: scrollAmount,
                    left: 0,
                    behavior: 'smooth'
                });
            }
        }
        
        // Shift+Space - Page up (fixed to be consistent)
        if (e.key === ' ' && e.shiftKey) {
            // Prevent default regardless of target to make it more reliable
            e.preventDefault();
            // Scroll by the same fixed amount as page down, but negative
            const scrollAmount = Math.floor(window.innerHeight * 0.8);
            window.scrollBy({
                top: -scrollAmount, 
                left: 0,
                behavior: 'smooth'
            });
        }
        
        // F - Toggle fullscreen mode
        if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
        }
        
        // R - Refresh content without page reload
        if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            refreshContent();
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

    // On page load, reset view state and scroll to top
    window.addEventListener('load', function() {
        // Reset to main page view
        showMainContent();
        
        // Reset view state
        currentView = {
            isGuide: false,
            guideId: null
        };
        
        // Clear saved view state
        localStorage.removeItem('currentView');
        localStorage.removeItem('lastScrollPosition');
        localStorage.removeItem('guideScrollPositions');
        
        // Force scroll to top
        window.scrollTo(0, 0);

        // Add this new section to trigger initial animation for cards in view on page load
        // This will make cards visible immediately if they're in the viewport on load
        setTimeout(() => {
            const cards = document.querySelectorAll('.feature-card');
            cards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                const isInView = rect.top < window.innerHeight && rect.bottom >= 0;
                
                if (isInView) {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }
            });
        }, 100); // Small delay to ensure DOM is completely ready
    });

    // Add the background dots
    createBackgroundDots();
});

// Function to display keyboard shortcuts help modal
function showKeyboardShortcutsHelp() {
    // Create the modal if it doesn't exist
    let modal = document.getElementById('keyboard-shortcuts-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'keyboard-shortcuts-modal';
        modal.className = 'shortcuts-modal';
        
        const modalContent = `
            <div class="shortcuts-modal-content">
                <div class="shortcuts-header">
                    <h2>Keyboard Shortcuts</h2>
                    <button class="close-modal">×</button>
                </div>
                <div class="shortcuts-body">
                    <div class="shortcuts-section">
                        <h3>Navigation</h3>
                        <div class="shortcut-row">
                            <span class="shortcut-key">G</span>
                            <span class="shortcut-desc">Go to main page</span>
                        </div>
                        <div class="shortcut-row">
                            <span class="shortcut-key">Esc</span>
                            <span class="shortcut-desc">Exit current guide</span>
                        </div>
                        <div class="shortcut-row">
                            <span class="shortcut-key">1-9</span>
                            <span class="shortcut-desc">Go to guide 1-9</span>
                        </div>
                        <div class="shortcut-row">
                            <span class="shortcut-key">J/K</span>
                            <span class="shortcut-desc">Scroll down/up</span>
                        </div>
                        <div class="shortcut-row">
                            <span class="shortcut-key">Space</span>
                            <span class="shortcut-desc">Page down</span>
                        </div>
                        <div class="shortcut-row">
                            <span class="shortcut-key">Shift+Space</span>
                            <span class="shortcut-desc">Page up</span>
                        </div>
                        <div class="shortcut-row">
                            <span class="shortcut-key">←/→</span>
                            <span class="shortcut-desc">Previous/Next guide section</span>
                        </div>
                    </div>
                    <div class="shortcuts-section">
                        <h3>Features</h3>
                        <div class="shortcut-row">
                            <span class="shortcut-key">/</span>
                            <span class="shortcut-desc">Focus search</span>
                        </div>
                        <div class="shortcut-row">
                            <span class="shortcut-key">Ctrl+/</span>
                            <span class="shortcut-desc">Focus search (alternative)</span>
                        </div>
                        <div class="shortcut-row">
                            <span class="shortcut-key">T</span>
                            <span class="shortcut-desc">Toggle dark/light theme</span>
                        </div>
                        <div class="shortcut-row">
                            <span class="shortcut-key">F</span>
                            <span class="shortcut-desc">Toggle fullscreen</span>
                        </div>
                        <div class="shortcut-row">
                            <span class="shortcut-key">R</span>
                            <span class="shortcut-desc">Refresh content</span>
                        </div>
                        <div class="shortcut-row">
                            <span class="shortcut-key">?</span>
                            <span class="shortcut-desc">Show keyboard shortcuts</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
        
        // Add event listener to close button
        const closeButton = modal.querySelector('.close-modal');
        closeButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // Add styles for the modal
        const style = document.createElement('style');
        style.textContent = `
            .shortcuts-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 2000;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .shortcuts-modal-content {
                background-color: var(--bg-card);
                border-radius: 8px;
                max-width: 600px;
                width: 90%;
                max-height: 85vh;
                overflow-y: auto;
                box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
            }
            
            .shortcuts-header {
                padding: 16px 24px;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .shortcuts-header h2 {
                margin: 0;
                color: var(--text-primary);
            }
            
            .close-modal {
                background: transparent;
                border: none;
                color: var(--text-secondary);
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
            }
            
            .close-modal:hover {
                background-color: var(--hover-bg);
                color: var(--accent);
            }
            
            .shortcuts-body {
                padding: 24px;
            }
            
            .shortcuts-section {
                margin-bottom: 24px;
            }
            
            .shortcuts-section h3 {
                margin: 0 0 16px 0;
                color: var(--accent);
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 8px;
            }
            
            .shortcut-row {
                display: flex;
                margin-bottom: 12px;
                padding-bottom: 12px;
                border-bottom: 1px solid var(--border-color);
            }
            
            .shortcut-row:last-child {
                border-bottom: none;
            }
            
            .shortcut-key {
                background-color: var(--hover-bg);
                color: var(--accent);
                padding: 4px 8px;
                border-radius: 4px;
                font-family: monospace;
                font-weight: bold;
                min-width: 100px;
                text-align: center;
                margin-right: 16px;
                border: 1px solid var(--border-color);
            }
            
            .shortcut-desc {
                flex: 1;
                color: var(--text-primary);
            }
            
            @media (max-width: 600px) {
                .shortcuts-modal-content {
                    width: 95%;
                }
                
                .shortcut-row {
                    flex-direction: column;
                }
                
                .shortcut-key {
                    margin-bottom: 8px;
                    margin-right: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Show the modal
    modal.style.display = 'flex';
    
    // Allow closing by clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Allow closing with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
            e.stopPropagation(); // Prevent other Escape handlers
        }
    });
}

// Function to toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Function to refresh content
function refreshContent() {
    // Reset to main page view
    showMainContent();
    
    // Reset view state
    currentView = {
        isGuide: false,
        guideId: null
    };
    
    // Clear saved view state
    localStorage.removeItem('currentView');
    localStorage.removeItem('lastScrollPosition');
    localStorage.removeItem('guideScrollPositions');
    
    // Force scroll to top
    window.scrollTo(0, 0);
    
    // Show a little notification that content was refreshed
    const notification = document.createElement('div');
    notification.textContent = 'Content refreshed';
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--accent);
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 1000;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s, transform 0.3s;
    `;
    document.body.appendChild(notification);
    
    // Show the notification
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove the notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Add this function to create and handle guide navigation
function initializeGuideNavigation() {
    // Find all guides
    const guides = document.querySelectorAll('.guide-content');
    
    guides.forEach(guide => {
        const guideId = guide.id;
        const guideSections = guide.querySelectorAll('.guide-section');
        
        // Skip if this guide has already been initialized
        if (guide.querySelector('.guide-sidebar')) return;
        
        // Create sidebar menu container
        const sidebar = document.createElement('div');
        sidebar.className = 'guide-sidebar';
        
        // Create menu title
        const menuTitle = document.createElement('div');
        menuTitle.className = 'guide-menu-title';
        menuTitle.textContent = guide.querySelector('.guide-title').textContent;
        sidebar.appendChild(menuTitle);
        
        // Create menu container
        const menu = document.createElement('ul');
        menu.className = 'guide-menu';
        
        // Create menu items from guide sections
        guideSections.forEach((section, index) => {
            // Get the section heading or create a default one
            const sectionTitle = section.querySelector('h2')?.textContent || `Section ${index + 1}`;
            
            // Create section ID if it doesn't exist
            if (!section.id) {
                section.id = `${guideId}-section-${index}`;
            }
            
            // Create menu item
            const menuItem = document.createElement('li');
            menuItem.className = 'guide-menu-item';
            
            const menuLink = document.createElement('a');
            menuLink.href = `#${section.id}`;
            menuLink.className = 'guide-menu-link';
            menuLink.textContent = sectionTitle;
            menuLink.setAttribute('data-section', section.id);
            
            // Add click handler
            menuLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Hide all sections
                guideSections.forEach(s => s.classList.remove('active-section'));
                
                // Show selected section
                section.classList.add('active-section');
                
                // Update active menu item
                guide.querySelectorAll('.guide-menu-link').forEach(link => {
                    link.classList.remove('active');
                });
                menuLink.classList.add('active');
                
                // Scroll to the beginning of the section - modified to scroll to section
                // rather than changing the scrollTop of a separate container
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            
            menuItem.appendChild(menuLink);
            menu.appendChild(menuItem);
        });
        
        sidebar.appendChild(menu);
        
        // Restructure guide content
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'guide-content-wrapper';
        
        // Move guide header outside the wrapper so it stays consistent
        const guideHeader = guide.querySelector('.guide-header');
        
        // Create guide layout container
        const guideLayout = document.createElement('div');
        guideLayout.className = 'guide-layout';
        
        // Initialize sections (hide all except the first one)
        guideSections.forEach((section, index) => {
            if (index === 0) {
                section.classList.add('active-section');
                // Activate the first menu item
                menu.querySelector('li:first-child .guide-menu-link').classList.add('active');
            } else {
                section.classList.remove('active-section');
            }
        });
        
        // Rearrange DOM
        guide.insertBefore(guideLayout, guideHeader.nextSibling);
        guideLayout.appendChild(sidebar);
        guideLayout.appendChild(contentWrapper);
        
        // Move all content sections into the wrapper
        guideSections.forEach(section => {
            contentWrapper.appendChild(section);
        });
    });
}

// Add keyboard navigation for menu
document.addEventListener('keydown', function(e) {
    // Skip if user is typing in an input field or textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    if (currentView.isGuide) {
        // Left arrow - previous menu item
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const activeGuide = document.querySelector('.guide-content.active');
            const activeMenuItem = activeGuide.querySelector('.guide-menu-link.active');
            const menuItems = activeGuide.querySelectorAll('.guide-menu-link');
            const menuItemsArray = Array.from(menuItems);
            const currentIndex = menuItemsArray.indexOf(activeMenuItem);
            
            if (currentIndex > 0) {
                menuItemsArray[currentIndex - 1].click();
            }
        }
        
        // Right arrow - next menu item
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            const activeGuide = document.querySelector('.guide-content.active');
            const activeMenuItem = activeGuide.querySelector('.guide-menu-link.active');
            const menuItems = activeGuide.querySelectorAll('.guide-menu-link');
            const menuItemsArray = Array.from(menuItems);
            const currentIndex = menuItemsArray.indexOf(activeMenuItem);
            
            if (currentIndex < menuItemsArray.length - 1) {
                menuItemsArray[currentIndex + 1].click();
            }
        }
    }
});

// Function to add previous/next navigation to sections
function addSectionNavigation() {
    const activeGuide = document.querySelector('.guide-content.active');
    if (!activeGuide) return;
    
    const sections = activeGuide.querySelectorAll('.guide-section');
    const guideId = activeGuide.id;
    
    // Remove any existing navigation
    activeGuide.querySelectorAll('.section-navigation').forEach(nav => nav.remove());
    
    sections.forEach((section, index) => {
        const navigation = document.createElement('div');
        navigation.className = 'section-navigation';
        
        // Add previous button if not the first section
        if (index > 0) {
            const prevSection = sections[index - 1];
            const prevButton = document.createElement('a');
            prevButton.href = `#${prevSection.id}`;
            prevButton.className = 'prev-section';
            
            const prevTitle = prevSection.querySelector('h2')?.textContent || 'Previous';
            prevButton.innerHTML = `<i class="fas fa-arrow-left"></i> ${prevTitle}`;
            
            prevButton.addEventListener('click', function(e) {
                e.preventDefault();
                scrollToSection(prevSection.id, guideId);
            });
            
            navigation.appendChild(prevButton);
        } else {
            // Empty div to maintain spacing with flexbox
            const spacer = document.createElement('div');
            navigation.appendChild(spacer);
        }
        
        // Add next button if not the last section
        if (index < sections.length - 1) {
            const nextSection = sections[index + 1];
            const nextButton = document.createElement('a');
            nextButton.href = `#${nextSection.id}`;
            nextButton.className = 'next-section';
            
            const nextTitle = nextSection.querySelector('h2')?.textContent || 'Next';
            nextButton.innerHTML = `${nextTitle} <i class="fas fa-arrow-right"></i>`;
            
            nextButton.addEventListener('click', function(e) {
                e.preventDefault();
                scrollToSection(nextSection.id, guideId);
            });
            
            navigation.appendChild(nextButton);
        }
        
        // Append navigation to section
        section.appendChild(navigation);
    });
}

// Add this function to help with scrolling to sections
function scrollToSection(sectionId, guideId) {
    const guide = document.getElementById(guideId);
    if (!guide) return;
    
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // Hide all sections
    guide.querySelectorAll('.guide-section').forEach(s => {
        s.classList.remove('active-section');
    });
    
    // Show the target section
    section.classList.add('active-section');
    
    // Update active menu item
    guide.querySelectorAll('.guide-menu-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const menuLink = guide.querySelector(`.guide-menu-link[data-section="${sectionId}"]`);
    if (menuLink) {
        menuLink.classList.add('active');
    }
    
    // Scroll to the section with offset to account for fixed header
    const headerOffset = 80; // Adjust based on your header height
    const elementPosition = section.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// Add a back to top button
function addBackToTopButton() {
    // Remove any existing button
    const existingButton = document.querySelector('.back-to-top');
    if (existingButton) {
        existingButton.remove();
    }
    
    // Create the button
    const backToTop = document.createElement('div');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(backToTop);
    
    // Add click handler
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Show/hide the button based on scroll position
    function toggleBackToTopButton() {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', toggleBackToTopButton);
    
    // Initial check
    toggleBackToTopButton();
}

// Add function to create background dots
function createBackgroundDots() {
    // Check if dots already exist
    if (document.querySelector('.background-dots')) return;
    
    // Create container for dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'background-dots';
    
    // Create dot elements
    const dot1 = document.createElement('div');
    dot1.className = 'dot dot-1';
    
    const dot2 = document.createElement('div');
    dot2.className = 'dot dot-2';
    
    const dot3 = document.createElement('div');
    dot3.className = 'dot dot-3';
    
    // Add dots to container
    dotsContainer.appendChild(dot1);
    dotsContainer.appendChild(dot2);
    dotsContainer.appendChild(dot3);
    
    // Add to main content
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.style.position = 'relative';
        mainContent.appendChild(dotsContainer);
    }
}
