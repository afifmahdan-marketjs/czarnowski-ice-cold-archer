ig.module(
    'plugins.handlers.debug-handler'
)
.requires(
)
.defines(function(){

    ig.DebugHandler = ig.Class.extend({
        
        init: function(){

        },
        setDebug:function(options){
            if(options.debug){
                this.game.debugMode=options.debug;
                this.wm.debugMode=options.debug;
            }
            else{
                this.game.debugMode=false;
                this.wm.debugMode=false;
            }
            
            if(options.debugEnt){
                this.game.debugEntities=options.debugEnt;
            }else{
                this.game.debugEntities=false;
            }

            if(options.debugFPS){
                this.game.debugFPS=options.debugFPS;
            }else{
                this.game.debugFPS=false;
            }
        },
        wm:{
            debugMode:false,
        	draw:function(pos,size){
        		var ctx= ig.system.context
  				ctx.fillStyle = "rgba(0,100,100,1)";
  				var zoomVal = wm.config.view.zoom;
  				var x=(pos.x-ig.game.screen.x)*zoomVal;
  				var y=(pos.y-ig.game.screen.y)*zoomVal;
  				var w=size.x*zoomVal;
  				var h=size.y*zoomVal;

  				ctx.fillRect(x,y,w,h);
        	}
        },
        game:{
            debugMode:false,
            debugEntities:false,
            debugFPS:false,
            drawDebugFPS:function(){
                if(!this.debugMode){
                    return
                }
                if(!this.debugFPS){
                    return
                }
                var ctx = ig.system.context;
                ctx.fillStyle = "rgba(0,255,255,1)";
                ctx.font="50px Arial"
                ctx.fillText(ig.game.fps,0,50);
            },
            drawDebugNumberOfEntities:function(){
                if(!this.debugMode){
                    return
                }
                if(!this.debugEntities){
                    return
                }
                var ctx = ig.system.context;
                ctx.fillStyle = "rgba(0,255,255,1)";
                ctx.font="50px Arial"
                ctx.fillText("#Entities:"+ig.game.entities.length,100,50);
            },
            restartCheck:function(){
                if(!this.debugMode){
                    return
                }
                if(ig.game.io.press('restart')){
                    ig.game.director.reloadLevel();
                    return;
                }
            },
            logCall:function(callback){
                if(!this.debugMode){
                    return
                }
                if(ig.game.io.press('log')){
                    callback();
                    return;
                }
            },
        	test:function(message,entity,lineNumber){
                if(!this.debugMode){
                    return
                }
        		var css = 'background: #FFF; color: rgba(0,0,125,1)';
                console.log("%c"+entity.name+":"+message,css);
        	},
        	log:function(message,entity,lineNumber){
                if(!this.debugMode){
                    return
                }
                var text = "%c"+entity.name+":"+message;
                if(lineNumber){
                    text+=":"+lineNumber
                }
                
        		var css = 'background: #FFF; color: rgba(0,125,0,1)';
        		console.log(text,css);
        	},
        	error:function(message,entity,lineNumber){
                if(!this.debugMode){
                    return
                }
        		var css = 'background: #FFF; color: rgba(125,0,0,1)';
        		console.log("%c"+entity.name+":"+message,css);
                //throw(message);
        	},
        }

    });
});

