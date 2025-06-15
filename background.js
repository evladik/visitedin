// LinkedIn Profile Tracker Background Script

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("LinkedIn Profile Tracker installed");

    // Initialize storage
    chrome.storage.local.set({
      visitedLinkedInProfiles: [],
    });
  }
});

// Handle storage cleanup (optional - remove old entries)
chrome.runtime.onStartup.addListener(() => {
  cleanupOldEntries();
});

async function cleanupOldEntries() {
  try {
    const result = await chrome.storage.local.get([
      "visitedLinkedInProfiles",
      "lastCleanup",
    ]);
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    // Only cleanup once per week
    if (!result.lastCleanup || now - result.lastCleanup > oneWeek) {
      // For now, we'll keep all entries, but this could be modified
      // to remove entries older than a certain period

      await chrome.storage.local.set({
        lastCleanup: now,
      });

      console.log("LinkedIn Profile Tracker: Cleanup completed");
    }
  } catch (error) {
    console.log("LinkedIn Profile Tracker: Error during cleanup:", error);
  }
}

// Message handling (for future features)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getVisitedCount") {
    chrome.storage.local.get(["visitedLinkedInProfiles"], (result) => {
      const count = result.visitedLinkedInProfiles
        ? result.visitedLinkedInProfiles.length
        : 0;
      sendResponse({ count });
    });
    return true; // Keep message channel open for async response
  }

  if (message.action === "clearAllData") {
    chrome.storage.local.set(
      {
        visitedLinkedInProfiles: [],
      },
      () => {
        sendResponse({ success: true });
      }
    );
    return true;
  }
});
