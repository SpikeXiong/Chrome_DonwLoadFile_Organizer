console.log('This is a popup!');

document.querySelector('#go-to-options').addEventListener('click', function() {
    //如果存在Manifest中定义的options则直接调用，否则手动指定
    if (chrome.runtime.openOptionsPage) {
        console.log('openOptionsPage');
        chrome.runtime.openOptionsPage();
    } else {
        console.log('option/option.html');
      window.open(chrome.runtime.getURL('option/option.html'));
    }
  });