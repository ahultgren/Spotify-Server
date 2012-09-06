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


/* "Private" methods */

Spotify.prototype._osascript = function() {
	"use strict";
	// args: command 1, command n, ..., callback
	var command = 'osascript -e \'set var to ""\' -e \'tell application "Spotify"\' ',
		end = "-e 'end tell'",
		l = arguments.length,
		callback = ( arguments[l - 1] && typeof arguments[l - 1] === 'function' ? arguments[l - 1] : function(){console.log("meow!");} ),
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