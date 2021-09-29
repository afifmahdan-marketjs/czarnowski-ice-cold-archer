/*
# MarketJS Game Loading System
# -----------------------------------------------------------------------
# Copyright (c) 2012 MarketJS Limited. Certain portions may come from 3rd parties and
# carry their own licensing terms and are referenced where applicable. 
# -----------------------------------------------------------------------
*/

function loadScriptsSynchronously(arr) {
	if (!arr || !arr.length) return;
	var i;
	var loadFunctions = [];
	for (i = arr.length - 1; i >= 0; --i) {
		if (i == arr.length - 1) {
			loadFunctions[i] = (function (idx) { return function () { jQuery.getScript(arr[idx], function () { }); }; })(i);
		} else {
			loadFunctions[i] = (function (idx) { return function () { jQuery.getScript(arr[idx], loadFunctions[idx + 1]); }; })(i);
		}
	}
	loadFunctions[0]();
}

// if not on server, run compiled version
loadScriptsSynchronously([
	// _STRINGS
	'media/text/strings.js',
	//"lib/babylon/hand.minified-1.3.7.js",
	'lib/babylon/pep.js',
	'lib/babylon/webgl-namespace.js',

	//"lib/babylon/cannon.js",
	//"lib/babylon/oimo.js",
	"lib/babylon/babylon.4.2.0.js",

	// SETTINGS
	'settings/dev.js',

	// ADS		
	'settings/ad/mobile/header/themes/light/ad.js',
	'settings/ad/mobile/preroll/themes/light/ad.js',
	'settings/ad/mobile/footer/themes/light/ad.js',
	'settings/ad/mobile/end/themes/light/ad.js',

	// IE >=9 
	'glue/ie/ie.js',

	// Jukebox
	'glue/jukebox/Player.js',

	// ORIENTATION

	//Howler
	'glue/howler/howler.js',

	//Font
	'glue/font/promise.polyfill.js',
	'glue/font/fontfaceobserver.standalone.js',

	// Game
	'lib/impact/impact.js',
	'lib/game/main.js'

]);
