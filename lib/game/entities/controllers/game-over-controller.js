ig.module("game.entities.controllers.game-over-controller")
  .requires(
    "impact.entity",
    "game.toybox.objects.ui.buttons.simple-button",
    "game.toybox.controllers.controller"
  )
  .defines(function () {
    EntityGameOverController = EntityController.extend({
      playBtnImage: new ig.Image("media/graphics/game/small-play-btn.png"),
      homeBtnImage: new ig.Image("media/graphics/game/home-btn.png"),
      bgImg: new ig.Image("media/graphics/game/popup-bg.png"),
      init: function (x, y, settings) {
        this.parent(x, y, settings);
        ig.soundHandler.sfxPlayer.play(
          ig.soundHandler.sfxPlayer.soundList.gameover
        );

        var bg = ig.game.spawnEntity(EntityGameObject, 540, 960, {
          anchorX: 0.5,
          anchorY: 0.5,
          image: this.bgImg,
          entryType: "fadeIn",
          exitType: "fadeOut",
        });
        ig.game.spawnEntity(EntityTextField, 540, 20 + 590, {
          font: "102px mainfont",
          text: _STRINGS.Game.GameOver,
          color: "#000000",
          align: "center",
          entryType: "fadeIn",
          exitType: "fadeOut",
        });
        // API_END_GAME
        var currentScore = ig.lastScore;

        if (currentScore > ig.game.sessionData.score) {
          ig.game.sessionData.score = currentScore;
          ig.game.saveAll();
        }

        ig.game.spawnEntity(EntityTextField, 540, 160 + 590, {
          font: "64px contentfont",
          text: _STRINGS.Game.Score,
          align: "center",
          entryType: "fadeIn",
          exitType: "fadeOut",
          color: "#000000",
        });
        ig.game.spawnEntity(EntityTextField, 540, 280 + 590, {
          font: "132px mainfont",
          text: "" + currentScore,
          align: "center",
          entryType: "fadeIn",
          exitType: "fadeOut",
          color: "#000000",
        });

        ig.game.spawnEntity(EntityTextField, 540, 380 + 590, {
          font: "52px contentfont",
          text: _STRINGS.Game.Best,
          align: "center",
          entryType: "fadeIn",
          exitType: "fadeOut",
          color: "#000000",
        });
        ig.game.spawnEntity(EntityTextField, 540, 490 + 590, {
          font: "96px mainfont",
          text: "" + ig.game.sessionData.score,
          align: "center",
          entryType: "fadeIn",
          exitType: "fadeOut",
          color: "#000000",
        });

        var playButton = ig.game.spawnEntity(
          EntitySimpleButton,
          540 + 140,
          680 + 590,
          { image: this.playBtnImage, entryType: "fadeIn", exitType: "fadeOut" }
        );
        playButton.onClicked.add(this.onClickPlay, this);

        var homeButton = ig.game.spawnEntity(
          EntitySimpleButton,
          540 - 140,
          playButton.anchoredPositionY,
          { image: this.homeBtnImage, entryType: "fadeIn", exitType: "fadeOut" }
        );
        homeButton.onClicked.add(this.onClickHome, this);

        this.isAllowInput = true;

        /** Linkit360 Skill - trackGameEnded */
        try {
          ig.linkit360Skill.trackGameEnded(currentScore);
        } catch(error) {}
      },

      onClickPlay: function () {
        ig.soundHandler.sfxPlayer.play(
          ig.soundHandler.sfxPlayer.soundList.click
        );
        ig.game.goToLevel("Gameplay");

        /** Linkit360 Skill - trackGameRestarted */
        try {
          ig.linkit360Skill.trackGameRestarted(optionalCallbackFunction);
        } catch(error) {}
      },

      onClickHome: function () {
        ig.soundHandler.sfxPlayer.play(
          ig.soundHandler.sfxPlayer.soundList.click
        );
        ig.game.goToLevel("MainMenu");
      },

      update: function () {
        this.parent();

        if (ig.input.state("jump") && this.isAllowInput) {
          this.isAllowInput = false;
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
