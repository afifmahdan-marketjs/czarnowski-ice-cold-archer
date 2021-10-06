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
            arrowPower: 200,
            arrowBody: null,
            isAiming: false,

            onLanded: null,

            launchNextFrame: false,
            resetNextFrame: false,

            init: function () {
                this.parent(0, 0, 0, ig.meshManager.arrowTip, false, false)
                this.speed = new BABYLON.Vector3(0, 0, 0)
                this.wind = new BABYLON.Vector3(0, 0, 0)
                this.gravity = new BABYLON.Vector3(0, -1 * 10, 0)
                this.arrowBody = ig.meshManager.arrowBody;
                this.reset();

                this.onLanded = new ig.Signal();

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
                    if (this.mesh.intersectsMesh(ig.meshManager.target) || this.mesh.position.y < 0) {
                        this.isFlying = false;
                        setTimeout(function () {
                            ig.cameraControl.followMesh(ig.meshManager.aftershotCamPos)
                            this.onLanded.dispatch();
                        }.bind(this), 500);

                    }
                } else if (this.isAiming) {
                    this.mesh.position.set(
                        ig.cameraControl.camera.position.x + 1,
                        ig.cameraControl.camera.position.y - 2,
                        ig.cameraControl.camera.position.z + 10
                    );


                }
                // console.log(
                //     this.mesh.position.x - ig.cameraControl.camera.position.x,
                //     this.mesh.position.y - ig.cameraControl.camera.position.y,
                //     this.mesh.position.z - ig.cameraControl.camera.position.z,
                // );
                this.arrowBody.position.copyFrom(this.mesh.position);
                this.arrowBody.position.z -= 5;

                if (this.launchNextFrame) {
                    this.launch();
                    this.launchNextFrame = false;
                }

                if (this.resetNextFrame) {
                    this.reset();
                    this.resetNextFrame = false;
                }

            },

            reset: function () {
                this.mesh.position.set(1, ig.meshManager.target.position.y - 2, 0);
                this.isFlying = false;

                ig.cameraControl.targetRelativePosition.set(0, 0, -ig.meshManager.target.position.z - 10)
                ig.cameraControl.followMesh(ig.meshManager.crosshairPoint);
                ig.cameraControl.pointCameraToTarget(true);
                // console.log("reset")
            },

            launch: function () {
                this.isFlying = true;
                this.mesh.position.x = ig.cameraControl.camera.position.x;
                this.mesh.position.y = ig.cameraControl.camera.position.y;
                var dz = ig.meshManager.target.position.z - this.mesh.position.z;
                var t = dz / this.arrowPower;
                var vz = -this.gravity.y * (t / 2);
                this.speed.set(0, vz, this.arrowPower);

                ig.cameraControl.targetRelativePosition.set(-2, 2, -10)
                ig.cameraControl.followMesh(this.mesh);
                ig.cameraControl.pointCameraToTarget(true);


            },


        });
    });
