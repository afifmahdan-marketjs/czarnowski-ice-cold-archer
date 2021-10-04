ig.module(
    'game.scene3d.babylon-scene-controller'
)
    .requires(
        'game.scene3d.utils.camera-control',
        'game.scene3d.utils.mesh-manager',
        'game.scene3d.objects.arrow-tip'
    )

    .defines(function () {

        ig.babylonSceneController = {

            hasInitialized: false,
            paused: false,
            player: null,
            dtAccumulator: 0,
            arrow: null,
            shadowGenerator: null,

            init: function () {
                console.log("WebGL Version", ig.altBabylon.engine.webGLVersion)

                // this.initDebug();

                ig.meshManager.init();
                ig.cameraControl.init();
                ig.showStats = false;
                this.arrow = new ig.ArrowTip();

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
                this.arrow.update(dt);
                this.updateTarget(dt);
            },

            updateTarget: function (dt) {
                // var target = ig.meshManager.target;
                // var currentFov = ig.cameraControl.camera.fov
                // var minFov = ig.cameraControl.fovAim;
                // var maxFov = ig.cameraControl.fovRelaxing;
                // target.scaling.x = 1 + (1 - (currentFov - minFov) / (maxFov - minFov)) * 0.5;
                // target.scaling.z = target.scaling.x;
            }

        };

    });