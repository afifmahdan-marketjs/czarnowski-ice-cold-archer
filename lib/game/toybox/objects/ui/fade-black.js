ig.module('game.toybox.objects.ui.fade-black')

    .requires(
        'game.toybox.objects.game-object'
    )

    .defines(function () {

        ig.hasFadeBlack = false;

        EntityFadeBlack = EntityGameObject.extend({
            zIndex: 99999,
            isIn: false,
            nextLevelID: -1,
            rectColor: "#000000",
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                this.size.x = ig.system.width;
                this.size.y = ig.system.height;
                ig.game.sortEntitiesDeferred();
            },

            enter: function () {
                this.visible = true;
                var duration = 0.35;
                if (this.isIn) {
                    this.alpha = 0;
                    this.tween({ alpha: 1 }, duration, {
                        easing: ig.Tween.Easing.Quadratic.EaseIn, onComplete: function () {
                            if (this.nextLevelID >= 0) ig.game.director.loadLevel(this.nextLevelID);
                        }.bind(this)
                    }).start();
                } else {
                    this.alpha = 1;
                    this.tween({ alpha: 0 }, duration, {
                        easing: ig.Tween.Easing.Quadratic.EaseOut, onComplete: function () {
                            this.kill()
                        }.bind(this)
                    }).start();
                }

            },

            drawObject: function (x, y) {
                if (this.visible) {
                    var ctx = ig.system.context;
                    ctx.save();
                    var color = this.rectColor;
                    if (this.alpha < 1) {
                        ctx.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + this.alpha + ")";
                    } else {
                        ctx.fillStyle = color.hex;
                    }
                    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
                    ctx.restore();
                }
                this.parent(x, y);
            }
        });

        ig.dropCurtain = function (nextLevelID) {
            if (nextLevelID === undefined) nextLevelID = -1;
            ig.hasFadeBlack = true;
            ig.game.spawnEntity(EntityFadeBlack, 0, 0, { isIn: true, nextLevelID: nextLevelID });
        };

        ig.liftCurtain = function () {
            ig.hasFadeBlack = false;
            ig.game.spawnEntity(EntityFadeBlack, 0, 0, { isIn: false });
        };
    });