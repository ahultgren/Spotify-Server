function Search(args){
	var search, store, timer;

	function Search(args){
		var that = this;

		that.main = args.main;
		that.input = args.input;
		that.list = $(document.createElement('ul'))
			.addClass('result-list')
			.hide()
			.insertAfter(that.input);

		store = spotifyWebApi();

		that.input.on('input', function(){
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
		});

		that.input.on('keydown', function(e){
			e.stopPropagation();
		})
	}

	Search.prototype.renderList = function(data) {
		var that = this,
			result = '',
			i, l;

		if( data && data.tracks ){
			result += '<li class="caption">Tracks:</li>';

			for( i = 0, l = data.tracks.length; i < l; i++ ){
				result += '<li>' + data.tracks[i].name + '</li>'
			}
		}

		that.list.html(result).show();
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