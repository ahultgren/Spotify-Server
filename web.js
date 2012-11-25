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
	that.rooms = Rooms();

	// Global routing and middleware
	that.app.use('/static', express.static(__dirname + '/static'));
	that.app.use(express.cookieParser());
	that.app.use(that.app.router);

	that.app.get('/:username', function(req, res, next){
		that.rooms.get(req.params.username, function(room){
			room.playerView(req, res, next);
		},
		function(){
			res.send(404, 'Room not found');
			/*that.users.get(req.params.username, function(user){
				user.profileView(req, res, next);
			},
			function(){
				next();
			});*/
		});
	});

	// Wohoo
	that.server.listen(port);
	console.info('Listening on port %s', port);

	// Temporarily immediately set up a route for testing
	that.rooms.add({
		name: 'username',
		sio: that.sio,
		slaveToken: '1337',
		namespaces: {
			client: '/username_client',
			slave: '/username_slave'
		}
	});
}

new App();