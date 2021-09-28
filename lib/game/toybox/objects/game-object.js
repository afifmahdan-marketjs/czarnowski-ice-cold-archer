ig.module('game.toybox.objects.game-object')
    .requires(
        'impact.entity'
    )
    .defines(function () {
        EntityGameObject = ig.Entity.extend({
            gravityFactor: 0,
            idleSheetInfo: null,
            singleFrameImage: null,
            visible: true,
            alpha: 1,
            zIndex: 1000,

            drawAsRect: false,
            drawAsOutline: false,
            outlineWidth: 1,
            rectColor: "#FFFFFF",
            outlineColor: "#000000",

            entryDelay: 0,
            entryDuration: 0.25,
            entryType: null,

            exitDelay: 0,
            exitDuration: 0.25,
            exitType: null,

            killOnExit: true,

            scaleX: 1,
            scaleY: 1,
            angle: 0,
            anchorX: 0,
            anchorY: 0,
            forceDraw: false,
            width: 32,
            height: 32,

            onInputDown: null,
            onInputUp: null,
            onClicked: null,

            hasTouchInside: false,
            inputEnabled: false,
            isClicking: false,

            boundLeft: 0,
            boundRight: 0,
            boundTop: 0,
            boundBottom: 0,
            isFinishEntering: false,
            fixedOnCamera: false,

            timedLife: -999,

            size: {
                x: 32,
                y: 32,
            },

            init: function (x, y, settings) {

                this.onInputDown = new ig.Signal();
                this.onInputUp = new ig.Signal();
                this.onClicked = new ig.Signal();
                if (settings['singleFrameImage']) {
                    this.singleFrameImage = settings['singleFrameImage'];
                } else if (settings['image']) {
                    this.singleFrameImage = settings['image'];
                    this.image = this.singleFrameImage;
                }

                if (this.singleFrameImage != null) {
                    this.idleSheetInfo = {
                        sheetImage: this.singleFrameImage,
                        sheetX: 1,
                        sheetY: 1,
                    }

                    this.setSpriteSheet("idle");
                    this.setSize("idle");
                    this.addAnimation("idle", "idleSheet", 1, [0], false, true);
                }
                else if (this.idleSheetInfo != null) {
                    this.setSpriteSheet("idle");
                    this.setSize("idle");
                }

                this.parent(x, y, settings);
                if (settings.visible === false) this.visible = false;
                if (!settings.anchorType) this.anchorType = "default";
                else this.anchorType = settings.anchorType;
                this.enter();
            },

            swapImage: function (image) {
                this.idleSheetInfo.sheetImage = image;
                this.idleSheet.image = image;
            },

            onFinishEntering: function () {

            },

            enter: function () {
                this.visible = true;
                // this.alpha = 1;

                if (ig.responsive) {
                    var point = ig.responsive.toAnchor(this.anchoredPositionX, this.anchoredPositionY, this.anchorType);
                    this.pos.x = point.x;
                    this.pos.y = point.y;
                }

                if (this.entryType != null) {
                    this[this.entryType]();
                    this.delayedCall(this.entryDelay + this.entryDuration, function () {
                        this.onFinishEntering();
                        this.isFinishEntering = true;
                    }.bind(this));
                } else {
                    // this.alpha1();
                    this.isFinishEntering = true;
                    this.onFinishEntering();
                }
            },

            exit: function () {
                if (this.exitType != null) {
                    this[this.exitType]();
                } else {
                    this.alpha0();
                }
                this.delayedCall(this.exitDuration + this.exitDelay, function () { this.checkKill() }.bind(this))
            },

            setSpriteSheet: function (animationName) {
                this[animationName + "Sheet"] = new ig.AnimationSheet(
                    this[animationName + "SheetInfo"].sheetImage.path,
                    this[animationName + "SheetInfo"].sheetImage.width / this[animationName + "SheetInfo"].sheetX,
                    this[animationName + "SheetInfo"].sheetImage.height / this[animationName + "SheetInfo"].sheetY
                );
            },

            setSize: function (animationName) {
                this.width = this[animationName + "SheetInfo"].sheetImage.width / this[animationName + "SheetInfo"].sheetX;
                this.height = this[animationName + "SheetInfo"].sheetImage.height / this[animationName + "SheetInfo"].sheetY;
            },

            addAnimation: function (animationName, sheetName, delay, frames, loop, setAsCurrentAnim) {
                this[animationName] = new ig.Animation(this[sheetName], delay, frames, !loop);
                if (setAsCurrentAnim == true) {
                    this.currentAnim = this[animationName];
                }
            },

            makeFramesArray: function (start, finish, yoyo) {
                var arr = [];

                for (var i = start; i <= finish; i++) {
                    arr.push(i);
                }

                if (yoyo) {
                    for (var i = finish; i >= start; i--) {
                        arr.push(i);
                    }
                }
                return arr;
            },

            draw: function () {
                if (this.visible && (this.forceDraw || this.currentAnim || this.drawAsRect || this.drawAsOutline)) {
                    var ctx = ig.system.context;
                    ctx.save();

                    var translateX = 0;
                    var translateY = 0;

                    if (this.fixedOnCamera) {
                        translateX = ig.system.getDrawPos(this.pos.x.round() - this.offset.x);
                        translateY = ig.system.getDrawPos(this.pos.y.round() - this.offset.y);
                    } else {
                        translateX = ig.system.getDrawPos(this.pos.x.round() - this.offset.x - ig.game.screen.x);
                        translateY = ig.system.getDrawPos(this.pos.y.round() - this.offset.y - ig.game.screen.y);
                    }

                    ctx.translate(translateX, translateY);
                    if (this.scaleX != 1 || this.scaleY != 1) ctx.scale(this.scaleX, this.scaleY);


                    var drawX = -this.anchorX * this.width;
                    var drawY = -this.anchorY * this.height

                    if (this.shakeValue > 0) {
                        this.shakeValue -= ig.system.tick * this.shakeReductionMultiplier;
                        drawX += ig.random.float(-this.shakeValue, this.shakeValue);
                        drawY += ig.random.float(-this.shakeValue, this.shakeValue);
                    }

                    this.drawObject(drawX, drawY);
                    ctx.restore();
                }
            },

            drawObject: function (x, y) {
                var ctx = ig.system.context;
                var color = ig.hexToRgb(this.rectColor);
                if (this.drawAsRect) {
                    if (this.alpha < 1) {
                        ctx.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + this.alpha + ")";
                    } else {
                        ctx.fillStyle = color.hex;
                    }
                    ctx.fillRect(x, y, this.width, this.height);
                }
                var color = ig.hexToRgb(this.outlineColor);
                if (this.drawAsOutline) {
                    ctx.lineWidth = this.outlineWidth;
                    if (this.alpha < 1) {
                        ctx.strokeStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + this.alpha + ")";
                    } else {
                        ctx.strokeStyle = color.hex;
                    }
                    ctx.strokeRect(x, y, this.width, this.height);
                }
                else if (this.currentAnim != null) {
                    this.currentAnim.alpha = this.alpha;
                    this.currentAnim.draw(x, y);
                }
            },

            update: function () {
                if (ig.game.entities) this.parent();
                if (this.inputEnabled && this.isFinishEntering && this.visible) {
                    var hasTouch = false;
                    this.hasTouchInside = false;
                    for (var i = 0; i < ig.multitouchInput.touches.length; i++) {
                        hasTouch = true;
                        var t = ig.multitouchInput.touches[i];
                        this.processInput(t.x, t.y);

                    }

                    for (var i = 0; i < ig.ToyboxTouch.touches.length; i++) {
                        hasTouch = true;
                        var t = ig.ToyboxTouch.touches[i];
                        this.processInput(t.x, t.y);

                    }

                    if (!hasTouch && ig.input.state("click")) {
                        hasTouch = true;
                        var p = ig.game.io.mouse.getPos();
                        this.processInput(p.x, p.y)
                    }

                    if (hasTouch && !this.isClicking) {

                    }

                    if (!hasTouch) {
                        if (this.isClicking) {
                            //User is releasing mouse/tap after click on this button
                            this.onInputUp.dispatch(this);
                            this.onClicked.dispatch(this);
                        }
                        this.isClicking = false;
                    } else if (!this.hasTouchInside) {
                        this.isClicking = false;
                    }
                }

                if (this.timedLife != -999 && this.isFinishEntering) {
                    this.timedLife -= ig.system.tick;
                    if (this.timedLife <= 0) {
                        this.timedLife = -999;
                        this.exit();
                    }
                }
            },

            processInput: function (x, y) {
                if (this.isInsideBounds(x, y)) {
                    this.hasTouchInside = true;
                    if (!this.isClicking) {
                        this.isClicking = true;
                        //User begin clicking/tapping on this button
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

            getBounds: function () {
                if (!this._bounds) this._bounds = {};
                var bounds = this._bounds;
                var w = this.scaleX * this.width;
                var h = this.scaleY * this.height;
                bounds.left = this.pos.x - w * this.anchorX;
                bounds.top = this.pos.y - h * this.anchorY;
                bounds.right = bounds.left + w;
                bounds.bottom = bounds.top + h;
                bounds.width = Math.abs(w);
                bounds.height = Math.abs(h);

                if (bounds.left > bounds.right) {
                    var temp = bounds.left;
                    bounds.left = bounds.right;
                    bounds.right = temp;
                }

                if (bounds.top > bounds.bottom) {
                    var temp = bounds.top;
                    bounds.top = bounds.bottom;
                    bounds.bottom = temp;
                }
                bounds.x = bounds.left;
                bounds.y = bounds.top;

                return bounds;
            },

            isCollidingWith: function (obj) {
                var bounds = this.getBounds();
                var otherBounds = obj.getBounds();
                if (bounds.right < otherBounds.left) return false;
                if (bounds.left > otherBounds.right) return false;
                if (bounds.bottom < otherBounds.top) return false;
                if (bounds.top > otherBounds.bottom) return false;
                return true;
            },

            shakeValue: 0,
            shakeReductionMultiplier: 0,

            shake: function (value, reductionMultiplier) {
                if (!value) value = 5;
                if (!reductionMultiplier) reductionMultiplier = 10;
                this.shakeValue = value;
                this.shakeReductionMultiplier = reductionMultiplier;
            },

            //=============================================================================
            //Transition template
            //=============================================================================

            fadeBounceRightIn: function () {
                this.alpha = 0;
                var targetX = this.pos.x;
                this.pos.x -= 100;
                this.tween({ alpha: 1 }, this.entryDuration * 0.75, { delay: this.entryDelay, easing: ig.Tween.Easing.Quadratic.EaseOut }).start();
                this.tween({ pos: { x: targetX } }, this.entryDuration, { delay: this.entryDelay, easing: ig.Tween.Easing.Back.EaseOut }).start();
            },

            fadeBounceRightOut: function () {
                this.tween({ alpha: 0 }, this.exitDuration * 0.75, { delay: this.exitDelay + this.exitDuration * 0.25, easing: ig.Tween.Easing.Quadratic.EaseOut }).start();
                this.tween({ pos: { x: this.pos.x - 100 } }, this.exitDuration, { delay: this.exitDelay, easing: ig.Tween.Easing.Back.EaseIn }).start();
            },

            fadeBounceLeftIn: function () {
                this.alpha = 0;
                var targetX = this.pos.x;
                this.pos.x += 100;
                this.tween({ alpha: 1 }, this.entryDuration * 0.75, { delay: this.entryDelay, easing: ig.Tween.Easing.Quadratic.EaseOut }).start();
                this.tween({ pos: { x: targetX } }, this.entryDuration, { delay: this.entryDelay, easing: ig.Tween.Easing.Back.EaseOut }).start();
            },

            fadeBounceLeftOut: function () {
                this.tween({ alpha: 0 }, this.exitDuration * 0.75, { delay: this.exitDelay + this.exitDuration * 0.25, easing: ig.Tween.Easing.Quadratic.EaseOut }).start();
                this.tween({ pos: { x: this.pos.x + 100 } }, this.exitDuration, { delay: this.exitDelay, easing: ig.Tween.Easing.Back.EaseIn }).start();
            },

            fadeJumpIn: function () {
                this.alpha = 0;
                var targetY = this.pos.y;
                this.pos.y += 100;
                this.tween({ alpha: 1 }, this.entryDuration * 0.75, { delay: this.entryDelay, easing: ig.Tween.Easing.Quadratic.EaseOut }).start();
                this.tween({ pos: { y: targetY } }, this.entryDuration, { delay: this.entryDelay, easing: ig.Tween.Easing.Back.EaseOut }).start();
            },

            fadeJumpOut: function () {
                this.tween({ alpha: 0 }, this.exitDuration * 0.75, { delay: this.exitDelay + this.exitDuration * 0.25, easing: ig.Tween.Easing.Quadratic.EaseOut }).start();
                this.tween({ pos: { y: this.pos.y + 100 } }, this.exitDuration, { delay: this.exitDelay, easing: ig.Tween.Easing.Back.EaseIn }).start();
            },

            fadeIn: function () {
                var alphaTarget = this.alpha;
                this.alpha = 0;
                this.tween({ alpha: alphaTarget }, this.entryDuration, { delay: this.entryDelay, easing: ig.Tween.Easing.Quadratic.EaseOut }).start();
            },

            fadeInLinear: function () {
                var alphaTarget = this.alpha;
                this.alpha = 0;
                this.tween({ alpha: alphaTarget }, this.entryDuration, { delay: this.entryDelay, easing: ig.Tween.Easing.Linear.EaseNone }).start();
            },

            fadeOut: function () {
                this.tween({ alpha: 0 }, this.exitDuration, { delay: this.exitDelay, easing: ig.Tween.Easing.Quadratic.EaseOut }).start();
            },

            fadeOutLinear: function () {
                this.tween({ alpha: 0 }, this.exitDuration, { delay: this.exitDelay, easing: ig.Tween.Easing.Linear.EaseNone }).start();
            },

            expandIn: function () {
                //not implemented yet
                this.alpha = 0;
                this.tween({ alpha: 1 }, this.entryDuration, { delay: this.entryDelay, easing: ig.Tween.Easing.Quadratic.EaseOut }).start();
            },

            expandOut: function () {
                this.tween({ alpha: 0 }, this.exitDuration, { delay: this.exitDelay, easing: ig.Tween.Easing.Quadratic.EaseOut }).start();
            },

            dropBoinkIn: function () {
                this.alpha = 0;
                var targetY = this.pos.y;
                var targetScaleX = this.scaleX * 1.2;
                var targetScaleY = this.scaleY * 0.8;
                var originalScaleX = this.scaleX;
                var originalScaleY = this.scaleY;
                this.pos.y -= this.height > 0 ? this.height * 3 : this.size.y * 3;
                var tween1 = this.tween({ scaleX: targetScaleX, scaleY: targetScaleY }, this.entryDuration * 0.2, { delay: this.entryDelay + this.entryDuration * 0.6, easing: ig.Tween.Easing.Quadratic.EaseOut });
                var tween2 = this.tween({ scaleX: originalScaleX, scaleY: originalScaleY }, this.entryDuration * 0.2, { easing: ig.Tween.Easing.Quadratic.EaseIn });
                tween1.chain(tween2);
                tween1.start();
                this.tween({ alpha: 1 }, this.entryDuration * 0.6, { delay: this.entryDelay, easing: ig.Tween.Easing.Quadratic.EaseIn }).start();
                this.tween({ pos: { y: targetY } }, this.entryDuration * 0.6, { delay: this.entryDelay, easing: ig.Tween.Easing.Quartic.EaseIn }).start();
            },

            alpha0: function () {
                this.alpha = 0;
            },

            alpha1: function () {
                this.alpha = 1;
            },

            checkKill: function () {
                if (this.killOnExit) this.kill();
            }

        });

    });