function validateIpAddress(ipAddress) {  
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipAddress)) {  
      return true;
    }  
    return false;
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {

        const tabUrl = new URL('/', tab.url);
        const hostname = tabUrl.hostname;

        if (validateIpAddress(hostname)) {
            console.log("IP ADDY")
            return;
        }
        
        console.log('here')
        const siteSet = new Set(["openai", "bing", "midjourney", "playgroundai", "aidungeon"]); // Add others as needed
    
    
        const domain = hostname.split('.')[1]; // Get the domain name assuming it's not an IP.
        console.log(domain);
        if (siteSet.has(domain)) {
            chrome.action.setBadgeText({ tabId: tabId, text: "!" });
            chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: "#FF0000" });

            chrome.windows.create({
                url: 'gpt_modal.html',
                type: 'popup',
                width: 800,
                height: 600
            });
        }
    }
});

