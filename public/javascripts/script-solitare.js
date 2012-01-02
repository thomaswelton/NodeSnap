var Game = new Class({
	Implements: [Options, Events],
	options: {
	},
	destroy: function(){
	},
	initialize: function(el,options){
		this.setOptions(options);
		this.el = el;
		this.bound = {};
		this.cards = this.getCards();
		$$('.cardContainerX').destroy();
		
		var pack = new Element('div',{class:"pack"});
		for(var i=0; i<5;i++){
			var packEl = new Element('div',{class:"packEl"});
			packEl.injectInside(pack);
		}
		
		
		this.bound.dealCards =  this.dealCards.bind(this);
		pack.addEvent('click',this.bound.dealCards);
		
		
		pack.injectInside($('pack-container'));
		
		
		
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
	
	},
	getCards: function(){
		var cardDeck = [];
		for(var i = 0; i < 52; i++){
			cardDeck.push(i);
		}

		var arrayShuffle = function(){
			return (Math.round(Math.random())-0.5);
		}
		
		return cardDeck.sort( arrayShuffle );	
	},
	getCardInfo: function(index){
		var i = index%13;
		var j = Math.floor(index/13);
		switch(i){
			case 1: number  = 'a'; break;
			case 11: number = 'j'; break;
			case 12: number = 'q'; break;
			case 13: number = 'k'; break;
			default: number = i;
		}
		switch(j){
			case 0: suit    = 'clubs';	break;
			case 1: suit    = 'spades'; break;
			case 2: suit    = 'diams';	break;
			case 3: suit    = 'hearts'; break;
		}
		
		return {number: number, suit: suit};
	},
	dealCards: function(){
		$('pack-playable').dispose();
		var playable = new Element('div',{id:'pack-playable'});
		playable.injectInside($('pack-container'));
		this.renderCard(0);
		this.renderCard(1);
		this.renderCard(2);
	},
	renderCard: function(index){
		
		var details = this.getCardInfo(this.cards[index]);
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
		cardContainerX.injectInside($('pack-playable'));
		
		if(index > (51 - $$('.packEl').length)){
			$$('.packEl')[0].destroy();
		}
		
		if(index == 51){
			this.reset();
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
	
	$('game').game = new Game($('game'),{});
	
	window.addEvent('fbAsyncInit',function(){
		
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



