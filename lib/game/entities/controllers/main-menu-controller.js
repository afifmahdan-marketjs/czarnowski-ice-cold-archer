ig.module("game.entities.controllers.main-menu-controller")
  .requires(
    "impact.entity",
    "game.toybox.objects.ui.buttons.simple-button",
    "game.toybox.controllers.controller"
  )
  .defines(function () {
    EntityMainMenuController = EntityController.extend({
      titleImage: new ig.Image("media/graphics/game/title.png"),
      playBtnImage: new ig.Image("media/graphics/game/play-btn.png"),
      settingsBtnImage: new ig.Image("media/graphics/game/settings-btn.png"),
      moreGamesBtnImage: new ig.Image("media/graphics/game/more-games-btn.png"),

      bgAlpha: 0,

      init: function (x, y, settings) {
        this.parent(x, y, settings);

        // ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.bgmMainMenu);
        this.title = ig.game.spawnEntity(EntityGameObject, 540, 600, {
          image: this.titleImage,
          entryType: "fadeIn",
          exitType: "fadeOut",
          anchorX: 0.5,
          anchorY: 0.5,
        });
        // ig.game.spawnEntity(EntityTextField, 270, 250, { font: "150px mainfont", text: "COOL\nARCHER", align: "center", entryType: "fadeIn", exitType: "fadeOut" });

        var playButton = ig.game.spawnEntity(EntitySimpleButton, 540, 1220, {
          image: this.playBtnImage,
          entryType: "fadeIn",
          exitType: "fadeOut",
        });
        playButton.onClicked.add(this.onClickPlay, this);

        var settingsButton = ig.game.spawnEntity(
          EntitySimpleButton,
          540 + 360,
          1220,
          {
            image: this.settingsBtnImage,
            entryType: "fadeIn",
            exitType: "fadeOut",
          }
        );
        settingsButton.onClicked.add(this.onClickSettings, this);

        if (_SETTINGS.MoreGames.Enabled) {
          var moreGamesButton = ig.game.spawnEntity(
            EntitySimpleButton,
            540 - 360,
            1220,
            {
              image: this.moreGamesBtnImage,
              entryType: "fadeIn",
              exitType: "fadeOut",
            }
          );
          moreGamesButton.size.x = this.moreGamesBtnImage.width;
          moreGamesButton.size.y = this.moreGamesBtnImage.height;
          this.moreGamesButton = moreGamesButton;

          if (_SETTINGS.MoreGames.Link) {
            moreGamesButton.link = _SETTINGS.MoreGames.Link;
          }
          if (_SETTINGS.MoreGames.NewWindow) {
            moreGamesButton.newWindow = _SETTINGS.MoreGames.NewWindow;
          }
          // playButton.normalScale = 1.2
          this.clickableLayer = new ClickableDivLayer(moreGamesButton);
        } else {
          // playButton.normalScale = 1.3
          settingsButton.anchoredPositionX = 540;
          settingsButton.anchoredPositionY = 1600;
        }

        this.fullscreenbtn = ig.game.spawnEntity(
          ig.FullscreenButton,
          -260,
          20,
          {
            enterImage: new ig.Image("media/graphics/game/button-maximize.png"),
            exitImage: new ig.Image("media/graphics/game/button-minimize.png"),
          }
        );
        this.fullscreenbtn.anchorType = "right-top";

        if (ig.game.backFromSettings) {
          ig.game.backFromSettings = false;
          this.bgAlpha = 0;
        } else {
          ig.babylonSceneController.update(0);
          this.bgAlpha = 1.5;
        }

        ig.babylonSceneController.arrow.setMainMenu();
        ig.babylonSceneController.paused = true;

        // this.delayedCall(0.2, function () {
        //     // this.onClickSettings();
        //     this.onClickPlay();
        // }.bind(this))
      },

      onClickSettings: function () {
        ig.soundHandler.sfxPlayer.play(
          ig.soundHandler.sfxPlayer.soundList.click
        );
        ig.game.goToLevel("MainMenuSettings");
      },

      onClickPlay: function () {
        ig.soundHandler.sfxPlayer.play(
          ig.soundHandler.sfxPlayer.soundList.click
        );
        ig.soundHandler.sfxPlayer.stop(
          ig.soundHandler.sfxPlayer.soundList.bgmMainMenu
        );
        ig.game.goToLevel("Gameplay");
        // if (ig.game.sessionData.hasShownTutorial) ig.game.goToLevel("Gameplay");
        // else {
        //     ig.game.sessionData.hasShownTutorial = true;
        //     ig.game.saveAll();
        //     ig.game.goToLevel("Tutorial");
        // }
      },

      update: function () {
        if (ig.system.width > ig.system.height) {
          this.title.scaleX = this.title.scaleY = 1;
        } else {
          this.title.scaleX = this.title.scaleY = 0.74;
        }
        this.parent();
        if (this.clickableLayer) {
          var btn = this.moreGamesButton;
          this.clickableLayer.update(
            btn.pos.x - btn.width / 2,
            btn.pos.y - btn.height / 2,
            btn.width,
            btn.height
          );
        }
      },

      draw: function () {
        this.parent();

        var ctx = ig.system.context;
        ctx.clearRect(0, 0, ig.system.width, ig.system.height);

        if (this.bgAlpha > 0) {
          this.bgAlpha -= ig.system.tick * 2;
          if (this.bgAlpha < 0.05) this.bgAlpha = 0;
          ctx.save();
          if (this.bgAlpha > 1) ctx.globalAlpha = 1;
          else ctx.globalAlpha = this.bgAlpha;

          ctx.fillStyle = "#cff0d5";
          ctx.fillRect(0, 0, ig.system.width, ig.system.height);
          ctx.restore();
          ctx.globalAlpha = 1;
        }
      },
    });
  });
