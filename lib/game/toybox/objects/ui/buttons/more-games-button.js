ig.module('game.toybox.objects.ui.buttons.more-games-button')
    .requires(
        'game.toybox.objects.ui.buttons.simple-button',
        'plugins.clickable-div-layer'
    )
    .defines(function () {

        EntityMoreGamesButton = EntitySimpleButton.extend({


            clickableLayer: null,
            link: null,
            newWindow: false,
            div_layer_name: "more-games",
            name: "moregames",
            singleFrameImage: new ig.Image("media/graphics/game/ui/button.png"),
            entryType: "fadeJumpIn",
            entryDelay: 0.2,

            init: function (x, y, settings) {
                this.parent(x, y, settings);

                //ig.soundHandler.unmuteAll(true);


            },
            show: function () {
                var elem = ig.domHandler.getElementById("#" + this.div_layer_name);
                ig.domHandler.show(elem);
            },
            hide: function () {
                var elem = ig.domHandler.getElementById("#" + this.div_layer_name);
                ig.domHandler.hide(elem);
            },

            onFinishEntering: function () {
                this.parent();
                if (ig.global.wm) {
                    return;
                }

                if (_SETTINGS.MoreGames.Enabled) {
                    if (_SETTINGS.MoreGames.Link) {
                        this.link = _SETTINGS.MoreGames.Link;
                    }
                    if (_SETTINGS.MoreGames.NewWindow) {
                        this.newWindow = _SETTINGS.MoreGames.NewWindow;
                    }
                    this.clickableLayer = new ClickableDivLayer(this);
                }
                else {
                    this.kill();
                }
            },

            update: function () {
                this.parent();
                // this.clickableLayer.update(this.pos.x, this.pos.y)
            }
        });
    });