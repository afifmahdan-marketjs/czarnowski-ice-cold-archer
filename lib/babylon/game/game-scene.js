ig.module(
    'game.entities.objects.game-scene'
)
.requires(
)
.defines(function () {
	ig.gameScene = {

        init: function () {
            console.log("webgl version", wgl.system.engine.webGLVersion);
            wgl.system.engine.performanceMonitor.enable();
        }
    };

});