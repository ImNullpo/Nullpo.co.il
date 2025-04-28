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
        showHome();
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
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
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

    // Get context snippets around matched terms - modified for whole word matching
    function getContextSnippets(text, searchTerm, maxSnippets = 2) {
        // Create a regex with word boundaries to match the whole word only
        const wordRegex = new RegExp(`\\b${escapeRegExp(searchTerm)}\\b`, 'gi');
        
        // Find sentences containing the whole word
        const sentenceRegex = new RegExp(`[^.!?]*\\b${escapeRegExp(searchTerm)}\\b[^.!?]*`, 'gi');
        const matches = text.match(sentenceRegex) || [];
        
        // Limit number of snippets and trim them
        return matches.slice(0, maxSnippets).map(snippet => {
            // Trim to reasonable length and highlight the search term
            const trimmed = snippet.trim();
            return highlightWholeWord(trimmed, searchTerm);
        });
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
                <h1>EPO & DB</h1>
                <h2>Essential configuration and management of EPO servers and databases</h2>
                
                <p>The Trellix ePO (ePolicy Orchestrator) server is the central management console for the entire Trellix ecosystem. This article covers essential configuration and management aspects of the EPO server and its database.</p>
                
                <h3>Server Setup and Configuration</h3>
                <p>Setting up a Trellix EPO server involves configuring both the application server and the database that stores all management data. For production environments, it's recommended to use separate servers for the application and database components.</p>
                
                <h3>Database Management</h3>
                <p>Trellix EPO supports Microsoft SQL Server and can be configured with various database options. Regular maintenance tasks like backups, index rebuilds, and performance tuning are essential for optimal operation.</p>
                
                <h3>Scaling and High Availability</h3>
                <p>For large environments, implementing redundancy through database mirroring or clustering is recommended. The EPO application server can also be configured in a failover cluster for high availability.</p>
                
                <h3>Performance Optimization</h3>
                <p>Optimizing EPO server performance requires regular monitoring and tuning of both the application server and database. Key metrics include response time, memory usage, and database query performance.</p>
                
                <h3>Security Best Practices</h3>
                <p>Securing the EPO server infrastructure involves implementing proper authentication methods, network security, and database security measures. Regular security audits and updates are essential.</p>
            `,
            'agent-handlers': `
                <h1>Agent Handlers</h1>
                <h2>Setup and management of agent handlers for optimal communication</h2>
                
                <p>Agent Handlers are a critical component in the Trellix EPO architecture, responsible for communication between the EPO server and endpoints. This article covers setup, configuration, and management best practices.</p>
                
                <h3>Agent Handler Architecture</h3>
                <p>Agent Handlers serve as communication brokers between the EPO server and managed endpoints. They can be deployed in various configurations depending on network topology and requirements.</p>
                
                <h3>Deployment Strategies</h3>
                <p>For optimal performance, Agent Handlers should be strategically placed across network segments. In distributed environments, multiple Agent Handlers can be deployed to balance load and optimize communication paths.</p>
                
                <h3>Configuration Best Practices</h3>
                <p>Key configuration parameters include connection limits, communication protocols, and authentication methods. Proper configuration ensures reliable and secure communication with endpoints.</p>
                
                <h3>Monitoring and Maintenance</h3>
                <p>Regular monitoring of Agent Handler performance is essential for identifying potential issues. Key metrics include connection counts, response times, and queue lengths.</p>
                
                <h3>Troubleshooting Common Issues</h3>
                <p>Common issues with Agent Handlers include connection failures, authentication problems, and performance bottlenecks. Proper logging and monitoring can help identify and resolve these issues quickly.</p>
            `,
            'dxl': `
                <h1>DXL</h1>
                <h2>Data Exchange Layer architecture and implementation guide</h2>
                
                <p>The Data Exchange Layer (DXL) is a messaging fabric that allows different security products within the Trellix ecosystem to communicate with each other. This article provides an overview of DXL architecture and implementation guidelines.</p>
                
                <h3>DXL Architecture Overview</h3>
                <p>DXL operates as a publish-subscribe messaging system that enables real-time information sharing between different security components. The architecture includes brokers, clients, and the messaging fabric itself.</p>
                
                <h3>Implementation Planning</h3>
                <p>Implementing DXL requires careful planning of broker topology, network requirements, and integration with existing security infrastructure. Scalability and reliability considerations are essential for enterprise deployments.</p>
                
                <h3>Integration with EPO</h3>
                <p>DXL can be integrated with EPO to enable automated responses to security events. This integration allows for policy-based actions to be triggered based on threat intelligence or security events.</p>
                
                <h3>Custom Integrations</h3>
                <p>DXL provides APIs and SDKs for custom integrations with third-party security tools. This extensibility allows organizations to build comprehensive security solutions that leverage the entire security ecosystem.</p>
                
                <h3>Monitoring and Management</h3>
                <p>Proper monitoring of DXL components ensures reliable operation. Key metrics include message throughput, broker health, and client connection status.</p>
            `,
            'tie': `
                <h1>TIE</h1>
                <h2>Threat Intelligence Exchange server setup and management</h2>
                
                <p>Threat Intelligence Exchange (TIE) is a Trellix solution that enables sharing of threat information across the security infrastructure. This article covers setup, configuration, and management of TIE servers.</p>
                
                <h3>TIE Architecture</h3>
                <p>TIE operates on the DXL messaging fabric and includes server components, client integrations, and reputation providers. The architecture allows for centralized management of file and certificate reputation data.</p>
                
                <h3>Installation and Configuration</h3>
                <p>Installing TIE involves deploying server components, configuring DXL integration, and setting up reputation sources. Initial configuration includes defining reputation thresholds and policy settings.</p>
                
                <h3>Integration with Security Products</h3>
                <p>TIE integrates with other Trellix products including ENS, Web Gateway, and Network Security Platform. These integrations enable coordinated security responses based on shared threat intelligence.</p>
                
                <h3>External Threat Feeds</h3>
                <p>TIE can incorporate external threat intelligence feeds to enhance its reputation database. Configuration of these feeds requires proper validation and trust settings.</p>
                
                <h3>Operational Management</h3>
                <p>Day-to-day management of TIE includes monitoring reputation data quality, managing false positives, and ensuring proper synchronization across the environment.</p>
            `,
            'ivx': `
                <h1>IVX</h1>
                <h2>Investigation Exchange server configuration and usage</h2>
                
                <p>Investigation Exchange (IVX) provides advanced investigation capabilities within the Trellix ecosystem. This article covers configuration, usage scenarios, and best practices for IVX implementation.</p>
                
                <h3>IVX Architecture Overview</h3>
                <p>The IVX architecture includes server components, integration with DXL, and client connections. It enables automated collection and analysis of security data from multiple sources.</p>
                
                <h3>Deployment Planning</h3>
                <p>Planning an IVX deployment involves sizing server resources, configuring storage requirements, and planning integration with existing security tools. Performance considerations are critical for large environments.</p>
                
                <h3>Integration with Security Infrastructure</h3>
                <p>IVX integrates with EPO, ENS, and other security components to collect and correlate investigation data. These integrations allow for comprehensive security investigations across the environment.</p>
                
                <h3>Investigation Workflows</h3>
                <p>Configuring investigation workflows involves defining data collection parameters, analysis rules, and response actions. Proper configuration ensures efficient and effective security investigations.</p>
                
                <h3>Case Management</h3>
                <p>IVX provides case management capabilities for tracking security investigations. Configuration of case workflows, assignment rules, and notification settings is essential for operational efficiency.</p>
            `,
            'hx': `
                <h1>HX</h1>
                <h2>Host Exchange server deployment and administration</h2>
                
                <p>Host Exchange (HX) is an advanced endpoint detection and response solution within the Trellix ecosystem. This article covers deployment, configuration, and administration of HX servers.</p>
                
                <h3>HX Architecture</h3>
                <p>The HX architecture includes server components, endpoint agents, and integration with the broader security infrastructure. It provides advanced endpoint monitoring and response capabilities.</p>
                
                <h3>Server Deployment</h3>
                <p>Deploying HX servers involves sizing hardware resources, configuring database settings, and planning for scalability. High availability configurations are recommended for enterprise environments.</p>
                
                <h3>Agent Deployment</h3>
                <p>HX agents can be deployed using EPO or standalone installation methods. Configuration of agent settings, data collection parameters, and communication settings is critical for effective operation.</p>
                
                <h3>Integration with Security Tools</h3>
                <p>HX integrates with other Trellix products and third-party security tools through DXL and API connections. These integrations enable coordinated security monitoring and response.</p>
                
                <h3>Operational Procedures</h3>
                <p>Day-to-day management of HX includes monitoring agent health, reviewing alerts, and conducting threat hunting activities. Regular maintenance ensures optimal performance and detection capabilities.</p>
            `,
            'agent': `
                <h1>Agent</h1>
                <h2>Trellix agent deployment strategies and troubleshooting</h2>
                
                <p>The Trellix agent is the foundation of endpoint security in the Trellix ecosystem. This article covers deployment strategies, configuration best practices, and troubleshooting techniques.</p>
                
                <h3>Agent Architecture</h3>
                <p>The Trellix agent includes core components and product-specific modules. Understanding the architecture is essential for proper deployment and troubleshooting.</p>
                
                <h3>Deployment Methods</h3>
                <p>Agents can be deployed using various methods including EPO push installation, email deployment, and integration with system management tools. The choice of deployment method depends on network topology and organizational requirements.</p>
                
                <h3>Configuration Best Practices</h3>
                <p>Proper agent configuration ensures optimal protection while minimizing performance impact. Key configuration parameters include communication settings, update settings, and product-specific options.</p>
                
                <h3>Common Troubleshooting Techniques</h3>
                <p>Troubleshooting agent issues involves checking communication status, reviewing log files, and validating policy assignments. Common issues include installation failures, communication problems, and policy application errors.</p>
                
                <h3>Performance Optimization</h3>
                <p>Optimizing agent performance involves balancing security requirements with system resource usage. Configuration adjustments can significantly impact both security effectiveness and endpoint performance.</p>
            `,
            'ens': `
                <h1>ENS</h1>
                <h2>Endpoint Security installation, configuration and best practices</h2>
                
                <p>Endpoint Security (ENS) is Trellix's comprehensive endpoint protection platform. This article covers installation, configuration, and operational best practices for ENS deployment.</p>
                
                <h3>ENS Components</h3>
                <p>ENS includes multiple modules such as Threat Prevention, Firewall, Web Control, and Adaptive Threat Protection. Understanding these components is essential for proper deployment and configuration.</p>
                
                <h3>Installation Planning</h3>
                <p>Planning an ENS deployment involves selecting appropriate modules, defining security policies, and preparing the infrastructure for agent deployment. Pilot testing is recommended before full deployment.</p>
                
                <h3>Policy Configuration</h3>
                <p>ENS policies define the security behavior of endpoints. Proper policy configuration involves balancing security requirements with operational needs. Policy inheritance and organization structure should be carefully planned.</p>
                
                <h3>Exclusion Management</h3>
                <p>Managing exclusions is critical for avoiding false positives and ensuring compatibility with business applications. Proper exclusion testing and documentation is essential for security effectiveness.</p>
                
                <h3>Performance Tuning</h3>
                <p>Tuning ENS performance involves adjusting scan settings, real-time protection options, and other configuration parameters. Regular performance monitoring helps identify opportunities for optimization.</p>
            `,
            'solidcore': `
                <h1>Solidcore</h1>
                <h2>Application control and whitelisting with Solidcore</h2>
                
                <p>Solidcore provides application control and whitelisting capabilities within the Trellix ecosystem. This article covers implementation strategies, operational procedures, and best practices for Solidcore deployment.</p>
                
                <h3>Solidcore Architecture</h3>
                <p>Solidcore operates by controlling which applications can run on endpoints. Understanding its architecture and protection mechanisms is essential for proper implementation.</p>
                
                <h3>Implementation Strategies</h3>
                <p>Implementing Solidcore requires careful planning and a phased approach. Initial deployment typically involves observation mode before enabling enforcement. Proper planning minimizes business disruption.</p>
                
                <h3>Whitelisting Approaches</h3>
                <p>Solidcore supports various whitelisting strategies including publisher-based, path-based, and hash-based approaches. The choice of strategy depends on security requirements and operational constraints.</p>
                
                <h3>Change Control Integration</h3>
                <p>Integrating Solidcore with change control processes ensures that authorized changes can be implemented without security disruption. Proper integration is essential for operational efficiency.</p>
                
                <h3>Ongoing Management</h3>
                <p>Managing Solidcore involves handling change requests, updating whitelists, and monitoring for unauthorized application execution attempts. Regular reviews of whitelisting rules help maintain security effectiveness.</p>
            `,
            'dlp': `
                <h1>DLP</h1>
                <h2>Data Loss Prevention setup and policy management</h2>
                
                <p>Data Loss Prevention (DLP) protects sensitive data from unauthorized disclosure. This article covers setup, policy configuration, and operational procedures for DLP implementation.</p>
                
                <h3>DLP Architecture</h3>
                <p>DLP includes endpoint and network components that work together to protect sensitive data. Understanding the architecture is essential for proper deployment and configuration.</p>
                
                <h3>Classification Strategy</h3>
                <p>Developing a data classification strategy is a critical first step in DLP implementation. Classification can be based on content analysis, contextual information, or explicit tagging.</p>
                
                <h3>Policy Development</h3>
                <p>DLP policies define what data is protected and how protection is enforced. Policy development should align with organizational data protection requirements and compliance obligations.</p>
                
                <h3>Incident Response Workflow</h3>
                <p>Configuring incident response workflows involves defining alerting criteria, assignment rules, and remediation procedures. Effective workflows balance security with operational efficiency.</p>
                
                <h3>User Education</h3>
                <p>User notifications and education are important components of a successful DLP implementation. Proper configuration of user interaction helps improve security awareness and reduce policy violations.</p>
            `,
            'sir': `
                <h1>SIR</h1>
                <h2>Security Information Reporting configuration and usage</h2>
                
                <p>Security Information Reporting (SIR) provides comprehensive reporting capabilities for the Trellix ecosystem. This article covers configuration, report development, and operational usage of SIR.</p>
                
                <h3>SIR Architecture</h3>
                <p>SIR includes reporting server components, data collection mechanisms, and integration with EPO. Understanding the architecture is essential for proper deployment and usage.</p>
                
                <h3>Deployment Planning</h3>
                <p>Planning a SIR deployment involves sizing server resources, configuring database settings, and defining data retention policies. Performance considerations are important for large environments.</p>
                
                <h3>Report Development</h3>
                <p>Developing effective security reports involves selecting appropriate data sources, defining filtering criteria, and designing readable report layouts. Report scheduling ensures timely distribution of security information.</p>
                
                <h3>Dashboard Configuration</h3>
                <p>SIR dashboards provide at-a-glance security visibility. Configuration involves selecting key metrics, designing widget layouts, and setting refresh intervals.</p>
                
                <h3>Compliance Reporting</h3>
                <p>SIR can generate reports for regulatory compliance purposes. Configuration involves mapping security data to compliance requirements and designing appropriate report formats.</p>
            `,
            'alerts': `
                <h1>Alerts</h1>
                <h2>Alert management, tuning, and response procedures</h2>
                
                <p>Effective alert management is critical for security operations. This article covers alert configuration, tuning methodologies, and response procedures for the Trellix ecosystem.</p>
                
                <h3>Alert Configuration</h3>
                <p>Configuring alerts involves defining detection criteria, severity levels, and notification methods. Proper configuration ensures that security personnel receive timely and relevant alerts.</p>
                
                <h3>Alert Tuning Methodology</h3>
                <p>Alert tuning is an ongoing process that balances detection sensitivity with alert volume. A structured tuning methodology helps minimize false positives while maintaining detection effectiveness.</p>
                
                <h3>Response Procedures</h3>
                <p>Defining alert response procedures ensures consistent and effective handling of security incidents. Procedures should include initial assessment, containment actions, and escalation criteria.</p>
                
                <h3>Alert Correlation</h3>
                <p>Correlating alerts from multiple sources provides comprehensive security visibility. Configuration of correlation rules helps identify complex attack patterns that might not be evident from individual alerts.</p>
                
                <h3>Performance Metrics</h3>
                <p>Measuring alert management performance involves tracking metrics such as false positive rates, response times, and resolution effectiveness. Regular review of these metrics helps improve security operations.</p>
            `,
            'epo-best-practices': `
                <h1>EPO Best Practices</h1>
                <h2>Recommendations for optimal EPO operation and maintenance</h2>
                
                <p>Following best practices for EPO operation ensures optimal performance and reliability. This article covers recommended practices for various aspects of EPO management.</p>
                
                <h3>System Architecture</h3>
                <p>Recommended system architecture includes proper sizing of server resources, database configuration, and network topology. High availability configurations are recommended for critical environments.</p>
                
                <h3>Organizational Structure</h3>
                <p>Designing an effective organizational structure in EPO involves creating appropriate groups, assigning permissions, and implementing policy inheritance. Proper structure simplifies management and ensures consistent security.</p>
                
                <h3>Policy Management</h3>
                <p>Best practices for policy management include version control, testing procedures, and deployment strategies. Proper policy management helps maintain security effectiveness while minimizing operational disruption.</p>
                
                <h3>Database Maintenance</h3>
                <p>Regular database maintenance is essential for EPO performance. Recommended practices include index rebuilding, statistics updates, and data purging. Maintenance should be scheduled during low-activity periods.</p>
                
                <h3>Upgrade Planning</h3>
                <p>Planning EPO upgrades involves testing compatibility, creating backups, and scheduling appropriate maintenance windows. A phased approach to upgrades minimizes risk and ensures successful implementation.</p>
            `,
            'tasks': `
                <h1>Client & Server Tasks</h1>
                <h2>Scheduling and managing automated tasks for clients and servers</h2>
                
                <p>Automated tasks are essential for efficient management of the Trellix ecosystem. This article covers configuration and management of both client and server tasks in EPO.</p>
                
                <h3>Task Types</h3>
                <p>EPO supports various task types including product deployment, policy enforcement, and data collection. Understanding these task types is essential for proper automation implementation.</p>
                
                <h3>Client Task Configuration</h3>
                <p>Configuring client tasks involves defining execution parameters, scheduling options, and target systems. Proper configuration ensures reliable task execution while minimizing performance impact.</p>
                
                <h3>Server Task Management</h3>
                <p>Server tasks handle backend operations such as report generation, data purging, and system maintenance. Configuration involves setting execution schedules, defining parameters, and monitoring execution status.</p>
                
                <h3>Task Scheduling Strategies</h3>
                <p>Effective task scheduling involves balancing operational requirements with system load considerations. Staggered scheduling helps prevent resource contention and network congestion.</p>
                
                <h3>Performance Monitoring</h3>
                <p>Monitoring task performance helps identify execution issues and optimization opportunities. Key metrics include completion rates, execution times, and resource usage during task execution.</p>
            `,
            'troubleshooting-tips': `
                <h1>Common Troubleshooting Tips</h1>
                <h2>Frequent issues and their solutions for Trellix EPO environment</h2>
                
                <p>Troubleshooting is an essential skill for managing Trellix environments. This article provides guidance for diagnosing and resolving common issues across the Trellix ecosystem.</p>
                
                <h3>Agent Communication Issues</h3>
                <p>Agent communication problems are among the most common issues in EPO environments. Troubleshooting involves checking network connectivity, validating authentication credentials, and reviewing server-side connections.</p>
                
                <h3>Policy Application Failures</h3>
                <p>When policies fail to apply correctly, troubleshooting steps include checking policy assignment, validating policy content, and reviewing agent enforcement capabilities.</p>
                
                <h3>Database Performance Problems</h3>
                <p>Database performance issues can impact overall EPO functionality. Troubleshooting involves checking query performance, validating index health, and reviewing database configuration settings.</p>
                
                <h3>Product Deployment Failures</h3>
                <p>When product deployment fails, troubleshooting includes checking package availability, validating agent capabilities, and reviewing deployment task configuration.</p>
                
                <h3>Reporting and Dashboard Issues</h3>
                <p>Troubleshooting reporting problems involves checking data sources, validating query parameters, and reviewing report execution logs. Common issues include missing data and performance degradation.</p>
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
            'troubleshooting-tips': 'fas fa-wrench'
        };
        
        return icons[articleId] || 'fas fa-file';
    }
});
