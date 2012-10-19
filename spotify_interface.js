var events = require('events');

module.exports = function(){
	return new Spotify();	
};

function Spotify(){
	// Property used for caching
	this._cache = {};

	//## When supported it would be possible to figure out if osascipt or another interface can be used

	// Set correct reference
	this.interfaceName;
	this.interface = function(){};
	this.interfaces = [];

	this.event = new events.EventEmitter();
}

/* Public methods */

/** Set what spotify interface should be used
 */
Spotify.prototype.setInterface = function(args) {
	var that = this;

	// First check if the same interface is already used. If so don't change anything
	if( args.name !== this.interfaceName && args.name && typeof args.interface === 'function' ){
		that.interface = args.interface;
		that.interfaceName = args.name;
		that.interfaceObj = args.obj;
		that.interfaces.push(args);
	}
};

Spotify.prototype.removeInterface = function(name) {
	var that = this, 
		interfaces = that.interfaces,
		i;

	// Loop through the interfaces backwards and remove the first (last) occurence
	for( i = interfaces.length; i--; ){
		if( interfaces[i].name === name ){
			interfaces.splice(i, 1);
			break;
		}
	}
};

/** Ask spotify to do something
 *
 * Checks agains a cache to reduce stress on the server (osascripts in particular are ridiculously slow).
 * Seperation between cache name and timestamp is done to be able to prevent memory leaks. If both are combined
 * there is no way to delete the property and they would pile up as time goes by.
 */
Spotify.prototype.ask = function(commands) {
	var that = this;

	// Call the proper spotify interface
	that.interface.call(that.interfaceObj, commands);
};


Spotify.prototype.play = function() {
	var that = this;

	that.ask(['playpause']);
};

Spotify.prototype.playUri = function(uri, context) {
	var that = this;

	that.ask([{
		command: 'play uri',
		values: [uri, context]
	}]);
};

Spotify.prototype.next = function() {
	var that = this;

	that.ask(['next']);
};

Spotify.prototype.prev = function() {
	var that = this;

	that.ask(['previous']);
};

Spotify.prototype.get = function(property) {
	var that = this,
		command = '';

	switch( property ){
		case 'state':
			command = 'state';
		break;
		case 'position':
			command = 'position';
			cache = false;
		break;
		case 'volume':
			command = 'volume';
		break;
		case 'name':
			command = 'name';
		break;
		case 'artist':
			command = 'artist';
		break;
		//## I need to figure out how to stream the response from an osascript or get it from the spotify api
		/*case 'artwork':
			command = 'artwork of current track';
		break;*/
		case 'album':
			command = 'album';
		break;
		case 'duration':
			command = 'duration';
		break;
		case 'uri':
			command = 'uri';
		break;
		case 'all':
			command = 'all';
		break;
	}

	if( command ){
		that.ask([command]);
	}
};

Spotify.prototype.set = function(property, value) {
	var that = this;

	switch( property ){
		case 'state':
			if( value === 'play' ){
				that.ask(['play']);
			}
			else if( value === 'pause' ){
				that.ask(['pause']);
			}
		break;
		case 'position':
			if( !isNaN(value) && value >= 0 ){
				that.ask([{
					command: 'position',
					values: [value]
				}]);
			}
		break;
		case 'volume':
			if( !isNaN(value) && value >= 0 && value <= 100 ){
				that.ask([{
					command: 'volume',
					values: [value]
				}]);
			}
		break;
	}
};