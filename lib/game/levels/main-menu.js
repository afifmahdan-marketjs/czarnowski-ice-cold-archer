ig.module('game.levels.main-menu')
    .requires(
        'impact.image',
        'game.entities.branding-logo-placeholder',
        'game.entities.buttons.button-more-games',
        'game.entities.pointer',
        'game.entities.buttons.button-start',
        'game.entities.controllers.main-menu-controller'
    ).defines(function () {
        LevelMainMenu =/*JSON[*/{
            "entities": [
                { "type": "EntityMainMenuController", "x": 0, "y": 0 },
                { "type": "EntityBrandingLogoPlaceholder", "x": 190, "y": 700, "settings": { "div_layer_name": "layer_mainmenu", "centralize": "true" } },
                { "type": "EntityButtonMoreGames", "x": 320, "y": 300, "settings": { "div_layer_name": "layer_moregames_mainmenu" } },
                { "type": "EntityPointer", "x": 0, "y": 0 },
                { "type": "EntityButtonStart", "x": 160, "y": 300 }
            ],
            "layer": [
                {
                    "name": "background", "width": 9, "height": 16, "linkWithCollision": false, "visible": 1, "tilesetName": "media/graphics/backgrounds/desktop/background.jpg", "repeat": false, "preRender": true, "distance": "1", "tilesize": 60, "foreground": false, "data": [[2, 3, 4, 5, 6, 7, 8, 9, 10], [18, 19, 20, 21, 22, 23, 24, 25, 26], [34, 35, 36, 37, 38, 39, 40, 41, 42], [50, 51, 52, 53, 54, 55, 56, 57, 58], [66, 67, 68, 69, 70, 71, 72, 73, 74], [82, 83, 84, 85, 86, 87, 88, 89, 90], [98, 99, 100, 101, 102, 103, 104, 105, 106], [114, 115, 116, 117, 118, 119, 120, 121, 122], [129, 130, 131, 132, 133, 134, 135, 136, 137], [1, 2, 3, 4, 5, 6, 7, 8, 9], [17, 18, 19, 20, 21, 22, 23, 24, 25], [33, 34, 35, 36, 37, 38, 39, 40, 41], [49, 50, 51, 52, 53, 54, 55, 56, 57], [65, 66, 67, 68, 69, 70, 71, 72, 73], [81, 82, 83, 84, 85, 86, 87, 88, 89], [97, 98, 99, 100, 101, 102, 103, 104, 105]]
                }
            ]
        }/*]JSON*/;
        LevelMainMenuResources = [new ig.Image('media/graphics/backgrounds/desktop/background.jpg')];
    });