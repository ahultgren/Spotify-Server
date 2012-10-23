var events = require('events');

module.exports = function(args){
	return new Slave(args);
};

function Slave(args){
	var that = this;

	that.sio = args.sio;
	that.token = args.token;
	that.spotify = args.spotify;
	that.cache = args.cache;

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

			// Automatical emits on changes to states. The message is expected
			// to contain { changedProperty: newValue }
			socket.on('change', function(changed){
				// Cache it
				that.cache.set(changed);

				// Notify the spotify object, so the world may know
				that.spotify.event.emit('change', changed);
			});
		});
};

Slave.prototype.refresh = function() {
	var that = this;

	that.sio.of('/slave').emit('refresh');
};

Slave.prototype.ask = function(commands) {
	var that = this,
		sockets = that.sio.sockets,
		id;

	// Ask spotify to execute the command
	that.sio.of('/slave').emit('ask', {
		commands: commands
	});
};