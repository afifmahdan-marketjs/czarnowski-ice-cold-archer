ig.module('game.toybox.objects.ui.buttons.simple-button')
    .requires(
        'game.toybox.objects.game-object'
    )
    .defines(function () {

        EntitySimpleButton = EntityGameObject.extend({
            originalX: 0,
            originalY: 0,
            transitionInDelay: 0,
            zIndex: 7000,

            text: "",
            font: "48px Arial",
            textColor: "#FFFFFF",
            align: "center",
            offsetX: 0,
            offsetY: 0,

            anchorX: 0.5,
            anchorY: 0.5,

            lineSpacing: 1,
            valign: "center",

            enableShadow: false,
            shadowColor: "#000000",
            shadowOffsetX: 0,
            shadowOffsetY: 4,
            shadowAlpha: 0.4,

            outlineWeight: 0,
            outlineColor: "#000000",
            outlineCap: "square",
            outlineJoin: "bevel",

            normalScale: 1,

            usePressedTween: true,

            textRenderer: null,
            forceDraw: true,

            init: function (x, y, settings) {
                this.parent(x, y, settings);
                this.textRenderer = new ig.TextRenderer();
                if (settings.textString) throw new Error("old text field detected")
            },

            update: function () {
                this.parent();
                if (this.usePressedTween) {
                    if (this.visible) {
                        var targetScale = 0.9 * this.normalScale;
                        var targetScaleX = 0.9 * this.normalScale;
                        var targetScaleY = 0.9 * this.normalScale;
                        if (this.hasTouchInside) targetScale = 0.9 * this.normalScale;
                        else targetScale = this.normalScale;

                        if (this.scaleX < 0) targetScaleX = -1 * targetScale;
                        else targetScaleX = targetScale;

                        if (this.scaleY < 0) targetScaleY = -1 * targetScale;
                        else targetScaleY = targetScale;

                        this.scaleX += (targetScaleX - this.scaleX) / 3;
                        this.scaleY += (targetScaleY - this.scaleY) / 3;
                    }
                }
            },

            drawObject: function (x, y) {
                this.parent(x, y);
                if (this.visible) {
                    this.textRenderer.text = this.text;
                    this.textRenderer.font = this.font;
                    this.textRenderer.color = this.textColor;
                    this.textRenderer.alpha = this.alpha;
                    this.textRenderer.align = this.align;
                    this.textRenderer.offsetX = this.offsetX;
                    this.textRenderer.offsetY = this.offsetY;
                    this.textRenderer.lineSpacing = this.lineSpacing;
                    this.textRenderer.valign = this.valign;

                    this.textRenderer.enableShadow = this.enableShadow;
                    this.textRenderer.shadowAlpha = this.shadowAlpha;
                    this.textRenderer.shadowColor = this.shadowColor;
                    this.textRenderer.shadowOffsetX = this.shadowOffsetX;
                    this.textRenderer.shadowOffsetY = this.shadowOffsetY;

                    this.textRenderer.outlineWeight = this.outlineWeight;
                    this.textRenderer.outlineColor = this.outlineColor;
                    this.textRenderer.outlineCap = this.outlineCap;
                    this.textRenderer.outlineJoin = this.outlineJoin;

                    this.textRenderer.draw(x + this.width / 2, y + this.height / 2);
                }
            },

            onFinishEntering: function () {
                this.inputEnabled = true;
            }
        });
    });