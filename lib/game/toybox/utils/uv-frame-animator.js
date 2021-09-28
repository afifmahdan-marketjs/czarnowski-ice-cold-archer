ig.module(
    'game.toybox.utils.uv-frame-animator'
)
    .requires(
        'impact.impact'
    )
    .defines(function () {
        "use strict";
        ig.UVFrameAnimator = ig.Class.extend({

            texture: null,
            gridX: 7,
            gridY: 4,
            frameOffsetX: 0,
            frameOffsetY: 0.14,
            currentFrame: 0,
            currentAnim: null,
            animations: [],
            init: function (texture, row, column, offsetX, offsetY) {
                this.texture = texture;
                this.gridX = column;
                this.gridY = row;
                this.frameOffsetX = offsetX;
                this.frameOffsetY = offsetY;
                this.texture.uScale = 1 / this.gridX;
                this.texture.vScale = 1 / this.gridY;

                this.setFrame(0);

                // var fps = 40;
                // this.addAnimation("run", [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27], fps, true);
                // this.addAnimation("jump", [0, 1, 2, 3, 4, 5, 6], fps, false);
                // this.addAnimation("fall", [7, 8, 9, 10, 11], fps, false);
                // this.playAnimation("run");
            },

            setFrame: function (frame) {
                if (!(frame >= 0)) {
                    console.warn("Invalid frame index : ", frame);
                    // throw new Error("Invalid frame index : ", frame);
                    return;
                }
                var maxFrames = this.gridX * this.gridY - 1;
                if (frame > maxFrames) {
                    console.warn("Sprite frame index out of bound : ", frame);
                    frame = maxFrames;
                } else if (frame < 0) {
                    console.warn("Sprite frame index out of bound : ", frame);
                    frame = 0;
                }
                if (this.currentFrame == frame) return;
                this.currentFrame = frame;
                var invertedFrame = maxFrames - frame;
                var col = this.gridX - invertedFrame % this.gridX - 1;
                var row = Math.floor(invertedFrame / this.gridX);
                this.texture.uOffset = col * this.texture.uScale + this.texture.uScale * this.frameOffsetX;
                this.texture.vOffset = row * this.texture.vScale + this.texture.vScale * this.frameOffsetY;
                // console.log("setFrame:", frame)
                // console.log(col, row)
            },

            addAnimation: function (name, frames, fps, loop) {
                this.animations.push({
                    name: name,
                    frames: frames,
                    fps: fps,
                    loop: loop,
                    frameTime: 0,
                    frameIndex: 0,
                    frameTimeMax: 1 / fps,
                    isFinished: false,
                });
            },

            playAnimation: function (name, forcePlay) {
                if (this.currentAnim && !forcePlay && this.currentAnim.name == name) {
                    return;
                }

                for (var i = 0; i < this.animations.length; i++) {
                    var anim = this.animations[i];
                    if (anim.name == name) {
                        this.playAnimationIndex(i);
                        return;
                    }
                }
                console.warn("Play animation failed, animation name not found  : ", name);
            },

            playAnimationIndex: function (index) {
                if (index >= this.animations.length || index < 0) {
                    console.warn("Play animation failed, animation index out of found  : ", index);
                    return;
                }

                this.currentAnim = this.animations[index];
                this.currentAnim.frameIndex = 0;
                this.currentAnim.frameTime = 0;
                this.currentAnim.isFinished = false;
            },

            update: function (dt) {
                if (this.currentAnim && !this.currentAnim.isFinished) {
                    this.currentAnim.frameTime += dt;
                    if (this.currentAnim.frameTime >= this.currentAnim.frameTimeMax) {
                        this.currentAnim.frameTime -= this.currentAnim.frameTimeMax;
                        this.currentAnim.frameIndex++;
                        if (this.currentAnim.frameIndex >= this.currentAnim.frames.length) {
                            if (this.currentAnim.loop) {
                                this.currentAnim.frameIndex = 0;
                            } else {
                                this.currentAnim.isFinished = true;
                            }
                        }
                    }
                    if (!this.currentAnim.isFinished) this.setFrame(this.currentAnim.frames[this.currentAnim.frameIndex])
                }
            },
        });
    });
