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
		FORMATS:{
			OGG:".ogg",
			MP3:".mp3",
		},
        
		/**
		* Define your sounds here
		* 
        */
		sfx:{
			kittyopeningSound:{path:"media/audio/opening/kittyopening"}
			,staticSound:{path:"media/audio/play/static"}
			,openingSound:{path:"media/audio/opening/opening"}
		},
		
        /**
        * Define your BGM here
        */
		bgm:{
			background:{path:'media/audio/bgm',startOgg:0,endOgg:21.463,startMp3:0,endMp3:21.463}
		}
        
		
    });

});
