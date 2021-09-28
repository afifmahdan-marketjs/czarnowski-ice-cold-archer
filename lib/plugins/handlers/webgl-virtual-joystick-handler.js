ig.module(
	'plugins.handlers.webgl-virtual-joystick-handler'
)
.requires(
    'plugins.io.virtual-joystick'
)
.defines(function(){
	ig.WebglVirtualJoystickHandler = ig.Class.extend({
        
        
        /**
        * Left joystick will control looking around
        */
        leftJoystick:null,
        
        /**
        * Right joystick will control moving around
        */
        rightJoystick:null,
        
        camera:null,
        init:function(camera)
        {   
            this.camera=camera;
            this.setupLeftJoystick();
            this.setupRightJoystick();
        },
        
        setupLeftJoystick:function()
        {
            this.leftJoystick = new VirtualJoystick(this.camera);
            this.leftJoystick.color="yellow";
            this.leftJoystick.axisTarget.updown=this.leftJoystick.axis.z;
            this.leftJoystick.axisTarget.leftright=this.leftJoystick.axis.x;
            this.leftJoystick.setSensibility(0.15);
            
            this.leftJoystick.action = function()
            {
                var camera = this.camera;
                var speed = camera._computeLocalCameraSpeed() * 50;
                var cameraTransform = BABYLON.Matrix.RotationYawPitchRoll(camera.rotation.y, camera.rotation.x, 0);
                var deltaTransform = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(this.deltaPos.x * speed, this.deltaPos.y * speed, this.deltaPos.z * speed), cameraTransform);
                camera.cameraDirection = camera.cameraDirection.add(deltaTransform);
                
                if (!this.pressed) {
                    this.deltaPos = this.deltaPos.scale(0.9);
                }
            }.bind(this.leftJoystick)
        },
        setupRightJoystick:function()
        {
            this.rightJoystick = new VirtualJoystick(this.camera);
            this.rightJoystick.color="cyan";
            this.rightJoystick.axisTarget.updown=this.rightJoystick.axis.x;
            this.rightJoystick.axisTarget.leftright=this.rightJoystick.axis.y;
            this.rightJoystick.reverseDirections[0] = true;
            this.rightJoystick.setSensibility(0.05);
            
            this.rightJoystick.action =function()
            {
                var camera=this.camera;
                camera.cameraRotation = camera.cameraRotation.addVector3(this.deltaPos);
                if (!this.pressed) {
                    this.deltaPos = this.deltaPos.scale(0.9);
                }
                /*
                if (!this._leftjoystick.pressed) {
                    this._leftjoystick.deltaPosition = this._leftjoystick.deltaPosition.scale(0.9);
                }
                if (!this._rightjoystick.pressed) {
                    this._rightjoystick.deltaPosition = this._rightjoystick.deltaPosition.scale(0.9);
                }
                */
                
            }.bind(this.rightJoystick)
        },
        
        
        update:function()
        {
            this.resolveLeftRight(ig.multitouchInput.pressed,
                                this.leftJoystick.initialPos.bind(this.leftJoystick),
                                this.rightJoystick.initialPos.bind(this.rightJoystick));
                                
            this.resolveLeftRight(ig.multitouchInput.state,
                                this.leftJoystick.updatePos.bind(this.leftJoystick),
                                this.rightJoystick.updatePos.bind(this.rightJoystick));
                                
            this.resolveLeftRight(ig.multitouchInput.released,
                                this.leftJoystick.release.bind(this.leftJoystick),
                                this.rightJoystick.release.bind(this.rightJoystick));
                                
            var releasedLength = ig.multitouchInput.released.length;
            var stateLength = ig.multitouchInput.state.length;
            var pressedLength = ig.multitouchInput.pressed.length;
            var sum = releasedLength+stateLength+pressedLength;

            if(sum<=0)
            {
                this.leftJoystick.release(null,true);
                this.rightJoystick.release(null,true);
            }
            else if(releasedLength>0)
            {
                for(var i=0;i<ig.multitouchInput.released.length;i++)
                {
                    var touch = ig.multitouchInput.released[i];
                    this.leftJoystick.release(touch);
                    this.rightJoystick.release(touch);
                }
            }
        },
        
        resolveLeftRight:function(array,callbackLeft,callbackRight)
        {
            for(var i=0;i<array.length;i++)
            {
                var touch =array[i];
                
                if(touch.x > (ig.system.width>>>1))
                {
                    callbackRight(touch);
                }
                else
                {
                    callbackLeft(touch);
                }
            }
        },
        
        
        draw:function()
        {
            var ctx = ig.system.context;
            this.leftJoystick.draw();
            this.rightJoystick.draw();
            
            if(wgl.debug.debug)
            {
                this.leftJoystick.debugText(20,100);
                var text = ig.multitouchInput.pressed.length+";"+ig.multitouchInput.state.length+";"+ig.multitouchInput.released.length;
                ctx.fillText(text,20,200);
            
                for(var i=0;i<ig.multitouchInput.pressed.length;i++)
                {
                    var x=ig.multitouchInput.pressed[i].x,
                        y=ig.multitouchInput.pressed[i].y,
                        identifier=ig.multitouchInput.pressed[i].identifier;
                    ctx.fillText(identifier+";"+x+";"+y,20,250+i*50);
                }
                for(var i=0;i<ig.multitouchInput.state.length;i++)
                {
                    var x=ig.multitouchInput.state[i].x,
                    y=ig.multitouchInput.state[i].y,
                    identifier=ig.multitouchInput.state[i].identifier;
                    ctx.fillText(identifier+";"+x+";"+y,100,250+i*50);
                }
                for(var i=0;i<ig.multitouchInput.released.length;i++)
                {
                    var x=ig.multitouchInput.released[i].x,
                        y=ig.multitouchInput.released[i].y,
                        identifier=ig.multitouchInput.released[i].identifier;
                
                    //console.log(ig.multitouchInput.pressed[i]);
                    ctx.fillText(identifier+";"+x+";"+y,180,250+i*50);
                }
            }
        }
	});	
});