ig.module('game.entities.buttons.button-retry')
    .requires(
        'game.entities.buttons.button'
    )
    .defines(function () {
        EntityButtonRetry = EntityButton.extend({

            fillColor: "rgba(255,255,0,1)",
            altColor: "rgba(255,255,0,1)",
            textColor: "rgba(255,255,255,1)",
            size: new BABYLON.Vector2(50, 50),
            text: "Retry",
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
                ig.game.score = 0;
                console.log("clicked")
                wgl.game.reloadLevel();
                ig.game.director.jumpTo(LevelWebglGame);
            },
            clicking: function () {

            },
            released: function () {
                this.fillColor = this.oriColor;
                console.log("released")
            }

        });
    });