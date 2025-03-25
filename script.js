document.addEventListener('DOMContentLoaded', function() {
    // Guide Buttons
    const guideButtons = document.querySelectorAll('.guide-button');
    const landingSection = document.querySelector('.landing-section');
    const guidesSection = document.querySelector('.guides-section');
    const guideContents = document.querySelectorAll('.guide-content');
  
    guideButtons.forEach(button => {
      button.addEventListener('click', function() {
        const guideId = this.getAttribute('data-guide');
  
        // Start transition - fade out landing section
        landingSection.classList.add('hidden');
  
        // After landing section fades out, show guides section
        setTimeout(() => {
          landingSection.style.display = 'none';
          guidesSection.style.display = 'block';
  
          // Start fade in for guides section
          setTimeout(() => {
            guidesSection.classList.add('visible');
  
            // Hide all guides, then show the selected one
            guideContents.forEach(content => {
              content.classList.remove('active');
            });
            document.getElementById(guideId).classList.add('active');
  
            // Scroll to top of guides section
            window.scrollTo(0, 0);
          }, 50); // Small delay to ensure display change is processed
        }, 400); // Match the CSS transition time
      });
    });
  
    // Navigation Dots
    const navDots = document.querySelectorAll('.nav-dot');
  
    // Add section names to dots
    const sectionNames = {
      'epo': 'ePO Setup',
      'db': 'Database Configuration',
      'tie': 'TIE Setup',
      'ivx': 'IVX Configuration',
      'whoami': 'About Me'
    };
  
    navDots.forEach(dot => {
      const sectionId = dot.getAttribute('data-section');
      if (sectionId && sectionNames[sectionId]) {
        dot.setAttribute('data-section-name', sectionNames[sectionId]);
      }
    });
  
    // Adjust spacing based on number of dots
    document.querySelectorAll('.guide-navigation').forEach(nav => {
      const dotCount = nav.querySelectorAll('.nav-dot').length;
      if (dotCount > 4) {
        // For more dots, decrease the margin
        nav.querySelectorAll('.nav-dot').forEach(dot => {
          dot.style.margin = '0 10px';
        });
      } else if (dotCount <= 2) {
        // For fewer dots, increase the margin
        nav.querySelectorAll('.nav-dot').forEach(dot => {
          dot.style.margin = '0 40px';
        });
      }
      // Update the line width
      const lineWidth = (dotCount - 1) * (dotCount > 4 ? 40 : (dotCount <= 2 ? 100 : 60));
      nav.style.setProperty('--line-width', lineWidth + 'px');
    });
  
    navDots.forEach(dot => {
      dot.addEventListener('click', function() {
        const sectionId = this.getAttribute('data-section');
        const parentGuide = this.closest('.guide-content');
  
        // Update active dot
        parentGuide.querySelectorAll('.nav-dot').forEach(d => {
          d.classList.remove('active');
        });
        this.classList.add('active');
  
        // Show corresponding section
        parentGuide.querySelectorAll('.guide-section').forEach(section => {
          section.classList.remove('active');
        });
        
        const targetSection = parentGuide.querySelector(`#${sectionId}`);
        if (targetSection) {
          targetSection.classList.add('active');
          
          // Initialize environment options if they exist in this section
          const firstOption = targetSection.querySelector('.decision-option');
          if (firstOption && !firstOption.classList.contains('selected')) {
            firstOption.click();
          }
          
          // Scroll to top of section
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  
    // Header logo navigation
    const headerLogo = document.querySelector('.header-logo');
    if (headerLogo) {
      headerLogo.addEventListener('click', function() {
        // Start transition - fade out guides section
        guidesSection.classList.remove('visible');
  
        // After guides section fades out, show landing section
        setTimeout(() => {
          guidesSection.style.display = 'none';
          landingSection.style.display = 'flex';
          landingSection.classList.remove('hidden');
  
          // Scroll to top of landing section
          window.scrollTo(0, 0);
        }, 400); // Match the CSS transition time
      });
    }
  
    // Discord tooltip functionality
    const discordButton = document.querySelector('.social-button.discord');
    const tooltip = document.querySelector('.tooltip');
  
    if (discordButton && tooltip) {
      discordButton.addEventListener('click', function(e) {
        e.preventDefault();
        // Toggle tooltip visibility on click as well
        tooltip.style.opacity = tooltip.style.opacity === '1' ? '0' : '1';
        tooltip.style.visibility = tooltip.style.visibility === 'visible' ? 'hidden' : 'visible';
      });
    }
  
    // ===== ENHANCED SEARCH FUNCTIONALITY =====
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const searchResults = document.getElementById('searchResults');
    
    if (searchInput && searchButton && searchResults) {
      // Create a comprehensive search index
      function createSearchIndex() {
        const searchItems = [];
        
        // Process guides
        document.querySelectorAll('.guide-content').forEach(guide => {
          const guideId = guide.id;
          const guideName = guide.querySelector('h2')?.textContent || 'Guide';
          
          // Process sections within each guide
          guide.querySelectorAll('.guide-section').forEach(section => {
            const sectionId = section.id;
            const sectionName = section.querySelector('h3')?.textContent || 'Section';
            
            // Main section content
            const sectionDescription = section.querySelector('.section-header + .content-card p')?.textContent || '';
            searchItems.push({
              title: sectionName,
              path: `${guideName} > ${sectionName}`,
              content: sectionDescription,
              guide: guideId,
              section: sectionId,
              element: section,
              type: 'section'
            });
            
            // Process content cards (excluding the first description card)
            section.querySelectorAll('.content-card').forEach((card, cardIndex) => {
              if (cardIndex === 0 && card.querySelector('p')?.textContent === sectionDescription) {
                return; // Skip the first card if it's just the section description
              }
              
              const cardTitle = card.querySelector('h4')?.textContent || 'Content';
              const cardContent = card.textContent.replace(cardTitle, '').trim().substring(0, 200);
              
              searchItems.push({
                title: `${cardTitle} (${sectionName})`,
                path: `${guideName} > ${sectionName} > ${cardTitle}`,
                content: cardContent,
                guide: guideId,
                section: sectionId,
                element: card,
                type: 'card'
              });
            });
            
            // Process steps
            section.querySelectorAll('.step').forEach((step, index) => {
              const stepHeading = step.querySelector('h5');
              const stepNumber = stepHeading?.getAttribute('data-step') || (index + 1);
              const stepTitle = stepHeading?.textContent || `Step ${stepNumber}`;
              const stepContent = step.querySelector('p')?.textContent || '';
              
              searchItems.push({
                title: `Step ${stepNumber}: ${stepTitle} (${sectionName})`,
                path: `${guideName} > ${sectionName} > Step ${stepNumber}`,
                content: stepContent,
                guide: guideId,
                section: sectionId,
                element: step,
                type: 'step'
              });
            });
            
            // Process commands
            section.querySelectorAll('.command-box').forEach((cmd, index) => {
              const parentStep = cmd.closest('.step');
              let contextPath = `${guideName} > ${sectionName}`;
              
              if (parentStep) {
                const stepHeading = parentStep.querySelector('h5');
                const stepNumber = stepHeading?.getAttribute('data-step') || '';
                contextPath += ` > Step ${stepNumber}`;
              }
              
              searchItems.push({
                title: `Command (${sectionName})`,
                path: `${contextPath} > Command`,
                content: cmd.textContent,
                guide: guideId,
                section: sectionId,
                element: cmd,
                type: 'command'
              });
            });
            
            // Process lists and tables
            section.querySelectorAll('.requirement-list, .component-list').forEach((list) => {
              const listItems = Array.from(list.querySelectorAll('li')).map(li => li.textContent).join(' | ');
              const contextCard = list.closest('.content-card');
              const cardTitle = contextCard?.querySelector('h4')?.textContent || 'List';
              
              searchItems.push({
                title: `${cardTitle} (${sectionName})`,
                path: `${guideName} > ${sectionName} > ${cardTitle}`,
                content: listItems,
                guide: guideId,
                section: sectionId,
                element: list.closest('.content-card'),
                type: 'list'
              });
            });
            
            // Process tables
            section.querySelectorAll('table').forEach((table) => {
              const tableData = [];
              table.querySelectorAll('tr').forEach(row => {
                tableData.push(row.textContent.trim().replace(/\s+/g, ' '));
              });
              
              const contextCard = table.closest('.content-card');
              const cardTitle = contextCard?.querySelector('h4')?.textContent || 'Table';
              
              searchItems.push({
                title: `${cardTitle} (${sectionName})`,
                path: `${guideName} > ${sectionName} > ${cardTitle}`,
                content: tableData.join(' | '),
                guide: guideId,
                section: sectionId,
                element: table.closest('.content-card'),
                type: 'table'
              });
            });
            
            // Process code blocks
            section.querySelectorAll('.code-container').forEach((codeBlock) => {
              const contextCard = codeBlock.closest('.content-card');
              const cardTitle = contextCard?.querySelector('h4')?.textContent || 'Code';
              
              searchItems.push({
                title: `${cardTitle} Code (${sectionName})`,
                path: `${guideName} > ${sectionName} > ${cardTitle}`,
                content: codeBlock.textContent,
                guide: guideId,
                section: sectionId,
                element: codeBlock,
                type: 'code'
              });
            });
          });
        });
        
        return searchItems;
      }
      
      // Create index once on page load
      const searchIndex = createSearchIndex();
      console.log(`Search index created with ${searchIndex.length} items`);
      
      // Enhanced search function
      function search(query) {
        if (!query || query.length < 2) {
          searchResults.classList.remove('active');
          return;
        }
        
        searchResults.innerHTML = '';
        const queryLower = query.toLowerCase();
        
        // Find matches with scoring
        const matches = searchIndex.filter(item => {
          const titleMatch = item.title.toLowerCase().includes(queryLower);
          const contentMatch = item.content.toLowerCase().includes(queryLower);
          return titleMatch || contentMatch;
        }).map(item => {
          // Score items: title matches are more important than content matches
          const titleMatchScore = item.title.toLowerCase().includes(queryLower) ? 10 : 0;
          const contentMatchScore = item.content.toLowerCase().includes(queryLower) ? 5 : 0;
          
          // Type-based scoring (boost important content types)
          let typeScore = 0;
          if (item.type === 'section') typeScore = 3;
          else if (item.type === 'step') typeScore = 2;
          else if (item.type === 'command') typeScore = 1;
          
          return {
            ...item,
            score: titleMatchScore + contentMatchScore + typeScore
          };
        }).sort((a, b) => b.score - a.score); // Sort by score
        
        if (matches.length === 0) {
          searchResults.innerHTML = '<div class="no-results">No results found</div>';
        } else {
          // Show top results (limit to 8)
          matches.slice(0, 8).forEach(result => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            
            // Create a type indicator icon
            let typeIcon = 'fas fa-file-alt'; // Default icon
            if (result.type === 'section') typeIcon = 'fas fa-bookmark';
            else if (result.type === 'step') typeIcon = 'fas fa-list-ol';
            else if (result.type === 'command') typeIcon = 'fas fa-terminal';
            else if (result.type === 'code') typeIcon = 'fas fa-code';
            else if (result.type === 'table' || result.type === 'list') typeIcon = 'fas fa-table';
            
            // Create snippet with highlighted match
            let snippet = result.content;
            if (snippet.toLowerCase().includes(queryLower)) {
              const index = snippet.toLowerCase().indexOf(queryLower);
              const start = Math.max(0, index - 40);
              const end = Math.min(snippet.length, index + query.length + 60);
              snippet = (start > 0 ? '...' : '') + 
                        snippet.substring(start, end) + 
                        (end < snippet.length ? '...' : '');
              
              // Highlight the matched text
              snippet = snippet.replace(
                new RegExp(query, 'gi'), 
                match => `<span class="search-highlight">${match}</span>`
              );
            } else {
              // If match is not in the snippet (e.g., in title only), use beginning of content
              snippet = snippet.substring(0, 100) + (snippet.length > 100 ? '...' : '');
            }
            
            item.innerHTML = `
              <div class="result-icon"><i class="${typeIcon}"></i></div>
              <div class="result-content">
                <div class="result-title">${result.title}</div>
                <div class="result-path">${result.path}</div>
                <div class="result-snippet">${snippet}</div>
              </div>
            `;
            
            // Add click handler
            item.addEventListener('click', function() {
              navigateToResult(result);
            });
            
            searchResults.appendChild(item);
          });
        }
        
        searchResults.classList.add('active');
      }
      
      // Enhanced navigation to search result with better scrolling and highlighting
      function navigateToResult(result) {
        // First, ensure guides section is showing
        const guidesSection = document.querySelector('.guides-section');
        const landingSection = document.querySelector('.landing-section');
        
        if (getComputedStyle(guidesSection).display === 'none') {
          // Show guides section
          landingSection.classList.add('hidden');
          
          setTimeout(() => {
            landingSection.style.display = 'none';
            guidesSection.style.display = 'block';
            
            setTimeout(() => {
              guidesSection.classList.add('visible');
              showContent();
            }, 50);
          }, 400);
        } else {
          showContent();
        }
        
        function showContent() {
          // Show correct guide
          document.querySelectorAll('.guide-content').forEach(content => {
            content.classList.remove('active');
          });
          document.getElementById(result.guide).classList.add('active');
          
          // Show correct section
          const guide = document.getElementById(result.guide);
          guide.querySelectorAll('.guide-section').forEach(section => {
            section.classList.remove('active');
          });
          guide.querySelector(`#${result.section}`).classList.add('active');
          
          // Update sidebar active state
          guide.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === result.section) {
              item.classList.add('active');
            }
          });
          
          // Scroll to element after a small delay
          setTimeout(() => {
            if (result.element) {
              // Scroll the element into view
              result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              
              // Apply highlight animation
              result.element.classList.add('search-target');
              
              // For specific highlight of commands and steps
              if (result.type === 'step' || result.type === 'command') {
                result.element.style.animation = 'highlightPulse 2s ease-in-out';
              }
              
              setTimeout(() => {
                result.element.classList.remove('search-target');
                if (result.type === 'step' || result.type === 'command') {
                  result.element.style.animation = '';
                }
              }, 3000);
            }
            
            // Hide search results
            searchResults.classList.remove('active');
            searchInput.value = '';
          }, 300);
        }
      }
      
      // Event listeners for search
      searchButton.addEventListener('click', function() {
        search(searchInput.value);
      });
      
      searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
          search(searchInput.value);
        } else if (searchInput.value.length >= 2) {
          search(searchInput.value);
        } else if (searchInput.value.length === 0) {
          searchResults.classList.remove('active');
        }
      });
      
      // Focus on search input with keyboard shortcut (Ctrl+K or /)
      document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey && e.key === 'k') || e.key === '/') {
          if (document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
          }
        }
      });
      
      // Close search results when clicking outside
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container')) {
          searchResults.classList.remove('active');
        }
      });
    }
  
    // Find all steps and update their structure
    document.querySelectorAll('.step').forEach(step => {
      // Find the heading and add the step number as data attribute
      const stepNumber = step.querySelector('.step-number')?.textContent;
      const heading = step.querySelector('h5');
      if (heading && stepNumber) {
        heading.setAttribute('data-step', stepNumber);
      }
      
      // Remove the old step number element
      const oldStepNumber = step.querySelector('.step-number');
      if (oldStepNumber) {
        oldStepNumber.remove();
      }
    });
  
    // Sidebar navigation functionality
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    sidebarItems.forEach(item => {
      item.addEventListener('click', function() {
        const sectionId = this.getAttribute('data-section');
        const parentGuide = this.closest('.guide-content');
        
        // Update active state in sidebar
        parentGuide.querySelectorAll('.sidebar-item').forEach(sideItem => {
          sideItem.classList.remove('active');
        });
        this.classList.add('active');
        
        // Show corresponding section
        parentGuide.querySelectorAll('.guide-section').forEach(section => {
          section.classList.remove('active');
        });
        
        const targetSection = parentGuide.querySelector(`#${sectionId}`);
        if (targetSection) {
          targetSection.classList.add('active');
          
          // Initialize environment options if they exist in this section
          const firstOption = targetSection.querySelector('.decision-option');
          if (firstOption && !firstOption.classList.contains('selected')) {
            firstOption.click();
          }
          
          // Scroll to top of section
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  
    // Tab functionality for installation guides
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', function() {
        // Get the parent tab container
        const tabContainer = this.closest('.installation-tabs');
        
        // Remove active class from all buttons in this container
        tabContainer.querySelectorAll('.tab-button').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Get the target tab content
        const tabId = this.getAttribute('data-tab');
        
        // Hide all tab content in this container
        tabContainer.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        
        // Show the target tab content
        document.getElementById(tabId).classList.add('active');
      });
    });
  
    // Installation decision tree functionality
    document.querySelectorAll('.installation-decision .decision-option').forEach(option => {
      option.addEventListener('click', function() {
        const target = this.getAttribute('data-target');
        const decisionContainer = this.closest('.installation-decision');
        const flowsContainer = decisionContainer.nextElementSibling;
        
        // Update selection state
        decisionContainer.querySelectorAll('.decision-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        this.classList.add('selected');
        
        // Show corresponding installation flow
        flowsContainer.querySelectorAll('.installation-flow').forEach(flow => {
          flow.classList.remove('active');
        });
        
        const targetFlow = document.getElementById(target);
        if (targetFlow) {
          targetFlow.classList.add('active');
          
          // Smooth scroll to the installation flow
          setTimeout(() => {
            targetFlow.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      });
    });
  
    // Initialize all installation flows - select the first option by default
    document.querySelectorAll('.installation-decision').forEach(decision => {
      const firstOption = decision.querySelector('.decision-option');
      if (firstOption) {
        // Trigger click on the first option after a short delay to ensure DOM is ready
        setTimeout(() => {
          firstOption.click();
        }, 200);
      }
    });
  
    // Command copy functionality
    document.querySelectorAll('.copy-btn').forEach(button => {
      button.addEventListener('click', function() {
        const commandText = this.previousElementSibling.textContent;
        
        // Create a temporary textarea element to copy the text
        const textarea = document.createElement('textarea');
        textarea.value = commandText;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        
        // Select and copy the text
        textarea.select();
        document.execCommand('copy');
        
        // Remove the textarea
        document.body.removeChild(textarea);
        
        // Show feedback
        const originalIcon = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i>';
        this.style.color = '#2ecc71';
        
        // Restore original icon after a delay
        setTimeout(() => {
          this.innerHTML = originalIcon;
          this.style.color = '';
        }, 2000);
      });
    });
  
    // Method comparison toggle
    document.querySelector('.comparison-toggle').addEventListener('click', function() {
      this.classList.toggle('active');
      const tableContainer = document.querySelector('.comparison-table-container');
      tableContainer.classList.toggle('active');
    });
  
    // HX Deployment environment selection
    const hxEnvironmentOptions = document.querySelectorAll('#hx .decision-option');
    if (hxEnvironmentOptions.length > 0) {
      hxEnvironmentOptions.forEach(option => {
        option.addEventListener('click', function() {
          // Get the target flow ID
          const targetFlow = this.getAttribute('data-target');
          
          // Update selection state
          document.querySelectorAll('#hx .decision-option').forEach(opt => {
            opt.classList.remove('selected');
          });
          this.classList.add('selected');
          
          // Hide all flows
          document.querySelectorAll('#hx .installation-flow').forEach(flow => {
            flow.style.display = 'none';
          });
          
          // Show selected flow
          const selectedFlow = document.getElementById(targetFlow);
          if (selectedFlow) {
            selectedFlow.style.display = 'block';
          }
        });
      });
      
      // Select the first option by default
      hxEnvironmentOptions[0].click();
    }
  
    // Interactive Hover Animations
    const supportsAnimations = 
      (typeof document.documentElement.style.animation !== 'undefined') || 
      (typeof document.documentElement.style.webkitAnimation !== 'undefined');
    
    // Only apply these effects if animations are supported
    if (supportsAnimations) {
      // 1. Add Particle Effect on Command Box Hover
      const commandBoxes = document.querySelectorAll('.command-box');
      commandBoxes.forEach(box => {
        box.addEventListener('mouseenter', function() {
          // Create particle container if it doesn't exist
          let particleContainer = this.querySelector('.particle-container');
          if (!particleContainer) {
            particleContainer = document.createElement('div');
            particleContainer.className = 'particle-container';
            particleContainer.style.position = 'absolute';
            particleContainer.style.top = '0';
            particleContainer.style.left = '0';
            particleContainer.style.width = '100%';
            particleContainer.style.height = '100%';
            particleContainer.style.pointerEvents = 'none';
            particleContainer.style.overflow = 'hidden';
            this.style.position = 'relative';
            this.appendChild(particleContainer);
          }
          
          // Create 5 particles
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              if (!this.contains(particleContainer)) return; // Safety check
              
              const particle = document.createElement('div');
              particle.className = 'command-particle';
              particle.style.position = 'absolute';
              particle.style.backgroundColor = 'rgba(138, 43, 226, 0.3)';
              particle.style.borderRadius = '50%';
              particle.style.width = Math.random() * 8 + 4 + 'px';
              particle.style.height = particle.style.width;
              
              // Random position along the left border
              particle.style.left = '0px';
              particle.style.top = Math.random() * 100 + '%';
              
              // Animation with JS for better browser support
              particle.style.transition = 'all 1s ease-out';
              
              // Add to container
              particleContainer.appendChild(particle);
              
              // Trigger animation after a small delay
              setTimeout(() => {
                particle.style.transform = `translate(${Math.random() * 100 + 50}px, ${(Math.random() - 0.5) * 60}px)`;
                particle.style.opacity = '0';
              }, 10);
              
              // Remove particle after animation
              setTimeout(() => {
                if (particle.parentNode) {
                  particle.parentNode.removeChild(particle);
                }
              }, 1000);
            }, i * 100);
          }
        });
      });
      
      // 2. Magnetic Hover Effect for Feature Icons
      const featureIcons = document.querySelectorAll('.feature-icon');
      featureIcons.forEach(icon => {
        const parent = icon.closest('.feature-item') || icon.closest('.feature-card');
        if (!parent) return;
        
        parent.addEventListener('mousemove', function(e) {
          const boundingRect = this.getBoundingClientRect();
          const relX = e.clientX - boundingRect.left;
          const relY = e.clientY - boundingRect.top;
          
          const centerX = boundingRect.width / 2;
          const centerY = boundingRect.height / 2;
          
          const deltaX = (relX - centerX) / 10;
          const deltaY = (relY - centerY) / 10;
          
          icon.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });
        
        parent.addEventListener('mouseleave', function() {
          icon.style.transform = '';
        });
      });
      
      // 3. Step Highlight Animation
      const steps = document.querySelectorAll('.step');
      steps.forEach((step, index) => {
        step.addEventListener('mouseenter', function() {
          // Create a subtle pulse effect
          const highlight = document.createElement('div');
          highlight.className = 'step-highlight';
          highlight.style.position = 'absolute';
          highlight.style.top = '0';
          highlight.style.left = '0';
          highlight.style.right = '0';
          highlight.style.bottom = '0';
          highlight.style.backgroundColor = 'rgba(138, 43, 226, 0.05)';
          highlight.style.borderRadius = '8px';
          highlight.style.opacity = '0';
          highlight.style.zIndex = '-1';
          
          // Set position relative for proper absolute positioning
          this.style.position = 'relative';
          
          this.appendChild(highlight);
          
          // Animate with opacity for cross-browser support
          setTimeout(() => {
            highlight.style.transition = 'opacity 0.3s ease-in-out';
            highlight.style.opacity = '1';
          }, 10);
        });
        
        step.addEventListener('mouseleave', function() {
          const highlight = this.querySelector('.step-highlight');
          if (highlight) {
            highlight.style.opacity = '0';
            
            // Remove after transition
            setTimeout(() => {
              if (highlight.parentNode) {
                highlight.parentNode.removeChild(highlight);
              }
            }, 300);
          }
        });
      });
      
      // 4. Interactive Header Logo
      const headerLogo = document.querySelector('.header-logo');
      if (headerLogo) {
        headerLogo.addEventListener('mouseenter', function() {
          this.style.transform = 'scale(1.05)';
          this.style.textShadow = '0 0 10px rgba(138, 43, 226, 0.6)';
        });
        
        headerLogo.addEventListener('mouseleave', function() {
          this.style.transform = '';
          this.style.textShadow = '';
        });
      }
      
      // 5. Glowing Effect for Selected Decision Options
      const decisionOptions = document.querySelectorAll('.decision-option');
      decisionOptions.forEach(option => {
        const glowInterval = { interval: null };
        
        option.addEventListener('mouseenter', function() {
          if (this.classList.contains('selected')) {
            startGlowEffect(this, glowInterval);
          }
        });
        
        option.addEventListener('mouseleave', function() {
          if (glowInterval.interval) {
            clearInterval(glowInterval.interval);
            glowInterval.interval = null;
            this.style.boxShadow = '';
          }
        });
        
        // Add glow effect when option is selected
        option.addEventListener('click', function() {
          const allOptions = document.querySelectorAll('.decision-option');
          allOptions.forEach(opt => {
            const interval = opt._glowInterval;
            if (interval) {
              clearInterval(interval);
              opt._glowInterval = null;
              opt.style.boxShadow = '';
            }
          });
          
          // Start glow effect for this option
          if (this.classList.contains('selected')) {
            startGlowEffect(this, glowInterval);
          }
        });
      });
      
      function startGlowEffect(element, intervalRef) {
        // Clear existing interval
        if (intervalRef.interval) {
          clearInterval(intervalRef.interval);
        }
        
        // Create glow animation
        let intensity = 0;
        let increasing = true;
        
        intervalRef.interval = setInterval(() => {
          if (increasing) {
            intensity += 0.05;
            if (intensity >= 1) {
              intensity = 1;
              increasing = false;
            }
          } else {
            intensity -= 0.05;
            if (intensity <= 0.3) {
              intensity = 0.3;
              increasing = true;
            }
          }
          
          element.style.boxShadow = `0 0 ${10 + intensity * 15}px rgba(138, 43, 226, ${0.3 + intensity * 0.4})`;
        }, 50);
        
        // Store reference for cleanup
        element._glowInterval = intervalRef.interval;
      }
    }
    
    // Add hover effect for product info banners even if animations aren't supported
    const productBanners = document.querySelectorAll('.product-info-banner');
    productBanners.forEach(banner => {
      banner.addEventListener('mouseenter', function() {
        this.style.borderColor = 'rgba(138, 43, 226, 0.6)';
      });
      
      banner.addEventListener('mouseleave', function() {
        this.style.borderColor = '';
      });
    });
  
    // Journey selection functionality
    const journeyButtons = document.querySelectorAll('.journey-select');
    
    journeyButtons.forEach(button => {
      button.addEventListener('click', function() {
        const journey = this.getAttribute('data-journey');
        
        // Hide all content sections
        document.querySelectorAll('.epo-content-section').forEach(section => {
          section.style.display = 'none';
        });
        
        // Show selected journey content
        document.getElementById(`epo-${journey}-content`).style.display = 'block';
        
        // Scroll into view
        document.getElementById(`epo-${journey}-content`).scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Highlight the selected journey card
        document.querySelectorAll('.journey-card').forEach(card => {
          card.style.borderColor = 'var(--border-color)';
          card.style.transform = 'translateY(0)';
        });
        
        document.getElementById(`${journey}-journey`).style.borderColor = 'var(--primary)';
        document.getElementById(`${journey}-journey`).style.transform = 'translateY(-10px)';
      });
    });
  
    // Dashboard navigation functionality
    const dashboardNavItems = document.querySelectorAll('.dashboard-nav-item');
    
    dashboardNavItems.forEach(item => {
      item.addEventListener('click', function() {
        const target = this.getAttribute('data-target');
        
        // Update active navigation item
        dashboardNavItems.forEach(navItem => {
          navItem.classList.remove('active');
        });
        this.classList.add('active');
        
        // Show selected panel
        document.querySelectorAll('.dashboard-panel').forEach(panel => {
          panel.classList.remove('active');
        });
        document.getElementById(`${target}-panel`).classList.add('active');
      });
    });
  
    // Add appliance card hover effects
    const applianceCards = document.querySelectorAll('.appliance-card');
    
    applianceCards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        const icon = this.querySelector('.appliance-icon i');
        icon.style.transform = 'scale(1.2)';
      });
      
      card.addEventListener('mouseleave', function() {
        const icon = this.querySelector('.appliance-icon i');
        icon.style.transform = '';
      });
    });
  });

  // Cross-browser compatible enhancement script
  (function() {
    // Ensure the script works in all browsers
    'use strict';
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Feature detection first
      var supportsAnimation = 'animation' in document.documentElement.style || 
                             'webkitAnimation' in document.documentElement.style;
      
      var supportsTransform = 'transform' in document.documentElement.style || 
                             'webkitTransform' in document.documentElement.style ||
                             'msTransform' in document.documentElement.style;
      
      // ============ Interactive Icons =============
      
      // Animate the ePO cog icon when clicked
      var epoCogIcon = document.querySelector('.sidebar-item[data-section="epo"] i');
      if (epoCogIcon) {
        epoCogIcon.addEventListener('click', function(e) {
          e.stopPropagation(); // Prevent sidebar item click
          
          // Simple manual rotation animation that works in all browsers
          var startTime = null;
          var duration = 2000; // 2 seconds
          var startAngle = 0;
          var endAngle = 720; // Two full rotations
          
          function rotateCog(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = timestamp - startTime;
            var percentage = Math.min(progress / duration, 1);
            
            var currentAngle = startAngle + (percentage * (endAngle - startAngle));
            epoCogIcon.style.transform = 'rotate(' + currentAngle + 'deg)';
            epoCogIcon.style.webkitTransform = 'rotate(' + currentAngle + 'deg)';
            epoCogIcon.style.msTransform = 'rotate(' + currentAngle + 'deg)';
            
            if (percentage < 1) {
              window.requestAnimationFrame(rotateCog);
            } else {
              // Reset transform after animation completes
              setTimeout(function() {
                epoCogIcon.style.transform = '';
                epoCogIcon.style.webkitTransform = '';
                epoCogIcon.style.msTransform = '';
              }, 100);
            }
          }
          
          window.requestAnimationFrame(rotateCog);
          
          // Show notification
          if (window.showNotification) {
            window.showNotification('ePO Configuration Module Activated', 'fas fa-cog');
          }
        });
      }
      
      // ============ Command Box Copy Functionality =============
      
      // Enhance command boxes with copy functionality
      var commandBoxes = document.querySelectorAll('.command-box');
      commandBoxes.forEach(function(box) {
        // Make command boxes copyable with click
        box.addEventListener('click', function() {
          copyTextToClipboard(this.textContent.trim());
          showCopySuccess(this);
        });
        
        // Add copy success indicator
        var successIndicator = document.createElement('span');
        successIndicator.className = 'copy-success';
        successIndicator.textContent = 'Copied!';
        box.appendChild(successIndicator);
        
        // Add visual indication that it's clickable
        if (window.innerWidth > 768) { // Desktop only
          box.title = 'Click to copy';
          
          // Adjust hover text for Safari/iOS
          if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
            box.title = 'Tap to copy';
          }
        }
      });
      
      function showCopySuccess(element) {
        var success = element.querySelector('.copy-success');
        if (success) {
          success.classList.add('show');
          
          // Remove class after animation
          setTimeout(function() {
            success.classList.remove('show');
          }, 2000);
        }
      }
      
      // Cross-browser clipboard function
      function copyTextToClipboard(text) {
        // Modern browsers
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).catch(function(err) {
            console.error('Could not copy text: ', err);
            fallbackCopyTextToClipboard(text);
          });
        } else {
          // Fallback for older browsers
          fallbackCopyTextToClipboard(text);
        }
        
        function fallbackCopyTextToClipboard(text) {
          var textArea = document.createElement('textarea');
          textArea.value = text;
          
          // Make the textarea hidden
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          
          // Preserve scrolling position
          var scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
          
          textArea.focus();
          textArea.select();
          
          var success = false;
          try {
            success = document.execCommand('copy');
          } catch (err) {
            console.error('Unable to copy', err);
          }
          
          document.body.removeChild(textArea);
          
          // Restore scrolling position
          window.scrollTo(0, scrollPosition);
          
          return success;
        }
      }
      
      // ============ Interactive Steps =============
      
      // Enable clickable steps to mark as completed
      var steps = document.querySelectorAll('.step');
      steps.forEach(function(step, index) {
        step.addEventListener('click', function() {
          // Toggle completed state
          this.classList.toggle('completed');
          
          // Update step progress indicator
          updateStepProgress();
        });
      });
      
      // Function to update progress line
      function updateStepProgress() {
        var stepsContainers = document.querySelectorAll('.steps-container');
        
        stepsContainers.forEach(function(container) {
          var steps = container.querySelectorAll('.step');
          var completedSteps = container.querySelectorAll('.step.completed');
          
          // Find or create progress line
          var progressLine = container.querySelector('.progress-line');
          if (!progressLine) {
            progressLine = document.createElement('div');
            progressLine.className = 'progress-line';
            container.appendChild(progressLine);
          }
          
          // Calculate progress percentage
          var progress = (completedSteps.length / steps.length) * 100;
          
          // Update progress line height
          var containerHeight = container.offsetHeight;
          progressLine.style.height = (progress * containerHeight / 100) + 'px';
        });
      }
      
      // Initialize progress indicator
      updateStepProgress();
      
      // ============ Button Ripple Effect =============
      
      // Add ripple effect to buttons
      var rippleButtons = document.querySelectorAll('.primary-button, .secondary-button, .option-select-btn, .guide-button');
      rippleButtons.forEach(function(button) {
        button.classList.add('ripple-effect');
        
        button.addEventListener('click', function(e) {
          if (!supportsTransform) return; // Skip if transforms not supported
          
          var rect = button.getBoundingClientRect();
          var x = e.clientX - rect.left;
          var y = e.clientY - rect.top;
          
          var ripple = document.createElement('span');
          ripple.className = 'ripple';
          ripple.style.left = x + 'px';
          ripple.style.top = y + 'px';
          
          this.appendChild(ripple);
          
          setTimeout(function() {
            ripple.classList.add('animate-ripple');
          }, 10);
          
          // Remove after animation completes
          setTimeout(function() {
            if (ripple && ripple.parentNode) {
              ripple.parentNode.removeChild(ripple);
            }
          }, 700);
        });
      });
      
      // ============ Option Selection Enhancements =============
      
      // Enhance decision options selection
      var decisionOptions = document.querySelectorAll('.decision-option');
      decisionOptions.forEach(function(option) {
        option.addEventListener('click', function() {
          var container = this.closest('.decision-options');
          if (container) {
            // Deselect all options
            container.querySelectorAll('.decision-option').forEach(function(opt) {
              opt.classList.remove('selected');
            });
          }
          
          // Select this option
          this.classList.add('selected');
          
          // Add subtle feedback animation
          if (supportsAnimation) {
            this.style.transform = 'scale(0.98)';
            setTimeout(function() {
              option.style.transform = '';
            }, 200);
          }
        });
      });
      
      // ============ Notification System =============
      
      // Initialize notification container
      var notificationContainer;
      
      function createNotificationContainer() {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.bottom = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        
        document.body.appendChild(notificationContainer);
      }
      
      // Function to show notifications
      window.showNotification = function(message, iconClass) {
        if (!notificationContainer) {
          createNotificationContainer();
        }
        
        // Create notification element
        var notification = document.createElement('div');
        notification.className = 'notification';
        
        // Add icon if provided
        if (iconClass) {
          var icon = document.createElement('i');
          icon.className = iconClass;
          notification.appendChild(icon);
        }
        
        // Add message
        var messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        notification.appendChild(messageSpan);
        
        // Add close button
        var closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.marginLeft = '10px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.fontSize = '16px';
        closeBtn.addEventListener('click', function() {
          notification.classList.remove('show');
          setTimeout(function() {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        });
        notification.appendChild(closeBtn);
        
        // Add to container
        notificationContainer.appendChild(notification);
        
        // Trigger animation
        setTimeout(function() {
          notification.classList.add('show');
        }, 10);
        
        // Auto-remove after delay
        setTimeout(function() {
          notification.classList.remove('show');
          setTimeout(function() {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        }, 5000);
      };
      
      // ============ Product Logo Animation =============
      
      // Animate product logo on click
      var productLogos = document.querySelectorAll('.product-logo');
      productLogos.forEach(function(logo) {
        logo.addEventListener('click', function() {
          if (supportsAnimation) {
            this.classList.add('pulse-animation');
            
            // Remove animation class after it completes
            setTimeout(function() {
              logo.classList.remove('pulse-animation');
            }, 1500);
          }
          
          var productName = this.parentNode.querySelector('.product-details h5');
          if (productName) {
            showNotification('Exploring ' + productName.textContent + '...', 'fas fa-info-circle');
          }
        });
      });
      
      // ============ Welcome Message =============
      
      // Show welcome message after a delay
      setTimeout(function() {
        showNotification('Welcome to the enhanced Trellix Guide! Try clicking on items to discover interactive features.', 'fas fa-magic');
      }, 2000);
      
      // ============ Browser Compatibility Check =============
      
      // Detect browser for any specific patches
      function getBrowser() {
        var ua = navigator.userAgent;
        var browserName;
        
        if (ua.indexOf("Chrome") > -1 && ua.indexOf("Safari") > -1 && ua.indexOf("Edge") === -1 && ua.indexOf("Edg") === -1) {
          browserName = "Chrome";
        } else if (ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") === -1) {
          browserName = "Safari";
        } else if (ua.indexOf("Firefox") > -1) {
          browserName = "Firefox";
        } else if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident") > -1) {
          browserName = "IE";
        } else if (ua.indexOf("Edge") > -1 || ua.indexOf("Edg") > -1) {
          browserName = "Edge";
        } else {
          browserName = "Unknown";
        }
        
        return browserName;
      }
      
      // Apply browser-specific patches if needed
      var browser = getBrowser();
      if (browser === "Safari") {
        // Safari-specific fixes
        document.querySelectorAll('.command-box').forEach(function(box) {
          box.style.whiteSpace = 'pre-wrap';
        });
      } else if (browser === "IE") {
        // Show notification for IE users
        showNotification('Some interactive features may not work optimally in Internet Explorer. Consider using a modern browser for the best experience.', 'fas fa-exclamation-triangle');
        
        // Disable complex animations
        document.querySelectorAll('.spin-animation, .pulse-animation, .float-animation').forEach(function(el) {
          el.classList.remove('spin-animation', 'pulse-animation', 'float-animation');
        });
      }
    });
  })();
