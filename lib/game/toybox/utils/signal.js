ig.module('game.toybox.utils.signal')
    .requires(
        'impact.impact'
    )
    .defines(function () {
        "use strict";
        ig.Signal = ig.Class.extend({

            signalListeners: null,
            id: 0,

            init: function (param) {
                this.id = ++ig.Signal._lastId;
                this.signalListeners = [];
            },

            addOnce: function (signalListener, signalContext) {
                this.signalListeners.push({ signalListener: signalListener, signalContext: signalContext, isOnce: true });
            },

            add: function (signalListener, signalContext) {
                this.signalListeners.push({ signalListener: signalListener, signalContext: signalContext, isOnce: false });
            },

            dispatch: function () {
                var i = 0;
                while (i < this.signalListeners.length) {
                    var obj = this.signalListeners[i];
                    // console.log(obj)
                    obj.signalListener.apply(obj.signalContext, arguments);
                    if (obj.isOnce) {
                        this.signalListeners.splice(i, 1);
                    } else {
                        i++;
                    }
                }
            }

        });

        ig.Signal._lastId = 0;

    });
