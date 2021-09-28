ig.module('game.toybox.objects.ui.popups.popup')
    .requires(
        'game.toybox.objects.game-object'
    )
    .defines(function () {

        EntityPopup = EntityGameObject.extend({
            gravityFactor: 0,
            zIndex: 10000,
            controller: null,
            members: [],
            // singleFrameImage: new ig.Image("media/graphics/sprites/transparent.png"),
            entryType: "fadeIn",
            exitType: "fadeOut",
            exitDelay: 0.5,
            isAllowInput: false,

            memberZIndex: 10001,

            init: function (x, y, settings) {
                this.parent(x, y, settings);
            },

            spawnMember: function (memberClass, x, y, settings, zIndex) {
                if (zIndex) settings.zIndex = zIndex;
                var obj = ig.game.spawnEntity(memberClass, x, y, settings);
                if (!zIndex && obj.zIndex < this.zIndex) obj.zIndex = this.memberZIndex++;
                this.members.push(obj);
                if (this.fixedOnCamera) obj.fixedOnCamera = true;
                return obj;
            },

            enter: function () {
                this.parent();
                this.delayedCall(this.entryDelay + this.entryDuration, function () {
                    this.isAllowInput = true
                }.bind(this));
            },

            exit: function () {
                this.parent();
                this.isAllowInput = false;

                this.callControllerCallback();

                for (var i = 0; i < this.members.length; i++) {
                    this.members[i].exit();
                }
            },

            callControllerCallback: function () {
                if (this.controller && this.controller.onPopupFinished) {
                    var duration = this.exitDelay + this.exitDuration - 0.1;
                    if (duration <= 0) {
                        this.controller.onPopupFinished(this.name);
                    }
                    else {
                        this.delayedCall(duration, function () { this.controller.onPopupFinished(this.name); }.bind(this));
                    }
                }
            }

        });
    });