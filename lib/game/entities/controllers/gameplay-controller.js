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
            targetImage: new ig.Image("media/graphics/game/target.png"),
            gameOverDelay: 2,

            allowShooting: true,
            isAiming: false,


            init: function (x, y, settings) {
                this.parent(x, y, settings);

                this.scoreTf = ig.game.spawnEntity(EntityTextField, 0, 100, { font: "72px mainfont", text: "0", align: "center", entryType: "fadeIn", exitType: "fadeOut", anchorType: "top" });

                this.pauseButton = ig.game.spawnEntity(EntitySimpleButton, -50, 45, { anchorX: 1, anchorY: 0, anchorType: "top-right", image: this.pauseImage, entryType: "fadeIn", exitType: "fadeOut", anchorX: 0.5, anchorY: 0.5, entryDelay: 1.5 });
                this.pauseButton.onClicked.add(this.onClickPause, this);

                // ig.game.spawnEntity(EntityGameObject, 0, 0, { image: this.targetImage });

                this.scoreTf.visible = false;
                this.pauseButton.visible = false;
                ig.babylonSceneController.paused = false


                this.allowShooting = true;
                this.isAiming = false;
            },

            onClickPause: function () {
                if (!this.isAllowInput) return;
                this.showPopup(EntityPausePopup);
                ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.click);
                this.isAllowInput = false;
                ig.babylonSceneController.paused = true;
                this.pauseButton.usePressedTween = false;
                console.log("pause")
            },

            onPopupFinished: function (name) {
                this.parent(name);
                this.isAllowInput = false;
                this.delayedCall(0.25, function () {
                    this.isAllowInput = true;
                    ig.babylonSceneController.paused = false;
                    this.pauseButton.usePressedTween = true;
                    console.log("resume")
                }.bind(this));
            },

            update: function () {
                this.parent();
                this.updateInput();

            },

            updateInput: function () {
                if (ig.babylonSceneController.paused) return;

                var isTouching = false;
                for (var i = 0; i < ig.ToyboxTouch.touches.length; i++) {
                    var t = ig.ToyboxTouch.touches[i];
                    if (t.y > 100) {
                        isTouching = true;
                    }
                }

                if (!isTouching && ig.input.state("click") && ig.game.io.mouse.getPos().y > 100) {
                    isTouching = true;
                }

                if (this.allowShooting) {
                    if (isTouching) {
                        ig.cameraControl.targetFov = ig.cameraControl.fovAim;
                        this.isAiming = true;
                    } else {
                        ig.cameraControl.targetFov = ig.cameraControl.fovRelaxing;
                        if (this.isAiming) {
                            this.isAiming = false;
                            this.allowShooting = false;
                            ig.babylonSceneController.arrow.launchNextFrame = true;
                        }
                    }
                }
                // console.log(ig.babylonSceneController.cameraControl.targetFov, isTouching)
            },

            draw: function () {
                this.parent();

                var ctx = ig.system.context;
                ctx.clearRect(0, 0, ig.system.width, ig.system.height);

                ctx.save();

                if (this.isAiming) {
                    ctx.translate(ig.system.width / 2, ig.system.height / 2)
                    ctx.fillStyle = "#000000";
                    ctx.arc(0, 0, 2, 0, Math.PI * 2)
                    ctx.fill();

                    ctx.strokeStyle = "#000000"
                    ctx.lineWidth = 2;
                    var size = 20;
                    ctx.beginPath();
                    ctx.moveTo(-size, 0)
                    ctx.lineTo(-5, 0)
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(size, 0)
                    ctx.lineTo(5, 0)
                    ctx.stroke();
                    ctx.beginPath();

                    ctx.moveTo(0, -size)
                    ctx.lineTo(0, -5)
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(0, size)
                    ctx.lineTo(0, 5)
                    ctx.stroke();
                }

                ctx.restore();


            },
        });
    });