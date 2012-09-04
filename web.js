var exec = require('child_process').exec,
	app = require('express')(),
	port = 3000;

function osascript(){
	"use strict";
	// args: command 1, command n, ..., callback
	var command = 'osascript -e \'set var to ""\' -e \'tell application "Spotify"\' ',
		end = "-e 'end tell'",
		l = arguments.length,
		callback = arguments[--l] || function(){},
		i,
		notSet = 0;

	for( i = 0; i < l; i++ ){
		command += "-e '";

		if( arguments[i].indexOf('set') === -1 ){
			command += "set var to var & " + ( notSet === 0 ? '' : '";;;" & ' ) + arguments[i];
			notSet++;
		}
		else {
			command += arguments[i]
		}

		command += "' ";
	}

	command += end + ( notSet === 0 ? '' :  " -e 'return var'" );

	exec(command, function(err, result){
		if( !err ){
			// Removing anoying newline character by splicing
			callback.apply(null, result.split('').splice(0, result.length - 1).join('').split(';;;'));
		}
		else {
			console.log(arguments);
		}
	});
}


// Routing

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

app.get('/play', function(req, res){
	osascript('playpause', 'player state', 'name of current track', 'artist of current track', function(){
		if( arguments[1] === 'playing' ){
			res.send('Now playing ' + arguments[2] + ' by ' + arguments[3] + '.');
		}
		else if( arguments[1] === 'paused' ){
			res.send('You paused in the middle of ' + arguments[2] + ' by ' + arguments[3] + '! :O');
		}
		else {
			res.send('Nothing is playing...');
		}
	});
});

app.get('/play/:uri', function(req, res){
	var uri = req.params.uri;

	// Make VERY sure that the uri doesn't contain anything I don't want it to contain
	if( !uri.match(/[^A-Za-z0-9:]/g) ){
		osascript('play track "' + uri + '"', 'player state', 'name of current track', 'artist of current track', function(){
			if( arguments[1] === 'playing' ){
				res.send('Now playing ' + arguments[2] + ' by ' + arguments[3] + '.');
			}
			else {
				res.send('It didn\'t work, but I have to say that song sucks anyways.');
			}
		});
	}
	else {
		res.send(400, '¿Hablos español?');
	}
});

app.get('/next', function(req, res){
	osascript('next track', 'player state', 'name of current track', 'artist of current track', function(){
		if( arguments[1] === 'playing' ){
			res.send('Now playing ' + arguments[2] + ' by ' + arguments[3] + '.');
		}
		else {
			res.send('Nothing is playing anymore... Guess this is the end of the road.');
		}
	});
});

app.get('/prev', function(req, res){
	osascript('previous track', 'player state', 'name of current track', 'artist of current track', function(){
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
			osascript('player state', function(){
				res.send(arguments[0]);
			});
		break;
		case 'position':
			osascript('player position', function(){
				res.send(arguments[0]);
			});
		break;
		case 'volume':
			osascript('sound volume', function(){
				res.send(arguments[0]);
			});
		break;
		case 'name':
			osascript('name of current track', function(){
				res.send(arguments[0]);
			});
		break;
		case 'artist':
			osascript('artist of current track', function(){
				res.send(arguments[0]);
			});
		break;
		//## I need to figure out how to stream the response from 
		/*case 'artwork':
			osascript('artwork of current track', function(){
				res.send(arguments[1]);
			});
		break;*/
		case 'album':
			osascript('album of current track', function(){
				res.send(arguments[0]);
			});
		break;
		case 'duration':
			osascript('duration of current track', function(){
				res.send(arguments[0]);
			});
		break;
		case 'url':
			osascript('spotify url of current track', function(){
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
				osascript('play', 'player state', 'name of current track', 'artist of current track', function(){
					if( arguments[1] === 'playing' ){
						res.send('Now dancing to ' + arguments[2] + ' by ' + arguments[3] + '.');
					}
					else {
						res.send('Because of technical problems we only offer the following a capella song: "Bä bää vita lamm, har du någon ull? [---]"');
					}
				});
			}
			else if( value === 'pause' ){
				osascript('pause', 'player state', 'name of current track', 'artist of current track', function(){
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
				osascript('set player position to ' + value, 'duration of current track', function(){
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
				osascript('set sound volume to ' + value, function(){
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