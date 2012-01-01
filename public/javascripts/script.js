var socket = io.connect(window.location.origin);
var Game = new Class({
	Implements: [Options, Events],
	options: {
	  	room: null,
		cards: null
	},
	destroy: function(){
		$('deal').removeEvents('click');
		this.el.innerHTML = 'partner left, finding game';
	},
	initialize: function(el,options){
		this.setOptions(options);
		this.el = el;
		this.control = false;
		this.currentCard = null;
		
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
		

		if(socket.socket.sessionid === options.start){
			this.canControl(true);
		}else{
			this.canControl(false);
		}
		
		//demo
		this.canControl(true);
		
		
		var boundDeal = this.dealCard.bind(this);
		$('deal').addEvent('click',boundDeal);
		
		this.renderCard(0);
		
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
	}
});

socket.on('new-game', function (data) {
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



