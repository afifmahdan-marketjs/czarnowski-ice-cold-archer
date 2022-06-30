ig.module('game.entities.popups.pause-popup')
    .requires(
        'game.entities.popups.settings-popup'
    )
    .defines(function () {
        EntityPausePopup = EntitySettingsPopup.extend({
            resumeBtnImg: new ig.Image('media/graphics/game/small-play-btn.png'),
            replayBtnImg: new ig.Image('media/graphics/game/replay-btn.png'),
            showCover: false,
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                this.resumeButton = this.spawnMember(EntitySimpleButton, 270, this.homeButton.anchoredPositionY, { usePressedTween: true, image: this.resumeBtnImg, anchorX: 0.5, anchorY: 0.5, entryType: "fadeIn", exitType: "fadeOut", entryDuration: 0.25, exitDuration: 0.25 });
                this.resumeButton.onClicked.addOnce(this.onClickResume, this)
                this.replayButton = this.spawnMember(EntitySimpleButton, 270 + 110, this.homeButton.anchoredPositionY, { usePressedTween: true, image: this.replayBtnImg, anchorX: 0.5, anchorY: 0.5, entryType: "fadeIn", exitType: "fadeOut", entryDuration: 0.25, exitDuration: 0.25 });
                this.replayButton.onClicked.addOnce(this.onClickReplay, this)
                this.homeButton.anchoredPositionX = 270 - 110;
                this.title.text = _STRINGS.Game.Paused;
                ig.game.sortEntitiesDeferred();
            },

            update: function () {
                this.parent();
            },

            draw: function () {
                this.parent();
                if (this.showCover) {
                    var ctx = ig.system.context;
                    ctx.save();
                    ctx.fillStyle = "#f8c85c";
                    ctx.fillRect(0, 0, ig.system.width, ig.system.height);
                    ctx.restore();
                }
            },

            onClickHome: function () {
                if (!this.isAllowInput) return;
                this.showCover = true;
                ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.click);
                this.isAllowInput = false;
                ig.babylonSceneController.paused = true;

                this.delayedCall(0.1, function () {
                    ig.game.goToLevel("MainMenu");

                }.bind(this))
                for (var i = 0; i < this.members.length; i++) {
                    this.members[i].exit();
                }

            },

            onClickResume: function () {
                if (!this.isAllowInput) return;
                this.isAllowInput = false;
                this.exit();
                ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.click);
            },

            onClickReplay: function () {
                if (!this.isAllowInput) return;
                this.showCover = true;
                ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.click);
                this.isAllowInput = false;
                ig.babylonSceneController.paused = true;

                this.delayedCall(0.1, function () {
                    ig.game.goToLevel("Gameplay");

                }.bind(this))
                for (var i = 0; i < this.members.length; i++) {
                    this.members[i].exit();
                }
            },
        });
    });