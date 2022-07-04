/**
 *  SoundHandler
 *
 *  Created by Justin Ng on 2014-08-19.
 *  Copyright (c) 2014 __MyCompanyName__. All rights reserved.
 */

ig.module('plugins.audio.sound-info')
	.requires(
)
	.defines(function () {

		SoundInfo = ig.Class.extend({
			FORMATS: {
				OGG: ".ogg",
				MP3: ".mp3",
			},

			/**
			* Define your sounds here
			* 
			*/
			sfx: {
				staticSound: { path: "media/audio/play/static" },
				logosplash1: { path: "media/audio/opening/logosplash1" },
				logosplash2: { path: "media/audio/opening/logosplash2" },

				bgmMainMenu: { path: "media/audio/bgm-mainmenu" },
				crowdApplause: { path: "media/audio/crowd-applause" },
				crowdCheers: { path: "media/audio/crowd-cheers" },
				crowdMiss: { path: "media/audio/crowd-miss" },
				flight: { path: "media/audio/flight" },

				scoreHigh: { path: "media/audio/score-high" },
				scoreLow: { path: "media/audio/score-low" },
				scoreMiss: { path: "media/audio/score-miss" },

				arrowLand1: { path: "media/audio/arrow-land-1" },
				arrowLand2: { path: "media/audio/arrow-land-2" },
				arrowLand3: { path: "media/audio/arrow-land-3" },
				arrowLand4: { path: "media/audio/arrow-land-4" },
				arrowLand5: { path: "media/audio/arrow-land-5" },
				bowDraw1: { path: "media/audio/bow-draw-1" },
				bowDraw2: { path: "media/audio/bow-draw-2" },
				bowDraw3: { path: "media/audio/bow-draw-3" },
				bowDraw4: { path: "media/audio/bow-draw-4" },
				bowDraw5: { path: "media/audio/bow-draw-5" },
				bowRelease1: { path: "media/audio/bow-release-1" },
				bowRelease2: { path: "media/audio/bow-release-2" },
				bowRelease3: { path: "media/audio/bow-release-3" },
				bowRelease4: { path: "media/audio/bow-release-4" },
				bowRelease5: { path: "media/audio/bow-release-5" },

				click: { path: "media/audio/click" },
			},

			/**
			* Define your BGM here
			*/
			bgm: {
				background: { path: 'media/audio/bgm' }
			}


		});

	});
