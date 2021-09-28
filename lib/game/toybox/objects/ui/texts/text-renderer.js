ig.module('game.toybox.objects.ui.texts.text-renderer')
    .requires(
        'impact.impact'
    )
    .defines(function () {
        "use strict";
        ig.TextRenderer = ig.Class.extend({
            text: "",
            font: "48px Arial",
            color: "#000000",
            alpha: 1,
            align: "start",
            offsetX: 0,
            offsetY: 0,
            lineSpacing: 1,
            valign: "default",

            enableShadow: false,
            shadowColor: "#000000",
            shadowOffsetX: 0,
            shadowOffsetY: 4,
            shadowAlpha: 1,

            outlineWeight: 0,
            outlineColor: "#000000",
            outlineCap: "square",
            outlineJoin: "bevel",

            _previousText: "",
            _multiline: false,
            _lines: [],
            _lineHeightInPixel: 0,

            init: function (param) { },

            draw: function (x, y) {
                if (!(x !== undefined)) x = 0;
                if (!(y !== undefined)) y = 0;

                if (this.enableShadow) {
                    this.drawText(x + this.shadowOffsetX, y + this.shadowOffsetY, this.shadowAlpha * this.alpha, this.shadowColor, this.shadowColor)
                    this.drawText(x, y, this.alpha, this.color, this.outlineColor)
                } else {
                    this.drawText(x, y, this.alpha, this.color, this.outlineColor)
                }
            },

            drawText: function (x, y, alpha, color, outlineColor) {
                if (this.text.length > 0) {
                    if (this._previousTextString != this.text) {
                        this._previousTextString = this.text;
                        this._lines = this.text.split(/\r?\n/);
                        if (this._lines.length > 1) {
                            this._multiline = true;
                        } else {
                            this._multiline = false;
                        }
                        this._lineHeightInPixel = parseInt(this.font.split("px")[0].split(" ").pop()) * this.lineSpacing;
                        if (isNaN(this._lineHeightInPixel)) console.error("'" + this.font + "' is a wrong font string format, error when rendering " + this.text)
                    }

                    var ctx = ig.system.context;
                    ctx.save();
                    ctx.font = this.font;
                    ctx.textAlign = this.align;
                    ctx.lineWidth = this.outlineWeight * 2;
                    ctx.lineCap = this.outlineCap;
                    ctx.lineJoin = this.outlineJoin;
                    ctx.miterLimit = this.outlineWeight * 2;

                    if (alpha < 1) {
                        var rgb = ig.hexToRgb(color)
                        ctx.fillStyle = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + alpha + ")";

                        rgb = ig.hexToRgb(outlineColor)
                        ctx.strokeStyle = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + alpha + ")";
                    } else {
                        ctx.fillStyle = color;
                        ctx.strokeStyle = outlineColor;
                    }

                    var xpos = x + this.offsetX;
                    var ypos = y + this.offsetY;

                    if (this._multiline) {
                        //TODO: apply multiline with various alignment
                        var startLine = ypos;
                        if (this.valign == "center") {
                            startLine = ypos - (this._lines.length - 1) * this._lineHeightInPixel / 2;
                        }

                        for (var index = 0; index < this._lines.length; index++) {
                            var line = this._lines[index];
                            if (this.outlineWeight > 0) ctx.strokeText(line, xpos, startLine + index * this._lineHeightInPixel);
                            ctx.fillText(line, xpos, startLine + index * this._lineHeightInPixel);
                            // console.log(line, xpos, startLine + index, this._lineHeightInPixel)
                        }
                    } else {
                        if (this.valign == "center") ypos += this._lineHeightInPixel / 2
                        if (this.outlineWeight > 0) ctx.strokeText(this.text, xpos, ypos);
                        ctx.fillText(this.text, xpos, ypos);
                    }
                    ctx.restore();
                }
            },

            measureTextWidth: function () {
                var ctx = ig.system.context;
                ctx.save();
                ctx.font = this.font;
                ctx.textAlign = "left";
                var measure = ctx.measureText(this.text);
                ctx.restore();
                return measure.width;
            }
        });
    });