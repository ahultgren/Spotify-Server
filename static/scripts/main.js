jQuery(function($){
	var socket = io.connect(':3000/client'),
		playpause = $('.playpause'),
		isPlaying,
		name = $('#name'),
		artists = $('#artists'),
		album = $('#album'),
		position = $('#position'),
		positionValue, time,
		repeat = $('#repeat'),
		shuffle = $('#shuffle'),
		duration = $('#duration'),
		durationValue;

	socket.on('connect', function(data){
		console.log('Successfully connected as client');
	});

	socket.on('change', function(data){
		var i;

		for( i in data ){
			switch( i ){
				case 'state':
					isPlaying = data[i];
					console.log(data[i]);
					playpause.toggleClass('pause', data[i]);
					break;
				case 'track':
					name.html(data[i]);
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
					position.html(time.getMinutes() + ':' + ('0' + time.getSeconds()).slice(-2));
					break;
				case 'repeat':
					repeat.toggleClass('on', data[i]);
					break;
				case 'shuffle':
					shuffle.toggleClass('on', data[i]);
					break;
				case 'duration':
					durationValue = new Date(data[i]);
					duration.html(durationValue.getMinutes() + ':' + ('0' + durationValue.getSeconds()).slice(-2));
					break;
			}
		}
	});

	// Keep approximate time updated
	(function updateTime(){
		if( !isNaN(positionValue) && isPlaying ){
			positionValue += 1000;
			time = new Date(positionValue);
		}

		if( time ){
			position.html(time.getMinutes() + ':' + ('0' + time.getSeconds()).slice(-2));
		}
		setTimeout(updateTime, 1000);
	}());

	// Do actions
	$('.actions a').click(function(e){
		var $this = $(this),
			params = $(this).attr('href').split('/'),
			values;

		e.preventDefault();

		if( params[0] === 'playURI' || params[0] === 'position' || params[0] === 'volume' || params[0] === 'queue' ){
			values = [];

			$this.parent().find('.values').each(function(value){
				values.push($(this).val() || '');
			});

			if( values.join('').length ){
				socket.emit('do', {
					command: params[0],
					values: values
				})
			}
		}
		else if( params[0] === 'set' ){
			values = $(this).parent().find('.values').first().val();

			if( values.length && !isNaN(values) ){
				socket.emit('do', {
					command: params[0],
					values: [params[1], +values]
				});
			}
		}
		else {
			socket.emit('do', {
				command: params[0],
				values: params.splice(1)
			});
		}
	});
});