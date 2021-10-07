ig.module('game.entities.buttons.button-more-games')
	.requires(
		'game.entities.buttons.button'
		, 'plugins.clickable-div-layer'
	)
	.defines(function () {
		EntityButtonMoreGames = EntityButton.extend({
			type: ig.Entity.TYPE.A,
			gravityFactor: 0,
			logo: new ig.AnimationSheet('media/graphics/game/more-games-btn.png', 64, 66),
			size: {
				x: 64,
				y: 66,
			},
			zIndex: 750,
			clickableLayer: null,
			link: null,
			newWindow: false,
			div_layer_name: "more-games",
			name: "moregames",
			init: function (x, y, settings) {
				this.parent(x, y, settings);
				if (ig.global.wm) {
					return;
				}

				if (ig.responsive) this.anchorType = "default";
				if (settings.div_layer_name) {
					//console.log('settings found ... using that div layer name')
					this.div_layer_name = settings.div_layer_name;
				}
				else {
					this.div_layer_name = 'more-games'
				}

				if (_SETTINGS.MoreGames.Enabled) {
					this.anims.idle = new ig.Animation(this.logo, 0, [0], true);
					this.currentAnim = this.anims.idle;

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
				this.clickableLayer.update(this.pos.x, this.pos.y, this.size.x, this.size.y)
			},

			show: function () {
				var elem = ig.domHandler.getElementById("#" + this.div_layer_name);
				ig.domHandler.show(elem);
			},
			hide: function () {
				var elem = ig.domHandler.getElementById("#" + this.div_layer_name);
				ig.domHandler.hide(elem);
			},
			clicked: function () {

			},
			clicking: function () {

			},
			released: function () {

			}
		});
	});