// chrome.scripting.onPageLoad.addListener(() => {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         const currentTab = tabs[0];
//         const siteList = ["openai", "bing", "midjourney", "playgroundai", "aidungeon"]; // Add others as needed

//         if (siteList.includes(new URL(currentTab.url).hostname)) {
//            chrome.action.setBadgeText({ text: "!" });
//            chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
//         }
//     });
//   });



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
        

        // if (siteSet.includes(new URL('/', tab.url).hostname)) {
            
        //     chrome.action.setBadgeText({ tabId: tab.id, text: "!" });
        //     chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#FF0000" });
        // }

        

    
        const domain = hostname.split('.')[1]; // Get the domain name assuming it's not an IP.
        console.log(domain);
        if (siteSet.has(domain)) {
            chrome.action.setBadgeText({ tabId: tabId, text: "!" });
            chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: "#FF0000" });

            chrome.windows.create({
                url: 'modal.html',
                type: 'popup',
                width: 800,
                height: 600
            });
        }
    }
    
});

