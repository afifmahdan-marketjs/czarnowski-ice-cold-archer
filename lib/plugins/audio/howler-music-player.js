ig.module(
	'plugins.audio.howler-music-player'
)
.requires(
	'plugins.audio.sound-player'
)
.defines(function(){
	HowlerMusicPlayer = SoundPlayer.extend({
		tagName:"HowlerMusicPlayer",
		bgmPlaying:false,
		
		soundList:{
			
		},
		
		init: function(list,options) {
			this.parent(list,options);
			
			for(var soundName in list)
			{
				var soundPath = list[soundName].path;
				var pathOgg = soundPath+"."+ig.Sound.FORMAT.OGG.ext;
				var pathMp3 = soundPath+"."+ig.Sound.FORMAT.MP3.ext;
				
				var sound = new Howl({src:[pathOgg,pathMp3]
                                ,loop:true
                                ,autoplay:false
                                ,onend: function() {
                                    
                                    //this.bgmPlaying=false;
                                    //this.play();
                                }.bind(this)});
				this.soundList[soundName]=sound;
			}
		},
		
		play:function(id)
		{
            //console.log(this.bgmPlaying);
			if(!this.stayMuteFlag)
			{
                if(this.bgmPlaying)
                {
                    return;
                }
				//console.log(typeof(id));
				if(typeof(id) === "object")
				{
					//console.log(id+" exists")
                    this.bgmPlaying = true;
					id.play();
				}
				else if(typeof(id) === "string")
				{
                    this.bgmPlaying = true;
					this.soundList[id].play();
				}
                else
                {
                    for(var key in this.soundList)
                    {
                        this.soundList[key].play();
                        this.bgmPlaying = true;
                        return;
                    }
                }
                
			}
		},
		stop:function(id)
		{
            this.parent(id);
            if(!this.bgmPlaying)
            {
                return;
            }
            for(var key in this.soundList)
            {
                this.soundList[key].stop();
            }
            this.bgmPlaying = false;
		},
		
		volume:function(value)
		{
            var temp = value;
            //console.log("howler",value);
            
            for(var sound in this.soundList)
            {
                if(temp < 0)
                {
                    this.soundList[sound].volume(0);
                    //Howler.volume(0);
                    return;
                }
            
    			//this.parent(value);
    			if(isNaN(value))
    			{
                    this.soundList[sound].volume(1);
    				//Howler.volume(1);
    			}
    			else if(value >1)
    			{
                    this.soundList[sound].volume(1);
    				//Howler.volume(1);
    			}
    			else
    			{
                    this.soundList[sound].volume(value);
    				//Howler.volume(value);
    			}
            }
		},
		getVolume:function()
		{
            for(var sound in this.soundList)
            {
                return this.soundList[sound].volume();
            }
			//return Howler.volume();
		},
		
		mute:function(option){
			this.parent(option);
			Howler.mute(true);
		},
		unmute:function(option){
			this.parent(option);
			Howler.mute(false);
		}
	
	});
});