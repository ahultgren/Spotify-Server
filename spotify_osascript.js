var exec = require('child_process');

module.exports = function(args){
	return new Osascript(args);
};

function Osascript (spotify) {
	var that = this;
	
	that.exec = exec.exec;
	that.spotify = spotify;

	that.spotify.setInterface({
		name: 'osascript',
		interface: that.ask,
		obj: that
	})
}

Osascript.prototype.ask = function() {
	"use strict";
	// args: command 1, command n, ..., callback

	var command = 'osascript -e \'set var to ""\' -e \'tell application "Spotify"\' ',
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

	this.exec(command, function(err, result){
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