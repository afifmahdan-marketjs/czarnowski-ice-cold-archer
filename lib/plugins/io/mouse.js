/*
* Game's gamepad, contains the bindings you wish
*/
ig.module(
	'plugins.io.mouse'
)
.requires(
	'plugins.data.vector'
)
.defines(function(){

	Mouse = ig.Class.extend({
		
		bindings:{
			click:[ig.KEY.MOUSE1]
		},
		pos:new BABYLON.Vector2.Zero(),
		
		init:function()
		{
			// Mouse
			ig.input.initMouse();
			for(var key in this.bindings)
			{
				this[key] = key;
				for(var i = 0;i<this.bindings[key].length;i++)
				{
					ig.input.bind(this.bindings[key][i],key);
				}
			}
		},
		getWglPos:function(){
			var widthCanvas=ig.sizeHandler.mobile.actualResolution.x;
			var heightCanvas=ig.sizeHandler.mobile.actualResolution.y;
			var widthWglCanvas=wgl.system.engine.getRenderWidth();
			var heightWglCanvas=wgl.system.engine.getRenderHeight();
			
			var ratioX = widthWglCanvas/widthCanvas;
			var ratioY = heightWglCanvas/heightCanvas;
			
			var posPointer = ig.game.io.getClickPos();
			
			if(ig.ua.mobile){
				var px = posPointer.x * ig.sizeHandler.sizeRatio.x;
				var py = posPointer.y * ig.sizeHandler.sizeRatio.y;
			}
			else
			{
				var px = posPointer.x*ratioX;
				var py = posPointer.y*ratioY;
			}
			return new BABYLON.Vector2(px,py);
		},
		getLast:function()
		{
			return this.pos;
		},
		getPos:function()
		{
			if(ig.ua.mobile)
			{
				
				var currentMousePosX = ig.input.mouse.x / ig.sizeHandler.scaleRatioMultiplier.x;
				var currentMousePosY = ig.input.mouse.y / ig.sizeHandler.scaleRatioMultiplier.y;
				//console.log(ig.sizeHandler.scaleRatioMultiplier.x)
				//console.log(ig.sizeHandler.scaleRatioMultiplier.y)
				//var currentMousePosX = ig.input.mouse.x;// * ig.sizeHandler.scaleRatioMultiplier.x;
				//var currentMousePosY = ig.input.mouse.y;// * ig.sizeHandler.scaleRatioMultiplier.y;
				this.pos = new BABYLON.Vector2(currentMousePosX,currentMousePosY);
				
				//console.log(ig.sizeHandler.scaleRatioMultiplier.x,ig.sizeHandler.scaleRatioMultiplier.y);
				return this.pos.clone();
			}
			else
			{
				var currentMousePosX = ig.input.mouse.x; // multiplierX;
				var currentMousePosY = ig.input.mouse.y; // multiplierY;
				
				this.pos = new BABYLON.Vector2(currentMousePosX,currentMousePosY);
				
				//console.log(ig.sizeHandler.scaleRatioMultiplier.x,ig.sizeHandler.scaleRatioMultiplier.y);
				return this.pos.clone();
			}
		},
	});
});