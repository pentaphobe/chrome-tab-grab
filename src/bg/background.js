// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
// chrome.extension.onMessage.addListener(
// 	function(request, sender, sendResponse) {
// 		chrome.pageAction.show(sender.tab.id);
// 		sendResponse();
// 	}
// );

var lastResults = [];
function updateResults(tabs, suggest) {
	suggest || (suggest = function() {});
	var description = '<dim>Begin typing to search tabs</dim>';

	chrome.omnibox.setDefaultSuggestion({
		description: description
	});	
		// suggest([
		// 	{content: text + ' first', description: 'something'},
		// 	{content: text + ' second', description: 'something'}
		// ]);
	suggest(tabs.map(function(tab) {
		return {
			content: tab.title,
			description: tab.title
		}
	}));
}

var defaultQuery = {

};

// text can also have a type using a 'type:'
function updateSearch(text, suggest) {	
	var query = Object.assign({}, defaultQuery);
	var types = ['title'];
	var fullText = false;
	var parts = text.match(/^([^:]+):(.*)/);	
	if (parts) {
		types = parts[1].toLowerCase().split(':');
		text = parts[2];
	}
	function hasType(txt) {
		txt = txt.toLowerCase();
		var idx = types.indexOf(txt);
		if (idx !== -1) {
			return true;
		}
		return types.filter(function(val) {
			return val.startsWith(txt) || txt.startsWith(val);
		}).length > 0;
	}

	if (hasType('aud')) {
		query.audible = true;
	}
	if (hasType('pin')) {
		query.pinned = true;
	}
	if (hasType('full')) {
		fullText = true;
	}

	function search(tab) {
		var compoundText = tab.title;
		if (hasType('url')) {
			compoundText += tab.url;
		}
		if (fullText) {
			compoundText += tab.
		}
		return compoundText.toLowerCase().indexOf(text.toLowerCase()) !== -1;
	}

	chrome.tabs.query(query, function(tabs) {
		lastResults = tabs.filter(search);
		// console.log('result:', lastResults);	
		updateResults(lastResults, suggest);
	});
}

function completeSearch(text) {
	lastResults = lastResults.filter(function(tab) {
		// console.log(tab.title, text);
		return tab.title === text;
	});
	// console.log(lastResults);
	if (lastResults.length > 0) {
		var tab = lastResults[0];
		chrome.windows.update(tab.windowId, {
			focused: true,
			state: 'normal'
		});
		chrome.tabs.update(tab.id, {selected:true, active:true});
		// console.log('switching to tab', tab);				
	} else {
		// console.log('no results...');
	}
}

function setupOmnibox() {
	// console.log('setting up omnibox');	
	chrome.omnibox.onInputStarted.addListener(function() {
		// console.log('onInputStarted:', arguments);
		updateSearch('');
	});
	chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
		// console.log('onInputChanged:', arguments);
		updateSearch(text, suggest);
		// suggest([
		// 	{content: text + ' first', description: 'something'},
		// 	{content: text + ' second', description: 'something'}
		// ]);
	});
	chrome.omnibox.onInputEntered.addListener(function(text) {
		// console.log('onInputEntered:', text);		
		// console.log(lastResults);
		completeSearch(text);
	});
	chrome.omnibox.onInputCancelled.addListener(function() {
		// console.log('onInputCancelled:', arguments);
		// updateSearch('');
	});

}

function setupCommands() {
	// console.log('setting up keyboard shortcut');
	var commandSet = {
		'key-command': function() {
			// console.log('keyboard shortcut does nothing');
		}
	};
	chrome.commands.onCommand.addListener(function(command) {
		if (commandSet.hasOwnProperty(command)) {
			commandSet[command]();
		}
	});	
}

setupOmnibox();
setupCommands();




