ig.module(
	'babylon.entities.laser'
)
.requires(
    'babylon.plugins.wgl-entity'
)
.defines(function(){
    wgl.modules.Laser = wgl.Entity.extend({
        lifeTimer:null,
        lifeTime:10,
        indexID:null,
        
        deltaRotation:new BABYLON.Vector3.Zero(),
        laserMaterial:null,
        array:null,
        init:function(x,y,z,settings)
    	{
            this.parent(x,y,z,settings);
            
            this.lifeTimer=new ig.Timer();
            
            var laserlen = 50;
            this.meshes.push(BABYLON.MeshBuilder.CreatePlane("pl", { width: 2, height: laserlen }, wgl.game.currentScene));
            this.meshes[0].position = new BABYLON.Vector3.Zero();
            
            
            this.laserMaterial = new BABYLON.StandardMaterial("texture1", wgl.game.currentScene);
            this.laserMaterial.emissiveColor = new BABYLON.Color3(1, 0.2, 0.7);
            this.laserMaterial.backFaceCulling = false;
            //console.log(this.laserMaterial)
            this.meshes[0].material = this.laserMaterial;
            this.meshes[0].position=this.pos;
            
            if(settings.indexID)
            {
                this.indexID=settings.indexID;
            }
            if(settings.array)
            {
                this.array=settings.array;
            }
            var flip = Math.random()*1;
            this.deltaRotation.x = flip<0.5?Math.random()*10:Math.random()*-10;
            
            flip = Math.random()*1;
            this.deltaRotation.y = flip<0.5?Math.random()*10:Math.random()*-10;
            
            flip = Math.random()*1;
            this.deltaRotation.z = flip<0.5?Math.random()*10:Math.random()*-10;
    	},
        update:function()
        {
            this.parent();
            if(this.lifeTimer
            && this.lifeTimer.delta() > this.lifeTime)
            {
                this.kill();
                return;
            }
            this.meshes[0].rotation.x += this.deltaRotation.x*ig.system.tick;
            this.meshes[0].rotation.y += this.deltaRotation.y*ig.system.tick;
            this.meshes[0].rotation.z += this.deltaRotation.z*ig.system.tick;
        },
    
        kill:function()
        {
            this.parent();
            this.array.splice(this.indexID,1);
        }
    }); 
});