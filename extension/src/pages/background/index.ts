// Background service worker
chrome.runtime.onInstalled.addListener(() => {
	console.log("Extension installed");
	chrome.storage.sync.set({ FAST_FORWARD_SPEED: 2, LONG_PRESS_DURATION: 500 });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	// Handle messages from content scripts or popup
	console.log("Message received:", message, sender);
	sendResponse({ success: true });
	return true;
});
