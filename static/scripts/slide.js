(function(document, $, undefined){
	function Slide(element, args){
		var that = this;
		args = args || {};

		// Extend prototype with the jQuery object
		$.extend(that, element);

		// Create toggle
		that.toggle = $(document.createElement('div'))
			.addClass('toggle')
			.appendTo(that);

		// Defaults
		that._width = that.width();
		that.max = args.max || 100;
		that.min = args.min || 0;
		that.drop = args.drop || function(){};
		that.move = args.move || function(){};

		// Listen for mouse events
		listener(that);
	}

	Slide.prototype.set = function() {
		if( arguments.length === 1 ){
			return $.extend(this, arguments[0]);
		}
		else {
			this[arguments[0]] = arguments[1];
			return this;
		}
	};

	Slide.prototype.value = function(value) {
		var that = this;

		if( value === undefined ){
			// Getter
			return (that.max - that.min) * that.toggle.position().left/that._width + that.min;
		}
		else {
			// Setter
			that.toggle.css('left', that._width * (value - that.min)/(that.max - that.min));
			return that;
		}
	};

	Slide.prototype.update = function() {
		var that = this,
			value = that.value();

		that._width = that.width();
		that.value(value);
	};

	// Private methods
	function listener(that){
		var initialPosition;

		that.toggle.mousedown(function(e){
			e.preventDefault();
			e.stopPropagation();
			initialPosition = e.pageX - that.toggle.position().left;

			$(document)
				.bind('mousemove', mousemove)
				.bind('mouseup', mouseup);
		});

		that.mousedown(function(e){
			e.preventDefault();
			that.toggle.css('left', e.offsetX);
			that.drop(that.value());
		});

		function mousemove(e){
			e.preventDefault();
			var position = e.pageX - initialPosition;

			position > that._width && (position = that._width);
			position < 0 && (position = 0);

			that.toggle.css('left', position);
			that.move(that.value());
		}

		function mouseup(e){
			e.preventDefault();
			that.drop(that.value());
			$(document)
				.unbind('mousemove', mousemove)
				.unbind('mouseup', mouseup);
		}
	}

	// Make it jQuery
	$.fn.slide = function(args) {
		var that = this;

		// Don't act on absent elements
		if( that.length ){
			var slide = new Slide(that, args);
			return slide;
		}
	};
}(document, jQuery));