ig.module('game.entities.controllers.gameplay-controller')
    .requires(
        'impact.entity',
        'game.entities.popups.pause-popup',
        'game.toybox.objects.ui.buttons.simple-button',
        'game.toybox.controllers.controller'
    )
    .defines(function () {
        EntityGameplayController = EntityController.extend({

            pauseImage: new ig.Image("media/graphics/game/pause-btn.png"),
            gameOverDelay: 2,

            jumpButton: null,
            leftButton: null,
            rightButton: null,

            jumpPressLinger: 0,
            fallTime: 0,
            fallTimeLimit: 0.5,
            darkness: 0,
            darknessDisplay: 1,
            darknessIncrement: 0.4,

            steerableDelay: 1.5,
            prevRatio: 0,


            init: function (x, y, settings) {
                this.parent(x, y, settings);

                this.scoreTf = ig.game.spawnEntity(EntityTextField, 0, 100, { font: "72px mainfont", text: "0", align: "center", entryType: "fadeIn", exitType: "fadeOut", anchorType: "top" });

                this.pauseButton = ig.game.spawnEntity(EntitySimpleButton, -50, 45, { anchorX: 1, anchorY: 0, anchorType: "top-right", image: this.pauseImage, entryType: "fadeIn", exitType: "fadeOut", anchorX: 0.5, anchorY: 0.5, entryDelay: 1.5 });
                this.pauseButton.onClicked.add(this.onClickPause, this);

                ig.gameScene3D.paused = false;
                ig.gameScene3D.player.mesh.isVisible = true;
                ig.meshManager.resetParticles();

            },

            onClickPause: function () {
                if (!this.isAllowInput) return;
                this.showPopup(EntityPausePopup);
                ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.click);
                this.isAllowInput = false;
                ig.gameScene3D.paused = true;
                this.pauseButton.usePressedTween = false;
                console.log("pause")
            },

            onPopupFinished: function (name) {
                this.parent(name);
                this.isAllowInput = false;
                this.delayedCall(0.25, function () {
                    this.isAllowInput = true;
                    ig.gameScene3D.paused = false;
                    this.pauseButton.usePressedTween = true;
                    console.log("resume")
                }.bind(this));
            },

            update: function () {
                this.parent();
                this.updateInput();
                
                if (ig.gameScene3D.player.score > 0) this.scoreTf.text = ig.gameScene3D.player.score.toString();
                else this.scoreTf.text = "";
                
                if (this.darkness >= 1) {
                    ig.gameScene3D.paused = true;
                    return;
                }
                
                if (ig.gameScene3D.paused) return;

                var dt = ig.system.tick;
                if (ig.gameScene3D.player.airTime < 0.2) {
                    this.darkness = 0;
                    this.fallTime = 0;
                } else if (ig.gameScene3D.player.enableSteering) {
                    this.fallTime += dt;
                    if (this.fallTime > this.fallTimeLimit) {
                        this.darkness += this.darknessIncrement * dt;
                        if (this.darkness >= 1) {
                            ig.gameScene3D.paused = true;
                            ig.game.goToLevel("GameOver");
                        }
                    }
                }

                var ratio = ig.system.width / ig.system.height;
                if (ratio != this.prevRatio) {
                    this.prevRatio = ratio;
                    if (ig.system.width > ig.system.height) {
                        this.scoreTf.font = "120px mainfont";
                    } else {
                        this.scoreTf.font = "72px mainfont";
                    }
                }
            },

            updateInput: function () {
                if (ig.gameScene3D.paused) return;
                if (this.steerableDelay > 0) {
                    this.steerableDelay -= ig.system.tick;
                    return;
                }
                ig.gameScene3D.player.steerLeft = false;
                ig.gameScene3D.player.steerRight = false;


                var touchLeft = false;
                var touchRight = false;
                if (ig.ua.mobile) {
                    for (var i = 0; i < ig.ToyboxTouch.touches.length; i++) {
                        var t = ig.ToyboxTouch.touches[i];
                        if (t.y > 100) {
                            if (t.x < ig.system.width / 2) {
                                touchLeft = true;
                            } else {
                                touchRight = true;
                            }
                        }
                    }

                }

                ig.gameScene3D.player.steerLeft = ig.input.state("left") || touchLeft;
                ig.gameScene3D.player.steerRight = ig.input.state("right") || touchRight;
            },

            draw: function () {
                this.parent();

                var ctx = ig.system.context;
                ctx.clearRect(0, 0, ig.system.width, ig.system.height);

                this.darknessDisplay += (this.darkness - this.darknessDisplay) / 20;
                ctx.save();
                ctx.fillStyle = "rgba(248,200,92," + this.darknessDisplay + ")";
                ctx.fillRect(0, 0, ig.system.width, ig.system.height);
                ctx.restore();

            },
        });
    });