function Search(args){
	var search, store, timer, focused;

	function Search(args){
		var that = this;

		that.main = args.main;

		// Set up elements and events
		that.input = args.input
			.on('input', function(){
				var val = $(this).val();

				if( timer ){
					clearInterval(timer);
					timer = undefined;
				}

				if( val.length >= 4 ){
					timer = setTimeout(function(){
						timer = undefined;
						store.find(val).then(function(data){
							that.renderList(data);
						});
					}, 250);
				}
				else if( !val.length ){
					that.renderList();
				}
			})
			.on('focus', function(){
				focused = true;

				if( that.list.html().length ){
					that.show();
				}
			})
			.on('blur', function(){
				focused = false;
				setTimeout(function(){
					if( !focused ){
						that.list.hide();
					}
				}, 250);
			})
			.on('keydown', function(e){
				e.stopPropagation();
			});

		that.list = $(document.createElement('ul'))
			.addClass('result-list')
			.hide()
			.css('position', 'absolute')
			.insertAfter(that.input)
			.on('click', '.queue', function(e){
				e.preventDefault();
				that.main.server.do('queue', [$(this).attr('href')]);
				that.input.focus();
			})
			.on('click', '.play', function(e){
				e.preventDefault();
				that.main.server.do('playURI', [$(this).attr('href')]);
				that.input.focus();
			});

		store = spotifyWebApi();
	}

	Search.prototype.renderList = function(data) {
		var that = this,
			result = '',
			i, l;

		if( data && data.tracks ){
			for( i = 0, l = data.tracks.length; i < l; i++ ){
				result += '<li>'
					+ '<span class="name">' + data.tracks[i].name + '</span>'
					+ '<span class="artist">' + data.tracks[i].artists[0].name + '</span>'
					+ '<a class="queue" href="' + data.tracks[i].href + '">Queue</a>'
					+ ( !unauthed ? '<a class="play" href="' + data.tracks[i].href + '">Play</a></li>' : '' )
			}

			that.list.html(result);
			that.show();
		}
		else {
			that.list.empty()
			that.hide();
		}
	};

	Search.prototype.show = function() {
		var that = this,
			inputPosition;

		if( focused && that.list.is(':hidden') ){
			inputPosition = that.input.position();

			that.list.css({
				top: inputPosition.top + that.input.outerHeight,
				left: inputPosition.left
			}).width(that.input.width());

			that.list.show();
		}
	};

	Search.prototype.hide = function() {
		this.list.hide();
	};

	function spotifyWebApi(){
		function spotifyWebApi(){}

		spotifyWebApi.prototype.find = function(query) {
			var promise = $.Deferred();

			$.ajax({
				url: 'http://ws.spotify.com/search/1/track.json',
				data: {
					q: query
				},
				cache: true,
				dataType: 'json',
				success: promise.resolve,
				error: promise.reject
			});

			return promise.promise();
		};

		return new spotifyWebApi();
	}

	search = new Search(args);

	return search;
}