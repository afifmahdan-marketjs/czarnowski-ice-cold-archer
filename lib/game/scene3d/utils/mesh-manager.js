ig.module(
    'game.scene3d.utils.mesh-manager'
)
    .requires(

    )
    .defines(function () {
        "use strict";
        ig.meshManager = {

            tiles: [],

            glasses: [],

            changeAngleCountdown: 0,
            changeAngleCountdownMin: 10,
            changeAngleCountdownMax: 20,

            spawnGlassCountdown: 20,
            spawnGlassCountdownMax: 20,


            angle: 0,
            angleMin: 0.1,
            angleMax: 0.2,
            tileWidth: 10,
            segmentWidth: 10,
            downStep: 2,

            spawnCount: 0,

            scorePlateNumber: 1,
            numbers: [],
            particles: [],


            // fogs: [],

            lowestPlayerY: 0,

            init: function () {
                var scene = ig.altBabylon.scene;

                //GLASS
                //==========================================================
                var glass = BABYLON.MeshBuilder.CreateCylinder("glassSource", {
                    arc: 0.5,
                    diameter: this.tileWidth * 2,
                    height: 1
                }, scene);

                glass.rotation.set(Math.PI / 2, 0, 0);
                glass.bakeCurrentTransformIntoVertices();
                glass.position.set(0, 10000, 90);
                glass.material = new BABYLON.StandardMaterial("glassMat", scene);
                glass.material.emissiveColor = BABYLON.Color3.FromHexString("#ffffff");
                glass.material.diffuseColor = glass.material.emissiveColor;
                glass.visibility = 0.5;

                this.glassSource = glass;

                //FOG
                //==========================================================
                // var fog = BABYLON.MeshBuilder.CreateGround("fog", {
                //     width: 1000, height: 1000
                // }, scene);

                // fog.material = new BABYLON.StandardMaterial("fogMat", scene);
                // fog.material.emissiveColor = BABYLON.Color3.FromHexString("#ffffff");
                // fog.material.diffuseColor = glass.material.emissiveColor;
                // fog.visibility = 0.5;

                // this.fogs.push(fog);
                // for (var i = 0; i < 2; i++) {
                //     var cloneFog = fog.clone("fog" + i)
                //     this.fogs.push(cloneFog);
                // }

                //PARTICLE
                //==========================================================
                var particle = BABYLON.MeshBuilder.CreateBox("particleSource", {
                    size: 2
                }, scene);

                particle.position.set(0, 10000, 90);
                particle.material = glass.material;
                particle.visibility = 0.5;

                this.particleSource = particle;

                //NUMBERS
                //==========================================================

                for (var i = 0; i < 10; i++) {
                    var textPlane = BABYLON.Mesh.CreatePlane("textPlane" + i, 8, scene, false);
                    // textPlane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
                    textPlane.material = new BABYLON.StandardMaterial("textPlaneMat" + i, scene);
                    textPlane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
                    textPlane.material.disableLighting = true;

                    var textPlaneTexture = new BABYLON.DynamicTexture("texture" + i, 256, scene, true);
                    textPlane.material.diffuseTexture = textPlaneTexture;
                    textPlane.material.opacityTexture = textPlaneTexture;
                    textPlane.material.backFaceCulling = false;

                    var ctx = textPlaneTexture.getContext();
                    var x = 130;
                    var y = 173;
                    var txt = i.toFixed();
                    ctx.clearRect(0, 0, 256, 256);
                    ctx.font = "120px mainfont";
                    ctx.textAlign = "center";
                    ctx.strokeStyle = "#ed0049";
                    ctx.lineWidth = 15;
                    ctx.strokeText(txt, x, y);
                    textPlaneTexture.drawText(txt, x, y, ctx.font, "#ffffff", null);

                    textPlane.position.y = 10000;

                    this.numbers.push(textPlane);
                }
                //TILE MATS
                //===========================================================
                this.tileMaterialOdd = new BABYLON.StandardMaterial("tileMatOdd", scene);
                // this.tileMaterialOdd.emissiveColor = BABYLON.Color3.FromHexString("#17af89");
                this.tileMaterialOdd.ambientColor = BABYLON.Color3.FromHexString("#f26e5f");
                this.tileMaterialOdd.diffuseColor = BABYLON.Color3.FromHexString("#f26e5f");

                this.tileMaterialEven = new BABYLON.StandardMaterial("tileMatEven", scene);
                // this.tileMaterialEven.emissiveColor = BABYLON.Color3.FromHexString("#209e7e");
                this.tileMaterialEven.ambientColor = BABYLON.Color3.FromHexString("#fa9368");
                this.tileMaterialEven.diffuseColor = BABYLON.Color3.FromHexString("#fa9368");

                this.ballMaterial = new BABYLON.StandardMaterial("ballMat", scene);
                // this.ballMaterial.emissiveColor = BABYLON.Color3.FromHexString("#220000");
                this.ballMaterial.ambientColor = BABYLON.Color3.FromHexString("#e6354e");
                this.ballMaterial.diffuseColor = BABYLON.Color3.FromHexString("#ff0000");

                setTimeout(function () {
                    // this.tileMaterialOdd.disableLighting = true;
                    // this.tileMaterialEven.disableLighting = true;

                    // this.fogs[0].material.disableLighting = true;
                    this.glassSource.material.disableLighting = true;
                    if (ig.altBabylon.scene.getMaterialByName("default material")) ig.altBabylon.scene.getMaterialByName("default material").disableLighting = true;
                }.bind(this), 200);
            },

            redrawTexts: function () {
                for (var i = 0; i < this.numbers.length; i++) {
                    var textPlaneTexture = this.numbers[i].material.diffuseTexture;
                    var ctx = textPlaneTexture.getContext();
                    var x = 130;
                    var y = 173;
                    var txt = i.toFixed();
                    ctx.clearRect(0, 0, 256, 256);
                    ctx.font = "120px mainfont";
                    ctx.textAlign = "center";
                    ctx.strokeStyle = "#ed0049";
                    ctx.lineWidth = 15;
                    ctx.strokeText(txt, x, y);
                    textPlaneTexture.drawText(txt, x, y, ctx.font, "#ffffff", null);
                    textPlaneTexture.update();
                }
            },

            resetTiles: function () {
                for (var i = 0; i < this.tiles.length; i++) {
                    var tile = this.tiles[i];
                    tile.dispose();
                }

                for (var i = 0; i < this.glasses.length; i++) {
                    var glass = this.glasses[i];
                    this.disposeGlass(glass);
                }

                this.scorePlateNumber = 1;
                this.spawnGlassCountdown = this.spawnGlassCountdownMax * 2

                this.tiles = [];
                this.spawnCount = 0;
                this.angle = 0;
                this.changeAngleCountdown = 0;
                for (var i = 0; i < 50; i++) {
                    this.spawnNextTile();
                }
                this.lowestPlayerY = 9999;
            },

            spawnNextTile: function (fade) {
                this.spawnCount++;
                var a1 = new BABYLON.Vector3(0, 0, 0);
                var a2 = new BABYLON.Vector3(0, 0, 0);
                var b1 = new BABYLON.Vector3(0, 0, 0);
                var b2 = new BABYLON.Vector3(0, 0, 0);

                var prevTile = null;

                this.changeAngleCountdown--;
                if (this.changeAngleCountdown < 0) {
                    this.changeAngleCountdown = ig.random.int(this.changeAngleCountdownMin, this.changeAngleCountdownMax);
                    this.angle = ig.random.float(this.angleMin, this.angleMax);
                    if (ig.random.bool()) this.angle *= -1;
                }

                if (this.tiles.length < 10) this.angle = 0;

                if (this.tiles.length == 0) {
                    a1.set(-this.tileWidth, 0, 0);
                    a2.set(this.tileWidth, 0, 0);
                } else {
                    prevTile = this.tiles[this.tiles.length - 1];
                    a1.copyFrom(prevTile.b1);
                    a2.copyFrom(prevTile.b2);
                    var centerX = (a1.x + a2.x) / 2;
                    var centerZ = (a1.z + a2.z) / 2;

                    this.rotateOnYAxis(a1, centerX, centerZ, this.angle);
                    this.rotateOnYAxis(a2, centerX, centerZ, this.angle);

                    this.normalizeYToCenter(a1, centerX, centerZ, this.tileWidth);
                    this.normalizeYToCenter(a2, centerX, centerZ, this.tileWidth);
                }

                b1.x = a1.x - (a2.z - a1.z);
                b1.z = a1.z + (a2.x - a1.x);
                b2.x = a2.x + (a1.z - a2.z);
                b2.z = a2.z - (a1.x - a2.x);

                this.normalizeYToCenter(b1, a1.x, a1.z, this.segmentWidth);
                this.normalizeYToCenter(b2, a2.x, a2.z, this.segmentWidth);


                b1.y = b2.y = a1.y - this.downStep;

                if (prevTile) {
                    a1.copyFrom(prevTile.b1);
                    a2.copyFrom(prevTile.b2);
                }
                var paths = [[a1, a2], [b1, b2]]

                var tile = BABYLON.MeshBuilder.CreateRibbon("tile", { pathArray: paths, sideOrientation: BABYLON.Mesh.DOUBLESIDE });
                if (this.spawnCount % 2 == 1) tile.material = this.tileMaterialOdd;
                else tile.material = this.tileMaterialEven;
                this.tiles.push(tile);
                if (fade) tile.visibility = 0;
                // console.log(tile);


                tile.a1 = a1;
                tile.a2 = a2;
                tile.b1 = b1;
                tile.b2 = b2;

                tile.lowestY = Math.min([a1.y, a2.y, b1.y, b2.y]);
                tile.highestY = Math.max([a1.y, a2.y, b1.y, b2.y]);

                tile.plane = BABYLON.Plane.FromPoints(b1, b2, a1);

                
                this.spawnGlassCountdown--;
                if (this.spawnGlassCountdown <= 0) {
                    this.spawnGlassCountdown = this.spawnGlassCountdownMax;
                    this.spawnGlass(tile);
                }

            },

            spawnGlass: function (tile) {
                var glass = this.glassSource.createInstance("glass");
                this.glasses.push(glass);

                var c1 = this.getCenterVec3(tile.b1, tile.a1);
                var c2 = this.getCenterVec3(tile.b2, tile.a2);
                var c = this.getCenterVec3(c1, c2);
                glass.position.copyFrom(c);
                // console.log("glass", glass.position.x.round(), glass.position.y.round(), glass.position.z.round())

                var tilePoint = c1.subtract(c2);
                var zeroPoint = new BABYLON.Vector3(100, 0, 0);
                var normalPoint = new BABYLON.Vector3(0, 1, 0);
                var yAngle = BABYLON.Vector3.GetAngleBetweenVectors(zeroPoint, tilePoint, normalPoint);
                glass.rotation.y = yAngle;


                glass.center = c;
                glass.c1 = c1;
                glass.c2 = c2;

                this.spawnNumbers(glass);


            },

            spawnNumbers: function (glass) {
                glass.score = this.scorePlateNumber
                var str = this.scorePlateNumber + "";
                var arr = str.split("");
                var numberPlates = [];
                var numberOffsets = [];
                var spacing = 1.5;
                if (arr.length == 1) {
                    numberOffsets[0] = { x: 0, y: 0 };
                }
                else if (arr.length == 2) {
                    numberOffsets[0] = this.normalize2(glass.c1.x - glass.center.x, glass.c1.z - glass.center.z, spacing);
                    numberOffsets[1] = this.normalize2(glass.c2.x - glass.center.x, glass.c2.z - glass.center.z, spacing);
                }
                else if (arr.length == 3) {
                    numberOffsets[0] = this.normalize2(glass.c1.x - glass.center.x, glass.c1.z - glass.center.z, spacing * 1.5);
                    numberOffsets[1] = { x: 0, y: 0 };
                    numberOffsets[2] = this.normalize2(glass.c2.x - glass.center.x, glass.c2.z - glass.center.z, spacing * 1.5);
                }
                else if (arr.length == 4) {
                    numberOffsets[0] = { x: 0, y: 0 };
                    numberOffsets[1] = { x: 0, y: 0 };
                    numberOffsets[2] = { x: 0, y: 0 };
                    numberOffsets[3] = { x: 0, y: 0 };
                }
                else if (arr.length == 4) {
                    numberOffsets[0] = { x: 0, y: 0 };
                    numberOffsets[1] = { x: 0, y: 0 };
                    numberOffsets[2] = { x: 0, y: 0 };
                    numberOffsets[3] = { x: 0, y: 0 };
                    numberOffsets[4] = { x: 0, y: 0 };
                }

                for (var i = 0; i < arr.length; i++) {
                    var digit = arr[i];
                    var num = this.numbers[digit].createInstance("numinstance1");
                    num.position.copyFrom(glass.position);
                    // num.position.y += this.tileWidth + 5;
                    num.position.y += this.tileWidth - 6;
                    num.position.x += numberOffsets[i].x;
                    num.position.z += numberOffsets[i].y;
                    num.rotation.copyFrom(glass.rotation);
                    num.rotation.y += Math.PI
                    numberPlates.push(num);
                }
                glass.numberPlates = numberPlates;
                this.scorePlateNumber++;
            },

            spawnParticles: function (glass) {
                var poolIndex = 0
                // console.log("glassPosition", glass.position.x.round(), glass.position.y.round(), glass.position.z.round())
                for (var i = 0; i < 40; i++) {
                    var particle = null
                    while (!particle && poolIndex < this.particles.length) {
                        if (!this.particles[poolIndex].isActive) particle = this.particles[poolIndex]
                        poolIndex++;
                    }

                    if (!particle) {
                        particle = this.particleSource.createInstance("particleInstance");
                        this.particles.push(particle);
                    }

                    var norm = this.normalize2(glass.c1.x - glass.c2.x, glass.c1.z - glass.c2.z, ig.random.float(0, this.tileWidth * 2));
                    norm.x += glass.c2.x;
                    norm.y += glass.c2.z;
                    particle.position.set(norm.x, glass.position.y + ig.random.float(0, this.tileWidth), norm.y);
                    particle.isActive = true;
                    particle.isVisible = true;
                    // console.log("particle" + i, (particle.position.x - glass.position.x).round(), (particle.position.y - glass.position.y).round(), (particle.position.z - glass.position.z).round());
                    // console.log(particle)

                    particle.scaling.set(Math.random(1, 2), Math.random(1, 2), Math.random(1, 2))
                    particle.rotation.set(Math.random(1, 2), Math.random(1, 2), Math.random(1, 2))
                    particle.directionVec3 = new BABYLON.Vector3(particle.position.x - glass.position.x, particle.position.y - glass.position.y, particle.position.z - glass.position.z)
                    // particle.directionVec3.normalize();
                    particle.angleDirectionVec3 = new BABYLON.Vector3(Math.random(0, 1), Math.random(0, 1), Math.random(0, 1));
                    particle.speed = ig.random.float(1, 4);
                    // particle.speed = 3
                    particle.angularSpeed = ig.random.float(2, 4);
                }
            },

            deactivateParticle: function (particle) {
                particle.isActive = false;
                particle.isVisible = false;
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

            updateTileEdge: function (playerPos) {
                var firstTile = this.tiles[0];
                var lastTile = this.tiles[this.tiles.length - 1];
                var lowerLimit = 50;
                if (this.lowestPlayerY > playerPos.y) this.lowestPlayerY = playerPos.y

                if (firstTile.a1.y - this.lowestPlayerY > 50) this.tiles.shift().dispose();

                if (this.lowestPlayerY - lastTile.a1.y < lowerLimit) this.spawnNextTile(true);


                if (this.glasses[0].position.y - this.lowestPlayerY > 50) this.disposeGlass(this.glasses.shift());


                for (var i = 0; i < this.tiles.length; i++) {
                    var tile = this.tiles[i];
                    if (tile.visibility < 1) {
                        tile.visibility += (1 - tile.visibility) / 20;
                        if (tile.visibility > 0.95) tile.visibility = 1;
                    }
                }

                // var fogY = this.lowestPlayerY - lowerLimit;
                // if (fogY > -60) fogY = -60;

                // for (var i = 0; i < this.fogs.length; i++) {
                //     var fog = this.fogs[i];
                //     fog.position.x = lastTile.a1.x;
                //     fog.position.z = lastTile.a1.z;
                //     fog.position.y = fogY + i * 3;
                //     fog.visibility = 1 - i * (0.8 / this.fogs.length)
                // }
            },

            updateParticles: function (playerPos, dt) {
                for (var i = 0; i < this.particles.length; i++) {
                    var particle = this.particles[i];
                    if (particle.position.y - playerPos.y > 50) this.deactivateParticle(particle);
                    if (particle.isActive) {
                        particle.position.x += particle.directionVec3.x * particle.speed * dt;
                        particle.position.y += particle.directionVec3.y * particle.speed * dt;
                        particle.position.z += particle.directionVec3.z * particle.speed * dt;
                        particle.rotation.x += particle.angleDirectionVec3.x * particle.angularSpeed * dt;
                        particle.rotation.y += particle.angleDirectionVec3.y * particle.angularSpeed * dt;
                        particle.rotation.z += particle.angleDirectionVec3.z * particle.angularSpeed * dt;
                    }
                }



            },

            resetParticles: function (playerPos, dt) {
                for (var i = 0; i < this.particles.length; i++) {
                    var particle = this.particles[i];
                    this.deactivateParticle(particle);
                }
            },

            disposeGlass: function (glass) {
                for (var i = 0; i < glass.numberPlates.length; i++) {
                    var numPlate = glass.numberPlates[i];
                    numPlate.dispose();
                }
                glass.dispose();
            }


        }
    });
