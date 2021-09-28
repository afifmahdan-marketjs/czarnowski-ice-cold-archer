ig.module(
	'plugins.audio.howler-player'
)
.requires(
	'plugins.audio.sound-player'
)
.defines(function(){
	HowlerPlayer = SoundPlayer.extend({
		tagName:"HowlerPlayer",
		
		soundList:{
			
		},
		
		init: function(list,options) {
			this.parent(list,options);
			
			for(var soundName in list)
			{
				var soundPath = list[soundName].path;
				var pathOgg = soundPath+"."+ig.Sound.FORMAT.OGG.ext;
				var pathMp3 = soundPath+"."+ig.Sound.FORMAT.MP3.ext;
				
				var sound = new Howl({src:[pathOgg,pathMp3]});
				this.soundList[soundName]=sound;
			}
			
		},
		
		play:function(id)
		{
			/* attempt to resume context */
			if(Howler.ctx && Howler.ctx.state !== "running") {
				return Howler.ctx.resume(); 
			}
			
			if(!this.stayMuteFlag)
			{
				//console.log(typeof(id));
				if(typeof(id) === "object")
				{
					//console.log(id+" exists")
					id.play();
				}
				else if(typeof(id) === "string")
				{
					this.soundList[id].play();
				}
			}
		},
		stop:function(id)
		{
			this.parent(id);
			if(typeof(id) === "object")
			{
				//console.log(id+" exists")
				id.stop();
			}
			else if(typeof(id) === "string")
			{
				this.soundList[id].stop();
			}
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