
ig.module('game.toybox.content')
    .requires(
        'impact.entity',
        'game.toybox.utils.tween-patch',
        'game.toybox.controllers.controller',
        'game.toybox.objects.game-object',
        'game.toybox.objects.ui.texts.text-field',
        'game.toybox.objects.ui.texts.text-renderer',
        'game.toybox.objects.ui.buttons.simple-button',
        'game.toybox.utils.random',
        'game.toybox.utils.signal',
        'game.toybox.utils.toybox-touch',
        'game.toybox.babylon.alt-babylon'
    ).defines(function () {

        setTimeout(function () {
            console.log("toybox 0.4.5");
            ig.ToyboxTouch.init();
        }, 1000);

        ig.drawRoundRect = function (ctx, x, y, width, height, radius, fill, stroke) {
            if (typeof stroke == "undefined") {
                stroke = true;
            }
            if (typeof radius === "undefined") {
                radius = 5;
            }
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            if (stroke) {
                ctx.stroke();
            }
            if (fill) {
                ctx.fill();
            }
        };

        ig.hexToRgb = function (hex) {
            if (!ig.hexToRgbTable) ig.hexToRgbTable = {};
            if (ig.hexToRgbTable[hex]) return ig.hexToRgbTable[hex];

            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            if (result) {
                ig.hexToRgbTable[hex] = {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16),
                    hex: hex
                }

                return ig.hexToRgbTable[hex];
            }
            console.log("cannot convert to rgb from hex :", hex)
            return null;
        };

        //3D utility function===================================================

        ig.utils = {};

        ig.utils.lerp = function (start, end, amt) {
            return (1 - amt) * start + amt * end
        };

        ig.utils.lerpDt = function (start, end, amt) {
            return this.lerp(start, end, amt * ig.system.tick)
        };

        ig.utils.lerpPerfectDt = function (start, end, amt, dt, snapValue) {
            if (!snapValue) snapValue = 0.01;
            if (Math.abs(start - end) < snapValue) return end;
            amt = 1 - Math.pow(amt, dt);
            return this.lerp(start, end, amt)
        };

        //UNCOMMENT TO ACTIVATE ON 3D PROJECTS
        ig.utils.setFaceDirection = function (rotatingObject, direction) {

            if (!rotatingObject.rotationQuaternion) {
                rotatingObject.rotationQuaternion = BABYLON.Quaternion.Identity();
            }

            direction.normalize();

            var mat = BABYLON.Matrix.Identity();

            var upVec = BABYLON.Vector3.Up();

            var xaxis = BABYLON.Vector3.Cross(direction, upVec);
            var yaxis = BABYLON.Vector3.Cross(xaxis, direction);

            mat.m[0] = xaxis.x;
            mat.m[1] = xaxis.y;
            mat.m[2] = xaxis.z;

            mat.m[4] = direction.x;
            mat.m[5] = direction.y;
            mat.m[6] = direction.z;

            mat.m[8] = yaxis.x;
            mat.m[9] = yaxis.y;
            mat.m[10] = yaxis.z;

            BABYLON.Quaternion.FromRotationMatrixToRef(mat, rotatingObject.rotationQuaternion);

        };


        ig.utils.showAxis3d = function (size) {
            var scene = wgl.game.currentScene;
            var makeTextPlane = function (text, color, size) {
                var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
                dynamicTexture.hasAlpha = true;
                dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
                var plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
                plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
                plane.material.backFaceCulling = false;
                plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
                plane.material.diffuseTexture = dynamicTexture;
                return plane;
            };

            var axisX = BABYLON.Mesh.CreateLines("axisX", [
                new BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
                new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
            ], scene);
            axisX.color = new BABYLON.Color3(1, 0, 0);

            var xChar = makeTextPlane("X", "red", size / 10);
            xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);

            var axisY = BABYLON.Mesh.CreateLines("axisY", [
                new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
                new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
            ], scene);
            axisY.color = new BABYLON.Color3(0, 1, 0);

            var yChar = makeTextPlane("Y", "green", size / 10);
            yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
            var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
                new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
                new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
            ], scene);
            axisZ.color = new BABYLON.Color3(0, 0, 1);

            var zChar = makeTextPlane("Z", "blue", size / 10);
            zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
        };

    });