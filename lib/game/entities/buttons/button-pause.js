ig.module('game.entities.buttons.button-pause')
    .requires(
        'game.entities.buttons.button'
    )
    .defines(function () {
        EntityButtonPause = EntityButton.extend({

            oriColor: "rgba(255,255,0,1)",
            altColor: "rgba(255,0,0,1)",

            fillColor: "rgba(255,0,0,1)",
            textColor: "rgba(255,255,255,1)",
            ignorePause: true,
            size: new BABYLON.Vector2(50, 50),
            text: "Pause",
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                if (ig.responsive) this.anchorType = "default";
            },

            update: function () {
                this.parent();
            },

            draw: function () {
                this.parent();
                var ctx = ig.system.context;
                ctx.fillStyle = this.fillColor;
                ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);

                ctx.textAlign = "center";
                ctx.fillStyle = this.textColor;
                ctx.fillText(this.text, this.pos.x + (this.size.y >>> 1), this.pos.y + (this.size.y >>> 1));
                ctx.textAlign = "start";
            },

            clicked: function () {
                this.fillColor = this.altColor;
                console.log("clicked")
                ig.game.paused = !ig.game.paused;

                if (ig.game.paused) {
                    wgl.system.stopRender();
                }
                else {
                    wgl.system.startRender();
                }
            },
            clicking: function () {

            },
            released: function () {
                this.fillColor = this.oriColor;
                console.log("released")
            }

        });
    });