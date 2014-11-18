var context;
var queue;
var WIDTH = 1024;
var HEIGHT = 768;
var mouseXPosition;
var mouseYPosition;
var batImage;
var stage;
var animation;
var deathAnimation;
var spriteSheet;
var enemyXPos = 100;
var enemyYPos = 100;
var enemyXSpeed = 1.5;
var enemyYSpeed = 1.75;
var score = 0;
var scoreText;
var gameTimer;
var gameTime = 0;
var timerText;
var playerState = 'alive';

var cowboy;


var Enemy = (function() {
  
  function Enemy() {
    this.shootDelay = (Math.random() * 2 + 3) * 1000;  
    this.reactionTime = (Math.random() + 1) * 1000;
    this.walkingTime = 1500;
    this.startTime = new Date().getTime();
    this.x = 100;
    this.y = 250;
    this.state = 'walking';

    this.fireText = new createjs.Text("FIRE !!!", "36px Arial", "#FFF");
    this.fireText.x = 200;
    this.fireText.y = 10;

    this.deadText = new createjs.Text("You are dead !", "36px Arial", "#FFF");
    this.deadText.x = 200;
    this.deadText.y = 10;

    this.animationWalking = new createjs.Sprite(spriteSheet, "flap");
    this.animationWalking.regX = 99;
    this.animationWalking.regY = 58;
    this.animationWalking.x = this.x;
    this.animationWalking.y = this.y;
    this.animationWalking.gotoAndPlay("flap");
    stage.addChildAt(this.animationWalking, 1);

    this.standAnimation = new createjs.Sprite(batDeathSpriteSheet, "die");
    this.standAnimation.regX = 99;
    this.standAnimation.regY = 58;
    this.standAnimation.x = this.x;
    this.standAnimation.y = this.y;
    this.standAnimation.gotoAndPlay("die");

    // ***shooting animation
    // this.animationShooting = new createjs.Sprite(spriteSheet, "flap");
    // this.animationShooting.regX = 99;
    // this.animationShooting.regY = 58;
    // this.animationShooting.x = this.x;
    // this.animationShooting.y = this.y;
    // this.animationShooting.gotoAndPlay("flap");

    // ***dead animation
    // this.animationDead = new createjs.Sprite(spriteSheet, "flap");
    // this.animationDead.regX = 99;
    // this.animationDead.regY = 58;
    // this.animationDead.x = this.x;
    // this.animationDead.y = this.y;
    // this.animationDead.gotoAndPlay("flap");

    // В момента използавам двете съществуващи анимации (animationWalking и standAnimation), за да се видижа кога се сменят
  }

  Enemy.prototype.update = function(timeFromLastUpdate) {
    var currentTime = new Date().getTime();

    if((currentTime - this.startTime) < this.walkingTime) {
        var dx = timeFromLastUpdate / 1000 * 100;
        this.x += dx;
        this.animationWalking.x = this.x;  
        console.log('walk');

    }else if((currentTime - this.startTime) < (this.walkingTime + this.shootDelay) && this.state === 'walking') {
        stage.removeChild(this.animationWalking);
        this.standAnimation.x = this.x;
        this.standAnimation.y = this.y;
        stage.addChild(this.standAnimation);
        this.state = 'standing';  
        console.log('stand');  

    }else if((currentTime - this.startTime) >= (this.walkingTime + this.shootDelay + this.reactionTime) && this.state === 'shooting') {
        stage.removeChild(this.fireText);
        stage.addChild(this.deadText);
        playerState = 'dead';

    }else if((currentTime - this.startTime) >= (this.walkingTime + this.shootDelay) && this.state === 'standing') {
        stage.removeChild(this.standAnimation);
        stage.addChild(this.animationWalking);
        this.state = 'shooting';
        stage.addChild(this.fireText);
        console.log('shoot');  
    }

    if(this.state === 'dead') {
        stage.removeChild(this.animationWalking);
        stage.addChild(this.standAnimation);
    }
  };

  Enemy.prototype.getState = function() {
    return this.state;
  };

  Enemy.prototype.setState = function(state) {
    this.state = state;
  };

  Enemy.prototype.getX = function() {
    return this.x;
  };

  Enemy.prototype.getY = function(state) {
    return this.y;
  };

  return Enemy;
})();

window.onload = function() {
    //Setting up canvas
    var canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');
    context.canvas.width = WIDTH;
    context.canvas.height = HEIGHT;
    stage = new createjs.Stage("myCanvas");

    //Loading sounds
    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.on("complete", queueLoaded, this);
    createjs.Sound.alternateExtensions = ["ogg"];

    //Create a load manifest for all assets
    //TODO - change this
    queue.loadManifest([
        {id: 'backgroundImage', src: 'assets/background.png'},
        {id: 'crossHair', src: 'assets/crosshair.png'},
        {id: 'shot', src: 'assets/shot.mp3'},
        {id: 'background', src: 'assets/countryside.mp3'},
        {id: 'gameOverSound', src: 'assets/gameOver.mp3'},
        {id: 'tick', src: 'assets/tick.mp3'},
        {id: 'deathSound', src: 'assets/die.mp3'},
        {id: 'batSpritesheet', src: 'assets/batSpritesheet.png'},
        {id: 'batDeath', src: 'assets/batDeath.png'}
    ]);
    queue.load();

    //update once per second
    // gameTimer = setInterval(updateTime, 1000);
};

function queueLoaded(event) {
    //Add background image
    var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"));
    stage.addChild(backgroundImage);

    //Add Score
    scoreText = new createjs.Text("1UP: " + score.toString(), "36px Arial", "#FFF");
    scoreText.x = 10;
    scoreText.y = 10;
    stage.addChild(scoreText);

    //Add Timer
    timerText = new createjs.Text("Time: " + gameTime.toString(), "36px Arial", "#FFF");
    timerText.x = 800;
    timerText.y = 10;
    stage.addChild(timerText);

    //Play background music
    createjs.Sound.play("background", {loop: -1});

    //Create enemy spritesheet
    spriteSheet = new createjs.SpriteSheet({
       "images": [queue.getResult('batSpritesheet')],
        "frames": {"width": 198, "height" : 117},
        "animations": {"flap": [0,4]}
    });

    //Create enemy death spritesheet
    batDeathSpriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('batDeath')],
        "frames": {"width": 198, "height": 148},
        //"animations": {"die": [0,7,false,1]}
        "animations": {"die": [0,7]}
    });


    //Create mouse
    crossHair = new createjs.Bitmap(queue.getResult("crossHair"));
    stage.addChild(crossHair);

    cowboy = new Enemy();

    //Add ticker
    createjs.Ticker.setFPS(30);
    createjs.Ticker.addEventListener('tick', stage);
    createjs.Ticker.addEventListener('tick', tickEvent);

    //Set up events AFTER the game is loaded;
    window.onmousemove = handleMouseMove;
    window.onmousedown = handleMouseDown;
}

function tickEvent(event) {//TODO - this is to move the enemy around, it will be useful to change
    //Make sure enemy is within game - currently it's not quite there
    var timeFromLastUpdate = event.delta;
    cowboy.update(timeFromLastUpdate);

}

function handleMouseMove(event) {
    //Offset the position by 45 pixels so mouse is in center of crosshair
    //TODO - may not need to do that later on
    crossHair.x = event.clientX-45;
    crossHair.y = event.clientY-45;
}

function handleMouseDown(event) {
    //Play gunshot sound
    createjs.Sound.play("shot");

    var shotX = Math.round(event.clientX);
    var shotY = Math.round(event.clientY);

    if(cowboy.getState() !== 'shooting' && cowboy.getState() !== 'dead') {

        var text = new createjs.Text("You are not allowed to shoot !", "36px Arial", "#FFF");
        text.x = 200;
        text.y = 10;
        stage.addChild(text);

    }else if(shotX >= cowboy.getX() - 20 && shotX <= cowboy.getX() + 20 && shotY <= cowboy.getY() + 20 && shotY >= cowboy.getY() - 20 && playerState !== 'dead') {
        cowboy.setState('dead');
        
        var textWin = new createjs.Text("You win !", "36px Arial", "#FFF");
        textWin.x = 200;
        textWin.y = 50;
        stage.addChild(textWin);
    }    
}
