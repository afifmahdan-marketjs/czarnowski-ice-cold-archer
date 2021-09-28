ig.module(
    'plugins.handlers.visibility-handler'
)
.requires(
    'plugins.audio.sound-handler'
)
.defines(function(){
    ig.VisibilityHandler = ig.Class.extend({
        version: "1.0.2", 
        config: {
            allowResumeWithoutFocus: {
                desktop: true,
                mobile: {
                    kaios: false,
                    default: true
                }
            },
            handlerDelay: {
                desktop: 0,
                mobile: {
                    kaios: 0,
                    default: 0
                }
            },
            autoFocusOnResume: {
                desktop: true, 
                mobile: {
                    kaios: false,
                    default: true
                }
            },
            autoFocusAfterResume: {
                desktop: true,
                mobile: {
                    kaios: false,
                    default: true
                }
            }
        },
        browserPrefixes: ["o", "ms", "moz", "webkit"], 
        
        browserPrefix: null,
        hiddenPropertyName: null,
        visibilityEventName: null, 
        visibilityStateName: null,
        
        isShowingOverlay: false, 
        isFocused: false, 
        isPaused: false, 
        
        init: function() {
            this.initVisibilityHandler();
            this.initFocusHandler();
            this.initPageTransitionHandler();
            
            ig.visibilityHandler = this;
        },
        
        pauseHandler: function() {
            if (ig.game)
            {
                ig.game.pauseGame();
            }
            if (wgl.system)
            {
                wgl.system.stopRender();
            }

            if (ig.soundHandler)
            {
                ig.soundHandler.forceMuteAll();
            }
        },
        
        resumeHandler: function() {
            if (ig.game)
            {
                ig.game.resumeGame();
            }
            if (wgl.system)
            {
                wgl.system.startRender();
            }

            if (ig.soundHandler)
            {
                ig.soundHandler.forceUnMuteAll();
            }
        },
        
        initVisibilityHandler: function() { 
            this.browserPrefix = this.getBrowserPrefix();
            this.hiddenPropertyName = this.getHiddenPropertyName(this.browserPrefix);
            this.visibilityEventName = this.getVisibilityEventName(this.browserPrefix);
            this.visibilityStateName = this.getVisibilityStateName(this.browserPrefix);
            
            if (this.visibilityEventName) {
                document.addEventListener(this.visibilityEventName, this.onChange.bind(this), true);   /* the content of a tab has become visible or has been hidden */
            }
        },
        
        initFocusHandler: function() {
            window.addEventListener("blur", this.onChange.bind(this), true); /* window element has lost focus (does not bubble) */
            document.addEventListener("blur", this.onChange.bind(this), true);   /* document element has lost focus (does not bubble) */
            document.addEventListener("focusout", this.onChange.bind(this), true);   /* document element is about to lose focus (bubbles) */
            
            window.addEventListener("focus", this.onChange.bind(this), true);    /* window element has received focus (does not bubble) */
            document.addEventListener("focus", this.onChange.bind(this), true);  /* document element has received focus (does not bubble) */
            document.addEventListener("focusin", this.onChange.bind(this), true);    /* document element is about to receive focus (bubbles) */
        },
        
        initPageTransitionHandler: function() {
            window.addEventListener("pagehide", this.onChange.bind(this), true); /* a session history entry is being traversed from */
            window.addEventListener("pageshow", this.onChange.bind(this), true); /* a session history entry is being traversed to */
        },
        
        getBrowserPrefix: function() {
            var browserPrefix = null;
            
            this.browserPrefixes.forEach(function(prefix) {
                if (this.getHiddenPropertyName(prefix) in document) {
                    browserPrefix = prefix;
                    return browserPrefix;
                }
            }.bind(this));
            
            return browserPrefix;
        },
                
        getHiddenPropertyName: function(prefix) {
            return (prefix ? prefix + "Hidden" : "hidden");
        },
        
        getVisibilityEventName: function(prefix) {
            return (prefix ? prefix : "") + "visibilitychange";
        }, 
        
        getVisibilityStateName: function(prefix) {
            return (prefix ? prefix + "VisibilityState" : "visibilityState");
        },
        
        hasView: function() {
            return !(document[this.hiddenPropertyName] || document[this.visibilityStateName] !== "visible");
        },
        
        hasFocus: function() {
            return (document.hasFocus() || this.isFocused);
        },
        
        onOverlayShow: function() {
            this.systemPaused();
            this.isShowingOverlay = true;
        },
        
        onOverlayHide: function() {
            this.isShowingOverlay = false;
            this.systemResumed();
        },
        
        systemPaused: function(event) {
            if (this.isPaused) {
                return false;
            }
            
            this.pauseHandler();
            
            this.isPaused = true;
            
            return true;
        },
        
        systemResumed: function(event) {
            if ( !this.isPaused ) { return false; }
            if ( !this.hasView() || this.isShowingOverlay) { return false; }
            if ( !this.hasFocus() ) {
                if (ig.ua.mobile) {
                    if ( this.isKaiOS() ) {
                        if (!this.config.allowResumeWithoutFocus.mobile.kaios) {
                            return false;
                        }
                    }
                    else {
                        if (!this.config.allowResumeWithoutFocus.mobile.default) {
                            return false;
                        }
                    }
                }
                else {
                    if (!this.config.allowResumeWithoutFocus.desktop) {
                        return false;
                    }
                }
            }
            
            this.focusOnResume();
            
            this.resumeHandler();
            
            this.focusAfterResume();
            
            this.isPaused = false;
            
            return true;
        },
        
        isKaiOS: function() {
            return (/KAIOS/).test(navigator.userAgent) || false;
        },
        
        focusOnResume: function() {
            var canFocus = false; 
            
            if (ig.ua.mobile) {
                if ( this.isKaiOS() ) {
                    canFocus = this.config.autoFocusOnResume.mobile.kaios;
                }
                else {
                    canFocus = this.config.autoFocusOnResume.mobile.default;
                }
            }
            else {
                canFocus = this.config.autoFocusOnResume.desktop;
            }
            
            return canFocus;
        }, 
        
        focusAfterResume: function() {
            var canFocus = false; 
            
            if (ig.ua.mobile) {
                if ( this.isKaiOS() ) {
                    canFocus = this.config.autoFocusAfterResume.mobile.kaios;
                }
                else {
                    canFocus = this.config.autoFocusAfterResume.mobile.default;
                }
            }
            else {
                canFocus = this.config.autoFocusAfterResume.desktop;
            }
            
            return canFocus;
        },
        
        focus: function(canFocus) {
            if (window.focus && canFocus) {
                window.focus();
            }
        },
        
        handleDelayedEvent: function(event) {
            if (!this.hasView() || event.type === 'pause' || event.type === 'pageHide' || event.type === 'blur' || event.type === 'focusout') {   
                if (event.type === "blur" || event.type === "focusout") {
                    this.isFocused = false;
                }
                return this.systemPaused(event);
            }
            else {
                if (event.type === "focus" || event.type === "focusin") {
                    this.isFocused = true;
                }
                
                return this.systemResumed(event);
            }
        },
        
        startDelayedEventHandler: function(event) {
            if (ig.ua.mobile) {
                if ( this.isKaiOS() ) {
                    if (this.config.handlerDelay.mobile.kaios > 0) {
                        window.setTimeout(function(event) {
                            this.handleDelayedEvent(event);
                        }.bind(this, event), this.config.handlerDelay.mobile);
                    }
                    else {
                        this.handleDelayedEvent(event);
                    }
                }
                else {
                    if (this.config.handlerDelay.mobile.default > 0) {
                        window.setTimeout(function(event) {
                            this.handleDelayedEvent(event);
                        }.bind(this, event), this.config.handlerDelay.mobile);
                    }
                    else {
                        this.handleDelayedEvent(event);
                    }
                }
            }
            else {
                if (this.config.handlerDelay.desktop > 0) {
                    window.setTimeout(function(event) {
                        this.handleDelayedEvent(event);
                    }.bind(this, event), this.config.handlerDelay.desktop);
                }
                else {
                    this.handleDelayedEvent(event);
                }
            }
        },
        
        onChange: function(event) {    
            // console.log("Event", event);        
            this.startDelayedEventHandler(event);
        }
    });
});
