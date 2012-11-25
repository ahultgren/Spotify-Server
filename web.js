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
	that.app.use(express.bodyParser());
	that.app.use(that.app.router);

	// Create room
	that.app.post('/:roomname', function(req, res, next){
		var name = req.params.roomname;

		that.rooms.add({
			name: name,
			sio: that.sio,
			slaveToken: req.body.token,
			namespaces: {
				client: '/' + name + '_client',
				slave: '/' + name + '_slave'
			}
		})
	});

	// Connect to room
	that.app.get('/:roomname', function(req, res, next){
		that.rooms.get(req.params.roomname, function(room){
			room.playerView(req, res, next);
		},
		function(){
			next();
			/*that.users.get(req.params.roomname, function(user){
				user.profileView(req, res, next);
			},
			function(){
				next();
			});*/
		});
	});

	// Temporary fail handler
	that.app.use('/:anything', function(req, res){
		res.send(404, 'No such room found');
	});

	// Wohoo
	that.server.listen(port);
	console.info('Listening on port %s', port);
}

new App();