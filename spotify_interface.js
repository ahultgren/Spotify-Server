var exec = require('child_process').exec,
	events = require('events');

module.exports = function(){
	return new Spotify();	
};

function Spotify(){
	// Property used for caching
	this._cache = {};

	//## When supported it would be possible to figure out if osascipt or another interface can be used

	// Set correct reference
	this.language = 'osascript';
	this.interface = this._osascript;
	this.event = new events.EventEmitter();
}

/* Public methods */

/** Ask spotify to do something
 *
 * Checks agains a cache to reduce stress on the server (osascripts in particular are ridiculously slow).
 * Seperation between cache name and timestamp is done to be able to prevent memory leaks. If both are combined
 * there is no way to delete the property and they would pile up as time goes by.
 */
Spotify.prototype.ask = function() {
	var that = this,
		arguments = [].splice.call(arguments, 0),
		cacheInterval = !isNaN(+arguments[arguments.length - 1]) && +arguments.pop() || false,
		callback = typeof arguments[arguments.length - 1] === 'function' && arguments.pop() || function(){},
		cacheName = '',
		timestamp = ~~(Date.now() / (cacheInterval * 1000)); // Cache every n seconds and floor it using a bitwise hack

	// Create cache name
	for( i = arguments.length; i--; ){
		cacheName += arguments[i];
	}

	// Check if cache should be used and if it's cached recently
	if( cacheInterval && that._cache[cacheName] && that._cache[cacheName][timestamp] ){
		if( !that._cache[cacheName][timestamp].error ){
			// There's a cache with no error! Callback the cache
			callback.apply(null, that._cache[cacheName][timestamp]);
		}
		else {
			// There's a cache but there was an error last time
		}
	}
	else{
		arguments.push(function(err){
			if( !err.error ){
				callback.apply(null, arguments);
			}

			if( cacheInterval ){
				// Create a new cache and remove the old one
				that._cache[cacheName] = {};
				that._cache[cacheName][timestamp] = arguments;
			}
		});

		// Call the proper spotify interface
		that.interface.apply(this, arguments);
	}
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

Spotify.prototype.playUri = function() {
	// args: uri, [context], callback
	var uri = arguments[0],
		l = arguments.length - 1,
		callback = typeof arguments[l] === 'function' && arguments[l--] || function(){},
		context = (l > 0 && typeof arguments[l] === 'string') &&  arguments[l] || undefined;

	// Make VERY sure that the uri doesn't contain anything I don't want it to contain
	if( context && context.match(/[^A-Za-z0-9:#]/g) || uri.match(/[^A-Za-z0-9:#]/g) ){
		callback(400, '¿Hablos español?');
	}
	else {
		this.ask('play track "' + uri + ( context && '" in context "' + context + '"' || '"' ), 'player state', 'name of current track', 'artist of current track', function(){
			if( arguments[1] === 'playing' ){
				callback(200, 'Now playing ' + arguments[2] + ' by ' + arguments[3] + '.');
			}
			else {
				console.log(arguments[1]);
				callback(200, 'It seems that URI didn\'t work, but I have to say that song sucks anyways.');
			}
		});
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
	var command = '',
		cache = 10;
	callback = callback || function(){};

	switch( property ){
		case 'state':
			command = 'player state';
		break;
		case 'position':
			command = 'player position';
			cache = false;
		break;
		case 'volume':
			command = 'sound volume';
		break;
		case 'name':
			command = 'name of current track';
		break;
		case 'artist':
			command = 'artist of current track';
		break;
		//## I need to figure out how to stream the response from an osascript or get it from the spotify api
		/*case 'artwork':
			command = 'artwork of current track';
		break;*/
		case 'album':
			command = 'album of current track';
		break;
		case 'duration':
			command = 'duration of current track';
		break;
		case 'url':
			command = 'spotify url of current track';
		break;
		case 'current':
			this.ask('name of current track', 'artist of current track', 'album of current track', 'duration of current track', 'spotify url of current track', 'player state', function(){
				callback(200, 'Track: ' + arguments[0] + '\n'
					+ 'Artist: ' + arguments[1] + '\n'
					+ 'Album: ' + arguments[2] + '\n'
					+ 'Duration: ' + arguments[3] + '\n'
					+ 'Sporify URI: ' + arguments[4] + '\n'
					+ 'Player state: ' + arguments[5] + '\n');
			}, cache);
		break;
		default:
			callback(404, 'Que?');
		break;
	}

	if( command ){
		this.ask(command, function(){
			callback(200, arguments[0]);
		}, cache);
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

	var that = this,
		command = 'osascript -e \'set var to ""\' -e \'tell application "Spotify"\' ',
		end = "-e 'end tell'",
		l = arguments.length,
		//! Important to note that l is reduced automatically here if callback is found
		callback = typeof arguments[l] === 'function' && arguments[--l] 
			|| typeof arguments[l - 1] && arguments[--l] || function(){},
		i,
		notSet = 0;

	for( i = 0, l; i < l; i++ ){
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
			result = result.split('').splice(0, result.length - 1).join('').split(';;;');

			callback.apply(null, result);
		}
		else {
			callback({error: arguments});
		}
	});
};