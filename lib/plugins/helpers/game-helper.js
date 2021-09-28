/**
 *  Game Helper
 *  Created by Justin Ng on 2015-03-05.
 *  Copyright (c) 2015 MarketJS. All rights reserved.
 */
ig.module('plugins.helpers.game-helper')
.requires(
)
.defines(function () {
    ig.GameHelper = function(){
        this.basePosXMax=240;
        this.basePosXMin=70;
        this.volume={
            keys:{
                sound:"CurvyRoadSoundMJS",
                music:"CurvyRoadMusicMJS"
            },
            sound:0,
            music:0
        };
        
    	this.TRANSITION_LEVELS={
            GAME:LevelGame,
            TITLE:LevelTitle
        };
        this.TRANSITION_KEYS={
            GAME:"GAME",
            TITLE:"TITLE"
        };
        this.CONTROLLER_KEYS={
            GAME:"GameControl",
            TRANSITION:"TransitionControl",
            TITLE:"TitleControl"
        };
        
    	this.transitionLevel=this.TRANSITION_LEVELS.GAME;
        
        this.currentController=null;
    };
    ig.GameHelper.prototype = {
        
        
        saveVolume:function(){
            ig.game.save(this.volume.keys.sound,Math.floor(this.volume.sound));
            ig.game.save(this.volume.keys.music,Math.floor(this.volume.music));
        },
        loadGlovesUnlocked:function(){
            for(var i=1;i<this.gloveUnlocked.length;i++){
                var tempVal = ig.game.load(this.glovePrefix+(i+1));
                this.gloveUnlocked[i]=tempVal;
            }
        },
        loadVolume:function(){
            var soundTemp = ig.game.load(this.volume.keys.sound);
            
            if(typeof(soundTemp) !="number"){
                this.volume.sound=1;
            }else{
                this.volume.sound=soundTemp/100;
            }

            var musicTemp = ig.game.load(this.volume.keys.music);
            if(typeof(musicTemp) !="number"){
                this.volume.music=1;
            }else{
                this.volume.music=musicTemp/100;
            }
            
            var soundCheck = this.volume.sound;
            var musicCheck = this.volume.music;
            ig.soundHandler.sfxPlayer.volume(soundCheck);
            ig.soundHandler.bgmPlayer.volume(musicCheck);
            return {sfx:soundCheck,bgm:musicCheck};
        },
        setController:function(control){
            this.currentController=control;
        },
        setTransitionTarget:function(key){
            if(this.TRANSITION_LEVELS[key]){
                this.transitionLevel=this.TRANSITION_LEVELS[key];
                this.transitionTarget=key;
            }else{
                throw "No level transition found";
            }
        },
        changeState:function(entity,stateList,stateChangeTo){
            var statesAvailableStr ="";

            if(typeof(entity[stateList.key]) != "number"){
                throw "#Error: Control[stateKey] passed here is not a number";
            }

            if(typeof(stateChangeTo) == "string"){
                var keyCheck = stateChangeTo;
                if(stateList[keyCheck]){
                    entity[stateList.key]=stateList[keyCheck];
                    return entity[stateList.key];
                }
                
            }else{
                var valueCheck = stateChangeTo;
                if(valueCheck < stateList.size ){
                    entity[stateList.key]=valueCheck;
                    return entity[stateList.key];
                }
            }
            // If it reaches here there is definitely an error with the states
            // available
            for(var key in stateList){
                statesAvailableStr+= key +",";
            }
            throw "#Error:Unable to find state "+stateChangeTo+" in ["+statesAvailableStr+"]"; 
        },
    };
});
