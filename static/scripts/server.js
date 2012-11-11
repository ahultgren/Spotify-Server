function Server(args){
	// Private vars
	var server, socket;

	// Constructor
	function Server(args){
		var that = this;

		// Connect
		socket = io.connect(args.port + args.namespace);

		// Extend this object with an EventEmitter
		$.extend(this, new EventEmitter());
	}

	// Public methods
	Server.prototype.do = function(command, values) {
		var that = this;

		socket.emit('do', {
			command: command,
			values: values
		});
	};

	server = new Server(args);

	// Private methods
	function listen(){
		var that = server;

		socket.on('connect', function(data){
			console.log('Successfully connected as client');
			that.trigger('connect');
		});

		socket.on('change', function(data){
			that.trigger('change', [data]);
		});

		socket.on('spotifyDisconnected', function(){
			that.trigger('spotifyDisconnected');
		});

		socket.on('disconnect', function(){
			that.trigger('disconnect');
		});
	}
	return server;
}