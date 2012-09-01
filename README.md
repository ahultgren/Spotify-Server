# Spotify server

Let the whole team choose what's played in the office speakers.
Also works if you want people at say a party easily check what song is currently being played, if they're too shy to ask someone.

## Installation

You must have node.js and npm installed.

* Clone this repo
    $ git clone spotify-server@git
* Enter the created directory
    $ cd spotify-server
* Install dependencies
    $ npm install
* Start the server
    $ node web.js

Try it out by visiting http://localhost:3000

## How to use

**[/play](http://localhost:3000/play)**
Plays current song if no song is playing, pauses if a song is currenty playing.

**[/next](http://localhost:3000/next)**
Plays next song in the play queue.

## Contribution

Contributions are very much appreciated. The following are stuff that need special attention:

* **A UI**
Currently this is not much more than a REST API, which is not very usable.
* **Windows support**
Is there a way to interact with Spotify from the commad prompt in windows?
* **Linux support**
Actually I have no idea if this works in Linux. Anyone have an idea?
* **Get rid of Express.js**
Express is kinda bloated when I'm only using the routing part, though it was fast to get running. But it should't require much work to refactor it out of here and make this module dependency free.
* **Web Sockets API**
Wouldn't it be awesome if you could be pushed automagically when a new song is played?

If you want to contribute just clone this repo, make your own branch, follow current coding style, change/add one feature per commit, and issue a pull request when you're done. Cuntributors will be credited below.