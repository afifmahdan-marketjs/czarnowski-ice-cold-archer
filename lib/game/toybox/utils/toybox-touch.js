ig.module('game.toybox.utils.toybox-touch')
    .requires(
        'impact.impact'
    )
    .defines(function () {
        "use strict";
        ig.ToyboxTouch = {
            hasInitialized: false,
            touches: [],
            mouseX: 0,
            mouseY: 0,
            init: function () {
                if (ig.ua.touchDevice) {
                    // Standard
                    if (window.navigator.msPointerEnabled) {
                        // MS pointer events
                        ig.system.canvas.addEventListener('MSPointerDown', this.touchDown.bind(this), false);
                        ig.system.canvas.addEventListener('MSPointerUp', this.touchUp.bind(this), false);
                        ig.system.canvas.addEventListener('MSPointerMove', this.touchMove.bind(this), false);

                        ig.system.canvas.style.msContentZooming = "none";
                        ig.system.canvas.style.msTouchAction = 'none';
                    }

                    // Standard
                    ig.system.canvas.addEventListener('touchstart', this.touchDown.bind(this), false);
                    ig.system.canvas.addEventListener('touchend', this.touchUp.bind(this), false);
                    ig.system.canvas.addEventListener('touchmove', this.touchMove.bind(this), false);
                }
                ig.system.canvas.addEventListener('mousemove', this.mouseMove.bind(this), false);
                this.hasInitialized = true;
            },

            mouseMove: function (event) {
                var internalWidth = parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth;
                var internalHeight = parseInt(ig.system.canvas.offsetHeight) || ig.system.realHeight;

                this.scaleX = ig.system.scale * (internalWidth / ig.system.realWidth);
                this.scaleY = ig.system.scale * (internalHeight / ig.system.realHeight);

                var pos = { left: 0, top: 0 };
                if (ig.system.canvas.getBoundingClientRect) {
                    pos = ig.system.canvas.getBoundingClientRect();
                }
                this.mouseX = (event.clientX - pos.left) / this.scaleX;
                this.mouseY = (event.clientY - pos.top) / this.scaleY;
            },

            touchDown: function (event) {
                this.processTouch(event.touches);
            },

            touchUp: function (event) {
                this.processTouch(event.touches);
            },

            touchMove: function (event) {
                this.processTouch(event.touches);
            },

            processTouch: function (touches) {
                var internalWidth = parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth;
                var internalHeight = parseInt(ig.system.canvas.offsetHeight) || ig.system.realHeight;

                this.scaleX = ig.system.scale * (internalWidth / ig.system.realWidth);
                this.scaleY = ig.system.scale * (internalHeight / ig.system.realHeight);

                var pos = { left: 0, top: 0 };
                if (ig.system.canvas.getBoundingClientRect) {
                    pos = ig.system.canvas.getBoundingClientRect();
                }
                this.touches = [];
                for (var i = 0; i < touches.length; i++) {
                    var touch = touches[i];
                    var touchX = (touch.clientX - pos.left) / this.scaleX;
                    var touchY = (touch.clientY - pos.top) / this.scaleY;
                    this.touches.push({ x: touchX, y: touchY })
                }
            }
        }
    });
