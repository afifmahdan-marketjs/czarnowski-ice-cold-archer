ig.module('game.entities.webgl.webgl-control-game')
.requires(
    'impact.entity',
    'game.entities.buttons.button-pause',
    'game.entities.pointer',
    'plugins.handlers.webgl-virtual-joystick-handler',
    'plugins.handlers.webgl-mouse-handler'
)
.defines(function() {
    EntityWebglControlGame = ig.Entity.extend({
        
        alpha:0,
        dAlpha:0.05,
        size:{x:10,y:10},
        pos:{x:0,y:0},
        name:"webgl control game",
        
        control:null,
        laserSpawner:null,
        camera:null,
        
        menuButton:null,
        pointer:null,
        ignorePause:true,
        
        hitTimer:null,
        scoreTimer:null,
        levelTimer:null,
        
        lifebar:15,
        
        levelTime:120,
        collidedWithLaserBeam:false,
        
        lifebarColors:{
            healthy:"rgba(0,200,0,0.8)"
        },
        
        collidedColor:"rgba(255,0,0,0.5)",
        
        metricColor:"rgba(0,255,255,0.8)",
        
        metricText:{
            time:"Time left:",
            score:"Score:"
        },
        
        init:function(x,y,settings)
        {
            this.parent(x,y,settings);
            
            if(ig.global.wm)
            {
                return;
            }
            this.metricText.time=_STRINGS.Game.metricTimeLeft;
            this.metricText.score=_STRINGS.Game.metricScore;
            
            this.scoreTimer=new ig.Timer();
            this.levelTimer=new ig.Timer();
            
            this.pauseButton=ig.game.spawnEntity(EntityButtonPause,20,20);
            this.pointer=ig.game.spawnEntity(EntityPointer,0,0);

            //Pause impactjs and load up the webgl level
            
            //ig.game.pauseGame();
        },
        
        update:function()
        {
            this.parent();
            if(wgl.game.ready === false)
            {
                return;
            }
            if(this.camera === null)
            {
                this.camera = wgl.game.getEntityByName("Camera")[0];
                return;
            }
            if(this.laserSpawner === null)
            {
                this.laserSpawner = wgl.game.getEntityByName("LaserSpawner")[0];
                
                return;
            }
            
            if(this.control === null)
            {
                if(ig.ua.touchDevice)
                {
                    if(wgl.game.currentScene)
                    {
                        this.control = new ig.WebglVirtualJoystickHandler(wgl.game.currentScene.activeCamera);
                    }
                }
                else
                {
                    if(wgl.game.currentScene)
                    {
                        this.control = new ig.WebglMouseHandler(wgl.game.currentScene.activeCamera);
                        this.control.angularSensibility=500;
                    }
                }
                
                return;
            }
            
            if(ig.game.paused)
            {
                this.levelTimer.pause();
                this.scoreTimer.pause();
            }
            else
            {
                
                this.levelTimer.unpause();
                this.scoreTimer.unpause();
                if(this.lifebar<=0)
                {
                    //Player has died
                    this.endGame();
                    return;
                }
            
                this.control.update();
            
                if(this.levelTimer)
                {
                    if(this.levelTimer.delta()>2)
                    {
                        //laser spawner start
                        if(this.laserSpawner)
                        {
                           this.laserSpawner.start();
                        }
                    }
                    else if(this.levelTimer.delta() > this.levelTime)
                    {
                        //game ends
                        return;
                    }   
                }
            
                if(this.scoreTimer
                && this.scoreTimer.delta()>0.1)
                {
                    ig.game.score+=1;
                    this.scoreTimer.reset();
                }
            
                if(this.hitTimer)
                {
                    if(this.hitTimer.delta()>0.5)
                    {
                        this.hitTimer=null;
                        this.collidedWithLaserBeam=false;
                    
                    }
                    return;
                }
                if(this.laserSpawner)
                {
                    
                    for(var i =0;i<this.laserSpawner.laserArray.length;i++)
                    {
                        var laser = this.laserSpawner.laserArray[i];
                
                        if(laser.meshes[0])
                        {
                            this.collidedWithLaserBeam=laser.meshes[0].intersectsMesh(this.camera.hitbox, true);
                        
                    
                            if(this.collidedWithLaserBeam)
                            {
                                this.lifebar-=5;
                                //ig.game.score=ig.game.score>>>1;
                                this.hitTimer=new ig.Timer();
                                return;
                            }
                        }
                    }
                }
                /*
                if(ig.game.io.held("up")){
                    this.camera.move(this.camera.MOVEKEYS.UP);
                }
                if(ig.game.io.held("down")){
                    this.camera.move(this.camera.MOVEKEYS.DOWN);
                }
                if(ig.game.io.held("left")){
                    this.camera.move(this.camera.MOVEKEYS.LEFT);
                }
                if(ig.game.io.held("right")){
                    this.camera.move(this.camera.MOVEKEYS.RIGHT);
                }
                */
            }
        },
        endGame:function()
        {
            this.camera.camera.detachControl(window);
            this.gameover=true;
            ig.game.director.jumpTo(LevelEnd);
            
        },
        miss:function()
        {
            this.alpha+=this.dAlpha;
            if(this.alpha<0.01)
            {
                wgl.game.miss=false;
                this.dAlpha= 0.05;
                this.alpha=0.02;
            }
            else if(this.alpha>0.5)
            {
                this.dAlpha= (-0.05);
            }
        },
        
        draw:function()
        {
            this.parent();
            if(ig.global.wm)
            {
                return;
            }
            var ctx = ig.system.context;
            ctx.clearRect(0,0,ig.system.width,ig.system.height);
            
            this.drawLifebar(ctx);
            this.drawCollision(ctx);
            this.drawMetric(ctx);
            
            if(this.control)
            {
                this.control.draw();
            }
            
        },
        
        drawMetric:function(ctx)
        {
            ctx.fillStyle=this.metricColor;
            ctx.textAlign="center";
            //var timeLeftString = this.metricText.time+Math.floor(this.levelTime-this.levelTimer.delta());
            var scoreString = this.metricText.score+ig.game.score;
            //ctx.fillText(timeLeftString,ig.system.width>>>1,50);
            ctx.fillText(scoreString,ig.system.width>>>1,50);

            ctx.fillText("Survive as long as possible",ig.system.width>>>1,70);
            ctx.textAlign="start";
        },
        
        drawCollision:function(ctx)
        {
            if (this.collidedWithLaserBeam) {
                var ctx=ig.system.context;
                ctx.fillStyle=this.collidedColor;
                ctx.fillRect(0,0,ig.system.width,ig.system.height);
            } 
        },
        
        drawLifebar:function(ctx)
        {
            if(this.lifebar <0)
            {
                this.lifebar=0;
            }
            ctx.fillStyle =this.lifebarColors.healthy;
            ctx.fillRect((ig.system.width>>>1)-(this.lifebar>>>1),20,this.lifebar,10);
        }
        
    });
});