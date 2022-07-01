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
				bowDraw: { path: "media/audio/bow-draw" },
				bowRelease: { path: "media/audio/bow-release" },
				crowdApplause: { path: "media/audio/crowd-applause" },
				crowdCheers: { path: "media/audio/crowd-cheers" },
				crowdMiss: { path: "media/audio/crowd-miss" },
				flight: { path: "media/audio/flight" },
				hit: { path: "media/audio/hit" },
				scoreHigh: { path: "media/audio/score-high" },
				scoreLow: { path: "media/audio/score-low" },
				scoreMiss: { path: "media/audio/score-miss" },

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
