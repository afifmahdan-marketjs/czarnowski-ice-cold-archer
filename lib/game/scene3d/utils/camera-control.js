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
            fovRelaxing: 1.6,

            init: function () {
                var scene = ig.altBabylon.scene;
                scene.clearColor.set(248 / 255, 200 / 255, 92 / 255, 1)

                this.light = scene.getLightByName("Light");
                this.light.intensity = 1;
                this.light.diffuse = new BABYLON.Color3(0.5, 0.5, 0.5);

                this.camera = scene.getCameraByName("Camera");
                this.zero = new BABYLON.Vector3(0, 0, 0)
                this.targetRelativePosition = new BABYLON.Vector3(0, 0, -25)
                this.camera.minZ = 0;
                this.camera.maxZ = 2000;

                this.camera.fov = 1.6;

                this.zero = new BABYLON.Vector3(0, 0, 0);
                this.tempVec1 = new BABYLON.Vector3(0, 0, 0);
                this.tempVec2 = new BABYLON.Vector3(0, 0, 0);
                this.tempVec3 = new BABYLON.Vector3(0, 0, 0);

                this.pointCameraToVec3(new BABYLON.Vector3(0, 20, 0));
            },

            turnSpeed: 0,
            turnAcc: 10,

            update: function (dt) {

                if (this.targetMesh) {
                    this.pointCameraToVec3(this.targetMesh.position, dt)
                }
                // this.light.position.set(this.camera.position.x, this.camera.position.y + 20, this.camera.position.z);
                if (this.camera.fov != this.targetFov) {
                    this.camera.fov += (this.targetFov - this.camera.fov) / 10;
                    if (Math.abs(this.camera.fov - this.targetFov) < 0.03) {
                        this.camera.fov = this.targetFov;
                    }
                }
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
                this.light.position.set(this.camera.position.x, this.camera.position.y + 10, this.camera.position.z)
            },

            pointCameraToVec3: function (vec3, dt, instant) {
                var target = this.tempVec1;
                target.copyFrom(this.camera.target);


                // target.x += (vec3.x - target.x) / 10;
                target.x = vec3.x;
                target.y += (vec3.y - target.y) / 10;
                // target.z += (vec3.z - target.z) / 10;
                target.z = vec3.z;

                var camX = target.x + this.targetRelativePosition.x;
                var camY = target.y + this.targetRelativePosition.y;
                var camZ = target.z + this.targetRelativePosition.z;

                if (camY > 10) camY = 10;

                this.camera.position.set(camX, camY, camZ);
                this.camera.setTarget(target);


            },

        }
    });
