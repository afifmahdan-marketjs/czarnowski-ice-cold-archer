ig.module(
    'game.scene3d.objects.mesh-object'
)
    .requires(

    )
    .defines(function () {
        "use strict";
        ig.MeshObject = ig.Class.extend({

            mesh: null,
            timedLife: -1,
            init: function (x, y, z, sourceMesh, clone, instance) {
                if (clone) {
                    this.mesh = sourceMesh.clone("clonedMesh");
                    this.mesh.sourceName = sourceMesh.name;
                } else if (instance) {
                    this.mesh = sourceMesh.createInstance("meshInstance");
                } else {
                    this.mesh = sourceMesh;
                }

                this.mesh.position.set(x, y, z);
            },

            update: function () {
                var dt = ig.system.tick;

                if (this.timedLife > 0) {
                    this.timedLife -= dt;
                    if (this.timedLife <= 0) {
                        this.destroy();
                    }
                }
            },

            destroy: function () {
                this.mesh.dispose();
            }

        });
    });
