chrome.storage.onChanged.addListener(function(changes, namespace) {
    console.log('Storage key "%s" in namespace "%s" changed. ');
});