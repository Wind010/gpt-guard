
/**
 * Checks if valid IP Address.
 * @param  {String} The ipAddress to check.
 * @return {Bool} Is valid ip address.
 */
function validateIpAddress(ipAddress) {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipAddress)) {
      return true;
    }
    return false;
}

/**
 * Checks if domain name is in caution list.
 * @param  {ChangeInfo} The changeInfo
 * @param  {Number} Chrome tab ID
 * @param  {String} The passed in domain name.
 * @return {Bool} To show modal dialog or not.
 */
function gptGuard(changeInfo, tabId, domain) {
    console.debug("domain: " + domain);

    if (changeInfo.status === 'complete') {
        const siteSet = new Set(["openai", "bing", "midjourney", "playgroundai", "aidungeon"]); // Add others as needed
        if (! siteSet.has(domain)) {
            return;
        }

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

/**
 * Checks if top-level domain is in caution list.
 * @param  {ChangeInfo} The changeInfo
 * @param  {Tab} Chrome tab
 * @return {Bool} To show modal dialog or not.
 */
function tldGuard(changeInfo, tab) {
    if (changeInfo.status != "loading" || typeof tab.url === 'undefined') {
        return;
    }

    const tldSet = new Set(["zip", "mov"]); // Add others as needed
    let topLevelDomain = tab.url.split('.').at(-1).replace("/", "")

    console.debug("topLevelDomain: " + topLevelDomain);

    // changeInfo.status could be unloaded, loading, or completed.

    let acknowledgedUrl;
    chrome.storage.local.get(['tabUrl'], (result) => {
        const { tabUrl } = result;
        acknowledgedUrl = tabUrl
    });

    if (typeof acknowledgedUrl === 'undefined') {
        console.debug(`AcknowledgedUrl = ${acknowledgedUrl} not defined.`)
    }

    if (acknowledgedUrl == tab.url) {
        console.debug(`AcknowledgedUrl = ${acknowledgedUrl} matches ${tab.url}.  This site was previously allowed.`)
        return true;
    }

    if (tldSet.has(topLevelDomain) && acknowledgedUrl != tab.url ) {

        // Open custom modal dialog
        chrome.windows.create({
            url: chrome.runtime.getURL('tld_modal.html'),
            type: 'popup',
            width: 800,
            height: 600
        });

        // Store tabId and URL for further action
        chrome.storage.local.set({ tabId: tab.id, tabUrl: tab.url });
        
        /* Service worker has no access to confirm.  Could use chrome.executeScript, but tricky. */
        // if (confirm(`Are you sure you want to proceed to ${hostname}?`)) {
        //     // Open the page
        //     //chrome.tabs.update(tabId, { url: tabUrl.href });
        //     return true;
        // }

        // // Close the tab or take alternative action
        // chrome.tabs.remove(tabId);
    }

    return false;
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    // We have to process here since Url construction fails...
    let allowTld = tldGuard(changeInfo, tab);
    if (typeof allowTld === 'undefined') {
        return;
    }

    if (allowTld === true) {
        return;
    }

    const tabUrl = new URL('/', tab.url);
    const hostname = tabUrl.hostname;

    if (validateIpAddress(hostname)) {
        console.log(`Hostname was ip address: ${hostname}`);
        return;
    }

    const hostnameArr = hostname.split('.')

    if (hostnameArr.length < 2) {
        console.log(`Hostname is unexpected:  ${hostname}`);
        return;
    }

    // Get the domain and top-level domain names assuming it's not an IP.
    let domain = (hostname.length === 2) ? hostnameArr[0] : hostnameArr[1];
    gptGuard(changeInfo, tabId, domain);
});

