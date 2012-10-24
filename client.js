var events = require('events');

module.exports = function(args){
	return new Client(args);
};

function Client(args){
	var that = this;

	that.main = args.main;
	that.cache = args.main.cache;
	that.event = new events.EventEmitter();
}

/* Public methods */

Client.prototype.do = function(command) {
	var that = this;

	// Call the proper spotify interface
	that.main.spotify.do(command);
};

Client.prototype.get = function(property, callback) {
	var that = this,
		result;

	switch( property ){
		case 'state':
		case 'position':
		case 'volume':
		case 'name':
		case 'artist':
		case 'cover':
		case 'album':
		case 'duration':
		case 'uri':
			result = that.cache.get(property);
		break;
		case 'all':
			result = that.cache.getAll();
		break;
	}

	callback(result);
};