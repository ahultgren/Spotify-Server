function Player(args){
	// Private vars
	var player, playpause, next, prev, isPlaying, name, artists, album, position, positionCounter, positionValue, time, repeat, shuffle, duration, durationValue, volume;

	// Constructor
	function Player(args){
		var that = this;

		that.server = args.main.server;

		$(function(){
			// Set up DOM references and stuff
			initialize();

			// Show new data from server
			that.server.on('change', newData);

			// Clear player if Spotify disappears
			that.server.on('spotifyDisconnected', clear);

			// Keep approximate time updated
			updateTime();
		});
	}

	player = new Player(args);

	// Private methods

	function initialize(){
		var that = player;

		playpause = $('.playpause').fastClick(action);
		next = $('.next').fastClick(action);
		prev = $('.prev').fastClick(action);
		name = $('#name');
		artists = $('#artists');
		album = $('#album');
		position = $('.position .slide').slide({
			drop: function(value){
				that.server.do('set', ['position', Math.round(value/1000)]);
			}
		});
		positionCounter = $('#position');
		repeat = $('#repeat').fastClick(action);
		shuffle = $('#shuffle').fastClick(action);
		duration = $('#duration');
		volume = $('.volume .slide').slide({
			min: 0,
			max: 100,
			drop: function(value){
				that.server.do('set', ['volume', Math.round(value)]);
			}
		}).disable();

		// Update sliders when window is resized, since they're adaptive
		$(window).resize(function(){
			volume.update();
			position.update();
		});

		// If unauthorized, disable position slider
		if( unauthed ){
			position.disable();
		}
	}

	function newData(data){
		var i;

		for( i in data ){
			switch( i ){
				case 'state':
					isPlaying = data[i];
					playpause.toggleClass('pause', data[i]);
					break;
				case 'track':
					//## Assuming the uri is always sent when track is
					name.html('<a href="' + data['uri'] + '">' + data[i] + '</a>');
					break;
				case 'artists':
					if( data[i].length < 3 ){
						artists.html(data[i].join(' and '));
					}
					else {
						artists.html(data[i].splice(0, data[i].length - 1).join(', ') + ' and ' + data[i][data[i].length - 1]);
					}
					break;
				case 'album':
					album.html(data[i]);
					break;
				case 'position':
					positionValue = data[i];
					time = new Date(positionValue);
					position.value(data[i]);
					positionCounter.html(time.getMinutes() + ':' + ('0' + time.getSeconds()).slice(-2));
					break;
				case 'repeat':
					repeat.toggleClass('on', data[i]);
					break;
				case 'shuffle':
					shuffle.toggleClass('on', data[i]);
					break;
				case 'duration':
					durationValue = new Date(data[i]);
					position.set({
						max: data[i]
					});
					duration.html(durationValue.getMinutes() + ':' + ('0' + durationValue.getSeconds()).slice(-2));
					break;
				case 'volume':
					volume.value(data[i]);
					break;
			}
		}
	}

	function clear(){
		name.html('');
		artists.html('');
		album.html('');
		positionCounter.html('');
		duration.html('');

		positionValue = undefined;
		time = undefined;
		isPlaying = false;

		position.value(0);
		volume.value(0);
	}

	function updateTime(){
		if( !isNaN(positionValue) && isPlaying ){
			positionValue += 1000;
			time = new Date(positionValue);
		}

		if( time && !position.isDragged ){
			position.value(positionValue);
			positionCounter.html(time.getMinutes() + ':' + ('0' + time.getSeconds()).slice(-2));
		}
		setTimeout(updateTime, 1000);
	}

	function action(e){
		var that = player,
			params = $(this).attr('href').split('/');

		e.preventDefault();

		if( params[0] === 'set' ){
			if( params[1] === 'repeat' ){
				that.server.do('set', ['repeat', !repeat.is('.on')]);
			}
			else if( params[1] === 'shuffle' ){
				that.server.do('set', ['shuffle', !shuffle.is('.on')]);
			}
		}
		else {
			that.server.do(params[0], params.splice(1));
		}
	}

	return player;
}