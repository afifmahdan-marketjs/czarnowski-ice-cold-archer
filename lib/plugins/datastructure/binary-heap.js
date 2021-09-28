/**
 *  Binary heap implementation
 *
 *  Created by Justin Ng on 2014-09-23.
 *  Copyright (c) 2014 __MyCompanyName__. All rights reserved.
 */

ig.module('plugins.datastructure.binary-heap')
.requires(
)
.defines(function () {

    BinaryHeap = ig.Class.extend({
		content:[],
		getValue:null,
		minHeap:true,
		tagName:"BinaryHeap",
		init:function(getValueFunction,maxHeap)
		{
			this.getValue = getValueFunction;
			if(maxHeap)
			{
				this.minHeap=false;
			}
		},
		
		push: function(element) 
		{
	        // Add the new element to the end of the array.
	        this.content.push(element);

	        // Allow it to sink down.
	        this.sinkDown(this.content.length - 1);
	    },
	
	    pop: function() 
		{
	        // Store the first element so we can return it later.
	        var result = this.content[0];
	        // Get the element at the end of the array.
	        var end = this.content.pop();
	        // If there are any elements left, put the end element at the
	        // start, and let it bubble up.
	        if (this.content.length > 0) 
			{
	            this.content[0] = end;
	            this.bubbleUp(0);
	        }
	        return result;
	    },
	
	    remove: function(node) 
		{
	        var i = this.content.indexOf(node);
	        // When it is found, the process seen in 'pop' is repeated
	        // to fill up the hole.
	        var end = this.content.pop();

	        if (i !== this.content.length - 1) 
			{
	            this.content[i] = end;
				
				if(this.minHeap)
				{
		            if (this.getValue(end) < this.getValue(node)) 
					{
		                this.sinkDown(i);
		            }
		            else 
					{
		                this.bubbleUp(i);
		            }
				}
				else
				{
		            if (this.getValue(end) > this.getValue(node)) 
					{
		                this.sinkDown(i);
		            }
		            else 
					{
		                this.bubbleUp(i);
		            }
				}
	        }
	    },
	
	    size: function() 
		{
	        return this.content.length;
	    },
	    
		rescoreElement: function(node) 
		{
	        this.sinkDown(this.content.indexOf(node));
	    },
		
	    sinkDown: function(n) 
		{
	        // Fetch the element that has to be sunk.
	        var element = this.content[n];

	        // When at 0, an element can not sink any further.
	        while (n > 0) {

	            // Compute the parent element's index, and fetch it.
	            var parentN = ((n + 1) >> 1) - 1,
	                parent = this.content[parentN];
	            // Swap the elements if the parent is greater.
					
				if(this.minHeap)
				{
		            if (this.getValue(element) < this.getValue(parent)) 
					{
		                this.content[parentN] = element;
		                this.content[n] = parent;
		                // Update 'n' to continue at the new position.
		                n = parentN;
		            }
		            // Found a parent that is less, no need to sink any further.
		            else {
		                break;
		            }	
				}
				else
				{
		            if (this.getValue(element) > this.getValue(parent)) 
					{
		                this.content[parentN] = element;
		                this.content[n] = parent;
		                // Update 'n' to continue at the new position.
		                n = parentN;
		            }	
		            // Found a parent that is less, no need to sink any further.
		            else {
		                break;
		            }	
				}	
					
	            
	            
	        }
	    },
	
	    bubbleUp: function(n) 
		{
	        // Look up the target element and its score.
	        var length = this.content.length,
	            element = this.content[n],
	            elemScore = this.getValue(element);

	        while(true) 
			{
	            // Compute the indices of the child elements.
	            var child2N = (n + 1) << 1,
	                child1N = child2N - 1;
	            // This is used to store the new position of the element, if any.
	            var swap = null,
	                child1Score;
	            // If the first child exists (is inside the array)...
	            if (child1N < length) 
				{
	                // Look it up and compute its score.
	                var child1 = this.content[child1N];
	                child1Score = this.getValue(child1);
					
					if(this.minHeap)
					{
			            // If the score is less than our element's, we need to swap.
			            if (child1Score < elemScore)
						{
			                swap = child1N;
			            }
					}
					else
					{
			            if (child1Score > elemScore)
						{
			                swap = child1N;
			            }
					}
	            }

	            // Do the same checks for the other child.
	            if (child2N < length) 
				{
	                var child2 = this.content[child2N],
	                    child2Score = this.getValue(child2);
						
					if(this.minHeap)
					{
				        if (child2Score < (swap === null ? elemScore : child1Score)) 
						{
				            swap = child2N;
				        }
					}	
					else
					{
				        if (child2Score > (swap === null ? elemScore : child1Score)) 
						{
				            swap = child2N;
				        }
					}
	            }

	            // If the element needs to be moved, swap it, and continue.
	            if (swap !== null) 
				{
	                this.content[n] = this.content[swap];
	                this.content[swap] = element;
	                n = swap;
	            }
	            // Otherwise, we are done.
	            else 
				{
	                break;
	            }
	        }
	    },
		empty:function()
		{
			while(this.content.length>0)
			{
				this.content.pop();
			}
		}
    
    });

});