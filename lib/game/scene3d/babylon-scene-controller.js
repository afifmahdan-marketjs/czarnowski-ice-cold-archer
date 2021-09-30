ig.module(
    'game.scene3d.babylon-scene-controller'
)
    .requires(
        'game.scene3d.utils.camera-control',
        'game.scene3d.utils.mesh-manager'
    )

    .defines(function () {

        ig.babylonSceneController = {

            hasInitialized: false,
            paused: false,
            player: null,
            dtAccumulator: 0,

            shadowGenerator: null,

            init: function () {
                console.log("WebGL Version", ig.altBabylon.engine.webGLVersion)

                // this.initDebug();

                ig.meshManager.init();
                ig.cameraControl.init();
                ig.showStats = false;

                ig.altBabylon.onUpdate.add(this.update.bind(this));

                // this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.cameraControl.light);
                // this.shadowGenerator.addShadowCaster(this.player.mesh);
                // this.shadowGenerator.usePoissonSampling = false;
                // this.shadowGenerator.useExponentialShadowMap = false;

                var scene = ig.altBabylon.scene;
                // scene.ambientColor = new BABYLON.Color3(1, 1, 1);

                this.hasInitialized = true;
                this.paused = true;

                this.reset();
            },

            reset: function () {

            },

            initDebug: function () {
                if (ig.debug) {
                    ig.sceneInstrumentation = new BABYLON.SceneInstrumentation(ig.altBabylon.scene)
                    ig.sceneInstrumentation.captureActiveMeshesEvaluationTime = true;
                    ig.sceneInstrumentation.captureRenderTargetsRenderTime = true;
                    ig.sceneInstrumentation.captureDrawCalls = true;
                    ig.sceneInstrumentation.captureFrameTime = true;
                    ig.sceneInstrumentation.captureRenderTime = true;
                    ig.sceneInstrumentation.captureCameraRenderTime = true;
                }
            },

            update: function (dt) {
                if (this.paused) return;
                if (!this.hasInitialized) return;

                ig.cameraControl.update(dt)
                ig.meshManager.update(dt)
            },

        };

    });