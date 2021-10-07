ig.module('game.entities.popups.settings-popup')
    .requires(
        'game.toybox.objects.ui.popups.popup',
        'game.toybox.objects.ui.buttons.simple-button',
        'game.toybox.objects.ui.texts.text-field'
    )
    .defines(function () {
        EntitySettingsPopup = EntityPopup.extend({

            bgImg: new ig.Image('media/graphics/game/blank.png'),
            homeBtnImg: new ig.Image('media/graphics/game/home-btn.png'),

            sfxOnIconImg: new ig.Image('media/graphics/game/sfx-icon-on.png'),
            sfxOffIconImg: new ig.Image('media/graphics/game/sfx-icon-off.png'),

            bgmOnIconImg: new ig.Image('media/graphics/game/bgm-icon-on.png'),
            bgmOffIconImg: new ig.Image('media/graphics/game/bgm-icon-off.png'),

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
                this.title = this.spawnMember(EntityTextField, baseX + 15, baseY - 70, { zIndex: 7000, anchorX: 0.5, anchorY: 0.5, text: _STRINGS.Game.Settings, font: "64px mainfont", align: "center", color: "#ffffff", entryType: "fadeIn", exitType: "fadeOut" })

                this.homeButton = this.spawnMember(EntitySimpleButton, baseX, baseY + 150, { image: this.homeBtnImg, entryType: "fadeIn", exitType: "fadeOut" });
                this.homeButton.onClicked.addOnce(this.onClickHome, this);

                this.bgmButton = this.spawnMember(EntitySimpleButton, baseX - 80, baseY, { image: this.toggleOnImg, text: "", font: "48px sans-serif", align: "center", color: "#ffffff", offsetY: -5, entryType: "fadeIn", exitType: "fadeOut" });
                this.bgmButton.onClicked.add(this.onValueToggleBgm, this);

                this.sfxButton = this.spawnMember(EntitySimpleButton, baseX + 80, baseY, { image: this.toggleOnImg, text: "", font: "48px sans-serif", align: "center", color: "#ffffff", offsetY: -5, entryType: "fadeIn", exitType: "fadeOut" });
                this.sfxButton.onClicked.add(this.onValueToggleSfx, this);

                this.bgmIcon = this.spawnMember(EntityGameObject, this.bgmButton.anchoredPositionX, this.bgmButton.anchoredPositionY, { image: this.bgmOnIconImg, anchorX: 0.5, anchorY: 0.5, entryType: "fadeIn", exitType: "fadeOut" });
                this.sfxIcon = this.spawnMember(EntityGameObject, this.sfxButton.anchoredPositionX, this.sfxButton.anchoredPositionY, { image: this.sfxOnIconImg, anchorX: 0.5, anchorY: 0.5, entryType: "fadeIn", exitType: "fadeOut" });

                ig.game.sortEntitiesDeferred();

                this.refreshToggleButton();
            },

            refreshToggleButton: function () {
                if (ig.game.sessionData.music > 0) {
                    this.bgmButton.swapImage(this.toggleOnImg)
                    this.bgmIcon.swapImage(this.bgmOnIconImg)
                } else {
                    this.bgmButton.swapImage(this.toggleOffImg)
                    this.bgmIcon.swapImage(this.bgmOffIconImg)
                }

                if (ig.game.sessionData.sound > 0) {
                    this.sfxButton.swapImage(this.toggleOnImg)
                    this.sfxIcon.swapImage(this.sfxOnIconImg)
                } else {
                    this.sfxButton.swapImage(this.toggleOffImg)
                    this.sfxIcon.swapImage(this.sfxOffIconImg)
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