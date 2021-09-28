ig.module('game.entities.controllers.main-menu-settings-controller')
    .requires(
        'impact.entity',
        'game.toybox.controllers.controller',
        'game.toybox.objects.game-object',
        'game.toybox.objects.ui.buttons.simple-button',
        'game.entities.popups.settings-popup'
    )
    .defines(function () {
        EntityMainMenuSettingsController = EntityController.extend({

            init: function (x, y, settings) {
                this.parent(x, y, settings);

                this.delayedCall(0.1, function () {
                    this.showPopup(EntitySettingsPopup);
                }.bind(this))
            },

            onPopupFinished: function (name) {
                this.parent(name);
                if (!this.isAllowInput) return;
                this.isAllowInput = false;
                setTimeout(function () {
                    ig.game.backFromSettings = true;
                    ig.game.goToLevel("MainMenu");
                }.bind(this), 100);
            },

            update: function () {
                this.parent();
            },

            draw: function () {
                this.parent();

                var ctx = ig.system.context;
                ctx.clearRect(0, 0, ig.system.width, ig.system.height);
            },
        });
    });