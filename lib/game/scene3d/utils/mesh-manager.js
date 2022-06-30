ig.module(
    'game.scene3d.utils.mesh-manager'
)
    .requires(

    )
    .defines(function () {
        "use strict";
        ig.meshManager = {


            ground: null,
            target: null,
            bow: null,
            arrowTip: null,
            arrowBody: null,
            crosshairPoint: null,

            treeLineDistance: 450,
            targetDistance: 350,
            targetHeight: 20,
            targetRadius: 8,

            stripeWidth: 300,

            windIndicator: null,
            windSources: [],
            winds: [],
            windImages: [
                new ig.Image("media/graphics/game/wind1.png"),
                new ig.Image("media/graphics/game/wind2.png"),
                new ig.Image("media/graphics/game/wind3.png"),
                new ig.Image("media/graphics/game/wind4.png")
            ],

            init: function () {
                var scene = ig.altBabylon.scene;

                this.initGround()
                this.initTarget()
                this.initArrow()
                this.initBow()
                this.initWindEffect()
                // this.initWindIndicator()



                //TARGET


                setTimeout(function () {
                    if (ig.altBabylon.scene.getMaterialByName("default material")) ig.altBabylon.scene.getMaterialByName("default material").disableLighting = true;
                }.bind(this), 200);
            },


            initGround: function () {
                var scene = ig.altBabylon.scene;
                var groundColor = "#6dc89d"
                this.groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
                this.groundMaterial.emissiveColor = BABYLON.Color3.FromHexString(groundColor);
                this.groundMaterial.ambientColor = BABYLON.Color3.FromHexString(groundColor);
                this.groundMaterial.diffuseColor = BABYLON.Color3.FromHexString(groundColor);
                this.groundMaterial.disableLighting = true;
                this.ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 5000, height: 5000 }, scene);
                this.ground.position.set(0, 0, 0)
                this.ground.material = this.groundMaterial;

                this.stripes = [];
                var stripeColor = "#baf577"
                this.stripeMaterial = new BABYLON.StandardMaterial("stripeMaterial", scene);
                this.stripeMaterial.emissiveColor = BABYLON.Color3.FromHexString(stripeColor);
                this.stripeMaterial.ambientColor = BABYLON.Color3.FromHexString(stripeColor);
                this.stripeMaterial.diffuseColor = BABYLON.Color3.FromHexString(stripeColor);
                this.stripeMaterial.disableLighting = true;

                var stripeSize = 40;
                var stripeWidth = this.stripeWidth;
                for (var i = 0; i < this.treeLineDistance + 300; i += stripeSize * 2) {
                    var stripe = BABYLON.MeshBuilder.CreateBox("stripe", { width: stripeWidth, height: 1, depth: stripeSize }, scene)
                    stripe.position.set(0, 0, i)
                    stripe.material = this.stripeMaterial
                    stripe.convertToFlatShadedMesh();
                    this.stripes.push(stripe);
                }

                this.trees = [];

                // var treeColor = "#c5440f";
                // var treeWoodColor = "#3b1d10";
                // this.treeMaterial = new BABYLON.StandardMaterial("treeMaterial", scene);
                // this.treeMaterial.emissiveColor = BABYLON.Color3.FromHexString(treeColor);
                // this.treeMaterial.ambientColor = BABYLON.Color3.FromHexString(treeColor);
                // this.treeMaterial.diffuseColor = BABYLON.Color3.FromHexString(treeColor);

                // this.treeWoodMaterial = new BABYLON.StandardMaterial("treeWoodMaterial", scene);
                // this.treeWoodMaterial.emissiveColor = BABYLON.Color3.FromHexString(treeWoodColor);
                // this.treeWoodMaterial.ambientColor = BABYLON.Color3.FromHexString(treeWoodColor);
                // this.treeWoodMaterial.diffuseColor = BABYLON.Color3.FromHexString(treeWoodColor);


                //treeSource

                // var treeSource = BABYLON.MeshBuilder.CreateBox("tree", { width: 5, height: 10, depth: 5 }, scene);
                // treeSource.material = this.treeWoodMaterial;
                // var treeBody = BABYLON.MeshBuilder.CreateCylinder("treeBody", { diameterTop: 10, diameterBottom: 30, height: 80 });
                // treeBody.position.y = 5 + 40
                // treeBody.material = this.treeMaterial;
                // treeSource.addChild(treeBody);
                // this.trees.push(treeSource);

                var treeSource = scene.getMeshByName("tree");

                // console.log(treeSource.material);
                // if (treeSource.material.subMaterials) {
                //     for (var i = 0; i < treeSource.material.subMaterials.length; i++) {
                //         var subMat = treeSource.material.subMaterials[i];
                //         subMat.emissiveColor.r *= 4;
                //         subMat.emissiveColor.g *= 4;
                //         subMat.emissiveColor.b *= 4;
                //     }
                // }

                var greenMat = scene.getMaterialByName("Green 2")
                greenMat.emissiveColor.r *= 1.1;
                greenMat.emissiveColor.g *= 1.1;
                greenMat.emissiveColor.b *= 1.1;
                var brownMat = scene.getMaterialByName("Brown")
                brownMat.emissiveColor.r *= 3;
                brownMat.emissiveColor.g *= 3;
                brownMat.emissiveColor.b *= 3;

                treeSource.position.set(0, 35, -this.treeLineDistance);
                //treelines

                var front = true;
                for (var i = -stripeWidth; i < stripeWidth; i += 15) {
                    var treeClone = treeSource.createInstance("treeInstance");
                    treeClone.position.x = i;
                    treeClone.position.z = this.treeLineDistance;
                    if (front) {
                        front = false;
                    } else {
                        treeClone.position.z += 50
                        front = true;
                    }
                    treeClone.scaling.y = ig.random.float(1, 1.3);
                    treeClone.rotation.y = ig.random.float(0, Math.PI * 2);
                    this.trees.push(treeClone)
                }

                //treeSides
                for (var i = 0; i < this.treeLineDistance; i += 20) {
                    var treeCloneLeft = treeSource.createInstance("treeInstance");
                    treeCloneLeft.position.x = -stripeWidth / 2;
                    treeCloneLeft.position.z = i;
                    if (front) {
                        front = false;
                    } else {
                        treeCloneLeft.position.x += 50
                        front = true;
                    }

                    var treeCloneRight = treeSource.createInstance("treeInstance");
                    treeCloneRight.position.x = stripeWidth / 2;
                    treeCloneRight.position.z = i;
                    if (front) treeCloneRight.position.x -= 50

                    treeCloneLeft.scaling.y = ig.random.float(1, 1.3);
                    treeCloneRight.scaling.y = ig.random.float(1, 1.3);
                    treeCloneLeft.rotation.y = ig.random.float(0, Math.PI * 2);
                    treeCloneRight.rotation.y = ig.random.float(0, Math.PI * 2);
                }


            },

            initTarget: function () {
                var scene = ig.altBabylon.scene;
                this.targetDynamicTexture = new BABYLON.DynamicTexture("targetTexture", 1024, scene, true);
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
                    BABYLON.Color4.FromHexString("#ffffffff")
                ];
                this.target = BABYLON.MeshBuilder.CreateCylinder("target", { diameter: this.targetRadius * 2, height: 3, tessellation: 64, faceUV: targetFaceUV, faceColors: targetFaceColors }, scene);
                this.target.position.set(0, this.targetHeight, this.targetDistance)
                this.target.rotation.set(-Math.PI / 2, 0, 0)
                this.target.material = this.targetMaterial;
            },

            initArrow: function () {
                var scene = ig.altBabylon.scene;
                this.arrowTip = BABYLON.MeshBuilder.CreateSphere("arrowTip", { diameter: 0.1 }, scene);
                this.arrowTip.position.set(0, 20, 0)

                // this.arrowBody = BABYLON.MeshBuilder.CreateBox("arrowBody", { width: 0.1, height: 0.1, depth: 15 }, scene);
                this.arrowBody = scene.getMeshByName("Arrow")
                this.arrowBody.position.set(0, 20, 0)
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
                this.bow = scene.getMeshByName("Bow");
                this.bow.position.set(0, 0, 0);
            },

            initWindIndicator: function () {
                var scene = ig.altBabylon.scene;

                this.screenCorner = BABYLON.MeshBuilder.CreateBox("screenCorner", { width: 0.5, height: 0.5, depth: 0.5 }, scene);
                this.screenCorner.setPivotMatrix(BABYLON.Matrix.Translation(0.5, 0.15, 1), false);

                var windPlane = BABYLON.MeshBuilder.CreateGround("windPlane", { width: 2, height: 2 }, scene);
                windPlane.material = new BABYLON.StandardMaterial("WindIndicatorMat", scene);
                windPlane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
                windPlane.material.disableLighting = true;

                this.windIndicatorTexture = new BABYLON.DynamicTexture("windPlaneTexture", 512, scene, true);
                windPlane.material.diffuseTexture = this.windIndicatorTexture;
                windPlane.material.opacityTexture = this.windIndicatorTexture;
                windPlane.material.backFaceCulling = false;

                this.windIndicatorTextureHasDrawn = false;


                this.cornerOffset = new BABYLON.TransformNode("screenCornerOffset");
                this.windIndicator = new BABYLON.TransformNode("windIndicator");
                this.windIndicator.parent = this.screenCorner;
                windPlane.parent = this.screenCorner;
                this.windIndicator.scaling.set(0.01, 0.01, 0.01)
            },

            initWindEffect: function () {
                var scene = ig.altBabylon.scene;
                this.windTextureHasDrawn = false;
                for (var i = 0; i < this.windImages.length; i++) {
                    var windPlane = BABYLON.Mesh.CreatePlane("windPlane" + i, 12, scene, false);
                    // windPlane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
                    windPlane.material = new BABYLON.StandardMaterial("windPlaneMat" + i, scene);
                    windPlane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
                    windPlane.material.disableLighting = true;

                    var windPlaneTexture = new BABYLON.DynamicTexture("windTexture" + i, 256, scene, true);
                    windPlane.material.diffuseTexture = windPlaneTexture;
                    windPlane.material.opacityTexture = windPlaneTexture;
                    windPlane.material.backFaceCulling = false;
                    windPlane.position.y = 10000;

                    this.windSources.push(windPlane);
                }
            },

            spawnWindEffect: function (x, y, z, speed) {
                var clone = ig.random.fromArray(this.windSources).clone();
                clone.position.set(x, y, z);
                clone.windSpeed = speed;
                clone.visibility = 0;
                if (speed < 0) {
                    clone.scaling.x = -1;
                }
                this.winds.push(clone)
                console.log();
            },

            update: function (dt) {
                for (var i = 0; i < this.winds.length; i++) {
                    var wind = this.winds[i];
                    if (wind.visibility < 0.6) {
                        wind.visibility += dt;
                        if (wind.visibility > 0.6) wind.visibility = 0.6;
                    }
                    wind.position.x += wind.windSpeed * dt;

                    if (Math.abs(wind.position.x) > this.stripeWidth + 50) {
                        wind.dispose();
                        this.winds.splice(i, 1);
                        i--;
                    }
                }
                if (!this.targetTextureHasDrawn) {
                    var image = new ig.Image("media/graphics/game/target.png");
                    if (image.loaded) {
                        var ctx = this.targetDynamicTexture.getContext();
                        // ctx.clearRect(0, 0, 512, 512);
                        if (image.drawCtx) {
                            image.drawCtx(ctx, 0, 0);
                        } else {
                            ctx.drawImage(image.data, 0, 0);
                        }
                        this.targetDynamicTexture.update();
                        this.targetTextureHasDrawn = true;
                        console.log("targetDrawn")
                    }
                }

                if (!this.windTextureHasDrawn) {
                    var count = 0;
                    for (var i = 0; i < this.windSources.length; i++) {
                        var image = this.windImages[i];
                        if (image.loaded) {
                            var windPlaneTexture = this.windSources[i].material.diffuseTexture;
                            var ctx = windPlaneTexture.getContext();
                            ctx.clearRect(0, 0, 256, 256);
                            if (image.drawCtx) {
                                image.drawCtx(ctx, 0, 0);
                            } else {
                                ctx.drawImage(image.data, 0, 0);
                            }
                            windPlaneTexture.update();
                            count++;
                        }
                    }
                    if (count == this.windImages.length) this.windTextureHasDrawn = true;
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
