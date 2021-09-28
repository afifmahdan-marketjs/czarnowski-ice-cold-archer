/**
 *  Vector
 *  Created by Justin Ng on 2015-03-05.
 *  Copyright (c) 2015 MarketJS. All rights reserved.
 */
ig.module('plugins.data.vector')
.requires(
)
.defines(function () {
    Vector2 = ig.Class.extend({
		x:null,
		y:null,
		valType:"number",

		init: function (x,y){
			if(typeof(x) === this.valType
				&& typeof(y) === this.valType)
			{
				this.x=x;
				this.y=y;
			}
        },

		row:function(y){
			if(typeof(y)===this.valType)
			{
				this.y = y;
			}
			return this.y;
		},

		col:function(x){
			if(typeof(x)===this.valType)
			{
				this.x=x;
			}
			return this.x;
		},

        magnitude: function(){
            return Math.sqrt(this.x * this.x + this.y * this.y);
        },

        unitVector: function(){
            var mag = this.magnitude();
            //Magnitude should not be negative ever since its the product of the squares of x and y, square root.
            //If Magnitude is 0 then we have a divide by 0 error.
            if(mag > 0){
                return new Vector2(this.x/mag, this.y/mag);
            }
            else
            {
                throw ("Divide by 0 error in unitVector function of vector:"+this);
                return new Vector2(0, 0);
            }
        },

        add: function(vector){
            return new Vector2(this.x+vector.x, this.y+vector.y);
        },

        subtract: function(vector){
            return new Vector2(this.x-vector.x, this.y-vector.y);
        },

        dotProduct: function(vector){
            return (this.x*vector.x + this.y*vector.y);
        },

        multiplyByScalar: function(scalar){
            return new Vector2(scalar * this.x, scalar*this.y);
        }
    });
});
