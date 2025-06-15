// LinkedIn Profile Tracker Popup Script

document.addEventListener("DOMContentLoaded", async () => {
  const loadingDiv = document.getElementById("loading");
  const contentDiv = document.getElementById("content");
  const visitedCountSpan = document.getElementById("visitedCount");
  const statusSpan = document.getElementById("status");
  const refreshBtn = document.getElementById("refreshBtn");
  const clearBtn = document.getElementById("clearBtn");
  const successMessage = document.getElementById("successMessage");

  // Load initial data
  await loadStats();

  // Event listeners
  refreshBtn.addEventListener("click", async () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = "Refreshing...";

    await loadStats();

    refreshBtn.disabled = false;
    refreshBtn.textContent = "Refresh Data";
  });

  clearBtn.addEventListener("click", async () => {
    if (
      confirm(
        "Are you sure you want to clear all visited profile data? This cannot be undone."
      )
    ) {
      clearBtn.disabled = true;
      clearBtn.textContent = "Clearing...";

      try {
        await new Promise((resolve) => {
          chrome.runtime.sendMessage({ action: "clearAllData" }, (response) => {
            resolve(response);
          });
        });

        await loadStats();
        showSuccessMessage();
      } catch (error) {
        console.error("Error clearing data:", error);
      }

      clearBtn.disabled = false;
      clearBtn.textContent = "Clear All Data";
    }
  });

  async function loadStats() {
    try {
      const result = await chrome.storage.local.get([
        "visitedLinkedInProfiles",
      ]);
      const visitedProfiles = result.visitedLinkedInProfiles || [];

      visitedCountSpan.textContent = visitedProfiles.length;
      statusSpan.textContent = "Active";

      // Check if we're on LinkedIn
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const currentTab = tabs[0];

      if (
        currentTab &&
        currentTab.url &&
        currentTab.url.includes("linkedin.com")
      ) {
        statusSpan.textContent = "Active on LinkedIn";
        statusSpan.style.color = "#0a66c2";
      } else {
        statusSpan.textContent = "Not on LinkedIn";
        statusSpan.style.color = "#666";
      }

      loadingDiv.style.display = "none";
      contentDiv.style.display = "block";
    } catch (error) {
      console.error("Error loading stats:", error);
      loadingDiv.textContent = "Error loading data";
    }
  }

  function showSuccessMessage() {
    successMessage.style.display = "block";
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 3000);
  }
});
