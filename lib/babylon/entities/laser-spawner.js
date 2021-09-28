ig.module(
	'babylon.entities.laser-spawner'
)
.requires(
    'babylon.plugins.wgl-entity',
    'babylon.entities.laser'
)
.defines(function(){
    wgl.modules.LaserSpawner = wgl.Entity.extend({
        laserArray:[],
        laserLength:50,
        
        laserPattern:null,
        laserTimer:null,
        
        spawnTime:3,
        spawnLimit:3,
        
        name:"LaserSpawner",
        startSpawn:false,
        init:function(x,y,z,settings)
    	{
            this.parent(x,y,z,settings);
            this.laserTimer = new ig.Timer();
    	},
        update:function()
        {
            this.parent();
            
            if(this.laserTimer)
            {
                if(!this.startSpawn)
                {
                    this.laserTimer.reset();
                }
                
                if(this.laserTimer.delta()>this.spawnTime)
                {
                    if(this.laserArray.length<this.spawnLimit)
                    {
                        this.spawnLaser();
                        this.laserTimer.reset();
                    }
                }
                
            }                        
        },
        start:function()
        {
            this.startSpawn=true;
        },
        spawnLaser:function()
        {
            var x=0,y=0,z=0;
            
            this.laserArray.push(wgl.game.spawnEntity(wgl.modules.Laser,
                                x,
                                y,
                                z,
                                {indexID:this.laserArray.length,array:this.laserArray}));
            
        },
        
        kill:function()
        {
            this.parent();
        }
    }); 
});