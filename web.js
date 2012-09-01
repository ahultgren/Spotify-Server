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
		isPlaying(function(isPlaying){
			if( isPlaying ){
				getNameAndArtist(function(nameAndArtist){
					res.send(nameAndArtist);
				});
			}
			else {
				res.send('Paused');
			}
		});
	});
});

app.get('/next', function(req, res){
	osascript('next track', function(){
		isPlaying(function(isPlaying){
			if( isPlaying ){
				getNameAndArtist(function(nameAndArtist){
					res.send(nameAndArtist);
				});
			}
			else {
				res.send('No song is playing.');
			}
		});
	});
});

app.listen(port);
console.log('Listening on port ' + port);