ig.module('game.entities.buttons.button-start')
    .requires(
        'game.entities.buttons.button'
    )
    .defines(function () {
        EntityButtonStart = EntityButton.extend({

            oriColor: "rgba(255,255,0,1)",
            altColor: "rgba(255,0,0,1)",

            fillColor: "rgba(255,0,0,1)",
            textColor: "rgba(255,255,255,1)",

            size: new BABYLON.Vector2(64, 66),
            text: "Start",
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                //console.log(wgl.game.currentScene);
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
                /*
                var clickPos = ig.game.io.getClickPos();
                //console.log(clickPos)
                ctx.fillStyle=this.fillColor;
                ctx.fillRect(clickPos.x,clickPos.y,40,40);
                ctx.font="50px Arial"
                ctx.fillStyle=this.textColor;
                ctx.fillText(ig.sizeHandler.scaleRatioMultiplier.x+":"+ig.sizeHandler.scaleRatioMultiplier.y,
                    clickPos.x-20,clickPos.y-20);
                */

            },

            clicked: function () {
                this.fillColor = this.altColor;
                //console.log("clicked")

                wgl.game.reloadLevel();
                ig.game.director.jumpTo(LevelWebglGame);
            },
            clicking: function () {

            },
            released: function () {
                this.fillColor = this.oriColor;
                //console.log("released")
            }

        });
    });