ig.module('game.entities.controllers.tutorial-controller')
    .requires(
        'impact.entity',
        'game.toybox.objects.ui.buttons.simple-button',
        'game.toybox.controllers.controller'
    )
    .defines(function () {
        EntityTutorialController = EntityController.extend({

            init: function (x, y, settings) {
                this.parent(x, y, settings);

                for (var i = 0; i < 4; i++) {
                    var tf = ig.game.spawnEntity(EntityTextField, 270, 250 + i * 60, { font: "38px mainfont", text: "", align: "center", entryType: "fadeIn", exitType: "fadeOut", enableShadow: true, shadowColor: "#f36d61" });
                    if (ig.ua.mobile) tf.text = _STRINGS.Game.TutorialMobile[i];
                    else tf.text = _STRINGS.Game.TutorialDesktop[i]

                    if (i == 3) tf.anchoredPositionY = 650
                }

                this.isAllowInput = true;
                ig.gameScene3D.paused = true;
                ig.gameScene3D.player.mesh.isVisible = false;
            },

            update: function () {
                this.parent();
                if (ig.ua.mobile) {
                    if (this.isClicking && this.isAllowInput) {
                        this.isAllowInput = false
                        this.onClickPlay();
                    }
                } else {
                    if (ig.input.state("jump") && this.isAllowInput) {
                        this.isAllowInput = false
                        this.onClickPlay();
                    }
                }
            },

            onClickPlay: function () {
                ig.game.goToLevel("Gameplay");
            },

            timer: 1,

            draw: function () {
                this.parent();

                var ctx = ig.system.context;
                ctx.clearRect(0, 0, ig.system.width, ig.system.height);

                if (ig.ua.mobile) {
                    this.timer -= ig.system.tick / 2;
                    if (this.timer < 0) this.timer = 1;

                    ctx.save();
                    ctx.fillStyle = "rgba(255,255,255,0.2)";
                    if (this.timer < 0.5) {
                        ctx.fillRect(0, 0, ig.system.width / 2, ig.system.height);
                    } else {
                        ctx.fillRect(ig.system.width / 2, 0, ig.system.width / 2, ig.system.height);
                    }

                    ctx.restore();
                }
            },
        });
    });