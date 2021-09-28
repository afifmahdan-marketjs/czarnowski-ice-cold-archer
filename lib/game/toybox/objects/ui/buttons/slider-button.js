ig.module('game.toybox.objects.ui.buttons.slider-button')
    .requires(
        'game.toybox.objects.ui.buttons.simple-button',
        'game.toybox.objects.game-object'
    )
    .defines(function () {

        EntitySliderButton = EntitySimpleButton.extend({
            zIndex: 11000,

            onStopSliding: null,
            value: 0,

            xMin: 0,
            xMax: 0,
            yMin: 0,
            yMax: 0,

            indicatorOffsetX: 0,
            indicatorOffsetY: 0,

            indicator: null,
            indicatorImage: null,

            isHorizontal: true,

            isSliding: false,
            inputEnabled: true,

            pair: null,

            init: function (x, y, settings) {
                this.onStopSliding = new ig.Signal();
                this.parent(x, y, settings);

                if (this.xMax == 0) this.xMax = this.width;
                if (this.yMax == 0) this.yMax = this.height;

                if (this.indicator == null) {
                    var smallestSize = this.width;
                    if (this.size.y < smallestSize) smallestSize = this.height;

                    if (this.indicatorImage) {
                        this.indicator = ig.game.spawnEntity(EntityGameObject, 0, 0, {
                            anchorX: 0.5,
                            singleFrameImage: this.indicatorImage,
                            zIndex: this.zIndex + 10,
                        });
                    } else {
                        this.indicator = ig.game.spawnEntity(EntityGameObject, 0, 0, {
                            drawAsRect: true,
                            zIndex: this.zIndex + 10,
                            width: smallestSize,
                            height: smallestSize
                        });
                    }
                }
                this.onInputDown.add(this.onClickSlider, this)
            },

            onClickSlider: function () {
                if (this.pair && this.pair.isSliding) return;
                this.parent();
                this.isSliding = true;
            },

            update: function () {
                this.parent();
                if (this.fixedOnCamera) this.indicator.fixedOnCamera = true;
                this.indicator.alpha = this.alpha;
                this.indicator.visible = this.visible;
                var midX = this.pos.x + (this.xMax - this.xMin);
                if (this.isSliding) {
                    var touchX = 99999;
                    for (var i = 0; i < ig.multitouchInput.touches.length; i++) {
                        var t = ig.multitouchInput.touches[i];

                        //SAME
                        var dx = Math.abs(t.x - midX);
                        if (dx < Math.abs(touchX - midX)) {
                            touchX = t.x;
                        }
                    }

                    if (touchX == 99999 && ig.input.state("click")) {
                        hasTouch = true;
                        var p = ig.game.io.mouse.getPos();

                        //SAME
                        var dx = Math.abs(p.x - midX);
                        if (dx < Math.abs(touchX - midX)) {
                            touchX = p.x;
                        }
                    }

                    if (touchX == 99999) {//not touching
                        this.isSliding = false;
                        this.onStopSliding.dispatch([this.value]);
                    } else {
                        this.setValueBasedOnPos(touchX);
                    }
                } else {
                    this.setPosBasedOnValue();
                }
            },

            setPosBasedOnValue: function () {
                var indicator = this.indicator;
                if (this.isHorizontal) {
                    var span = this.xMax - this.xMin - indicator.width;
                    if (ig.responsive) {
                        indicator.anchoredPositionX = this.anchoredPositionX + this.xMin + span * this.value + this.indicatorOffsetX;
                        indicator.anchoredPositionY = this.anchoredPositionY + this.indicatorOffsetY;
                    } else {
                        indicator.pos.x = this.pos.x + this.xMin + span * this.value + this.indicatorOffsetX;
                        indicator.pos.y = this.pos.y + this.indicatorOffsetY;
                    }

                } else {
                    //TODO: vertical slider
                }
            },

            setValueBasedOnPos: function (x) {
                // var indicator = this.indicator;
                // var p = ig.responsive.toAnchor(0, 0, indicator.anchorType)
                // indicator.anchoredPositionX = x - p.x;

                // if (indicator.anchoredPositionX - this.anchoredPositionX < this.xMin) {
                //     indicator.anchoredPositionX = this.anchoredPositionX + this.xMin;
                // }
                // else if (indicator.anchoredPositionX - this.anchoredPositionX > this.xMax - indicator.width) {
                //     indicator.anchoredPositionX = this.anchoredPositionX + this.xMax - indicator.width;
                // }

                // this.value = (indicator.anchoredPositionX - this.anchoredPositionX - this.xMin) / (this.xMax - this.xMin - indicator.width);

                var indicator = this.indicator;
                indicator.pos.x = x;

                if (indicator.pos.x - this.pos.x < this.xMin) {
                    indicator.pos.x = this.pos.x + this.xMin;
                }
                else if (indicator.pos.x - this.pos.x > this.xMax - indicator.width) {
                    indicator.pos.x = this.pos.x + this.xMax - indicator.width;
                }

                this.value = (indicator.pos.x - this.pos.x - this.xMin) / (this.xMax - this.xMin - indicator.width);
            }



        });
    });