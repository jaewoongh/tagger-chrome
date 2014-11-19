// Save options
var saveOptions = function() {
	var opts = {};
	opts['__options__'] = {};
	opts['__options__']['targets'] = document.getElementById('targets').value.split('\n');
	var tagnames = document.getElementById('tagnames').value.split('\n');
	opts['__options__']['tagnames'] = {
		'red':		tagnames[0] || 'Red',
		'orange':	tagnames[1] || 'Orange',
		'yellow':	tagnames[2] || 'Yellow',
		'green':	tagnames[3] || 'Green',
		'blue':		tagnames[4] || 'Blue',
		'purple':	tagnames[5] || 'Purple'
	};
	chrome.storage.sync.set(opts, loadOptions);
};

// Restore default options
var restoreOptions = function() {
	chrome.storage.sync.get('__defaults__', function(item) {
		if (!item) console.error('Cannot find default options!');
		var opts = {};
		opts['__options__'] = JSON.parse(JSON.stringify(item['__defaults__']));
		chrome.storage.sync.set(opts, loadOptions);
	});
};

// Change context menu names
var applyChangeToContextMenu = function(names) {
	chrome.contextMenus.update('tag-red', 		{ title: names['red'] });
	chrome.contextMenus.update('tag-orange', 	{ title: names['orange'] });
	chrome.contextMenus.update('tag-yellow', 	{ title: names['yellow'] });
	chrome.contextMenus.update('tag-green', 	{ title: names['green'] });
	chrome.contextMenus.update('tag-blue', 		{ title: names['blue'] });
	chrome.contextMenus.update('tag-purple', 	{ title: names['purple'] });
};

// Load current options to DOM
var loadOptions = function() {
	chrome.storage.sync.get('__options__', function(item) {
		document.getElementById('targets').value = item['__options__']['targets'].join('\n');
		document.getElementById('tagnames').value =
			item['__options__']['tagnames']['red'] + '\n' +
			item['__options__']['tagnames']['orange'] + '\n' +
			item['__options__']['tagnames']['yellow'] + '\n' +
			item['__options__']['tagnames']['green'] + '\n' +
			item['__options__']['tagnames']['blue'] + '\n' +
			item['__options__']['tagnames']['purple'];
		applyChangeToContextMenu(item['__options__']['tagnames']);
	});
};

// Attach events
document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('restore').addEventListener('click', restoreOptions);