var exec = require('child_process').exec;

module.exports = function(){
	return new Spotify();	
};

function Spotify(){
	//## When supported it would be possible to figure out if osascipt or another interface can be used

	// Set correct reference
	this.language = 'osascript';
	this.interface = this._osascript;
}

/* Public methods */

Spotify.prototype.ask = function() {
	this.interface.apply(null, arguments);
};

Spotify.prototype.play = function(callback) {
	callback = callback || function(){};

	this.ask('playpause', 'player state', 'name of current track', 'artist of current track', function(){
		if( arguments[1] === 'playing' ){
			callback(200, 'Now playing ' + arguments[2] + ' by ' + arguments[3] + '.');
		}
		else if( arguments[1] === 'paused' ){
			callback(200, 'You paused in the middle of ' + arguments[2] + ' by ' + arguments[3] + '! :O');
		}
		else {
			callback(200, 'Nothing is playing...');
		}
	});
};

Spotify.prototype.playUri = function(uri, callback) {
	callback = callback || function(){};

	// Make VERY sure that the uri doesn't contain anything I don't want it to contain
	if( !uri.match(/[^A-Za-z0-9:]/g) ){
		this.ask('play track "' + uri + '"', 'player state', 'name of current track', 'artist of current track', function(){
			if( arguments[1] === 'playing' ){
				callback(200, 'Now playing ' + arguments[2] + ' by ' + arguments[3] + '.');
			}
			else {
				console.log(arguments[1]);
				callback(200, 'It seems that URI didn\'t work, but I have to say that song sucks anyways.');
			}
		});
	}
	else {
		callback(400, '¿Hablos español?');
	}
};

Spotify.prototype.next = function(callback) {
	callback = callback || function(){};

	this.ask('next track', 'player state', 'name of current track', 'artist of current track', function(){
		if( arguments[1] === 'playing' ){
			callback(200, 'Now playing ' + arguments[2] + ' by ' + arguments[3] + '!');
		}
		else {
			callback(200, 'Nothing is playing anymore... Guess this is the end of the road.');
		}
	});
};

Spotify.prototype.prev = function(callback) {
	callback = callback || function(){};

	this.ask('previous track', 'player state', 'name of current track', 'artist of current track', function(){
		if( arguments[1] === 'playing' ){
			callback(200, 'Now playing ' + arguments[2] + ' by ' + arguments[3] + '.');
		}
		else {
			callback(200, 'Whoaa! You backed up so fast nothing is playing anymore... :(');
		}
	});
};

Spotify.prototype.get = function(property, callback) {
	callback = callback || function(){};

	switch( property ){
		case 'state':
			this.ask('player state', function(){
				callback(200, arguments[0]);
			});
		break;
		case 'position':
			this.ask('player position', function(){
				callback(200, arguments[0]);
			});
		break;
		case 'volume':
			this.ask('sound volume', function(){
				callback(200, arguments[0]);
			});
		break;
		case 'name':
			this.ask('name of current track', function(){
				callback(200, arguments[0]);
			});
		break;
		case 'artist':
			this.ask('artist of current track', function(){
				callback(200, arguments[0]);
			});
		break;
		//## I need to figure out how to stream the response from an osascript or get it from the spotify api
		/*case 'artwork':
			this.ask('artwork of current track', function(){
				callback(200, arguments[1]);
			});
		break;*/
		case 'album':
			this.ask('album of current track', function(){
				callback(200, arguments[0]);
			});
		break;
		case 'duration':
			this.ask('duration of current track', function(){
				callback(200, arguments[0]);
			});
		break;
		case 'url':
			this.ask('spotify url of current track', function(){
				callback(200, arguments[0]);
			});
		break;
		default:
			callback(404, 'Que?');
		break;
	}
};

Spotify.prototype.set = function(property, value, callback) {
	callback = callback || function(){};

	switch( property ){
		case 'state':
			if( value === 'play' ){
				this.ask('play', 'player state', 'name of current track', 'artist of current track', function(){
					if( arguments[1] === 'playing' ){
						callback(200, 'Now dancing to ' + arguments[2] + ' by ' + arguments[3] + '.');
					}
					else {
						callback(200, 'Because of technical problems we only offer the following a capella song: "Bä bää vita lamm, har du någon ull? [---]"');
					}
				});
			}
			else if( value === 'pause' ){
				this.ask('pause', 'player state', 'name of current track', 'artist of current track', function(){
					if( arguments[1] === 'paused' ){
						callback(200, 'You paused in the middle of ' + arguments[2] + ' by ' + arguments[3] + '! :O');
					}
					else {
						callback(200, 'Hey, I\'m not playing!');
					}
				});
			}
			else {
				callback(400, 'I can\'t do that!');
			}
		break;
		case 'position':
			if( !isNaN(value) && value >= 0 ){
				this.ask('set player position to ' + value, 'duration of current track', function(){
					if( value < arguments[0] ){
						callback(200, 'Yeah! I\'ve always loved the part at ' + value + ' seconds!');
					}
					else {
						callback(200, 'I know this song is way too long, but not that long!');
					}
				});
			}
			else {
				callback(400, 'That\'s not a knife... THIS is a knife.');
			}
		break;
		case 'volume':
			if( !isNaN(value) && value >= 0 && value <= 100 ){
				this.ask('set sound volume to ' + value, function(){
					callback(200, 'Volume set to ' + value);
				});
			}
			else if( value > 100 ){
				callback(200, 'The numbers all go to eleven. Look, right across the board, eleven, eleven, eleven... Not ' + value + '!');
			}
			else if( value < 0 ){
				callback(200, 'So you like it quiet, eh?');
			}
			else {
				callback(400, 'Invalid volume value');
			}
		break;
		default:
			callback(404, 'No hablo americano');
		break;
	}
};


/* "Private" methods */

Spotify.prototype._osascript = function() {
	"use strict";
	// args: command 1, command n, ..., callback
	var command = 'osascript -e \'set var to ""\' -e \'tell application "Spotify"\' ',
		end = "-e 'end tell'",
		l = arguments.length,
		callback = ( arguments[l - 1] && typeof arguments[l - 1] === 'function' ? arguments[l - 1] : function(){} ),
		i,
		notSet = 0;

	for( i = 0, --l; i < l; i++ ){
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
};