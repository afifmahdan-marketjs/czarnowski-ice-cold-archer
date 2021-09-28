ig.module(
	'babylon.entities.game-camera'
)
.requires(
    'babylon.plugins.wgl-entity'
)
.defines(function(){
    wgl.modules.GameCamera = wgl.Entity.extend({
        camera:null,
        controlEnabled:false,
        name:"Camera",
        cameraCounter:null,
        addedDebugDraw:false,
        hitbox:null,
        MOVEKEYS:{
            UP:1,
            DOWN:2,
            LEFT:3,
            RIGHT:4,
        },
        
        init:function(x,y,z,settings)
    	{
            this.parent(x,y,z,settings);
            //Settings that begin with _camera will be ignored in the merge
            ig.merge(this,settings);
            if(settings._camera)
            {
                //console.log(settings.camera);
                this.camera=settings._camera;
                wgl.game.camera=this.camera;
            
            }
        
    		if(ig.ua.touchDevice)//touch device
    		{            
                var scene = wgl.game.currentScene;
                var camera = scene.activeCamera;
                
                scene.activeCamera = camera;
                // This attaches the camera to the canvas
                camera.attachControl(window);
                camera.ellipsoid = new BABYLON.Vector3(2, 2, 2);
                
                wgl.game.currentScene.collisionsEnabled = true;
                camera.checkCollisions = true;
                
                var mesh = wgl.game.getMeshByName("LaserSpawner:laser-spawner.js");
                mesh.checkCollisions=true;
                //mesh.checkCollisions=true;
                
                this.camera=camera;            
            }
            else
            {
                var scene = wgl.game.currentScene;
                var camera = scene.activeCamera;
                var engine = wgl.system.engine;
                var canvas = engine.getRenderingCanvas();
                //console.log(engine)
                //I think we really need to change this since we are using
                //a double canvas approach
                //where our impactjs canvas handles UI and menu
                //and babylonjs canvas handles the webgl stuff
                // console.log(scene._inputManager);
                var inputManager = scene._inputManager;
                camera.attachControl(window);
                
                /*
                engine.onCanvasBlurObservable.remove(camera._onCanvasBlurObserver);
                engine.onCanvasBlurObservable.remove(camera._onCanvasBlurObserver);
                canvas.removeEventListener("keydown", inputManager._onKeyDown);
                canvas.removeEventListener("keyup", inputManager._onKeyUp);
                */
                window.addEventListener("keydown", inputManager._onKeyDown, false);
                window.addEventListener("keyup", inputManager._onKeyUp, false);
                

                // Keyboard events
                /*
                this._onCanvasFocusObserver = engine.onCanvasFocusObservable.add(function () {
                    if (!canvas) {
                        return;
                    }
                    canvas.addEventListener("keydown", _this._onKeyDown, false);
                    canvas.addEventListener("keyup", _this._onKeyUp, false);
                });
                this._onCanvasBlurObserver = engine.onCanvasBlurObservable.add(function () {
                    if (!canvas) {
                        return;
                    }
                    canvas.removeEventListener("keydown", _this._onKeyDown);
                    canvas.removeEventListener("keyup", _this._onKeyUp);
                });
                */
                
                camera.ellipsoid = new BABYLON.Vector3(2, 2, 2);

                wgl.game.currentScene.collisionsEnabled = true;
                camera.checkCollisions = true;
                var mesh = wgl.game.getMeshByName("LaserSpawner:laser-spawner.js");
                mesh.checkCollisions=true;
                                
                this.camera=camera;
                this.camera.keysUp.push(ig.KEY.W);
                this.camera.keysDown.push(ig.KEY.S);
                this.camera.keysLeft.push(ig.KEY.A);
            }   this.camera.keysRight.push(ig.KEY.D);
            //alert(this.camera.fov);
            this.camera.fov = 1.1;
            this.camera.minZ=0.1;
            this.camera.maxZ=1000;
            this.camera.angularSensibility=2000;
            this.camera.inertia = 0.8;
            this.camera.speed=4;
            this.setupHitbox();
            
    	},
        
        setupHitbox:function()
        {
            this.hitbox=BABYLON.Mesh.CreateBox("box", 10.0, wgl.game.currentScene);
            this.hitbox.parent=this.camera;
        },
        update:function()
        {
            this.parent();
            if(wgl.debug.debug)
            {
                if(!this.addedDebugDraw)
                {
                    var drawCamDebug = function(){ig.system.context.fillText("FOV:"+this.camera.fov
                                               +" minZ: " + this.camera.minZ
                                               +" maxZ: " + this.camera.maxZ
                                               +" innertia: "+ this.camera.inertia
                                               +" fovMode: "+ this.camera.fovMode
                                               +" speed: " + this.camera.speed
                                               +" angularSensibility: " + this.camera.angularSensibility,20,100)}.bind(this);
                   ig.game.lastDraw.push(drawCamDebug);
                }
                this.addedDebugDraw=true;
            }                
        },
        kill:function()
        {
            this.parent();
            
            var scene = wgl.game.currentScene;
            var inputManager = scene._inputManager;
            window.removeEventListener("keydown", inputManager._onKeyDown, false);
            window.removeEventListener("keyup", inputManager._onKeyUp, false);
            this.hitbox.dispose();
            this.camera.dispose();
        }
    }); 
});