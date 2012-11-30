var 
// Main module
	Rooms = require('./rooms/main'),
// Dependencies
	express = require('express'),
	server = require('http'),
	socket = require('socket.io')
// Vars
	port = 3000;

function App(){
	var that = this;

	that.app = express();
	that.server = server.createServer(that.app);
	that.sio = socket.listen(that.server);
	that.rooms = Rooms({
		sio: that.sio
	});

	// Global routing and middleware
	that.app.use('/static', express.static(__dirname + '/static'));
	that.app.use(express.cookieParser());
	that.app.use(express.bodyParser());
	that.app.use(that.app.router);

	// Create room
	that.app.post('/:roomname', that.rooms.add());

	// Connect to room
	that.app.get('/:roomname', that.rooms.playerView());

	// Login to room
	that.app.get('/:roomname/login', that.rooms.loginView());

	// Temporary fail handler
	that.app.use(function(err, req, res, next){
		if( err.code ){
			res.send(err.code, err.message);
		}
		else {
			res.send(500, 'Unexpected error.')
		}
	});

	// Wohoo
	that.server.listen(port);
	console.info('Listening on port %s', port);
}

new App();