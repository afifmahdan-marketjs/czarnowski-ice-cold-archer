ig.module(
	'babylon.plugins.wgl-timer'
)
.requires(
)
.defines(function(){ "use strict";
    wgl.Timer = ig.Class.extend({    
    	target: 0,
    	base: 0,
    	last: 0,
    	pausedAt: 0,
	
    	init: function( seconds ) {
    		this.base = wgl.Timer.time;
    		this.last = wgl.Timer.time;
		
    		this.target = seconds || 0;
    	},
	
	
    	set: function( seconds ) {
    		this.target = seconds || 0;
    		this.base = wgl.Timer.time;
    		this.pausedAt = 0;
    	},
	
	
    	reset: function() {
    		this.base = wgl.Timer.time;
    		this.pausedAt = 0;
    	},
	
	
    	tick: function() {
    		var delta = wgl.Timer.time - this.last;
    		this.last = wgl.Timer.time;
    		return (this.pausedAt ? 0 : delta);
    	},
	
	
    	delta: function() {
    		return (this.pausedAt || wgl.Timer.time) - this.base - this.target;
    	},


    	pause: function() {
    		if( !this.pausedAt ) {
    			this.pausedAt = wgl.Timer.time;
    		}
    	},


    	unpause: function() {
    		if( this.pausedAt ) {
    			this.base += wgl.Timer.time - this.pausedAt;
    			this.pausedAt = 0;
    		}
    	}
    });

    wgl.Timer._last = 0;
    wgl.Timer.time = Number.MIN_VALUE;
    wgl.Timer.timeScale = 1;
    wgl.Timer.maxStep = 0.05;
    
    wgl.Timer.step = function() {
    	var current = Date.now();
    	var delta = (current - wgl.Timer._last) / 1000;
    	wgl.Timer.time += Math.min(delta, wgl.Timer.maxStep) * wgl.Timer.timeScale;
    	wgl.Timer._last = current;
    };
});
