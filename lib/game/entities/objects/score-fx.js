ig.module('game.entities.objects.score-fx')
    .requires(
        'impact.entity',
        'game.toybox.objects.ui.texts.text-field'
    )
    .defines(function () {
        EntityScoreFx = EntityTextField.extend({

            init: function (x, y, settings) {
                settings.text = "+" + settings.score;
                if (settings.score == 10) {
                    settings.text = _STRINGS.Game.Bullseye + "\n+" + settings.score
                }

                if (settings.score == 0) settings.text = _STRINGS.Game.Miss

                settings.anchorType = "top";
                settings.color = "#000000";
                settings.font = "70px mainfont";
                settings.align = "center";
                settings.entryType = "fadeJumpIn";
                settings.entryDelay = 0.5;

                settings.exitType = "fadeOut";
                settings.timedLife = 1;
                this.parent(0, 190, settings);
            },

            kill: function () {
                this.parent();
                this.callback();
            },

        });
    });