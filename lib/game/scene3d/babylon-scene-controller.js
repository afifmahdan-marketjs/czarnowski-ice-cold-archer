ig.module(
    'game.scene3d.babylon-scene-controller'
)
    .requires(
        'game.scene3d.utils.camera-control',
        'game.scene3d.utils.mesh-manager',
        'game.scene3d.objects.arrow'
    )

    .defines(function () {

        ig.babylonSceneController = {

            hasInitialized: false,
            paused: false,
            player: null,
            dtAccumulator: 0,
            arrow: null,
            shadowGenerator: null,

            targetAllowMove: true,
            targetMovementId: 0,
            targetMovementWaypoints: null,
            targetMovementTime: 0,
            targetMovementSize: 0,
            targetMovementDuration: 0,

            postLines: [],

            init: function () {
                console.log("WebGL Version", ig.altBabylon.engine.webGLVersion)

                // this.initDebug();

                this.initTargetMovementWaypoints();
                ig.meshManager.init();
                ig.cameraControl.init();
                ig.showStats = false;
                this.arrow = new ig.Arrow();

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

                this.setTargetMovement(0, 10, 10)
            },

            nextTargetMovement: function () {

                var nextId = this.targetMovementId + 1
                var nextSize = this.targetMovementSize + 2;
                var nextDuration = this.targetMovementDuration;

                if (nextId >= this.targetMovementWaypoints.length) nextId = 0;
                if (nextSize > 40) {
                    nextSize = 20;
                    nextDuration--;
                    if (nextDuration < 4) nextDuration = 4;
                }

                this.setTargetMovement(nextId, nextSize, nextDuration)
            },

            reset: function () {
                this.arrow.reset();
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

                if (this.isMainMenu) return;

                ig.cameraControl.update(dt)
                ig.meshManager.update(dt)
                this.arrow.update(dt);
                this.updateTarget(dt);
            },

            updateTarget: function (dt) {
                var target = ig.meshManager.target;
                // var currentFov = ig.cameraControl.camera.fov
                // var minFov = ig.cameraControl.fovAim;
                // var maxFov = ig.cameraControl.fovRelaxing;
                // target.scaling.x = 1 + (1 - (currentFov - minFov) / (maxFov - minFov)) * 0.5;
                // target.scaling.z = target.scaling.x;

                if (this.targetMovementId == 0) {
                    target.position.x = 0;
                    target.position.y = ig.meshManager.targetHeight;
                } else if (this.targetAllowMove) {

                    var t = this.targetMovementTime / this.targetMovementDuration;
                    if (t >= 1) {
                        this.targetMovementTime = 0;
                        t = 1;
                    } else {
                        this.targetMovementTime += ig.system.tick;
                    }

                    var waypoints = this.targetMovementWaypoints[this.targetMovementId];
                    var segmentCount = waypoints.length;
                    var segmentDuration = 1 / segmentCount;
                    var currentSegment = Math.floor(t / segmentDuration);
                    var segmentTime = (t - (currentSegment * segmentDuration)) / segmentDuration;

                    // if (currentSegment > segmentCount - 1) currentSegment = segmentCount - 1;
                    // if (segmentTime > 1) segmentTime = 1;

                    var p0 = waypoints[currentSegment];
                    var p1 = currentSegment < waypoints.length - 1 ? waypoints[currentSegment + 1] : waypoints[0];

                    if (t == 1) {
                        p0 = waypoints[currentSegment - 1];
                        p1 = waypoints[0];
                        segmentTime = 1;
                    }

                    var oriX = 0;
                    var oriY = ig.meshManager.targetHeight;
                    var lx = (1 - segmentTime) * p0.x * this.targetMovementSize + segmentTime * p1.x * this.targetMovementSize + oriX;
                    var ly = (1 - segmentTime) * p0.y * this.targetMovementSize + segmentTime * p1.y * this.targetMovementSize + oriY;

                    target.position.x = lx;
                    target.position.y = ly;

                }
            },

            setTargetMovement: function (id, size, duration) {
                this.targetMovementDuration = duration;
                this.targetMovementSize = size;
                this.targetMovementId = id;
                this.targetMovementTime = 0;
                this.buildPostLines(id, size);
            },

            buildPostLines: function (id, size) {
                if (!this.postLines) this.postLines = [];

                while (this.postLines.length > 0) {
                    this.postLines.pop().dispose();
                }
                var postSize = 3;
                var waypoints = this.targetMovementWaypoints[id];
                var oriX = 0;
                var oriY = ig.meshManager.targetHeight;
                for (var i = 0; i < waypoints.length; i++) {
                    var wp = waypoints[i];
                    var p1 = {
                        x: wp.x * size + oriX,
                        y: wp.y * size + oriY
                    }
                    if (i < waypoints.length - 1) wp = waypoints[i + 1]
                    else wp = waypoints[0];
                    var p2 = {
                        x: wp.x * size + oriX,
                        y: wp.y * size + oriY
                    }

                    var dx = p2.x - p1.x;
                    var dy = p2.y - p1.y;
                    var length = Math.sqrt(dx * dx + dy * dy);
                    var midX = (p2.x + p1.x) / 2;
                    var midY = (p2.y + p1.y) / 2;


                    var post = BABYLON.MeshBuilder.CreateBox("post", { width: length, height: postSize, depth: postSize }, ig.altBabylon.scene)
                    post.position.x = midX
                    post.position.y = midY
                    post.position.z = ig.meshManager.targetDistance + postSize;

                    post.rotation.z = Math.atan2(dy, dx);

                    var dot = BABYLON.MeshBuilder.CreateSphere("point", { diameter: postSize, segments: 8 }, ig.altBabylon.scene);
                    dot.position.x = p1.x;
                    dot.position.y = p1.y;
                    dot.position.z = post.position.z;

                    this.postLines.push(post)
                    this.postLines.push(dot)
                }


                var centerpostHeight = this.findCenterPostHeight(id, size);
                var centerpost = BABYLON.MeshBuilder.CreateBox("post", { width: postSize, height: centerpostHeight, depth: postSize }, ig.altBabylon.scene)
                centerpost.position.x = 0
                centerpost.position.y = centerpostHeight / 2
                centerpost.position.z = ig.meshManager.targetDistance + postSize;
                this.postLines.push(centerpost)
                console.log("centerpostHeight:", centerpostHeight);
            },

            findCenterPostHeight: function (id, size) {
                if (id == 0) {
                    return ig.meshManager.targetHeight;
                }

                var waypoints = this.targetMovementWaypoints[id];
                var oriX = 0;
                var oriY = ig.meshManager.targetHeight;
                var lowestY = 9999999999;

                for (var i = 0; i < waypoints.length; i++) {
                    var wp = waypoints[i];
                    var p0 = { x: wp.x * size + oriX, y: wp.y * size + oriY }

                    if (i < waypoints.length - 1) wp = waypoints[i + 1]
                    else wp = waypoints[0];

                    var p1 = { x: wp.x * size + oriX, y: wp.y * size + oriY }

                    for (var t = 0; t < 1; t += 0.01) {
                        var lx = (1 - t) * p0.x + t * p1.x;
                        var ly = (1 - t) * p0.y + t * p1.y;
                        if (Math.abs(lx) < 0.5) {
                            if (ly < lowestY) {
                                lowestY = ly;
                            }
                        }
                    }
                }
                return lowestY;
            },

            initTargetMovementWaypoints: function () {
                this.targetMovementWaypoints = [
                    [
                        { x: 0, y: 0 }
                    ], [
                        { x: 0, y: 0 },//1
                        { x: 1, y: 0 },
                        { x: 0, y: 0 },
                        { x: -1, y: 0 },
                    ], [
                        { x: 0, y: 0 },//2
                        { x: -1, y: 1 },
                        { x: 1, y: 1 },
                    ], [
                        { x: 0, y: 0 },//3
                        { x: -1, y: 0 },
                        { x: -1, y: 1 },
                        { x: 0, y: 1 },
                        { x: 1, y: 1 },
                        { x: 1, y: 0 },
                    ], [
                        { x: 0, y: 0 },//4
                        { x: 1, y: 1 },
                        { x: 0, y: 2 },
                        { x: -1, y: 1 },
                    ], [
                        { x: -2, y: 0 },//5
                        { x: -1, y: 1 },
                        { x: 0, y: 0 },
                        { x: 1, y: 1 },
                        { x: 2, y: 0 },
                        { x: 1, y: 1 },
                        { x: 0, y: 0 },
                        { x: -1, y: 1 },

                    ], [
                        { x: 0, y: 0 },//6
                        { x: 1, y: 0 },
                        { x: -1, y: 2 },
                        { x: 1, y: 2 },
                        { x: -1, y: 0 },
                    ], [
                        { x: -1, y: 0 },//7
                        { x: 1, y: 1 },
                        { x: 1, y: 0 },
                        { x: -1, y: 1 },
                    ], [
                        { x: 0, y: 0 },//8
                        { x: 1, y: 1 },
                        { x: -1, y: 3 },
                        { x: 0, y: 4 },
                    ], [
                        { x: 0, y: 0 },//9
                        { x: 1, y: 1 },
                        { x: -1, y: 3 },
                        { x: 0, y: 4 },
                        { x: 1, y: 3 },
                        { x: -1, y: 1 },
                    ], [
                        { x: 0, y: 0.224 },//10
                        { x: 0.309, y: 0 },
                        { x: 0.202, y: 0.378 },
                        { x: 0.5, y: 0.618 },
                        { x: 0.125, y: 0.628 },
                        { x: 0, y: 1 },
                        { x: -0.125, y: 0.628 },
                        { x: -0.5, y: 0.618 },
                        { x: -0.202, y: 0.378 },
                        { x: -0.309, y: 0 },
                    ],

                ];

                this.basePostHeight = [

                ]

            }

        };

    });