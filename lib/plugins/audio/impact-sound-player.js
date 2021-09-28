ig.module(
	'plugins.audio.impact-sound-player'
)
.requires(
	'plugins.audio.sound-player'
)
.defines(function(){
	ImpactSoundPlayer = SoundPlayer.extend({
		tagName:"ImpactSoundPlayer",
		
		soundList:{
			
		},
		
		init: function(list,options) {
			this.parent(list,options);
			
			for(var soundName in list)
			{
				var soundPath = list[soundName].path;
				var pathOgg = soundPath+ig.Sound.FORMAT.OGG.ext;
				var pathMp3 = soundPath+ig.Sound.FORMAT.MP3.ext;
				
				var string = soundPath + ".*";
				var sound = new ig.Sound(string);
				this.soundList[soundName]=sound;
			}
			
		},
		
		play:function(id)
		{
			if(!this.stayMuteFlag)
			{
				if(typeof(id) === "object")
				{
					console.log(id+" exists")
					id.play();
				}
				else if(typeof(id)==="string")
				{
					this.soundList[id].play();
				}
			}
		},
		stop:function(id)
		{
			this.parent(id);
			id.stop();
		},
		
		volume:function(value)
		{
            var temp = value;
            
            if(temp < 0)
            {
                ig.soundManager.volume=0;
                return;
            }
            
			//this.parent(value);
			if(isNaN(value))
			{
				ig.soundManager.volume = 1;
			}
			else if(value >1)
			{
				ig.soundManager.volume = 1;
			}
			else
			{
				ig.soundManager.volume = value;
			}
			
		},
		getVolume:function()
		{
			return ig.soundManager.volume;
		},
		mute:function(option){
			this.parent(option);
			ig.Sound.enabled = false;
		},
		unmute:function(option){
			this.parent(option);
			ig.Sound.enabled = true;
		}
	
	});
});