/**
 *  Circle
 *
 *  Created by Justin Ng on 2015-03-05.
 *  Copyright (c) 2015 __MyCompanyName__. All rights reserved.
 */
ig.module('plugins.data.circle')
.requires(
)
.defines(function () {
    Circle = ig.Class.extend({
		center:new BABYLON.Vector2(0,0),
		radius:0,
		diameter:0,
		init: function (center,radius)
		{
			if(!isNaN(center))
			{
				this.center=center;
			}
			this.radius=radius;
			this.diameter= 2*this.radius;
        },
    });
});