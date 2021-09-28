ig.module(
    'game.toybox.utils.tween-patch'
)
    .requires(
        'plugins.tween'
    )

    .defines(function () {
        ig.Entity.prototype.delayedCall = function (duration, onComplete, autoStart) {
            if (autoStart === undefined) {
                autoStart = true;
            }
            var tween = new ig.Tween(this, {}, duration, { onComplete: onComplete });
            this.tweens.push(tween);
            if (autoStart) {
                tween.start();
            }
            return tween;
        };
    });