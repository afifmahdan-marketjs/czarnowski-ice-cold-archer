ig.module('game.toybox.objects.ui.buttons.volume-slider-button')
    .requires(
        'game.toybox.objects.ui.buttons.slider-button',
        'game.toybox.objects.ui.buttons.simple-button',
        'game.toybox.objects.game-object'
    )
    .defines(function () {
        EntityVolumeSliderButton = EntitySliderButton.extend({
            indicatorOffsetX: 0,
            indicatorOffsetY: 0,
            xMin: 22,
            xMax: 180,

            anchorX: 0,
            anchorY: 0,


            usePressedTween: false,

            indicatorImage: new ig.Image('media/graphics/sprites/slider-knob.png'),
            fillImage: new ig.Image('media/graphics/sprites/slider-bar.png'),
            init: function (x, y, settings) {
                this.parent(x, y, settings);
            },

            drawObject: function (x, y) {
                this.parent(x, y);
                var span = this.xMax - this.xMin - this.indicator.width;
                var ctx = ig.system.context;
                ctx.save();
                ctx.globalAlpha = this.alpha;

                var fillWidth = this.indicator.pos.x - this.pos.x;
                if (fillWidth < 10) fillWidth = 10;
                this.fillImage.draw(x, y, 0, 0, fillWidth, this.fillImage.height);
                ctx.globalAlpha = 1;
                ctx.restore();
            },

        });
    });