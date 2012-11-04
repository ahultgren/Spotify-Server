(function(document, $, undefined){
	function Slide(element, args){
		// Private vars
		var slide, enabled, width, left;

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
			width = that.width();
			enabled = args.enabled !== undefined ? args.enabled : true;

			that.max = args.max || 100;
			that.min = args.min || 0;
			that.drop = args.drop || function(){};
			that.move = args.move || function(){};

			// Listen for mouse events
			listener(that);
		}

		Slide.prototype.set = function() {
			var that = this;

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
				return (that.max - that.min) * left/width + that.min;
			}
			else {
				// Setter
				setLeft(width * (value - that.min)/(that.max - that.min));
				return that;
			}
		};

		Slide.prototype.update = function() {
			var that = this,
				value = that.value();

			width = that.width();
			that.value(value);
			return that;
		};

		Slide.prototype.disable = function() {
			enabled = false;
			return this;
		};

		Slide.prototype.enable = function() {
			enabled = true;
			return this;
		};

		slide = new Slide(element, args);

		// Private methods
		function listener(that){
			var initialPosition;

			that.toggle.mousedown(function(e){
				e.preventDefault();
				e.stopPropagation();
				initialPosition = e.pageX - left;

				if( enabled ){
					$(document)
						.bind('mousemove', mousemove)
						.bind('mouseup', mouseup);
				}
			});

			that.mousedown(function(e){
				e.preventDefault();
				if( enabled ){
					setLeft(e.offsetX);
					that.drop(that.value());
				}
			});

			function mousemove(e){
				e.preventDefault();
				var position = e.pageX - initialPosition;

				position > width && (position = width);
				position < 0 && (position = 0);

				setLeft(position);
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

		function setLeft(position){
			var that = slide;
			
			left = position;
			that.toggle.css('left', position);
		}

		return slide;
	}

	// Make it jQuery
	$.fn.slide = function(args) {
		var that = this;

		// Don't act on absent elements
		if( that.length ){
			var slide = Slide(that, args);
			return slide;
		}
	};
}(document, jQuery));