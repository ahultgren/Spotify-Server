var 
// Main module
	Main = require('./src/main'),
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

	// Global routing and middleware
	that.app.use('/static', express.static(__dirname + '/static'));
	that.app.use(express.cookieParser());
	that.app.use(that.app.router);

	// Wohoo
	that.server.listen(port);
	console.info('Listening on port %s', port);

	// Temproarily set up a route for testing
	var main = Main({
		express: express,
		app: that.app,
		server: that.server,
		sio: that.sio,
		port: port,
		slaveToken: '1337',
		baseRoute: '/username',
		namespaces: {
			client: '/username_client',
			slave: '/username_slave'
		}
	});
}

new App();