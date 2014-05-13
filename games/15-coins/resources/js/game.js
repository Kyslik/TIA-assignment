function Game(difficulty) {
	console.log("Game loaded");

	document.addEventListener('keydown', checkKeyDown, false);
    document.addEventListener('keyup', checkKeyUp, false);

	var canvas_board 	= 	document.getElementById('game-board');
	var canvas_player 	= 	document.getElementById('game-player');
	var canvas_mirrors 	= 	document.getElementById('game-mirrors');

	var ctx_board 		= 	canvas_board.getContext('2d');
	var ctx_player 		= 	canvas_player.getContext('2d');
	var ctx_mirrors 	= 	canvas_mirrors.getContext('2d');

	var game_ended		= 	false;
	/*var frame_rate 		=   window.requestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.mozRequestAnimationFrame ||
							window.oRequestAnimationFrame ||
							window.msRequestAnimationFrame ||
							function(callback) {
								window.setTimeout(callback, 1000 / 60);
							};*/

	var board_width 	= canvas_board.width;
	var board_height 	= canvas_board.height;

	var desired_score 	= 15;

	var mirrors 		= [];
	var mirror_interval = null; //interval id

	var points 			= [];
	var point_interval 	= null;
	var max_points		= 2;

	var timer_start 	= 0;
	var timer_end		= 0;
	var time_score		= 0;

	var square 			= new Square(Math.floor((Math.random()*board_width/2)+1), Math.floor((Math.random()*board_height/2)+1)); //randomly place square
	this.difficulty 	= difficulty;

	var player 			= new Player(board_width/2, board_height/2, 0, this.difficulty);

	setDifficulty(player, this.difficulty);
	

	Game.prototype.play = function() {
		render();
		mirror_interval = setInterval(addMirror, 1000/difficulty);
		point_interval = setInterval(addPoint, 4000/difficulty);
		timer_start = (new Date).getTime();
	};

	Game.prototype.getDifficulty = function() {
		return this.difficulty;
	};

	Game.prototype.getScore = function() {
		timer_end = (new Date).getTime(); 
		time_score = (timer_end - timer_start)/1000;
		return {difficulty: difficulty, time_e: time_score, player_points: player.score};
	};

	Game.prototype.restart = function() {
		endGame();
	};

	function Player (x, y, radius) {
		this.ball 			= new Ball(0, 0, 9); //for collision
	    this.oX				= x;
	    this.oY 			= y;
	    this.oRadius 		= radius;

		this.score 			= 0;
		
		this.path_cords		= [];

		this.player_img 	= new Image();
		this.player_img.src = "./resources/images/arrow-white-left.png";
		
		this.x 				= x;
	    this.y 				= y;
	    this.radius 		= radius;

	    this.is_thrusting 	= true;
	    this.angle 			= 0;
	   
	    this.is_right_key 	= false;
	    this.is_left_key 	= false;
	}

	Player.prototype.turn = function(dir) {
	    this.angle += this.turn_speed * dir;
	};

	Player.prototype.getAngle = function () {
		return this.angle;
	}

	Player.prototype.render = function (angle) {
	    drawImg(ctx_player, this.player_img, this.x, this.y, 10, 10, 20, 20, angle, 1);
	    this.ball.update(this.x, this.y);
	};

	Player.prototype.updateScore = function(points) {
    	this.score += points;
    	if (this.score == desired_score) endGame();
	};

	Player.prototype.getPath = function() {
		return this.path_cords;
	};

	Player.prototype.checkMirrorCollision = function() {

		if (distance(player.ball, square.ball)) {
			square.pickUp();
			setTimeout(function() {square.drop()}, 4000);
		}

		for (var i = points.length - 1; i >= 0; i--) {
			if (distance(points[i].ball, player.ball)) {
				points[i].pickUp();
			}
		};
	    for (var i = 0; i < mirrors.length; i++) {
	        if (distance(mirrors[i].ball, player.ball)) {
	        	if (square.picked_up) {
	        		mirrors[i].destroyed = true;
	        	} else {
	        		if (!mirrors[i].destroyed) {
	        			//console.log("Bum");
						endGame();	
	        		}
	
	        	}
				
			}
	
	    }
	
	};

	function Point (x, y) {
		this.ball = new Ball(x, y, 7, "rgb(255,255,255)");
		this.x 	  = x;
		this.y 	  = y;

		this.picked_up 		= false;
		this.fade_out 	 	= false;

		this.fading_dirrection = false;
	}

	Point.prototype.pickUp = function() {
		if (!this.picked_up) player.updateScore(1);
		this.picked_up = true;

	};

	Point.prototype.render = function() {
		if (this.picked_up) {
			this.ball.update(this.ball.x - 10, this.ball.y - 10, this.ball.radius - 0.2*difficulty);
			
		}

		if (!this.picked_up && this.fade_out) {
			if (this.ball.radius <= 8.5 && !this.fading_dirrection) this.ball.update(this.ball.x - 10, this.ball.y - 10, this.ball.radius + 0.1*difficulty);
			if (this.ball.radius >= 8.5) this.fading_dirrection = true;
			if (this.ball.radius >= 6.5 && this.fading_dirrection) this.ball.update(this.ball.x - 10, this.ball.y - 10, this.ball.radius - 0.1*difficulty);
			if (this.ball.radius <= 6.5) this.fading_dirrection = false;
			
		}

		this.ball.render();
	}

	function Square (x, y) {
		this.ball = new Ball(x-2.5, y-2.5, 8, "rgb(255,0,0)");
		this.x 	  = x;
		this.y 	  = y;

		this.square_img 	= new Image();
		this.square_img.src = "./resources/images/square-white.png";

		this.picked_up 		= false;
		this.fade_out 	 	= false;

		this.opacity 			= 1;
	}

	Square.prototype.pickUp = function() {
		if (!this.picked_up) {
			this.picked_up = true;
			
		}
	};

	Square.prototype.drop = function() {
		if (this.picked_up) {
			this.picked_up = false;
			this.x = Math.floor((Math.random()*board_width/2)+1);
			this.y = Math.floor((Math.random()*board_height/2)+1);
			this.ball.update(this.x-2.5, this.y-2.5, this.ball.radius);
			this.opacity = 1;
		}

	};

	Square.prototype.render = function () {
		if (!this.picked_up)
	   		drawImg(ctx_board, this.square_img, this.x, this.y, 0, 0, 15, 15, 0, 1);

	    if (this.picked_up) {
	    	if (this.opacity >= 0.2){
	    		this.opacity -= 0.1*difficulty;
	    		drawImg(ctx_board, this.square_img, this.x, this.y, 0, 0, 15, 15, 0, this.opacity);
	    	}
		}

		//this.ball.render();    
	};

	function Mirror (x, y, radius, path) {
		this.ball 			= new Ball(0, 0, 6); //for collision
		this.mirror_img 	= new Image();
		this.mirror_img.src = "./resources/images/arrow-black-left.png";

		this.mirror_empty_img 	= new Image();
		this.mirror_empty_img.src = "./resources/images/arrow-black-empty-left.png";
		
		this.x 				= x;
	    this.y 				= y;
	    this.radius 		= radius;
	    this.path 			= path.slice(0);

	    this.opacity 		= 1;

	    this.is_thrusting 	= true;
	    this.angle 			= 0;

	    this.destroyed 		= false;
	}

	Mirror.prototype.turn = function(dir) {
	    this.angle += this.turn_speed * dir;
	};

	Mirror.prototype.render = function (angle, opacity) {
		if (square.picked_up) {
			var imag = this.mirror_empty_img;
		} else {
			var imag = this.mirror_img;
		}

	    drawImg(ctx_mirrors, imag, this.x, this.y, 10, 10, 20, 20, angle, opacity);
	    this.ball.update(this.x, this.y);
	};

	Mirror.prototype.checkPlayerCollision = function() {
		if (distance(this.ball, player.ball)) {
			endGame();
		}
	};

	function Ball (x, y, radius, color) {
	    this.x = x + 10;
	    this.y = y + 10;
	    this.radius = radius;
	    this.color = color || "rgb(255,0,0)";
	}

	Ball.prototype.update = function (x, y, radius) {
	    this.x = x + 10;
	    this.y = y + 10;
	    this.radius = radius || this.radius;
	};

	Ball.prototype.render = function () {
	    ctx_board.fillStyle = this.color;
	    ctx_board.beginPath();
	    ctx_board.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
	    ctx_board.closePath();
	    ctx_board.fill();
	};

	function addMirror() {
		//console.log(player.path_cords.length);
		if (game_ended || square.picked_up) return false;
		mirrors.push(new Mirror(player.oX, player.oY, player.oRadius, player.path_cords));
		setDifficulty(mirrors[mirrors.length - 1], difficulty);
	}

	function addPoint() {
		if (game_ended) return false;

		if (points.length >= max_points - 1) {
			points[0].fade_out = true;
		}

		if (points.length >= max_points) {
			points.shift();
		} else {
			points.push(new Point(Math.floor((Math.random()*board_width/2)+1), Math.floor((Math.random()*board_height/2)+1)));
		}

	}

	function render() {
	    if (player.is_right_key) {
	        // right arrow
	        player.is_left_key = false;
	        player.turn(1);
	    }

	    if (player.is_left_key) {
	        // left arrow
	       player.is_right_key = false;
	       player.turn(-1);
	    }
	   
	    clearCtx(ctx_player);
	    clearCtx(ctx_mirrors);
	    clearCtx(ctx_board);

	    player.path_cords.push(player.angle); //save players path

	    update(player);
	    player.render(player.getAngle() * 180 / Math.PI);

	    //player.ball.render();
	    player.checkMirrorCollision();
	    square.render();

	    for (var i = mirrors.length - 1; i >= 0; i--) {
	    	if (mirrors[i].path.length <= 90 && !square.picked_up) mirrors[i].opacity -= 0.01; //console.log(mirrors[i] + " end of path");
	    	//if (mirrors[i].path.length <= 20) mirrors[i].destroyed = true;
	    	if (mirrors[i].path.length == 0) {
	    		mirrors.shift();
	    		continue;
	    	}
	    	

	    	if (!square.picked_up) {
	    		//if square is not picked up do updates
	    		mirrors[i].angle = mirrors[i].path.shift();
	    		update(mirrors[i]);	
	    	}
	    	
	    	if (!mirrors[i].destroyed)
	    	mirrors[i].render(mirrors[i].angle * 180 / Math.PI, mirrors[i].opacity);
	    	//mirrors[i].ball.render(); //drawCircle(ctx_border, mirrors[i].ball)
	    };	  
	    
	    for (var i = points.length - 1; i >= 0; i--) {
	    	if (points[i].ball.radius >= 2) points[i].render();
	    };
	    
	    if (!game_ended) {
	    	requestAnimationFrame(render); //call itself again
	    } else {
	    	changeScreen("repeat");
	    }

	}

	function drawImg(canvas, img, pX, pY, oX, oY, w, h, rot, opacity) {
		canvas.save();
		canvas.translate(pX+oX, pY+oY);
		canvas.rotate(rot);
		canvas.globalAlpha = opacity;
		canvas.drawImage(img, 0, 0, w, h, -(oX), -(oY), w, h);
		canvas.restore();
	}

	function clearCtx(canvas) {
    	canvas.clearRect(0, 0, board_width, board_height);
	}

	function endGame() {
		timer_end = (new Date).getTime(); 
		game_ended = true;
		//write score etc
		time_score = (timer_end - timer_start)/1000;
		clearInterval(mirror_interval);
		clearInterval(point_interval);
	}

	function setDifficulty(obj, difficulty) {	

    	obj.thrust = 1.4*difficulty;
    	obj.turn_speed = 0.0008*difficulty;
	}

	function update( obj ) {

		var radians = obj.angle/Math.PI*180;
	    
	    if ( obj.is_thrusting ) {

	      obj.velX = Math.cos(radians) * obj.thrust;
	      obj.velY = Math.sin(radians) * obj.thrust;
	    
	    }
	    
	    // bounds check    
	    if (obj.x < obj.radius) {
	        obj.x = board_width;   
	    }

	    if (obj.x > board_width) {
	        obj.x = obj.radius;   
	    }

	    if (obj.y < obj.radius) {
	        obj.y = board_height;   
	    }

	    if (obj.y > board_height) {
	        obj.y = obj.radius;   
	    }
	    
	    // apply friction
	    obj.velX *= 1;
	    obj.velY *= 1;
	    
	    // apply velocities    
	    obj.x -= obj.velX;
	    obj.y -= obj.velY;
	}

	function distance(ent1, ent2) { //for balls
	    var x = ent2.x - ent1.x,
	        y = ent2.y - ent1.y,
	        dist = Math.sqrt(x*x + y*y),
	        collision = false;
	    
	    // check the distance against the sum of both objects radius. If its less its a hit
	    if(dist < ent1.radius + ent2.radius){
	       collision = true;
	    }
	    return collision;
	}

	function checkKeyDown(e) {

	    var keyID = e.keyCode || e.which;

	    if (keyID === 39 || keyID === 68) { //right arrow or D key
	        player.is_right_key = true;
	        e.preventDefault();
	    }

	    if (keyID === 37 || keyID === 65) { //left arrow or A key
	        player.is_left_key = true;
	        e.preventDefault();
	    }

	}

	function checkKeyUp(e) {

	    var keyID = e.keyCode || e.which;

	    if (keyID === 39 || keyID === 68) { //right arrow or D key
	        player.is_right_key = false;
	        e.preventDefault();
	    }

	    if (keyID === 37 || keyID === 65) { //left arrow or A key
	        player.is_left_key = false;
	        e.preventDefault();
	    }

	}

}



