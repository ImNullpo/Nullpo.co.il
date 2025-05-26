document.addEventListener('DOMContentLoaded', function() {
    // Set copyright year
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Dark/Light Mode Toggle
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const htmlElement = document.documentElement;
    const moonIcon = '<i class="fas fa-moon"></i>';
    const sunIcon = '<i class="fas fa-sun"></i>';
    
    themeToggleBtn.addEventListener('click', function() {
        if (htmlElement.classList.contains('dark-mode')) {
            htmlElement.classList.replace('dark-mode', 'light-mode');
            themeToggleBtn.innerHTML = moonIcon;
        } else {
            htmlElement.classList.replace('light-mode', 'dark-mode');
            themeToggleBtn.innerHTML = sunIcon;
        }
    });
    
    // Default to dark mode (already set in HTML class="dark-mode")
    // Just make sure the correct icon is shown
    themeToggleBtn.innerHTML = sunIcon;
    
    // Home button functionality
    document.getElementById('home-button').addEventListener('click', function(e) {
        e.preventDefault();
        
        // Show all main sections
        document.getElementById('hero').style.display = 'block';
        document.getElementById('about').style.display = 'block';
        document.getElementById('knowledge-base').style.display = 'block';
        
        // Hide article container if visible
        document.getElementById('article-container').classList.add('hidden');
        
        // Hide all EDR content sections initially
        const edrContents = document.querySelectorAll('.edr-content');
        edrContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all EDR buttons
        const edrBtns = document.querySelectorAll('.edr-btn');
        edrBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Scroll to top
        window.scrollTo(0, 0);
    });
    
    // Knowledge Base Tab Navigation
    const kbTabs = document.querySelectorAll('.kb-tab');
    const kbContents = document.querySelectorAll('.kb-tab-content');
    
    kbTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            kbTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            kbContents.forEach(content => content.classList.remove('active'));
            
            // Show the corresponding tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Read More Button Functionality
    const readMoreBtns = document.querySelectorAll('.read-more-btn');
    const articleContainer = document.getElementById('article-container');
    const articleContent = document.getElementById('article-content');
    const knowledgeBase = document.getElementById('knowledge-base');
    const hero = document.getElementById('hero');
    const about = document.getElementById('about');
    const inProgress = document.getElementById('in-progress');
    
    // Back to Knowledge Base button
    document.getElementById('back-to-kb').addEventListener('click', function() {
        showHome();
    });
    
    function showHome() {
        articleContainer.classList.add('hidden');
        knowledgeBase.style.display = 'block';
        hero.style.display = 'block';
        about.style.display = 'block';
        inProgress.style.display = 'block';
    }
    
    function showArticle(articleId) {
        // Load article content based on articleId
        articleContent.innerHTML = getArticleContent(articleId);
        
        // Hide home sections
        knowledgeBase.style.display = 'none';
        hero.style.display = 'none';
        about.style.display = 'none';
        inProgress.style.display = 'none';
        
        // Show article container
        articleContainer.classList.remove('hidden');
        
        // Initialize first section if it's the EPO-DB article
        if (articleId === 'epo-db') {
            // Make sure the first section is visible
            const firstSection = document.getElementById('database-overview');
            if (firstSection) {
                firstSection.classList.add('active');
            }
        }
        
        // Mobile: Initialize navigation collapsible behavior
        initMobileArticleNav();
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    // Mobile Article Navigation Handler
    function initMobileArticleNav() {
        // Get all nav headers
        const navHeaders = document.querySelectorAll('.nav-header');
        
        navHeaders.forEach(header => {
            // Remove previous event listeners by cloning and replacing
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);
            
            // Add click event to toggle nav items visibility
            newHeader.addEventListener('click', function() {
                // Toggle expanded class on header
                this.classList.toggle('expanded');
                
                // Find the nav-items sibling
                const navItems = this.nextElementSibling;
                if (navItems && navItems.classList.contains('nav-items')) {
                    navItems.classList.toggle('expanded');
                }
            });
        });
        
        // Check if we're on mobile and auto-collapse the nav
        if (window.innerWidth <= 768) {
            // Just make sure the first section's items are visible by default
            const firstNavHeader = document.querySelector('.nav-header');
            const firstNavItems = document.querySelector('.nav-items');
            
            if (firstNavHeader && firstNavItems) {
                firstNavHeader.classList.add('expanded');
                firstNavItems.classList.add('expanded');
            }
        }
    }
    
    // Handle window resize for responsive adjustments
    window.addEventListener('resize', function() {
        if (document.getElementById('article-container').classList.contains('hidden') === false) {
            // Article is visible, check mobile nav state
            if (window.innerWidth > 768) {
                // On desktop/tablet, make sure nav is expanded
                document.querySelectorAll('.nav-items').forEach(navItems => {
                    navItems.classList.add('expanded');
                });
            }
        }
    });
    
    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const articleId = this.getAttribute('data-article');
            showArticle(articleId);
        });
    });
    
    // Search Functionality
    const searchBar = document.getElementById('search-bar');
    const searchButton = document.getElementById('search-button');
    
    function performSearch() {
        const searchTerm = searchBar.value.toLowerCase().trim();
        if (searchTerm === '') return;
        
        // Simple search through all article content
        const allArticles = getAllArticleIds();
        const results = [];
        
        for (const articleId of allArticles) {
            const content = getArticleContent(articleId);
            const title = articleId.replace(/-/g, ' ').toUpperCase();
            
            // Check if search term exists in content or title
            if (content.toLowerCase().includes(searchTerm) || 
                title.toLowerCase().includes(searchTerm)) {
                results.push({
                    id: articleId,
                    title: title,
                    relevance: calculateRelevance(searchTerm, content, title)
                });
            }
        }
        
        // Sort results by relevance
        results.sort((a, b) => b.relevance - a.relevance);
        
        // Display search results
        showSearchResults(results, searchTerm);
    }
    
    function calculateRelevance(term, content, title) {
        let score = 0;
        
        // Create regex with word boundaries to match whole words only
        const wordRegex = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'gi');
        
        // If term appears in title, it's highly relevant
        if (title.toLowerCase().match(wordRegex)) {
            score += 10;
        }
        
        // Count occurrences of whole words
        const contentMatches = (content.match(wordRegex) || []).length;
        score += contentMatches;
        
        return score;
    }
    
    function showSearchResults(results, searchTerm) {
        if (results.length === 0) {
            articleContent.innerHTML = `
                <h2>Search Results for "${searchTerm}"</h2>
                <p>No results found. Try a different search term.</p>
            `;
        } else {
            let resultsHTML = `<h2>Search Results for "${searchTerm}"</h2>`;
            
            resultsHTML += '<div class="search-results">';
            results.forEach(result => {
                // Get the appropriate icon for this result
                const icon = getIconForArticle(result.id);
                
                resultsHTML += `
                    <div class="search-result-item">
                        <div class="kb-list-item-header">
                            <div class="kb-list-icon"><i class="${icon}"></i></div>
                            <h3>${result.title}</h3>
                        </div>
                        <button class="read-more-btn search-result-btn" data-article="${result.id}">View Article</button>
                    </div>
                `;
            });
            resultsHTML += '</div>';
            
            articleContent.innerHTML = resultsHTML;
            
            // Add event listeners to the new buttons
            document.querySelectorAll('.search-result-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const articleId = this.getAttribute('data-article');
                    showArticle(articleId);
                });
            });
        }
        
        // Show article container (which now contains search results)
        knowledgeBase.style.display = 'none';
        hero.style.display = 'none';
        about.style.display = 'none';
        inProgress.style.display = 'none';
        articleContainer.classList.remove('hidden');
    }
    
    searchButton.addEventListener('click', performSearch);
    searchBar.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Search Suggestions Functionality
    const searchSuggestions = document.getElementById('search-suggestions');
    let searchTimeout;

    // Show suggestions as user types
    searchBar.addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        
        // Clear previous timeout to prevent multiple rapid searches
        clearTimeout(searchTimeout);
        
        if (searchTerm.length < 2) {
            // Hide suggestions if input is too short
            searchSuggestions.classList.remove('active');
            searchSuggestions.innerHTML = '';
            return;
        }
        
        // Set a small delay to avoid searching on every keystroke
        searchTimeout = setTimeout(function() {
            showSearchSuggestions(searchTerm);
        }, 200);
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchBar.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.classList.remove('active');
        }
    });

    // Show search suggestions
    function showSearchSuggestions(searchTerm) {
        const allArticles = getAllArticleIds();
        const matches = [];
        
        // Create regex with word boundaries to match whole words only
        const wordRegex = new RegExp(`\\b${escapeRegExp(searchTerm)}\\b`, 'gi');
        
        // Find matching articles and context
        for (const articleId of allArticles) {
            const content = getArticleContent(articleId);
            const title = articleId.replace(/-/g, ' ').toUpperCase();
            const plainTextContent = stripHtml(content);
            
            if (title.toLowerCase().match(wordRegex) || 
                plainTextContent.toLowerCase().match(wordRegex)) {
                
                // Get context snippets for the search term
                const contexts = getContextSnippets(plainTextContent, searchTerm, 3);
                
                // Calculate relevance for sorting
                const relevance = calculateRelevance(searchTerm, plainTextContent, title);
                
                matches.push({
                    id: articleId,
                    title: title,
                    contexts: contexts,
                    relevance: relevance
                });
            }
        }
        
        // Sort by relevance
        matches.sort((a, b) => b.relevance - a.relevance);
        
        // Limit to top 5 matches
        const topMatches = matches.slice(0, 5);
        
        // Generate HTML for suggestions
        if (topMatches.length > 0) {
            let suggestionsHTML = '';
            
            topMatches.forEach(match => {
                const icon = getIconForArticle(match.id);
                const highlightedTitle = highlightWholeWord(match.title, searchTerm);
                
                suggestionsHTML += `
                    <div class="search-suggestion-item" data-article="${match.id}">
                        <div class="suggestion-icon"><i class="${icon}"></i></div>
                        <div class="suggestion-content">
                            <div class="suggestion-title">${highlightedTitle}</div>`;
                
                // Add context snippets if available
                if (match.contexts && match.contexts.length > 0) {
                    suggestionsHTML += `<div class="suggestion-contexts">`;
                    match.contexts.forEach(context => {
                        suggestionsHTML += `<div class="context-snippet">${context}</div>`;
                    });
                    suggestionsHTML += `</div>`;
                }
                
                suggestionsHTML += `</div>
                    </div>
                `;
            });
            
            searchSuggestions.innerHTML = suggestionsHTML;
            searchSuggestions.classList.add('active');
            
            // Add click event listeners to suggestions
            document.querySelectorAll('.search-suggestion-item').forEach(item => {
                item.addEventListener('click', function() {
                    const articleId = this.getAttribute('data-article');
                    searchSuggestions.classList.remove('active');
                    showArticle(articleId);
                    
                    // Optionally highlight the search term in the article
                    setTimeout(() => {
                        highlightTermInArticle(searchTerm);
                    }, 100);
                });
            });
        } else {
            searchSuggestions.innerHTML = `
                <div class="search-suggestion-item">
                    <div class="suggestion-text">No matches found</div>
                </div>
            `;
            searchSuggestions.classList.add('active');
        }
    }

    // Helper function to strip HTML tags
    function stripHtml(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }

    // Function to truncate text for search suggestions
    function truncateText(text, maxLength = 50) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Improved function to display context around search terms
    function getContextSnippets(text, searchTerm, maxSnippets = 2) {
        // Create a regex with word boundaries to match the whole word only
        const wordRegex = new RegExp(`\\b${escapeRegExp(searchTerm)}\\b`, 'gi');
        
        // Find sentences containing the whole word
        const sentenceRegex = new RegExp(`[^.!?]*\\b${escapeRegExp(searchTerm)}\\b[^.!?]*`, 'gi');
        const matches = text.match(sentenceRegex) || [];
        
        // Limit number of snippets and trim them
        return matches.slice(0, maxSnippets).map(snippet => {
            // Get the trimmed snippet with the search term centered
            const trimmed = centerSearchTerm(snippet.trim(), searchTerm);
            return highlightWholeWord(trimmed, searchTerm);
        });
    }

    // Function to center the search term in the snippet with context on both sides
    function centerSearchTerm(text, searchTerm, maxLength = 60) {
        if (text.length <= maxLength) return text;
        
        const wordRegex = new RegExp(`\\b${escapeRegExp(searchTerm)}\\b`, 'i');
        const match = text.match(wordRegex);
        
        if (!match) return text.substring(0, maxLength) + '...';
        
        // Find the position of the search term
        const matchIndex = match.index;
        const matchLength = match[0].length;
        
        // Calculate how much context to show on each side
        const contextLength = Math.floor((maxLength - matchLength) / 2);
        
        // Calculate initial positions
        let startPos = Math.max(0, matchIndex - contextLength);
        let endPos = Math.min(text.length, matchIndex + matchLength + contextLength);
        
        // Check for sentence boundaries (period, question mark, exclamation point)
        if (endPos < text.length) {
            // Find the next sentence end after the search term
            const nextSentenceEnd = text.substring(matchIndex).search(/[.!?]\s/);
            if (nextSentenceEnd !== -1 && matchIndex + nextSentenceEnd < endPos + 15) {
                // If a sentence end is found nearby, use it as the end point
                endPos = matchIndex + nextSentenceEnd + 1;
            } else {
                // Otherwise find the nearest word boundary
                const nextSpace = text.indexOf(' ', endPos);
                if (nextSpace !== -1 && nextSpace < endPos + 10) {
                    endPos = nextSpace;
                }
            }
        }
        
        // For the start, try to find a sentence beginning
        if (startPos > 0) {
            const prevText = text.substring(0, startPos);
            const lastSentenceStart = prevText.lastIndexOf('. ');
            
            if (lastSentenceStart !== -1 && startPos - lastSentenceStart < 20) {
                startPos = lastSentenceStart + 2; // Skip the period and space
            } else {
                // Find the next space before startPos
                const lastSpace = prevText.lastIndexOf(' ');
                if (lastSpace !== -1) {
                    startPos = lastSpace + 1;
                }
            }
        }
        
        // Add ellipsis if needed
        let result = text.substring(startPos, endPos);
        if (startPos > 0) result = '... ' + result;
        if (endPos < text.length) result = result + '...';
        
        return result;
    }

    // Helper function to escape special regex characters
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Update the highlight functions to use whole word matching
    function highlightWholeWord(text, searchTerm) {
        const regex = new RegExp(`\\b(${escapeRegExp(searchTerm)})\\b`, 'gi');
        return text.replace(regex, '<span class="matched-text">$1</span>');
    }

    // Function to highlight search term in article content - updated for whole words
    function highlightTermInArticle(term) {
        if (!term || term.length < 2) return;
        
        const articleElement = document.getElementById('article-content');
        
        // Create a text node walker
        const walker = document.createTreeWalker(
            articleElement,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const regex = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'gi');
        const nodesToReplace = [];
        let textNode;
        
        // Find all text nodes with the search term as a whole word
        while (textNode = walker.nextNode()) {
            if (regex.test(textNode.nodeValue)) {
                nodesToReplace.push(textNode);
            }
        }
        
        // Replace text in identified nodes
        nodesToReplace.forEach(node => {
            const highlightedText = document.createElement('span');
            highlightedText.innerHTML = node.nodeValue.replace(regex, match => 
                `<span class="highlighted-term">${match}</span>`
            );
            
            // Replace the text node with our highlighted version
            if (node.parentNode) {
                node.parentNode.replaceChild(highlightedText, node);
            }
        });
        
        // Scroll to the first highlighted term
        const firstHighlight = document.querySelector('.highlighted-term');
        if (firstHighlight) {
            firstHighlight.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    // Helper Functions
    function getAllArticleIds() {
        return [
            'epo-db', 'agent-handlers', 'dxl', 'tie', 'ivx', 'hx',
            'agent', 'ens', 'solidcore', 'dlp', 'sir',
            'alerts',
            'epo-best-practices', 'tasks',
            'troubleshooting-tips'
        ];
    }
    
    function getArticleContent(articleId) {
        // Sample content for each article
        const articles = {
            'epo-db': `
                <div class="article-header">
                    <div class="article-metadata">
                        <span class="article-type"><i class="fas fa-star"></i> Advanced</span>
                        <span class="article-time"><i class="far fa-clock"></i> 45 minutes</span>
                    </div>
                    <h1>Database Configuration</h1>
                </div>

                <div class="article-layout">
                    <nav class="article-nav">
                        <div class="nav-section active">
                            <div class="nav-header">Database Configuration</div>
                            <ul class="nav-items">
                                <li class="active" data-section="database-overview"><a>Database Overview</a></li>
                                <li data-section="prerequisites"><a>Pre-requisites</a></li>
                                <li data-section="sql-setup"><a>Standard SQL Server Setup</a></li>
                                <li data-section="performance"><a>Performance Optimization</a></li>
                                <li data-section="next-steps"><a>Next Steps</a></li>
                            </ul>
                        </div>
                    </nav>

                    <div class="article-content">
                        <div id="database-overview" class="article-section active">
                            <h2>Database Overview</h2>
                            <p>The Trellix platform requires a properly configured Microsoft SQL Server database for optimal performance and data storage. This guide covers setting up SQL Server for Trellix, configuring replication, and optimizing performance for enterprise deployments.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This guide assumes you have administrative access to your SQL Server environment and the necessary permissions to create databases and configure server settings.</p>
                            </div>

                            <div class="server-requirement-card">
                                <div class="requirement-header">
                                    <div class="server-icon">
                                        <i class="fas fa-database"></i>
                                    </div>
                                    <div class="server-info">
                                        <h3>Microsoft SQL Server for Trellix</h3>
                                        <div class="server-meta">
                                            <span class="tag recommended">Recommended: SQL Server 2019</span>
                                            <span class="tag critical">Critical for Trellix Platform</span>
                                        </div>
                                    </div>
                                    <a class="doc-link">
                                        <i class="fas fa-external-link-alt"></i>
                                        SQL Server Documentation
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div id="prerequisites" class="article-section">
                            <h2>Pre-requisites</h2>
                            <p>Work in progress - This section will contain pre-requisites for database configuration.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="sql-setup" class="article-section">
                            <h2>Standard SQL Server Setup</h2>
                            <p>Work in progress - This section will contain SQL Server setup instructions.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="performance" class="article-section">
                            <h2>Performance Optimization</h2>
                            <p>Work in progress - This section will contain performance optimization guidelines.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="next-steps" class="article-section">
                            <h2>Next Steps</h2>
                            <p>Work in progress - This section will contain next steps for database configuration.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'agent-handlers': `
                <div class="article-header">
                    <div class="article-metadata">
                        <span class="article-type"><i class="fas fa-network-wired"></i> Intermediate</span>
                        <span class="article-time"><i class="far fa-clock"></i> 30 minutes</span>
                    </div>
                    <h1>Agent Handlers</h1>
                </div>

                <div class="article-layout">
                    <nav class="article-nav">
                        <div class="nav-section active">
                            <div class="nav-header">Agent Handlers</div>
                            <ul class="nav-items">
                                <li class="active" data-section="agent-overview"><a>Overview</a></li>
                                <li data-section="agent-architecture"><a>Architecture</a></li>
                                <li data-section="agent-deployment"><a>Deployment Strategies</a></li>
                                <li data-section="agent-configuration"><a>Configuration</a></li>
                                <li data-section="agent-monitoring"><a>Monitoring</a></li>
                            </ul>
                        </div>
                    </nav>

                    <div class="article-content">
                        <div id="agent-overview" class="article-section active">
                            <h2>Agent Handlers Overview</h2>
                            <p>Agent Handlers are a critical component in the Trellix EPO architecture, responsible for communication between the EPO server and endpoints. This article covers setup, configuration, and management best practices.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>Agent Handlers provide scalability and load balancing for endpoint communications.</p>
                            </div>
                        </div>

                        <div id="agent-architecture" class="article-section">
                            <h2>Agent Handler Architecture</h2>
                            <p>Work in progress - This section will cover Agent Handler architecture details.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="agent-deployment" class="article-section">
                            <h2>Deployment Strategies</h2>
                            <p>Work in progress - This section will cover deployment best practices.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="agent-configuration" class="article-section">
                            <h2>Configuration</h2>
                            <p>Work in progress - This section will cover configuration options.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="agent-monitoring" class="article-section">
                            <h2>Monitoring</h2>
                            <p>Work in progress - This section will cover monitoring and maintenance.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'dxl': `
                <div class="article-header">
                    <div class="article-metadata">
                        <span class="article-type"><i class="fas fa-exchange-alt"></i> Advanced</span>
                        <span class="article-time"><i class="far fa-clock"></i> 40 minutes</span>
                    </div>
                    <h1>Data Exchange Layer (DXL)</h1>
                </div>

                <div class="article-layout">
                    <nav class="article-nav">
                        <div class="nav-section active">
                            <div class="nav-header">DXL</div>
                            <ul class="nav-items">
                                <li class="active" data-section="dxl-overview"><a>Overview</a></li>
                                <li data-section="dxl-architecture"><a>Architecture</a></li>
                                <li data-section="dxl-implementation"><a>Implementation</a></li>
                                <li data-section="dxl-integration"><a>EPO Integration</a></li>
                                <li data-section="dxl-customization"><a>Custom Integrations</a></li>
                            </ul>
                        </div>
                    </nav>

                    <div class="article-content">
                        <div id="dxl-overview" class="article-section active">
                            <h2>DXL Overview</h2>
                            <p>The Data Exchange Layer (DXL) is a messaging fabric that allows different security products within the Trellix ecosystem to communicate with each other. This article provides an overview of DXL architecture and implementation guidelines.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>DXL facilitates real-time information sharing between different security components.</p>
                            </div>
                        </div>

                        <div id="dxl-architecture" class="article-section">
                            <h2>DXL Architecture</h2>
                            <p>Work in progress - This section will cover DXL architecture details.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="dxl-implementation" class="article-section">
                            <h2>Implementation</h2>
                            <p>Work in progress - This section will cover implementation planning.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="dxl-integration" class="article-section">
                            <h2>EPO Integration</h2>
                            <p>Work in progress - This section will cover EPO integration details.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="dxl-customization" class="article-section">
                            <h2>Custom Integrations</h2>
                            <p>Work in progress - This section will cover custom integration options.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'tie': `
                <div class="article-header">
                    <div class="article-metadata">
                        <span class="article-type"><i class="fas fa-shield-alt"></i> Advanced</span>
                        <span class="article-time"><i class="far fa-clock"></i> 35 minutes</span>
                    </div>
                    <h1>Threat Intelligence Exchange (TIE)</h1>
                </div>

                <div class="article-layout">
                    <nav class="article-nav">
                        <div class="nav-section active">
                            <div class="nav-header">TIE</div>
                            <ul class="nav-items">
                                <li class="active" data-section="tie-overview"><a>Overview</a></li>
                                <li data-section="tie-architecture"><a>Architecture</a></li>
                                <li data-section="tie-installation"><a>Installation</a></li>
                                <li data-section="tie-integration"><a>Product Integration</a></li>
                                <li data-section="tie-management"><a>Management</a></li>
                            </ul>
                        </div>
                    </nav>

                    <div class="article-content">
                        <div id="tie-overview" class="article-section active">
                            <h2>TIE Overview</h2>
                            <p>Threat Intelligence Exchange (TIE) is a Trellix solution that enables sharing of threat information across the security infrastructure. This article covers setup, configuration, and management of TIE servers.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>TIE enables centralized management of file and certificate reputation data.</p>
                            </div>
                        </div>

                        <div id="tie-architecture" class="article-section">
                            <h2>TIE Architecture</h2>
                            <p>Work in progress - This section will cover TIE architecture details.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="tie-installation" class="article-section">
                            <h2>Installation</h2>
                            <p>Work in progress - This section will cover installation procedures.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="tie-integration" class="article-section">
                            <h2>Product Integration</h2>
                            <p>Work in progress - This section will cover integration with other Trellix products.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="tie-management" class="article-section">
                            <h2>Management</h2>
                            <p>Work in progress - This section will cover operational management.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'ivx': `
                <div class="article-header">
                    <div class="article-metadata">
                        <span class="article-type"><i class="fas fa-search"></i> Advanced</span>
                        <span class="article-time"><i class="far fa-clock"></i> 40 minutes</span>
                    </div>
                    <h1>Investigation Exchange (IVX)</h1>
                </div>

                <div class="article-layout">
                    <nav class="article-nav">
                        <div class="nav-section active">
                            <div class="nav-header">IVX</div>
                            <ul class="nav-items">
                                <li class="active" data-section="ivx-overview"><a>Overview</a></li>
                                <li data-section="ivx-architecture"><a>Architecture</a></li>
                                <li data-section="ivx-deployment"><a>Deployment</a></li>
                                <li data-section="ivx-integration"><a>Integration</a></li>
                                <li data-section="ivx-workflows"><a>Investigation Workflows</a></li>
                            </ul>
                        </div>
                    </nav>

                    <div class="article-content">
                        <div id="ivx-overview" class="article-section active">
                            <h2>IVX Overview</h2>
                            <p>Investigation Exchange (IVX) provides advanced investigation capabilities within the Trellix ecosystem. This article covers configuration, usage scenarios, and best practices for IVX implementation.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>IVX enables automated collection and analysis of security data from multiple sources.</p>
                            </div>
                        </div>

                        <div id="ivx-architecture" class="article-section">
                            <h2>IVX Architecture</h2>
                            <p>Work in progress - This section will cover architecture details.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="ivx-deployment" class="article-section">
                            <h2>Deployment Planning</h2>
                            <p>Work in progress - This section will cover deployment planning.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="ivx-integration" class="article-section">
                            <h2>Integration</h2>
                            <p>Work in progress - This section will cover integration with security infrastructure.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="ivx-workflows" class="article-section">
                            <h2>Investigation Workflows</h2>
                            <p>Work in progress - This section will cover workflow configuration.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'hx': `
                <div class="article-header">
                    <div class="article-metadata">
                        <span class="article-type"><i class="fas fa-desktop"></i> Advanced</span>
                        <span class="article-time"><i class="far fa-clock"></i> 45 minutes</span>
                    </div>
                    <h1>Host Exchange (HX)</h1>
                </div>

                <div class="article-layout">
                    <nav class="article-nav">
                        <div class="nav-section active">
                            <div class="nav-header">HX</div>
                            <ul class="nav-items">
                                <li class="active" data-section="hx-overview"><a>Overview</a></li>
                                <li data-section="hx-architecture"><a>Architecture</a></li>
                                <li data-section="hx-server-deployment"><a>Server Deployment</a></li>
                                <li data-section="hx-agent-deployment"><a>Agent Deployment</a></li>
                                <li data-section="hx-operations"><a>Operations</a></li>
                            </ul>
                        </div>
                    </nav>

                    <div class="article-content">
                        <div id="hx-overview" class="article-section active">
                            <h2>HX Overview</h2>
                            <p>Host Exchange (HX) is an advanced endpoint detection and response solution within the Trellix ecosystem. This article covers deployment, configuration, and administration of HX servers.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>HX provides advanced endpoint monitoring and response capabilities.</p>
                            </div>
                        </div>

                        <div id="hx-architecture" class="article-section">
                            <h2>HX Architecture</h2>
                            <p>Work in progress - This section will cover architecture details.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="hx-server-deployment" class="article-section">
                            <h2>Server Deployment</h2>
                            <p>Work in progress - This section will cover server deployment.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="hx-agent-deployment" class="article-section">
                            <h2>Agent Deployment</h2>
                            <p>Work in progress - This section will cover agent deployment.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="hx-operations" class="article-section">
                            <h2>Operations</h2>
                            <p>Work in progress - This section will cover operational procedures.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'agent': `
                <div class="article-header">
                    <div class="article-metadata">
                        <span class="article-type"><i class="fas fa-download"></i> Intermediate</span>
                        <span class="article-time"><i class="far fa-clock"></i> 30 minutes</span>
                    </div>
                    <h1>Trellix Agent</h1>
                </div>

                <div class="article-layout">
                    <nav class="article-nav">
                        <div class="nav-section active">
                            <div class="nav-header">Agent</div>
                            <ul class="nav-items">
                                <li class="active" data-section="agent-main-overview"><a>Overview</a></li>
                                <li data-section="agent-architecture"><a>Architecture</a></li>
                                <li data-section="agent-deployment-methods"><a>Deployment Methods</a></li>
                                <li data-section="agent-configuration"><a>Configuration</a></li>
                                <li data-section="agent-troubleshooting"><a>Troubleshooting</a></li>
                            </ul>
                        </div>
                    </nav>

                    <div class="article-content">
                        <div id="agent-main-overview" class="article-section active">
                            <h2>Agent Overview</h2>
                            <p>The Trellix agent is the foundation of endpoint security in the Trellix ecosystem. This article covers deployment strategies, configuration best practices, and troubleshooting techniques.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>The agent provides the communication channel between endpoints and the Trellix management infrastructure.</p>
                            </div>
                        </div>

                        <div id="agent-architecture" class="article-section">
                            <h2>Agent Architecture</h2>
                            <p>Work in progress - This section will cover agent architecture details.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="agent-deployment-methods" class="article-section">
                            <h2>Deployment Methods</h2>
                            <p>Work in progress - This section will cover deployment methods.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="agent-configuration" class="article-section">
                            <h2>Configuration</h2>
                            <p>Work in progress - This section will cover configuration best practices.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="agent-troubleshooting" class="article-section">
                            <h2>Troubleshooting</h2>
                            <p>Work in progress - This section will cover troubleshooting techniques.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'ens': `
                <div class="article-header">
                    <div class="article-metadata">
                        <span class="article-type"><i class="fas fa-shield-alt"></i> Intermediate</span>
                        <span class="article-time"><i class="far fa-clock"></i> 50 minutes</span>
                    </div>
                    <h1>Endpoint Security (ENS)</h1>
                </div>

                <div class="article-layout">
                    <nav class="article-nav">
                        <div class="nav-section active">
                            <div class="nav-header">ENS</div>
                            <ul class="nav-items">
                                <li class="active" data-section="ens-overview"><a>Overview</a></li>
                                <li data-section="ens-components"><a>Components</a></li>
                                <li data-section="ens-installation"><a>Installation</a></li>
                                <li data-section="ens-policies"><a>Policy Configuration</a></li>
                                <li data-section="ens-tuning"><a>Performance Tuning</a></li>
                            </ul>
                        </div>
                    </nav>

                    <div class="article-content">
                        <div id="ens-overview" class="article-section active">
                            <h2>ENS Overview</h2>
                            <p>Endpoint Security (ENS) is Trellix's comprehensive endpoint protection platform. This article covers installation, configuration, and operational best practices for ENS deployment.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>ENS provides integrated protection against a wide range of threats targeting endpoints.</p>
                            </div>
                        </div>

                        <div id="ens-components" class="article-section">
                            <h2>ENS Components</h2>
                            <p>Work in progress - This section will cover the various modules and components of ENS.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="ens-installation" class="article-section">
                            <h2>Installation</h2>
                            <p>Work in progress - This section will cover installation planning and procedures.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="ens-policies" class="article-section">
                            <h2>Policy Configuration</h2>
                            <p>Work in progress - This section will cover policy configuration best practices.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="ens-tuning" class="article-section">
                            <h2>Performance Tuning</h2>
                            <p>Work in progress - This section will cover performance optimization techniques.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'troubleshooting-tips': `
                <div class="article-header">
                    <div class="article-metadata">
                        <span class="article-type"><i class="fas fa-wrench"></i> Essential</span>
                        <span class="article-time"><i class="far fa-clock"></i> 25 minutes</span>
                    </div>
                    <h1>Common Troubleshooting Tips</h1>
                </div>

                <div class="article-layout">
                    <nav class="article-nav">
                        <div class="nav-section active">
                            <div class="nav-header">Troubleshooting</div>
                            <ul class="nav-items">
                                <li class="active" data-section="troubleshooting-overview"><a>Overview</a></li>
                                <li data-section="agent-issues"><a>Agent Issues</a></li>
                                <li data-section="policy-issues"><a>Policy Issues</a></li>
                                <li data-section="database-issues"><a>Database Issues</a></li>
                                <li data-section="deployment-issues"><a>Deployment Issues</a></li>
                                <li data-section="reporting-issues"><a>Reporting Issues</a></li>
                            </ul>
                        </div>
                    </nav>

                    <div class="article-content">
                        <div id="troubleshooting-overview" class="article-section active">
                            <h2>Troubleshooting Overview</h2>
                            <p>Troubleshooting is an essential skill for managing Trellix environments. This article provides guidance for diagnosing and resolving common issues across the Trellix ecosystem.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This guide includes solutions for the most commonly encountered issues in Trellix EPO environments.</p>
                            </div>
                        </div>

                        <div id="agent-issues" class="article-section">
                            <h2>Agent Communication Issues</h2>
                            <p>Work in progress - This section will cover agent communication troubleshooting.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="policy-issues" class="article-section">
                            <h2>Policy Application Failures</h2>
                            <p>Work in progress - This section will cover policy application troubleshooting.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="database-issues" class="article-section">
                            <h2>Database Performance Problems</h2>
                            <p>Work in progress - This section will cover database troubleshooting.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="deployment-issues" class="article-section">
                            <h2>Product Deployment Failures</h2>
                            <p>Work in progress - This section will cover deployment troubleshooting.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="reporting-issues" class="article-section">
                            <h2>Reporting and Dashboard Issues</h2>
                            <p>Work in progress - This section will cover reporting troubleshooting.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'elastic-test': `
                <h1>Elastic EDR Test Article</h1>
                <h2>This is a sample article for Elastic EDR</h2>
                
                <p>This is a placeholder article for the Elastic EDR knowledge base section. You can replace this with actual content about Elastic EDR implementation, configuration, and best practices.</p>
                
                <h3>Sample Section</h3>
                <p>This is where detailed information about Elastic EDR would go.</p>
            `,
            'carbon-test': `
                <h1>Carbon Black EDR Test Article</h1>
                <h2>This is a sample article for Carbon Black EDR</h2>
                
                <p>This is a placeholder article for the Carbon Black EDR knowledge base section. You can replace this with actual content about Carbon Black EDR implementation, configuration, and best practices.</p>
                
                <h3>Sample Section</h3>
                <p>This is where detailed information about Carbon Black EDR would go.</p>
            `,
            'solidcore': `
                <div class="article-header">
                    <div class="article-metadata">
                        <span class="article-type"><i class="fas fa-lock"></i> Advanced</span>
                        <span class="article-time"><i class="far fa-clock"></i> 35 minutes</span>
                    </div>
                    <h1>Solidcore</h1>
                </div>

                <div class="article-layout">
                    <nav class="article-nav">
                        <div class="nav-section active">
                            <div class="nav-header">Solidcore</div>
                            <ul class="nav-items">
                                <li class="active" data-section="solidcore-overview"><a>Overview</a></li>
                                <li data-section="solidcore-architecture"><a>Architecture</a></li>
                                <li data-section="solidcore-implementation"><a>Implementation</a></li>
                                <li data-section="solidcore-whitelisting"><a>Whitelisting Strategies</a></li>
                                <li data-section="solidcore-management"><a>Ongoing Management</a></li>
                            </ul>
                        </div>
                    </nav>

                    <div class="article-content">
                        <div id="solidcore-overview" class="article-section active">
                            <h2>Solidcore Overview</h2>
                            <p>Solidcore provides application control and whitelisting capabilities within the Trellix ecosystem. This article covers implementation strategies, operational procedures, and best practices for Solidcore deployment.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>Solidcore offers robust protection against unauthorized applications and code execution.</p>
                            </div>
                        </div>

                        <div id="solidcore-architecture" class="article-section">
                            <h2>Solidcore Architecture</h2>
                            <p>Work in progress - This section will cover architecture details.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="solidcore-implementation" class="article-section">
                            <h2>Implementation</h2>
                            <p>Work in progress - This section will cover implementation strategies.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="solidcore-whitelisting" class="article-section">
                            <h2>Whitelisting Strategies</h2>
                            <p>Work in progress - This section will cover whitelisting approaches.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="solidcore-management" class="article-section">
                            <h2>Ongoing Management</h2>
                            <p>Work in progress - This section will cover management practices.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'dlp': `
                <div class="article-header">
                    <div class="article-metadata">
                        <span class="article-type"><i class="fas fa-file-alt"></i> Intermediate</span>
                        <span class="article-time"><i class="far fa-clock"></i> 40 minutes</span>
                    </div>
                    <h1>Data Loss Prevention (DLP)</h1>
                </div>

                <div class="article-layout">
                    <nav class="article-nav">
                        <div class="nav-section active">
                            <div class="nav-header">DLP</div>
                            <ul class="nav-items">
                                <li class="active" data-section="dlp-overview"><a>Overview</a></li>
                                <li data-section="dlp-architecture"><a>Architecture</a></li>
                                <li data-section="dlp-classification"><a>Classification Strategy</a></li>
                                <li data-section="dlp-policy"><a>Policy Development</a></li>
                                <li data-section="dlp-incidents"><a>Incident Response</a></li>
                            </ul>
                        </div>
                    </nav>

                    <div class="article-content">
                        <div id="dlp-overview" class="article-section active">
                            <h2>DLP Overview</h2>
                            <p>Data Loss Prevention (DLP) protects sensitive data from unauthorized disclosure. This article covers setup, policy configuration, and operational procedures for DLP implementation.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>DLP helps organizations protect sensitive information across endpoints, networks, and cloud services.</p>
                            </div>
                        </div>

                        <div id="dlp-architecture" class="article-section">
                            <h2>DLP Architecture</h2>
                            <p>Work in progress - This section will cover architecture details.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="dlp-classification" class="article-section">
                            <h2>Classification Strategy</h2>
                            <p>Work in progress - This section will cover data classification strategies.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="dlp-policy" class="article-section">
                            <h2>Policy Development</h2>
                            <p>Work in progress - This section will cover policy development best practices.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="dlp-incidents" class="article-section">
                            <h2>Incident Response</h2>
                            <p>Work in progress - This section will cover incident response workflows.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'sir': `
                <div class="article-header">
                    <div class="article-metadata">
                        <span class="article-type"><i class="fas fa-chart-bar"></i> Intermediate</span>
                        <span class="article-time"><i class="far fa-clock"></i> 25 minutes</span>
                    </div>
                    <h1>Security Information Reporting (SIR)</h1>
                </div>

                <div class="article-layout">
                    <nav class="article-nav">
                        <div class="nav-section active">
                            <div class="nav-header">SIR</div>
                            <ul class="nav-items">
                                <li class="active" data-section="sir-overview"><a>Overview</a></li>
                                <li data-section="sir-architecture"><a>Architecture</a></li>
                                <li data-section="sir-deployment"><a>Deployment</a></li>
                                <li data-section="sir-reports"><a>Report Development</a></li>
                                <li data-section="sir-dashboards"><a>Dashboards</a></li>
                            </ul>
                        </div>
                    </nav>

                    <div class="article-content">
                        <div id="sir-overview" class="article-section active">
                            <h2>SIR Overview</h2>
                            <p>Security Information Reporting (SIR) provides comprehensive reporting capabilities for the Trellix ecosystem. This article covers configuration, report development, and operational usage of SIR.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>SIR enables security teams to transform raw data into actionable security intelligence.</p>
                            </div>
                        </div>

                        <div id="sir-architecture" class="article-section">
                            <h2>SIR Architecture</h2>
                            <p>Work in progress - This section will cover architecture details.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="sir-deployment" class="article-section">
                            <h2>Deployment</h2>
                            <p>Work in progress - This section will cover deployment planning.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="sir-reports" class="article-section">
                            <h2>Report Development</h2>
                            <p>Work in progress - This section will cover report development.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="sir-dashboards" class="article-section">
                            <h2>Dashboards</h2>
                            <p>Work in progress - This section will cover dashboard configuration.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'alerts': `
                <div class="article-header">
                    <div class="article-metadata">
                        <span class="article-type"><i class="fas fa-bell"></i> Essential</span>
                        <span class="article-time"><i class="far fa-clock"></i> 30 minutes</span>
                    </div>
                    <h1>Alert Management</h1>
                </div>

                <div class="article-layout">
                    <nav class="article-nav">
                        <div class="nav-section active">
                            <div class="nav-header">Alerts</div>
                            <ul class="nav-items">
                                <li class="active" data-section="alerts-overview"><a>Overview</a></li>
                                <li data-section="alerts-configuration"><a>Configuration</a></li>
                                <li data-section="alerts-tuning"><a>Alert Tuning</a></li>
                                <li data-section="alerts-response"><a>Response Procedures</a></li>
                                <li data-section="alerts-correlation"><a>Alert Correlation</a></li>
                            </ul>
                        </div>
                    </nav>

                    <div class="article-content">
                        <div id="alerts-overview" class="article-section active">
                            <h2>Alert Management Overview</h2>
                            <p>Effective alert management is critical for security operations. This article covers alert configuration, tuning methodologies, and response procedures for the Trellix ecosystem.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>Well-configured alerts help security teams focus on genuine threats while minimizing false positives.</p>
                            </div>
                        </div>

                        <div id="alerts-configuration" class="article-section">
                            <h2>Alert Configuration</h2>
                            <p>Work in progress - This section will cover configuration details.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="alerts-tuning" class="article-section">
                            <h2>Alert Tuning</h2>
                            <p>Work in progress - This section will cover tuning methodologies.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="alerts-response" class="article-section">
                            <h2>Response Procedures</h2>
                            <p>Work in progress - This section will cover response procedures.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="alerts-correlation" class="article-section">
                            <h2>Alert Correlation</h2>
                            <p>Work in progress - This section will cover correlation techniques.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'epo-best-practices': `
                <div class="article-header">
                    <div class="article-metadata">
                        <span class="article-type"><i class="fas fa-star"></i> Essential</span>
                        <span class="article-time"><i class="far fa-clock"></i> 35 minutes</span>
                    </div>
                    <h1>EPO Best Practices</h1>
                </div>

                <div class="article-layout">
                    <nav class="article-nav">
                        <div class="nav-section active">
                            <div class="nav-header">Best Practices</div>
                            <ul class="nav-items">
                                <li class="active" data-section="best-practices-overview"><a>Overview</a></li>
                                <li data-section="system-architecture"><a>System Architecture</a></li>
                                <li data-section="org-structure"><a>Organizational Structure</a></li>
                                <li data-section="policy-management"><a>Policy Management</a></li>
                                <li data-section="database-maintenance"><a>Database Maintenance</a></li>
                            </ul>
                        </div>
                    </nav>

                    <div class="article-content">
                        <div id="best-practices-overview" class="article-section active">
                            <h2>Best Practices Overview</h2>
                            <p>Following best practices for EPO operation ensures optimal performance and reliability. This article covers recommended practices for various aspects of EPO management.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>These recommendations are based on real-world experience with enterprise EPO deployments.</p>
                            </div>
                        </div>

                        <div id="system-architecture" class="article-section">
                            <h2>System Architecture</h2>
                            <p>Work in progress - This section will cover system architecture best practices.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="org-structure" class="article-section">
                            <h2>Organizational Structure</h2>
                            <p>Work in progress - This section will cover organizational structure recommendations.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="policy-management" class="article-section">
                            <h2>Policy Management</h2>
                            <p>Work in progress - This section will cover policy management best practices.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="database-maintenance" class="article-section">
                            <h2>Database Maintenance</h2>
                            <p>Work in progress - This section will cover database maintenance procedures.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'tasks': `
                <div class="article-header">
                    <div class="article-metadata">
                        <span class="article-type"><i class="fas fa-tasks"></i> Intermediate</span>
                        <span class="article-time"><i class="far fa-clock"></i> 30 minutes</span>
                    </div>
                    <h1>Client & Server Tasks</h1>
                </div>

                <div class="article-layout">
                    <nav class="article-nav">
                        <div class="nav-section active">
                            <div class="nav-header">Tasks</div>
                            <ul class="nav-items">
                                <li class="active" data-section="tasks-overview"><a>Overview</a></li>
                                <li data-section="task-types"><a>Task Types</a></li>
                                <li data-section="client-tasks"><a>Client Tasks</a></li>
                                <li data-section="server-tasks"><a>Server Tasks</a></li>
                                <li data-section="task-scheduling"><a>Scheduling Strategies</a></li>
                            </ul>
                        </div>
                    </nav>

                    <div class="article-content">
                        <div id="tasks-overview" class="article-section active">
                            <h2>Tasks Overview</h2>
                            <p>Automated tasks are essential for efficient management of the Trellix ecosystem. This article covers configuration and management of both client and server tasks in EPO.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>Well-designed tasks automate routine operations and ensure consistent security posture across the environment.</p>
                            </div>
                        </div>

                        <div id="task-types" class="article-section">
                            <h2>Task Types</h2>
                            <p>Work in progress - This section will cover different types of tasks.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="client-tasks" class="article-section">
                            <h2>Client Tasks</h2>
                            <p>Work in progress - This section will cover client task configuration.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="server-tasks" class="article-section">
                            <h2>Server Tasks</h2>
                            <p>Work in progress - This section will cover server task management.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>

                        <div id="task-scheduling" class="article-section">
                            <h2>Scheduling Strategies</h2>
                            <p>Work in progress - This section will cover scheduling best practices.</p>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <p>This section is currently under development.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `
        };
        
        return articles[articleId] || `<h1>Article Not Found</h1><p>The requested article "${articleId}" could not be found.</p>`;
    }

    // Alternative icons using only free Font Awesome icons
    function getIconForArticle(articleId) {
        const icons = {
            'epo-db': 'fas fa-database',
            'agent-handlers': 'fas fa-network-wired',
            'dxl': 'fas fa-exchange-alt',
            'tie': 'fas fa-shield-alt',
            'ivx': 'fas fa-search',
            'hx': 'fas fa-desktop',
            'agent': 'fas fa-download',
            'ens': 'fas fa-shield-alt', // Alternative to shield-virus
            'solidcore': 'fas fa-lock',
            'dlp': 'fas fa-file-alt', // Alternative to file-shield
            'sir': 'fas fa-chart-bar',
            'alerts': 'fas fa-bell',
            'epo-best-practices': 'fas fa-star',
            'tasks': 'fas fa-tasks',
            'troubleshooting-tips': 'fas fa-wrench',
            'elastic-test': 'fas fa-search',
            'carbon-test': 'fas fa-lock'
        };
        
        return icons[articleId] || 'fas fa-file';
    }

    // EDR Selection Logic
    const edrBtns = document.querySelectorAll('.edr-btn');
    const edrContents = document.querySelectorAll('.edr-content');
    
    // Hide all EDR content initially
    edrContents.forEach(content => {
        content.classList.remove('active');
    });
    
    edrBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            edrBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Hide all content sections
            edrContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the corresponding content
            const edrId = this.getAttribute('data-edr');
            document.getElementById(edrId + '-content').classList.add('active');
        });
    });

    // Add a global event delegation handler for article navigation
    document.addEventListener('click', function(e) {
        // Handle article nav clicks
        if (e.target && (e.target.closest('.nav-items li') || e.target.closest('.nav-items a'))) {
            const navItem = e.target.closest('.nav-items li');
            if (navItem) {
                // Get all li elements in this navigation
                const navItems = navItem.parentElement.querySelectorAll('li');
                
                // Remove active class from all items
                navItems.forEach(item => item.classList.remove('active'));
                
                // Add active class to clicked item
                navItem.classList.add('active');
                
                // Get the target section ID
                const sectionId = navItem.getAttribute('data-section');
                
                // Find the article-content container
                const articleContent = navItem.closest('.article-layout').querySelector('.article-content');
                
                // Hide all sections
                const sections = articleContent.querySelectorAll('.article-section');
                sections.forEach(section => section.classList.remove('active'));
                
                // Show the target section
                setTimeout(() => {
                    const targetSection = document.getElementById(sectionId);
                    if (targetSection) {
                        targetSection.classList.add('active');
                    }
                }, 50);
            }
        }
    });
});
