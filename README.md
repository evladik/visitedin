# LinkedIn Profile Tracker Chrome Extension

A Chrome extension that tracks and highlights LinkedIn profiles you've already visited, helping you avoid revisiting the same profiles while browsing LinkedIn.

## Features

- **Automatic Profile Tracking**: Automatically tracks when you visit LinkedIn profiles
- **Visual Indicators**: Shows clear "✓ VISITED" indicators on profile links throughout LinkedIn
- **Multiple View Support**: Works on search results, "People You May Know", connection suggestions, and more
- **Persistent Storage**: Remembers visited profiles across browser sessions
- **Privacy-Focused**: All data is stored locally in your browser
- **Statistics**: View how many profiles you've visited via the extension popup

## Installation

### Option 1: Load as Unpacked Extension (Recommended for development)

1. **Download the Extension Files**

   - Clone this repository or download all files to a folder on your computer

2. **Create Icon Files**

   - Replace `icon48.png` and `icon128.png` with actual 48x48 and 128x128 pixel PNG icons
   - You can use any icon generator or create simple blue icons with checkmarks

3. **Open Chrome Extensions Page**

   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or go to Chrome menu → More tools → Extensions

4. **Enable Developer Mode**

   - Toggle the "Developer mode" switch in the top right corner

5. **Load the Extension**

   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

6. **Pin the Extension** (Optional)
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "LinkedIn Profile Tracker" and click the pin icon

## How It Works

### Profile Tracking

- When you visit a LinkedIn profile page (URLs containing `/in/`), the extension automatically records the profile ID
- Profile IDs are extracted from the URL and stored locally

### Visual Indicators

The extension adds visual indicators to visited profiles in several locations:

- **Search Results**: Blue border and "✓ VISITED" badge
- **People You May Know**: Highlighted cards with checkmark
- **Connection Suggestions**: Marked with visited indicators
- **Company Employee Lists**: Shows which employees you've viewed
- **Messaging**: Highlights conversations with visited profiles

### Data Storage

- All data is stored locally using Chrome's storage API
- No data is sent to external servers
- You can clear all data anytime using the extension popup

## Usage

1. **Install the Extension** (see installation steps above)

2. **Browse LinkedIn Normally**

   - Visit any LinkedIn profile to automatically track it
   - Navigate to search results, suggestions, or any LinkedIn page

3. **See Visited Profiles**

   - Previously visited profiles will show blue borders and "✓ VISITED" indicators
   - Hover over indicators for subtle animation effects

4. **View Statistics**

   - Click the extension icon in Chrome's toolbar
   - See how many profiles you've visited
   - Check if the extension is active on the current page

5. **Manage Data**
   - Use the popup to refresh statistics
   - Clear all tracked data if needed

## File Structure

```
linkedin-profile-tracker/
├── manifest.json          # Extension configuration
├── content.js            # Main tracking logic
├── background.js         # Background service worker
├── styles.css           # Visual styling for indicators
├── popup.html           # Extension popup interface
├── popup.js             # Popup functionality
├── icon48.png           # 48x48 extension icon
├── icon128.png          # 128x128 extension icon
└── README.md            # This file
```

## Technical Details

### Permissions

- `storage`: To save visited profile data locally
- `activeTab`: To access the current tab information
- `*://*.linkedin.com/*`: To run on LinkedIn pages

### Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers

### Privacy

- No external network requests
- No data collection or analytics
- All data remains on your device
- Profile IDs are hashed/anonymized internally

## Troubleshooting

### Extension Not Working

1. Make sure you're on a LinkedIn page
2. Check that the extension is enabled in `chrome://extensions/`
3. Try refreshing the LinkedIn page
4. Check the browser console for any error messages

### Indicators Not Showing

1. Wait a few seconds for the extension to load
2. Try scrolling or refreshing the page
3. Make sure you've actually visited the profiles before
4. Check if the profiles are valid LinkedIn profile URLs

### Data Not Persisting

1. Make sure Chrome sync is enabled (optional)
2. Check Chrome storage permissions
3. Try clearing extension data and starting fresh

## Development

### Making Changes

1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon next to the extension
4. Test your changes on LinkedIn

### Debugging

- Use Chrome Developer Tools
- Check the Console for extension logs
- View Background page logs in the extension details

## Contributing

Feel free to submit issues or pull requests to improve the extension.

## License

This project is open source. Feel free to modify and distribute as needed.

## Disclaimer

This extension is not affiliated with LinkedIn. Use responsibly and in accordance with LinkedIn's terms of service.
