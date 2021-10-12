ig.module(
    'game.scene3d.objects.arrow-tip'
)
    .requires(
        'game.scene3d.objects.mesh-object'
    )
    .defines(function () {
        "use strict";
        ig.ArrowTip = ig.MeshObject.extend({

            isFlying: false,
            gravity: null,
            speed: null,
            wind: null,
            lookTarget: null,
            aftershotTarget: null,
            arrowPower: 200,
            arrowBody: null,
            isAiming: false,
            isRelaxing: false,

            onLanded: null,

            launchNextFrame: false,
            resetNextFrame: false,

            difficulty: 0,

            init: function () {
                this.parent(0, 0, 0, ig.meshManager.arrowTip, false, false)
                this.speed = new BABYLON.Vector3(0, 0, 0)
                this.wind = new BABYLON.Vector3(1, 0, 0)
                this.lookTarget = new BABYLON.Vector3(0, 0, 0)
                this.aftershotTarget = new BABYLON.Vector3(0, 0, 0)
                this.gravity = new BABYLON.Vector3(0, -1 * 10, 0)
                this.arrowBody = ig.meshManager.arrowBody;
                this.reset();

                this.onLanded = new ig.Signal();

            },

            resetDifficulty: function () {
                this.difficulty = 0;
                this.wind.set(0, 0, 0);
            },

            increaseDifficulty: function () {
                this.difficulty++;
                var speedUnit = 0.25;
                var maxSpeed = 5;
                var maxSwing = maxSpeed / speedUnit;
                var speedSwing = this.difficulty * 2;
                if (speedSwing > maxSwing) speedSwing = maxSwing;
                var speed = speedUnit * ig.random.int(-speedSwing, speedSwing);
                this.wind.x = speed;
                console.log("windSpeed", speed.toFixed(2));
            },

            isHitTarget: function () {
                var target = ig.meshManager.target;
                var arrow = this.mesh;
                if (this.mesh.intersectsMesh(ig.meshManager.target)) {
                    var dx = arrow.position.x - target.position.x;
                    var dy = arrow.position.y - target.position.y;
                    var dSquared = dx * dx + dy * dy;
                    var rSquared = ig.meshManager.targetRadius * ig.meshManager.targetRadius;
                    return dSquared <= rSquared;
                }
                return false
            },

            isHitPost: function () {
                if (this.isHitTarget()) return false;
                return this.mesh.intersectsMesh(ig.meshManager.post)
            },

            calculateScore: function () {
                var target = ig.meshManager.target;
                var arrow = this.mesh;
                var dx = arrow.position.x - target.position.x;
                var dy = arrow.position.y - target.position.y;
                var d = Math.sqrt(dx * dx + dy * dy);
                var r = ig.meshManager.targetRadius;
                var score = Math.floor((1 - (d / r)) * 10) + 1;
                if (score < 0) score = 0;
                this.lastScore = score;
            },

            update: function (dt) {
                this.parent(dt);

                if (this.isFlying) {
                    var mesh = this.mesh;
                    this.speed.x += (this.gravity.x + this.wind.x) * dt;
                    this.speed.y += (this.gravity.y + this.wind.y) * dt;
                    this.speed.z += (this.gravity.z + this.wind.z) * dt;
                    mesh.position.x += this.speed.x * dt;
                    mesh.position.y += this.speed.y * dt;
                    mesh.position.z += this.speed.z * dt;
                    // Math.atan2(this.speed.x.this.speed)

                    this.lookTarget.set(
                        this.speed.x + mesh.position.x,
                        this.speed.y + mesh.position.y,
                        this.speed.z + mesh.position.z
                    )

                    mesh.lookAt(this.lookTarget)
                    if (this.isHitTarget() || this.isHitPost() || this.mesh.position.y < 0) {
                        this.calculateScore();
                        this.isFlying = false;
                        setTimeout(function () {
                            // ig.cameraControl.followMesh(ig.meshManager.aftershotCamPos)
                            ig.cameraControl.unfollowMesh();
                            // if (this.mesh.position.y > 0) {
                            //     this.aftershotTarget.copyFrom(ig.meshManager.target.position);
                            // } else {
                            this.aftershotTarget.copyFrom(this.mesh.position);
                            // }
                            this.toAftershotCam = true;
                            this.onLanded.dispatch();
                        }.bind(this), 1000);

                    }
                } else if (this.isAiming || this.isRelaxing) {
                    this.mesh.position.x += (ig.cameraControl.camera.position.x + 1 - this.mesh.position.x) / 2;
                    this.mesh.position.y += (ig.cameraControl.camera.position.y - 2 - this.mesh.position.y) / 2;
                    this.mesh.position.z += (ig.cameraControl.camera.position.z + 10 - this.mesh.position.z) / 2;
                }

                if (this.toAftershotCam) {
                    var camera = ig.cameraControl.camera;
                    var targetPosX = this.aftershotTarget.x - 5;
                    var targetPosY = this.aftershotTarget.y + 5;
                    var targetPosZ = this.aftershotTarget.z - 30;

                    camera.position.x += (targetPosX - camera.position.x) / 20;
                    camera.position.y += (targetPosY - camera.position.y) / 20;
                    camera.position.z += (targetPosZ - camera.position.z) / 20;

                    // camera.target.x = 0;
                    // camera.target.y = ig.meshManager.targetHeight;
                    // camera.target.z = ig.meshManager.targetDistance;
                    camera.target.x = this.aftershotTarget.x;
                    camera.target.y = this.aftershotTarget.y;
                    camera.target.z = this.aftershotTarget.z;
                    camera.setTarget(camera.target)

                    if (Math.abs(camera.position.z - targetPosZ) < 0.1) {
                        this.toAftershotCam = false;
                    }
                }

                // this.arrowBody.position.copyFrom(this.mesh.position);
                // this.arrowBody.position.z -= 5;

                if (this.launchNextFrame) {
                    this.launch();
                    this.launchNextFrame = false;
                }

                if (this.resetNextFrame) {
                    ig.cameraControl.unfollowMesh();
                    var camera = ig.cameraControl.camera;
                    var arrowTarget = ig.meshManager.target;

                    camera.position.x += (arrowTarget.position.x - camera.position.x) / 10;

                    var addedY = (arrowTarget.position.y - camera.position.y) / 20
                    if (this.aftershotTarget.z > ig.meshManager.targetDistance + 10 && camera.position.z > ig.meshManager.targetDistance * 0.001) {
                        addedY = (ig.meshManager.targetHeight * 2 - camera.position.y) / 2
                    }

                    camera.position.y += addedY;

                    var addedZ = (-10 - camera.position.z) / 10;
                    if (addedZ < -5) addedZ = -5;
                    camera.position.z += addedZ;

                    if (Math.abs(camera.position.x) < 0.1) camera.position.x = 0;

                    var camTargetX = 0;
                    var camTargetY = ig.meshManager.targetHeight;
                    var camTargetZ = ig.meshManager.targetDistance;

                    camera.target.x = camTargetX;
                    camera.target.y = camTargetY;
                    camera.target.z = camTargetZ;

                    if (this.aftershotTarget.z > camTargetZ && camera.position.z > -9.9) {
                        camera.target.z = this.aftershotTarget.z;
                    }

                    camera.setTarget(camera.target)

                    if (camera.position.z <= -9.998 && Math.abs(camera.target.z - camTargetZ) < 0.01 && Math.abs(arrowTarget.position.y - camera.position.y) < 0.01) {
                        this.resetNextFrame = false;
                        this.reset();
                    }

                }

            },

            reset: function () {
                this.launchNextFrame = false;
                this.resetNextFrame = false;
                this.toAftershotCam = false;
                this.isFlying = false;
                this.isRelaxing = true;
                this.isAiming = false
                this.mesh.position.set(1, ig.meshManager.target.position.y - 2, -50);
                this.mesh.rotation.set(0, 0, 0);
                ig.cameraControl.targetRelativePosition.set(0, 0, -ig.meshManager.target.position.z - 10)
                ig.cameraControl.followMesh(ig.meshManager.crosshairPoint);
                ig.cameraControl.pointCameraToTarget(true);
                this.mesh.isVisible = true;
                ig.meshManager.target.isVisible = true;
                ig.meshManager.post.isVisible = true;
                // console.log("reset")
            },

            setMainMenu: function () {
                this.reset();
                this.mesh.isVisible = false;
                ig.meshManager.target.isVisible = false;
                ig.meshManager.post.isVisible = false;
            },

            launch: function () {
                this.isFlying = true;
                this.isRelaxing = false;
                this.mesh.position.x = ig.cameraControl.camera.position.x;
                this.mesh.position.y = ig.cameraControl.camera.position.y;
                var dz = ig.meshManager.target.position.z - this.mesh.position.z;
                var t = dz / this.arrowPower;
                var vz = -this.gravity.y * (t / 2);
                this.speed.set(0, vz, this.arrowPower);

                // ig.cameraControl.targetRelativePosition.set(-2, 2, -10)
                ig.cameraControl.targetRelativePosition.set(-1, 1, -10)
                ig.cameraControl.followMesh(this.mesh);
                ig.cameraControl.pointCameraToTarget(true);


            },


        });
    });
