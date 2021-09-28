
this.jukebox = {};
/*
 * The first parameter @settings {Map} defines the settings of
 * the created instance which overwrites the {#defaults}.
 *
 * The second optional parameter @origin {Number} is a unique id of
 * another {jukebox.Player} instance, but it is only used internally
 * by the {jukebox.Manager} for creating and managing clones.
 */
jukebox.Player = function(settings, origin) {
	this.id = ++jukebox.__jukeboxId;
	this.origin = origin || null;


	this.settings = {};

	for (var d in this.defaults) {
		this.settings[d] = this.defaults[d];
	}

	if (Object.prototype.toString.call(settings) === '[object Object]') {
		for (var s in settings) {
			this.settings[s] = settings[s];
		}
	}


	/**
	 * #break(jukebox.Manager)
	 */

	// Pseudo-Singleton to prevent double-initializaion
	if (Object.prototype.toString.call(jukebox.Manager) === '[object Function]') {
		jukebox.Manager = new jukebox.Manager();
	}


	this.isPlaying = null;
	this.resource = null;


	// Get playable resources via Feature / Codec Detection
	if (Object.prototype.toString.call(jukebox.Manager) === '[object Object]') {
		this.resource = jukebox.Manager.getPlayableResource(this.settings.resources);
	} else {
		this.resource = this.settings.resources[0] || null;
	}


	if (this.resource === null) {
		throw "Your browser can't playback the given resources - or you have missed to include jukebox.Manager";
	} else {
		this.__init();
	}


	return this;

};

jukebox.__jukeboxId = 0;

jukebox.Player.prototype = {

	/*
	 * The defaults which are overwritten by the {#constructor}'s
	 * settings parameter.
	 *
	 * @resources contains an {Array} of File URL {String}s
	 * @spritemap is a Hashmap containing multiple @sprite-entry {Object}
	 *
	 * @autoplay is an optional {String} that autoplays a @sprite-entry
	 *
	 * @flashMediaElement is an optional setting that contains the
	 * relative URL {String} to the FlashMediaElement.swf for flash fallback.
	 *
	 * @timeout is a {Number} in milliseconds that is used if no "canplaythrough"
	 * event is fired on the Audio Node.
	 */
	defaults: {
		resources: [],
		autoplay: false,
		spritemap: {},
		flashMediaElement: './swf/FlashMediaElement.swf',
		timeout: 1000
	},


	/*
	 * PRIVATE API
	 */
	__addToManager: function(event) {

		if (this.__wasAddedToManager !== true) {
			jukebox.Manager.add(this);
			this.__wasAddedToManager = true;
		}

	},

	/*
	__log: function(title, desc) {

		if (!this.__logElement) {
			this.__logElement = document.createElement('ul');
			document.body.appendChild(this.__logElement);
		}

		var that = this;
		window.setTimeout(function() {
			var item = document.createElement('li');
			item.innerHTML = '<b>' + title + '</b>: ' + (desc ? desc : '');
			that.__logElement.appendChild(item);
		}, 0);

	},

	__updateBuffered: function(event) {

		var buffer = this.context.buffered;

		if (buffer) {

			for (var b = 0; b < buffer.length; b++) {
				this.__log(event.type, buffer.start(b).toString() + ' / ' + buffer.end(b).toString());
			}

		}

	},
	*/


	__init: function() {

		var that = this,
			settings = this.settings,
			features = {},
			api;

		if (jukebox.Manager && jukebox.Manager.features !== undefined) {
			features = jukebox.Manager.features;
		}

		// HTML5 Audio
		if (features.html5audio === true) {

			this.context = new Audio();
			this.context.src = this.resource;

			if (this.origin === null) {

				// This will add the stream to the manager's stream cache,
				// there's a fallback timeout if the canplaythrough event wasn't fired
				var addFunc = function(event){ that.__addToManager(event); };
				this.context.addEventListener('canplaythrough', addFunc, true);

				// Uh, Oh, What is it good for? Uh, Oh ...
				/*
					var bufferFunc = function(event) { that.__updateBuffered(event); };
					this.context.addEventListener('loadedmetadata', bufferFunc, true);
					this.context.addEventListener('progress', bufferFunc, true);
				*/

				// This is the timeout, we will penetrate the currentTime anyways.
				window.setTimeout(function(){
					that.context.removeEventListener('canplaythrough', addFunc, true);
					addFunc('timeout');
				}, settings.timeout);

			}

			// old WebKit
			this.context.autobuffer = true;

			// new WebKit
			this.context.preload = true;


			// FIXME: This is the hacky API, but got no more generic idea for now =/
			for (api in this.HTML5API) {
				this[api] = this.HTML5API[api];
			}

			if (features.channels > 1) {

				if (settings.autoplay === true) {
					this.context.autoplay = true;
				} else if (settings.spritemap[settings.autoplay] !== undefined) {
					this.play(settings.autoplay);
				}

			} else if (features.channels === 1 && settings.spritemap[settings.autoplay] !== undefined) {

				this.backgroundMusic = settings.spritemap[settings.autoplay];
				this.backgroundMusic.started = Date.now ? Date.now() : +new Date();

				// Initial playback will do the trick for iOS' security model
				this.play(settings.autoplay);

			}

			// Pause audio on screen timeout because it can't be controlled then.
			if (features.channels == 1 && settings.canPlayBackground !== true) {
				// This does not work in iOS < 5.0 and Windows Phone.
				// Calling audio.pause() after onbeforeunload event on Windows Phone may
				// remove all audio from the browser until you restart the device.
				window.addEventListener('pagehide', function() {
					if (that.isPlaying !== null) {
						that.pause();
						that.__wasAutoPaused = true;
					}
				});
				window.addEventListener('pageshow', function() {
					if (that.__wasAutoPaused) {
						that.resume();
						delete that._wasAutoPaused;
					}
				});
			}


		// Flash Audio
		} else if (features.flashaudio === true) {

			// FIXME: This is the hacky API, but got no more generic idea for now =/
			for (api in this.FLASHAPI) {
				this[api] = this.FLASHAPI[api];
			}

			var flashVars = [
				'id=jukebox-flashstream-' + this.id,
				'autoplay=' + settings.autoplay,
				'file=' + window.encodeURIComponent(this.resource)
			];

			// Too much crappy code, have this in a crappy function instead.
			this.__initFlashContext(flashVars);

			if (settings.autoplay === true) {
				this.play(0);
			} else if (settings.spritemap[settings.autoplay]) {
				this.play(settings.autoplay);
			}

		} else {

			throw "Your Browser does not support Flash Audio or HTML5 Audio.";

		}

	},

	/*
	 * This is not that simple, better code structure with a helper function
	 */
	__initFlashContext: function(flashVars) {

		var context,
			url = this.settings.flashMediaElement,
			p;

		var params = {
			'flashvars': flashVars.join('&'),
			'quality': 'high',
			'bgcolor': '#000000',
			'wmode': 'transparent',
			'allowscriptaccess': 'always',
			'allowfullscreen': 'true'
		};

		/*
		 * IE will only render a Shockwave Flash file if there's this crappy outerHTML used.
		 */
		if (navigator.userAgent.match(/MSIE/)) {

			context = document.createElement('div');

			// outerHTML only works in IE when context is already in DOM
			document.getElementsByTagName('body')[0].appendChild(context);


			var object = document.createElement('object');

			object.id = 'jukebox-flashstream-' + this.id;
			object.setAttribute('type', 'application/x-shockwave-flash');
			object.setAttribute('classid', 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000');
			object.setAttribute('width', '0');
			object.setAttribute('height', '0');


			// IE specific params
			params.movie = url + '?x=' + (Date.now ? Date.now() : +new Date());
			params.flashvars = flashVars.join('&amp;');



			for (p in params) {

				var element = document.createElement('param');
				element.setAttribute('name', p);
				element.setAttribute('value', params[p]);
				object.appendChild(element);

			}

			context.outerHTML = object.outerHTML;

			this.context = document.getElementById('jukebox-flashstream-' + this.id);


		/*
		 * This is the case for a cool, but outdated Browser
		 * ... like Netscape or so ;)
		 */
		} else {

			context = document.createElement('embed');
			context.id = 'jukebox-flashstream-' + this.id;
			context.setAttribute('type', 'application/x-shockwave-flash');
			context.setAttribute('width', '100');
			context.setAttribute('height', '100');

			params.play = false;
			params.loop = false;
			params.src = url + '?x=' + (Date.now ? Date.now() : +new Date());

			for (p in params) {
				context.setAttribute(p, params[p]);
			}

			document.getElementsByTagName('body')[0].appendChild(context);

			this.context = context;

		}

	},

	/*
	 * This is the background hack for iOS and other single-channel systems
	 * It allows playback of a background music, which will be overwritten by playbacks
	 * of other sprite entries. After these entries, background music continues.
	 *
	 * This allows us to trick out the iOS Security Model after initial playback =)
	 */
	backgroundHackForiOS: function() {

		if (this.backgroundMusic === undefined) {
			return;
		}

		var now = Date.now ? Date.now() : +new Date();

		if (this.backgroundMusic.started === undefined) {

			this.backgroundMusic.started = now;
			this.setCurrentTime(this.backgroundMusic.start);

		} else {

			this.backgroundMusic.lastPointer = (( now - this.backgroundMusic.started) / 1000) % (this.backgroundMusic.end - this.backgroundMusic.start) + this.backgroundMusic.start;
			this.play(this.backgroundMusic.lastPointer);

		}

	},



	/*
	 * PUBLIC API
	 */

	/*
	 * This method will try to playback a given @pointer position of the stream.
	 * The @pointer position can be either a {String} of a sprite entry inside
	 * {#settings.spritemap} or a {Number} in seconds.
	 *
	 * The optional parameter @enforce is a {Boolean} that enforces the stream
	 * playback and avoids queueing or work delegation to a free clone.
	 */
	play: function(pointer, enforce) {

		if (this.isPlaying !== null && enforce !== true) {

			if (jukebox.Manager !== undefined) {
				jukebox.Manager.addToQueue(pointer, this.id);
			}

			return;

		}

		var spritemap = this.settings.spritemap,
			newPosition;

		// Spritemap Entry Playback
		if (spritemap[pointer] !== undefined) {

			newPosition = spritemap[pointer].start;

		// Seconds-Position Playback (find out matching spritemap entry)
		} else if (typeof pointer === 'number') {

			newPosition = pointer;

			for (var s in spritemap) {

				if (newPosition >= spritemap[s].start && newPosition <= spritemap[s].end) {
					pointer = s;
					break;
				}

			}

		}

		if (newPosition !== undefined && Object.prototype.toString.call(spritemap[pointer]) === '[object Object]') {

			this.isPlaying = this.settings.spritemap[pointer];

			// Start Playback, stream position will be corrected by jukebox.Manager
			if (this.context.play) {
				this.context.play();
			}

			// Locking due to slow Implementation on Mobile Devices
			this.wasReady = this.setCurrentTime(newPosition);

		}

	},

	/*
	 * This method will stop the current playback and resets the pointer that is
	 * cached by {#pause} method calls.
	 *
	 * It automatically starts the backgroundMusic for single-stream environments.
	 */
	stop: function() {

		this.__lastPosition = 0; // reset pointer
		this.isPlaying = null;

		// Was a Background Music played already?
		if (this.backgroundMusic) {
			this.backgroundHackForiOS();
		} else {
			this.context.pause();
		}

		return true;

	},

	/*
	 * {Number} This method will pause the current playback and cache the current position
	 * that is used by {#resume} on its next call.
	 *
	 * It returns the last position {Number} in seconds, so that you can optionally
	 * use it in the {#resume} method call.
	 */
	pause: function() {

		this.isPlaying = null;

		this.__lastPosition = this.getCurrentTime();
		this.context.pause();

		return this.__lastPosition;

	},

	/*
	 * {Boolean} This method will resume playback. If the optional parameter @position
	 * {Number} is not used, it will try to playback the last cached position from the
	 * last {#pause} method call.
	 *
	 * If no @position and no cached position is available, it will start playback - no
	 * matter where the stream is currently at.
	 *
	 * It returns {True} if a cached position was used. If no given and no cached
	 * position was used for playback, it will return {False}
	 */
	resume: function(position) {

		position = typeof position === 'number' ? position : this.__lastPosition;

		if (position !== null) {

			this.play(position);
			this.__lastPosition = null;
			return true;

		} else {

			this.context.play();
			return false;

		}

	},



	/*
	 * HTML5 Audio API abstraction layer
	 */
	HTML5API: {

		/*
		 * {Number} This method will return the current volume as a {Number}
		 * from 0 to 1.0.
		 */
		getVolume: function() {
			return this.context.volume || 1;
		},

		/*
		 * This method will set the volume to a given @value that is a {Number}
		 * from 0 to 1.0.
		 */
		setVolume: function(value) {

			this.context.volume = value;

			// This is apparently only for mobile implementations
			if (Math.abs(this.context.volume - value) < 0.0001) {
				return true;
			}


			return false;

		},

		/*
		 * {Number} This method will return the current pointer position in
		 * the stream in seconds.
		 */
		getCurrentTime: function() {
			return this.context.currentTime || 0;
		},

		/*
		 * {Boolean} This method will set the current pointer position to a
		 * new @value {Number} in seconds.
		 *
		 * It returns {True} on success, {False} if the stream wasn't ready
		 * at the given stream position @value.
		 */
		setCurrentTime: function(value) {

			try {
				// DOM Exceptions are fired when Audio Element isn't ready yet.
				this.context.currentTime = value;
				return true;
			} catch(e) {
				return false;
			}

		}

	},



	/*
	 * Flash Audio API abstraction layer
	 */
	FLASHAPI: {

		/*
		 * {Number} This method will return the current volume of the stream as
		 * a {Number} from 0 to 1.0, considering the Flash JavaScript API is
		 * ready for access.
		 */
		getVolume: function() {

			// Avoid stupid exceptions, wait for JavaScript API to be ready
			if (this.context && typeof this.context.getVolume === 'function') {
				return this.context.getVolume();
			}

			return 1;

		},

		/*
		 * {Boolean} This method will set the volume to a given @value which is
		 * a {Number} from 0 to 1.0. It will return {True} if the Flash
		 * JavaScript API is ready for access. It returns {False} if the Flash
		 * JavaScript API wasn't ready.
		 */
		setVolume: function(value) {

			// Avoid stupid exceptions, wait for JavaScript API to be ready
			if (this.context && typeof this.context.setVolume === 'function') {
				this.context.setVolume(value);
				return true;
			}

			return false;

		},

		/*
		 * {Number} This method will return the pointer position in the stream in
		 * seconds.
		 *
		 * If the Flash JavaScript API wasn't ready, the pointer position is 0.
		 */
		getCurrentTime: function() {

			// Avoid stupid exceptions, wait for JavaScript API to be ready
			if (this.context && typeof this.context.getCurrentTime === 'function') {
				return this.context.getCurrentTime();
			}

			return 0;

		},

		/*
		 * {Boolean} This method will set the pointer position to a given @value {Number}
		 * in seconds.
		 *
		 * It will return {True} if the Flash JavaScript API was ready. If not, it
		 * will return {False}.
		 */
		setCurrentTime: function(value) {

			// Avoid stupid exceptions, wait for JavaScript API to be ready
			if (this.context && typeof this.context.setCurrentTime === 'function') {
				return this.context.setCurrentTime(value);
			}

			return false;

		}

	}

};

if (this.jukebox === undefined) {
	throw "jukebox.Manager requires jukebox.Player (Player.js) to run properly."
}


/*
 * This is the transparent jukebox.Manager that runs in the background.
 * You shouldn't have to call this constructor, only if you want to overwrite the
 * defaults for having an own gameloop.
 *
 * The first parameter @settings {Map} overwrites the {#defaults}.
 */
jukebox.Manager = function(settings) {

	this.features = {};
	this.codecs = {};

	// Correction, Reset & Pause
	this.__players = {};
	this.__playersLength = 0;

	// Queuing functionality
	this.__clones = {};
	this.__queue = [];


	this.settings = {};

	for (var d in this.defaults) {
		this.settings[d] = this.defaults[d];
	}

	if (Object.prototype.toString.call(settings) === '[object Object]') {
		for (var s in settings) {
			this.settings[s] = settings[s];
		}
	}


	this.__detectFeatures();


	// If you don't want to use an own game loop
	if (this.settings.useGameLoop === false) {

		jukebox.Manager.__initialized = window.setInterval(function() {
			jukebox.Manager.loop();
		}, 20);

	} else {
		jukebox.Manager.__initialized = true;
	}

};

jukebox.Manager.prototype = {

	/*
	 * The defaults {Map} consist of two different flags.
	 *
	 * The @useFlash {Boolean} which is available for enforcing flash
	 * usage and the @useGameLoop {Boolean} that allows you to use your
	 * own game loop for avoiding multiple intervals inside the Browser.
	 *
	 * If @useGameLoop is set to {True} you will have to call the
	 * {#jukebox.Manager.loop} method everytime in your gameloop.
	 */
	defaults: {
		useFlash: false,
		useGameLoop: false
	},

	__detectFeatures: function() {

		/*
		 * HTML5 Audio Support
		 */
		var audio = window.Audio && new Audio();

		if (audio && audio.canPlayType && this.settings.useFlash === false) {

			// Codec Detection MIME List
			var mimeList = [
				// e = extension, m = mime type
				{ e: '3gp', m: [ 'audio/3gpp', 'audio/amr' ] },
				// { e: 'avi', m: 'video/x-msvideo' }, // avi container allows pretty everything, impossible to detect -.-
				{ e: 'aac', m: [ 'audio/aac', 'audio/aacp' ] },
				{ e: 'amr', m: [ 'audio/amr', 'audio/3gpp' ] },
				// iOS aiff container that uses IMA4 (4:1 compression) on diff
				{ e: 'caf', m: [ 'audio/IMA-ADPCM', 'audio/x-adpcm', 'audio/x-aiff; codecs="IMA-ADPCM, ADPCM"' ] },
				{ e: 'm4a', m: [ 'audio/mp4', 'audio/mp4; codecs="mp4a.40.2,avc1.42E01E"', 'audio/mpeg4', 'audio/mpeg4-generic', 'audio/mp4a-latm', 'audio/MP4A-LATM', 'audio/x-m4a' ] },
				{ e: 'mp3', m: [ 'audio/mp3', 'audio/mpeg', 'audio/mpeg; codecs="mp3"', 'audio/MPA', 'audio/mpa-robust' ] }, // mpeg was name for mp2 and mp3! avi container was mp4/m4a
				{ e: 'mpga', m: [ 'audio/MPA', 'audio/mpa-robust', 'audio/mpeg', 'video/mpeg' ] },
				{ e: 'mp4', m: [ 'audio/mp4', 'video/mp4' ] },
				{ e: 'ogg', m: [ 'application/ogg', 'audio/ogg', 'audio/ogg; codecs="theora, vorbis"', 'video/ogg', 'video/ogg; codecs="theora, vorbis"' ] },
				{ e: 'wav', m: [ 'audio/wave', 'audio/wav', 'audio/wav; codecs="1"', 'audio/x-wav', 'audio/x-pn-wav' ] },
				{ e: 'webm', m: [ 'audio/webm', 'audio/webm; codecs="vorbis"', 'video/webm' ] }
			];

			var mime, extension;
			for (var m = 0, l = mimeList.length; m < l; m++) {

				extension = mimeList[m].e;

				if (mimeList[m].m.length && typeof mimeList[m].m === 'object') {

					for (var mm = 0, mml = mimeList[m].m.length; mm < mml; mm++) {

						mime = mimeList[m].m[mm];

						// Supported Codec was found for Extension, so skip redundant checks
						if (audio.canPlayType(mime) !== "") {
							this.codecs[extension] = mime;
							break;

						// Flag the unsupported extension (that it is also not supported for Flash Fallback)
						} else if (!this.codecs[extension]) {
							this.codecs[extension] = false;
						}

					}

				}

				// Go, GC, Go for it!
				mime = null;
				extension = null;

			}

			// Browser supports HTML5 Audio API theoretically, but support depends on Codec Implementations
			this.features.html5audio = !!(this.codecs.mp3 || this.codecs.ogg || this.codecs.webm || this.codecs.wav);

			// Default Channel Amount is 8, known to work with all Browsers
			this.features.channels = 8;

			// Detect Volume support
			audio.volume = 0.1337;
			this.features.volume = !!(Math.abs(audio.volume - 0.1337) < 0.0001);


			// FIXME: HACK, but there's no way to detect these crappy implementations
			if (
				// navigator.userAgent.match(/MSIE 9\.0/) ||
				navigator.userAgent.match(/iPhone|iPod|iPad/i)) {
				this.features.channels = 1;
			}

		}



		/*
		 * Flash Audio Support
		 * Hint: All Android devices support Flash, even Android 1.6 ones
		 */
		this.features.flashaudio = !!navigator.mimeTypes['application/x-shockwave-flash'] || !!navigator.plugins['Shockwave Flash'] || false;

		// Internet Explorer
		if (window.ActiveXObject){
			try {
				var flash = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.10');
				this.features.flashaudio = true;
			} catch(e) {
				// Throws an error if the version isn't available
			}
		}

		// Allow enforce of Flash Usage
		if (this.settings.useFlash === true) {
			this.features.flashaudio = true;
		}

		if (this.features.flashaudio === true) {

			// Overwrite Codecs only if there's no HTML5 Audio support
			if (!this.features.html5audio) {

				// Known to work with every Flash Implementation
				this.codecs.mp3 = 'audio/mp3';
				this.codecs.mpga = 'audio/mpeg';
				this.codecs.mp4 = 'audio/mp4';
				this.codecs.m4a = 'audio/mp4';


				// Flash Runtime on Android also supports GSM codecs, but impossible to detect
				this.codecs['3gp'] = 'audio/3gpp';
				this.codecs.amr = 'audio/amr';


				// TODO: Multi-Channel support on ActionScript-side
				this.features.volume = true;
				this.features.channels = 1;

			}

		}

	},


	__getPlayerById: function(id) {

		if (this.__players && this.__players[id] !== undefined) {
			return this.__players[id];
		}

		return null;

	},

	__getClone: function(origin, settings) {

		// Search for a free clone
		for (var cloneId in this.__clones) {

			var clone = this.__clones[cloneId];
			if (
				clone.isPlaying === null
				&& clone.origin === origin
			) {
				return clone;
			}

		}


		// Create a new clone
		if (Object.prototype.toString.call(settings) === '[object Object]') {

			var cloneSettings = {};
			for (var s in settings) {
				cloneSettings[s] = settings[s];
			}

			// Clones just don't autoplay. Just don't :)
			cloneSettings.autoplay = false;

			var newClone = new jukebox.Player(cloneSettings, origin);
			newClone.isClone = true;
			newClone.wasReady = false;

			this.__clones[newClone.id] = newClone;

			return newClone;

		}

		return null;

	},



	/*
	 * PUBLIC API
	 */

	/*
	 * This method is the stream-correction sound loop.
	 *
	 * In case you have overwritten the {jukebox.Manager} instance
	 * by yourself (with calling the constructor) and in case you
	 * have set the #settings.useGameLoop to {True}, you will have to
	 * call this method every time inside your gameloop.
	 */
	loop: function() {

		// Nothing to do
		if (
			this.__playersLength === 0
			// || jukebox.Manager.__initialized !== true
		) {
			return;
		}


		// Queue Functionality for Clone-supporting environments
		if (
			this.__queue.length
			&& this.__playersLength < this.features.channels
		) {

			var queueEntry = this.__queue[0],
				originPlayer = this.__getPlayerById(queueEntry.origin);

			if (originPlayer !== null) {

				var freeClone = this.__getClone(queueEntry.origin, originPlayer.settings);

				// Use free clone for playback
				if (freeClone !== null) {

					if (this.features.volume === true) {
						var originPlayer = this.__players[queueEntry.origin];
						originPlayer && freeClone.setVolume(originPlayer.getVolume());
					}

					this.add(freeClone);
					freeClone.play(queueEntry.pointer, true);

				}

			}

			// Remove Queue Entry. It's corrupt if nothing happened.
			this.__queue.splice(0, 1);

			return;


		// Queue Functionality for Single-Mode (iOS)
		} else if (
			this.__queue.length
			&& this.features.channels === 1
		) {

			var queueEntry = this.__queue[0],
				originPlayer = this.__getPlayerById(queueEntry.origin);

			if (originPlayer !== null) {
				originPlayer.play(queueEntry.pointer, true);
			}

			// Remove Queue Entry. It's corrupt if nothing happened
			this.__queue.splice(0, 1);

		}



		for (var id in this.__players) {

			var player = this.__players[id],
				playerPosition = player.getCurrentTime() || 0;


			// Correction
			if (player.isPlaying && player.wasReady === false) {

				player.wasReady = player.setCurrentTime(player.isPlaying.start);

			// Reset / Stop
			} else if (player.isPlaying && player.wasReady === true){

				if (playerPosition > player.isPlaying.end) {

					if (player.isPlaying.loop === true) {
						player.play(player.isPlaying.start, true);
					} else {
						player.stop();
					}

				}


			// Remove Idling Clones
			} else if (player.isClone && player.isPlaying === null) {

				this.remove(player);
				continue;


			// Background Music for Single-Mode (iOS)
			} else if (player.backgroundMusic !== undefined && player.isPlaying === null) {

				if (playerPosition > player.backgroundMusic.end) {
					player.backgroundHackForiOS();
				}

			}

		}


	},

	/*
	 * {String|Null} This method will check a @resources {Array} for playable resources
	 * due to codec and feature detection.
	 *
	 * It will return a {String} containing the preferred resource and {Null} if no
	 * playable resources was found.
	 *
	 * Hint: The highest preferred is the 0-index in the @resources {Array}. The latest
	 * index is the one with lowest preference.
	 */
	getPlayableResource: function(resources) {

		if (Object.prototype.toString.call(resources) !== '[object Array]') {
			resources = [ resources ];
		}


		for (var r = 0, l = resources.length; r < l; r++) {

			var resource = resources[r],
				extension = resource.match(/\.([^\.]*)$/)[1];

			// Yay! We found a supported resource!
			if (extension && !!this.codecs[extension]) {
				return resource;
			}

		}

		return null;

	},

	/*
	 * {Boolean} This method will add a @player {jukebox.Player} instance to the stream-correction
	 * sound loop.
	 *
	 * It will return {True} if the {jukebox.Player} instance was successfully added
	 * and {False} if the @player was an invalid parameter.
	 */
	add: function(player) {

		if (
			player instanceof jukebox.Player
			&& this.__players[player.id] === undefined
		) {
			this.__playersLength++;
			this.__players[player.id] = player;
			return true;
		}

		return false;

	},

	/*
	 * {Boolean} This method will remove a @player {jukebox.Player} instance from
	 * the stream-correction sound loop.
	 *
	 * It will return {True} if the {jukebox.Player} instance was successfully removed
	 * and {False} if the @player was an invalid parameter.
	 */
	remove: function(player) {

		if (
			player instanceof jukebox.Player
			&& this.__players[player.id] !== undefined
		) {
			this.__playersLength--;
			delete this.__players[player.id];
			return true;
		}

		return false;

	},

	/*
	 * This method is kindof public, but only used internally
	 *
	 * DON'T USE IT!
	 */
	addToQueue: function(pointer, playerId) {

		if (
			(typeof pointer === 'string' || typeof pointer === 'number')
			&& this.__players[playerId] !== undefined
		) {

			this.__queue.push({
				pointer: pointer,
				origin: playerId
			});

			return true;

		}

		return false;

	}

};



