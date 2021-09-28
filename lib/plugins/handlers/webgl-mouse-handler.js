ig.module(
	'plugins.handlers.webgl-mouse-handler'
)
.requires(
)
.defines(function(){
	ig.WebglMouseHandler = ig.Class.extend({
        camera:null,
        angularSensibility:2000,
        init:function(camera)
        {
            this.camera=camera;
        },
        
        update:function()
        {
            if(ig.input.pressed("click"))
            {
                ig.game.io.getClickPos();
            }

            if(ig.input.state("click"))
            {
                var lastmousepos = ig.game.io.getLastClickPos();
                var mousepos=ig.game.io.getClickPos();
                var offsetX=mousepos.x-lastmousepos.x,
                    offsetY=mousepos.y-lastmousepos.y;
                this.camera.cameraRotation.y += offsetX/this.angularSensibility;
                this.camera.cameraRotation.x += offsetY/this.angularSensibility;
            }
        },
        
        draw:function()
        {
        }
	});	
});

