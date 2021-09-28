ig.module(
    'game.scene3d.game-scene3d'
)
    .requires(
        'game.scene3d.objects.player',
        'game.scene3d.utils.camera-control',
        'game.scene3d.utils.mesh-manager'
    )

    .defines(function () {

        ig.gameScene3D = {

            hasInitialized: false,
            paused: false,
            player: null,
            dtAccumulator: 0,

            shadowGenerator: null,

            init: function () {
                console.log("WebGL Version", wgl.system.engine.webGLVersion)

                // this.initDebug();

                ig.meshManager.init();
                this.player = new ig.Player();


                this.cameraControl = new ig.CameraControl();
                this.cameraControl.targetMesh = this.player.mesh;
                ig.showStats = false;
                // ig.utils.showAxis3d(20);
                this.hasInitialized = true;

                this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.cameraControl.light);
                this.shadowGenerator.addShadowCaster(this.player.mesh);
                this.shadowGenerator.usePoissonSampling = false;
                this.shadowGenerator.useExponentialShadowMap = false;

                var scene = wgl.game.currentScene;
                scene.ambientColor = new BABYLON.Color3(1, 1, 1);


                ig.gameScene3D.paused = true;
                ig.gameScene3D.player.mesh.isVisible = false;
                this.reset();
            },

            reset: function () {
                ig.meshManager.resetTiles();
                ig.meshManager.resetParticles();

                this.player.reset();
                this.cameraControl.reset();
                // this.updateStep(0);
            },

            initDebug: function () {
                if (ig.debug) {
                    ig.sceneInstrumentation = new BABYLON.SceneInstrumentation(wgl.game.currentScene)
                    ig.sceneInstrumentation.captureActiveMeshesEvaluationTime = true;
                    ig.sceneInstrumentation.captureRenderTargetsRenderTime = true;
                    ig.sceneInstrumentation.captureDrawCalls = true;
                    ig.sceneInstrumentation.captureFrameTime = true;
                    ig.sceneInstrumentation.captureRenderTime = true;
                    ig.sceneInstrumentation.captureCameraRenderTime = true;
                }
            },

            //called from babylon side, independent from canvas update
            update: function () {
                if (this.paused) return;
                if (!this.hasInitialized) return;

                var dt = wgl.system.engine.getDeltaTime() / 1000;
                if (dt > 0.5) dt = 0;

                var fpsCap = 60;
                var dtCap = 1 / fpsCap;
                this.dtAccumulator += dt;
                if (this.dtAccumulator < dtCap) return;
                this.dtAccumulator -= dtCap;
                dt = dtCap;
                this.updateStep(dt);
            },

            updateStep: function (dt) {
                this.player.update(dt);
                this.cameraControl.update(dt);
                ig.meshManager.updateTileEdge(this.player.mesh.position);
                ig.meshManager.updateParticles(this.player.mesh.position, dt);
            },


        };

    });