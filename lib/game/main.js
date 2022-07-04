ig.module(
	'game.main'
)
	.requires(
		'impact.game',
		'impact.debug.debug',
		//Patches
		"plugins.patches.timer-patch",
		'plugins.patches.user-agent-patch',
		'plugins.patches.webkit-image-smoothing-patch',
		'plugins.patches.windowfocus-onMouseDown-patch',
		"plugins.patches.input-patch",

		// Data types
		'plugins.data.vector',
		'plugins.data.color-rgb',

		// PLUGINS
		'plugins.font.font-loader',
		'plugins.handlers.dom-handler',
		'plugins.handlers.size-handler',
		'plugins.handlers.api-handler',
		'plugins.handlers.visibility-handler',
		'plugins.audio.sound-handler',
		'plugins.io.io-manager',
		'plugins.io.storage-manager',
		'plugins.splash-loader',
		'plugins.tween',
		'plugins.tweens-handler',
		'plugins.url-parameters',
		'plugins.director',
		'plugins.impact-storage',
		'plugins.responsive.responsive-plugin',

		// BRANDING SPLASH
		'plugins.branding.splash',

		'plugins.datastructure.binary-heap',

		// BRANDING ENTITIES
		'game.entities.branding-logo-placeholder',

		// MORE GAMES
		'game.entities.buttons.button-more-games',

		// ENTITIES
		'game.entities.pointer',
		'game.entities.pointer-selector',
		'game.entities.select',

		// LEVELS
		'game.levels.opening',
		'game.levels.main-menu',
		'game.levels.main-menu-settings',
		'game.levels.game-over',
		'game.levels.gameplay',
		'game.levels.tutorial',
		//WEBGL
		'game.scene3d.babylon-scene-controller',
		'game.toybox.content',
		'plugins.fullscreen'
	)
	.defines(function () {
		this.START_OBFUSCATION;
		this.FRAMEBREAKER;

		MyGame = ig.Game.extend({
			name: "MJS-Cool-Archer-Prototype",
			version: "1.0.0",
			frameworkVersion: "1.4.5",
			io: null,
			paused: false,
			lastDraw: [],

			scorelist: null,
			score: 0,

			sfxDefaultVolume: 0.7,
			bgmDefaultVolume: 1,

			init: function () {
				this.tweens = new ig.TweensHandler();

				//The io manager so you can access ig.game.io.mouse
				this.io = new IoManager();
				this.setupUrlParams = new ig.UrlParameters();

				this.removeLoadingWheel();
				this.setupStorageManager(); // Uncomment to use Storage Manager
				this.finalize();
			},

			initData: function () {
				return this.sessionData = {
					sound: ig.game.sfxDefaultVolume,
					music: ig.game.bgmDefaultVolume,
					hasShownTutorial: false,
					score: 0
				};
			},

			finalize: function () {
				this.start();
				ig.sizeHandler.reorient();
			},


			removeLoadingWheel: function () {
				// Remove the loading wheel
				try {
					$('#ajaxbar').css('background', 'none');
				} catch (err) {
					console.log(err)
				}
			},

			showDebugMenu: function () {
				console.log('showing debug menu ...');
				// SHOW DEBUG LINES
				ig.Entity._debugShowBoxes = true;

				// SHOW DEBUG PANELS	
				$('.ig_debug').show();
			},

			start: function () {
				this.resetPlayerStats();
				this.director = new ig.Director(this, [
					LevelOpening,
					LevelMainMenu,
					LevelGameplay,
					LevelMainMenuSettings,
					LevelGameOver,
					LevelTutorial,
				]);

				// CALL LOAD LEVELS
				if (_SETTINGS['Branding']['Splash']['Enabled']) {
					try {
						this.branding = new ig.BrandingSplash();
					} catch (err) {
						console.log(err)
						console.log('Loading original levels ...')
						this.startGame();
					}
				} else {
					this.startGame();
				}

				this.spawnEntity(EntityPointerSelector, 50, 50);

				// MUSIC // Changed to use ig.soundHandler
				ig.input.bind(ig.KEY.UP_ARROW, 'jump');
				ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
				ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
				ig.input.bind(ig.KEY.W, 'jump');
				ig.input.bind(ig.KEY.A, 'left');
				ig.input.bind(ig.KEY.D, 'right');
				ig.input.bind(ig.KEY.SPACE, 'jump');

				// MUSIC // Changed to use ig.soundHandler
				ig.soundHandler.bgmPlayer.volume(ig.game.sessionData.music);
				ig.soundHandler.sfxPlayer.volume(ig.game.sessionData.sound);
			},

			startGame: function () {
				this.director.loadLevel(this.director.currentLevel);
				// this.goToLevel("Gameplay")
				// this.goToLevel("MainMenuSettings")
				// this.goToLevel("MainMenu")
				// this.goToLevel("Tutorial")
				// this.goToLevel("LevelSelect")
				// this.goToLevel("GridLevelSelect")
				// ig.gameScene3D.player.score = 50;
				// ig.lastScore = 50;
				// ig.game.sessionData.score = 100;
				// this.goToLevel("GameOver")
				// this.goToLevel("LevelClear")
			},

			goToLevel: function (name) {
				this.director.loadLevel(this.getLevelID(name));
			},

			getLevelID: function (name) {
				for (var i = 0; i < this.director.levels.length; i++) {
					var level = this.director.levels[i];
					if (level.entities && level.entities[0].type == "Entity" + name + "Controller") {
						return i;
					}
				}
				console.error("Cannot find level named : " + name)
				return 0;
			},


			fpsCount: function () {
				if (!this.fpsTimer) {
					this.fpsTimer = new ig.Timer(1);
				}
				if (this.fpsTimer && this.fpsTimer.delta() < 0) {
					if (this.fpsCounter != null) {
						this.fpsCounter++;
					} else {
						this.fpsCounter = 0;
					}
				} else {
					ig.game.fps = this.fpsCounter;
					this.fpsCounter = 0;
					this.fpsTimer.reset();
				}
			},

			endGame: function () {
				console.log('End game')
				// IMPORTANT
				ig.soundHandler.bgmPlayer.stop();

				// SUBMIT STATISTICS - USE ONLY WHEN MARKETJS API IS CONFIGURED
				// this.submitStats();
				ig.apiHandler.run("MJSEnd");
			},

			resetPlayerStats: function () {
				ig.log('resetting player stats ...');
				this.playerStats = {
					// EG: coins,score,lives, etc
					id: this.playerStats ? this.playerStats.id : null, // FOR FACEBOOK LOGIN IDS
				}
			},

			splashClick: function () {
				var elem = ig.domHandler.getElementById("#play")
				ig.domHandler.hide(elem);
				// Show ads
				ig.apiHandler.run("MJSFooter");
				ig.apiHandler.run("MJSHeader");

				ig.game.start();
				//ig.soundHandler.bgmPlayer.play(ig.soundHandler.bgmPlayer.soundList.bgm);
			},

			pauseGame: function () {
				ig.system.stopRunLoop.call(ig.system);
				ig.game.tweens.onSystemPause();
				ig.babylonSceneController.paused = true;
				console.log('Game Paused');
			},

			resumeGame: function () {
				ig.system.startRunLoop.call(ig.system);
				ig.game.tweens.onSystemResume();
				ig.babylonSceneController.paused = false;
				console.log('Game Resumed');
			},

			showOverlay: function (divList) {
				for (i = 0; i < divList.length; i++) {
					if ($('#' + divList[i])) $('#' + divList[i]).show();
					if (document.getElementById(divList[i])) document.getElementById(divList[i]).style.visibility = "visible";
				}

				// OPTIONAL
				//this.pauseGame();		
			},

			hideOverlay: function (divList) {
				for (i = 0; i < divList.length; i++) {
					if ($('#' + divList[i])) $('#' + divList[i]).hide();
					if (document.getElementById(divList[i])) document.getElementById(divList[i]).style.visibility = "hidden";
				}

				// OPTIONAL
				//this.resumeGame();
			},

			currentBGMVolume: 1,
			addition: 0.1,
			// MODIFIED UPDATE() function to utilize Pause button. See EntityPause (pause.js)
			update: function () {

				//Optional - to use 
				//this.fpsCount();
				if (this.paused) {
					// only update some of the entities when paused:
					this.updateWhilePaused();
					this.checkEntities();
				}
				else {
					// call update() as normal when not paused
					this.parent();

					//BGM looping fix for mobile 
					if (ig.ua.mobile && ig.soundHandler) // A win phone fix by yew meng added into ig.soundHandler
					{
						ig.soundHandler.forceLoopBGM();
					}
				}

				this.io.clear();

			},

			updateWhilePaused: function () {
				for (var i = 0; i < this.entities.length; i++) {
					if (this.entities[i].ignorePause) {
						this.entities[i].update();
					}
				}
			},

			draw: function () {
				this.parent();
				this.drawFPS();
				//Optional - to use , debug console , e.g : ig.game.debugCL("debug something");
				//hold click on screen for 2s to enable debug console
				//this.drawDebug();

				for (var i = 0; i < this.lastDraw.length; i++) {
					this.lastDraw[i]();

				}
				this.dctf();
			},

			dctf: function () {
				this.COPYRIGHT;
			},

			drawFPS: function () {
				var fps = Math.round(1000 / ig.debug.debugTickAvg);
				//console.log("fps:"+fps);
				// var ctx = ig.system.context;
				// ctx.fillText("FPS:" + fps, 500, 50);
				this.fillStrokeText("[ WEBGL " + ig.altBabylon.engine.webGLVersion + " ][ FPS C " + fps + " ][ FPS B " + ig.altBabylon.engine.performanceMonitor.averageFPS.toFixed() + " ]", 5, 953);

			},
			fillStrokeText: function (text, x, y) {
				var ctx = ig.system.context;
				// ctx.strokeText(text, x, y);
				var w = ctx.measureText(text).width + 4;
				ctx.save();
				ctx.fillStyle = "#333333"
				ctx.fillRect(x - 3, y - 11, w + 4, 16);
				ctx.fillStyle = "#ffffff"
				ctx.fillText(text, x, y);
				ctx.restore();
			},

			/**
			* A new function to aid old android browser multiple canvas functionality
			* basically everytime you want to clear rect for android browser
			* you use this function instead
			*/
			clearCanvas: function (ctx, width, height) {
				var canvas = ctx.canvas;
				ctx.clearRect(0, 0, width, height);
				/*
				var w=canvas.width;
				canvas.width=1;
				canvas.width=w; 
				*/
				/*
				canvas.style.visibility = "hidden"; // Force a change in DOM
				canvas.offsetHeight; // Cause a repaint to take play
				canvas.style.visibility = "inherit"; // Make visible again
				*/

				canvas.style.display = "none";// Detach from DOM
				canvas.offsetHeight; // Force the detach
				canvas.style.display = "inherit"; // Reattach to DOM

			},

			drawDebug: function () {	//-----draw debug-----
				if (!ig.global.wm) {
					// enable console
					this.debugEnable();
					//debug postion set to top left
					if (this.viewDebug) {

						//draw debug bg				
						ig.system.context.fillStyle = '#000000';
						ig.system.context.globalAlpha = 0.35;
						ig.system.context.fillRect(0, 0, ig.system.width / 4, ig.system.height);
						ig.system.context.globalAlpha = 1;

						if (this.debug && this.debug.length > 0) {
							//draw debug console log
							for (i = 0; i < this.debug.length; i++) {
								ig.system.context.font = "10px Arial";
								ig.system.context.fillStyle = '#ffffff';
								ig.system.context.fillText(this.debugLine - this.debug.length + i + ": " + this.debug[i], 10, 50 + 10 * i);
							}

							// delete console log 1 by 1 per 2s , OPTIONAL
							//if(!this.debugTimer){
							//	this.debugTimer = new ig.Timer(2);
							//}else if(this.debugTimer && this.debugTimer.delta() > 0){
							//	this.debug.splice(0,1);
							//	if(this.debug.length > 0){
							//		this.debugTimer.reset();
							//	}else{
							//		this.debugTimer = null ;
							//	}
							//}
						}
					}
				}
			},

			debugCL: function (consoleLog) { // ----- add debug console log -----
				//add console log to array
				if (!this.debug) {
					this.debug = [];
					this.debugLine = 1;
					this.debug.push(consoleLog);
				} else {
					if (this.debug.length < 50) {
						this.debug.push(consoleLog);
					} else {
						this.debug.splice(0, 1);
						this.debug.push(consoleLog);
					}
					this.debugLine++;
				}
				console.log(consoleLog);
			},

			debugEnable: function () {	// enable debug console
				//hold on screen for more than 2s then can enable debug
				if (ig.input.pressed('click')) {
					this.debugEnableTimer = new ig.Timer(2);
				}
				if (this.debugEnableTimer && this.debugEnableTimer.delta() < 0) {
					if (ig.input.released('click')) {
						this.debugEnableTimer = null;
					}
				} else if (this.debugEnableTimer && this.debugEnableTimer.delta() > 0) {
					this.debugEnableTimer = null;
					if (this.viewDebug) {
						this.viewDebug = false;
					} else {
						this.viewDebug = true;
					}
				}
			}

		});
		ig.babylonJSSupport = true;
		ig.domHandler = null;
		ig.domHandler = new ig.DomHandler();
		ig.domHandler.forcedDeviceDetection();
		ig.domHandler.forcedDeviceRotation();

		//API handler
		ig.apiHandler = new ig.ApiHandler();

		//Size handler has a dependency on the dom handler so it must be initialize after dom handler
		ig.sizeHandler = new ig.SizeHandler(ig.domHandler);

		//Added visibility handler
		ig.visibilityHandler = new ig.VisibilityHandler()

		//Added sound handler with the tag ig.soundHandler
		ig.soundHandler = null;
		ig.soundHandler = new ig.SoundHandler();

		ig.fontInfo = null;
		ig.fontInfo = new ig.FontInfo();

		//Setup the canvas
		var fps = 60;
		// wgl.webglmain('#webglcanvas', fps);
		ig.altBabylon.loadScene("media/scenes/", "game-scene.babylon", "#webglcanvas").onSceneLoaded.addOnce(ig.babylonSceneController.init.bind(ig.babylonSceneController));
		ig.main('#canvas', MyGame, fps, ig.sizeHandler.desktop.actualResolution.x, ig.sizeHandler.desktop.actualResolution.y, ig.sizeHandler.scale, ig.SplashLoader);
		ig.sizeHandler.reorient();
		this.DOMAINLOCK_BREAKOUT_ATTEMPT;
		this.END_OBFUSCATION;
	});