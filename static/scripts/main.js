jQuery(function($){
	var socket = io.connect(':3000/client'),
		playpause = $('.playpause'),
		isPlaying,
		name = $('#name'),
		artists = $('#artists'),
		album = $('#album'),
		position = $('.position .slide').slide({
			drop: function(value){
				socket.emit('do', {
					command: 'set',
					values: ['position', Math.round(value/1000)]
				});
			}
		}),
		positionCounter = $('#position'),
		positionValue, time,
		repeat = $('#repeat'),
		shuffle = $('#shuffle'),
		duration = $('#duration'),
		durationValue,
		volume = $('.volume .slide').slide({
			min: 0,
			max: 100,
			drop: function(value){
				socket.emit('do', {
					command: 'set',
					values: ['volume', Math.round(value)]
				});
			}
		}).disable();

	socket.on('connect', function(data){
		console.log('Successfully connected as client');
	});

	socket.on('change', function(data){
		var i;

		for( i in data ){
			switch( i ){
				case 'state':
					isPlaying = data[i];
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
	});

	// Keep approximate time updated
	(function updateTime(){
		if( !isNaN(positionValue) && isPlaying ){
			positionValue += 1000;
			time = new Date(positionValue);
		}

		if( time && !position.isDragged ){
			position.value(positionValue);
			positionCounter.html(time.getMinutes() + ':' + ('0' + time.getSeconds()).slice(-2));
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
				});
			}
		}
		else if( params[0] === 'set' ){
			if( params[1] === 'repeat' ){
				socket.emit('do', {
					command: 'set',
					values: ['repeat', !repeat.is('.on')]
				});
			}
			else if( params[1] === 'shuffle' ){
				socket.emit('do', {
					command: 'set',
					values: ['shuffle', !shuffle.is('.on')]
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

	// Enable support for keyboard commands
	$(window).keydown(function(e){
		switch( e.which ){
			case 32:
				e.preventDefault();
				socket.emit('do', {
					command: 'playpause'
				});
				break;
			case 37:
				e.preventDefault();
				socket.emit('do', {
					command: 'prev'
				});
				break;
			case 39:
				e.preventDefault();
				socket.emit('do', {
					command: 'next'
				});
				break;
			case 38:
				e.preventDefault();
				socket.emit('do', {
					command: 'set',
					values: ['volume', volume.value()+10]
				});
				break;
			case 40:
				e.preventDefault();
				socket.emit('do', {
					command: 'set',
					values: ['volume', volume.value()-10]
				});
				break;
		}
	});

	// Update sliders when window is resized, since they're adaptive
	$(window).resize(function(){
		volume.update();
		position.update();
	});
});