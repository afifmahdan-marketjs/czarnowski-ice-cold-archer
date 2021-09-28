/**
 *  OpeningKitty
 *
 *  Created by Ram Wu Hon Chi on 2013-12-31.
 *  Copyright (c) 2013 __MyCompanyName__. All rights reserved.
 */

ig.module('game.entities.opening-kitty')
.requires(
    'impact.entity'
)
.defines(function () {

    EntityOpeningKitty = ig.Entity.extend({
        size: { x: 48, y: 48 },
		kittyAnim: -1,
		kittyImage: new ig.Image('media/graphics/opening/kitty.png'),
		kittyTitleImage: new ig.Image('media/graphics/opening/kittytitle.png'),
        soundKey:"kittyopeningSound",
        init: function (x, y, settings) {
            this.parent(x, y, settings);
     	},

		ready: function(){
			if(!ig.wm){
				if(!_SETTINGS['DeveloperBranding']['Splash']['Enabled']){
					ig.game.director.nextLevel();
					ig.system.context.globalAlpha = 1 ;
					this.kill();
				}else{			
					//after 0.1s start animation
					this.initTimer = new ig.Timer(0.1);
				}  				
			}	
		},

		update: function(){
			this.parent();
			this.updateKittyOpening();
			this.unlockWebAudio();
		},
		
		unlockWebAudio: function() {
			if (ig.input.released('click')) {
				/* attempt to unlock WebAudio */
				try {
					ig.soundHandler.unlockWebAudio();
				} catch (error) {}
			}
		},

		draw: function(){
			this.parent();
			//dont draw in weltmeister
			if(!ig.global.wm){

				//control the openeing fade out
				if(this.nextLevelTimer){
					if(this.nextLevelTimer.delta() < 0){
						ig.system.context.globalAlpha = -this.nextLevelTimer.delta() ;
					}
				}
				
				this.drawKittyOpening();
			}
		},

		updateKittyOpening: function(){
			//start kitty timer
			if(this.initTimer && this.initTimer.delta() > 0){
				this.initTimer = null ;
				try{
					ig.soundHandler.sfxPlayer.play(this.soundKey);
				}catch(e){console.log(e);}					
				this.kittyTimer = new ig.Timer(0.15);
			}

			if(this.kittyTimer && this.kittyTimer.delta() > 0){
				if(this.kittyAnim < 7){
					this.kittyAnim++ ;
					this.kittyTimer.reset();
				}else{
					this.kittyTimer = null;
					this.nextLevelTimer = new ig.Timer(2);
				}
			}

			//controlling the dim animation
			if(this.nextLevelTimer && this.nextLevelTimer.delta() > 0){
				this.nextLevelTimer = null ;
				ig.game.director.nextLevel();
				ig.system.context.globalAlpha = 1 ;
			}	
		},

		drawKittyOpening: function(){
			// Create gradient
			var grd = ig.system.context.createLinearGradient(0,0,0,ig.system.height);
			grd.addColorStop(0,"#ffed94");
			grd.addColorStop(1,"#ffcd85");
			ig.system.context.fillStyle = grd ;
			ig.system.context.fillRect(0,0,ig.system.width,ig.system.height);

			if(this.kittyAnim >= 0) {
				this.kittyImage.drawTile((ig.system.width>>>1) - (this.kittyImage.width>>>3),(ig.system.height>>>1) - (this.kittyImage.height>>>2),this.kittyAnim,218,325);
				this.kittyTitleImage.drawTile((ig.system.width>>>1) - (this.kittyTitleImage.width>>>1),(ig.system.height>>>1) + (this.kittyImage.height>>>2) + 10,this.kittyAnim,380,37);
			}
			ig.system.context.globalAlpha = 1 ;	
		},

    });

});