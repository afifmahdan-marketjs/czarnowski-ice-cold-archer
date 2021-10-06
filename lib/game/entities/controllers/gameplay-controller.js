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

            aimCenterX: 0,
            aimCenterY: 0,

            aimControlX: 0,
            aimControlY: 0,

            aimMinimumSpeed: 150,

            crosshairX: 0,
            crosshairY: 0,
            crosshairAreaRadius: 500,
            crosshairSpeedMultiplier: 5,
            cameraPositionRatio: 1 / 50,

            showAimController: false,



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

                ig.babylonSceneController.arrow.onLanded.add(this.onArrowLanded, this);
            },

            onArrowLanded: function () {
                ig.meshManager.crosshairPoint.position.x = ig.meshManager.target.position.x;
                ig.meshManager.crosshairPoint.position.y = ig.meshManager.target.position.y;
                this.delayedCall(1, function () {
                    this.allowShooting = true;
                    this.isAiming = false;
                    ig.babylonSceneController.arrow.resetNextFrame = true;
                }.bind(this));
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
                var touchX = 0;
                var touchY = 0;
                for (var i = 0; i < ig.ToyboxTouch.touches.length; i++) {
                    var t = ig.ToyboxTouch.touches[i];
                    if (t.y > 100) {
                        isTouching = true;
                        touchX = t.x;
                        touchY = t.y;
                    }
                }

                if (!isTouching && ig.input.state("click") && ig.game.io.mouse.getPos().y > 100) {
                    isTouching = true;
                    touchX = ig.game.io.mouse.getPos().x;
                    touchY = ig.game.io.mouse.getPos().y;
                }

                if (this.allowShooting) {
                    if (isTouching) {
                        ig.cameraControl.targetFov = ig.cameraControl.fovAim;
                        if (!this.isAiming) {
                            var aimCenterRandom = 50;
                            this.aimCenterX = touchX + ig.random.int(-aimCenterRandom, aimCenterRandom);
                            this.aimCenterY = touchY + ig.random.int(-aimCenterRandom, aimCenterRandom);;
                            this.crosshairX = ig.random.int(-this.crosshairAreaRadius, this.crosshairAreaRadius) * 2;
                            this.crosshairY = ig.random.int(-this.crosshairAreaRadius, this.crosshairAreaRadius) * 2;
                        }
                        this.isAiming = true;

                        this.aimControlX = touchX;
                        this.aimControlY = touchY;

                        var dt = ig.system.tick;
                        var aimChaseSpeedX = (this.aimControlX - this.aimCenterX) * dt * this.crosshairSpeedMultiplier;
                        var aimChaseSpeedY = (this.aimCenterY - this.aimControlY) * dt * this.crosshairSpeedMultiplier;

                        var speedLengthSquared = aimChaseSpeedX * aimChaseSpeedX + aimChaseSpeedY * aimChaseSpeedY;

                        // console.log(aimChaseSpeedX, aimChaseSpeedY, this.aimControlX, this.aimControlY, this.aimControlX);

                        var minimumSpeed = this.aimMinimumSpeed * dt;
                        if (speedLengthSquared < minimumSpeed * minimumSpeed) {
                            var normalized = ig.utils.normalize2(aimChaseSpeedX, aimChaseSpeedY, minimumSpeed);
                            aimChaseSpeedX = normalized.x;
                            aimChaseSpeedY = normalized.y;

                        }


                        this.crosshairX += aimChaseSpeedX;
                        this.crosshairY += aimChaseSpeedY;

                        if (this.crosshairX < -this.crosshairAreaRadius) this.crosshairX = -this.crosshairAreaRadius;
                        if (this.crosshairX > this.crosshairAreaRadius) this.crosshairX = this.crosshairAreaRadius;

                        if (this.crosshairY < -this.crosshairAreaRadius) this.crosshairY = -this.crosshairAreaRadius;
                        if (this.crosshairY > this.crosshairAreaRadius) this.crosshairY = this.crosshairAreaRadius;


                        ig.meshManager.crosshairPoint.position.x = ig.meshManager.target.position.x + this.crosshairX * this.cameraPositionRatio;
                        ig.meshManager.crosshairPoint.position.y = ig.meshManager.target.position.y + this.crosshairY * this.cameraPositionRatio;

                    } else {
                        ig.cameraControl.targetFov = ig.cameraControl.fovRelaxing;
                        if (this.isAiming) {
                            this.isAiming = false;
                            this.allowShooting = false;
                            ig.babylonSceneController.arrow.launchNextFrame = true;
                        }
                    }
                }

                ig.babylonSceneController.arrow.isAiming = this.isAiming;
                // console.log(ig.babylonSceneController.cameraControl.targetFov, isTouching)
            },

            draw: function () {
                this.parent();

                var ctx = ig.system.context;
                ctx.clearRect(0, 0, ig.system.width, ig.system.height);

                ctx.save();

                if (this.isAiming) {
                    ctx.save();

                    ctx.translate(ig.system.width / 2, ig.system.height / 2)
                    ctx.fillStyle = "#000000";
                    ctx.beginPath();
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

                    ctx.restore();

                    if (this.showAimController) {
                        ctx.fillStyle = "#000000";
                        ctx.strokeStyle = "#000000"
                        ctx.lineWidth = 2;

                        ctx.beginPath();
                        ctx.arc(this.aimCenterX, this.aimCenterY, 10, 0, Math.PI * 2)
                        ctx.fill();

                        ctx.beginPath();
                        ctx.arc(this.aimCenterX, this.aimCenterY, 50, 0, Math.PI * 2)
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.arc(this.aimControlX, this.aimControlY, 5, 0, Math.PI * 2)
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(this.aimCenterX, this.aimCenterY)
                        ctx.lineTo(this.aimControlX, this.aimControlY)
                        ctx.stroke();
                    }
                }

                ctx.restore();


            },
        });
    });