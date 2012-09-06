var app = require('express')(),
	port = 3000,
	spotify = require('./spotify_interface')();


// Routing

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

app.get('/play', function(req, res){
	spotify.play(function(status, message){
		res.send(status, message);
	});
});

app.get('/play/:uri', function(req, res){
	spotify.playUri(req.params.uri, function(status, message){
		res.send(status, message);
	});
});

app.get('/next', function(req, res){
	spotify.ask('next track', 'player state', 'name of current track', 'artist of current track', function(){
		if( arguments[1] === 'playing' ){
			res.send('Now playing ' + arguments[2] + ' by ' + arguments[3] + '.');
		}
		else {
			res.send('Nothing is playing anymore... Guess this is the end of the road.');
		}
	});
});

app.get('/prev', function(req, res){
	spotify.ask('previous track', 'player state', 'name of current track', 'artist of current track', function(){
		if( arguments[1] === 'playing' ){
			res.send('Now playing ' + arguments[2] + ' by ' + arguments[3] + '.');
		}
		else {
			res.send('Whoaa! You backed so fast nothing is playing anymore... :(');
		}
	});
});

app.get('/get/:property', function(req, res){
	var property = req.params.property;

	switch( property ){
		case 'state':
			spotify.ask('player state', function(){
				res.send(arguments[0]);
			});
		break;
		case 'position':
			spotify.ask('player position', function(){
				res.send(arguments[0]);
			});
		break;
		case 'volume':
			spotify.ask('sound volume', function(){
				res.send(arguments[0]);
			});
		break;
		case 'name':
			spotify.ask('name of current track', function(){
				res.send(arguments[0]);
			});
		break;
		case 'artist':
			spotify.ask('artist of current track', function(){
				res.send(arguments[0]);
			});
		break;
		//## I need to figure out how to stream the response from 
		/*case 'artwork':
			spotify.ask('artwork of current track', function(){
				res.send(arguments[1]);
			});
		break;*/
		case 'album':
			spotify.ask('album of current track', function(){
				res.send(arguments[0]);
			});
		break;
		case 'duration':
			spotify.ask('duration of current track', function(){
				res.send(arguments[0]);
			});
		break;
		case 'url':
			spotify.ask('spotify url of current track', function(){
				res.send(arguments[0]);
			});
		break;
		default:
			res.send(404, 'Que?');
		break;
	}
});

app.get('/set/:property/:value', function(req, res){
	var property = req.params.property,
		value = req.params.value;

	switch( property ){
		case 'state':
			if( value === 'play' ){
				spotify.ask('play', 'player state', 'name of current track', 'artist of current track', function(){
					if( arguments[1] === 'playing' ){
						res.send('Now dancing to ' + arguments[2] + ' by ' + arguments[3] + '.');
					}
					else {
						res.send('Because of technical problems we only offer the following a capella song: "Bä bää vita lamm, har du någon ull? [---]"');
					}
				});
			}
			else if( value === 'pause' ){
				spotify.ask('pause', 'player state', 'name of current track', 'artist of current track', function(){
					if( arguments[1] === 'paused' ){
						res.send('You paused in the middle of ' + arguments[2] + ' by ' + arguments[3] + '! :O');
					}
					else {
						res.send('Hey, I\'m not playing!');
					}
				});
			}
			else {
				res.send(400, 'I can\'t do that!');
			}
		break;
		case 'position':
			if( !isNaN(value) && value >= 0 ){
				spotify.ask('set player position to ' + value, 'duration of current track', function(){
					if( value < arguments[1] ){
						res.send('Yeah! I\'ve always loved the part at ' + value + ' seconds!');
					}
					else {
						res.send('I know this song is way too long, but not that long!');
					}
				});
			}
			else {
				res.send(400, 'That\'s not a knife... THIS is a knife.');
			}
		break;
		case 'volume':
			if( !isNaN(value) && value >= 0 && value <= 100 ){
				spotify.ask('set sound volume to ' + value, function(){
					res.send('Volume set to ' + value);
				});
			}
			else if( value > 100 ){
				res.send('The numbers all go to eleven. Look, right across the board, eleven, eleven, eleven... Not ' + value + '!');
			}
			else if( value < 0 ){
				res.send('So you like it quiet, eh?');
			}
			else {
				res.send(400, 'Invalid volume value');
			}
		break;
		default:
			res.send(404, 'No hablo americano');
		break;
	}
});

app.listen(port);
console.log('Listening on port ' + port);