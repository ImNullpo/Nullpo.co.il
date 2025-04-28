// Cross-browser support detection and polyfills
(function() {
    // Check for passive event support
    let supportsPassive = false;
    try {
        const opts = Object.defineProperty({}, 'passive', {
            get: function() {
                supportsPassive = true;
                return true;
            }
        });
        window.addEventListener("testPassive", null, opts);
        window.removeEventListener("testPassive", null, opts);
    } catch (e) {}

    // Event options with passive support when available
    window.eventOptions = supportsPassive ? { passive: true } : false;
    
    // Polyfill for Element.matches for older browsers
    if (!Element.prototype.matches) {
        Element.prototype.matches = 
            Element.prototype.msMatchesSelector || 
            Element.prototype.webkitMatchesSelector;
    }
    
    // Polyfill for Element.closest for older browsers
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(s) {
            let el = this;
            do {
                if (el.matches(s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }
})();

// Preloading functionality
document.addEventListener('DOMContentLoaded', function() {
    // Set dark mode as default immediately to prevent flashing
    document.body.classList.add('dark-mode');
    
    // Create preload overlay
    const preloadOverlay = document.createElement('div');
    preloadOverlay.className = 'preload-overlay';
    const spinner = document.createElement('div');
    spinner.className = 'preload-spinner';
    preloadOverlay.appendChild(spinner);
    document.body.appendChild(preloadOverlay);

    // Preload images
    const imagesToPreload = document.querySelectorAll('img');
    let imagesLoaded = 0;

    function imageLoaded() {
        imagesLoaded++;
        if (imagesLoaded === imagesToPreload.length) {
            finishPreloading();
        }
    }

    // If no images, still finish preloading after a short delay
    if (imagesToPreload.length === 0) {
        setTimeout(finishPreloading, 500);
    } else {
        imagesToPreload.forEach(img => {
            if (img.complete) {
                imageLoaded();
            } else {
                img.addEventListener('load', imageLoaded);
                img.addEventListener('error', imageLoaded);
            }
        });
    }

    function finishPreloading() {
        // Hide preloader
        setTimeout(() => {
            preloadOverlay.style.opacity = '0';
            preloadOverlay.style.visibility = 'hidden';
            
            // Initialize components with animation
            initializeDynamicElements();
            
            // Initialize mobile navigation
            initMobileNavigation();
            
            // Check if URL has a hash and navigate to that content
            if (window.location.hash) {
                const targetId = window.location.hash.substring(1);
                navigateToContent(targetId);
            }
            
            // Add touch classes for mobile-specific styling
            if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                document.body.classList.add('touch-device');
            }
            
            // Detect iOS for iOS-specific fixes
            if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
                document.body.classList.add('ios-device');
            }
            
            // Detect Android for Android-specific fixes
            if (/android/i.test(navigator.userAgent)) {
                document.body.classList.add('android-device');
            }
        }, 500);
    }

    // Theme switching functionality
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;
    
    // Force dark mode as default
    body.className = 'dark-mode';
    themeSwitch.checked = true;
    
    // Only use saved preference if it exists
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.className = savedTheme;
        themeSwitch.checked = savedTheme === 'dark-mode';
        // Ensure text visibility on load
        setTimeout(refreshTextVisibility, 100);
    } else {
        // If no saved preference, set dark mode as default
        localStorage.setItem('theme', 'dark-mode');
    }
    
    // Listen for system theme changes
    if (window.matchMedia) {
        const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (colorSchemeQuery.addEventListener) {
            colorSchemeQuery.addEventListener('change', function(e) {
                if (!localStorage.getItem('theme')) { // Only if user hasn't manually set preference
                    if (e.matches) {
                        body.className = 'dark-mode';
                        themeSwitch.checked = true;
                    } else {
                        body.className = 'light-mode';
                        themeSwitch.checked = false;
                    }
                    refreshTextVisibility();
                }
            });
        }
    }
    
    // Theme switch event listener
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            body.className = 'dark-mode';
            localStorage.setItem('theme', 'dark-mode');
        } else {
            body.className = 'light-mode';
            localStorage.setItem('theme', 'light-mode');
        }
        
        // Ensure text visibility by refreshing elements
        refreshTextVisibility();
    });
    
    // Function to ensure text visibility
    function refreshTextVisibility() {
        // Force reflow of text elements to ensure proper color inheritance
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li');
        textElements.forEach(el => {
            el.style.transition = 'none';
            el.style.color = ''; // Reset to inherit from parent
            setTimeout(() => {
                el.style.transition = '';
            }, 10);
        });
    }
    
    // Add touch events for mobile
    function addTouchSupport() {
        // Add active state for touch devices
        document.addEventListener('touchstart', function(e) {
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || 
                e.target.classList.contains('knowledge-item') || 
                e.target.classList.contains('connect-option')) {
                e.target.classList.add('touch-active');
            }
        }, window.eventOptions);
        
        document.addEventListener('touchend', function(e) {
            const activeElements = document.querySelectorAll('.touch-active');
            activeElements.forEach(el => el.classList.remove('touch-active'));
        }, window.eventOptions);
    }
    
    // Call touch support initialization
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        addTouchSupport();
    }
    
    // Handle iOS viewport height issues
    function fixIOSHeight() {
        // Fix for iOS 100vh issue
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            
            window.addEventListener('resize', () => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            }, window.eventOptions);
        }
    }
    
    // Call iOS height fix
    fixIOSHeight();
    
    // Dynamic elements loading with fallbacks for older browsers
    function initializeDynamicElements() {
        // Function to safely animate elements
        function safelyAnimateElement(element, index, animationType) {
            try {
                element.style.animationDelay = `${0.1 + (index * 0.1)}s`;
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                element.style.animation = `${animationType} 0.5s forwards`;
            } catch (e) {
                // Fallback for browsers that don't support animations
                element.style.opacity = '1';
                element.style.transform = 'none';
            }
        }
        
        // Safely animate knowledge items
        const knowledgeItems = document.querySelectorAll('.knowledge-item');
        knowledgeItems.forEach((item, index) => {
            safelyAnimateElement(item, index, 'fadeInUp');
        });
        
        // Safely animate connect options
        const connectOptions = document.querySelectorAll('.connect-option');
        connectOptions.forEach((option, index) => {
            safelyAnimateElement(option, index, 'fadeInUp');
        });
        
        // Safely animate skill tags
        const skillTags = document.querySelectorAll('.skill-tag');
        skillTags.forEach((tag, index) => {
            safelyAnimateElement(tag, index, 'fadeInUp');
        });
    }
    
    // Optimized search function for mobile performance
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const knowledgeItems = document.querySelectorAll('.knowledge-item');
    
    // Initialize search debounce timer
    let searchTimeout;
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // If search is empty, show all items
            knowledgeItems.forEach(item => {
                item.style.display = 'flex';
                
                // Re-animate the item appearance with performance optimization
                item.style.opacity = '0';
                requestAnimationFrame(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                    item.style.transition = 'opacity 0.3s, transform 0.3s';
                });
            });
            return;
        }
        
        // Filter items based on search term
        knowledgeItems.forEach(item => {
            const title = item.querySelector('h3').textContent.toLowerCase();
            const content = item.querySelector('p').textContent.toLowerCase();
            const tags = item.getAttribute('data-tags').toLowerCase();
            
            if (title.includes(searchTerm) || content.includes(searchTerm) || tags.includes(searchTerm)) {
                item.style.display = 'flex';
                
                // Animate the appearance of matching items with performance optimization
                item.style.opacity = '0';
                requestAnimationFrame(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                    item.style.transition = 'opacity 0.3s, transform 0.3s';
                });
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // Debounced search function
    function debouncedSearch() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 300);
    }
    
    // Search input event listeners
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        } else {
            debouncedSearch();
        }
    });
    
    // Search button click event
    searchButton.addEventListener('click', performSearch);
    
    // Keyboard shortcut for search (Ctrl + /)
    document.addEventListener('keydown', function(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === '/') {
            event.preventDefault();
            searchInput.focus();
        }
    });
    
    // Category filter tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all tabs
            tabButtons.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            
            // Show all items if 'all' category is selected
            if (category === 'all') {
                knowledgeItems.forEach(item => {
                    item.style.display = 'flex';
                    
                    // Animate appearance
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transition = 'opacity 0.3s';
                    }, 50);
                });
                return;
            }
            
            // Filter items based on category
            knowledgeItems.forEach(item => {
                const tags = item.getAttribute('data-tags').toLowerCase();
                
                if (tags.includes(category.toLowerCase())) {
                    item.style.display = 'flex';
                    
                    // Animate appearance
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transition = 'opacity 0.3s';
                    }, 50);
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Lazy load content as user scrolls
    const lazyLoadImages = () => {
        const imagesToLazyLoad = document.querySelectorAll('img[data-src]');
        
        imagesToLazyLoad.forEach(img => {
            if (isElementInViewport(img)) {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                img.classList.add('loaded');
            }
        });
    };
    
    // Check if element is in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // Add scroll event listener for lazy loading
    window.addEventListener('scroll', lazyLoadImages);
    window.addEventListener('resize', lazyLoadImages);
    
    // Initial lazy load check
    lazyLoadImages();
    
    // Single-page navigation
    const contentPagesSection = document.getElementById('content-pages');
    const knowledgeSection = document.getElementById('knowledge');
    const contentArticles = document.querySelectorAll('.content-article');
    const readMoreLinks = document.querySelectorAll('.read-more');
    const backButtons = document.querySelectorAll('.back-button');
    
    // Function to navigate to content
    function navigateToContent(targetId) {
        // Check if target exists
        const targetArticle = document.getElementById(targetId);
        if (!targetArticle) return;
        
        // Hide knowledge section with animation
        knowledgeSection.style.display = 'none';
        
        // Show content pages section
        contentPagesSection.style.display = 'block';
        
        // Hide all articles first
        contentArticles.forEach(article => {
            article.classList.remove('active');
        });
        
        // Show target article
        targetArticle.classList.add('active');
        
        // Update URL hash for direct linking
        window.location.hash = targetId;
        
        // Scroll to top of article
        window.scrollTo({
            top: contentPagesSection.offsetTop - 70,
            behavior: 'smooth'
        });
    }
    
    // Function to navigate back to knowledge base
    function navigateBack() {
        // Hide content pages with animation
        contentPagesSection.style.display = 'none';
        
        // Show knowledge section
        knowledgeSection.style.display = 'block';
        
        // Clear URL hash
        history.pushState("", document.title, window.location.pathname + window.location.search);
        
        // Scroll to knowledge section
        window.scrollTo({
            top: knowledgeSection.offsetTop - 70,
            behavior: 'smooth'
        });
    }
    
    // Add click event listeners to read more links
    readMoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            navigateToContent(targetId);
        });
    });
    
    // Add click event listeners to back buttons
    backButtons.forEach(button => {
        button.addEventListener('click', navigateBack);
    });
    
    // Handle browser back button
    window.addEventListener('popstate', function(e) {
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1);
            navigateToContent(targetId);
        } else {
            navigateBack();
        }
    });

    // Add mobile navigation functionality
    function initMobileNavigation() {
        const mobileNavButton = document.getElementById('mobile-nav-button');
        const mobileNav = document.getElementById('mobile-nav');
        
        if (!mobileNavButton || !mobileNav) return;
        
        // Toggle mobile nav on button click
        mobileNavButton.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
        });
        
        // Hide mobile nav when clicking elsewhere
        document.addEventListener('click', function(event) {
            if (!mobileNav.contains(event.target) && !mobileNavButton.contains(event.target)) {
                mobileNav.classList.remove('active');
            }
        });
        
        // Hide mobile nav when clicking on a nav item
        const mobileNavItems = mobileNav.querySelectorAll('.mobile-nav-item');
        mobileNavItems.forEach(item => {
            item.addEventListener('click', function() {
                mobileNav.classList.remove('active');
                
                // Smooth scroll to section
                const targetId = this.getAttribute('href');
                if (targetId.startsWith('#')) {
                    const targetSection = document.querySelector(targetId);
                    if (targetSection) {
                        event.preventDefault();
                        window.scrollTo({
                            top: targetSection.offsetTop - 70,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
        
        // Show/hide mobile nav button based on scroll position
        let lastScrollTop = 0;
        window.addEventListener('scroll', function() {
            const st = window.pageYOffset || document.documentElement.scrollTop;
            if (st > lastScrollTop && st > 300) {
                // Scrolling down and past hero section - hide button
                mobileNavButton.style.transform = 'translateY(70px)';
                mobileNavButton.style.opacity = '0';
                mobileNav.classList.remove('active');
            } else {
                // Scrolling up or near top - show button
                mobileNavButton.style.transform = 'translateY(0)';
                mobileNavButton.style.opacity = '1';
            }
            
            // Update last scroll position
            lastScrollTop = st <= 0 ? 0 : st;
        }, window.eventOptions);
    }

    // Call after DOM is loaded
    initMobileNavigation();

    // Add this to your existing DOMContentLoaded event handler
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const body = document.body;
            if (body.classList.contains('dark-mode')) {
                body.className = 'light-mode';
                localStorage.setItem('theme', 'light-mode');
            } else {
                body.className = 'dark-mode';
                localStorage.setItem('theme', 'dark-mode');
            }
            refreshTextVisibility();
        });
    }
});
