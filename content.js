// LinkedIn Profile Tracker Content Script

class LinkedInProfileTracker {
  constructor() {
    this.visitedProfiles = new Set();
    this.init();
  }

  async init() {
    // Load existing visited profiles
    await this.loadVisitedProfiles();

    // Track current profile visit if on a profile page
    this.trackCurrentProfile();

    // Mark visited profiles in search results and other listings
    this.markVisitedProfiles();

    // Set up observers for dynamic content
    this.setupObservers();

    // Re-check periodically for new content
    setInterval(() => this.markVisitedProfiles(), 2000);
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
        setTimeout(() => this.markVisitedProfiles(), 500);
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
