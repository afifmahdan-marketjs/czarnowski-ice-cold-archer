ig.module(
    'plugins.audio.jukebox-player'
)
.requires(
    'plugins.audio.sound-player'
)
.defines(function(){
    JukeboxPlayer = SoundPlayer.extend({
        tagName:"JukeboxPlayer",
        bgmPlaying:false,

        soundList:{

        },
        jukeboxPlayer:null,
        pausePosition:0,
        premuteVolume:0,

        minVolume:0.001,


        init: function(list,options) {
            this.parent(list,options);

            for(var soundName in list)
            {
                this.soundList[soundName] = soundName;

                var string = list[soundName].path + ".*";

                var soundPath = list[soundName].path;
                var pathOgg = soundPath+"."+ig.Sound.FORMAT.OGG.ext;
                var pathMp3 = soundPath+"."+ig.Sound.FORMAT.MP3.ext;

                var loop=false;
                if(options)
                {
                    if(options.loop)
                    {
                        loop=options.loop;
                    }
                }
                //console.log(loop);
                this.jukeboxPlayer = new jukebox.Player({
                                    resources: [
                                        pathOgg,pathMp3
                                    ],

                                    autoplay: false, //'music',
                                    spritemap: {
                                        music: {
                                            start:list[soundName].startMp3,
                                            end: list[soundName].endMp3,
                                            loop:true
                                        }
                                        // add more audio bytes here
                                    }
               });
            }
        },

        play:function(id)
        {
            if(!this.stayMuteFlag)
            {
                this.bgmPlaying = true;


                if(this.pausePosition)
                {
                    console.log("resume")
                    this.jukeboxPlayer.resume(this.pausePosition);
                }
                else
                {
                    console.log("play")
                    this.jukeboxPlayer.play(this.jukeboxPlayer.settings.spritemap.music.start,true);
                }
                this.premuteVolume = this.getVolume();
            }
        },
        stop:function(id)
        {
            this.bgmPlaying = false;
            this.pausePosition = this.jukeboxPlayer.pause();
        },

        volume:function(value)
        {
            var temp = value;
            console.log("jukebox:",temp);
            if(temp <= 0)
            {
                this.jukeboxPlayer.setVolume(this.minVolume);
                return;
            }

            if(isNaN(value))
            {
                this.jukeboxPlayer.setVolume(1);
            }
            else if(value >1)
            {
                this.jukeboxPlayer.setVolume(1);
            }
            else
            {
                this.jukeboxPlayer.setVolume(value);
            }
        },

        getVolume:function()
        {
            return this.jukeboxPlayer.getVolume();
        },

        mute:function(option)
        {
            this.parent(option);
            if(this.bgmPlaying)
            {
                console.log("jukebox",this.premuteVolume);

                if(!this.stayMuteFlag)
                {
                    this.premuteVolume = this.getVolume();
                }

                this.jukeboxPlayer.pause();

                this.jukeboxPlayer.setVolume(this.minVolume);
            }
        },

        unmute:function(option)
        {
            this.parent(option);
            if(!this.stayMuteFlag)
            {
                console.log("jukebox",this.premuteVolume);
                this.jukeboxPlayer.setVolume(this.premuteVolume);

                this.jukeboxPlayer.resume();

            }

        }

    });
});
