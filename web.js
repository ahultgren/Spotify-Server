var app = require('express')(),
	port = 3000,
	spotify = require('./spotify_interface')(),
	auth,
	allowedLevels = 9,
	useAuth = false;


// Routing

app.use(function(req, res, next){
	res.httpResponse = function(status, message){
		res.contentType('text/plain');
		res.send(status, message);
	};
	next();
});

app.use(function(req, res, next){
	var level = 0,
		i,
		routes = app.routes.get,
		path;

	for( i in routes ){
		if( req.path.match(routes[i].regexp) ){
			path = routes[i].path;
		}
	}

	switch( path ){
		case '/':
			level = 0;
		break;
		case '/current':
			level = 1;
		break;
		case '/get/:property':
			level = 2;
		break;
		case '/next':
		case '/prev':
		case '/play':
			level = 3;
		break;
		case '/play/:uri':
			level = 4;
		break;
		case '/set/:property/:value':
			level = 5;
		break;
		case 'auth/:token/:level':
			level = 10;
		break;
	}

	if( level <= allowedLevels || req.query.token === auth ){
		next();
	}
	else {
		res.httpResponse(401, 'You shall not pass!');
	}
});

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

app.get('/play', function(req, res){
	spotify.play(res.httpResponse);
});

app.get('/play/:uri', function(req, res){
	spotify.playUri(req.params.uri, res.httpResponse);
});

app.get('/next', function(req, res){
	spotify.next(res.httpResponse);
});

app.get('/prev', function(req, res){
	spotify.prev(res.httpResponse);
});

app.get('/get/:property', function(req, res){
	spotify.get(req.params.property, res.httpResponse);
});

app.get('/set/:property/:value', function(req, res){
	spotify.set(req.params.property, req.params.value, res.httpResponse);
});

app.get('/current', function(req, res){
	spotify.get('current', res.httpResponse);
});

app.get('/auth/:token/:level', function(req, res){
	if( useAuth ){
		auth = req.params.token;
		allowedLevels = req.params.level;
		res.httpResponse(200, 'Permissions updated!');
	}
	else {
		res.httpResponse(403, 'You require more vespene gas (authorization is disabled).');
	}
});

app.listen(port);
console.log('Listening on port ' + port);