ig.module('plugins.splash-loader')
    .requires(
        'impact.loader',
        'impact.animation'
    )
    .defines(function () {
        ig.SplashLoader = ig.Loader.extend({
            desktopCoverDIVID: "play-desktop",


            titleImage: new ig.Image("media/graphics/game/title-small.png"),

            init: function (gameClass, resources) {

                this.parent(gameClass, resources);

                var game = ig.domHandler.getElementById('#game');
                var webglgame = ig.domHandler.getElementById('#webgl');

                ig.domHandler.setZIndex(game, 1);
                ig.domHandler.setZIndex(webglgame, 0);


                // ADS
                ig.apiHandler.run("MJSPreroll");
            },

            end: function () {
                this.parent();
                this._drawStatus = 1;
                this.draw();

                if (ig.altBabylon.scene) {
                    this.startGame();
                } else {
                    ig.altBabylon.onSceneReady.addOnce(this.startGame.bind(this));
                }
            },

            startGame: function () {
                return
                this._drawStatus = 1;
                this.draw();

                if (_SETTINGS['TapToStartAudioUnlock']['Enabled']) {
                    this.tapToStartDiv(function () {
                        /* play game */
                        ig.system.setGame(MyGame);
                    });
                } else {
                    /* play game */
                    ig.system.setGame(MyGame);
                }
            },

            tapToStartDiv: function (onClickCallbackFunction) {
                var _this = this;

                this.desktopCoverDIV = document.getElementById(this.desktopCoverDIVID);

                // singleton pattern
                if (this.desktopCoverDIV) {
                    return;
                }

                /* create DIV */
                this.desktopCoverDIV = document.createElement("div");
                this.desktopCoverDIV.id = this.desktopCoverDIVID;
                this.desktopCoverDIV.setAttribute("class", "play");
                this.desktopCoverDIV.setAttribute("style", "position: absolute; display: block; z-index: 999999; background-color: rgba(23, 32, 53, 0.7); visibility: visible; font-size: 10vmin; text-align: center; vertical-align: middle; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;");
                this.desktopCoverDIV.innerHTML = "<div style='color:white;background-color: rgba(255, 255, 255, 0.3); border: 2px solid #fff; font-size:20px; border-radius: 5px; position: relative; float: left; top: 50%; left: 50%; transform: translate(-50%, -50%);'><div style='padding:20px 50px; font-family: montserrat;'>" + _STRINGS["Splash"]["TapToStart"] + "</div></div>";


                /* inject DIV */
                var parentDIV = document.getElementById("play").parentNode || document.getElementById("ajaxbar");
                parentDIV.appendChild(this.desktopCoverDIV);

                /* reize DIV */
                try {
                    if (typeof (ig.sizeHandler) !== "undefined") {
                        if (typeof (ig.sizeHandler.coreDivsToResize) !== "undefined") {
                            ig.sizeHandler.coreDivsToResize.push(("#" + this.desktopCoverDIVID));

                            if (typeof (ig.sizeHandler.reorient) === "function") {
                                ig.sizeHandler.reorient();
                            }
                        }
                    }
                    else if (typeof (coreDivsToResize) !== "undefined") {
                        coreDivsToResize.push(this.desktopCoverDIVID);
                        if (typeof (sizeHandler) === "function") {
                            sizeHandler();
                        }
                    }
                } catch (error) {
                    console.log(error);
                }

                /* click DIV */
                this.desktopCoverDIV.addEventListener("click", function () {
                    ig.soundHandler.unlockWebAudio();

                    /* hide DIV */
                    this.setAttribute("style", "visibility: hidden;");

                    /* end function */
                    if (typeof (onClickCallbackFunction) === "function") {
                        onClickCallbackFunction();
                    }
                });
            },


            draw: function () {
                var ctx = ig.system.context;
                ctx.save();
                // ctx.clearRect(0, 0, ig.system.width, ig.system.height);
                ctx.fillStyle = "#cff0d5";
                ctx.fillRect(0, 0, ig.system.width, ig.system.height);

                var drawPoint = ig.responsive.toAnchor(0, 0, "default");

                this.titleImage.draw(drawPoint.x + 270 - this.titleImage.width / 2, drawPoint.y + 250 - this.titleImage.height / 2);


                if (!ig.babylonJSSupport) {
                    var ctx = ig.system.context;
                    ctx.fillStyle = '#ffffff';
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 8;
                    ctx.lineJoin = "round";
                    ctx.textAlign = "center";
                    ctx.font = "54px mainfont";
                    ctx.strokeText("UNABLE TO RUN GAME", drawPoint.x + 270, 760);
                    ctx.fillText("UNABLE TO RUN GAME", drawPoint.x + 270, 760);
                    ctx.font = "28px mainfont";
                    ctx.strokeText("THIS BROWSER DOES NOT SUPPORT WEBGL", drawPoint.x + 270, 800);
                    ctx.fillText("THIS BROWSER DOES NOT SUPPORT WEBGL", drawPoint.x + 270, 800);
                    return;
                }


                this._drawStatus += (this.status - this._drawStatus) / 5;

                if (!ig.altBabylon.scene && this._drawStatus > 0.95) this._drawStatus = 0.95

                ctx.globalAlpha = 0.5;
                //ctx, x, y, width, height, radius, fill, stroke

                var x = 50;
                var y = 870;
                var width = 440;
                var height = 30;
                var radius = 17;
                var color = '#65a888';
                var shadowColor = '#ffffff';

                ctx.lineWidth = 2;
                ctx.fillStyle = shadowColor;
                ctx.strokeStyle = shadowColor;
                ctx.globalAlpha = 1;
                ig.drawRoundRect(ctx, drawPoint.x + x, drawPoint.y + y, width, height, radius + 2, true, true);

                ctx.lineWidth = 4;
                ctx.fillStyle = color;
                ctx.strokeStyle = "#ffffff";
                ctx.globalAlpha = 1;
                ig.drawRoundRect(ctx, drawPoint.x + x, drawPoint.y + y, width, height, radius, false, true);

                ctx.fillStyle = color;
                ctx.strokeStyle = color;
                var fillWidth = (width - 10) * this._drawStatus;
                if (fillWidth < radius + 5) fillWidth = radius + 5;
                ig.drawRoundRect(ctx, drawPoint.x + x + 5, drawPoint.y + y + 5, fillWidth, height - 10, radius - 5, true, false);

                ctx.restore();
                this.drawVersion();
            },

            drawVersion: function () {
                if (typeof (_SETTINGS.Versioning) !== "undefined" && _SETTINGS.Versioning !== null) {
                    if (_SETTINGS.Versioning.DrawVersion) {
                        var ctx = ig.system.context;
                        fontSize = _SETTINGS.Versioning.FontSize,
                            fontFamily = _SETTINGS.Versioning.FontFamily,
                            fillStyle = _SETTINGS.Versioning.FillStyle
                        ctx.save();
                        ctx.textBaseline = "bottom";
                        ctx.textAlign = "left";
                        ctx.font = fontSize + " " + fontFamily || "10px Arial";
                        ctx.fillStyle = fillStyle || '#ffffff';
                        ctx.fillText("v" + _SETTINGS.Versioning.Version + "+build." + _SETTINGS.Versioning.Build, 10, ig.system.height - 10);
                        ctx.restore();
                    }
                }
            }

        });
    });