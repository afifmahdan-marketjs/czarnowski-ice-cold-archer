ig.module("plugins.validator")
    .requires(
        'plugins.handlers.dom-handler',
        'impact.timer',
        'plugins.blowfish'
    )
    .defines(function() {
        ig.Validator = ig.Class.extend({
            NAME: "VALIDATOR",
            VERSION: "1.3.0",
            parameters: {
                properties: {
                    "verbose": {
                        "type": "string",
                        "default": null
                    },
                    "tournament_id": {
                        "type": "string",
                        "default": null
                    },
                    "game_id": {
                        "type": "string",
                        "default": null
                    },
                    "entry_id": {
                        "type": "string",
                        "default": null
                    },
                    "user_id": {
                        "type": "string",
                        "default": null
                    },
                    "user_name": {
                        "type": "string",
                        "default": null
                    },
                    "env": {
                        "type": "string",
                        "default": null
                    },
                    "host": {
                        "type": "string",
                        "default": null
                    },
                    "pvp": {
                        "type": "boolean",
                        "default": null
                    }
                },
            },
            settings: {
                sk: '',
                vsk: '',
                validator_id: '',
                project_id: '',
                showOfflineNotification: true,
                callback: {
                    gameFailed: function() {}
                },
                customUrlParameterName: {
                    "tournament_id": "tournament_id",
                    "game_id": "game_id",
                    "entry_id": "entry_id",
                    "user_id": "user_id",
                    "user_name": "user_name",
                    "env": "env",
                    "host": "host",
                    "pvp": "pvp"
                },
                strings: {
                    loading: "Please wait...",
                    start: "Please wait...",
                    end: "Please wait...",
                    retry: "Retrying ({CURRENT_ATTEMPT}/{MAX_ATTEMPT})",
                    error: "Something went wrong.",
                    offline: "You are offline, please reconnect to the internet."
                },
                gameContainterId: "ajaxbar",
                startAPI: {
                    url: "https://validator.marketjs-cloud.com:8443/api/start",
                    method: "POST",
                    timeout: 5000,
                    attemptInterval: 3333,
                    maxAttempt: 5
                },
                progressAPI: {
                    url: "https://validator.marketjs-cloud.com:8443/api/progress",
                    method: "POST",
                    timeout: 5000,
                    interval: 10000
                },
                endAPI: {
                    url: "https://validator.marketjs-cloud.com:8443/api/end",
                    method: "POST",
                    timeout: 5000,
                    attemptInterval: 3333,
                    maxAttempt: 5
                }
            },

            gameState: {
                hasStarted: false,
                hasStartApiCalled: false,
                startApiAttemptCount: 0,
                hasEnded: false,
                hasEndApiCalled: false,
                endApiAttemptCount: 0,
            },

            progressIntervalJobId: null,
            progressData: {
                at: 0,
                score: 0,
                level: 1,
                actions: [],
                timer: null
            },

            divElements: {
                loader: null,
                popupMessage: null,
                offlineNotification: null
            },

            init: function(settings) {
                this.mergeSettings(settings);

                // alias
                this.setAlias();

                // get URL parameters
                this.getUrlParameters();

                // event listeners
                this.initEventHandlers();

                // overlays
                this.initOverlays();

                this.ready();

                return this;
            },

            ready: function() {
                this.log("Initialized");
            },

            mergeSettings: function(settings) {
                ig.merge(this.settings, settings);
            },

            setAlias: function() {
                ig.validator = this;
                ig.global.validator = window.validator = this;
            },

            setProjectId: function(project_id, validator_id) {
                if (typeof (project_id) !== "undefined" && project_id !== null) {
                    this.settings.project_id = project_id;
                }
                if (typeof (validator_id) !== "undefined" && validator_id !== null) {
                    this.settings.validator_id = validator_id;
                }
            },

            setValidatorId: function(validator_id, project_id) {
                if (typeof (validator_id) !== "undefined" && validator_id !== null) {
                    this.settings.validator_id = validator_id;
                }
                if (typeof (project_id) !== "undefined" && project_id !== null) {
                    this.settings.project_id = project_id;
                }
            },

            getQueryVariable: function(variable) {
                var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

                for (var i = 0; i < hashes.length; i++) {
                    var match = hashes[i].match(/([^=]+?)=(.+)/);

                    if (match) {
                        var key = decodeURIComponent(match[1]),
                            value = decodeURIComponent(match[2]);

                        if (variable === key) {
                            return value;
                        }
                    }
                }
            },
            
            mapUrlParameters: function() {
                if (typeof(this.settings.customUrlParameterName) !== "undefined" && this.settings.customUrlParameterName !== null) {
                    for (var key in this.settings.customUrlParameterName) {
                        var defaultName = key, customName = this.settings.customUrlParameterName[key];
                        if (defaultName !== customName) {
                            if (this.parameters.properties.hasOwnProperty(key)) {
                                this.parameters.properties[customName] = this.parameters.properties[key];
                            }
                        }
                    }
                }
            },

            rewriteParameters: function() {
                if (typeof(this.settings.customUrlParameterName) !== "undefined" && this.settings.customUrlParameterName !== null) {
                    for (var key in this.settings.customUrlParameterName) {
                        var defaultName = key, customName = this.settings.customUrlParameterName[key];
                        if (defaultName !== customName) {
                            if (this.parameters.hasOwnProperty(customName)) {
                                this.parameters[defaultName] = this.parameters[customName];
                            }
                        }
                    }
                }
            },

            getUrlParameters: function() {
                this.mapUrlParameters();
                for (var key in this.parameters.properties) {
                    if (this.parameters.properties.hasOwnProperty(key)) {
                        var type = this.parameters.properties[key].type,
                            defaultValue = this.parameters.properties[key].default,
                            currentValue = this.getQueryVariable(key);

                        if (typeof(defaultValue) !== "undefined" && defaultValue !== null) {
                            this.parameters[key] = defaultValue;
                        }

                        if (typeof(currentValue) !== "undefined" && currentValue !== null) {
                            switch (type) {
                                case "float":
                                    this.parameters[key] = parseFloat(currentValue);
                                    break;
                                case "integer":
                                    this.parameters[key] = parseInt(currentValue);
                                    break;
                                case "boolean":
                                    this.parameters[key] = (
                                            currentValue === "true" 
                                            || currentValue === "on" 
                                            || currentValue === "1" 
                                            || currentValue === "yes"
                                        );
                                    break;

                                default:
                                case "string":
                                    this.parameters[key] = currentValue;
                                    break;
                            }
                        }

                        this.settings.customUrlParameterName
                    }
                }
                this.rewriteParameters();
            },

            initEventHandlers: function() {
                window.addEventListener('online', this.updateOnlineStatus.bind(this));
                window.addEventListener('offline', this.updateOnlineStatus.bind(this));
            },

            initOverlays: function() {
                this.addOfflineOverlay();
            },

            addOfflineOverlay: function() {
                this.divElements.offlineNotification = document.createElement("div");
                this.divElements.offlineNotification.id = "validator-overlay-offline-notification";

                this.divElements.offlineNotification.style.position = "fixed";
                this.divElements.offlineNotification.style.width = '100vw';
                this.divElements.offlineNotification.style.height = "15px";
                this.divElements.offlineNotification.style.textAlign = "center";
                this.divElements.offlineNotification.style.color = "white";
                this.divElements.offlineNotification.style.fontFamily = "Roboto";
                this.divElements.offlineNotification.style.fontSize = "10px";
                this.divElements.offlineNotification.style.zIndex = 100005;
                this.divElements.offlineNotification.innerHTML = this.settings.strings.offline;
                this.divElements.offlineNotification.style.background = 'rgba(255, 0, 0, 0.5)';
                this.divElements.offlineNotification.style.display = 'none';

                //add internet compenent in the body
                document.body.appendChild(this.divElements.offlineNotification);
                $('#' + this.divElements.offlineNotification.id).animate({
                    top: 0
                }, 0);
            },

            updateOnlineStatus: function(event) {
                if (navigator.onLine === true) {
                    this.hideOfflineNotification();

                    if (this.gameState.hasEnded === true && this.gameState.hasEndApiCalled !== true) {
                        this.postEndValidation();
                    }
                    if (this.gameState.hasStarted === true && this.gameState.hasStartApiCalled !== true) {
                        this.postStartValidation(function() {
                            if (this.gameState.hasEnded === true && this.gameState.hasEndApiCalled !== true) {
                                this.postEndValidation();
                            }
                        }.bind(this));
                    }

                } else {
                    if (this.settings.showOfflineNotification === true) {
                        this.showOfflineNotification();
                    }
                }
            },

            hideOfflineNotification: function() {
                this.divElements.offlineNotification.style.background = 'rgba(0, 0, 0, 0)';
                this.divElements.offlineNotification.innerHTML = "";
                this.divElements.offlineNotification.style.display = 'none';
            },

            showOfflineNotification: function() {
                this.divElements.offlineNotification.innerHTML = this.settings.strings.offline;
                this.divElements.offlineNotification.style.background = 'rgba(255, 0, 0, 0.7)';
                this.divElements.offlineNotification.style.display = 'block';
            },

            createPopupDiv: function(divId, divElementName, divContent, callback) {
                var existingDivElement = ig.domHandler.getElementById("#" + divId);
                if (existingDivElement !== null && typeof(existingDivElement) !== "undefined") {
                    return existingDivElement;
                }
                if (this.divElements[divElementName] !== null && typeof(this.divElements[divElementName]) !== "undefined") {
                    return this.divElements[divElementName];
                }

                var parentContainerElement = ig.domHandler.getElementById("#" + this.settings.gameContainterId);
                var newDiv = ig.domHandler.create('div');
                ig.domHandler.attr(newDiv, "id", divId);
                ig.domHandler.attr(newDiv, "class", "validator-overlay-container");
                ig.domHandler.appendChild(parentContainerElement, newDiv);

                ig.domHandler.html(newDiv, divContent);
                this.divElements[divElementName] = newDiv;
                if (typeof(callback) === "function") {
                    callback(newDiv);
                }
                return newDiv;
            },

            injectCustomCss: function(cssString) {
                if (cssString !== null && typeof(cssString) !== "undefined") {
                    var style = ig.domHandler.create("style");

                    ig.domHandler.attr(style, "type", "text/css");

                    if (typeof(cssString) === "string") {
                        ig.domHandler.html(style, cssString);
                    }

                    ig.domHandler.appendToHead(style);
                }
            },

            createLoaderDiv: function() {
                var parentContainerElement = ig.domHandler.getElementById("#" + this.settings.gameContainterId);

                var divId = "validator-loader-container";
                var divElementContent = '<div class="validator-loader-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
                var cssString = '.validator-loader-container{user-select: none;position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,.5);z-index:1009}.validator-loader-spinner{color:official;display:inline-block;position:relative;width:80px;height:80px;left:50%;top:50%;transform:translate(-50%,-50%);-webkit-transform:translate(-50%,-50%)}.validator-loader-spinner div{transform-origin:40px 40px;animation:validator-loader-spinner 1.2s linear infinite}.validator-loader-spinner div:after{content:" ";display:block;position:fixed;top:3px;left:37px;width:6px;height:18px;border-radius:20%;background:#fff}.validator-loader-spinner div:nth-child(1){transform:rotate(0deg);animation-delay:-1.1s}.validator-loader-spinner div:nth-child(2){transform:rotate(30deg);animation-delay:-1s}.validator-loader-spinner div:nth-child(3){transform:rotate(60deg);animation-delay:-.9s}.validator-loader-spinner div:nth-child(4){transform:rotate(90deg);animation-delay:-.8s}.validator-loader-spinner div:nth-child(5){transform:rotate(120deg);animation-delay:-.7s}.validator-loader-spinner div:nth-child(6){transform:rotate(150deg);animation-delay:-.6s}.validator-loader-spinner div:nth-child(7){transform:rotate(180deg);animation-delay:-.5s}.validator-loader-spinner div:nth-child(8){transform:rotate(210deg);animation-delay:-.4s}.validator-loader-spinner div:nth-child(9){transform:rotate(240deg);animation-delay:-.3s}.validator-loader-spinner div:nth-child(10){transform:rotate(270deg);animation-delay:-.2s}.validator-loader-spinner div:nth-child(11){transform:rotate(300deg);animation-delay:-.1s}.validator-loader-spinner div:nth-child(12){transform:rotate(330deg);animation-delay:0s}@keyframes validator-loader-spinner{0%{opacity:1}100%{opacity:0}}';

                this.createPopupDiv(divId, "loader", divElementContent);
                ig.domHandler.attr(this.divElements.loader, "class", "validator-loader-container");
                ig.domHandler.appendChild(parentContainerElement, this.divElements.loader);
                this.injectCustomCss(cssString);
            },

            createPopupMessageDiv: function(message) {
                var parentContainerElement = ig.domHandler.getElementById("#" + this.settings.gameContainterId);

                var divId = "validator-popup-message-container";
                var divElementContent = '<div class="validator-popup-message-container"><div class="validator-popup-message-content-center">' + message + '</div></div>';
                var cssString = '.validator-popup-message-container{user-select: none;position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,.5);z-index:1010}.validator-popup-message-content-center{color:white;font-size:3vmin;font-weight:bold;text-align: center;float:left;margin:auto;padding:auto;position:fixed;top:70%;left:50%;-webkit-transform:translate(-50%,-50%);-moz-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);-o-transform:translate(-50%,-50%);transform:translate(-50%,-50%)}';

                this.createPopupDiv(divId, "popupMessage", divElementContent);
                ig.domHandler.attr(this.divElements.popupMessage, "class", "validator-popup-message-container");
                ig.domHandler.appendChild(parentContainerElement, this.divElements.popupMessage);
                this.injectCustomCss(cssString);
            },

            showLoader: function() {
                if (this.divElements.loader === null || typeof(this.divElements.loader) === "undefined") {
                    this.createLoaderDiv();
                }
                ig.domHandler.show(this.divElements.loader);
                if (ig.visibilityHandler !== null && typeof(ig.visibilityHandler) !== "undefined") {
                    if (typeof(ig.visibilityHandler.onOverlayShow) === "function") {
                        ig.visibilityHandler.onOverlayShow("Validator Loader");
                    }
                }
            },

            pauseGame: function() {
                if (ig.game !== null && typeof(ig.game) !== "undefined") {
                    if (ig.game.pause !== null && typeof(ig.game.pause) === "function") {
                        ig.game.pause(true);
                    }
                    if (ig.game.pauseGame !== null && typeof(ig.game.pauseGame) === "function") {
                        ig.game.pauseGame(true);
                    }
                    if (ig.game.paused !== null && typeof(ig.game.paused) === "function") {
                        ig.game.paused(true);
                    }
                }
            },

            resumeGame: function() {
                if (ig.game !== null && typeof(ig.game) !== "undefined") {
                    if (ig.game.resume !== null && typeof(ig.game.resume) === "function") {
                        ig.game.resume(true);
                    }
                    if (ig.game.resumeGame !== null && typeof(ig.game.resumeGame) === "function") {
                        ig.game.resumeGame(true);
                    }
                    if (ig.game.resumed !== null && typeof(ig.game.resumed) === "function") {
                        ig.game.resumed(true);
                    }

                    if (ig.game.unpause !== null && typeof(ig.game.unpause) === "function") {
                        ig.game.unpause(true);
                    }
                    if (ig.game.unpauseGame !== null && typeof(ig.game.unpauseGame) === "function") {
                        ig.game.unpauseGame(true);
                    }
                    if (ig.game.unpaused !== null && typeof(ig.game.unpaused) === "function") {
                        ig.game.unpaused(true);
                    }
                }
            },

            hideLoader: function() {
                if (this.divElements.loader !== null && typeof(this.divElements.loader) !== "undefined") {
                    ig.domHandler.hide(this.divElements.loader);
                }

                if (ig.visibilityHandler !== null && typeof(ig.visibilityHandler) !== "undefined") {
                    if (typeof(ig.visibilityHandler.onOverlayHide) === "function") {
                        ig.visibilityHandler.onOverlayHide("Validator Loader");
                    }
                }
            },

            showPopupMessage: function(message) {
                if (this.divElements.popupMessage === null || typeof(this.divElements.popupMessage) === "undefined") {
                    this.createPopupMessageDiv(message);
                } else {
                    ig.domHandler.html(this.divElements.popupMessage, '<div class="validator-popup-message-content-center">' + message + '</div>');
                    ig.domHandler.show(this.divElements.popupMessage);
                }

                if (ig.visibilityHandler !== null && typeof(ig.visibilityHandler) !== "undefined") {
                    if (typeof(ig.visibilityHandler.onOverlayShow) === "function") {
                        ig.visibilityHandler.onOverlayShow("Validator Message");
                    }
                }
            },

            hidePopupMessage: function() {
                if (this.divElements.popupMessage !== null && typeof(this.divElements.popupMessage) !== "undefined") {
                    ig.domHandler.hide(this.divElements.popupMessage);
                }

                if (ig.visibilityHandler !== null && typeof(ig.visibilityHandler) !== "undefined") {
                    if (typeof(ig.visibilityHandler.onOverlayHide) === "function") {
                        ig.visibilityHandler.onOverlayHide("Validator Message");
                    }
                }
            },

            trackGameScore: function(score) {
                score = score || 0;

                this.progressData.score = score;
            },

            trackGameLevel: function(level) {
                level = parseInt(level) || 1;

                this.progressData.level = level;
            },

            trackUserAction: function(actionName) {
                actionName = actionName || "";

                this.progressData.actions.push({
                    timestamp: this.getInternalGameTimeInMs(),
                    action: actionName,
                });
            },

            trackGameRestarted: function(successfulCallback, errorCallback) {
                if (this.gameState.hasEnded === true) {
                    this.trackGameStarted(successfulCallback, errorCallback);
                }
                else {
                    if (this.gameState.hasStarted === true) {
                        this.postEndValidation(function() {
                            this.resetGameState();
                            this.resetGameData();
    
                            this.progressData.timer = new ig.Timer();
                            this.postStartValidation(successfulCallback, errorCallback);
                            this.gameState.hasStarted = true;
    
                            this.log("Game restarted");
                            if (successfulCallback !== null && typeof(successfulCallback) === "function") {
                                successfulCallback();
                            }
                        }.bind(this), function() {
                            this.log("Game failed to restart");
                            this.trackGameFailed();
                            if (errorCallback !== null && typeof(errorCallback) === "function") {
                                errorCallback();
                            }
                        }.bind(this));
                    }
                    else {
                        this.trackGameStarted(successfulCallback, errorCallback);
                    }
                }
            },

            trackGameStarted: function(successfulCallback, errorCallback) {
                if (this.gameState.hasEnded === true) {
                    this.resetGameState();
                }
                if (this.gameState.hasStarted === true) {
                    return;
                }
                this.resetGameState();
                this.resetGameData();
                
                this.postStartValidation(function() {
                    this.log("Game started");
                    this.gameState.hasStarted = true;

                    if (this.progressData.timer === null || typeof(this.progressData.timer) === "undefined") {
                        this.progressData.timer = new ig.Timer();
                    } else {
                        this.progressData.timer.unpause();
                    }
                    if (successfulCallback !== null && typeof(successfulCallback) === "function") {
                        successfulCallback();
                    }
                }.bind(this), function() {
                    this.log("Game failed to start");
                    this.trackGameFailed();
                    if (errorCallback !== null && typeof(errorCallback) === "function") {
                        errorCallback();
                    }
                }.bind(this));
            },

            trackGamePaused: function() {
                if (this.progressData.timer !== null && typeof(this.progressData.timer) !== "undefined") {
                    this.progressData.timer.pause();
                }
                this.log("Game paused");
            },

            trackGameResumed: function() {
                if (this.progressData.timer !== null && typeof(this.progressData.timer) !== "undefined") {
                    this.progressData.timer.unpause();
                }
                this.log("Game resumed");
            },

            trackGameInterrupted: function(score, successfulCallback, errorCallback) {
                if (this.gameState.hasStarted === true && this.gameState.hasEnded !== true) {
                    if (this.progressData.timer !== null && typeof(this.progressData.timer) !== "undefined") {
                        this.progressData.timer.pause();
                    }
                    if (score !== null && score >= 0) {
                        this.progressData.score = score;
                    }
                    this.postEndValidation(function() {
                        this.resetGameState();
                        this.resetGameData();
                        this.stopProgressInterval();

                        this.log("Game interrupted");
                        if (successfulCallback !== null && typeof(successfulCallback) === "function") {
                            successfulCallback();
                        }
                    }.bind(this), function() {
                        this.log("Game failed to interrupt");
                        this.trackGameFailed();
                        if (errorCallback !== null && typeof(errorCallback) === "function") {
                            errorCallback();
                        }
                    }.bind(this));
                }
            },

            trackGameEnded: function(score, successfulCallback, errorCallback) {
                if (this.gameState.hasStarted !== true) {
                    return;
                }
                if (this.gameState.hasEnded === true) {
                    return;
                }
                this.gameState.hasEnded = true;

                if (this.progressData.timer !== null && typeof(this.progressData.timer) !== "undefined") {
                    this.progressData.timer.pause();
                }
                if (score !== null && score >= 0) {
                    this.progressData.score = score;
                }
                this.stopProgressInterval();
                this.postEndValidation(function() {
                    this.log("Game ended");
                    if (successfulCallback !== null && typeof(successfulCallback) === "function") {
                        successfulCallback();
                    }
                }.bind(this), function() {
                    this.log("Game failed to end");
                    this.trackGameFailed();
                    if (errorCallback !== null && typeof(errorCallback) === "function") {
                        errorCallback();
                    }
                }.bind(this));
            },

            trackGameFailed: function() {
                this.log("Game failed");

                if (typeof(this.settings.callback) !== "undefined" && this.settings.callback !== null) {
                    if (typeof(this.settings.callback.gameFailed) === "function") {
                        this.settings.callback.gameFailed();
                    }
                }
            },

            getInternalGameTime: function() {
                var gameTime = 0;

                if (this.progressData.timer !== null && typeof(this.progressData.timer) !== "undefined") {
                    gameTime = this.progressData.timer.delta();
                }

                return gameTime;
            },

            getInternalGameTimeInMs: function() {
                return this.getInternalGameTime() * 1000;
            },

            formatTimeInMmSs: function(second) {
                var min = Math.floor(second / 60);
                var sec = Math.floor(second % 60);
                return (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
            },

            getEndGameTime: function() {
                var endTime = this.parameters.time;

                if (this.progressData.timer !== null && typeof(this.progressData.timer) !== "undefined") {
                    endTime = Math.max(0, this.parameters.time - this.getInternalGameTime());
                }

                return endTime;
            },

            getEndGameTimeString: function() {
                return this.formatTimeInMmSs(this.getEndGameTime());
            },

            getInputIntervalMin: function() {
                var input_interval_min = Infinity;

                if (this.progressData.actions.length >= 2) {
                    for (var actionIndex = this.progressData.actions.length - 1; actionIndex > 0; actionIndex--) {
                        var currentAction = this.progressData.actions[actionIndex], previousAction = this.progressData.actions[actionIndex-1];
                        var deltaTime = (currentAction.timestamp - previousAction.timestamp)/1000;
                        if (typeof(input_interval_min) === "undefined" 
                            || input_interval_min === null 
                            || input_interval_min === Infinity 
                            || isNaN(input_interval_min)) {
                            input_interval_min = deltaTime;
                        }
                        input_interval_min = Math.min(input_interval_min, deltaTime)
                    }
                }
                return input_interval_min;
            },

            getInputIdleMax: function() {
                var input_idle_max = 0, input_interval_max = 0;

                if (this.progressData.actions.length >= 1) {
                    if (this.progressData.actions.length >= 2) {
                        for (var actionIndex = this.progressData.actions.length - 1; actionIndex > 0; actionIndex--) {
                            var currentAction = this.progressData.actions[actionIndex], previousAction = this.progressData.actions[actionIndex-1];
                            var deltaTime = (currentAction.timestamp - previousAction.timestamp)/1000;
                            
                            if (typeof(input_interval_max) === "undefined" 
                                || input_interval_max === null 
                                || isNaN(input_interval_max) 
                                || input_interval_max === 0) {
                                    input_interval_max = deltaTime;
                            }
                            input_interval_max = Math.max(input_interval_max, deltaTime);
                        }
                    }
                    input_interval_max = Math.max(input_interval_max, this.progressData.actions[0].timestamp/1000);

                    input_idle_max = Math.max(input_interval_max, this.getInternalGameTime()-this.progressData.actions[this.progressData.actions.length-1].timestamp/1000);
                }
                else {
                    input_idle_max = this.getInternalGameTime();
                }
                return input_idle_max;
            },

            resetGameState: function() {
                this.gameState.hasStarted = false;
                this.gameState.hasEnded = false;

                this.gameState.hasStartApiCalled = false;
                this.gameState.hasEndApiCalled = false;

                this.gameState.startApiAttemptCount = 0;
                this.gameState.endApiAttemptCount = 0;
            },

            resetGameData: function() {
                this.progressData.actions = [];
                this.progressData.timer = null;
                this.progressData.score = 0;
                this.progressData.level = 1;
            },

            setValidatorKey: function(key) {
                this.settings.vsk = key;
            },

            getEnc: function(obj) {
                var data = JSON.stringify(obj);

                if (this.settings.vsk !== "" && this.settings.vsk !== null && typeof(this.settings.vsk) !== "undefined") {
                    var payload = data;
                    try {
                        payload = window.btoa((new Blowfish(window.atob(this.settings.vsk))).encrypt(payload));
                    } catch (error) {}

                    data = {
                        "project_id": this.settings.project_id,
                        "validator_id": this.settings.validator_id,
                        "payload": payload
                    };

                    data = JSON.stringify(data);
                }

                if (this.settings.sk !== null && typeof(this.settings.sk) !== "undefined" && this.settings.sk !== "") {
                    try {
                        data = window.btoa((new Blowfish(window.atob(this.settings.sk))).encrypt(data));
                    } catch (error) {}
                }

                return data;
            },

            startProgressInterval: function() {
                if (this.progressIntervalJobId === null || typeof(this.progressIntervalJobId) === "undefined") {
                    this.progressIntervalJobId = window.setInterval(function() {
                        this.postProgressValidation();
                    }.bind(this), this.settings.progressAPI.interval);
                }
                return this.progressIntervalJobId;
            },

            stopProgressInterval: function() {
                if (this.progressIntervalJobId !== null && typeof(this.progressIntervalJobId) !== "undefined") {
                    window.clearInterval(this.progressIntervalJobId);
                    this.progressIntervalJobId = null;
                }
                return this.progressIntervalJobId;
            },

            postStartValidation: function(successfulCallback, errorCallback) {
                var message = this.settings.strings.loading;
                this.pauseGame();
                this.showLoader();
                this.showPopupMessage(message);

                var data = this.getEnc(JSON.parse(JSON.stringify({
                    "project_id": this.settings.project_id,
                    "validator_id": this.settings.validator_id,
                    "tournament_id": this.parameters.tournament_id,
                    "game_id": this.parameters.game_id,
                    "entry_id": this.parameters.entry_id,
                    "user_id": this.parameters.user_id,
                    "user_name": this.parameters.user_name,
                    "env": this.parameters.env,
                    "host": this.parameters.host,
                    "pvp": this.parameters.pvp
                })));

                var retryCallback = function() {
                    if (this.gameState.startApiAttemptCount >= this.settings.startAPI.maxAttempt) {
                        this.log("Game start validation failed");
                        if (errorCallback !== null && typeof(errorCallback) === "function") {
                            errorCallback();
                        }

                        this.showPopupMessage(this.settings.strings.error);
                        this.pauseGame();
                    } else {
                        window.setTimeout(function() {
                            this.postStartValidation(successfulCallback, errorCallback);
                        }.bind(this), this.settings.startAPI.attemptInterval);
                    }
                }.bind(this);

                if (this.gameState.startApiAttemptCount < this.settings.startAPI.maxAttempt) {
                    this.gameState.startApiAttemptCount++;

                    if (this.gameState.startApiAttemptCount >= 2) {
                        message = this.settings.strings.retry;
                    } else {
                        message = this.settings.strings.start;
                    }
                    message = message.replace("{CURRENT_ATTEMPT}", this.gameState.startApiAttemptCount).replace("{MAX_ATTEMPT}", this.settings.startAPI.maxAttempt);
                    this.showPopupMessage(message);

                    this.callXHR(this.settings.startAPI.method, this.settings.startAPI.url, this.settings.startAPI.timeout, {
                        "Content-Type": this.getContentType()
                    }, data, function(response) {
                        if (response.access_token !== null && typeof(response.access_token) !== "undefined") {
                            this.log("Game start successfully validated");
                            this.progressData.at = response.access_token;
                            if (successfulCallback !== null && typeof(successfulCallback) === "function") {
                                successfulCallback(response);
                            }
                            this.hideLoader();
                            this.hidePopupMessage();
                            this.gameState.hasStartApiCalled = true;
                            this.resumeGame();

                            this.startProgressInterval();
                        } else {
                            retryCallback();
                        }
                    }.bind(this), function(response) {
                        retryCallback();
                    }.bind(this));
                } else {
                    retryCallback();
                }
            },

            postProgressValidation: function(successfulCallback, errorCallback) {
                if (this.gameState.hasStartApiCalled !== true) {
                    return;
                }
                if (this.gameState.hasEndApiCalled === true) {
                    return;
                }

                var data = this.getEnc(JSON.parse(JSON.stringify({
                    "project_id": this.settings.project_id,
                    "validator_id": this.settings.validator_id,
                    "tournament_id": this.parameters.tournament_id,
                    "game_id": this.parameters.game_id,
                    "entry_id": this.parameters.entry_id,
                    "user_id": this.parameters.user_id,
                    "user_name": this.parameters.user_name,
                    "env": this.parameters.env,
                    "host": this.parameters.host,
                    "pvp": this.parameters.pvp,
                    "game_time": this.getInternalGameTimeInMs(),
                    "user_score": this.progressData.score,
                    "user_action": JSON.stringify(this.progressData.actions),
                    "level": this.progressData.level
                })));

                this.callXHR(this.settings.progressAPI.method, this.settings.progressAPI.url, this.settings.progressAPI.timeout, {
                    "Content-Type": this.getContentType(),
                    "Authorization": "Bearer " + this.progressData.at
                }, data, function(response) {
                    if (response.ping_validated !== null && typeof(response.ping_validated) !== "undefined" && response.ping_validated === true) {
                        this.log("Game progress successfully validated");

                        if (successfulCallback !== null && typeof(successfulCallback) === "function") {
                            successfulCallback(response);
                        }
                    } else {
                        this.log("Game progress failed validation");

                        if (errorCallback !== null && typeof(errorCallback) === "function") {
                            errorCallback();
                        }
                    }
                }.bind(this), function(response) {
                    this.log("Game progress failed validation");

                    if (errorCallback !== null && typeof(errorCallback) === "function") {
                        errorCallback();
                    }
                }.bind(this));
            },

            postEndValidation: function(successfulCallback, errorCallback) {
                var message = this.settings.strings.loading;
                this.showLoader();
                this.showPopupMessage(message);
                this.pauseGame();

                var data = this.getEnc(JSON.parse(JSON.stringify({
                    "project_id": this.settings.project_id,
                    "validator_id": this.settings.validator_id,
                    "tournament_id": this.parameters.tournament_id,
                    "game_id": this.parameters.game_id,
                    "entry_id": this.parameters.entry_id,
                    "user_id": this.parameters.user_id,
                    "user_name": this.parameters.user_name,
                    "env": this.parameters.env,
                    "host": this.parameters.host,
                    "pvp": this.parameters.pvp,
                    "game_time": this.getInternalGameTimeInMs(),
                    "user_score": this.progressData.score,
                    "user_action": JSON.stringify(this.progressData.actions),
                    "level": this.progressData.level
                })));

                var retryCallback = function() {
                    if (this.gameState.endApiAttemptCount >= this.settings.endAPI.maxAttempt) {
                        this.log("Game end validation failed");
                        if (errorCallback !== null && typeof(errorCallback) === "function") {
                            errorCallback();
                        }

                        this.showPopupMessage(this.settings.strings.error);
                        this.pauseGame();
                    } else {
                        window.setTimeout(function() {
                            this.postEndValidation(successfulCallback, errorCallback);
                        }.bind(this), this.settings.endAPI.attemptInterval);
                    }
                }.bind(this);

                if (this.gameState.endApiAttemptCount < this.settings.endAPI.maxAttempt) {
                    this.gameState.endApiAttemptCount++;

                    if (this.gameState.endApiAttemptCount >= 2) {
                        message = this.settings.strings.retry;
                    } else {
                        message = this.settings.strings.end;
                    }
                    message = message.replace("{CURRENT_ATTEMPT}", this.gameState.endApiAttemptCount).replace("{MAX_ATTEMPT}", this.settings.endAPI.maxAttempt);
                    this.showPopupMessage(message);

                    this.callXHR(this.settings.endAPI.method, this.settings.endAPI.url, this.settings.endAPI.timeout, {
                        "Content-Type": this.getContentType(),
                        "Authorization": "Bearer " + this.progressData.at
                    }, data, function(response) {
                        if (response.session_validated !== null && typeof(response.session_validated) !== "undefined" && response.session_validated === true) {
                            this.log("Game end successfully validated");

                            if (successfulCallback !== null && typeof(successfulCallback) === "function") {
                                successfulCallback(response);
                            }
                            this.hideLoader();
                            this.hidePopupMessage();
                            this.gameState.hasEndApiCalled = true;
                            this.resumeGame();
                        } else {
                            retryCallback();
                        }
                    }.bind(this), function(response) {
                        retryCallback();
                    }.bind(this));
                } else {
                    retryCallback();
                }
            },

            getContentType: function() {
                var contentType = "application/json";
                if (typeof this.settings.sk !== "undefined" && this.settings.sk !== null && this.settings.sk !== "") {
                    contentType = "text/plain";
                }
                return contentType;
            },

            callXHR: function(method, url, timeout, header, data, successfulCallback, errorCallback) {
                var xhr = new XMLHttpRequest();
                xhr.open(method, url, true);
                xhr.timeout = timeout || 5000;
                if (header !== null && typeof(header) !== "undefined") {
                    for (var key in header) {
                        xhr.setRequestHeader(key, header[key]);
                    }
                }
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        var response = "";
                        try {
                            response = JSON.parse(xhr.responseText);
                            if (xhr.status === 200) {
                                if (successfulCallback !== null && typeof(successfulCallback) === "function") {
                                    successfulCallback(response);
                                }
                            } else {
                                if (errorCallback !== null && typeof(errorCallback) === "function") {
                                    errorCallback();
                                }
                            }
                        } catch (error) {
                            if (errorCallback !== null && typeof(errorCallback) === "function") {
                                errorCallback();
                            }
                        }
                    }
                }.bind(this);

                if (data !== null && typeof(data) !== "undefined") {
                    xhr.send(data);
                } else {
                    xhr.send();
                }
            },

            log: function(message) {
                if (this.parameters.verbose) {
                    switch (this.parameters.verbose) {
                        case "false":
                        case "off":
                        case "0":
                        case "":
                        case null:
                        case undefined:
                            break;

                        default:
                        case "true":
                        case "on":
                        case "1":
                            if (window.console && typeof(window.console.log) === "function") {
                                console.log("%c [" + this.NAME + " v" + this.VERSION + "] " + message + " ", "color: #F35E36; background: #0B31A1;");
                            }
                            break;

                        case "trace":
                        case "2":
                            if (window.console && typeof(window.console.trace) === "function") {
                                console.trace("%c [" + this.NAME + " v" + this.VERSION + "] " + message + " ", "color: #F35E36; background: #0B31A1;");
                            }
                            break;
                    }
                }
            }
        });
    });