var exec = require('child_process').exec,
	child,
	app = require('express')(),
	port = 3000,
	prefix = 'tell application "Spotify" to ';

function osascript(command, callback){
	"use strict";

	callback = callback || function(){};

	exec("osascript -e '" + prefix + command + "'", callback);
}

function getNameAndArtist(callback){
	osascript('name of current track', function(){
		var song = arguments[1];
		osascript('artist of current track', function(){
			var artist = arguments[1];
			callback('Now playing ' + song + ' by ' + artist + '.');
		});
	});
}

function sendNameAndArtist(res, error){
	isPlaying(function(isPlaying){
		if( isPlaying ){
			getNameAndArtist(function(nameAndArtist){
				res.send(nameAndArtist);
			});
		}
		else {
			res.send(error || 'Not playing.');
		}
	});
}

function isPlaying(callback){
	osascript('player state', function(){
		callback(arguments[1] === 'playing\n');
	});
}

// Routing
app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

app.get('/play', function(req, res){
	osascript('playpause', function(){
		sendNameAndArtist(res, 'Paused');
	});
});

app.get('/next', function(req, res){
	osascript('next track', function(){
		sendNameAndArtist(res, 'No song is playing.');
	});
});

app.get('/prev', function(req, res){
	osascript('previous track', function(){
		sendNameAndArtist(res, 'No song is playing.');
	});
});

app.get('/get/:property', function(req, res){
	var property = req.params.property;

	switch( property ){
		case 'state':
			osascript('player state', function(){
				res.send(arguments[1]);
			});
		break;
		case 'position':
			osascript('player position', function(){
				res.send(arguments[1]);
			});
		break;
		case 'volume':
			osascript('sound volume', function(){
				res.send(arguments[1]);
			});
		break;
		case 'name':
			osascript('name of current track', function(){
				res.send(arguments[1]);
			});
		break;
		case 'artist':
			osascript('artist of current track', function(){
				res.send(arguments[1]);
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
				res.send(arguments[1]);
			});
		break;
		case 'duration':
			osascript('duration of current track', function(){
				res.send(arguments[1]);
			});
		break;
		case 'url':
			osascript('spotify url of current track', function(){
				res.send(arguments[1]);
			});
		break;
		default:
			res.send(404, 'Unknown property');
		break;
	}
});

app.get('/set/:property/:value', function(req, res){
	var property = req.params.property,
		value = req.params.value;

	switch( property ){
		case 'state':
			if( value === 'play' ){
				osascript('play', function(){
					sendNameAndArtist();
				});	
			}
			else if( value === 'pause' ){
				osascript('pause', function(){
					res.send('Paused');
				});	
			}
			else {
				res.send(400, 'Unsupported state');
			}
		break;
		case 'position':
			if( !isNaN(value) ){
				osascript('set player position to ' + value, function(){
					//## When caching is implemented improvement can be done here by checking if the position exists
					res.send('Player position set to ' + value);
				});
			}
			else {
				res.send(400, 'Invalid timestamp');
			}
		break;
		case 'volume':
			if( !isNaN(value) && value >= 0 && value <= 100 ){
				osascript('set sound volume to ' + value, function(){
					res.send('Volume set to ' + value);
				});
			}
			else {
				res.send(400, 'Invalid volume value');
			}
		break;
		default:
			res.send(404, 'Unknown property');
		break;
	}
});

app.listen(port);
console.log('Listening on port ' + port);