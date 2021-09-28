ig.module(
	'babylon.plugins.wgl-entity'
)
.requires(
)
.defines(function(){ "use strict";
    wgl.Entity = ig.Class.extend({    
        pos:null,
        vel:null,
        acc:null,
        meshes:[],
        _killed:false,
        
	    init:function(x,y,z,settings)
	    {
            //Settings that begin with _mesh will be ignored in the merge
            ig.merge(this,settings);
            this.pos=new BABYLON.Vector3(0, 0, 0);
            this.vel=new BABYLON.Vector3(0, 0, 0);
            this.acc=new BABYLON.Vector3(0, 0, 0);
	    	//console.log("init base entity class");
            
            if(settings)
            {
                if(settings._mesh)
                {
                    this.meshes.push(settings._mesh);
                }
            }
            
            if(!isNaN(x))
            {
                this.pos.x=x;
            }
            if(!isNaN(y))   
            {
                this.pos.y=y;
            }
            if(!isNaN(z))
            {
                this.pos.z=z;
            }
	    },
        update:function(){},
        render:function(){},
        kill:function()
        {
            for(var i=0;i<this.meshes.length;i++)
            {
                var mesh = this.meshes[i];
                wgl.game.currentScene.stopAnimation(mesh);
                mesh.dispose();
                this.meshes.splice(i,1);
                i--;
            }
        
            this._killed=true;
        },
        reset:function(){},
        resize:function(){}
    });

});
