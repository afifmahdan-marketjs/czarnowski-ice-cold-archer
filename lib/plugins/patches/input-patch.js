/**
* Edited by Justin Ng to be fixed with ig.Input.inject and IFRAME detection
* ver 1.1
* ver 1.2 Attempt to unlock WebAudio
*/


ig.module(
    "plugins.patches.input-patch"
).requires(
    "impact.input"
).defines(function () {
    
    //inject
    ig.Input.inject({
        move:new BABYLON.Vector2(0,0),
    	initMouse: function() {
    		if( this.isUsingMouse ) { return; }
    		this.isUsingMouse = true;
    		var mouseWheelBound = this.mousewheel.bind(this);
    		ig.system.canvas.addEventListener('mousewheel', mouseWheelBound, false );
    		ig.system.canvas.addEventListener('DOMMouseScroll', mouseWheelBound, false );
            
    		ig.system.canvas.addEventListener('contextmenu', this.contextmenu.bind(this), false );
    		ig.system.canvas.addEventListener('mousedown', this.keydown.bind(this), false );
    		ig.system.canvas.addEventListener('mouseup', this.keyup.bind(this), false );
    		ig.system.canvas.addEventListener('mousemove', this.mousemove.bind(this), false );
		
    		if( ig.ua.touchDevice ) {
    			// Standard
    			ig.system.canvas.addEventListener('touchstart', this.keydown.bind(this), false );
    			ig.system.canvas.addEventListener('touchend', this.keyup.bind(this), false );
    			ig.system.canvas.addEventListener('touchmove', this.mousemove.bind(this), false );
			
    			// MS
    			ig.system.canvas.addEventListener('MSPointerDown', this.keydown.bind(this), false );
    			ig.system.canvas.addEventListener('MSPointerUp', this.keyup.bind(this), false );
    			ig.system.canvas.addEventListener('MSPointerMove', this.mousemove.bind(this), false );
    			ig.system.canvas.style.msTouchAction = 'none';
    		}
    	},
        
        mousemove:function(event)
        {
    		//var internalWidth = parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth;

    		var internalWidth = parseInt(wgl.system.canvas.offsetWidth);
    		var internalHeight = parseInt(wgl.system.canvas.offsetHeight);
    		if(ig.ua.mobile)
    		{
    			internalWidth=ig.system.realWidth;
    		}
		
    		var scale = ig.system.scale * (internalWidth / ig.system.realWidth);
		
    		//alert(internalWidth +">" + ig.system.realWidth+">"+window.screen.width);
    		var pos = {left: 0, top: 0};
    		if( ig.system.canvas.getBoundingClientRect ) {
    			pos = ig.system.canvas.getBoundingClientRect();
    		}
		
    		var ev = event.touches ? event.touches[0] : event;
    		this.mouse.x = (ev.clientX - pos.left) / scale;
    		this.mouse.y = (ev.clientY - pos.top) / scale;
        
            if(typeof(event.movementX) !== undefined)
            {
                this.move.x=event.movementX;
                this.move.y=event.movementY;
            }
            else
            {
                this.move.x=0;
                this.move.y=0;
            }
            //console.log(this.move.x,this.move.y);
            
            /* attempt to unlock WebAudio */
            try {
                ig.soundHandler.unlockWebAudio();
            } catch (error) {}
        },
        
    	keyup: function( event ) {
    		var tag = event.target.tagName;
    		if( tag == 'INPUT' || tag == 'TEXTAREA' ) { return; }
		
    		var code = event.type == 'keyup' 
    			? event.keyCode 
    			: (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);
		
    		var action = this.bindings[code];
    		if( action ) {
    			this.delayedKeyup[action] = true;
    			event.stopPropagation();
    			event.preventDefault();
    		}
			
			if (ig.visibilityHandler) {
				ig.visibilityHandler.onChange("focus");
			}
			
			/* attempt to unlock WebAudio */
			try {
				ig.soundHandler.unlockWebAudio();
			} catch (error) {}
		}
    })
});
