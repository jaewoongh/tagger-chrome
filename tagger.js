// Styles for tags
var styles = {
	'common':	'display:inline-block;margin:5px 0;padding:0 5px;border-radius:5px;',
	'quick':	'color:#fff;background:#2F4F4F;',
	'red':		'color:#fff;background:#FB494A;',
	'orange':	'color:#fff;background:#F59537;',
	'yellow':	'color:#fff;background:#F0C63A;',
	'green':	'color:#fff;background:#5EC53F;',
	'blue':		'color:#fff;background:#3FA8F0;',
	'purple':	'color:#fff;background:#C46FDA;'
};


// CHOMP
// Remove starting http:// and https://
var removeHttpHttps = function(url) {
	return url.replace(/^http.?:\/\//, '');
};

// Remove ending /
var removeEndingSlash = function(url) {
	return url.replace(/\/$/, '');
};

// Remove #
var removeHashmark = function(url) {
	if (url.match(/(^https|^http):\/\/www.google.com\/.*#q=.*/)) return url;
	return url.replace(/#.*$/, '');
}; 

// Run all chomping functions at once
var chomp = function(url) {
	return removeHttpHttps(removeEndingSlash(removeHashmark(decodeURI(url))));
};


// Peel out real url from some annoying site-specific link manipulation
var getRealUrl = function(item) {
	if (!item.href) return;

	// Check if google did mean thing
	if (item.href.match(/(^https|^http):\/\/www.google.com\/url\?/)) {
		var ungoogled = item.getAttribute('data-href');
		if (ungoogled) return chomp(ungoogled);
	}

	return chomp(item.href);
};


// Tag onto page
var tagTimer = null;
var tag = function(list, firstime) {
	if (tagTimer) window.clearTimeout(tagTimer);
	if (!list) return 'No tags in the storage';
	var delay = 20;
	if (document.URL.match(/(^https|^http):\/\/www.google.com\/.*#q=.*/)) delay = 800;	// Stupid google

	tagTimer = window.setTimeout(function() {
		console.log('tag');
		var allAnchors = document.getElementsByTagName('a');
		for (var i = 0; i < allAnchors.length; i++) {
			var item = allAnchors[i];
			var href = getRealUrl(item);
			if (!href) continue;
			if (href == "en.wikipedia.org/wiki/Hello_world_program") console.log('adsf');
			if (href.match("en.wikipedia.org")) console.log(href, item.href);
			// console.log(list[href], href);

			var tagtype = list[href];
			if (tagtype !== null && tagtype !== undefined) {
				if (item.classList.contains('tAGgED') === -1 || item.classList.contains('tAGgED') === false) {
					item.classList.add('tAGgED');
				}
				item.setAttribute('style', styles['common'] + styles[tagtype]);
			} else {
				for (var j = item.classList.length - 1; j >= 0; j--) {
					if (item.classList[j] === 'tAGgED') {
						item.getAttribute('style');
						item.removeAttribute('style');
						item.className = item.className.replace(' tAGgED', '');
					}
				}
			}
		}
	}, delay);

	// Listen to possible XMLHttpRequest finishing for the sake of damn google
	if (firstime) document.addEventListener("DOMSubtreeModified", tag.bind(this, list, false), false);
};