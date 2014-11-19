var context;
var queue;
var WIDTH = 691;
var HEIGHT = 345;

var shootSpriteSheet;
var walkSpriteSheet;
var standSpriteSheet;
var winSpriteSheet;
var deadSpriteSheet;

var map = [];
var crossHair;
var cowboy;

var Enemy = (function() {
  
  function Enemy(minimumReactionTime) {
    
    this.shootDelay = (Math.random() * 2 + 3) * 1000;  
    this.reactionTime = (Math.random() + minimumReactionTime) * 1000;
    this.walkingTime = 3400;

    this.startTime = new Date().getTime();
    this.x = 50;
    this.y = 250;
    this.state = 'walking';

    this.fireText = createTextContainer('FIRE !!!', 20, 150);
    this.deadText = createTextContainer('You are dead !', 5, 225);
    

    this.animationWalking = new createjs.Sprite(walkSpriteSheet, "walk");
    this.animationWalking.regX = 99;
    this.animationWalking.regY = 58;
    this.animationWalking.x = this.x;
    this.animationWalking.y = this.y;
    this.animationWalking.gotoAndPlay("walk");
    stage.addChildAt(this.animationWalking, 1);

    this.standAnimation = new createjs.Sprite(standSpriteSheet, "stand");
    this.standAnimation.regX = 99;
    this.standAnimation.regY = 58;
    this.standAnimation.gotoAndPlay("stand");

    // ***shooting animation
    this.animationShooting = new createjs.Sprite(shootSpriteSheet, "shoot");
    this.animationShooting.regX = 99;
    this.animationShooting.regY = 58;
    this.animationShooting.gotoAndPlay("shoot");

    this.animationWinning = new createjs.Sprite(winSpriteSheet, "win");
    this.animationWinning.regX = 99;
    this.animationWinning.regY = 58;
    this.animationWinning.gotoAndPlay("win");

    this.animationDead = new createjs.Sprite(deadSpriteSheet, "die");
    this.animationDead.regX = 99;
    this.animationDead.regY = 58;
    this.animationDead.gotoAndPlay("die");
  }

  Enemy.prototype.changeState = function(newState) {
    this.state = newState;

    switch(this.state) {
        case 'standing':
            stage.removeChild(this.animationWalking);
            this.standAnimation.x = this.x;
            this.standAnimation.y = this.y;
            stage.addChild(this.standAnimation); break;
        case 'shooting':
            stage.removeChild(this.standAnimation);
            crossHair = new createjs.Bitmap(queue.getResult("crossHair"));
            setCrossHairPosition();
            stage.addChild(crossHair);
            this.animationShooting.x = this.x;
            this.animationShooting.y = this.y;
            stage.addChild(this.animationShooting);
            stage.addChild(this.fireText); break;
        case 'winning':
            stage.removeChild(this.fireText);
            stage.removeChild(crossHair);
            stage.removeChild(this.animationShooting);
            stage.addChild(this.deadText);
            this.animationWinning.x = this.x;
            this.animationWinning.y = this.y;
            stage.addChild(this.animationWinning); break;
        case 'dead':
            stage.removeChild(this.fireText);
            stage.removeChild(this.animationShooting);
            stage.removeChild(crossHair);
            stage.addChild(this.animationDead); break;
    }
  };

  Enemy.prototype.update = function(timeFromLastUpdate) {

    if(this.state === 'walking') {
        var dx = timeFromLastUpdate / 1000 * 100;
        this.x += dx;
        this.animationWalking.x = this.x;  
    }
  };

  Enemy.prototype.getState = function() {
    return this.state;
  };

  Enemy.prototype.getX = function() {
    return this.x;
  };

  Enemy.prototype.getY = function(state) {
    return this.y;
  };

  return Enemy;
})();

function setCrossHairPosition () {
    var side = Math.round(Math.random());

    var leftBound = side === 0 ? 0 : 0.8 * WIDTH; 
    var rightBound = side === 0 ? 0.2 * WIDTH : WIDTH;

    crossHair.x = Math.random() * (rightBound - leftBound) + leftBound - 45;
    crossHair.y = Math.random() * HEIGHT - 45;
}

window.onload = function() {
    //Setting up canvas
    var canvas = document.getElementById('myCanvas');
    canvas.style.cursor = 'none';
    context = canvas.getContext('2d');
    context.canvas.width = WIDTH;
    context.canvas.height = HEIGHT;
    stage = new createjs.Stage("myCanvas");

    //Loading sounds
    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.on("complete", queueLoaded, this);
    createjs.Sound.alternateExtensions = ["ogg"];

    queue.loadManifest([
        {id: 'backgroundImage', src: 'assets/background.png'},
        {id: 'crossHair', src: 'assets/crosshair.png'},
        {id: 'shot', src: 'assets/shot.mp3'},
        {id: 'background', src: 'assets/countryside.mp3'},
        {id: 'gameOverSound', src: 'assets/gameOver.mp3'},
        {id: 'tick', src: 'assets/tick.mp3'},
        {id: 'deathSound', src: 'assets/die.mp3'},
        {id: 'cowboyWalking', src: 'assets/walkingSpriteSheet.png'},
        {id: 'cowboyShooting', src: 'assets/shootingSpriteSheet.png'},
        {id: 'cowboyStanding', src: 'assets/standingSpriteSheet.png'},
        {id: 'cowboyWinning', src: 'assets/winSpriteSheet.png'},
        {id: 'cowboyDead', src: 'assets/deadSpriteSheet.png'}
    ]);
    queue.load();
};

function queueLoaded(event) {
    //Add background image
    var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"));
    stage.addChild(backgroundImage);

    //Add Score
    // scoreText = new createjs.Text("1UP: " + score.toString(), "36px Arial", "#FFF");
    // scoreText.x = 10;
    // scoreText.y = 10;
    // stage.addChild(scoreText);

    //Play background music
    createjs.Sound.play("background", {loop: -1});

    walkSpriteSheet = new createjs.SpriteSheet({
       "images": [queue.getResult('cowboyWalking')],
        "frames": {"width": 128, "height" : 128},
        "animations": {"walk": [0, 10]},
        'framerate': 20
    });

    shootSpriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('cowboyShooting')],
        "frames": {"width": 128, "height": 128},
        "animations": {"shoot": [0, 4, false, 1]},
        'framerate': 20
    });

    standSpriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('cowboyStanding')],
        "frames": {"width": 128, "height": 128},
        "animations": {"stand": [0, 0, false, 1]},
        'framerate': 20
    });

    winSpriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('cowboyWinning')],
        "frames": {"width": 128, "height": 128},
        "animations": {"win": {"frames": [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1], "speed": 0.7}},
        'framerate': 20
    });

    deadSpriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('cowboyDead')],
        "frames": {"width": 128, "height": 128},
        "animations": {"die": [0, 7, false, 1]},
        'framerate': 20
    });

    cowboy = new Enemy(3.5);
    cowboy.standing = setTimeout(function() { cowboy.changeState('standing'); }, cowboy.walkingTime);
    cowboy.shooting = setTimeout(function() { cowboy.changeState('shooting'); }, cowboy.shootDelay + cowboy.walkingTime);
    cowboy.winning = setTimeout(function() { cowboy.changeState('winning'); }, cowboy.reactionTime + cowboy.shootDelay + cowboy.walkingTime);

    //Add ticker
    createjs.Ticker.setFPS(30);
    createjs.Ticker.addEventListener('tick', stage);
    createjs.Ticker.addEventListener('tick', tickEvent);

    //window.onmousemove = handleMouseMove;
    //window.onmousedown = handleMouseDown;
    window.onkeydown = handleKeyDown;
    window.onkeyup = handleKeyUp;
}

function tickEvent(event) {
    var timeFromLastUpdate = event.delta;
    cowboy.update(timeFromLastUpdate);

}

// function handleMouseMove(event) {
//     crossHair.x = event.clientX-45;
//     crossHair.y = event.clientY-45;
// }

// function handleMouseDown(event) {

//     var shotX = Math.round(event.clientX);
//     var shotY = Math.round(event.clientY);

//     if(cowboy.getState() !== 'shooting' && cowboy.getState() !== 'dead' && cowboy.getState() !== 'winning') {

//         var text = new createjs.Text("You are not allowed to shoot !", "36px Arial", "#FFF");
//         text.x = 200;
//         text.y = 50;
//         stage.addChild(text);
//         setTimeout(function() {stage.removeChild(text);}, 1500);

//     }else if(shotX >= cowboy.getX() - 20 && shotX <= cowboy.getX() + 20 && shotY <= cowboy.getY() + 20 && shotY >= cowboy.getY() - 20 && cowboy.getState() !== 'winning') {
//         cowboy.changeState('dead');
//         clearTimeout(cowboy.winning);

//         var textWin = new createjs.Text("You win !", "36px Arial", "#FFF");
//         textWin.x = 200;
//         textWin.y = 10;
//         stage.addChild(textWin);

//         createjs.Sound.play("shot");
//     }else {
//         createjs.Sound.play("shot");
//     }
// }

function handleKeyUp (e) {
    if (e.keyCode in map) {
        map[e.keyCode] = false;
    }
}

function handleKeyDown (e) {

    map[e.keyCode] = true;

    for(var i in map) {
        if(map[i]) {
            var keyCode = i;
            
            if(keyCode == 37) {
                crossHair.x -= 10;

            }else if(keyCode == 39) {
                crossHair.x += 10;
            }else if(keyCode == 38) {
                crossHair.y -= 10;

            }else if(keyCode == 40) {
                crossHair.y += 10;

            }else if(keyCode == 32) {
                var shotX = crossHair.x + 45;
                var shotY = crossHair.y + 45;
                console.log(shotX + ' !!! ' + shotY);
                console.log(cowboy.getX() + ' !!! ' + cowboy.getY());
                if(cowboy.getState() !== 'shooting' && cowboy.getState() !== 'dead' && cowboy.getState() !== 'winning') {
                    console.log('not all');
                    var text = new createjs.Text("You are not allowed to shoot !", "36px Arial", "#FFF");
                    text.x = 200;
                    text.y = 50;
                    stage.addChild(text);
                    setTimeout(function() {stage.removeChild(text);}, 1500);

                }else if(shotX >= cowboy.getX()- 25 - 20 && shotX <= cowboy.getX() - 25 + 10 && shotY <= cowboy.getY() + 40 && shotY >= cowboy.getY() - 35 && cowboy.getState() !== 'winning') {
                    cowboy.changeState('dead');
                    clearTimeout(cowboy.winning);
 
                    var textWin = new createjs.Text("You win !", "36px Arial", "#FFF");
                    textWin.x = 200;
                    textWin.y = 10;
                    stage.addChild(textWin);

                    createjs.Sound.play("shot");
                }else if(cowboy.getState() !== 'winning'){
                    createjs.Sound.play("shot");
                }
            }
        }
    }    
}

function createTextContainer(textInput, whiteSpace, width) {
    container = new createjs.Container(); 

    var g = new createjs.Graphics(); 
    g.setStrokeStyle(2); g.beginStroke(createjs.Graphics.getRGB(0, 0, 0)); g.beginFill(createjs.Graphics.getRGB(255, 255, 255)); g.drawRoundRect(0, 0, width, 60, 20);
    var s = new createjs.Shape(g);

    var text = new createjs.Text(textInput, "32px Arial", "#000");
    text.x = whiteSpace;
    text.y = 10;
    
    container.addChild(s);
    container.addChild(text);
    container.x = 50;
    container.y = 50;

    return container;
}
