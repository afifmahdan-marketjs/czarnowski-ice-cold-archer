ig.module(
	'babylon.plugins.wgl-game'
)
.requires(
)
.defines(function(){ "use strict";

    wgl.Game = ig.Class.extend({
    	
        entities:[],
        ready:false,
        init: function() {},
        update:function()
        {
            //console.log("update wgl:" + this.entities.length);
            this.entitiesIndexToKill=[];
        
            for(var entIndex=0;entIndex<this.entities.length;entIndex++)
            {
                if(this.entities[entIndex])
                {
                    this.entities[entIndex].update();
                    if(this.entities[entIndex]._killed)
                    {
                        this.entitiesIndexToKill.push(entIndex);
                    }
                }
            }
            for(var toKillIndex=this.entitiesIndexToKill.length-1;toKillIndex>=0;toKillIndex--)
            {
                this.entities.splice(this.entitiesIndexToKill[toKillIndex],1);
            }
        },
        render:function()
        {
            //console.log("rendering");
            if(this.currentScene)
            {
                this.currentScene.render();
            }
        },
    	
        spawnEntity:function(entityClass,x,y,z,settings)
        {
            var ent = new (entityClass)(x,y,z,settings);
            
            this.entities.push(ent);
            //console.log(ent);
            return ent;
        },
    
        getEntityByName:function(name)
        {
            var ents=[];
            for(var entIndex=0;entIndex<this.entities.length;entIndex++)
            {
                //console.log(this.entities[entIndex].name);
                console.log(this.entities[entIndex].name)
                if(this.entities[entIndex].name===name)
                {
                    ents.push(this.entities[entIndex]);
                }
            }
            return ents;
        },
    
        getMeshByName:function(name)
        {
            for(var meshIndex=0;meshIndex<this.currentScene.meshes.length;meshIndex++)
            {
                //console.log(this.currentScene.meshes[meshIndex].name);
                if(this.currentScene.meshes[meshIndex].name===name)
                {
                    return this.currentScene.meshes[meshIndex];
                }
            }
            return null;
        },
    
        resizeAll:function()
        {
            for(var entIndex=0;entIndex<this.entities.length;entIndex++)
            {
                this.entities[entIndex].resize();
            }
        },

    });

});