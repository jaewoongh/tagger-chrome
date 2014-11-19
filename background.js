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
var getRealUrl = function(url) {
	if (!url) return;

	// Check if google did mean thing
	if (url.match(/(^https|^http):\/\/www.google.com\/url\?/)) {
		var ungoogled = decodeURIComponent(url.match(/url=(.*)&ei/)[1]);
		if (ungoogled) return chomp(ungoogled);
	}

	return chomp(url);
};


// Save URL onto sync storage
var addTag = function(url, tagname) {
	var item = {};
	item[url] = tagname;
	chrome.storage.sync.set(item, function() {
		console.log('Added', item);
	});
};

// Clear storage
var clearStorage = function() {
	chrome.storage.sync.clear(function() {
		console.log('Cleared sync storage!');
	});
};

// See storage
var seeStorage = function() {
	chrome.storage.sync.get(null, function(items) {
		console.log('In the storage..', items);
	});
};

// Get taggin event from page popup
chrome.runtime.onMessage.addListener(function(req, from, res) {
	var tagType = req['tag-from-popup'];
	if (tagType) {
		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
			if (tabs.length <= 0) return;
			if (!tabs[0].url) return;
			tabs[0].url = getRealUrl(tabs[0].url);
			if (tagType === 'remove') {
				chrome.storage.sync.remove(tabs[0].url, function() {
					showPageIcon(tabs[0].url, tabs[0].id);
				});
			} else {
				addTag(tabs[0].url, tagType);
				showPageIcon(tabs[0].url, tabs[0].id);
			}
		});
	}
});

// Context menus
chrome.contextMenus.create({ 'title': 'Tag', 'id': 'tag', 'contexts': ['link'] });
chrome.contextMenus.create({ 'title': 'Red', 'id': 'tag-red', 'contexts': ['link'], 'parentId': 'tag' });
chrome.contextMenus.create({ 'title': 'Orange', 'id': 'tag-orange', 'contexts': ['link'], 'parentId': 'tag' });
chrome.contextMenus.create({ 'title': 'Yellow', 'id': 'tag-yellow', 'contexts': ['link'], 'parentId': 'tag' });
chrome.contextMenus.create({ 'title': 'Green', 'id': 'tag-green', 'contexts': ['link'], 'parentId': 'tag' });
chrome.contextMenus.create({ 'title': 'Blue', 'id': 'tag-blue', 'contexts': ['link'], 'parentId': 'tag' });
chrome.contextMenus.create({ 'title': 'Purple', 'id': 'tag-purple', 'contexts': ['link'], 'parentId': 'tag' });
chrome.contextMenus.create({ 'type': 'separator', 'id': 'separator', 'contexts': ['link'], 'parentId': 'tag' });
chrome.contextMenus.create({ 'title': 'Remove', 'id': 'tag-remove', 'contexts': ['link'], 'parentId': 'tag' });
chrome.contextMenus.onClicked.addListener(function(info, tab) {
	var url = getRealUrl(info.linkUrl);
	var tagType = info.menuItemId.match(/^tag-(.+)/)[1];

	if (tagType === 'remove') {
		chrome.storage.sync.remove(url, function() {
			showPageIcon(url, tab.id);
			if (getRealUrl(tab.url) == url) injectTagger(tab.id);
		});
	} else {
		chrome.storage.sync.get(null, function(items) {
			if (items[url]) {
				chrome.storage.sync.remove(url, function() {
					addTag(url, tagType);
					if (getRealUrl(tab.url) == url) injectTagger(tab.id);
				});
			} else {
				addTag(url, tagType);
				if (getRealUrl(tab.url) == url) injectTagger(tab.id);
			}
		});
	}
});

// Function that injects js file and run the function inside
var injectTagger = function(tabId) {
	chrome.tabs.executeScript(tabId, { file: 'tagger.js' }, function() {
		chrome.storage.sync.get(null, function(items) {
			if (chrome.runtime.lastError) return;	// If get error, leave it alone
			chrome.tabs.executeScript(tabId, { code: 'tag(' + JSON.stringify(items) + ',true)' });
		});
	});
};

// Check current page and show relavant page icon
var showPageIcon = function(url, tabId) {
	chrome.storage.sync.get(null, function(items) {
		var tagType = items[url];
		if (tagType) {
			var iconPath = 'pageicon-' + tagType + '.png';
			var iconPath2x = 'pageicon2x-' + tagType + '.png';
			chrome.pageAction.setIcon({
				tabId:	tabId,
				path: 	{ '19': iconPath, '38': iconPath2x }
			}, function() {
				chrome.pageAction.show(tabId);
			});
		} else {
			chrome.pageAction.setIcon({
				tabId:	tabId,
				path: 	{ '19': 'pageicon.png', '38': 'pageicon2x.png' }
			}, function() {
				chrome.pageAction.show(tabId);
			});
		}
	});
};

// Check if the url matches target pages set on options page
var checkTarget = function(url) {
	console.log('checking', url);
}

// Run only when the page is loaded
chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
	if (!details.url || !details.tabId) return;
	chrome.tabs.get(details.tabId, function(tab) {
		if (chrome.runtime.lastError) return;	// If the tab is no longer there

		// Only deal with main page and avoid chrome:// pages
		if (tab.url.match(/^chrome/)) return;
		var tabUrl = getRealUrl(tab.url);
		var detailUrl = getRealUrl(details.url);
		if (tabUrl !== detailUrl) return;

		// Check if targeted page
		chrome.storage.sync.get('__options__', function(opts) {
			var targets = opts['__options__']['targets'];
			for (var i = 0; i < targets.length; i++) {
				var exp = new RegExp(targets[i].replace(/\*/g, '.*'));
				if (details.url.match(exp)) {
					injectTagger(tab.id);
					break;
				}
			}

			// Even if it's not a target, show page icon
			showPageIcon(tabUrl, tab.id);
		});
	});
});

// When installed, set default options
chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason === 'install') {
		var opts = {};
		opts['__defaults__'] = {
			targets:	[
				'http*://www.google.com/*',
				'http*://duckduckgo.com/*',
				'http*://www.bing.com/*',
				'http*://*.yahoo.com/*'
			],
			tagnames:	{
				'red':		'Red',
				'orange':	'Orange',
				'yellow':	'Yellow',
				'green':	'Green',
				'blue':		'Blue',
				'purple':	'Purple'
			}
		};
		opts['__options__'] = JSON.parse(JSON.stringify(opts['__defaults__']));
		chrome.storage.sync.set(opts);
	}
});