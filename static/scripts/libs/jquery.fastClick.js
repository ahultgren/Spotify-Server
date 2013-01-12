(function($) {
	var clickEvent = (!!('ontouchstart' in window) || !!('onmsgesturechange' in window)) && touch || click;

	$.fn.fastClick = function (callback) {
		return this.each(function () {
			clickEvent.call(this, callback);
		});
	};

	function click (callback) {
		var that = $(this);

		that.on('click', function(e){
			callback.call(that, e);
		});
	}

	function touch (callback) {
		var that = $(this),
			startx, starty, endx, endy;
		
		startx = starty = endx = endy = 0;

		that.on('touchstart', function(e){
			var touches = e.originalEvent.touches;

			if( touches.length === 1 ){
				startx = endx = touches[0].pageX;
				starty = endy = touches[0].pageY;
			}
		})
		.on('touchmove', function(e){
			var touches = e.originalEvent.touches;

			endx = touches[0].pageX;
			endy = touches[0].pageY;
		})
		.on('touchend', function(e){
			var diffx = Math.abs(endx - startx),
				diffy = Math.abs(endy - starty);

			if( startx && starty && diffx < 10 && diffy < 10 ){
				callback.call(this, e);
			}

			startx = starty = endx = endy = 0;
		})
		.on('click', function(e){
			e.preventDefault();
		});
	}
}(jQuery));