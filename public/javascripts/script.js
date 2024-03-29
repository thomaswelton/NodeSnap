var socket = io.connect(window.location.origin);
var Game = new Class({
	Implements: [Options, Events],
	options: {
	  	room: null,
		cards: null
	},
	destroy: function(){
		$('deal').destroy();
		$$('.pack').destroy();
		
		var loadingEl = new Element('div',{class:'loading',html: "<h1>Partner Left, finding new game.</h1>"});
		loadingEl.injectInside($('game'));
	},
	initialize: function(el,options){
		this.setOptions(options);
		this.el = el;
		this.control = false;
		this.cards = options.cards;
		this.currentCard = -1;
		
		$$('.cardContainerX').destroy();
		
		var pack = new Element('div',{class:"pack"});
		for(var i=0; i<5;i++){
			var packEl = new Element('div',{class:"packEl"});
			packEl.injectInside(pack);
		}
		pack.injectInside($('game'));
		
		
		this.el.getChildren('.loading').destroy();
		this.cardMap = [];
		for(var i = 1; i <= 13; i++){
			for(var j = 0; j < 4; j++){
				var number = null;
				var suit = null;
				switch(i){
					case 1: number = 'a'; break;
					case 11: number = 'j'; break;
					case 12: number = 'q'; break;
					case 13: number = 'k'; break;
					default: number = i;
				}
				switch(j){
					case 0: suit = 'clubs';	break;
					case 1: suit = 'spades'; break;
					case 2: suit = 'diams';	break;
					case 3: suit = 'hearts'; break;
				}
				this.cardMap.push({number: number, suit: suit});
			}
		}
		
		this.spotMap = [null,	['5'],
								['2','8'],
								['2','5','8'],
								['1','3','7','9'],
								['1','3','5','7','9'],
								['1','3','4','6','7','9'],
								['1','3','4','6','7','9','10'],
								['1','3','4','6','7','9','10','11'],
								['1','2','3','4','5','6','7','8','9'],
								['1','2','3','4','6','7','8','9','10','11']];
	
		var dealButton = new Element('button',{type:'button',html:'Deal',id: 'deal'});
		var boundDeal = this.dealCard.bind(this);
		dealButton.addEvent('click',boundDeal);
		dealButton.injectInside(this.el);
		
		$$('.pack').addEvent('click',boundDeal);
		window.addEvent( 'keypress', function(e){ 
			if(e.key == 'space'){
				new Event(e).stop();
				boundDeal();
			}
		});
		
		var boundSnap = this.snap.bind(this);
		var snapButton = new Element('button',{type:'button',html:'Snap',id: 'snap'});
		snapButton.addEvent('click',boundSnap);
		snapButton.injectInside(this.el);
		window.addEvent( 'keypress', function(e){ 
			if(e.key == 'enter'){
				new Event(e).stop();
				boundSnap();
			}
		});
		
		if(socket.socket.sessionid === options.start){
			this.canControl(true);
		}else{
			this.canControl(false);
		}
		
		//demo
		this.canControl(true);
		
	},
	canControl: function(bool){
		this.control = bool;
		$('deal').disabled = (!bool);
	},
	snap: function(){
		if(this.currentCard < 1){
			console.log('snap fail');
			return;
		}
		
		var card1 = this.cardMap[this.cards[this.currentCard]];
		var card2 = this.cardMap[this.cards[this.currentCard - 1]];
		
		console.log('User called snap on '+card1.number+' matching '+card2.number);
		console.log(card1);
		console.log(card2);
		
		if(card1.number == card2.number){
			console.log('snap');
		}else{
			console.log('snap fail');
		}
	},
	dealCard: function(){
		//demo
		//this.canControl(false);
		
		this.renderCard(this.currentCard + 1);
		socket.emit('cardDealt',{card:this.currentCard});
	},
	renderCard: function(index){
		if(this.currentCard == index) return;
		
		this.currentCard = index;
		
		var details = this.cardMap[this.options.cards[index]];
		var numbers = [null,"one","two","three","four","five","six","seven","eight","nine","ten"];
		var number = (details.number == 'a') ? "one" : numbers[details.number]; 
		var card = new Element('div',{
			class: "card "+details.suit+" "+number,
			html: "<div class='number'>"+details.number+"</div><div class='number'>"+details.number+"</div>"
		});
		
		if(typeof(details.number) !== 'string'){
			for(var i = 0; i < details.number; i++){
				var spot = this.spotMap[details.number][i];
				card.innerHTML += "<div class='suit spot"+spot+"'>&"+details.suit+";</div>";
			}
		}else if(details.number === "a"){
			card.innerHTML += "<div class='suit spot5'>&"+details.suit+";</div>";
		}else{
			card.innerHTML += "<div class='suit spot1'>&"+details.suit+";</div><div class='suit spot3'>&"+details.suit+";</div><div class='suit spot7'>&"+details.suit+";</div><div class='suit spot9'>&"+details.suit+";</div>";
			switch(details.number){
				case 'j': card.innerHTML += "<div class='name'>Jack</div>"; break;
				case 'q': card.innerHTML += "<div class='name'>Queen</div>"; break;
				case 'k': card.innerHTML += "<div class='name'>King</div>"; 	break;
			}
		}
		
		var cardContainerY = new Element('div',{
			class: "cardContainerY",
			html: "<div class='back'></div>"
		});
		var cardContainerX = new Element('div',{
			class: "cardContainerX"
		});
		
		card.injectInside(cardContainerY);
		cardContainerY.injectInside(cardContainerX);
		cardContainerX.injectInside($('game'));
		
		if(index > (51 - $$('.packEl').length)){
			$$('.packEl')[0].destroy();
		}
		
		if(index == 51){
			this.canControl(false);
		}
	}
});

function fbLogin(success){
	FB.login(function(response) {
   		if (response.authResponse) {
			console.log('FB login success');
			success();
		} else {
	   		//Cancled login
			console.log('User canceled FB login');
	   	}
	 }, {scope: ''});
}

window.addEvent('domready',function(){
	if(Browser.name !== "chrome"){
		//document.body.destroy();
		//window.location = 'https://www.google.com/chrome/';
		//return;
	}
	
	console.log('User Visited Page');
	window.addEvent('fbAsyncInit',function(){
		var readyButton = $$('button.ready');
		
		var onLogin = function(){
			readyButton.removeEvents();
			readyButton.destroy();
			$$('.welcome').destroy();
			console.log('SOCKET-SEND: player-ready');
			socket.emit('player-ready',{uid: FB.getUserID()});
			
			var loadingEl = new Element('div',{class:'loading',html: "<h1>Waiting for partner</h1>"});
			loadingEl.injectInside($('game'));
		}.bind(this);
		
		FB.getLoginStatus(function(response) {
		  if (response.status === 'connected') {
		    var uid = response.authResponse.userID;
		    var accessToken = response.authResponse.accessToken;
		
			console.log('Known user '+uid);
			readyButton.addEvent('click',function(){
				console.log('Known user click ready button, no login required');
				onLogin();
			});
		  } else {
		    console.log('Unknown user with no FB access token');
			readyButton.addEvent('click',function(){
				console.log('Unknown user click ready button, must use FB login');
				fbLogin(onLogin);
			});
		  }
		 });
	});

	socket.on('new-game', function (data) {
		console.log('New game started, here is the game data');
		console.log(data);
		$('game').game = new Game($('game'),data);
	});
	socket.on('dealCard', function (data) {
		$('game').game.renderCard(data.card);
		//$('game').game.canControl(true);
	});

	socket.on('partner-disconnect', function () {
		console.log('Partner left');
		$('game').game.destroy();
		delete $('game').game;
	});
});

function resizeCanvas(){
	FB.Canvas.getPageInfo(function(info) {
		$('game').setStyle('height',info.clientHeight - 120);
		FB.Canvas.setAutoResize(false);
	});
}

window.addEvent('fbAsyncInit',function(){
	resizeCanvas();
});



