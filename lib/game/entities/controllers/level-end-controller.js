ig.module('game.entities.controllers.level-end-controller')
.requires(
    'impact.entity'
)
.defines(function() {
    EntityLevelEndController = ig.Entity.extend({
        
        size:{x:40,y:40},
        pos:{x:1,y:1},
        name:"LevelEndController",
        endText:"Thank you for playing",
        fontSetting:"Arial 20px",
        endColor:"rgba(255,255,255,1)",
        init:function(x,y,settings)
        {
            this.parent(x,y,settings);
            
            var temp = (ig.game.score);
            
            if(ig.game.scorelist === null)
            {
                ig.game.scorelist = new BinaryHeap(function(score){return score.val},true);
                ig.game.scorelist.push({val:temp});
            }
            else
            {
                if(ig.game.scorelist.size()<3)
                {
                    ig.game.scorelist.push({val:temp});
                }
                else
                {
                    ig.game.scorelist.content.pop();
                    ig.game.scorelist.push({val:temp});
                }
            }
            
            if(ig.global.wm)
            {
                return;
            }
        },
        
        update:function()
        {
            this.parent();
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
            this.drawEnd(ig.system.context);
        },
        
        drawEnd:function(ctx)
        {
            var previousFont = ctx.font+"";
            ctx.font=this.fontSetting;
            ctx.fillStyle=this.endColor;
            ctx.textAlign="center";
            var width = ig.system.width>>>1,height=ig.system.height>>>1;
            
            ctx.fillText("High Score Board",width,height-(height>>>1)-20);
            for(var i=0;i<ig.game.scorelist.size();i++)
            {
                
                ctx.fillText(ig.game.scorelist.content[i].val,width,height-(height>>>1)+(20*i));
            }
            
            ctx.fillText(this.endText,width,height);
            ctx.fillText(ig.game.score,width,height+20);
            
            
            
            
            ctx.textAlign="start";
            ctx.font=previousFont;
        },
        
    });
});