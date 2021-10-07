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


            init: function () {
                var scene = ig.altBabylon.scene;

                this.initGround()
                this.initPost()
                this.initTarget()
                this.initArrow()
                this.initBow()



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
