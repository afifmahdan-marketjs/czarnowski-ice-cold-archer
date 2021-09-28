ig.module( 
	'babylon.plugins.wgl-system' 
)
.requires(
    'babylon.plugins.wgl-timer'
)
.defines(function(){	
	
    wgl.System = ig.Class.extend({
        fps:null,
        tick:0,
        
        loader:null,
        assets:{},
        canvas:null,
        engine:null,
        
        progress:0,
        
        babylonJSSupport:false,
        
        finishLoadFunctions:[],
        finishSceneReadyFunctions:[],
        
        tempNewScene:null,
        
        canvas:null,
        started:false,
        
        init:function(canvasId,fps)
    	{
            this.fps = fps;
            this.canvas = ig.$(canvasId);
            if(BABYLON.Engine.isSupported()) 
            {
        	    this.engine = new BABYLON.Engine(this.canvas, false);
                
                //this.engine.setHardwareScalingLevel(1);
            
                if(ig.ua.iOS)
                {
                    //this.engine.setHardwareScalingLevel(0.5);
                }
                this.babylonJSSupport=true;
            }
            else
            {
                throw("BabylonJS not supported");
                this.babylonJSSupport=false;
            }
    	},
        
        loadScene:function(rootUrl,scenePath)
        {
            wgl.game.ready=false;
            if(this.babylonJSSupport)
            {
				//var scene = new BABYLON.Scene(this.engine);
				//scene.enablePhysics();
				BABYLON.SceneLoader.Load(rootUrl, 
											scenePath, 
											this.engine,
											this.onLoadSuccess.bind(this),
											this.progressCallback.bind(this),
											this.onLoadError.bind(this));
				
			}
            else
            {
                throw("Unable to load scene because BabylonJS is not supported");
            }
        },
        
        progressCallback:function(progress)
        {
            this.progress=progress;
            console.log("Progress:",progress.loaded, "out of: "+progress.total);
        },
        
        onLoadSuccess:function(scene)
        {
            
            console.log("load scene success")
            if(wgl.game.currentScene)
            {
                wgl.game.currentScene.dispose();
                //console.log(wgl.game.currentScene);
                //wgl.game.currentScene.dispose();
            }
            wgl.game.currentScene=scene;
            
            for(var index=0;index<this.finishLoadFunctions.length;index++)
            {
                this.finishLoadFunctions[index]();
            }
        
            this.loader =  new BABYLON.AssetsManager(wgl.game.currentScene);
        
    		// Wait for textures and shaders to be ready
    		wgl.game.currentScene.executeWhenReady(this.onSceneReady.bind(this));
        
            //this.axis2(wgl.game.currentScene, 20);
        },
    
        onLoadError:function(scene)
        {
            console.log("ERROR:");
            console.log(scene);
        },
        onSceneReady:function()
        {
            if(wgl.debug.debug)
            {
                wgl.debug.enableDebug();
            }
            
            //console.log("scene ready");
            this.loadCameras();
            this.loadMeshes();
            //Register scripts before rendering
            this.registerBeforeRender();
    		//console.log(wgl.game.currentScene);
            //Run render loop with a script
        
        
            for(var index=0;index<this.finishSceneReadyFunctions.length;index++)
            {
                this.finishSceneReadyFunctions[index]();
            }
            wgl.system.engine.hideLoadingUI();
            wgl.game.ready=true;
            //ig.gameScene.init();
        },
        
        registerBeforeRender:function()
        {
            //console.log("registering")
            wgl.game.currentScene.registerBeforeRender(this.advanceTime.bind(this));
    		wgl.game.currentScene.registerBeforeRender(wgl.game.update.bind(wgl.game));
        
            this.startRender();
        },
        
        startRender:function()
        {
            this.engine.runRenderLoop(wgl.game.render.bind(wgl.game));
        },
        
        stopRender:function()
        {
            this.engine.stopRenderLoop();
            
        },
        
        unregisterBeforeRender:function()
        {
            if(wgl.game.currentScene)
            {
                //console.log(wgl.game.currentScene.onBeforeRenderObservable);
                //console.log("unregistering");
                wgl.game.currentScene.unregisterBeforeRender(this.advanceTime.bind(this));
                wgl.game.currentScene.unregisterBeforeRender(wgl.game.update.bind(wgl.game));
        
                wgl.game.currentScene.onBeforeRenderObservable.clear();
                //console.log(wgl.game.currentScene.onBeforeRenderObservable);
                //console.log(wgl.game.currentScene.onBeforeRenderObservable.hasObservers());
                //console.log(this.engine._activeRenderLoops.length);
                this.stopRender();
                //console.log(this.engine._activeRenderLoops.length);
            }
        },
    
        loadMeshes:function()
        {
            var meshes=wgl.game.currentScene.meshes;
            
            
            
            for(var meshIndex=0;meshIndex<meshes.length;meshIndex++)
            {
                //console.log(meshes[meshIndex]);
                var meshName = meshes[meshIndex].name;
                
                //console.log(meshId);
                var splitstring = meshName.split(":");
                
                if(splitstring.length > 1)
                {
                    meshes[meshIndex].id = splitstring[0];
                    meshes[meshIndex].name = splitstring[0];
                    //this is the js code of that entity
                    var entity = '';
                    var scriptCode = splitstring[1].split(".");
                    var scriptCode = scriptCode[0].split("-");
                    
                    for(var i =0;i<scriptCode.length;i++)
                    {
                        var string = ''+scriptCode[i];
                        var temp=string.charAt(0).toUpperCase() + string.slice(1);
                        entity+=temp;
                    }
                    //console.log(entity.length);
                    if(entity.length>0)
                    {
                        //console.log(entity)
                        wgl.game.entities.push(new (wgl.modules[entity])
                                                    (
                                                        meshes[meshIndex].position.x
                                                        ,meshes[meshIndex].position.y
                                                        ,meshes[meshIndex].position.z
                                                        ,{_mesh:meshes[meshIndex]}
                                                    )
                                                );
                    }
                }
            }
        },
    
        loadCameras:function()
        {
            var cameras=wgl.game.currentScene.cameras;
            for(var cameraIndex=0;cameraIndex<cameras.length; cameraIndex++)
            {
                var cameraName = cameras[cameraIndex].name;
                var splitstring = cameraName.split(":");
                if(splitstring.length > 1)
                {
                    cameras[cameraIndex].id = splitstring[0];
                    cameras[cameraIndex].name = splitstring[0];
                    //this is the js code of that camera
                    var entity = '';
                    var scriptCode = splitstring[1].split(".");
                    var scriptCode = scriptCode[0].split("-");
                    for(var i =0;i<scriptCode.length;i++)
                    {
                        var string = ''+scriptCode[i];
                        var temp=string.charAt(0).toUpperCase() + string.slice(1);
                        entity+=temp;
                    }
                    //console.log(entity);
                    //console.log(wgl.modules);
            
                    wgl.game.entities.push(new (wgl.modules[entity])
                                                (
                                                    cameras[cameraIndex].position.x
                                                    ,cameras[cameraIndex].position.y
                                                    ,cameras[cameraIndex].position.z
                                                    ,{_camera:cameras[cameraIndex]}
                                                )
                                            );
                }
            }
        },
    
        advanceTime:function()
        {
            wgl.Timer.step();
            this.tick = this.engine.getDeltaTime();
        },
        
    });
        
});