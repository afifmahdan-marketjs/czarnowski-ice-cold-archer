/**
 *  Opening MarketJS Logo
 *
 *  Created by Afifudin Mahdan on 2022.
 *  Copyright (c) MarketJS. All rights reserved.
 */

ig.module("game.entities.opening-marketjs-logo")
  .requires("impact.entity")
  .defines(function () {
    EntityOpeningMarketJSLogo = ig.Entity.extend({
      objects: [],
      letterM: null,
      logoShield: null,
      text: null,
      localTweens: [],

      logoOriX: 0,
      logoOriY: 0,
      textOriX: 0,
      textOriY: 0,

      logoCanvas: null,

      init: function (x, y, settings) {
        this.parent(x, y, settings);
        console.log("Opening v1.0.4");
        var size = Math.min(ig.system.width, ig.system.height);
        logoSize = (148 / 960) * size;

        this.logoCacheSize = Math.round(logoSize * 2);

        this.text = this.addObject("drawText", 0, 0, logoSize, logoSize);
        this.cover = this.addObject("drawCover", 0, 0, logoSize, logoSize);
        this.logoShield = this.addObject(
          "drawLogoShield",
          0,
          0,
          logoSize,
          logoSize
        );
        this.letterM = this.addObject("drawLetterM", 0, 0, logoSize, logoSize);

        this.logoOriX = 0 - logoSize * 2.2;
        this.logoOriY = 0;
        this.textOriX = 0 - 1.378 * logoSize;
        this.textOriY = 0 - 0.5 * logoSize;

        // this.logoShield.x = this.logoOriX;
        // this.letterM.x = this.logoShield.x
        // this.text.x = this.textOriX
        // this.text.y = this.textOriY

        this.logoShield.x = 0;
        this.logoShield.y = 0;
        this.logoShield.scaleX = 0;
        this.logoShield.scaleY = 0;
        this.logoShield.alpha = 0;

        this.letterM.x = this.logoShield.x;
        this.letterM.y = this.logoShield.y;
        this.letterM.scaleX = 0;
        this.letterM.scaleY = 0;
        this.letterM.alpha = 0;

        this.text.x = -logoSize * 4.6;
        this.text.y = this.textOriY;
        this.cover.x = this.logoShield.x;
        this.cover.y = 0;

        this.addLocalDelayedCall(
          0.6,
          function () {
            this.addLocalTweenTo(
              this.logoShield,
              { scaleX: 2, scaleY: 2 },
              0.5,
              this.backOut
            );
            this.addLocalTweenTo(
              this.logoShield,
              { alpha: 1 },
              0.2,
              this.quadOut
            );
            ig.soundHandler.sfxPlayer.play("logosplash1");

            this.addLocalDelayedCall(
              0.4,
              function () {
                this.addLocalTweenTo(
                  this.letterM,
                  { scaleX: 2, scaleY: 2 },
                  0.5,
                  this.backOut
                );
                this.addLocalTweenTo(
                  this.letterM,
                  { alpha: 1 },
                  0.2,
                  this.quadOut
                );
                ig.soundHandler.sfxPlayer.play("logosplash1");

                this.addLocalDelayedCall(
                  0.2,
                  function () {
                    ig.soundHandler.sfxPlayer.play("logosplash2");
                  }.bind(this)
                );

                this.addLocalDelayedCall(
                  0.6,
                  function () {
                    this.addLocalTweenTo(
                      this.logoShield,
                      { scaleX: 1, scaleY: 1 },
                      0.4,
                      this.quartOut
                    );
                    this.addLocalTweenTo(
                      this.logoShield,
                      { x: this.logoOriX, y: this.logoOriY },
                      0.4,
                      this.quadOut
                    );

                    this.addLocalTweenTo(
                      this.letterM,
                      { scaleX: 1, scaleY: 1 },
                      0.4,
                      this.quartOut
                    );
                    this.addLocalTweenTo(
                      this.letterM,
                      { x: this.logoOriX, y: this.logoOriY },
                      0.4,
                      this.quadOut
                    );

                    this.addLocalTweenTo(
                      this.text,
                      { x: this.textOriX },
                      0.8,
                      this.backOut
                    );

                    this.addLocalDelayedCall(
                      2,
                      function () {
                        this.addLocalTweenTo(
                          this.logoShield,
                          { alpha: 0 },
                          0.6,
                          this.quadOut
                        );
                        // this.addLocalTweenTo(this.letterM, { alpha: 0 }, 0.6, this.quadOut);
                        this.addLocalTweenTo(
                          this.text,
                          { alpha: 0 },
                          0.6,
                          this.quadOut
                        );

                        this.addLocalDelayedCall(
                          1.3,
                          function () {
                            this.playBgm();
                            ig.game.director.nextLevel();
                          }.bind(this)
                        );
                      }.bind(this)
                    );
                  }.bind(this)
                );
              }.bind(this)
            );
          }.bind(this)
        );
      },

      addObject: function (drawFunctionName, x, y, width, height) {
        var obj = {
          x: x,
          y: y,
          width: width,
          height: height,
          scaleX: 1,
          scaleY: 1,
          alpha: 1,
          drawFunctionName: drawFunctionName,
        };
        this.objects.push(obj);
        return obj;
      },

      update: function () {
        this.parent();
        if (ig.wm) return;
        this.unlockWebAudio();
        var dt = ig.system.tick;
        if (dt > 1 / 60) dt = 1 / 60;
        this.updateLocalTween(dt);
        this.cover.x = this.logoShield.x;

        if (!_SETTINGS["DeveloperBranding"]["Splash"]["Enabled"]) {
          this.playBgm();
          ig.game.director.nextLevel();
          this.kill();
          return;
        }
      },

      playBgm: function () {
        ig.soundHandler.bgmPlayer.play(
          ig.soundHandler.bgmPlayer.soundList.background
        );
      },

      unlockWebAudio: function () {
        if (ig.input.released("click")) {
          /* attempt to unlock WebAudio */
          try {
            ig.soundHandler.unlockWebAudio();
          } catch (error) {}
        }
      },

      addLocalDelayedCall: function (duration, onComplete) {
        this.addLocalTweenTo(null, {}, duration, this.easeNone, 0, onComplete);
      },

      addLocalTweenTo: function (obj, to, duration, easing, delay, onComplete) {
        if (typeof delay == "undefined") delay = 0;
        if (typeof easing == "undefined") easing = this.easeNone;
        if (typeof onComplete == "undefined") onComplete = null;
        var tween = {
          obj: obj,
          endProperties: to,
          duration: duration,
          easing: easing,
          delay: delay,
          elapsed: 0,
          deltaProperties: {},
          startProperties: {},
          onComplete: onComplete,
        };

        for (var key in to) {
          if (Object.hasOwnProperty.call(to, key)) {
            tween.startProperties[key] = obj[key];
            tween.deltaProperties[key] = to[key] - obj[key];
          }
        }
        this.localTweens.push(tween);
      },

      updateLocalTween: function (dt) {
        for (var i = 0; i < this.localTweens.length; i++) {
          var tween = this.localTweens[i];
          if (tween.delay > 0) {
            tween.delay -= dt;
          } else {
            tween.elapsed += dt;

            for (var key in tween.deltaProperties) {
              if (Object.hasOwnProperty.call(tween.deltaProperties, key)) {
                var delta = tween.deltaProperties[key];
                var start = tween.startProperties[key];
                var easing = tween.easing;
                var value = tween.elapsed / tween.duration;
                if (value > 1) value = 1;
                value = easing(value);
                tween.obj[key] = start + delta * value;
              }
            }

            if (tween.elapsed >= tween.duration) {
              this.localTweens.splice(i, 1);
              i--;
              if (tween.onComplete) tween.onComplete();
            }
          }
        }
      },

      quadOut: function (k) {
        return -k * (k - 2);
      },

      quartOut: function (k) {
        return -(--k * k * k * k - 1);
      },

      backOut: function (k) {
        var s = 1.70158;
        return (k = k - 1) * k * ((s + 1) * k + s) + 1;
      },
      easeNone: function (k) {
        return k;
      },

      draw: function () {
        this.parent();
        if (ig.global.wm) return;

        var ctx = ig.system.context;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, ig.system.width, ig.system.height);
        for (var i = 0; i < this.objects.length; i++) {
          var obj = this.objects[i];
          if (obj.alpha > 1) obj.alpha = 1;
          if (obj.scaleX != 0 && obj.scaleY != 0 && obj.alpha > 0)
            this[obj.drawFunctionName](obj);
        }
      },

      drawLogoShield: function (obj) {
        if (!this.logoCanvas) {
          this.logoCanvas = ig.$new("canvas");
          this.logoCanvas.width = this.logoCacheSize;
          this.logoCanvas.height = this.logoCacheSize;
          var ctx = this.logoCanvas.getContext("2d");

          var w = this.logoCacheSize;
          var h = this.logoCacheSize;
          var x = 0;
          var y = 0;

          ctx.clearRect(0, 0, this.logoCanvas.width, this.logoCanvas.height);
          ctx.save();
          ctx.fillStyle = "#e35026";
          ctx.beginPath();
          ctx.moveTo(x + 0.06 * w, y);
          ctx.lineTo(x + 0.94 * w, y);
          ctx.lineTo(x + 0.86 * w, y + 0.89 * h);
          ctx.lineTo(x + 0.5 * w, y + h);
          ctx.lineTo(x + 0.14 * w, y + 0.89 * h);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#ee652b";
          ctx.beginPath();
          ctx.moveTo(x + 0.5 * w, y + 0.07 * h);
          ctx.lineTo(x + 0.86 * w, y + 0.07 * h);
          ctx.lineTo(x + 0.79 * w, y + 0.84 * h);
          ctx.lineTo(x + 0.5 * w, y + 0.92 * h);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        var w = obj.width * obj.scaleX;
        var h = obj.height * obj.scaleY;
        var x = ig.system.width / 2 + obj.x - w / 2;
        var y = ig.system.height / 2 + obj.y - h / 2;

        var ctx = ig.system.context;
        ctx.globalAlpha = obj.alpha;
        ctx.drawImage(
          this.logoCanvas,
          0,
          0,
          this.logoCacheSize,
          this.logoCacheSize,
          x,
          y,
          w,
          h
        );
        ctx.globalAlpha = 1;
      },

      drawLetterM: function (obj) {
        if (!this.mCanvas) {
          this.mCanvas = ig.$new("canvas");
          this.mCanvas.width = this.logoCacheSize;
          this.mCanvas.height = this.logoCacheSize;
          var ctx = this.mCanvas.getContext("2d");

          var w = this.logoCacheSize;
          var h = this.logoCacheSize;
          var x = 0;
          var y = 0;

          ctx.save();

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.moveTo(x + 0.25 * w, y + 0.2 * h);
          ctx.lineTo(x + 0.4 * w, y + 0.2 * h);
          ctx.lineTo(x + 0.5 * w, y + 0.37 * h);
          ctx.lineTo(x + 0.6 * w, y + 0.2 * h);
          ctx.lineTo(x + 0.75 * w, y + 0.2 * h);
          ctx.lineTo(x + 0.75 * w, y + 0.7 * h);
          ctx.lineTo(x + 0.6 * w, y + 0.7 * h);
          ctx.lineTo(x + 0.6 * w, y + 0.45 * h);
          ctx.lineTo(x + 0.5 * w, y + 0.63 * h);
          ctx.lineTo(x + 0.4 * w, y + 0.45 * h);
          ctx.lineTo(x + 0.4 * w, y + 0.7 * h);
          ctx.lineTo(x + 0.25 * w, y + 0.7 * h);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }

        var ctx = ig.system.context;
        var w = obj.width * obj.scaleX;
        var h = obj.height * obj.scaleY;
        var x = ig.system.width / 2 + obj.x - w / 2;
        var y = ig.system.height / 2 + obj.y - h / 2;

        ctx.globalAlpha = obj.alpha;
        ctx.drawImage(
          this.mCanvas,
          0,
          0,
          this.logoCacheSize,
          this.logoCacheSize,
          x,
          y,
          w,
          h
        );
        ctx.globalAlpha = 1;
      },

      drawText: function (obj) {
        if (!ig.splashLogoFontLoaded) return;
        var ctx = ig.system.context;
        var h = obj.height * obj.scaleY;
        var x = ig.system.width / 2 + obj.x;
        var y = ig.system.height / 2 + obj.y;

        ctx.save();
        ctx.globalAlpha = obj.alpha;
        var mjsFontSize = Math.round((115 / 152) * h);
        var solutionFontSize = Math.round((62 / 152) * h);
        ctx.textAlign = "left";
        ctx.fillStyle = "#316198";
        ctx.font = mjsFontSize + "px logofont";
        ctx.fillText(
          "MarketJS",
          x - mjsFontSize * 0.06,
          y + mjsFontSize * 0.66
        );
        ctx.font = solutionFontSize + "px logofont";
        ctx.fillText(
          "HTML5 gaming solutions",
          x - solutionFontSize * 0.02,
          y + h - solutionFontSize * 0.1
        );
        ctx.globalAlpha = 1;
        ctx.restore();
      },

      drawCover: function (obj) {
        var ctx = ig.system.context;
        var x = ig.system.width / 2 + obj.x;
        var y = ig.system.height / 2 + obj.y;

        ctx.save();
        ctx.globalAlpha = obj.alpha;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(
          x - ig.system.width / 2,
          y - this.logoCacheSize / 2,
          ig.system.width / 2,
          this.logoCacheSize
        );
        ctx.globalAlpha = 1;
        ctx.restore();
      },
    });

    if (typeof window.FontFaceObserver == "undefined") {
      /**https://github.com/bramstein/fontfaceobserver */
      /* Font Face Observer v2.1.0 - © Bram Stein. License: BSD-3-Clause */
      (function () {
        function l(a, b) {
          document.addEventListener
            ? a.addEventListener("scroll", b, !1)
            : a.attachEvent("scroll", b);
        }
        function m(a) {
          document.body
            ? a()
            : document.addEventListener
            ? document.addEventListener("DOMContentLoaded", function c() {
                document.removeEventListener("DOMContentLoaded", c);
                a();
              })
            : document.attachEvent("onreadystatechange", function k() {
                if (
                  "interactive" == document.readyState ||
                  "complete" == document.readyState
                )
                  document.detachEvent("onreadystatechange", k), a();
              });
        }
        function t(a) {
          this.a = document.createElement("div");
          this.a.setAttribute("aria-hidden", "true");
          this.a.appendChild(document.createTextNode(a));
          this.b = document.createElement("span");
          this.c = document.createElement("span");
          this.h = document.createElement("span");
          this.f = document.createElement("span");
          this.g = -1;
          this.b.style.cssText =
            "max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";
          this.c.style.cssText =
            "max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";
          this.f.style.cssText =
            "max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";
          this.h.style.cssText =
            "display:inline-block;width:200%;height:200%;font-size:16px;max-width:none;";
          this.b.appendChild(this.h);
          this.c.appendChild(this.f);
          this.a.appendChild(this.b);
          this.a.appendChild(this.c);
        }
        function u(a, b) {
          a.a.style.cssText =
            "max-width:none;min-width:20px;min-height:20px;display:inline-block;overflow:hidden;position:absolute;width:auto;margin:0;padding:0;top:-999px;white-space:nowrap;font-synthesis:none;font:" +
            b +
            ";";
        }
        function z(a) {
          var b = a.a.offsetWidth,
            c = b + 100;
          a.f.style.width = c + "px";
          a.c.scrollLeft = c;
          a.b.scrollLeft = a.b.scrollWidth + 100;
          return a.g !== b ? ((a.g = b), !0) : !1;
        }
        function A(a, b) {
          function c() {
            var a = k;
            z(a) && a.a.parentNode && b(a.g);
          }
          var k = a;
          l(a.b, c);
          l(a.c, c);
          z(a);
        }
        function B(a, b) {
          var c = b || {};
          this.family = a;
          this.style = c.style || "normal";
          this.weight = c.weight || "normal";
          this.stretch = c.stretch || "normal";
        }
        var C = null,
          D = null,
          E = null,
          F = null;
        function G() {
          if (null === D)
            if (J() && /Apple/.test(window.navigator.vendor)) {
              var a = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/.exec(
                window.navigator.userAgent
              );
              D = !!a && 603 > parseInt(a[1], 10);
            } else D = !1;
          return D;
        }
        function J() {
          null === F && (F = !!document.fonts);
          return F;
        }
        function K() {
          if (null === E) {
            var a = document.createElement("div");
            try {
              a.style.font = "condensed 100px sans-serif";
            } catch (b) {}
            E = "" !== a.style.font;
          }
          return E;
        }
        function L(a, b) {
          return [a.style, a.weight, K() ? a.stretch : "", "100px", b].join(
            " "
          );
        }
        B.prototype.load = function (a, b) {
          var c = this,
            k = a || "BESbswy",
            r = 0,
            n = b || 3e3,
            H = new Date().getTime();
          return new Promise(function (a, b) {
            if (J() && !G()) {
              var M = new Promise(function (a, b) {
                  function e() {
                    new Date().getTime() - H >= n
                      ? b(Error("" + n + "ms timeout exceeded"))
                      : document.fonts
                          .load(L(c, '"' + c.family + '"'), k)
                          .then(function (c) {
                            1 <= c.length ? a() : setTimeout(e, 25);
                          }, b);
                  }
                  e();
                }),
                N = new Promise(function (a, c) {
                  r = setTimeout(function () {
                    c(Error("" + n + "ms timeout exceeded"));
                  }, n);
                });
              Promise.race([N, M]).then(function () {
                clearTimeout(r);
                a(c);
              }, b);
            } else
              m(function () {
                function v() {
                  var b;
                  if (
                    (b =
                      (-1 != f && -1 != g) ||
                      (-1 != f && -1 != h) ||
                      (-1 != g && -1 != h))
                  )
                    (b = f != g && f != h && g != h) ||
                      (null === C &&
                        ((b = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(
                          window.navigator.userAgent
                        )),
                        (C =
                          !!b &&
                          (536 > parseInt(b[1], 10) ||
                            (536 === parseInt(b[1], 10) &&
                              11 >= parseInt(b[2], 10))))),
                      (b =
                        C &&
                        ((f == w && g == w && h == w) ||
                          (f == x && g == x && h == x) ||
                          (f == y && g == y && h == y)))),
                      (b = !b);
                  b &&
                    (d.parentNode && d.parentNode.removeChild(d),
                    clearTimeout(r),
                    a(c));
                }
                function I() {
                  if (new Date().getTime() - H >= n)
                    d.parentNode && d.parentNode.removeChild(d),
                      b(Error("" + n + "ms timeout exceeded"));
                  else {
                    var a = document.hidden;
                    if (!0 === a || void 0 === a)
                      (f = e.a.offsetWidth),
                        (g = p.a.offsetWidth),
                        (h = q.a.offsetWidth),
                        v();
                    r = setTimeout(I, 50);
                  }
                }
                var e = new t(k),
                  p = new t(k),
                  q = new t(k),
                  f = -1,
                  g = -1,
                  h = -1,
                  w = -1,
                  x = -1,
                  y = -1,
                  d = document.createElement("div");
                d.dir = "ltr";
                u(e, L(c, "sans-serif"));
                u(p, L(c, "serif"));
                u(q, L(c, "monospace"));
                d.appendChild(e.a);
                d.appendChild(p.a);
                d.appendChild(q.a);
                document.body.appendChild(d);
                w = e.a.offsetWidth;
                x = p.a.offsetWidth;
                y = q.a.offsetWidth;
                I();
                A(e, function (a) {
                  f = a;
                  v();
                });
                u(e, L(c, '"' + c.family + '",sans-serif'));
                A(p, function (a) {
                  g = a;
                  v();
                });
                u(p, L(c, '"' + c.family + '",serif'));
                A(q, function (a) {
                  h = a;
                  v();
                });
                u(q, L(c, '"' + c.family + '",monospace'));
              });
          });
        };
        "object" === typeof module
          ? (module.exports = B)
          : ((window.FontFaceObserver = B),
            (window.FontFaceObserver.prototype.load = B.prototype.load));
      })();
      console.log("font loader not exist : create new instance of font loader");
    }

    var newStyle = document.createElement("style");
    newStyle.type = "text/css";
    var fontname = "logofont";
    var fontsource = "media/fonts/logofont";
    var textNode =
      "@font-face {font-family: '" +
      fontname +
      "';src: url('" +
      fontsource +
      ".woff2') format('woff2'),url('" +
      fontsource +
      ".woff') format('woff'),url('" +
      fontsource +
      ".ttf') format('truetype')}";
    newStyle.appendChild(document.createTextNode(textNode));
    document.head.appendChild(newStyle);

    ig.splashLogoFontLoaded = false;
    new FontFaceObserver("logofont")
      .load()
      .then(function () {
        ig.splashLogoFontLoaded = true;
      })
      .catch(function () {
        console.log("Splash font failed to load :", fontsource);
      });
  });
