ig.module(
    'game.scene3d.objects.arrow'
)
    .requires(
        'game.scene3d.objects.mesh-object'
    )
    .defines(function () {
        "use strict";
        ig.Target = ig.MeshObject.extend({

            init: function () {
                this.parent(0, 0, 0, ig.meshManager.target, false, false)
                this.reset();
                this.onLanded = new ig.Signal();
            },

            update: function (dt) {
                this.parent(dt);
                console.log('sdsd');
            },
        });
    });
