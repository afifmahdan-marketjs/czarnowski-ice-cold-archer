ig.module(
	'babylon.plugins.wgl-debug'
)
.requires(
)
.defines(function(){

    wgl.Debug = ig.Class.extend({
        debug:false,
        
        init:function(){},
        
        /**
        * Enable the scene debug layer
        */
        enableDebug:function()
        {
            wgl.game.currentScene.debugLayer.show();  
        },
        
        /**
         * Draw axis on the scene
         * @param scene The scene where the axis will be displayed
         * @param size The size of each axis.
         */
        axis2:function(scene, size) {
                //X axis

                //static CreateCylinder(name, height, diameterTop, diameterBottom, tessellation, subdivisions, scene, updatable, sideOrientation) → Mesh
                var x = BABYLON.Mesh.CreateCylinder("x", size, 0.1, 0.1, 6,4, scene, false);
                x.material = new BABYLON.StandardMaterial("xColor", scene);
    
                //Color3(red,green,blue)
                x.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
                x.position = new BABYLON.Vector3(size/2, 0, 0);
                x.rotation.z = Math.PI >>>1;

                //Y axis
                var y = BABYLON.Mesh.CreateCylinder("y", size, 0.1, 0.1, 6,4, scene, false);
                y.material = new BABYLON.StandardMaterial("yColor", scene);
                y.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
                y.position = new BABYLON.Vector3(0, size / 2, 0);

                //Z axis
                var z = BABYLON.Mesh.CreateCylinder("z", size, 0.1, 0.1, 6,4, scene, false);
                z.material = new BABYLON.StandardMaterial("zColor", scene);
                z.material.diffuseColor = new BABYLON.Color3(0, 0, 1);
                z.position = new BABYLON.Vector3(0, 0, size/2);
                z.rotation.x = Math.PI >>>1;
        },
        
    });

});

