ig.module('game.entities.popups.settings-popup')
    .requires(
        'game.toybox.objects.ui.popups.popup',
        'game.toybox.objects.ui.buttons.simple-button',
        'game.toybox.objects.ui.texts.text-field'
    )
    .defines(function () {
        EntitySettingsPopup = EntityPopup.extend({

            bgImg: new ig.Image('media/graphics/game/popup-bg.png'),
            homeBtnImg: new ig.Image('media/graphics/game/home-btn.png'),

            toggleOffImg: new ig.Image('media/graphics/game/button-off.png'),
            toggleOnImg: new ig.Image('media/graphics/game/button-on.png'),

            homeButton: null,
            bgmButton: null,
            sfxButton: null,
            title: null,

            exitDelay: 0,
            exitDuration: 0.25,

            init: function (x, y, settings) {
                this.parent(x, y, settings);
                var bg = this.spawnMember(EntityGameObject, 270, 480, { image: this.bgImg, anchorX: 0.5, anchorY: 0.5, entryType: "fadeIn", exitType: "fadeOut", zIndex: 0 });

                var baseX = bg.anchoredPositionX;
                var baseY = bg.anchoredPositionY;
                this.title = this.spawnMember(EntityTextField, baseX + 15, baseY - 135, { zIndex: 7000, anchorX: 0.5, anchorY: 0.5, text: _STRINGS.Game.Settings, font: "48px mainfont", align: "center", color: "#000000", entryType: "fadeIn", exitType: "fadeOut" })

                this.homeButton = this.spawnMember(EntitySimpleButton, baseX, baseY + 130, { image: this.homeBtnImg, entryType: "fadeIn", exitType: "fadeOut" });
                this.homeButton.onClicked.addOnce(this.onClickHome, this);

                this.bgmButton = this.spawnMember(EntitySimpleButton, baseX, baseY - 80, { image: this.toggleOnImg, text: "", font: "36px mainfont", align: "center", color: "#ffffff", offsetY: -5, entryType: "fadeIn", exitType: "fadeOut" });
                this.bgmButton.onClicked.add(this.onValueToggleBgm, this);

                this.sfxButton = this.spawnMember(EntitySimpleButton, baseX, baseY + 20, { image: this.toggleOnImg, text: "", font: "36px mainfont", align: "center", color: "#ffffff", offsetY: -5, entryType: "fadeIn", exitType: "fadeOut" });
                this.sfxButton.onClicked.add(this.onValueToggleSfx, this);

                ig.game.sortEntitiesDeferred();

                this.refreshToggleButton();
            },

            refreshToggleButton: function () {
                if (ig.game.sessionData.music > 0) {
                    this.bgmButton.swapImage(this.toggleOnImg)
                    this.bgmButton.text = _STRINGS.Game.BgmOn
                    this.bgmButton.textColor = "#000000"
                } else {
                    this.bgmButton.swapImage(this.toggleOffImg)
                    this.bgmButton.text = _STRINGS.Game.BgmOff
                    this.bgmButton.textColor = "#ffffff"
                }

                if (ig.game.sessionData.sound > 0) {
                    this.sfxButton.swapImage(this.toggleOnImg)
                    this.sfxButton.text = _STRINGS.Game.SfxOn
                    this.sfxButton.textColor = "#000000"
                } else {
                    this.sfxButton.swapImage(this.toggleOffImg)
                    this.sfxButton.text = _STRINGS.Game.SfxOff
                    this.sfxButton.textColor = "#ffffff"
                }

            },
            onValueToggleSfx: function () {
                if (ig.game.sessionData.sound > 0) {
                    ig.game.sessionData.sound = 0;
                } else {
                    ig.game.sessionData.sound = ig.game.sfxDefaultVolume;
                }
                ig.game.saveAll();
                ig.soundHandler.sfxPlayer.volume(ig.game.sessionData.sound);
                ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.click);
                this.refreshToggleButton();
            },

            onValueToggleBgm: function () {
                if (ig.game.sessionData.music > 0) {
                    ig.game.sessionData.music = 0;
                } else {
                    ig.game.sessionData.music = ig.game.bgmDefaultVolume;
                }
                ig.game.saveAll();
                ig.soundHandler.bgmPlayer.volume(ig.game.sessionData.music);
                ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.click);
                this.refreshToggleButton();
            },

            onClickHome: function () {
                if (!this.isAllowInput) return;
                this.isAllowInput = false;
                this.exit();
                ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.click);
            },
        });
    });