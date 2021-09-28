ig.module('game.toybox.controllers.controller')
    .requires(
        'impact.entity',
        'game.entities.pointer',
        'game.toybox.objects.ui.fade-black'
    )
    .defines(function () {
        EntityController = ig.Entity.extend({
            gravityFactor: 0,
            isAllowInput: true,
            pointer: null,
            liftCurtainOnStart: true,
            onInputDown: null,
            onInputUp: null,

            lastTouchY: 0,
            lastTouchX: 0,

            size: {
                x: 960,
                y: 540,
            },

            init: function (x, y, settings) {
                this.parent(x, y, settings);
                // pointer check
                this.pointer = ig.game.getEntitiesByType(EntityPointer)[0];
                // pointer doesnt exist
                // if (this.pointer == null) {
                //     this.pointer = ig.game.spawnEntity(EntityPointer, 0, 0);
                // }
                this.onInputDown = new ig.Signal();
                this.onInputUp = new ig.Signal();
                if (this.liftCurtainOnStart) ig.liftCurtain();
            },

            goToLevel: function (id) {
                this.isAllowInput = false;
                ig.dropCurtain(id);
            },

            showPopup: function (popupClass, settings) {
                if (!settings) settings = {};
                settings.controller = this;
                this.isAllowInput = false;
                ig.game.spawnEntity(popupClass, 0, 0, settings);
                ig.game.sortEntitiesDeferred();
            },

            onPopupFinished: function (name) {
                this.isAllowInput = true;
                // console.log("popup finished")
            },

            update: function () {
                this.parent();
                var hasTouch = false;
                for (var i = 0; i < ig.multitouchInput.touches.length; i++) {
                    hasTouch = true;
                    var t = ig.multitouchInput.touches[i];
                    this.processInput(t.x, t.y);

                }

                if (!hasTouch && ig.input.state("click")) {
                    hasTouch = true;
                    var p = ig.game.io.mouse.getPos();
                    this.processInput(p.x, p.y)
                }

                if (!hasTouch) {
                    if (this.isClicking) {
                        this.onInputUp.dispatch(this);
                    }
                    this.isClicking = false;
                }
            },

            processInput: function (x, y) {
                this.currentTouchX = x;
                this.currentTouchY = y;
                if (this.isInsideBounds(x, y)) {
                    if (!this.isClicking) {
                        this.isClicking = true;
                        this.lastTouchX = x;
                        this.lastTouchY = y;
                        this.onInputDown.dispatch(this);
                    }
                }
            },

            isInsideBounds: function (x, y) {
                var w = this.scaleX * this.width;
                var h = this.scaleY * this.height;
                this.boundLeft = this.pos.x - w * this.anchorX;
                this.boundTop = this.pos.y - h * this.anchorY;
                this.boundRight = this.boundLeft + w;
                this.boundBottom = this.boundTop + h;
                // this.boundX = x;
                // console.log(x, y)
                if (this.boundLeft > this.boundRight) {
                    var temp = this.boundLeft;
                    this.boundLeft = this.boundRight;
                    this.boundRight = temp;
                }

                if (this.boundTop > this.boundBottom) {
                    var temp = this.boundTop;
                    this.boundTop = this.boundBottom;
                    this.boundBottom = temp;
                }

                if (x < this.boundLeft) return false;
                if (y < this.boundTop) return false;
                if (x > this.boundRight) return false;
                if (y > this.boundBottom) return false;


                return true;
            },
        });
    });