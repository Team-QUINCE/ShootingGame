var SnakeGame = SnakeGame || {};

SnakeGame.constants = {
  SQUARE_HEIGHT : 20,
  SQUARE_WIDTH : 20,
  GAME_HEIGHT : 200,
  GAME_WIDTH : 400
};

SnakeGame.startGame = function() {
  var canvas = document.getElementById('gameBoard');
  // canvas.width = SnakeGame.constants.GAME_WIDTH;
  // canvas.height = SnakeGame.constants.GAME_HEIGHT;
  var ctx = canvas.getContext('2d');
  var snk = new SnakeGame.Snake(); 

  document.onkeydown = function(e) {
    var keyCode = e.keyCode;
    
    if(keyCode === 38 && snk.getDirectionY() !== 1) {
      snk.setDirectionX(0);
      snk.setDirectionY(-1);

    }else if(keyCode === 40 && snk.getDirectionY() !== -1) {
      snk.setDirectionX(0);
      snk.setDirectionY(1);

    }else if(keyCode === 37 && snk.getDirectionX() !== 1) {
      snk.setDirectionY(0);
      snk.setDirectionX(-1);

    }else if(keyCode === 39 && snk.getDirectionX() !== -1) {
      snk.setDirectionY(0);
      snk.setDirectionX(1);
    }
  }

  var stopInterval = setInterval(loop, 200);

  function loop() {
    update();
    render();
    checkCollision();
  }

  function update() {
    snk.update();
  }

  function render() {
    ctx.clearRect(0, 0, SnakeGame.constants.GAME_WIDTH, SnakeGame.constants.GAME_HEIGHT);
    snk.render();
  }

  function checkCollision() {
    headX = snk.snakeBody[0].x;
    headY = snk.snakeBody[0].y;

    if(headX < 0 || headX >= SnakeGame.constants.GAME_WIDTH ||
      headY < 0 || headY >= SnakeGame.constants.GAME_HEIGHT) {
      clearInterval(stopInterval);
    }
  }
}

SnakeGame.Snake = (function() {
  
  function Snake() {
    this.dx = SnakeGame.constants.SQUARE_WIDTH;
    this.dy = SnakeGame.constants.SQUARE_HEIGHT;
    this.directionX = 1;
    this.directionY = 0;
    this.snakeBody = [{x: 20, y: 0}, {x: 10, y: 0}, {x: 0, y: 0}];
  }

  Snake.prototype.getDirectionX = function() {
    return this.directionX;
  };

  Snake.prototype.getDirectionY = function() {
    return this.directionY;
  };

  Snake.prototype.setDirectionX = function(newDir) {
    this.directionX = newDir;
  };

  Snake.prototype.setDirectionY = function(newDir) {
    this.directionY = newDir;
  };

  Snake.prototype.update = function() {
    this.snakeBody.pop();
    var headX = this.snakeBody[0].x + this.directionX * this.dx;
    var headY = this.snakeBody[0].y + this.directionY * this.dy;
    this.snakeBody.unshift({x: headX, y: headY});
  };

  Snake.prototype.render = function() {
    var canvas = document.getElementById('gameBoard');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "#FF0000";

    for(var element in this.snakeBody) {
      ctx.fillRect(this.snakeBody[element].x, this.snakeBody[element].y, SnakeGame.constants.SQUARE_WIDTH, SnakeGame.constants.SQUARE_HEIGHT);
    }
  };

  return Snake;
})();

