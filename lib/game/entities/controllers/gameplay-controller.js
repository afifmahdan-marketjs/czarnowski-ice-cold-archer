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
            arrowBgImage: new ig.Image("media/graphics/game/arrow-bg.png"),
            windIconImage: new ig.Image("media/graphics/game/wind-icon.png"),
            windBgImage: new ig.Image("media/graphics/game/wind-bg.png"),

            allowShooting: true,
            isAiming: false,

            aimCenterX: 0,
            aimCenterY: 0,

            aimControlX: 0,
            aimControlY: 0,

            aimMinimumSpeed: 100,

            crosshairX: 0,
            crosshairY: 0,
            crosshairAreaRadius: 3000,
            crosshairStartAimRadius: 500,
            crosshairSpeedMultiplier: 5,
            cameraPositionRatio: 1 / 50,

            showAimController: false,
            score: 0,

            arrowLeft: 3,
            aimTime: 5,
            aimTimeMax: 8,
            aimTimeTextDistance: 150,

            windFxSpawnDelay: 0,




            init: function (x, y, settings) {
                this.parent(x, y, settings);
                ig.babylonSceneController.arrow.reset();
                this.score = 0;
                this.scoreTf = ig.game.spawnEntity(EntityTextField, 0, 110, { font: "100px mainfont", text: "0", align: "center", color: "#000000", entryType: "fadeIn", exitType: "fadeOut", anchorType: "top", entryDelay: 0.5 });

                this.tutorialTf = ig.game.spawnEntity(EntityTextField, 0, -110, { font: "28px contentfont", text: _STRINGS.Game.Tutorial, lineSpacing: 1.5, align: "center", color: "#ffbc42", outlineColor: "#000000", outlineWeight: 3, entryType: "fadeIn", exitType: "fadeOut", anchorType: "bottom", entryDelay: 0.5 });

                this.aimTimeTf = ig.game.spawnEntity(EntityTextField, 0, this.aimTimeTextDistance, { font: "20px contentfont", text: "", align: "center", color: "#000000", outlineColor: "#ffffff", outlineWeight: 1, entryType: "fadeIn", exitType: "fadeOut", anchorType: "center", entryDelay: 0.5 });

                this.arrowBg = ig.game.spawnEntity(EntityGameObject, 20, 20, { image: this.arrowBgImage, anchorType: "top-left", anchorX: 0, anchorY: 0, entryType: "fadeIn", exitType: "fadeOut" });

                this.arrows = [];
                for (var i = 0; i < this.arrowLeft; i++) {
                    var arrow = ig.game.spawnEntity(EntityGameObject, 32 + i * 23, 45, { image: this.arrowImage, anchorType: "top-left", anchorX: 0, anchorY: 0, scaleX: 0.8, scaleY: 0.85, entryType: "fadeIn", exitType: "fadeOut" });
                    this.arrows.push(arrow);
                }
                this.windBg = ig.game.spawnEntity(EntityGameObject, 150, -110, { image: this.windBgImage, anchorType: "bottom-left", anchorX: 0.5, anchorY: 1, alpha: 0 });
                this.windIcon = ig.game.spawnEntity(EntityGameObject, 150, -150, { image: this.windIconImage, anchorType: "bottom-left", scaleX: 0.35, scaleY: 0.35, anchorX: 0.5, anchorY: 1, alpha: 0 });

                this.pauseButton = ig.game.spawnEntity(EntitySimpleButton, -70, 70, { anchorType: "top-right", image: this.pauseImage, entryType: "fadeIn", exitType: "fadeOut", anchorX: 0.5, anchorY: 0.5, entryDelay: 0.5 });
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
                ig.babylonSceneController.setTargetMovement(0, 10, 10)
                // for (let i = 0; i < 50; i++) {
                //     ig.babylonSceneController.nextTargetMovement()
                // }
                ig.game.sortEntitiesDeferred();

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
                        if (ig.babylonSceneController.arrow.onTarget) {
                            ig.babylonSceneController.arrow.increaseDifficulty()
                            console.log("increaseDifficulty");
                        } else {
                            console.log("keepDifficulty");
                        }
                        this.allowShooting = true;
                        this.isAiming = false;
                        console.log("playAgain");
                    }
                    else {
                        this.delayedCall(2, function () {
                            ig.lastScore = this.score;
                            ig.game.goToLevel("GameOver");
                            ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.crowdApplause);
                            // ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.scoreLow);

                        }.bind(this));
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
                // var windX = 2;
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
                        var spawnX = ig.random.float(0, windX > 0 ? -ig.meshManager.stripeWidth / 2 : ig.meshManager.stripeWidth / 2)
                        var spawnY = ig.random.float(ig.meshManager.targetHeight * 0.5, ig.meshManager.targetHeight * 3)
                        var spawnZ = ig.random.float(ig.meshManager.targetDistance * 0.2, ig.meshManager.targetDistance);
                        ig.meshManager.spawnWindEffect(spawnX, spawnY, spawnZ, fxSpeed);
                    }
                } else {
                    this.windIcon.alpha -= this.windIcon.alpha / 10;
                }

                this.windBg.alpha = this.windIcon.alpha;

                for (var i = 0; i < this.arrows.length; i++) {
                    var arrow = this.arrows[i];
                    if (i < this.arrowLeft) arrow.visible = true;
                    else arrow.visible = false;
                }
            },

            updateInput: function () {
                if (ig.babylonSceneController.paused) return;

                var isTouching = false;
                var touchX = 0;
                var touchY = 0;
                for (var i = 0; i < ig.ToyboxTouch.touches.length; i++) {
                    var t = ig.ToyboxTouch.touches[i];
                        isTouching = true;
                        touchX = t.x;
                    touchY = t.y;
                }

                if (!isTouching && ig.input.state("click")) {
                    isTouching = true;
                    touchX = ig.game.io.mouse.getPos().x;
                    touchY = ig.game.io.mouse.getPos().y;
                }
                if (this.aimTime < 0) isTouching = false;
                if (this.pauseButton.visible) {
                    if (isTouching) {
                        if (this.pauseButton.isInsideBounds(touchX, touchY)) {
                            isTouching = false;
                            this.isTouchingPauseButton = true;
                        }
                    } else {
                        this.isTouchingPauseButton = false;
                    }

                    if (this.isTouchingPauseButton) {
                        isTouching = false;
                    }
                }

                if (this.allowShooting && ig.babylonSceneController.arrow.isRelaxing) {
                    if (isTouching) {
                        if (this.tutorialTf) {
                            this.tutorialTf.exit();
                            this.tutorialTf = null;
                        }
                        ig.cameraControl.targetFov = ig.cameraControl.fovAim;
                        if (!this.isAiming) {
                            var aimCenterRandom = 25;
                            this.aimCenterX = touchX + ig.random.int(-aimCenterRandom, aimCenterRandom);
                            this.aimCenterY = touchY + ig.random.int(-aimCenterRandom, aimCenterRandom);;
                            this.crosshairX = ig.random.int(-this.crosshairStartAimRadius, this.crosshairStartAimRadius) * 2;
                            this.crosshairY = ig.random.int(-this.crosshairStartAimRadius, this.crosshairStartAimRadius) * 2;
                            this.aimTime = this.aimTimeMax

                            ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList["bowDraw" + ig.random.int(1, 5)]);
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

                            ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList["bowRelease" + ig.random.int(1, 5)]);
                            this.aimTime = this.aimTimeMax;
                        }
                    }


                    this.pauseButton.visible = !this.isAiming;

                } else {
                    this.pauseButton.visible = false;
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

                    var outlineColor = "#ffffff";
                    var fillColor = "#000000";
                    var sizeX = 30;
                    var sizeY = 30;
                    var centerGap = 10;
                    var thickness = 2;
                    var outlineThickness = 1;
                    var timePercent = (this.aimTime / this.aimTimeMax);
                    if (timePercent < 0.5) {
                        ctx.globalAlpha = Math.cos(this.aimTime * 7);
                    }

                    ctx.translate(ig.system.width / 2, ig.system.height / 2)

                    ctx.fillStyle = outlineColor;
                    ctx.beginPath();
                    ctx.arc(0, 0, thickness + outlineThickness, 0, Math.PI * 2)
                    ctx.fill();

                    ctx.fillStyle = fillColor;
                    ctx.beginPath();
                    ctx.arc(0, 0, thickness, 0, Math.PI * 2)
                    ctx.fill();


                    sizeX = centerGap + (sizeX - centerGap) * timePercent;
                    sizeY = centerGap + (sizeY - centerGap) * timePercent;

                    ctx.lineCap = "round";

                    //outline
                    ctx.strokeStyle = outlineColor
                    ctx.lineWidth = thickness + outlineThickness * 2;

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

                    //inside
                    ctx.strokeStyle = fillColor
                    ctx.lineWidth = thickness;

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

                    if (timePercent > 0.01) {
                        var angle = Math.PI * 0.5 * timePercent;
                        var centerAngle = Math.PI * 0.5;
                        var startAngle = centerAngle - angle / 2;
                        var endAngle = startAngle + angle;
                        ctx.beginPath();
                        ctx.arc(0, 0, this.aimTimeTextDistance + 10, startAngle, endAngle)

                        ctx.strokeStyle = outlineColor
                        ctx.lineWidth = (thickness + outlineThickness * 2) * 2;
                        ctx.stroke();

                        ctx.lineWidth = thickness * 2;
                        ctx.strokeStyle = fillColor
                        ctx.stroke();
                    }

                    // ctx.
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

                    this.aimTimeTf.alpha += (1 - this.aimTimeTf.alpha) / 5;
                    this.aimTimeTf.text = this.aimTime.toFixed(1) + "s";
                } else {
                    this.aimTimeTf.alpha -= this.aimTimeTf.alpha / 5;
                    this.aimTimeTf.text = "";
                }

                ctx.restore();


            },
        });
    });