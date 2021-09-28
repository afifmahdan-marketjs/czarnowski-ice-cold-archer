ig.module(
    'game.scene3d.utils.camera-control'
)
    .requires(

    )
    .defines(function () {
        "use strict";
        ig.CameraControl = ig.Class.extend({
            camera: null,
            targetMesh: null,
            zero: null,
            light: null,

            tempVec1: null,
            tempVec2: null,
            tempVec3: null,
            targetRelativePosition: null,

            isFrozen: false,

            init: function () {
                var scene = wgl.game.currentScene;
                scene.clearColor.set(248 / 255, 200 / 255, 92 / 255, 1)

                // scene.getMaterialByName("fogMat").diffuseColor = new BABYLON.Color3(scene.clearColor.r, scene.clearColor.g, scene.clearColor.b);
                // scene.getMaterialByName("fogMat").emissiveColor = new BABYLON.Color3(scene.clearColor.r, scene.clearColor.g, scene.clearColor.b);

                this.light = scene.getLightByName("Light");
                this.light.intensity = 1;
                this.light.diffuse = new BABYLON.Color3(0.5, 0.5, 0.5);

                this.camera = scene.getCameraByName("Camera");
                this.zero = new BABYLON.Vector3(0, 0, 0)
                this.targetRelativePosition = new BABYLON.Vector3(0, 13, -25)
                this.camera.minZ = 0;
                this.camera.maxZ = 2000;

                this.camera.fov = 2;
                // this.camera.fovMode = BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED;


                this.zero = new BABYLON.Vector3(0, 0, 0);
                this.tempVec1 = new BABYLON.Vector3(0, 0, 0);
                this.tempVec2 = new BABYLON.Vector3(0, 0, 0);
                this.tempVec3 = new BABYLON.Vector3(0, 0, 0);

                this.pointCameraToVec3(this.zero);
            },

            turnSpeed: 0,
            turnAcc: 10,

            update: function (dt) {

                if (ig.system.width > ig.system.height) {
                    // if (this.camera.fovMode != BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED) this.camera.fovMode != BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED
                    // if (this.camera.fovMode != BABYLON.Camera.FOVMODE_VERTICAL_FIXED) this.camera.fovMode != BABYLON.Camera.FOVMODE_VERTICAL_FIXED
                    if (this.camera.fov != 1) this.camera.fov = 1;
                } else {
                    if (this.camera.fov != 2) this.camera.fov = 2;
                    // if (this.camera.fovMode != BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED) this.camera.fovMode != BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED
                    // if (this.camera.fovMode != BABYLON.Camera.FOVMODE_VERTICAL_FIXED) this.camera.fovMode != BABYLON.Camera.FOVMODE_VERTICAL_FIXED

                }


                var ratio = ig.system.width / ig.system.height
                if (ratio < 1) ratio = 1;

                // var norm = ig.meshManager.normalize2(ig.gameScene3D.player.steeringVector.x, ig.gameScene3D.player.steeringVector.z, -15 / ratio);
                var norm = ig.meshManager.normalize2(ig.gameScene3D.player.steeringVector.x, ig.gameScene3D.player.steeringVector.z, -15);

                // this.targetRelativePosition.x = ig.gameScene3D.player.steeringVector.x * -(0.7 / ig.gameScene3D.player.speedMultiplier);
                // this.targetRelativePosition.z = ig.gameScene3D.player.steeringVector.z * -(0.7 / ig.gameScene3D.player.speedMultiplier);
                this.targetRelativePosition.x = norm.x
                this.targetRelativePosition.y = 10
                this.targetRelativePosition.z = norm.y

                if (this.targetMesh) {
                    this.pointCameraToVec3(this.targetMesh.position, dt)
                }
                this.light.position.set(this.camera.position.x, this.camera.position.y + 20, this.camera.position.z)
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
                // console.log("resetCamera", this.camera.target, this.zero);
            },

            pointCameraToVec3: function (vec3, dt, instant) {
                // vec3.y = this.zero.y;

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

        });
    });
