
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer()
	, io = require('socket.io').listen(app);

io.set('log level',1);

var cardDeck = [];
for(var i = 0; i < 52; i++){
	cardDeck.push(i);
}

function arrayShuffle(){
	return (Math.round(Math.random())-0.5);
}

var players = {};
var waiting = [];
var games = [];

function createGame(player1,player2){
	var gameId = player1+'vs'+player2;
	games.push(gameId);
	//Get the two players by their socket id and put them in a room
	io.sockets.sockets[player1].join(gameId);
	io.sockets.sockets[player2].join(gameId);
	
	players[player1].gameId = gameId;
	players[player1].partner = player2;
	players[player2] = {gameId: gameId, partner: player1};
	
	var cards = cardDeck.sort( arrayShuffle );
	io.sockets.in(gameId).emit('new-game', {room: gameId, start: player1, cards: cards, players: [players[player1],players[player2]]});
	
	var dealFunction = function (data) {
		if(typeof(io.sockets.sockets[players[this.id].partner]) !== 'undefined'){
			io.sockets.sockets[players[this.id].partner].emit('dealCard',data);
		}
	};
	
	io.sockets.sockets[player1].on('cardDealt',dealFunction);
	io.sockets.sockets[player2].on('cardDealt',dealFunction);
}

function matchPlayer(player1){
	var player2 = waiting.shift();
	if(player2 && typeof(io.sockets.sockets[player2]) !== 'undefined' && typeof(io.sockets.sockets[player1]) !== 'undefined'){
		createGame(player1,player2);
	}else{
		waiting.push(player1);
	}
}

io.sockets.on('connection', function (socket) {
	socket.on('player-ready', function (data) {
		var player1 = socket.id;
		players[player1] = {};
		players[player1].uid = data.uid
		matchPlayer(player1);
	});
	
	socket.on('disconnect', function () {
		var player1 = this.id;
		var index = waiting.indexOf(this.id);
		if(index > 0){
			waiting.splice(index, 1);
		}
		
		if(typeof(players[player1]) !== 'undefined'){
			io.sockets.in(players[player1].gameId).emit('partner-disconnect');
			//match the old partner to a new game
			matchPlayer(players[player1].partner);		
			delete players[player1];
		}
  	});
});

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);
app.post('/', routes.index);

app.get('/solitare', routes.solitare);
app.post('/solitare', routes.solitare);

app.get('/channel.html', function(req,res){
	var cache_expire = 60*60*24*365;
	var now = new Date();
	var newms = now.getTime()+(cache_expire * 1000);
	var expire = new Date(newms);
	
	res.header('Pragma', 'public');
	res.header('Cache-Control',  'max-age='+cache_expire);
	res.header('Expires', expire.toString());
	res.send('<script src="//connect.facebook.net/en_US/all.js"></script>');
	
});

app.listen(1338);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
