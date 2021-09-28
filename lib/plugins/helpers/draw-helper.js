/**
 *  Draw Helper
 *  Created by Justin Ng on 2015-03-05.
 *  Copyright (c) 2015 MarketJS. All rights reserved.
 */
ig.module('plugins.helpers.draw-helper')
.requires(
)
.defines(function () {
    ig.DrawHelper = function(){
        

        this.compositeOperations=[
            "source-over",
            "source-atop",
            "source-in",
            "source-out",
            "destination-over",
            "destination-atop",
            "destination-in",
            "destination-out",
            "lighter",
            "copy",
            "xor"
        ];
    };
    ig.DrawHelper.prototype = {
        createBuffers:function(){
            this.BUFFER_KEYS={
                BUFFER_CANVAS:"bufferCanvas",
                BUFFER_CANVAS2:"bufferCanvas2",
                BUFFER_CONTEXT:"bufferContext",
                BUFFER_CONTEXT2:"bufferContext2"
            };
            var contextType = "2d";
            this.bufferCanvas=document.createElement('canvas');
            this.bufferCanvas2=document.createElement('canvas');
            
            this.bufferCanvas.width=150;
            this.bufferCanvas.height=150;
            this.bufferCanvas.id=this.BUFFER_KEYS.BUFFER_CANVAS;

            this.bufferContext=this.bufferCanvas.getContext(
                contextType
            );

            this.bufferCanvas2.width=150;
            this.bufferCanvas2.height=150;
            this.bufferCanvas2.id=this.BUFFER_KEYS.BUFFER_CANVAS2;
    
            this.bufferContext2=this.bufferCanvas2.getContext(
                contextType
            );
        },

        bufferCopyMainContext:function(){
            this.updateBufferCanvasSize(ig.system.canvas.width,ig.system.canvas.height+20);
            this.bufferContext.drawImage(ig.system.canvas,0,0);
        },
        mainContextCopyBuffer:function(){
            ig.system.context.drawImage(this.bufferCanvas,0,0);
        },

        /**
        * ig.drawHelper.appendBufferCanvas(ig.drawHelper.BUFFER_KEYS.BUFFER_CANVAS2);
        */
        appendBufferCanvas:function(key){
            var gameDiv = ig.domHandler.getElementById("#game");
            ig.domHandler.appendChild(gameDiv,this[key]);
        },
        removeBufferCanvas:function(key){
            var gameDiv = ig.domHandler.getElementById("#game");
            ig.domHandler.removeChild(gameDiv,this[key]);
        },

        clearBuffer:function(key,color){
            var ctx=this[key];
            
            if(color){
                ctx.fillStyle = color;
                this.drawRect(ctx,0,0,ig.system.width,ig.system.height);
            }else{
                ctx.clearRect(0,0,ig.system.width,ig.system.height);
            }
        },

        updateBufferCanvasSize:function(width,height){
            if(width && height){
                this.bufferCanvas.width=width;
                this.bufferCanvas2.width=width;
                this.bufferCanvas.height=height;
                this.bufferCanvas2.height=height;
            }else{
                this.bufferCanvas.width=ig.system.canvas.width;
                this.bufferCanvas2.width=ig.system.canvas.width;
                this.bufferCanvas.height=ig.system.canvas.height;
                this.bufferCanvas2.height=ig.system.canvas.height;
            }
        },
        setupGradientColors:function(x1,y1,x2,y2,id,gradients){
            var ctx=ig.system.context;
            var grd = ctx.createLinearGradient(x1,y1,x2,y2);
            for(var i=0;i<gradients.length;i++){
                grd.addColorStop(gradients[i].stop,gradients[i].color);
            }
            this.GRADIENT_COLOR[id]=grd;
        }
        

    };
});

		