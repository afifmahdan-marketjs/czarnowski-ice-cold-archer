ig.module(
    'game.scene3d.objects.explosion'
)
    .requires(
        'game.scene3d.objects.mesh-object',
        'game.toybox.utils.uv-frame-animator'
    )
    .defines(function () {
        "use strict";
        ig.Explosion = ig.MeshObject.extend({

            uvAnimator: null,
            followZMesh: null,

            init: function () {
                this.parent(0, 0, 0, wgl.game.currentScene.getMeshByName("Explosion"), false, false);

                this.mesh.scaling.x = 2;
                this.mesh.scaling.y = 2;
                this.mesh.material.diffuseTexture = this.mesh.material.emissiveTexture;
                this.mesh.material.opacityTexture = this.mesh.material.emissiveTexture;

                this.uvAnimator = new ig.UVFrameAnimator(this.mesh.material.emissiveTexture, 3, 3, 0, 0)
                this.uvAnimator.setFrame(0);

                var fps = 16;
                this.uvAnimator.addAnimation("explode", [0, 1, 2, 3, 4, 5, 6, 7, 8], fps, false);
                this.uvAnimator.playAnimation("explode");
                this.mesh.isVisible = false;

                // console.log(this.mesh.material.emissiveTexture);

            },

            explode: function (x, y, z, followZMesh) {
                this.followZMesh = followZMesh;
                this.mesh.isVisible = true;
                this.mesh.position.set(x, y, z);
                this.uvAnimator.playAnimation("explode", true);
            },

            update: function (dt) {
                this.uvAnimator.update(dt);
                // this.mesh.rotation.x += dt
                // this.uvAnimator.currentAnim 
                if (this.uvAnimator.currentAnim && this.uvAnimator.currentAnim.isFinished) this.mesh.isVisible = false;
                if (this.followZMesh) this.mesh.position.z = this.followZMesh.position.z - 10;
            },

        });
    });
