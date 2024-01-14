import { downLoadFileMgr } from './scripts/modules.js';

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