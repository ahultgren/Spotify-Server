function Main(){
	var main;

	function Main(){
		var that = this;

		that.server = Server({
			main: that,
			port: 3000,
			namespace: '/client'
		});

		that.player = Player({
			main: that
		});

		keyboardShortcuts();
	}

	main = new Main();

	function keyboardShortcuts(){
		var that = main;

		jQuery(function($){
			// Enable support for keyboard commands
			$(window).keydown(function(e){
				switch( e.which ){
					case 32:
						e.preventDefault();
						that.server.do('playpause');
						break;
					case 37:
						e.preventDefault();
						that.server.do('prev');
						break;
					case 39:
						e.preventDefault();
						that.server.do('next');
						break;
					case 38:
						e.preventDefault();
						that.server.do('set', ['volume', volume.value()+10]);
						break;
					case 40:
						e.preventDefault();
						that.server.do('set', ['volume', volume.value()-10]);
						break;
				}
			});
		});
	}

	return main;
}

Main();