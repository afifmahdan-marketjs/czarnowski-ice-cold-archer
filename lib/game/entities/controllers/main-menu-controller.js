ig.module('game.entities.controllers.main-menu-controller')
    .requires(
        'impact.entity'
    )
    .defines(function () {
        EntityMainMenuController = ig.Entity.extend({

            zIndex: 0,

            init: function (x, y, settings) {
                this.parent(x, y, settings);
                if (ig.global.wm) {
                    return;
                }
                wgl.game.reloadLevel();
            },

            update: function () {
                this.parent();
                if (wgl.game.ready === false) {
                    return;
                }
            },

            draw: function () {
                this.parent();
                if (ig.global.wm) {
                    return;
                }

                var ctx = ig.system.context;
                ctx.clearRect(0, 0, ig.system.width, ig.system.height);
            },
        });
    });