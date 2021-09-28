ig.module('game.toybox.objects.ui.texts.text-field')
    .requires(
        'game.toybox.objects.game-object'
    )
    .defines(function () {
        EntityTextField = EntityGameObject.extend({
            text: "",
            font: "48px Arial",
            color: "#FFFFFF",
            align: "start",
            offsetX: 0,
            offsetY: 0,
            lineSpacing: 1,
            valign: "top",

            textRenderer: null,
            forceDraw: true,

            enableShadow: false,
            shadowColor: "#000000",
            shadowOffsetX: 0,
            shadowOffsetY: 4,
            shadowAlpha: 0.4,

            outlineWeight: 0,
            outlineColor: "#000000",
            outlineCap: "square",
            outlineJoin: "bevel",

            zIndex: 7000,
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                this.textRenderer = new ig.TextRenderer();
            },

            drawObject: function (x, y) {
                this.parent(x, y)
                if (this.visible) {
                    this.applyProperties();
                    this.textRenderer.draw(x, y);
                }
            },


            applyProperties: function () {
                this.textRenderer.text = this.text;
                this.textRenderer.font = this.font;
                this.textRenderer.color = this.color;
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
            },

            getTextWidth: function () {
                this.applyProperties();
                return this.textRenderer.measureTextWidth();
            }
        });
    });