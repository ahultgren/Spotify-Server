var events = require('events');

module.exports = function(args){
	return new Slave(args);
};

function Slave(args){
	var that = this;

	that.sio = args.sio;
	that.token = args.token;
	that.spotify = args.spotify;

	that.event = new events.EventEmitter();

	that.initialize();
}

Slave.prototype.initialize = function() {
	var that = this,
		sockets = that.sio.sockets;

	// Authorize new slaves and make sure spotify_interface is using this driver
	that.sio.of('/slave')
		.authorization(function (handshakeData, callback) {
			callback(null, ( handshakeData.query.token === that.token ));
		})
		.on('connection', function(socket){
			console.log('connected as slave');

			that.spotify.setInterface({
				interface: that.ask,
				name: 'slave',
				obj: that
			});

			socket.on('disconnect', function(){
				if( !sockets.clients().length ){
					that.spotify.removeInterface('slave');
				}
			});


			/* Listen for emits from the slave */

			// Respones to a request from a client
			socket.on('response', function(response){
				if( response.id ){
					that.emit(response.id, response.result);
				}
			});

			// Automatical emits on changes to states. The message is expected
			// to contain { changedProperty: newValue }
			socket.on('change', function(msg){
				// Notify the spotify object, so the world may know
				that.spotify.event.emit('change', msg);
			});
		});
};

Slave.prototype.ask = function() {
	// args: command 1, ..., command n, callback

	var that = this,
		arguments = Array.prototype.slice.call(arguments),
		sockets = that.sio.sockets,
		l = arguments.length - 1,
		callback = typeof arguments[l] === 'function' && arguments[l--] || function(){},
		args = arguments.splice(0, l),
		id;

	// Generate a unique key so that the right client will get the response
	generateID(function(key){
		id = key;

		// Ask spotify to execute the command
		that.sio.of('/slave').emit('ask', {
			commands: args,
			id: id
		});

		// Create a one-time eventlistener for this id
		that.event.once(id, function(result){
			callback.apply(null, result);
		});
	});
};

function generateID(callback){
	// Not expecting a shitload of concurrent requests, so no excessive randomness here
	callback(('00'+(Math.random()*4096<<0).toString(16)).substr(-3) + '');
}