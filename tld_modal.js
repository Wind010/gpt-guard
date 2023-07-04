document.getElementById('proceed').addEventListener('click', () => {
    chrome.storage.local.get(['tabId', 'tabUrl'], (result) => {
        const { tabId, tabUrl } = result;
        chrome.tabs.update(tabId, { url: tabUrl });
        window.close();
    });
});

document.getElementById('leave').addEventListener('click', () => {
    chrome.storage.local.get('tabId', (result) => {
        const { tabId } = result;
        chrome.tabs.remove(tabId);
        window.close();
    });
});