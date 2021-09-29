ig.module('game.toybox.babylon.alt-babylon')
    .requires()
    .defines(function () {

        ig.altBabylon = {
            onSceneLoaded: null,
            onUpdate: null,
            scene: null,
            engine: null,
            canvas: null,
            canvasId: null,

            loadScene: function (sceneRootUrl, sceneName, canvasId) {
                if (this.scene) this.scene.dispose();
                this.scene = null;
                this.onSceneLoaded = new ig.Signal();
                this.onUpdate = new ig.Signal();

                if (BABYLON.Engine.isSupported()) {
                    if (!this.engine) {
                        if (canvasId) this.canvasId = canvasId;
                        else if (!this.canvasId) this.canvasId = "webgl";

                        this.canvas = ig.$(canvasId);
                        this.engine = new BABYLON.Engine(this.canvas, false);
                        this.runEngineLoop();
                    }

                    BABYLON.SceneLoader.ShowLoadingScreen = false;
                    BABYLON.SceneLoader.Load(sceneRootUrl,
                        sceneName,
                        this.engine,
                        this.onLoadSuccess.bind(this),
                        null,
                        this.onLoadError.bind(this));

                }

                return this;
            },

            stopEngineLoop: function () {
                this.engine.stopRenderLoop();
            },

            runEngineLoop: function () {
                this.engine.runRenderLoop(ig.altBabylon.loop.bind(ig.altBabylon));
            },

            loop: function () {
                if (this.scene) {
                    if (this.onUpdate) {
                        var dt = this.engine.getDeltaTime() / 1000;
                        this.onUpdate.dispatch(dt)
                    }
                    this.scene.render();
                }
            },

            onLoadSuccess: function (scene) {
                this.scene = scene;
                this.onSceneLoaded.dispatch();
            },

            onLoadError: function (scene, message, exception) {
                console.log("ERROR LOADING SCENE")
                console.log(scene)
                console.log(message)
                console.log(exception)
            },


        };

    });