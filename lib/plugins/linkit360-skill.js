ig.module('plugins.linkit360-skill')
.requires(
    'plugins.handlers.api-handler', 
    'plugins.validator'
).defines(function() {
    ig.Linkit360Skill = ig.ApiHandler.inject({
        NAME: "Linkit360 Skill API",
        VERSION: "1.0.0",
        parameters: {
            properties: {
                "verbose": {
                    "type": "string",
                    "default": null
                }
            }
        },
        settings: {
            vsk: '',
            validator_id: '',
            project_id: ''
        },

        googleAnalytics: {
            enabled: true,
            hasInit: false,
            gtag: {
                ids: ["G-DJYL5K4HT7"]
            },
            attributes: {
                "src": "https://www.googletagmanager.com/gtag/js",
                "async": true
            }
        },

        gameState: {
            hasStarted: false,
            hasEnded: false
        },

        progressIntervalJobId: null,
        progressData: {
            at: 0,
            score: 0,
            level: 1,
            actions: [],
            timer: null
        },

        init: function(settings) {
            this.mergeSettings(settings);

            // alias
            this.setAlias();

            // get URL parameters
            this.getUrlParameters();

            // Analytics
            this.initGA();

            // whitelabel
            this.whitelabel();

            // reorient on init
            this.reorientGame();

            this.ready();

            // expose functions
            return this;
        },

        ready: function() {
            this.log("Initialized");

            /** Validator */
            try {
                this.validator = new ig.Validator({
                    sk: "JDJhJDEwJGZvajBTOGN5V2RpTmM5NjlQQi4veU8yMjYxT1J3RVM5YW5lck5mZi8vNkQzcmRLa3VBMWV1",
                    vsk: "XiEjXWpBdEdQUHZhVVQ3LmdRck0rKzVlRzwvNUMnKEhTRWhZYyhqeyFUQldyeV9McX1xK3VSWXc=",
                    validator_id: this.settings.validator_id,
                    project_id: this.settings.project_id,
                    callback: {
                        gameFailed: this.trackGameFailed.bind(this)
                    }
                });
            } catch (error) {}
        },

        mergeSettings: function(settings) {
            ig.merge(this.settings, settings);

            if (this.validator) {
                for (var key in settings) {
                    if (this.validator.settings.hasOwnProperty(key)) {
                        this.validator.settings[key] = settings[key];
                    }
                }
            }
        },

        setAlias: function() {
            ig.linkit360Skill = this;
            ig.global.linkit360Skill = window.linkit360Skill = this;
        },

        setProjectId: function(project_id, validator_id) {
            if (typeof (project_id) !== "undefined" && project_id !== null) {
                this.settings.project_id = project_id;
            }
            if (typeof (validator_id) !== "undefined" && validator_id !== null) {
                this.settings.validator_id = validator_id;
            }

            /** Validator - setProjectId */
            try {
                this.validator.setProjectId(project_id, validator_id);
            } catch (error) {}
        },

        setValidatorId: function(validator_id, project_id) {
            if (typeof (validator_id) !== "undefined" && validator_id !== null) {
                this.settings.validator_id = validator_id;
            }
            if (typeof (project_id) !== "undefined" && project_id !== null) {
                this.settings.project_id = project_id;
            }

            /** Validator - setValidatorId */
            try {
                this.validator.setValidatorId(validator_id, project_id);
            } catch (error) {}
        },

        getQueryVariable: function(variable) {
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

            for (var i = 0; i < hashes.length; i++) {
                var match = hashes[i].match(/([^=]+?)=(.+)/);

                if (match) {
                    var key = decodeURIComponent(match[1])
                      , value = decodeURIComponent(match[2]);

                    if (variable === key) {
                        return value;
                    }
                }
            }
        },

        mapUrlParameters: function() {
            if (typeof (this.settings.customUrlParameterName) !== "undefined" && this.settings.customUrlParameterName !== null) {
                for (var key in this.settings.customUrlParameterName) {
                    var defaultName = key
                      , customName = this.settings.customUrlParameterName[key];
                    if (defaultName !== customName) {
                        if (this.parameters.properties.hasOwnProperty(key)) {
                            this.parameters.properties[customName] = this.parameters.properties[key];
                        }
                    }
                }
            }
        },

        rewriteParameters: function() {
            if (typeof (this.settings.customUrlParameterName) !== "undefined" && this.settings.customUrlParameterName !== null) {
                for (var key in this.settings.customUrlParameterName) {
                    var defaultName = key
                      , customName = this.settings.customUrlParameterName[key];
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
                    var type = this.parameters.properties[key].type
                      , defaultValue = this.parameters.properties[key].default
                      , currentValue = this.getQueryVariable(key);

                    if (typeof (defaultValue) !== "undefined" && defaultValue !== null) {
                        this.parameters[key] = defaultValue;
                    }

                    if (typeof (currentValue) !== "undefined" && currentValue !== null) {
                        switch (type) {
                        case "float":
                            this.parameters[key] = parseFloat(currentValue);
                            break;
                        case "integer":
                            this.parameters[key] = parseInt(currentValue);
                            break;
                        case "boolean":
                            this.parameters[key] = (currentValue === "true" || currentValue === "on" || currentValue === "1" || currentValue === "yes");
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

        injectElementTag: function(documentNode, parentNode, tagName, elementId, elementAttributes, elementContent, onloadCallback) {
            if (documentNode.getElementById(elementId)) {
                return;
            }
            if (parentNode === null || typeof (parentNode) === undefined) {
                return;
            }

            var newElement = documentNode.createElement(tagName);
            if (typeof (elementId) === "string" && elementId !== null) {
                newElement.id = elementId;
            }

            if (elementAttributes !== null && typeof (elementAttributes) === "object") {
                for (var attributeKey in elementAttributes) {
                    if (elementAttributes.hasOwnProperty(attributeKey)) {
                        newElement.setAttribute(attributeKey, elementAttributes[attributeKey]);
                    }
                }
            }

            if (elementContent !== null && typeof (elementContent) === "string") {
                newElement.innerHTML = elementContent;
            }

            newElement.onload = onloadCallback;

            parentNode.appendChild(newElement);

            return newElement;
        },

        initGA: function() {
            if (this.googleAnalytics) {
                if (this.googleAnalytics.enabled) {
                    if (this.googleAnalytics.hasInit) {
                        return false;
                    }

                    var attributes = this.googleAnalytics.attributes;

                    this.injectElementTag(window.document, window.document.head, 'script', 'gtag', attributes, null, function(event) {
                        this.googleAnalytics.hasInit = true;
                        window.dataLayer = window.dataLayer || [];

                        function gtag() {
                            dataLayer.push(arguments);
                        }
                        gtag('js', new Date());

                        for (var index = 0; index < this.googleAnalytics.gtag.ids.length; index++) {
                            gtag('config', this.googleAnalytics.gtag.ids[index]);
                        }
                    }
                    .bind(this));
                }
            }
        },

        trackEvent: function(name, data) {
            if (data === null || typeof (data) === "undefined") {
                data = {};
            }

            try {
                if (window.top !== null && typeof (window.top) !== "undefined") {
                    if (window.top.postMessage !== null && typeof (window.top.postMessage) === "function") {
                        window.top.postMessage(JSON.stringify({
                            "name": name,
                            "timestamp": new Date(),
                            "data": data
                        }), "*");
                    }
                }
            } catch (error) {}
        },

        trackGameScore: function(score) {
            score = parseInt(score) || 0;

            this.progressData.score = score;

            /** Validator - trackGameScore */
            try {
                this.validator.trackGameScore(score);
            } catch (error) {}
        },

        trackGameLevel: function(level) {
            level = parseInt(level) || 1;

            this.progressData.level = level;

            this.trackEvent("GameLevelChanged");

            /** Validator - trackGameLevel */
            try {
                this.validator.trackGameLevel(level);
            } catch (error) {}
        },

        trackUserAction: function(actionName) {
            actionName = actionName || "";

            this.progressData.actions.push({
                timestamp: parseInt(this.getInternalGameTimeInMs()),
                action: actionName,
            });

            /** Validator - trackUserAction */
            try {
                this.validator.trackUserAction(actionName);
            } catch (error) {}
        },

        trackGameRestarted: function(successfulCallback, errorCallback) {
            if (this.gameState.hasEnded === true) {
                this.trackGameStarted(successfulCallback, errorCallback);
            } else {
                if (this.gameState.hasStarted === true) {
                    this.trackEvent("GameEnd");
                    this.resetGameState();
                    this.resetGameData();

                    this.progressData.timer = new ig.Timer();

                    this.gameState.hasStarted = true;

                    /** Validator - trackGameRestarted */
                    try {
                        this.validator.trackGameRestarted(function() {
                            this.log("Game restarted");
                            this.trackEvent("GameStart");

                            if (successfulCallback !== null && typeof (successfulCallback) === "function") {
                                successfulCallback();
                            }
                        }
                        .bind(this), function() {
                            this.trackGameFailed();

                            if (errorCallback !== null && typeof (errorCallback) === "function") {
                                errorCallback();
                            }
                        }
                        .bind(this));
                    } catch (error) {}
                } else {
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

            /** Validator - trackGameStarted */
            try {
                this.validator.trackGameStarted(function() {
                    this.log("Game started");
                    this.trackEvent("GameStart");
                    this.gameState.hasStarted = true;
                    this.gameState.hasEnded = false;

                    if (this.progressData.timer === null || typeof (this.progressData.timer) === "undefined") {
                        this.progressData.timer = new ig.Timer();
                    } else {
                        this.progressData.timer.unpause();
                    }

                    if (successfulCallback !== null && typeof (successfulCallback) === "function") {
                        successfulCallback();
                    }
                }
                .bind(this), function() {
                    this.trackGameFailed();

                    if (errorCallback !== null && typeof (errorCallback) === "function") {
                        errorCallback();
                    }
                }
                .bind(this));
            } catch (error) {}
        },

        trackGamePaused: function() {
            if (this.progressData.timer !== null && typeof (this.progressData.timer) !== "undefined") {
                this.progressData.timer.pause();
            }
            this.log("Game paused");
            this.trackEvent("GamePaused");

            /** Validator - trackGamePaused */
            try {
                this.validator.trackGamePaused();
            } catch (error) {}
        },

        trackGameResumed: function() {
            if (this.progressData.timer !== null && typeof (this.progressData.timer) !== "undefined") {
                this.progressData.timer.unpause();
            }
            this.log("Game resumed");
            this.trackEvent("GameResumed");

            /** Validator - trackGameResumed */
            try {
                this.validator.trackGameResumed();
            } catch (error) {}
        },

        trackGameInterrupted: function(score, successfulCallback, errorCallback) {
            if (this.gameState.hasStarted === true && this.gameState.hasEnded !== true) {
                if (this.progressData.timer !== null && typeof (this.progressData.timer) !== "undefined") {
                    this.progressData.timer.pause();
                }
                if (score !== null && score >= 0) {
                    this.progressData.score = parseInt(score);
                }
            }
            this.resetGameState();
            this.resetGameData();

            /** Validator - trackGameInterrupted */
            try {
                this.validator.trackGameInterrupted(score, function() {
                    this.log("Game interrupted");
                    this.trackEvent("GameEnd");

                    if (successfulCallback !== null && typeof (successfulCallback) === "function") {
                        successfulCallback();
                    }
                }
                .bind(this), function() {
                    this.trackGameFailed();

                    if (errorCallback !== null && typeof (errorCallback) === "function") {
                        errorCallback();
                    }
                }
                .bind(this));
            } catch (error) {}
        },

        trackGameEnded: function(score, successfulCallback, errorCallback) {
            if (this.gameState.hasStarted !== true) {
                return;
            }
            if (this.gameState.hasEnded === true) {
                return;
            }
            this.gameState.hasEnded = true;

            if (this.progressData.timer !== null && typeof (this.progressData.timer) !== "undefined") {
                this.progressData.timer.pause();
            }
            if (score !== null && score >= 0) {
                this.progressData.score = parseInt(score);
            }

            /** Validator - trackGameEnded */
            try {
                this.validator.trackGameEnded(score, function() {
                    this.log("Game ended");
                    this.trackEvent("GameEnd");

                    if (successfulCallback !== null && typeof (successfulCallback) === "function") {
                        successfulCallback();
                    }
                }
                .bind(this), function() {
                    this.trackGameFailed();

                    if (errorCallback !== null && typeof (errorCallback) === "function") {
                        errorCallback();
                    }
                }
                .bind(this));
            } catch (error) {}
        },

        trackGameFailed: function() {
            this.log("Game failed");
            this.trackEvent("GameFailed");
        },

        getInternalGameTime: function() {
            var gameTime = 0;

            if (this.progressData.timer !== null && typeof (this.progressData.timer) !== "undefined") {
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

            if (this.progressData.timer !== null && typeof (this.progressData.timer) !== "undefined") {
                endTime = Math.max(0, this.parameters.time - this.getInternalGameTime());
            }

            return endTime;
        },

        getEndGameTimeString: function() {
            return this.formatTimeInMmSs(this.getEndGameTime());
        },

        resetGameState: function() {
            this.gameState.hasStarted = false;
            this.gameState.hasEnded = false;
        },

        resetGameData: function() {
            this.progressData.actions = [];
            this.progressData.timer = null;
            this.progressData.score = 0;
            this.progressData.level = 1;
        },

        reorientGame: function() {
            if (typeof (ig) !== "undefined") {
                if (typeof (ig.sizeHandler) !== "undefined") {
                    if (typeof (ig.sizeHandler.reorient) === "function") {
                        ig.sizeHandler.reorient();
                    }
                }
            }

            if (typeof (orientationHandler) === "function") {
                orientationHandler();
            }
        },

        
        whitelabel: function() {
            if (_SETTINGS && typeof(_SETTINGS) !== "undefined") {
                if (_SETTINGS["Branding"] && typeof(_SETTINGS["Branding"]) !== "undefined") {
                    _SETTINGS["Branding"]["Splash"]["Enabled"] = false;
                    _SETTINGS["Branding"]["Logo"]["Enabled"] = false;
                }
                if (_SETTINGS["DeveloperBranding"] && typeof(_SETTINGS["DeveloperBranding"]) !== "undefined") {
                    _SETTINGS["DeveloperBranding"]["Splash"]["Enabled"] = false;
                }
                if (_SETTINGS["MoreGames"] && typeof(_SETTINGS["MoreGames"]) !== "undefined") {
                    _SETTINGS["MoreGames"]["Enabled"] = false;
                    _SETTINGS["MoreGames"]["Link"] = "https://linkit360.com/";
                }
                if (_SETTINGS["TapToStartAudioUnlock"] && typeof(_SETTINGS["TapToStartAudioUnlock"]) !== "undefined") {
                    _SETTINGS["TapToStartAudioUnlock"]["Enabled"] = false;
                }
            }

            if (MyGame && typeof(MyGame) !== "undefined") {
                MyGame.prototype.dctf = function() {};
            }

            if (ig && typeof(ig.Fullscreen) !== "undefined") {
                ig.Fullscreen.enableFullscreenButton = false;
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
                    if (window.console && typeof (window.console.log) === "function") {
                        console.log("%c [" + this.NAME + " v" + this.VERSION + "] " + message + " ", "color: #FFFFFF; background: #1A1C20;");
                    }
                    break;

                case "trace":
                case "2":
                    if (window.console && typeof (window.console.trace) === "function") {
                        console.trace("%c [" + this.NAME + " v" + this.VERSION + "] " + message + " ", "color: #FFFFFF; background: #1A1C20;");
                    }
                    break;
                }
            }
        }
    });
});
