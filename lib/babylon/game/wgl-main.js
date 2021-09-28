ig.module(
    'babylon.game.wgl-main'
)
    .requires(
        'babylon.plugins.wgl-game'
        , 'babylon.plugins.wgl-system'
        , 'babylon.plugins.wgl-debug'
        , 'babylon.plugins.wgl-game'

        , 'babylon.entities.game-camera'
        , 'babylon.entities.laser-spawner'
        , 'babylon.entities.laser'
    )
    .defines(function () {

        /**
        * Defining the wgl game inherited from wgl.Game class
        */
        MyWGLGame = wgl.Game.extend({
            gameover: false,
            score: 0,
            debug: false,
            levels: {
                game: "game-scene.babylon"
            },
            root: "media/scenes/",

            init: function () { },

            reloadLevel: function () {
                wgl.system.unregisterBeforeRender();
                while (this.entities.length > 0) {
                    this.entities.pop();
                }


                this.gameover = false;
                //elem.style.visibility="hidden";
                wgl.system.loadScene(this.root, this.levels.game);
            },

        });

        /**
        * Defining webgl main
        * this is called in main.js after initialising impactjs
        */
        wgl.webglmain = function (canvasId, fps, width, height, scale) {
            BABYLON.SceneLoader.ShowLoadingScreen = false;
            wgl.debug = new wgl.Debug();
            wgl.system = new wgl.System(canvasId, fps);
            wgl.game = new MyWGLGame();
            console.log("Load 3d scene")
            wgl.game.reloadLevel();
        };
    });
