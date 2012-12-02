var events = require('events');

module.exports = function(args){
	return new Client(args);
};

function Client(args){
	var that = this;

	that.main = args.main;
	that.cache = args.main.cache;
	that.namespace = args.namespace;
	that.event = new events.EventEmitter();
}

Client.prototype.listen = function() {
	var that = this;

	that.main.sio.of(that.namespace)
		.authorization(function(data, next){
			var cookie = data.headers.cookie && data.headers.cookie.match(/auth=([^;]+)/) || false;

			if( cookie && (cookie = cookie[1]) ){
				that.main.permissions.plainAuth(cookie, data.address.address, data, function(){
					next(null, true);
				});
			}
		})
		.on('connection', function (socket) {
			console.log('connected as client');

			// Send all data on connect
			that.get('all', function(all){
				socket.emit('change', all);
			});

			socket.on('get', function(property){
				that.get(property, function(data){
					socket.emit(property, data);
				});
			});

			socket.on('do', function(data){
				that.do(data, socket);
			});

			socket.on('refresh', function(){
				that.main.spotify.refresh();
			});

			socket.on('disconnect', function (data) {
				console.log('a client disconnected', data);
			});
		});

	that.main.spotify.event.on('change', function(changed){
		that.main.sio.of(that.namespace).emit('change', changed);
	});

	that.main.spotify.event.on('disconnected', function(changed){
		that.main.sio.of(that.namespace).emit('spotifyDisconnected');
	});
};

Client.prototype.do = function(command, socket) {
	var that = this;

	that.main.permissions.authCommand(socket, command, function(){
		that.main.spotify.do(command);
	});
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

Client.prototype.die = function() {
	var that = this;
	// Make sure no socket listeners are still hanging around
	delete that.main.sio.namespaces[that.namespace];
};