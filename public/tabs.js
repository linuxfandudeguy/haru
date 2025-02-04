// class for tab
class Tab {
  constructor(url = 'haru:newtab') { // custom protocall for new tab
    this.url = url;
    this.title = 'New Tab';
    this.favicon = null;
    this.element = this.createTabElement();
    this.contentElement = this.createContentElement();
    this.history = [];
    this.currentHistoryIndex = -1;
    this.setupContentListeners();
  }

  createTabElement() {
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.innerHTML = `
      <div class="tab-favicon">${this.getFaviconContent()}</div>
      <span class="tab-title">${this.title}</span>
      <button class="close-tab">×</button>
    `;
    return tab;
  }

  getFaviconContent() {
    if (this.url === 'haru:newtab') {
      return '<img src="6475165.png" alt="haru">';
    } else if (this.favicon) {
      return `<img src="${this.favicon}" alt="">`;
    } else {
      try {
        const domain = new URL(this.url).hostname;
        return domain.charAt(0).toUpperCase();
      } catch {
        return '●';
      }
    }
  }

  updateFavicon() {
    if (this.url === 'haru:newtab') return;
    
    try {
      const domain = new URL(this.url).hostname;
      this.favicon = `./globe-icon-2048x2048-5ralwwgx.png`;
      const faviconElement = this.element.querySelector('.tab-favicon');
      faviconElement.innerHTML = this.getFaviconContent();
    } catch (e) {
      console.error('Failed to update favicon:', e);
    }
  }

  createContentElement() {
    if (this.url === 'haru:newtab') {
      const iframe = document.createElement('iframe');
      iframe.className = 'active-frame';
      iframe.srcdoc = `
        <html>
          <head>
            <style>
              body {
                margin: 0;
                height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: #2B2A33;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              }
              
.haru-logo img {
  width: 100%; /* Makes the image responsive */
  max-width: 150px; /* Adjust the max width as needed */
  height: auto; /* Maintains aspect ratio */
  margin-bottom: 1rem;
}

              .search-box {
                width: 580px;
                height: 46px;
                background: #42414D;
                border-radius: 23px;
                border: none;
                padding: 0 20px;
                color: #FBFBFE;
                font-size: 16px;
                outline: none;
                transition: background 0.2s;
              }
              .search-box:hover, .search-box:focus {
                background: #52525E;
              }
              .bookmarks {
                margin-top: 20px;
                display: flex;
                gap: 15px;
              }
              .bookmark {
                text-decoration: none;
                color: #FBFBFE;
                padding: 8px 16px;
                background: #42414D;
                border-radius: 8px;
                font-size: 14px;
                transition: background 0.2s;
              }
              .bookmark:hover {
                background: #52525E;
              }
            </style>
          </head>
          <body>
            <div class="haru-logo"><img src="6475165.png" alt="haru"></div>
            <input type="text" class="search-box" placeholder="Search or enter address" autofocus>
<div class="bookmarks-container">
  <a href="https://xkcd.com/" target="_blank">xkcd</a>
  <a href="https://www.bbc.com/news" target="_blank">BBC News</a>
  <a href="https://duckduckgo.com/" target="_blank">DuckDuckGo</a>
  <a href="https://developer.mozilla.org/en-US/" target="_blank">MDN Web Docs</a>
  <a href="https://stackoverflow.com/" target="_blank">Stack Overflow</a>
  <a href="https://github.com/" target="_blank">GitHub</a>
  <a href="https://www.amazon.com/" target="_blank">Amazon</a>
  <a href="https://www.youtube.com/" target="_blank">YouTube</a>
</div>
            <script>
              document.querySelector('.search-box').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                  const query = e.target.value;
                  let url;
                  if (query.includes('.') || query.startsWith('http')) {
                    url = query.startsWith('http') ? query : 'https://' + query;
                  } else {
                    url = 'https://www.bing.com/search?q=' + encodeURIComponent(query);
                    fetch(url, { mode: 'no-cors' })
                      .catch(() => {
                        url = 'https://www.bing.com/search?q=' + encodeURIComponent(query);
                      });
                  }
                  window.parent.postMessage({ type: 'navigate', url }, '*');
                }
              });
            </script>
          </body>
        </html>
      `;
      return iframe;
    } else {
      const wrapper = document.createElement('div');
      wrapper.className = 'embed-wrapper';

      let embed;
      try {
        const domain = new URL(this.url).hostname;
        // Use regular iframe for internal pages
        if (domain === window.location.hostname) {
          embed = document.createElement('embed');
        } else {
          // Use x-frame-bypass for external sites
          embed = document.createElement('iframe', { is: 'x-frame-bypass' });
        }
      } catch {
        // Fallback to regular embed if URL is invalid
        embed = document.createElement('embed');
      }

      embed.className = 'active-frame';
      embed.src = this.url;
      embed.type = 'text/html';
      embed.allowFullscreen = true;
      
      wrapper.appendChild(embed);
      this.observeNewWindows(wrapper);
      
      return wrapper;
    }
  }

  observeNewWindows(wrapper) {
    const script = document.createElement('script');
    script.textContent = `
      window.open = function(url, target, features) {
        window.parent.postMessage({
          type: 'newWindow',
          url: url || 'about:blank'
        }, '*');
        return null;
      };
    `;
    wrapper.appendChild(script);
  }

  setupContentListeners() {
    if (this.url === 'haru:newtab') {
      window.addEventListener('message', (event) => {
        if (event.data.type === 'navigate') {
          const query = event.data.url;
          const url = query.includes('.') || query.startsWith('http')
            ? (query.startsWith('http') ? query : `https://${query}`)
            : `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
          this.url = url;
          this.navigateToUrl(url);
          this.updateFavicon();
          this.updateUrlBar();
        }
      });
    }
    
    window.addEventListener('message', (event) => {
      if (event.data.type === 'newWindow') {
        window.dispatchEvent(new CustomEvent('haru:newTab', {
          detail: { url: event.data.url }
        }));
      }
    });
    
    if (this.url !== 'haru:newtab') {
      try {
        this.title = new URL(this.url).hostname;
        this.element.querySelector('.tab-title').textContent = this.title;
        this.updateFavicon();
        this.updateUrlBar();
        
        if (this.history[this.currentHistoryIndex] !== this.url) {
          this.currentHistoryIndex++;
          this.history.splice(this.currentHistoryIndex);
          this.history.push(this.url);
        }
      } catch (e) {
        this.title = this.url;
        this.element.querySelector('.tab-title').textContent = this.title;
      }
    }
  }

  updateUrlBar() {
    const urlBar = document.querySelector('.url-input');
    if (urlBar && this.url) {
      urlBar.value = this.url;
    }
  }

  navigateToUrl(url) {
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-wrapper';
    
    let newEmbed;
    try {
      const domain = new URL(url).hostname;
      // Use regular iframe for internal pages
      if (domain === window.location.hostname) {
        newEmbed = document.createElement('embed');
      } else {
        // Use x-frame-bypass for external sites
        newEmbed = document.createElement('iframe', { is: 'x-frame-bypass' });
      }
    } catch {
      // Fallback to regular embed if URL is invalid
      newEmbed = document.createElement('embed');
    }
    
    newEmbed.className = 'active-frame';
    newEmbed.src = url;
    newEmbed.type = 'text/html';
    
    wrapper.appendChild(newEmbed);
    this.observeNewWindows(wrapper);
    
    this.contentElement.replaceWith(wrapper);
    this.contentElement = wrapper;
    this.setupContentListeners();
  }

  setActive(isActive) {
    if (isActive) {
      this.element.classList.add('active');
      this.contentElement.style.display = 'block';
    } else {
      this.element.classList.remove('active');
      this.contentElement.style.display = 'none';
    }
  }

  canGoBack() {
    return this.currentHistoryIndex > 0;
  }

  canGoForward() {
    return this.currentHistoryIndex < this.history.length - 1;
  }

  goBack() {
    if (this.canGoBack()) {
      this.currentHistoryIndex--;
      this.url = this.history[this.currentHistoryIndex];
      this.navigateToUrl(this.url);
    }
  }

  goForward() {
    if (this.canGoForward()) {
      this.currentHistoryIndex++;
      this.url = this.history[this.currentHistoryIndex];
      this.navigateToUrl(this.url);
    }
  }

  reload() {
    this.navigateToUrl(this.url);
  }
}

class BrowserTabs {
  constructor() {
    this.tabs = [];
    this.activeTab = null;
    
    this.tabsContainer = document.querySelector('.tabs-container');
    this.browserContent = document.querySelector('.browser-content');
    this.newTabButton = document.querySelector('.new-tab');
    this.urlInput = document.querySelector('.url-input');
    this.backButton = document.querySelector('.back');
    this.forwardButton = document.querySelector('.forward');
    this.reloadButton = document.querySelector('.reload');
    this.fullscreenButton = document.querySelector('.fullscreen-btn');
    
    this.setupEventListeners();
    this.createNewTab();
  }

  setupEventListeners() {
    this.newTabButton.addEventListener('click', () => this.createNewTab());
    
    this.urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && this.activeTab) {
        let input = this.urlInput.value.trim();
        let url;

        if (input.includes('.') && !input.includes(' ')) {
          url = input.startsWith('http') ? input : `https://${input}`;
        } else {
          url = `https://www.bing.com/search?q=${encodeURIComponent(input)}`;
        }

        this.activeTab.url = url;
        this.activeTab.navigateToUrl(url);
      }
    });

    this.backButton.addEventListener('click', () => {
      if (this.activeTab) {
        this.activeTab.goBack();
      }
    });

    this.forwardButton.addEventListener('click', () => {
      if (this.activeTab) {
        this.activeTab.goForward();
      }
    });

    this.reloadButton.addEventListener('click', () => {
      if (this.activeTab) {
        this.activeTab.reload();
      }
    });

    this.fullscreenButton.addEventListener('click', () => {
      const activeFrame = this.browserContent.querySelector('.active-frame');
      if (activeFrame) {
        if (!document.fullscreenElement) {
          // Handle both embed and iframe elements
          if (activeFrame.requestFullscreen) {
            activeFrame.requestFullscreen();
          } else if (activeFrame.webkitRequestFullscreen) { // Safari
            activeFrame.webkitRequestFullscreen();
          } else if (activeFrame.msRequestFullscreen) { // IE11
            activeFrame.msRequestFullscreen();
          }
          this.fullscreenButton.textContent = '⛶';
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) { // Safari
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) { // IE11
            document.msExitFullscreen();
          }
          this.fullscreenButton.textContent = '⛶';
        }
      }
    });
  }

  createNewTab(url = 'haru:newtab') {
    const tab = new Tab(url);
    this.tabs.push(tab);
    
    this.tabsContainer.appendChild(tab.element);
    this.browserContent.appendChild(tab.contentElement);
    
    tab.element.addEventListener('click', () => this.setActiveTab(tab));
    tab.element.querySelector('.close-tab').addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTab(tab);
    });
    
    this.setActiveTab(tab);
    return tab;
  }

  setActiveTab(tab) {
    if (this.activeTab) {
      this.activeTab.setActive(false);
    }
    
    this.activeTab = tab;
    tab.setActive(true);
    this.urlInput.value = tab.url;
    
    this.backButton.disabled = !tab.canGoBack();
    this.forwardButton.disabled = !tab.canGoForward();
  }

  closeTab(tab) {
    const index = this.tabs.indexOf(tab);
    if (index === -1) return;
    
    this.tabs.splice(index, 1);
    tab.element.remove();
    tab.contentElement.remove();
    
    if (this.tabs.length === 0) {
      this.createNewTab();
    } else if (tab === this.activeTab) {
      this.setActiveTab(this.tabs[Math.min(index, this.tabs.length - 1)]);
    }
  }
}

new BrowserTabs();
