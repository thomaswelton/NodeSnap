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
			success();
		} else {
	   		//Cancled login
	   	}
	 }, {scope: 'email'});
}

window.addEvent('domready',function(){
	if(Browser.name !== "chrome"){
		document.body.destroy();
		window.location = 'https://www.google.com/chrome/';
	}else{
		window.addEvent('fbAsyncInit',function(){
			var readyButton = new Element('button',{type:'button',html:'Go!',id:'ready'});
			
			var onLogin = function(){
				readyButton.removeEvents();
				readyButton.destroy();
				socket.emit('player-ready',{uid: FB.getUserID()});
				
				var loadingEl = new Element('div',{class:'loading',html: "<h1>Waiting for partner</h1>"});
				loadingEl.injectInside($('game'));
			}.bind(this);
			
			readyButton.addEvent('click',function(){
				fbLogin(onLogin);
			});
			
			FB.getLoginStatus(function(response) {
			  if (response.status === 'connected') {
			    var uid = response.authResponse.userID;
			    var accessToken = response.authResponse.accessToken;
				readyButton.addEvent('click',function(){
					onLogin();
				});
			    readyButton.injectInside($('game'));
			
			  } else if (response.status === 'not_authorized') {
				readyButton.injectInside($('game'));
			  } else {
			    readyButton.injectInside($('game'));
			  }
			 });
		});
	
		socket.on('new-game', function (data) {
			console.log(data);
			$('game').game = new Game($('game'),data);
		});
		socket.on('dealCard', function (data) {
			$('game').game.renderCard(data.card);
			//$('game').game.canControl(true);
		});

		socket.on('partner-disconnect', function () {
			$('game').game.destroy();
			delete $('game').game;
		});
	}
});

function resizeCanvas(){
	FB.Canvas.getPageInfo(function(info) {
		$('game').setStyle('height',info.clientHeight - 120);
	});
}

window.addEvent('fbAsyncInit',function(){
	resizeCanvas();
	
	
});



