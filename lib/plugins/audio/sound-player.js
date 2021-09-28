ig.module(
	'plugins.audio.sound-player'
)
.defines(function(){
	SoundPlayer = ig.Class.extend({
		
		tagName:"SoundPlayer",
		stayMuteFlag:false,
        debug:false,
		init: function(list,options) {
            if(this.debug)
            {
                console.log(this.tagName);
            }
		},
		play:function(id){
            if(this.debug)
            {
			    console.log("play sound ",id);
            }
		},
		stop:function(id){
            if(this.debug)
            {
			    console.log("stop sound ")
            }
		},
		
		volume:function(value){
            if(this.debug)
            {
			    console.log("set volume");
            }
		},
		mute:function(flagChange){
            if(this.debug)
            {
			    console.log("mute");
            }
            
            if(typeof(flagChange) === "undefined")
            {
                this.stayMuteFlag = true;
            }
            else
            {
                if(flagChange)
                {
                    this.stayMuteFlag=true;
                }
            }
		},
		unmute:function(flagChange){
            if(this.debug)
            {
			    console.log("unmute");
            }
            
            if(typeof(flagChange) === "undefined")
            {
                this.stayMuteFlag = false;
            }
            else
            {
                if(flagChange)
                {
                    this.stayMuteFlag=false;
                }
            }
		}
	
	});
});