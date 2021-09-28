ig.module(
    'game.toybox.utils.random'
)
    .requires(

    )

    .defines(function () {

        ig.random = {
			/**
			 * random a boolean value
			 */
            chance: function (chance) {
                return Math.random() < chance;
            },

			/**
			 * random a boolean value
			 */
            bool: function () {
                return Math.random() < 0.5;
            },

			/**
			 * random an integer value 
			 * @param from
			 * @param to
			 */
            int: function (from, to) {
                return from + Math.floor(((to - from + 1) * Math.random()));
            },

			/**
			 * random a float value
			 * @param from
			 * @param to
			 */
            float: function (from, to) {
                return from + ((to - from) * Math.random());
            },

			/**
			 * random a string
			 * @param length
			 * @param charactersToUse optional parameter, string contained characters to use, default: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
			 */
            string: function (length, charactersToUse) {
                if (charactersToUse === undefined) charactersToUse = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                var str = "";
                for (var i = 0; i < length; i++) {
                    str += charactersToUse.charAt(Random.int(0, charactersToUse.length - 1));
                }
                return str;
            },

			/**
			 * choose an item from an array randomly
			 * @param arr
			 */
            fromArray: function (arr) {
                return (arr != null && arr.length > 0) ? arr[this.int(0, arr.length - 1)] : null;
            },

			/**
			 * shuffle an array
			 * @param arr
			 */
            shuffle: function (arr) {
                if (arr != null) {
                    for (var i = 0; i < arr.length; i++) {
                        var j = this.int(0, arr.length - 1);
                        var a = arr[i];
                        var b = arr[j];
                        arr[i] = b;
                        arr[j] = a;
                    }
                }
                return arr;
            }
        };

    });