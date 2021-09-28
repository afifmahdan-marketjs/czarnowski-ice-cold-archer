ig.module('game.levels.end')
    .requires('impact.image', 'game.entities.controllers.level-end-controller', 'game.entities.pointer', 'game.entities.buttons.button-retry')
    .defines(function () {
        LevelEnd =/*JSON[*/{ "entities": [{ "type": "EntityLevelEndController", "x": 0, "y": 0 }, { "type": "EntityPointer", "x": 316, "y": 80 }, { "type": "EntityButtonRetry", "x": 245, "y": 296 }], "layer": [] }/*]JSON*/;
    });