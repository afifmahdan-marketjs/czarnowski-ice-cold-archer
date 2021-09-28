/*
* Game's gamepad, contains the bindings you wish
*/
ig.module(
	'plugins.io.virtual-joystick'
)
.requires(
)
.defines(function(){

	VirtualJoystick= ig.Class.extend({
        
        pos:new BABYLON.Vector2(0,0),
        start:new BABYLON.Vector2(0,0),
        last:new BABYLON.Vector2(0,0),
        deltaPos:new BABYLON.Vector3(0,0,0),
        deltaVector:new BABYLON.Vector2(0,0),
        
		axis:{
            x:0,
            y:1,
            z:2,  
		},
        
        //Reverse direction updown, leftright
        reverseDirections:[false,false],
        rotationspeed:25,
        inverseRotationspeed:25,
        sensibility:25,
        inversedSensibility:25,
        deltaPosition: new BABYLON.Vector3.Zero(),
        touches:[],
        rotateOnAxisRelativeToMesh:false,
        pressed:false,
        
        color:"cyan",
        pointerID:-1,
        
        axisTarget:{
            leftright:0,
            updown:1
        },
        identifier:null,

        drawVirtualStick:false,
        camera:null,
        pressed:false,
        
		init:function(camera)
		{
            this.camera=camera;
            this.deltaPos=new BABYLON.Vector3.Zero();
            
			this.inversedSensibility=1/(this.sensibility/1000);
            this.inverseRotationspeed=1/(this.rotationspeed/1000);
            this.axisTarget.leftright = this.axis.x;
            this.axisTarget.updown = this.axis.y;
            this.rotateOnAxisRelativeToMesh=false;
		},
        
        initialPos:function(touch)
        {
            if(this.identifier !== null)
            {
                if(this.identifier===touch.identifier)
                {
                    this.drawVirtualStick=true;
                    //console.log("initialpos1")
                    this.start = new BABYLON.Vector2(touch.x+0,touch.y+0);
                    this.pos=this.start.clone();
                    this.last=this.start.clone();
                    this.deltaVector.x=0;
                    this.deltaVector.y=0;
                    this.pressed=true;
                }
            }
            else
            {
                this.drawVirtualStick=true;
                this.identifier=touch.identifier;
                this.start = new BABYLON.Vector2(touch.x+0,touch.y+0);
                this.pos=this.start.clone();
                this.last=this.start.clone();
                this.deltaVector.x=0;
                this.deltaVector.y=0;
                this.pressed=true;
            }
        },
        
        updatePos:function(touch)
        {
            // If the current pointer is the one associated to the joystick (first touch contact)
            if(touch.identifier === this.identifier)
            {   
                this.pos.x=touch.x;
                this.pos.y=touch.y;
                this.deltaVector=this.pos.clone();
                
                this.deltaVector = this.deltaVector.subtract(this.start);
            
                var directionLeftRight = this.reverseDirections[1] ? -1 : 1;
                var deltaJoystickX = directionLeftRight * this.deltaVector.x / this.inversedSensibility;
            
                switch (this.axisTarget.leftright) {
                    case this.axis.x:
                        this.deltaPos.x = Math.min(1, Math.max(-1, deltaJoystickX));
                        break;
                    case this.axis.y:
                        this.deltaPos.y = Math.min(1, Math.max(-1, deltaJoystickX));
                        break;
                    case this.axis.z:
                        this.deltaPos.z = Math.min(1, Math.max(-1, deltaJoystickX));
                        break;
                }
                
                var directionUpDown = this.reverseDirections[0] ? 1 : -1;
                var deltaJoystickY = directionUpDown * this.deltaVector.y / this.inversedSensibility;
                switch (this.axisTarget.updown) {
                    case this.axis.x:
                        this.deltaPos.x = Math.min(1, Math.max(-1, deltaJoystickY));
                        break;
                    case this.axis.y:
                        this.deltaPos.y = Math.min(1, Math.max(-1, deltaJoystickY));
                        break;
                    case this.axis.z:
                        this.deltaPos.z = Math.min(1, Math.max(-1, deltaJoystickY));
                        break;
                }
            }


            this.action();
        },
        
        release:function(touch,force)
        {
            if(typeof(force) !== "undefined")
            {
                if(force)
                {   
                    this.drawVirtualStick=false;
                    this.deltaVector.x = 0;
                    this.deltaVector.y = 0;
                    this.identifier=null;
                    this.pressed = false;
                    return;
                    
                }
            }
            else if(touch.identifier === this.identifier)
            {
                this.drawVirtualStick=false;
                this.deltaVector.x = 0;
                this.deltaVector.y = 0;
                this.identifier=null;
                this.pressed = false;
            }
        },
        
        action:function(){},
        
        debugText:function(x,y)
        {
            var ctx=ig.system.context;
            ctx.fillStyle="rgba(255,255,0,1)";
            ctx.fillText(":"+this.deltaVector.x+" , "+this.deltaVector.y,x,y);
            ctx.fillText(":"+this.deltaPos.x+" , "+this.deltaPos.y+" , "+this.deltaPos.z,x,y+30);
            
        },
        
        draw:function()
        {
            var ctx=ig.system.context;
            
            if(this.drawVirtualStick)
            {
                ctx.beginPath();
                ctx.lineWidth = 6;
                ctx.strokeStyle = this.color;
                ctx.arc(this.start.x, this.start.y, 40, 0, Math.PI * 2, true);
                ctx.stroke();
                ctx.closePath();
                ctx.beginPath();
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.arc(this.start.x, this.start.y, 60, 0, Math.PI * 2, true);
                ctx.stroke();
                ctx.closePath();
                ctx.beginPath();
                ctx.strokeStyle = this.color;
                ctx.arc(this.pos.x, this.pos.y, 40, 0, Math.PI * 2, true);
                ctx.stroke();
                ctx.closePath();
            }
        },
        
        setSensibility:function(val)
        {
            this.sensibility=val;
			this.inversedSensibility=1/(this.sensibility/1000);
        }
        
	});
});