ig.module(
    'game.scene3d.utils.mesh-manager'
)
    .requires(

    )
    .defines(function () {
        "use strict";
        ig.meshManager = {


            ground: null,
            post: null,
            target: null,
            bow: null,
            arrowTip: null,
            arrowBody: null,
            crosshairPoint: null,

            targetDistance: 350,
            targetHeight: 20,
            targetRadius: 8,

            windIndicator: null,


            init: function () {
                var scene = ig.altBabylon.scene;

                this.initGround()
                this.initPost()
                this.initTarget()
                this.initArrow()
                this.initBow()
                this.initWindIndicator()



                //TARGET


                setTimeout(function () {
                    if (ig.altBabylon.scene.getMaterialByName("default material")) ig.altBabylon.scene.getMaterialByName("default material").disableLighting = true;
                }.bind(this), 200);
            },


            initGround: function () {
                var scene = ig.altBabylon.scene;
                this.groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
                this.groundMaterial.emissiveColor = BABYLON.Color3.FromHexString("#fa9368");
                this.groundMaterial.ambientColor = BABYLON.Color3.FromHexString("#fa9368");
                this.groundMaterial.diffuseColor = BABYLON.Color3.FromHexString("#fa9368");
                this.ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 5000, height: 5000 }, scene);
                this.ground.position.set(0, 0, 0)
                this.ground.material = this.groundMaterial;
            },

            initPost: function () {
                var scene = ig.altBabylon.scene;
                this.postMaterial = new BABYLON.StandardMaterial("postMaterial", scene);
                this.postMaterial.emissiveColor = BABYLON.Color3.FromHexString("#804000");
                this.postMaterial.ambientColor = BABYLON.Color3.FromHexString("#804000");
                this.postMaterial.diffuseColor = BABYLON.Color3.FromHexString("#804000");
                this.post = BABYLON.MeshBuilder.CreateCylinder("post", { diameter: 2, height: this.targetHeight, tessellation: 8 }, scene);
                this.post.position.set(0, this.targetHeight / 2, this.targetDistance)
                this.post.material = this.postMaterial;
            },

            initTarget: function () {
                var scene = ig.altBabylon.scene;
                this.targetDynamicTexture = new BABYLON.DynamicTexture("targetTexture", 512, scene, true);
                this.targetTextureHasDrawn = false;
                this.targetMaterial = new BABYLON.StandardMaterial("targetMaterial", scene);
                this.targetMaterial.emissiveTexture = this.targetDynamicTexture;
                this.targetMaterial.diffuseTexture = this.targetDynamicTexture;
                this.targetMaterial.opacityTexture = this.targetDynamicTexture;
                var targetFaceUV = [
                    new BABYLON.Vector4(0, 0, 1, 1),
                    new BABYLON.Vector4(0, 0, 0.01, 0.01),
                    new BABYLON.Vector4(0, 0, 1, 1),
                ];
                var targetFaceColors = [
                    BABYLON.Color4.FromHexString("#a60000ff"),
                    // BABYLON.Color4.FromHexString("#ffffa6ff"),
                    // BABYLON.Color4.FromHexString("#ffffa6ff")
                    BABYLON.Color4.FromHexString("#a60000ff"),
                    BABYLON.Color4.FromHexString("#ffffa6ff")
                ];
                this.target = BABYLON.MeshBuilder.CreateCylinder("target", { diameter: this.targetRadius * 2, height: 3, tessellation: 64, faceUV: targetFaceUV, faceColors: targetFaceColors }, scene);
                this.target.position.set(0, this.targetHeight, this.post.position.z)
                this.target.rotation.set(-Math.PI / 2, 0, 0)
                this.target.material = this.targetMaterial;
            },

            initArrow: function () {
                var scene = ig.altBabylon.scene;
                this.arrowTip = BABYLON.MeshBuilder.CreateSphere("arrowTip", { diameter: 0.1 }, scene);
                this.arrowTip.position.set(0, 20, 0)

                this.arrowBody = BABYLON.MeshBuilder.CreateBox("arrowBody", { width: 0.1, height: 0.1, depth: 15 }, scene);
                this.arrowBody.position.set(0, 20, -7.5)
                this.arrowTip.addChild(this.arrowBody);

                this.aftershotCamPos = BABYLON.MeshBuilder.CreateSphere("arrowTip", { diameter: 0.1 }, scene);
                this.aftershotCamPos.position.copyFrom(this.target.position);
                this.aftershotCamPos.position.x -= 5
                this.aftershotCamPos.position.y += 5
                this.aftershotCamPos.position.z -= 15
                this.aftershotCamPos.isVisible = false

                this.crosshairPoint = BABYLON.MeshBuilder.CreateSphere("crosshairPoint", { diameter: 0.1 }, scene);
                this.crosshairPoint.position.copyFrom(this.target.position);
                this.crosshairPoint.isVisible = false


            },

            initBow: function () {
                var scene = ig.altBabylon.scene;
            },

            initWindIndicator: function () {
                var scene = ig.altBabylon.scene;

                this.windIndicatorGuide = BABYLON.MeshBuilder.CreateBox("windindicatorguide", { width: 0.5, height: 0.5, depth: 0.5 }, scene);
                // this.windIndicatorGuide.isVisible = false;

                // this.windIndicatorPlane = BABYLON.MeshBuilder.CreatePlane("windIndicatorPlane", { width: 4, height: 1.5 }, scene);
                // this.windIndicatorPlane = BABYLON.MeshBuilder.CreateGround("windIndicatorPlane", { width: 4, height: 1.5 }, scene);
                this.windIndicatorPlane = BABYLON.MeshBuilder.CreateGround("windIndicatorPlane", { width: 4, height: 1.5 }, scene);
                this.windIndicatorPlane.material = new BABYLON.StandardMaterial("WindIndicatorMat", scene);
                this.windIndicatorPlane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
                this.windIndicatorPlane.material.disableLighting = true;
                this.windIndicatorPlane.rotation.y = -Math.PI / 2
                this.windIndicatorPlane.position.z = 2

                this.windIndicatorTexture = new BABYLON.DynamicTexture("windIndicatorPlaneTexture", 512, scene, true);
                this.windIndicatorPlane.material.diffuseTexture = this.windIndicatorTexture;
                this.windIndicatorPlane.material.opacityTexture = this.windIndicatorTexture;
                this.windIndicatorPlane.material.backFaceCulling = false;

                this.windIndicatorTextureHasDrawn = false;

                // this.windIndicator = BABYLON.MeshBuilder.CreateBox("aindicator", { width: 1, height: 1, depth: 1 }, scene)//new BABYLON.TransformNode("windIndicator");
                this.windIndicator = new BABYLON.TransformNode("windIndicator");
                this.windIndicatorPlane.parent = this.windIndicator;
                this.windIndicator.scaling.set(0.01, 0.01, 0.01)
                // this.windIndicator.addChild(this.windIndicatorPlane);

                // var b = BABYLON.MeshBuilder.CreateBox("a", { width: 1, height: 1, depth: 1 }, scene);
                // b.parent = this.windIndicator

                this.windIndicator.animator = new ig.UVFrameAnimator(this.windIndicatorTexture, 5, 3, 0, 0);
                this.windIndicator.animator.addAnimation("wind", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 16, true);
                this.windIndicator.animator.playAnimation("wind");
                this.windIndicator.animator.update(0);


            },

            update: function (dt) {
                if (!this.targetTextureHasDrawn) {
                    var image = new ig.Image("media/graphics/game/target.png");
                    if (image.loaded) {
                        var ctx = this.targetDynamicTexture.getContext();
                        // ctx.clearRect(0, 0, 512, 512);
                        ctx.drawImage(image.data, 0, 0);
                        this.targetDynamicTexture.update();
                        this.targetTextureHasDrawn = true;
                        console.log("targetDrawn")
                    }
                }

                if (!this.windIndicatorTextureHasDrawn) {
                    var image = new ig.Image("media/graphics/game/wind2.png");
                    if (image.loaded) {
                        var ctx = this.windIndicatorTexture.getContext();
                        ctx.clearRect(0, 0, 512, 512);
                        // ctx.fillStyle = "#ffffff";
                        // ctx.fillRect(0, 0, 512, 512)
                        ctx.drawImage(image.data, 0, 0);
                        this.windIndicatorTexture.update();
                        this.windIndicatorTextureHasDrawn = true;
                        // 
                        console.log("windDrawn")
                    }
                } else {

                    var camera = ig.cameraControl.camera;
                    var scene = ig.altBabylon.scene;
                    camera.getViewMatrix(); // make sure the transformation matrix we get when calling 'getTransformationMatrix()' is calculated with an up to date view matrix

                    var invertCameraViewProj = BABYLON.Matrix.Invert(camera.getTransformationMatrix().clone());

                    var screenWidth = scene.getEngine().getRenderWidth(true);

                    // this.setPosition(true, this.windIndicatorGuide, 50, 200, camera, invertCameraViewProj, screenWidth);
                    // this.setPosition(true, this.windIndicatorGuide, 1, 0, camera, invertCameraViewProj, screenWidth);
                    this.setPosition(true, this.windIndicatorGuide, 1, screenWidth / 2, camera, invertCameraViewProj, screenWidth);

                    this.windIndicator.position.copyFrom(this.windIndicatorGuide.position);

                    // this.windIndicator.position.z += 3
                    // this.windIndicator.position.x -= 1
                    // this.windIndicator.position.y -= 1

                    // if (!this.windIndicatorLookTarget) this.windIndicatorLookTarget = new BABYLON.Vector3(0, 0, 0);
                    // this.windIndicatorLookTarget.copyFrom(this.windIndicator.position);

                    // // this.windIndicatorLookTarget.x += 1;
                    // this.windIndicatorLookTarget.x += 10;
                    // // this.windIndicatorLookTarget.y += 100;
                    // this.windIndicatorLookTarget.z += 100;
                    // this.windIndicator.lookAt(this.windIndicatorLookTarget);

                    this.windIndicator.animator.update(dt)
                    // console.log(this.windIndicator.position)
                    // console.log(this.windIndicatorGuide.position)
                }

            },

            setPosition: function (fromLeft, mesh, meshWidthInPixels, spacingWithBorderInPixels, camera, invertCameraViewProj, screenWidth) {
                var spacingWithBorder = spacingWithBorderInPixels / screenWidth;

                var h = meshWidthInPixels / screenWidth;

                var pOfst = fromLeft ? -1 + spacingWithBorder * 2 : 1 - h * 2 - spacingWithBorder * 2;

                var p = new BABYLON.Vector3(-1, -1, -1 + 0.0001);
                var q = new BABYLON.Vector3(-1 + 2 * h, -1, -1 + 0.0001);

                var pt = BABYLON.Vector3.TransformCoordinates(p, invertCameraViewProj);
                var qt = BABYLON.Vector3.TransformCoordinates(q, invertCameraViewProj);
                var d = qt.subtract(pt).length();

                mesh.scaling = new BABYLON.Vector3(d, d, d);

                p.x = pOfst;

                mesh.rotation.copyFrom(camera.rotation);
                mesh.position = BABYLON.Vector3.TransformCoordinates(p, invertCameraViewProj);
            },

            normalize2: function (x, y, length) {
                var norm = Math.sqrt(x * x + y * y);
                var nx = length * x / norm;
                var ny = length * y / norm;
                return { x: nx, y: ny };
            },


            getCenterVec3: function (a, b) {
                var v = new BABYLON.Vector3(0, 0, 0);
                v.x = (a.x + b.x) / 2
                v.y = (a.y + b.y) / 2
                v.z = (a.z + b.z) / 2
                return v;
            },

            normalizeYToCenter: function (vec3, centerX, centerZ, length) {
                var dx = vec3.x - centerX;
                var dz = vec3.z - centerZ; 
                var norm = Math.sqrt(dx * dx + dz * dz);
                var dx = length * dx / norm;
                var dz = length * dz / norm;
                vec3.x = dx + centerX;
                vec3.z = dz + centerZ;
            },

            rotateOnYAxis: function (vec3, centerX, centerZ, angle) {
                var sin = Math.sin(angle);
                var cos = Math.cos(angle);

                vec3.x = (vec3.x - centerX) * cos - (vec3.z - centerZ) * sin + centerX;
                vec3.z = (vec3.x - centerX) * sin + (vec3.z - centerZ) * cos + centerZ;
            },

        }
    });
