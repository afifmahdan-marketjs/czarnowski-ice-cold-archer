ig.module('game.entities.controllers.game-over-controller')
    .requires(
        'impact.entity',
        'game.toybox.objects.ui.buttons.simple-button',
        'game.toybox.controllers.controller'
    )
    .defines(function () {
        EntityGameOverController = EntityController.extend({

            playBtnImage: new ig.Image("media/graphics/game/play-btn.png"),
            homeBtnImage: new ig.Image("media/graphics/game/home-btn.png"),
            scoreBgImage: new ig.Image("media/graphics/game/score-bg.png"),
            bestBgImage: new ig.Image("media/graphics/game/best-bg.png"),
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.gameover);
                ig.game.spawnEntity(EntityTextField, 270, 250, { font: "72px mainfont", text: _STRINGS.Game.GameOver, align: "center", entryType: "fadeIn", exitType: "fadeOut" });
                // API_END_GAME
                var currentScore = ig.lastScore;

                if (currentScore > ig.game.sessionData.score) {
                    ig.game.sessionData.score = currentScore;
                    ig.game.saveAll();
                }

                var bgScore = ig.game.spawnEntity(EntityGameObject, 270, 350, { anchorX: 0.5, anchorY: 0.5, image: this.scoreBgImage, entryType: "fadeIn", exitType: "fadeOut" });
                var bgBest = ig.game.spawnEntity(EntityGameObject, 270, 470, { anchorX: 0.5, anchorY: 0.5, image: this.bestBgImage, entryType: "fadeIn", exitType: "fadeOut" });

                ig.game.spawnEntity(EntityTextField, 100, bgScore.anchoredPositionY + 13, { font: "40px mainfont", text: _STRINGS.Game.Score, align: "left", entryType: "fadeIn", exitType: "fadeOut", color: "#ed0049" });
                ig.game.spawnEntity(EntityTextField, 100, bgBest.anchoredPositionY + 13, { font: "40px mainfont", text: _STRINGS.Game.Best, align: "left", entryType: "fadeIn", exitType: "fadeOut" });

                ig.game.spawnEntity(EntityTextField, 440, bgScore.anchoredPositionY + 22, { font: "64px mainfont", text: "" + currentScore, align: "right", entryType: "fadeIn", exitType: "fadeOut", color: "#ed0049" });
                ig.game.spawnEntity(EntityTextField, 440, bgBest.anchoredPositionY + 22, { font: "64px mainfont", text: "" + ig.game.sessionData.score, align: "right", entryType: "fadeIn", exitType: "fadeOut" });

                var playButton = ig.game.spawnEntity(EntitySimpleButton, 270 + 70, 600, { image: this.playBtnImage, entryType: "fadeIn", exitType: "fadeOut" });
                playButton.onClicked.add(this.onClickPlay, this);

                var homeButton = ig.game.spawnEntity(EntitySimpleButton, 270 - 70, 600, { image: this.homeBtnImage, entryType: "fadeIn", exitType: "fadeOut" });
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