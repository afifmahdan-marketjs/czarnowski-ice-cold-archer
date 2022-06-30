ig.module(
    'game.scene3d.objects.arrow'
)
    .requires(
        'game.scene3d.objects.mesh-object'
    )
    .defines(function () {
        "use strict";
        ig.Arrow = ig.MeshObject.extend({

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

            onTarget: false,

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
                if (this.mesh.intersectsMesh(ig.meshManager.target, true)) {
                    var dx = arrow.position.x - target.position.x;
                    var dy = arrow.position.y - target.position.y;
                    var dSquared = dx * dx + dy * dy;
                    var rSquared = ig.meshManager.targetRadius * ig.meshManager.targetRadius;
                    return dSquared <= rSquared;
                }
                return false
            },

            isHitPost: function () {
                for (var i = 0; i < ig.babylonSceneController.postLines.length; i++) {
                    var post = ig.babylonSceneController.postLines[i];
                    if (this.mesh.intersectsMesh(post, true)) {
                        return true;
                    }
                }
                return false
            },

            isHitTrees: function () {
                for (var i = 0; i < ig.meshManager.trees.length; i++) {
                    var tree = ig.meshManager.trees[i];
                    if (this.mesh.intersectsMesh(tree)) {
                        if (this.mesh.position.z > tree.position.z - 8) {
                            var t1 = { x: tree.position.x, y: tree.position.y + 40 };
                            var t2 = { x: tree.position.x + 15, y: tree.position.y - 25 };
                            var t3 = { x: tree.position.x - 15, y: tree.position.y - 25 };
                            var p = { x: this.mesh.position.x, y: this.mesh.position.y };

                            var inTriangle = this.isInside(t1.x, t1.y, t2.x, t2.y, t3.x, t3.y, p.x, p.y)
                            console.log(inTriangle);
                            if (inTriangle) return true;
                            else {
                                var dx = Math.abs(this.mesh.position.x - tree.position.x)
                                if (dx < 5) return true;
                            }
                        }

                    } 

                }
                return false
            },

            /* A utility function to calculate area of triangle formed by (x1, y1),
            (x2, y2) and (x3, y3) */
            area: function (x1, y1, x2, y2, x3, y3) {
                return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0);
            },

            /* A function to check whether point P(x, y) lies inside the triangle formed
            by A(x1, y1), B(x2, y2) and C(x3, y3) */
            isInside: function (x1, y1, x2, y2, x3, y3, x, y) {
                /* Calculate area of triangle ABC */
                var A = this.area(x1, y1, x2, y2, x3, y3);

                /* Calculate area of triangle PBC */
                var A1 = this.area(x, y, x2, y2, x3, y3);

                /* Calculate area of triangle PAC */
                var A2 = this.area(x1, y1, x, y, x3, y3);

                /* Calculate area of triangle PAB */
                var A3 = this.area(x1, y1, x2, y2, x, y);

                /* Check if sum of A1, A2 and A3 is same as A */
                return (A == A1 + A2 + A3);
            },

            // sign: function (p1, p2, p3) {
            //     return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
            // },

            // pointInTriangle: function (pt, v1, v2, v3) {
            //     var d1, d2, d3;
            //     var has_neg, has_pos;

            //     d1 = this.sign(pt, v1, v2);
            //     d2 = this.sign(pt, v2, v3);
            //     d3 = this.sign(pt, v3, v1);

            //     has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
            //     has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

            //     return !(has_neg && has_pos);
            // },

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
                    var gravityMultiplier = mesh.position.z > ig.meshManager.targetDistance ? 2 : 1;
                    this.speed.x += (this.gravity.x + this.wind.x) * dt;
                    this.speed.y += (this.gravity.y + this.wind.y) * dt * gravityMultiplier;
                    this.speed.z += (this.gravity.z + this.wind.z) * dt;

                    mesh.position.x += this.speed.x * dt;
                    mesh.position.y += this.speed.y * dt;
                    mesh.position.z += this.speed.z * dt;


                    this.lookTarget.set(
                        this.speed.x + mesh.position.x,
                        this.speed.y + mesh.position.y,
                        this.speed.z + mesh.position.z
                    )

                    mesh.lookAt(this.lookTarget)
                    var onTarget = this.isHitTarget()
                    var onGround = this.mesh.position.y < 0;
                    var onPost = this.isHitPost();
                    var onTrees = this.isHitTrees();
                    if (onTarget || onGround || onPost || onTrees) {
                        if (onTarget) this.onTarget = true;
                        ig.babylonSceneController.targetAllowMove = false;
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
                            console.log("arrowLanded");
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

                    if (targetPosZ > ig.meshManager.targetDistance + 20) {
                        this.toAftershotCam = false;
                        this.onLanded.dispatch();
                    } else {
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
                            this.onLanded.dispatch();
                        }
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

                    camera.position.x += (0 - camera.position.x) / 10;

                    var addedY = (ig.meshManager.targetHeight - camera.position.y) / 20
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

                    camera.target.x += (camTargetX - camera.target.x) / 2;
                    camera.target.y += (camTargetY - camera.target.y) / 2;
                    camera.target.z += (camTargetZ - camera.target.y) / 2;

                    if (this.aftershotTarget.z > camTargetZ && camera.position.z > -9.9) {
                        camera.target.z = this.aftershotTarget.z;
                    }

                    camera.setTarget(camera.target)

                    if (camera.position.z <= -9.998 && Math.abs(ig.meshManager.targetHeight - camera.position.y) < 0.02) {
                        this.resetNextFrame = false;
                        this.reset();
                    }
                    // console.log(camera.position.z.toFixed(), addedZ);

                }

                var bowDistance = 2;
                ig.meshManager.bow.position.x = this.mesh.position.x + 0.1;
                ig.meshManager.bow.position.y = this.mesh.position.y;
                if (this.mesh.position.z > 0) {
                    ig.meshManager.bow.position.z = -this.mesh.position.z - bowDistance;
                } else {
                    ig.meshManager.bow.position.z = this.mesh.position.z - bowDistance;
                }
                if (ig.meshManager.bow.position.z > -bowDistance) ig.meshManager.bow.position.z = -bowDistance
            },

            reset: function () {
                if (this.onTarget) ig.babylonSceneController.nextTargetMovement();
                this.launchNextFrame = false;
                this.resetNextFrame = false;
                this.toAftershotCam = false;
                this.isFlying = false;
                this.isRelaxing = true;
                this.isAiming = false
                this.mesh.position.set(1, ig.meshManager.targetHeight - 2, -50);
                this.mesh.rotation.set(0, 0, 0);
                ig.cameraControl.targetRelativePosition.set(0, 0, -ig.meshManager.targetDistance - 10)
                ig.cameraControl.followMesh(ig.meshManager.crosshairPoint);
                ig.cameraControl.pointCameraToTarget(true);
                this.mesh.isVisible = true;
                ig.meshManager.target.isVisible = true;
                ig.babylonSceneController.targetAllowMove = true;
                this.onTarget = false;
                console.log("reset")
                ig.babylonSceneController.isMainMenu = false
            },

            setMainMenu: function () {
                this.reset();
                ig.babylonSceneController.isMainMenu = true
                this.mesh.isVisible = false;
                ig.meshManager.target.isVisible = false;

                if (!ig.babylonSceneController.postLines) ig.babylonSceneController.postLines = [];

                while (ig.babylonSceneController.postLines.length > 0) {
                    ig.babylonSceneController.postLines.pop().dispose();
                }
            },

            launch: function () {
                this.onTarget = false;
                this.isFlying = true;
                this.isRelaxing = false;
                this.mesh.position.x = ig.cameraControl.camera.position.x;
                this.mesh.position.y = ig.cameraControl.camera.position.y;
                var dz = ig.meshManager.targetDistance - this.mesh.position.z;
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
