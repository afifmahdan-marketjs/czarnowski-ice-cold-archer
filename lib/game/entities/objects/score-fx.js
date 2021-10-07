ig.module('game.entities.objects.score-fx')
    .requires(
        'impact.entity',
        'game.toybox.objects.ui.texts.text-field'
    )
    .defines(function () {
        EntityScoreFx = EntityTextField.extend({

            init: function (x, y, settings) {
                settings.text = "+" + settings.score;

                if (settings.score == 0) settings.text = "MISS!"

                settings.anchorType = "top";
                settings.color = "#000000";
                settings.font = "70px mainfont";
                settings.align = "center";
                settings.entryType = "fadeJumpIn";
                settings.entryDelay = 0.5;

                settings.exitType = "fadeOut";
                settings.timedLife = 1;
                this.parent(0, 180, settings);
            },

            kill: function () {
                this.parent();
                this.callback();
            },

        });
    });