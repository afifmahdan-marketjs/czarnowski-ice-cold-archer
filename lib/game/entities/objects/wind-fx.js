ig.module("game.entities.objects.wind-fx")
  .requires("game.toybox.objects.game-object")
  .defines(function () {
    ig.windFxFactor = 50;
    EntityWindFx = EntityGameObject.extend({
      windDirectionImage: new ig.Image(
        "media/graphics/game/wind-direction.png"
      ),
      traversedDistance: 0,
      init: function (x, y, settings) {
        // settings.entryType = "fadeIn";
        // settings.exitType = "fadeOut";
        // settings.entryDuration = 0.2;
        // settings.exitDuration = 0.2;
        settings.anchorType = "bottom-left";
        settings.image = this.windDirectionImage;
        settings.scaleY = 0.4;
        settings.scaleX =
          settings.scaleY *
          (ig.babylonSceneController.arrow.wind.x > 0 ? 1 : -1);
        // console.log(settings.scaleX, settings.scaleY)

        this.parent(x, y, settings);
        // console.log(this.killDistance)
      },

      update: function () {
        this.parent();
        var dt = ig.system.tick;
        var speed = ig.babylonSceneController.arrow.wind.x * ig.windFxFactor;
        var addedDistance = speed * dt;
        this.anchoredPositionX += addedDistance;
        this.traversedDistance += Math.abs(addedDistance);
        if (this.traversedDistance > this.killDistance) this.kill();
        else if (ig.babylonSceneController.arrow.isFlying) this.kill();

        // console.log(this.pos.x, this.pos.y, speed, dt, this.anchoredPositionX)
      },
    });
  });
