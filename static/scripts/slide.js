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

			that.isDragged = false;

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
				if( !that.isDragged ){
					setLeft(width * (value - that.min)/(that.max - that.min));
				}
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
			return this.addClass('disabled');
		};

		Slide.prototype.enable = function() {
			enabled = true;
			return this.removeClass('disabled');
		};

		slide = new Slide(element, args);

		// Private methods
		function listener(that){
			var initialPosition;

			that.toggle.mousedown(function(e){
				e.preventDefault();
				e.stopPropagation();
				initialPosition = e.pageX - (left !== undefined ? left : 0);

				if( enabled ){
					$(document)
						.on('mousemove', mousemove)
						.on('mouseup', mouseup);
				}
			});

			that.mousedown(function(e){
				if( e.which === 1 ){
					e.preventDefault();
					if( enabled ){
						setLeft(e.offsetX);
						that.drop(that.value());
					}
				}
			});

			that.on('touchmove', function(e){
				touchmove(e);
			});

			$('body').on('touchend touchcancel', function(e){
				if( that.isDragged ){
					e.preventDefault();
					that.isDragged = false;
					that.drop(that.value());
				}
			});

			function mousemove(e){
				var position = e.pageX - initialPosition;
				e.preventDefault();
				that.isDragged = true;

				setLeft(position);
				that.move(that.value());
			}

			function mouseup(e){
				e.preventDefault();
				that.drop(that.value());
				that.isDragged = false;

				$(document)
					.unbind('mousemove', mousemove)
					.unbind('mouseup', mouseup);
			}

			function touchmove(e){
				e.preventDefault();
				that.isDragged = true;
				setLeft(e.originalEvent.pageX - that.offset().left);
			}
		}

		function setLeft(position){
			var that = slide;

			position > width && (position = width);
			position < 0 && (position = 0);
			
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