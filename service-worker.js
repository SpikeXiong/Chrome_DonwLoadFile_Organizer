import { downLoadFileMgr } from './scripts/modules.js';

function openOrFocusOptionsPage() {
    console.log('openOrFocusOptionsPage');
	var optionsUrl = chrome.runtime.getURL('./option/option.html');
	chrome.tabs.query({}, function(extensionTabs) {
		var found = false;
		for (var i=0; i < extensionTabs.length; i++) {
			if (optionsUrl == extensionTabs[i].url) {
				found = true;
			//console.log("tab id: " + extensionTabs[i].id);
			chrome.tabs.update(extensionTabs[i].id, {"selected": true});
		}
	}
	if (found == false) {
		chrome.tabs.create({url: "./option/option.html"});
	}
});
}

//插件Item点击时间
chrome.action.onClicked.addListener((tab) => {    
    openOrFocusOptionsPage();
  });

chrome.downloads.onDeterminingFilename.addListener(function(item, suggest) {
    console.log('downloads');
    const fileMgr = new downLoadFileMgr(item.url, item.filename);
    fileMgr.getSaveFileName().then(saveFileName => {
        console.log(saveFileName);
        suggest({ filename: saveFileName, overwrite: false });        
    }).catch(error => {
        console.error('Error:', error);    
    });
    return true;
});