var a;
var b;
var c;
var d;
var e;
var timerSpan;
var movesSpan;
var cardArray = new Array();
var foundationsArray = new Array();
var stacksArray = new Array();
var sourceDiv;
var draggedY;
var draggedX;
var casovac = 0;
var canMove = false;
var moves = 0;
var timerRunning=true;

Object.prototype.last = function() {return this[this.length-1];}
Array.prototype.last = function() {return this[this.length-1];}
NodeList.prototype.last = function() {return this[this.length-1];}

window.onload = rozdaj;
function rozdaj(){
	b = document.getElementById('b');
	a = document.getElementById('a');
	c = document.getElementById('c');
	d = document.getElementById('d');
	e = document.getElementById('e');
	movesSpan = document.getElementById('moves');
	timerSpan = document.getElementById('casovac');
	
	var cardTypes = ['s','d','h','c'];
	for(var i=0;i<4;i++){		
		for(var j=1;j<=13;j++){			
			var card = document.createElement('DIV');
			card.id = cardTypes[i] + j;
			card.className='card';
			card.onclick = flipCard;
			card.onmousedown = dragCard;
			cardArray.push(card);
		}	
	}
	
	for(var i=0;i<7;i++){
		var stack = document.createElement('DIV');
		stack.id = 'stack'+i;
		stack.className='stack';
		document.getElementById('d').appendChild(stack);	
		stacksArray.push(stack);
	}
	
	for(var i=0;i<4;i++){
		var foundation = document.createElement('DIV');
		foundation.id = 'foundation' + i;
		foundation.className='foundation';
		document.getElementById('c').appendChild(foundation);	
		foundationsArray.push(foundation);	
	}

	document.body.onmouseout = mouseOffscreen;
	document.body.onmousemove = moveCard;
	document.body.onmouseup = dropCard;
	a.onclick = resetDeck;	
	nova();
	startTimer();
}

function getParentDiv(div){
	while(div.className.indexOf('card')>=0){
		div = div.parentNode;
	}
	return div;
}

function dragCard(event){
	if(event.stopPropagation) event.stopPropagation();
	if(this.className=='card')return false;
	sourceDiv = this.parentNode;
	if(sourceDiv.id=='b'){
		var cards = sourceDiv.getElementsByTagName('DIV');
		if(cards[cards.length-1]!=this)return;		
	}	
	draggedX = getOffset(this).left;
	draggedY = getOffset(this).top;
	e.style.left = draggedX +'px';
	e.style.top = draggedY +'px';
	draggedX -= event.clientX;
	draggedY -= event.clientY;	
	canMove = true;	
	setTimeout(function(){ if(canMove)e.appendChild(event.target); } ,100);
	return false;
}

function flipCard(event){
	if(event.stopPropagation) event.stopPropagation();
	var parentDiv = getParentDiv(this);
	if(parentDiv.id=='a'){
		for(var i=0;i<3;i++){
			lastCard=parentDiv.getElementsByTagName('DIV').last();
			if(lastCard){
				showCard(lastCard);
				b.appendChild(lastCard);
			}			
		}
		return;
	}	
	if(parentDiv.className=='stack' && this==parentDiv.getElementsByTagName('DIV').last()){
		showCard(this);		
	}
}

function nova(){
	casovac=0;
	timerRunning=true
	moves=0;
	timerSpan.innerHTML="TIME: 0";
	movesSpan.innerHTML="MOVES: 0";
	cardArray = cardArray.sort(function() {return Math.random() - Math.random();});
	for(var i=0;i<cardArray.length;i++){
		hideCard(cardArray[i]);
		a.appendChild(cardArray[i]);
	}
	var n = 0;
	for(var i=0;i<7;i++){
		for(var j=i;j<7;j++){
			var lastCard = stacksArray[j].getElementsByTagName('DIV').last();
			if(!lastCard){stacksArray[j].appendChild(cardArray[n]);}
			else{lastCard.appendChild(cardArray[n]);}
			if(j==i)showCard(cardArray[n]);
			n++;
		}			
	}	
}

function dropCard(event){
	if(!canMove) return;
	canMove = false;
	var card = e.getElementsByTagName('DIV')[0];
	if(!card) return;
	var cardLeft = parseInt(e.style.left);
	var cardTop = parseInt(e.style.top);	
	var cardType = card.id.substr(0,1);
	var cardNumber = card.id.substr(1);
	
	for(var i=0;i<7;i++){
		var tmpLeft = getOffset(stacksArray[i]).left;
		var tmpTop = getOffset(stacksArray[i]).top;
		if(cardLeft>=tmpLeft-122 && cardLeft<=tmpLeft+122 && cardTop>=tmpTop-190 && cardTop<=tmpTop+430 && getParentDiv(sourceDiv)!=stacksArray[i]){
			if(!stacksArray[i].getElementsByTagName('DIV')[0]){
				if(cardNumber==13){
					stacksArray[i].appendChild(card);
					moves++;
					movesSpan.innerHTML="MOVES: "+moves;
					if(sourceDiv.className=='card'){showCard(sourceDiv)};
					return; 
				}						
			}else{
				var cardTypeDest = stacksArray[i].getElementsByTagName('DIV').last().id.substr(0,1);						
				var cardNumberDest = stacksArray[i].getElementsByTagName('DIV').last().id.substr(1);
				var cardColors = {'s':0,'d':1,'h':1,'c':0};					
				if(cardColors[cardTypeDest]!=cardColors[cardType] && cardNumberDest-1==cardNumber){
					stacksArray[i].getElementsByTagName('DIV').last().appendChild(card);
					moves++;
					movesSpan.innerHTML="MOVES: "+moves;
					if(sourceDiv.className=='card'){showCard(sourceDiv)};
					return; 
				}
			}
		}			
	}
	for(var i=0;i<4;i++){
		var tmpLeft = getOffset(foundationsArray[i]).left;
		var tmpTop = getOffset(foundationsArray[i]).top;		
		if(cardLeft>=tmpLeft-122 && cardLeft<=tmpLeft+122 && cardTop>=tmpTop-190 && cardTop<=tmpTop+190 && getParentDiv(sourceDiv)!=foundationsArray[i]){	
			if(!foundationsArray[i].getElementsByTagName('DIV')[0]){
				if(cardNumber==1){
					foundationsArray[i].appendChild(card);
					moves++;
					movesSpan.innerHTML="MOVES: "+moves;
					if(sourceDiv.className=='card'){showCard(sourceDiv)};
					return; 
				}					
			}else{					
				var cardTypeDest = foundationsArray[i].getElementsByTagName('DIV').last().id.substr(0,1);						
				var cardNumberDest = foundationsArray[i].getElementsByTagName('DIV').last().id.substr(1);
				if(cardTypeDest==cardType && cardNumberDest==(cardNumber-1)){
					foundationsArray[i].appendChild(card);
					moves++;
					movesSpan.innerHTML="MOVES: "+moves;
					if(sourceDiv.className=='card'){showCard(sourceDiv)};
					for(var k=0;k<4;k++){
						var foundationCards = foundationsArray[k].getElementsByTagName('DIV');
						if(foundationCards.length<13)return;			
					}
					timerRunning=false;
					alert("Vyhral si! \nČas: "+casovac+"\nPočet ťahov: "+moves);
					return;
				}
			}
		}						
	}	
	if(card){		
		sourceDiv.appendChild(card);			
	}
}

function startTimer(){	
	timerSpan.innerHTML="TIME: "+casovac;
	if(timerRunning)casovac++;
	setTimeout('startTimer()',1000);
}

function showCard(card){
	card.style.backgroundImage = "url('cards/"+card.id+".png')";
	card.className="card faceup";
}

function resetDeck(){	
	var wasteCards = b.getElementsByTagName('DIV');	
	for(var i=wasteCards.length-1;i>=0;i--){
		hideCard(wasteCards[i]);	
		a.appendChild(wasteCards[i]);
	}
}

function hideCard(card){
	card.style.backgroundImage = "";	
	card.className="card";
}

function mouseOffscreen(event){
    var from = event.relatedTarget || event.toElement;
    if(!from || from.nodeName == "HTML"){
		var card = e.getElementsByTagName('DIV')[0];
		if(card){		
			sourceDiv.appendChild(card);			
		}
	}
}

function nacitaj(){	
		if(!localStorage.solitaireSave){
			alert("No save found!");return;
		}
		a.innerHTML = localStorage.solitaireSaveDeck;
		b.innerHTML = localStorage.solitaireSaveWaste;
		c.innerHTML = localStorage.solitaireSaveFoundations;
		d.innerHTML = localStorage.solitaireSaveStacks;
		casovac=parseInt(localStorage.solitaireSaveTimer);
		moves=parseInt(localStorage.solitaireSaveMoves);
		timerSpan.innerHTML="TIME: "+casovac;
		movesSpan.innerHTML="MOVES: "+moves;
		timerRunning=true;		
		cardArray = new Array();
		stacksArray = new Array();
		foundationsArray = new Array();	
		cards=b.getElementsByTagName('DIV');
		for(var i in cards){
			if(cards[i].className && cards[i].className.indexOf('card')>=0){
				cards[i].onclick = flipCard;
				//cards[i].ondblclick = autoComplete;
				cards[i].onmousedown = dragCard;
				cardArray.push(cards[i]);
			}
		}
		var cards=a.getElementsByTagName('DIV');
		for(var i in cards){
			if(cards[i].className && cards[i].className.indexOf('card')>=0){
				cards[i].onclick = flipCard;
				//cards[i].ondblclick = autoComplete;
				cards[i].onmousedown = dragCard;
				cardArray.push(cards[i]);
			}
		}
		cards=d.getElementsByTagName('DIV');
		for(var i in cards){			
			if(cards[i].className=="stack"){
				stacksArray.push(cards[i]);
			}
			if(cards[i].className && cards[i].className.indexOf('card')>=0){
				cards[i].onclick = flipCard;
				//cards[i].ondblclick = autoComplete;
				cards[i].onmousedown = dragCard;
				cardArray.push(cards[i]);
			}
		}
		cards=c.getElementsByTagName('DIV');
		for(var i in cards){
			if(cards[i].className=="foundation"){
				foundationsArray.push(cards[i]);
			}
			if(cards[i].className && cards[i].className.indexOf('card')>=0){
				cards[i].onclick = flipCard;
				//cards[i].ondblclick = autoComplete;
				cards[i].onmousedown = dragCard;
				cardArray.push(cards[i]);
			}
		}
}

function uloz(){	
	localStorage.solitaireSaveDeck = a.innerHTML;
	localStorage.solitaireSaveWaste = b.innerHTML;
	localStorage.solitaireSaveFoundations = c.innerHTML;
	localStorage.solitaireSaveStacks = d.innerHTML;
	localStorage.solitaireSaveMoves = moves;
	localStorage.solitaireSaveTimer = casovac;
	localStorage.solitaireSave = "saved";
}

function moveCard(event){
	if(canMove){
		e.style.left= event.clientX + draggedX + 'px';
		e.style.top = event.clientY + draggedY + 'px';
	}
}

function getOffset(div){
	var zhora=zdola=0;	
	while (div.id != "solitaire"){
		zdola += div.offsetLeft;
		zhora += div.offsetTop; 
		div = div.offsetParent
	}
	return {
	top:zhora,left:zdola
	};
}