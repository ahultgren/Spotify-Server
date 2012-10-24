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

Client.prototype.ask = function(commands) {
	var that = this;

	// Call the proper spotify interface
	that.main.slave.ask(commands);
};

Client.prototype.play = function() {
	var that = this;

	that.ask(['playpause']);
};

Client.prototype.playUri = function(uri, context) {
	var that = this;

	that.ask([{
		command: 'play uri',
		values: [uri, context]
	}]);
};

Client.prototype.next = function() {
	var that = this;

	that.ask(['next']);
};

Client.prototype.prev = function() {
	var that = this;

	that.ask(['previous']);
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

Client.prototype.set = function(property, value) {
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