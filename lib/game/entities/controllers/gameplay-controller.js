ig.module('game.entities.controllers.gameplay-controller')
    .requires(
        'impact.entity',
        'game.entities.popups.pause-popup',
        'game.toybox.objects.ui.buttons.simple-button',
        'game.toybox.controllers.controller',
        'game.entities.objects.score-fx',
        'game.entities.objects.wind-fx'
    )
    .defines(function () {
        EntityGameplayController = EntityController.extend({

            pauseImage: new ig.Image("media/graphics/game/pause-btn.png"),
            targetImage: new ig.Image("media/graphics/game/target.png"),
            arrowImage: new ig.Image("media/graphics/game/arrow-icon.png"),
            windImage: new ig.Image("media/graphics/game/wind3.png"),
            windIconImage: new ig.Image("media/graphics/game/wind-icon.png"),

            allowShooting: true,
            isAiming: false,

            aimCenterX: 0,
            aimCenterY: 0,

            aimControlX: 0,
            aimControlY: 0,

            aimMinimumSpeed: 100,

            crosshairX: 0,
            crosshairY: 0,
            crosshairAreaRadius: 2000,
            crosshairStartAimRadius: 500,
            crosshairSpeedMultiplier: 5,
            cameraPositionRatio: 1 / 50,

            showAimController: false,
            score: 0,

            arrowLeft: 3,
            aimTime: 5,
            aimTimeMax: 6,

            windFxSpawnDelay: 0,



            init: function (x, y, settings) {
                this.parent(x, y, settings);
                ig.babylonSceneController.arrow.reset();
                this.score = 0;
                this.scoreTf = ig.game.spawnEntity(EntityTextField, 0, 80, { font: "90px mainfont", text: "0", align: "center", color: "#000000", entryType: "fadeIn", exitType: "fadeOut", anchorType: "top", entryDelay: 0.5 });

                this.windIcon = ig.game.spawnEntity(EntityGameObject, 150, -150, { image: this.windIconImage, anchorType: "bottom-left", scaleX: 0.35, scaleY: 0.35, anchorX: 0.5, anchorY: 1, alpha: 0 });

                this.pauseButton = ig.game.spawnEntity(EntitySimpleButton, -50, 45, { anchorX: 1, anchorY: 0, anchorType: "top-right", image: this.pauseImage, entryType: "fadeIn", exitType: "fadeOut", anchorX: 0.5, anchorY: 0.5, entryDelay: 0.5 });
                this.pauseButton.onClicked.add(this.onClickPause, this);

                ig.babylonSceneController.paused = false
                ig.babylonSceneController.arrow.resetDifficulty()
                // ig.babylonSceneController.arrow.increaseDifficulty()
                // ig.babylonSceneController.arrow.increaseDifficulty()
                // ig.babylonSceneController.arrow.increaseDifficulty()
                // ig.babylonSceneController.arrow.increaseDifficulty()
                // ig.babylonSceneController.arrow.increaseDifficulty()
                // ig.babylonSceneController.arrow.increaseDifficulty()

                this.allowShooting = true;
                this.isAiming = false;

                ig.babylonSceneController.arrow.onLanded.add(this.onArrowLanded, this);
            },

            onArrowLanded: function () {
                ig.meshManager.crosshairPoint.position.x = 0;
                ig.meshManager.crosshairPoint.position.y = ig.meshManager.targetHeight;

                ig.game.spawnEntity(EntityScoreFx, 0, 0, {
                    score: ig.babylonSceneController.arrow.lastScore,
                    callback: function () {
                        this.score += ig.babylonSceneController.arrow.lastScore;
                    }.bind(this)
                });

                if (ig.babylonSceneController.arrow.lastScore == 0) {
                    this.arrowLeft--;
                }

                this.delayedCall(0.25, function () {
                    if (this.arrowLeft > 0) {
                        ig.babylonSceneController.arrow.resetNextFrame = true;
                        ig.babylonSceneController.arrow.increaseDifficulty()
                        this.allowShooting = true;
                        this.isAiming = false;
                        console.log("playAgain");
                    }
                    else {
                        ig.lastScore = this.score;
                        ig.game.goToLevel("GameOver");

                    }
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
                this.scoreTf.text = Math.round(this.score).toFixed();
                this.scoreTf.visible = (this.score > 0);

                var windX = ig.babylonSceneController.arrow.wind.x;
                if (windX != 0 && (ig.babylonSceneController.arrow.isRelaxing || ig.babylonSceneController.arrow.isAiming)) {
                    this.windIcon.alpha += (1 - this.windIcon.alpha) / 10;
                    this.windIcon.scaleX = this.windIcon.scaleY * (windX < 0 ? -1 : 1);
                    if (this.windFxSpawnDelay > 0) {
                        var dt = ig.system.tick;
                        this.windFxSpawnDelay -= dt;
                    } else {
                        var fxSpeed = windX * ig.windFxFactor;
                        var spacing = 10;
                        this.windFxSpawnDelay = Math.abs(spacing / fxSpeed);
                        var windSwing = 40;
                        ig.game.spawnEntity(EntityWindFx, this.windIcon.anchoredPositionX + (windX < 0 ? windSwing : -windSwing), this.windIcon.anchoredPositionY - 10, { killDistance: windSwing * 2 });
                    }
                } else {
                    this.windIcon.alpha -= this.windIcon.alpha / 10;
                }
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
                if (this.aimTime < 0) isTouching = false;

                if (this.allowShooting && ig.babylonSceneController.arrow.isRelaxing) {
                    if (isTouching) {
                        ig.cameraControl.targetFov = ig.cameraControl.fovAim;
                        if (!this.isAiming) {
                            var aimCenterRandom = 50;
                            this.aimCenterX = touchX + ig.random.int(-aimCenterRandom, aimCenterRandom);
                            this.aimCenterY = touchY + ig.random.int(-aimCenterRandom, aimCenterRandom);;
                            this.crosshairX = ig.random.int(-this.crosshairStartAimRadius, this.crosshairStartAimRadius) * 2;
                            this.crosshairY = ig.random.int(-this.crosshairStartAimRadius, this.crosshairStartAimRadius) * 2;
                            this.aimTime = this.aimTimeMax
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


                        // ig.meshManager.crosshairPoint.position.x = ig.meshManager.target.position.x + this.crosshairX * this.cameraPositionRatio;
                        // ig.meshManager.crosshairPoint.position.y = ig.meshManager.target.position.y + this.crosshairY * this.cameraPositionRatio;
                        ig.meshManager.crosshairPoint.position.x = 0 + this.crosshairX * this.cameraPositionRatio;
                        ig.meshManager.crosshairPoint.position.y = ig.meshManager.targetHeight + this.crosshairY * this.cameraPositionRatio;
                        if (ig.meshManager.crosshairPoint.position.y < 5) ig.meshManager.crosshairPoint.position.y = 5


                        this.aimTime -= dt;

                    } else {
                        ig.cameraControl.targetFov = ig.cameraControl.fovRelaxing;
                        if (this.isAiming) {
                            this.isAiming = false;
                            this.allowShooting = false;
                            ig.babylonSceneController.arrow.launchNextFrame = true;
                            this.aimTime = this.aimTimeMax;
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

                for (var i = 0; i < this.arrowLeft; i++) {
                    this.arrowImage.draw(10 + 20 * i, 10)
                }

                if (this.isAiming) {
                    ctx.save();

                    var sizeX = 30;
                    var sizeY = 30;
                    var centerGap = 5;
                    var timePercent = (this.aimTime / this.aimTimeMax);
                    if (timePercent < 0.5) {
                        ctx.globalAlpha = Math.cos(this.aimTime * 7);
                    }

                    ctx.translate(ig.system.width / 2, ig.system.height / 2)
                    ctx.fillStyle = "#000000";
                    ctx.beginPath();
                    ctx.arc(0, 0, 2, 0, Math.PI * 2)
                    ctx.fill();

                    ctx.strokeStyle = "#000000"
                    ctx.lineWidth = 2;
                    sizeX = centerGap + (sizeX - centerGap) * timePercent;
                    sizeY = centerGap + (sizeY - centerGap) * timePercent;

                    ctx.beginPath();
                    ctx.moveTo(-sizeX, 0)
                    ctx.lineTo(-centerGap, 0)
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(sizeX, 0)
                    ctx.lineTo(centerGap, 0)
                    ctx.stroke();
                    ctx.beginPath();

                    ctx.moveTo(0, -sizeY)
                    ctx.lineTo(0, -centerGap)
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(0, sizeY)
                    ctx.lineTo(0, centerGap)
                    ctx.stroke();
                    ctx.globalAlpha = 1;
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