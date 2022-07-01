ig.module('game.entities.objects.score-fx')
    .requires(
        'impact.entity',
        'game.toybox.objects.ui.texts.text-field'
    )
    .defines(function () {
        EntityScoreFx = EntityTextField.extend({

            rectOffsetScaleX: -1,
            rectScale: 0.05,
            rectAlpha: 1,
            double: false,
            init: function (x, y, settings) {
                settings.text = "+" + settings.score;
                if (settings.score == 10) {
                    settings.text = _STRINGS.Game.Bullseye + "\n+" + settings.score;
                    this.double = true;
                }

                if (settings.score == 0) settings.text = _STRINGS.Game.Miss;

                settings.anchorType = "bottom";
                settings.color = "#000000";
                settings.font = "70px mainfont";
                settings.align = "center";
                settings.entryType = "fadeJumpIn";
                settings.entryDelay = 0.4;

                settings.exitType = "fadeOut";
                settings.timedLife = 1;

                this.parent(0, -200, settings);
                // this.tween({ rectOffsetScaleX: 0 }, 0.15, { easing: ig.Tween.Easing.Quartic.EaseIn }).start();
                this.tween({ rectOffsetScaleX: 0 }, 0.15).start();
                this.tween({ rectScale: 1 }, 0.2, { easing: ig.Tween.Easing.Quadratic.EaseIn, delay: 0.3 }).start();

                this.delayedCall(0.4, function () {
                    if (this.score == 0) {
                        // ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.crowdMiss);
                        ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.scoreMiss);
                    } else if (this.score > 8) {
                        // ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.crowdCheers);
                        ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.scoreHigh);
                    } else {
                        // ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.crowdApplause);
                        ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.scoreLow);
                    }
                }.bind(this))
            },

            drawObject: function (x, y) {
                var ctx = ig.system.context;
                var w = ig.system.width;
                var h = 100 * this.rectScale;
                var offsetY = -15;
                var offsetX = this.rectOffsetScaleX * ig.system.width;
                if (this.double) {
                    h *= 2;
                    offsetY = 15;
                }

                if (this.timedLife < 0) this.rectAlpha = this.alpha;

                var outline = 5;
                var shadow = 10;
                ctx.globalAlpha = this.rectAlpha;
                ctx.fillStyle = "#000000";
                ctx.fillRect(-w / 2 + offsetX, -h / 2 - outline + offsetY, w, h + outline * 2);
                ctx.fillStyle = "#fc594d";
                ctx.fillRect(-w / 2 + offsetX, -h / 2 + offsetY, w, h);
                ctx.fillStyle = "#ffbc42";
                ctx.fillRect(-w / 2 + offsetX, -h / 2 + offsetY, w, h - shadow);
                this.globalAlpha = 1;
                this.parent(x, y)
            },

            kill: function () {
                this.parent();
                this.callback();
            },

        });
    });