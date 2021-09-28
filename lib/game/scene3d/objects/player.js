ig.module(
    'game.scene3d.objects.player'
)
    .requires(

    )
    .defines(function () {
        "use strict";
        ig.Player = ig.Class.extend({
            mesh: null,

            realPosition: null,

            gravity: 100,
            maxVelocity: 40,
            bounceVelocityThreshold: 10,
            velocity: null,
            steeringVector: null,
            steeringPower: 1,
            steeringPowerDefault: 1,
            forwardSpeed: 40,
            forwardSpeedDefault: 40,
            steerLeft: false,
            steerRight: false,
            enableSteering: true,
            targetTile: null,
            isOnGround: false,

            speedMultiplier: 1.3,
            speedMultiplierBase: 1.5,
            speedMultiplierIncrement: 0.03,

            tempVec1: null,
            tempVec2: null,
            tempVec3: null,

            score: 0,

            prevY: 0,
            radius: 1.5,
            airTime: 0,
            bounceDelay: 0,

            rays: [],
            rayPos: [],

            init: function () {
                this.mesh = BABYLON.MeshBuilder.CreateSphere("player", { diameter: this.radius * 2 }, wgl.game.currentScene);
                this.mesh.material = ig.meshManager.ballMaterial;
                this.mesh.position.set(0, 30, this.radius * 2);

                this.realPosition = new BABYLON.Vector3(0, 0, 0);

                this.tempVec1 = new BABYLON.Vector3(0, 0, 0);
                this.tempVec2 = new BABYLON.Vector3(0, 0, 0);
                this.tempVec3 = new BABYLON.Vector3(0, 0, 0);
                this.velocity = new BABYLON.Vector3(0, 0, 0);
                this.steeringVector = new BABYLON.Vector3(0, 0, this.forwardSpeed);


                this.addRay(new BABYLON.Vector3(0, 0, 0));
                var rayCount = 8;
                for (var i = 0; i < rayCount; i++) {
                    var pos = new BABYLON.Vector3(0, 0, 0);
                    var angle = i * ((Math.PI * 2) / rayCount);
                    var sin = Math.sin(angle);
                    var cos = Math.cos(angle);
                    pos.x = sin * -this.radius;
                    pos.z = cos * -this.radius;

                    this.addRay(pos);
                }
            },

            addRay: function (pos) {
                var ray = new BABYLON.Ray(new BABYLON.Vector3(pos.x, pos.y, pos.z), new BABYLON.Vector3(0, -1, 0), 5);
                this.rays.push(ray);
                this.rayPos.push(pos)

                // if (pos.x == 0 && pos.y == 0 && pos.z == 0) {
                //     var rayHelper = new BABYLON.RayHelper(ray);
                //     rayHelper.show(wgl.game.currentScene);
                // }
            },

            reset: function () {
                this.steerLeft = this.steerRight = false;
                this.targetTile = null;
                this.enableSteering = true;
                this.isOnGround = false;
                this.prevY = 0;
                this.velocity.set(0, 0, 0);
                this.realPosition.set(0, 10, 50);
                // this.realPosition.set(0, 10, 0);
                this.mesh.position.copyFrom(this.realPosition);
                this.steeringVector.set(0, 0, this.forwardSpeed);
                this.velocity = new BABYLON.Vector3(0, -this.maxVelocity, 0);
                this.setSpeedMultiplier(this.speedMultiplierBase);
                this.score = 0;
                this.airTime = 0;
            },

            setSpeedMultiplier: function (multiplier) {
                this.speedMultiplier = multiplier;
                this.steeringPower = this.steeringPowerDefault * multiplier;
                this.forwardSpeed = this.forwardSpeedDefault * multiplier;
                this.steeringVector.normalize();
                this.steeringVector.x *= this.forwardSpeed;
                this.steeringVector.y = 0;
                this.steeringVector.z *= this.forwardSpeed;
            },

            update: function (dt) {

                this.applyGravity(dt);
                this.applySteering(dt);
                this.applyVelocity(dt);
                this.checkCollision(dt);
                this.applyMeshPosition(dt);

            },

            applyMeshPosition: function (dt) {
                // console.log(this.prevY - this.realPosition.y);
                this.prevY = this.realPosition.y

                this.mesh.position.x = this.realPosition.x;
                this.mesh.position.z = this.realPosition.z;

                this.mesh.position.y += (this.realPosition.y - this.mesh.position.y) / 7;
                this.mesh.position.y -= 0.15;
                // this.mesh.position.y = this.realPosition.y;
            },

            applyGravity: function (dt) {
                if (!this.isOnGround) this.velocity.y -= this.gravity * dt;
            },

            applySteering: function (dt) {
                if (!this.enableSteering) {
                    var start = this.tempVec1;
                    var end = this.tempVec2;

                    start.copyFrom(this.steeringVector);
                    var length = start.length();
                    this.targetTile.b1.subtractToRef(this.targetTile.a1, end);
                    end.y = 0;


                    BABYLON.Vector3.LerpToRef(start, end, 0.5, this.tempVec3);
                    // console.log(start, end, this.tempVec3);

                    this.tempVec3.normalize();
                    this.tempVec3.x *= length;
                    this.tempVec3.y *= length;
                    this.tempVec3.z *= length;
                    this.steeringVector.copyFrom(this.tempVec3);


                    // console.log(this.tempVec3.length() == length)

                    return;
                }
                if (this.steerLeft) {
                    this.steeringVector.rotateByQuaternionToRef(BABYLON.Quaternion.FromEulerAngles(0, this.steeringPower * -dt, 0), this.tempVec3);
                    this.steeringVector.copyFrom(this.tempVec3);
                }
                if (this.steerRight) {
                    this.steeringVector.rotateByQuaternionToRef(BABYLON.Quaternion.FromEulerAngles(0, this.steeringPower * dt, 0), this.tempVec3);
                    this.steeringVector.copyFrom(this.tempVec3);
                    // console.log(this.steeringPower * dt, this.steeringVector.x, this.steeringVector.z, this.tempVec3.x, this.tempVec3.z);
                }

                // console.log(this.steerLeft, this.steerRight, this.steeringVector.x, this.steeringVector.z)

                this.velocity.x = this.steeringVector.x;
                this.velocity.z = this.steeringVector.z;
            },

            applyVelocity: function (dt) {
                // if (this.velocity.y > this.maxVelocity) this.velocity.y = this.maxVelocity;
                // else
                if (this.velocity.y < -this.maxVelocity) this.velocity.y = -this.maxVelocity;
                this.realPosition.x += this.velocity.x * dt;
                this.realPosition.y += this.velocity.y * dt;
                this.realPosition.z += this.velocity.z * dt;
                // console.log(this.velocity.x, this.velocity.y, this.velocity.z)
            },

            checkCollision: function (dt) {
                for (var i = 0; i < this.rays.length; i++) {
                    var ray = this.rays[i];
                    ray.origin.set(this.realPosition.x + this.rayPos[i].x, this.realPosition.y + this.rayPos[i].y, this.realPosition.z + this.rayPos[i].z)
                }

                this.isOnGround = false;
                var tiles = ig.meshManager.tiles;
                for (var i = 0; i < tiles.length; i++) {
                    var tile = tiles[i];
                    if (this.isTileNear(tile)) {

                        if (this.checkCenterRayCollision(tile)) {

                            if (this.velocity.y <= -this.bounceVelocityThreshold && this.enableSteering && this.bounceDelay < 0 && this.airTime > 0.2) {
                                ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.start);
                                this.velocity.set(0, 50, 0);
                                this.enableSteering = false;
                                this.targetTile = tile;
                                this.bounceDelay = 2;
                                this.airTime = 0;
                                return;
                            }
                            // if (!this.enableSteering) this.velocity.set(0, 0, 0);
                            this.enableSteering = true;
                            this.isOnGround = true;
                            // this.velocity.set(0, -5, 0);
                        } else if (this.checkSideRayCollision(tile)) {
                            this.enableSteering = true;
                            this.isOnGround = true;
                        } else if (this.realPosition.y < -50 && this.realPosition.y < tile.highest && this.mesh.intersectsMesh(tile, true)) {
                            // if (this.realPosition.y < tile.position.y) {
                            this.realPosition.y -= this.radius;
                            // this.realPosition.y = tile.lowestY - this.radius;
                            // }
                        }
                        tile.receiveShadows = true
                    } else {
                        tile.receiveShadows = false;
                    }



                }

                var glasses = ig.meshManager.glasses;
                for (var i = 0; i < glasses.length; i++) {
                    var glass = glasses[i];
                    if (glass.isVisible && glass.intersectsMesh(this.mesh, true)) {
                        ig.soundHandler.sfxPlayer.play(ig.soundHandler.sfxPlayer.soundList.score);
                        ig.meshManager.spawnParticles(glass);
                        glass.isVisible = false;
                        for (var j = 0; j < glass.numberPlates.length; j++) {
                            var numPlate = glass.numberPlates[j];
                            numPlate.isVisible = false;
                        }
                        this.score = glass.score;
                        this.setSpeedMultiplier(this.speedMultiplierBase + this.score * this.speedMultiplierIncrement);
                    }
                }

                this.bounceDelay -= dt;

                if (this.isOnGround) this.airTime = 0;
                else this.airTime += dt;
            },

            checkCenterRayCollision: function (tile) {
                var info = this.rays[0].intersectsMesh(tile, false);
                if (info.hit && info.distance < this.radius) {
                    // console.log(info.distance < 5, info.pickedPoint.y)
                    // this.realPosition.x = info.pickedPoint.x;
                    this.realPosition.y = info.pickedPoint.y + this.radius;
                    // this.realPosition.x = info.pickedPoint.x;
                    return true;
                }
                return false;
            },

            checkSideRayCollision: function (tile) {
                for (var i = 1; i < this.rays.length; i++) {
                    var ray = this.rays[i];

                    var info = ray.intersectsMesh(tile, false);
                    var distanceThreshold = this.radius * 0.7;
                    if (info.hit && info.distance < distanceThreshold) {
                        this.realPosition.y = info.pickedPoint.y + distanceThreshold;
                        return true;
                    }
                }
                return false;
            },

            isTileNear: function (tile) {
                var minDistance = 50;
                var dx = this.realPosition.x - tile.a1.x;
                var dy = this.realPosition.y - tile.a1.y;
                var dz = this.realPosition.z - tile.a1.z;

                return dx * dx + dy * dy + dz * dz < minDistance * minDistance;
            },

            areLinesIntersect: function (a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y) {
                var result = this.checkLineIntersection(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y);
                if (result.onLine1 && result.onLine2) return true;
                return false;
            },

            checkLineIntersection: function (line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
                // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
                var denominator;
                var a;
                var b;
                var numerator1;
                var numerator2;
                var result = {
                    x: null,
                    y: null,
                    onLine1: false,
                    onLine2: false
                };

                denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
                if (denominator == 0) {
                    return result;
                }

                a = line1StartY - line2StartY;
                b = line1StartX - line2StartX;
                numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
                numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
                a = numerator1 / denominator;
                b = numerator2 / denominator;

                // if we cast these lines infinitely in both directions, they intersect here:
                result.x = line1StartX + (a * (line1EndX - line1StartX));
                result.y = line1StartY + (a * (line1EndY - line1StartY));
                /*
                        // it is worth noting that this should be the same as:
                        x = line2StartX + (b * (line2EndX - line2StartX));
                        y = line2StartX + (b * (line2EndY - line2StartY));
                        */
                // if line1 is a segment and line2 is infinite, they intersect if:
                if (a > 0 && a < 1) {
                    result.onLine1 = true;
                }
                // if line2 is a segment and line1 is infinite, they intersect if:
                if (b > 0 && b < 1) {
                    result.onLine2 = true;
                }
                // if line1 and line2 are segments, they intersect if both of the above are true
                return result;
            },

        });
    });
