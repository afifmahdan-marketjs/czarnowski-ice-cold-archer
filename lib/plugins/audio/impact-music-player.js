ig.module(
	'plugins.audio.impact-music-player'
)
.requires(
	'plugins.audio.sound-player'
)
.defines(function(){
	ImpactMusicPlayer = SoundPlayer.extend({
		tagName:"ImpactMusicPlayer",
		bgmPlaying:false,
		
		soundList:{
			
		},
		
		init: function(list,options) {
			this.parent(list,options);
			
			for(var soundName in list)
			{
				this.soundList[soundName] =  soundName;
				
				var string = list[soundName].path+ ".*";
				ig.music.add(string, soundName);
			}
			if(options)
			{
				if(options.loop)
				{
					ig.music.loop=options.loop;
				}
			}
		},
		
		play:function(id)
		{
			if(!this.stayMuteFlag)
			{
				this.bgmPlaying = true;
				if(typeof(id)==="undefined")
				{
					ig.music.play(id);
				}
				else
				{
					ig.music.play();
				}
			}
		},
		stop:function(id)
		{
			this.bgmPlaying = false;
			ig.music.pause();
		},
		
		volume:function(value)
		{
            var temp = value;
            console.log("impactmusic:",temp);
            if(temp < 0)
            {
                ig.music.volume=0;
                return;
            }
            
			if(isNaN(value))
			{
				ig.music.volume=1;
			}
			else if(value >1)
			{
				ig.music.volume=1;
			}
			else
			{
				ig.music.volume = value;
			}
		},
		getVolume:function()
		{
			return ig.music.volume;
		},
		
		mute:function(option)
		{
			this.parent(option);
			if(this.bgmPlaying)
			{
				this.stop();
			}
		},
		
		unmute:function(option)
		{
			this.parent(option);
			this.play();
		}
	
	});
});