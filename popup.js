document.addEventListener('click', function(event) {
	var tagType = event.target.id;
	if (tagType !== '') {
		chrome.runtime.sendMessage({ 'tag-from-popup': tagType });
		window.close();
	}
});