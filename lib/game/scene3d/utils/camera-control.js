ig.module(
    'game.scene3d.utils.camera-control'
)
    .requires(

)
    .defines(function () {
        "use strict";
        ig.cameraControl = {
            camera: null,
            targetMesh: null,
            zero: null,
            light: null,

            tempVec1: null,
            tempVec2: null,
            tempVec3: null,
            targetRelativePosition: null,

            isFrozen: false,
            targetFov: 1.6,
            fovAim: 0.5,
            fovRelaxing: 0.8,

            init: function () {
                var scene = ig.altBabylon.scene;
                scene.clearColor.set(207 / 255, 240 / 255, 213 / 255, 1)

                this.light = scene.getLightByName("Light");
                this.light.intensity = 0.3;
                this.light.diffuse = new BABYLON.Color3(0.5, 0.5, 0.5);
                this.light.position.set(0, 100, ig.meshManager.targetDistance / 2);

                this.camera = scene.getCameraByName("Camera");
                this.zero = new BABYLON.Vector3(0, 0, 0)
                this.targetRelativePosition = new BABYLON.Vector3(0, 0, -10)
                this.camera.minZ = 0;
                this.camera.maxZ = 2000;

                this.camera.fov = 0.8;

                this.zero = new BABYLON.Vector3(0, 0, 0);
                this.tempVec1 = new BABYLON.Vector3(0, 0, 0);
                this.tempVec2 = new BABYLON.Vector3(0, 0, 0);
                this.tempVec3 = new BABYLON.Vector3(0, 0, 0);

                this.pointCameraToVec3(new BABYLON.Vector3(0, 20, 0), 0, true);
            },

            turnSpeed: 0,
            turnAcc: 10,

            update: function (dt) {

                if (this.targetMesh) {
                    this.pointCameraToTarget()
                }
                // this.light.position.set(this.camera.position.x, this.camera.position.y + 20, this.camera.position.z);
                if (this.camera.fov != this.targetFov) {
                    this.camera.fov += (this.targetFov - this.camera.fov) / 10;
                    if (Math.abs(this.camera.fov - this.targetFov) < 0.001) {
                        console.log("same");
                        this.camera.fov = this.targetFov;
                    }
                }
                // console.log(this.camera.position.x.toFixed(), this.camera.position.y.toFixed(), this.camera.position.z.toFixed())
            },

            followMesh: function (target) {
                this.targetMesh = target;
            },

            unfollowMesh: function () {
                this.targetMesh = null;
            },

            reset: function () {
                this.camera.position.set(0, 20, 20)
                this.camera.setTarget(new BABYLON.Vector3(0, 0, 50));
                // this.light.position.set(this.camera.position.x, this.camera.position.y + 10, this.camera.position.z)
            },

            pointCameraToTarget: function (instant) {
                this.pointCameraToVec3(this.targetMesh.position.clone(), 0, instant);
            },

            pointCameraToVec3: function (vec3, dt, instant) {
                var target = this.tempVec1;
                target.copyFrom(this.camera.target);

                if (instant) {
                    target.x = vec3.x;
                    target.y = vec3.y;
                    target.z = vec3.z;
                    // console.log("instant")
                } else {
                    if (vec3.z > ig.meshManager.targetDistance + 20) vec3.z = ig.meshManager.targetDistance + 20
                    if (vec3.y < ig.meshManager.targetHeight / 2) vec3.y = ig.meshManager.targetHeight / 2
                    target.x += (vec3.x - target.x) / 10;
                    target.y += (vec3.y - target.y) / 10;
                    target.z += (vec3.z - target.z) / 10;
                    // target.z = vec3.z;
                }


                var camX = target.x + this.targetRelativePosition.x;
                var camY = target.y + this.targetRelativePosition.y;
                var camZ = target.z + this.targetRelativePosition.z;

                // if (this.targetMesh)
                //     console.log(camX, camY, camZ, this.targetMesh.name)

                this.camera.position.set(camX, camY, camZ);
                this.camera.setTarget(target);

                // console.log(camX, camY, camZ, target.x, target.y, target.z);
                // console.log(this.camera.target)
                // if (instant) this.camera.update();
                // console.log("==========================")

            },

        }
    });
