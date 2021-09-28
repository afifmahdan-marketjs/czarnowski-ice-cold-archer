ig.module(
	'plugins.io.multitouch-input'
)
.requires(
)
.defines(function(){

	ig.MultitouchInput = ig.Class.extend({
		
		isStart:false,
		
		
		touches:{
			  
		},
		
		pressed:[],
		state:[],
		released:[],
		
		multitouchCapable:false,
		lastEventUp:null,
		
		
		internalWidth:1,
		internalHeight:1,
		scaleX:1,
		scaleY:1,
		start:function(){
			
			if(this.isStart)
			{
				return;
			}
			this.isStart=true;
			
			if(navigator.maxTouchPoints && navigator.maxTouchPoints > 1)
			{
				//Hurray multitouch
				this.multitouchCapable=true;
			}
			
			//The multitouch in ImpactJS is very wonky 
			//but not the fault of ImpactJS but browser implementations
			if(ig.ua.touchDevice)
			{
				// Standard
				if(window.navigator.msPointerEnabled)
				{
					// MS pointer events
					ig.system.canvas.addEventListener('MSPointerDown', this.touchdown.bind(this), false );
					ig.system.canvas.addEventListener('MSPointerUp', this.touchup.bind(this), false );
					ig.system.canvas.addEventListener('MSPointerMove', this.touchmove.bind(this), false );
					
					ig.system.canvas.style.msContentZooming = "none";
					ig.system.canvas.style.msTouchAction = 'none';
				}
				
				// Standard
				ig.system.canvas.addEventListener('touchstart', this.touchdown.bind(this), false );
				ig.system.canvas.addEventListener('touchend', this.touchup.bind(this), false );
				ig.system.canvas.addEventListener('touchmove', this.touchmove.bind(this), false );
			}
		},
		
		touchdown: function( event ) {
			
			if(!ig.ua.touchDevice)
			{
				return;
			}
			
			this.updateSizeProperties();
			
			if(window.navigator.msPointerEnabled)
			{
				//Added for window multi touch detection in ie10 mobile
				this.windowKeyDown(event);
			}
			else
			{
				if(event.touches)
				{
					//console.log(this.touches.length);
					this.pollMultitouch(event.touches.length);
					
					this.updateSizeProperties();
					var pos = {left: 0, top: 0};
					if( ig.system.canvas.getBoundingClientRect ) {
						pos = ig.system.canvas.getBoundingClientRect();
					}
					//We need to check the state list in case of any duplicates and remove them from evaluation in to the press list
					var temp=[];
					for(var i=0;i<event.touches.length;i++)
					{
						temp.push(event.touches[i]);
					}
					
					this.spliceFromArray(temp, this.pressed);
					this.spliceFromArray(temp, this.state);
					this.spliceFromArray(temp, this.released);
					
					//Now the temp list should be clean and therefore we need to push into the press list
					for(var i=0;i<temp.length;i++)
					{
						
						var touch=temp[i];
						var touchX=(touch.clientX- pos.left)/this.scaleX;
						var touchY=(touch.clientY- pos.top)/this.scaleY;
						
						this.pressed.push({identifier:touch.identifier,x:touchX,y:touchY});
					}
				}
			}
		},
		
		touchmove: function( event ) {		
			
			if(!ig.ua.touchDevice) // Which means there is no mouse controls
			{
				return;
			}
			
			this.updateSizeProperties();
			if(window.navigator.msPointerEnabled)
			{
				//Added for window multi touch detection in ie10 mobile
				this.windowMove(event);
			}
			else
			{
				if(event.touches)
				{
					//console.log(this.touches.length);
					this.pollMultitouch(event.touches.length);
					//We only need to upgrade the press to state if any
					for(var j=0;j<event.touches.length;j++)
					{
						var touch=event.touches[j];
					
						this.upgrade(this.pressed,this.state,touch);
						this.updateArray(this.state,touch);
					
					}
				}
			}
			
			/* attempt to unlock WebAudio */
			try {
				ig.soundHandler.unlockWebAudio();
			} catch (error) {}
		},
		
		touchup: function( event ) {
			
			if(!ig.ua.touchDevice) // Which means there is no mouse controls
			{
				return;
			}
			
			this.updateSizeProperties();
			
			if(window.navigator.msPointerEnabled)
			{
				//Added for window multi touch detection in ie10 mobile
				this.windowKeyUp(event);
			}
			else
			{
				this.lastEventUp=event;
				
				if(event.touches)
				{
					for(var i=0;i<event.changedTouches.length;i++)
					{
						var touch = event.changedTouches[i];
						//console.log("id:"+touch.identifier);
						//A finger was released so we have to upgrade the touch from the state list into the release list
						
						this.upgrade(this.state,this.released,touch);
						this.upgrade(this.pressed,this.released,touch);
						
					}
				}
				
			}
			
			if (ig.visibilityHandler) {
				ig.visibilityHandler.onChange("focus");
			}
			
			/* attempt to unlock WebAudio */
			try {
				ig.soundHandler.unlockWebAudio();
			} catch (error) {}
		},
		
		windowKeyDown:function(event)
		{
			var pointerList = event.changedTouches ? event.changedTouches : [event];
			
			this.pollMultitouch(pointerList.length);
			this.updateSizeProperties();
			
			var temp=[];
			for(var i=0;i<pointerList.length;i++)
			{
				temp.push(pointerList[i]);
			}
			
			
			var pos = {left: 0, top: 0};
			if( ig.system.canvas.getBoundingClientRect ) {
				pos = ig.system.canvas.getBoundingClientRect();
			}
			
			this.spliceFromArray(temp, this.pressed);
			this.spliceFromArray(temp, this.state);
			this.spliceFromArray(temp, this.released);
			
			//We need to check the state list in case of any duplicates and remove them from evaluation in to the press list
			
			for(var i=0;i<temp.length;i++)
			{
				var pointerObj = pointerList[i];
				var pointerId = (typeof pointerObj.identifier != 'undefined') ? pointerObj.identifier : (typeof pointerObj.pointerId != 'undefined') ? pointerObj.pointerId : 1;
				
				
				var clientX = pointerObj.clientX;
				var clientY = pointerObj.clientY;
				var touchX=(pointerObj.clientX- pos.left)/this.scaleX;
				var touchY=(pointerObj.clientY- pos.top)/this.scaleY;
				
				this.pressed.push({identifier:pointerId,x:touchX,y:touchY});
			}
		},
	
		windowKeyUp:function(event)
		{
			this.lastEventUp=event;
			//console.log("id:"+touch.identifier);
			
			var pointerList = event.changedTouches ? event.changedTouches : [event];
			
			for(var i=0;i<pointerList.length;i++)
			{
				var tempTouch=pointerList[i];
				var pointerId = (typeof tempTouch.identifier != 'undefined') ? tempTouch.identifier : (typeof tempTouch.pointerId != 'undefined') ? tempTouch.pointerId : 1;
			
				var touch = {identifier:pointerId,clientX:tempTouch.clientX,clientY:tempTouch.clientY};
				
				//A finger was released so we have to upgrade the touch from the state list into the release list
				this.upgrade(this.state,this.released,touch);
				this.upgrade(this.pressed,this.released,touch);
				
			}
			
			if (ig.visibilityHandler) {
				ig.visibilityHandler.onChange("focus");
			}
			
			/* attempt to unlock WebAudio */
			try {
				ig.soundHandler.unlockWebAudio();
			} catch (error) {}
		},
		windowMove:function(event)
		{
			//console.log(this.touches.length);
			var pointerList = event.changedTouches ? event.changedTouches : [event];
			
			this.pollMultitouch(pointerList.length);
			//We only need to upgrade the press to state if any
			for(var j=0;j<pointerList.length;j++)
			{
				var tempTouch=pointerList[j];
				var touch = {identifier:tempTouch.pointerId,clientX:tempTouch.clientX,clientY:tempTouch.clientY};
				
				this.upgrade(this.pressed,this.state,touch);
				this.updateArray(this.state,touch);
			}
			
			/* attempt to unlock WebAudio */
			try {
				ig.soundHandler.unlockWebAudio();
			} catch (error) {}
		},
		
		clear:function()
		{
			for(var tindex = 0; tindex < this.released.length; ++tindex)
			{
				if(this.released[tindex])
				{
					this.released.splice(tindex,1);
					tindex--;
				}
			}
		},
		
		pollMultitouch:function(lengthTouches)
		{
			if(!this.multitouchCapable)
			{
				if(lengthTouches>1)
				{
					//alert("hurray multitouch");
					this.multitouchCapable=true;
				}
			}
		},
		
		spliceFromArray:function(arrayToSplice,arrayToCheckWith)
		{
			for(var i=0;i<arrayToCheckWith.length;i++)
			{
				for(var j=0;j<arrayToSplice.length;j++)
				{
					if(arrayToSplice[j].identifier === arrayToCheckWith[i].identifier)
					{
						arrayToSplice.splice(j,1);
						j--;
					}
				}
			}
		},
		
		updateSizeProperties:function()
		{
			var internalWidth = parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth;
			var internalHeight = parseInt(ig.system.canvas.offsetHeight) || ig.system.realHeight;
		
			this.scaleX = ig.system.scale * (internalWidth / ig.system.realWidth);
			this.scaleY = ig.system.scale * (internalHeight / ig.system.realHeight);
		},
		
		upgrade:function(arrayToCheck,arrayToUpgradeTo,touch)
		{
			var pos = {left: 0, top: 0};
			if( ig.system.canvas.getBoundingClientRect ) {
				pos = ig.system.canvas.getBoundingClientRect();
			}


			var touchX=(touch.clientX- pos.left)/this.scaleX;
			var touchY=(touch.clientY- pos.top)/this.scaleY;
			
			
			for(var iTouch=0;iTouch<arrayToCheck.length;iTouch++)
			{
				if(typeof(arrayToCheck[iTouch].identifier) !== undefined
					&& typeof(touch.identifier)  !== undefined
				  && touch.identifier === arrayToCheck[iTouch].identifier)
				{
					arrayToCheck.splice(iTouch,1);
					arrayToUpgradeTo.push({identifier:touch.identifier,x:touchX,y:touchY});
					iTouch--;
					break;
				}   
			}
		},
		
		updateArray:function(arrayToUpdate,touch)
		{
			var pos = {left: 0, top: 0};
			if( ig.system.canvas.getBoundingClientRect ) {
				pos = ig.system.canvas.getBoundingClientRect();
			}

			var touchX=(touch.clientX- pos.left)/this.scaleX;
			var touchY=(touch.clientY- pos.top)/this.scaleY;
			
			for(var iTouch=0;iTouch<arrayToUpdate.length;iTouch++)
			{
				if(typeof(arrayToUpdate[iTouch].identifier) !== undefined
					&& typeof(touch.identifier)  !== undefined
				  && touch.identifier === arrayToUpdate[iTouch].identifier)
				{
					
					arrayToUpdate[iTouch].x=touchX;
					arrayToUpdate[iTouch].y=touchY;
					break;
				}   
			}
		}
		
	});

});