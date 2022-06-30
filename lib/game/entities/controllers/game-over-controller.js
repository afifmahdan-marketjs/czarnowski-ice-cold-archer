ig.module('game.entities.controllers.game-over-controller')
    .requires(
        'impact.entity',
        'game.toybox.objects.ui.buttons.simple-button',
        'game.toybox.controllers.controller'
    )
    .defines(function () {
        EntityGameOverController = EntityController.extend({

            playBtnImage: new ig.Image("media/graphics/game/small-play-btn.png"),
            homeBtnImage: new ig.Image("media/graphics/game/home-btn.png"),
            bgImg: new ig.Image('media/graphics/game/popup-bg.png'),
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.gameover);

                var bg = ig.game.spawnEntity(EntityGameObject, 270, 480, { anchorX: 0.5, anchorY: 0.5, image: this.bgImg, entryType: "fadeIn", exitType: "fadeOut" });
                ig.game.spawnEntity(EntityTextField, 270, 196 + 130, { font: "48px mainfont", text: _STRINGS.Game.GameOver, color: "#000000", align: "center", entryType: "fadeIn", exitType: "fadeOut" });
                // API_END_GAME
                var currentScore = ig.lastScore;

                if (currentScore > ig.game.sessionData.score) {
                    ig.game.sessionData.score = currentScore;
                    ig.game.saveAll();
                }


                ig.game.spawnEntity(EntityTextField, 270, 250 + 130, { font: "26px contentfont", text: _STRINGS.Game.Score, align: "center", entryType: "fadeIn", exitType: "fadeOut", color: "#000000" });
                ig.game.spawnEntity(EntityTextField, 270, 310 + 130, { font: "64px mainfont", text: "" + currentScore, align: "center", entryType: "fadeIn", exitType: "fadeOut", color: "#000000" });

                ig.game.spawnEntity(EntityTextField, 270, 360 + 130, { font: "26px contentfont", text: _STRINGS.Game.Best, align: "center", entryType: "fadeIn", exitType: "fadeOut", color: "#000000" });
                ig.game.spawnEntity(EntityTextField, 270, 410 + 130, { font: "48px mainfont", text: "" + ig.game.sessionData.score, align: "center", entryType: "fadeIn", exitType: "fadeOut", color: "#000000" });

                var playButton = ig.game.spawnEntity(EntitySimpleButton, 270 + 60, 480 + 130, { image: this.playBtnImage, entryType: "fadeIn", exitType: "fadeOut" });
                playButton.onClicked.add(this.onClickPlay, this);

                var homeButton = ig.game.spawnEntity(EntitySimpleButton, 270 - 60, playButton.anchoredPositionY, { image: this.homeBtnImage, entryType: "fadeIn", exitType: "fadeOut" });
                homeButton.onClicked.add(this.onClickHome, this);

                this.isAllowInput = true;
            },

            onClickPlay: function () {
                ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.click);
                ig.game.goToLevel("Gameplay");
            },

            onClickHome: function () {
                ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.click);
                ig.game.goToLevel("MainMenu");
            },

            update: function () {
                this.parent();

                if (ig.input.state("jump") && this.isAllowInput) {
                    this.isAllowInput = false
                    this.onClickPlay();
                }
            },

            draw: function () {
                this.parent();

                var ctx = ig.system.context;
                ctx.clearRect(0, 0, ig.system.width, ig.system.height);
                // ctx.save();
                // ctx.fillStyle = "#f8c85c";
                // ctx.fillRect(0, 0, ig.system.width, ig.system.height);
                // ctx.restore();
            },
        });
    });