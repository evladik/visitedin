// LinkedIn Profile Tracker Content Script

class LinkedInProfileTracker {
  constructor() {
    this.visitedProfiles = new Set();
    this.keywordSettings = {
      enabled: true,
      keywords: [],
    };
    this.highlightedElements = new Set();
    this.init();
  }

  async init() {
    // Load existing visited profiles
    await this.loadVisitedProfiles();

    // Load keyword settings
    await this.loadKeywordSettings();

    // Track current profile visit if on a profile page
    this.trackCurrentProfile();

    // Mark visited profiles in search results and other listings
    this.markVisitedProfiles();

    // Highlight keywords if enabled
    this.highlightKeywords();

    // Set up observers for dynamic content
    this.setupObservers();

    // Re-check periodically for new content
    setInterval(() => {
      this.markVisitedProfiles();
      this.highlightKeywords();
    }, 2000);

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "updateKeywordSettings") {
        this.handleKeywordSettingsUpdate();
      }
    });
  }

  async loadVisitedProfiles() {
    try {
      const result = await chrome.storage.local.get([
        "visitedLinkedInProfiles",
      ]);
      if (result.visitedLinkedInProfiles) {
        this.visitedProfiles = new Set(result.visitedLinkedInProfiles);
      }
    } catch (error) {
      console.log(
        "LinkedIn Profile Tracker: Error loading visited profiles:",
        error
      );
    }
  }

  async loadKeywordSettings() {
    try {
      const result = await chrome.storage.local.get([
        "keywordHighlightEnabled",
        "highlightKeywords",
      ]);

      this.keywordSettings = {
        enabled: result.keywordHighlightEnabled !== false, // Default to true
        keywords: result.highlightKeywords || [],
      };
    } catch (error) {
      console.log(
        "LinkedIn Profile Tracker: Error loading keyword settings:",
        error
      );
    }
  }

  async handleKeywordSettingsUpdate() {
    // Clear existing highlights
    this.clearAllHighlights();

    // Reload settings
    await this.loadKeywordSettings();

    // Re-highlight with new settings
    this.highlightKeywords();
  }

  async saveVisitedProfiles() {
    try {
      await chrome.storage.local.set({
        visitedLinkedInProfiles: Array.from(this.visitedProfiles),
      });
    } catch (error) {
      console.log(
        "LinkedIn Profile Tracker: Error saving visited profiles:",
        error
      );
    }
  }

  extractProfileId(url) {
    // Extract profile identifier from LinkedIn URL
    const match = url.match(/\/in\/([^\/\?]+)/);
    return match ? match[1] : null;
  }

  isProfilePage() {
    return (
      window.location.pathname.includes("/in/") &&
      !window.location.pathname.includes("/company/")
    );
  }

  async trackCurrentProfile() {
    if (this.isProfilePage()) {
      const profileId = this.extractProfileId(window.location.href);
      if (profileId && !this.visitedProfiles.has(profileId)) {
        this.visitedProfiles.add(profileId);
        await this.saveVisitedProfiles();
        console.log(
          "LinkedIn Profile Tracker: Tracked visit to profile:",
          profileId
        );
      }
    }
  }

  markVisitedProfiles() {
    // Find all profile links on the page
    const profileLinks = document.querySelectorAll(
      'a[href*="/in/"]:not([data-profile-tracked])'
    );

    profileLinks.forEach((link) => {
      const profileId = this.extractProfileId(link.href);
      if (profileId && this.visitedProfiles.has(profileId)) {
        this.addVisitedIndicator(link);
      }
      link.setAttribute("data-profile-tracked", "true");
    });
  }

  highlightKeywords() {
    if (
      !this.keywordSettings.enabled ||
      this.keywordSettings.keywords.length === 0
    ) {
      return;
    }

    // Select text nodes to search in (avoiding already highlighted content)
    const textSelectors = [
      ".feed-shared-update-v2__description",
      ".update-components-text",
      ".pv-entity__summary-info",
      ".pv-profile-section__card-item-v2",
      ".entity-result__primary-subtitle",
      ".entity-result__secondary-subtitle",
      ".artdeco-entity-lockup__subtitle",
      ".artdeco-entity-lockup__caption",
      ".job-details-jobs-unified-top-card__job-insight",
      ".jobs-unified-top-card__content",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "span",
      "div",
    ];

    const elementsToSearch = document.querySelectorAll(
      textSelectors.join(", ")
    );

    elementsToSearch.forEach((element) => {
      if (
        !element.dataset.keywordProcessed &&
        this.shouldProcessElement(element)
      ) {
        this.highlightKeywordsInElement(element);
        element.dataset.keywordProcessed = "true";
      }
    });
  }

  shouldProcessElement(element) {
    // Skip elements that are already highlighted or are part of the extension
    if (
      element.closest(".linkedin-visited-indicator") ||
      element.classList.contains("linkedin-keyword-highlight") ||
      element.closest(".linkedin-keyword-highlight")
    ) {
      return false;
    }

    // Skip script tags, style tags, and other irrelevant elements
    const tagName = element.tagName.toLowerCase();
    if (["script", "style", "noscript", "svg", "canvas"].includes(tagName)) {
      return false;
    }

    return true;
  }

  highlightKeywordsInElement(element) {
    if (!element.textContent || element.textContent.trim().length === 0) {
      return;
    }

    // Skip elements with complex HTML structure to avoid breaking layout
    if (
      element.querySelector('a[href*="linkedin.com/leadGenForm"]') ||
      element.querySelector("[data-test-app-aware-link]") ||
      element.innerHTML.includes("data-") ||
      element.innerHTML.includes("href=") ||
      element.innerHTML.length > element.textContent.length * 3
    ) {
      return;
    }

    // Only process text-heavy elements
    const textNodes = this.getTextNodes(element);
    if (textNodes.length === 0) return;

    let modified = false;

    textNodes.forEach((textNode) => {
      let text = textNode.textContent;

      this.keywordSettings.keywords.forEach((keyword, index) => {
        if (keyword.trim().length === 0) return;

        const regex = new RegExp(
          `\\b(${this.escapeRegExp(keyword.trim())})\\b`,
          "gi"
        );

        if (regex.test(text)) {
          const colorClass = `keyword-${index % 10}`;
          const highlightedText = text.replace(
            regex,
            `<span class="linkedin-keyword-highlight ${colorClass} newly-highlighted">$1</span>`
          );

          if (highlightedText !== text) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = highlightedText;

            // Replace the text node with highlighted content
            const parent = textNode.parentNode;
            while (tempDiv.firstChild) {
              parent.insertBefore(tempDiv.firstChild, textNode);
            }
            parent.removeChild(textNode);
            modified = true;
          }
        }
      });
    });

    if (modified) {
      this.highlightedElements.add(element);

      // Remove the animation class after animation completes
      setTimeout(() => {
        const highlights = element.querySelectorAll(".newly-highlighted");
        highlights.forEach((highlight) => {
          highlight.classList.remove("newly-highlighted");
        });
      }, 600);
    }
  }

  getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.trim().length > 0) {
        textNodes.push(node);
      }
    }

    return textNodes;
  }

  escapeRegExp(string) {
    // Escape special regex characters
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  clearAllHighlights() {
    // Remove all keyword highlights
    const highlights = document.querySelectorAll(".linkedin-keyword-highlight");
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      parent.replaceChild(
        document.createTextNode(highlight.textContent),
        highlight
      );
      parent.normalize(); // Merge adjacent text nodes
    });

    // Reset processed flags
    const processedElements = document.querySelectorAll(
      "[data-keyword-processed]"
    );
    processedElements.forEach((element) => {
      delete element.dataset.keywordProcessed;
    });

    this.highlightedElements.clear();
  }

  addVisitedIndicator(element) {
    // Don't add multiple indicators
    if (element.querySelector(".linkedin-visited-indicator")) {
      return;
    }

    // Create visited indicator
    const indicator = document.createElement("div");
    indicator.className = "linkedin-visited-indicator";
    indicator.innerHTML = "✓ VISITED";

    // Find the best place to insert the indicator
    const target = this.findBestInsertionPoint(element);
    if (target) {
      target.appendChild(indicator);
      target.classList.add("linkedin-visited-profile");
    }
  }

  findBestInsertionPoint(link) {
    // Try to find a good container for the indicator
    let container = link;

    // Look for common LinkedIn containers
    while (container && container !== document.body) {
      if (
        container.classList.contains("entity-result") ||
        container.classList.contains("search-result") ||
        container.classList.contains(
          "pv-browsemap-section-v2__member-container"
        ) ||
        container.classList.contains(
          "reusable-search-simple-insight__container"
        ) ||
        container.querySelector(".entity-result__title-text") ||
        container.querySelector(".actor-name")
      ) {
        return container;
      }
      container = container.parentElement;
    }

    // Fallback to the link's parent
    return link.parentElement;
  }

  setupObservers() {
    // Observe URL changes (for single-page app navigation)
    let currentUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        setTimeout(() => {
          this.trackCurrentProfile();
          this.markVisitedProfiles();
          this.highlightKeywords();
        }, 1000);
      }
    });

    // Observe DOM changes for new content
    const contentObserver = new MutationObserver((mutations) => {
      let shouldCheck = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          shouldCheck = true;
        }
      });

      if (shouldCheck) {
        setTimeout(() => {
          this.markVisitedProfiles();
          this.highlightKeywords();
        }, 500);
      }
    });

    urlObserver.observe(document.body, { childList: true, subtree: true });
    contentObserver.observe(document.body, { childList: true, subtree: true });
  }
}

// Initialize the tracker when the page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new LinkedInProfileTracker();
  });
} else {
  new LinkedInProfileTracker();
}
