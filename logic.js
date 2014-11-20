var ShootingGame = ShootingGame || {};

ShootingGame.keyHandle = {};
ShootingGame.keyHandle.map = [];

ShootingGame.entity = {};

ShootingGame.constants = {};
ShootingGame.constants.WIDTH = 691;
ShootingGame.constants.HEIGHT = 345;

ShootingGame.assets = {};
ShootingGame.assets.spriteSheets = {};
ShootingGame.assets.animations = {};
ShootingGame.assets.textBox = {};


window.onload = function() {
    
    //Setting up canvas
    var canvas = document.getElementById('myCanvas');
    canvas.style.cursor = 'none';

    var context = canvas.getContext('2d');
    context.canvas.width = ShootingGame.constants.WIDTH;
    context.canvas.height = ShootingGame.constants.HEIGHT;
    
    ShootingGame.stage = new createjs.Stage('myCanvas');

    //Loading sounds
    var queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.on('complete', ShootingGame.queueLoaded, this);
    createjs.Sound.alternateExtensions = ['ogg'];

    queue.loadManifest([
        {id: 'backgroundImage', src: 'assets/background.png'},
        {id: 'crossHair', src: 'assets/crosshair.png'},
        {id: 'shot', src: 'assets/shot.mp3'},
        {id: 'background', src: 'assets/countryside.mp3'},
        {id: 'cowboyWalking', src: 'assets/walkingSpriteSheet.png'},
        {id: 'cowboyShooting', src: 'assets/shootingSpriteSheet.png'},
        {id: 'cowboyStanding', src: 'assets/standingSpriteSheet.png'},
        {id: 'cowboyWinning', src: 'assets/winSpriteSheet.png'},
        {id: 'cowboyDead', src: 'assets/deadSpriteSheet.png'}
    ]);

    queue.load();
    ShootingGame.assets.queue = queue;
};

ShootingGame.queueLoaded = function(event) {
    var stage = ShootingGame.stage;
    var queue = ShootingGame.assets.queue;

    //Add background image
    var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"));
    stage.addChild(backgroundImage);

    //Play background music
    createjs.Sound.play("background", {loop: -1});

    // Creating sprite sheets
    ShootingGame.assets.spriteSheets.walkSpriteSheet = new createjs.SpriteSheet({
       "images": [queue.getResult('cowboyWalking')],
        "frames": {"width": 128, "height" : 128},
        "animations": {"walk": [0, 10]},
        'framerate': 20
    });

    ShootingGame.assets.spriteSheets.shootSpriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('cowboyShooting')],
        "frames": {"width": 128, "height": 128},
        "animations": {"shoot": [0, 4, false, 1]},
        'framerate': 20
    });

    ShootingGame.assets.spriteSheets.standSpriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('cowboyStanding')],
        "frames": {"width": 128, "height": 128},
        "animations": {"stand": [0, 0, false, 1]},
        'framerate': 20
    });

    ShootingGame.assets.spriteSheets.winSpriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('cowboyWinning')],
        "frames": {"width": 128, "height": 128},
        "animations": {"win": {"frames": [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1], "speed": 0.7}},
        'framerate': 20
    });

    ShootingGame.assets.spriteSheets.deadSpriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('cowboyDead')],
        "frames": {"width": 128, "height": 128},
        "animations": {"die": [0, 7, false, 1]},
        'framerate': 20
    });

    // Creating animations

    var animationWalking = new createjs.Sprite(ShootingGame.assets.spriteSheets.walkSpriteSheet, "walk");
    animationWalking.regX = 99;
    animationWalking.regY = 58;
    animationWalking.gotoAndPlay("walk");
    ShootingGame.assets.animations.animationWalking = animationWalking;

    var standAnimation = new createjs.Sprite(ShootingGame.assets.spriteSheets.standSpriteSheet, "stand");
    standAnimation.regX = 99;
    standAnimation.regY = 58;
    standAnimation.gotoAndPlay("stand");
    ShootingGame.assets.animations.standAnimation = standAnimation;

    var animationShooting = new createjs.Sprite(ShootingGame.assets.spriteSheets.shootSpriteSheet, "shoot");
    animationShooting.regX = 99;
    animationShooting.regY = 58;
    animationShooting.gotoAndPlay("shoot");
    ShootingGame.assets.animations.animationShooting = animationShooting;

    var animationWinning = new createjs.Sprite(ShootingGame.assets.spriteSheets.winSpriteSheet, "win");
    animationWinning.regX = 99;
    animationWinning.regY = 58;
    animationWinning.gotoAndPlay("win");
    ShootingGame.assets.animations.animationWinning = animationWinning;

    var animationDead = new createjs.Sprite(ShootingGame.assets.spriteSheets.deadSpriteSheet, "die");
    animationDead.regX = 99;
    animationDead.regY = 58;
    animationDead.gotoAndPlay("die");
    ShootingGame.assets.animations.animationDead = animationDead;


    // Create text messages
    ShootingGame.assets.textBox.fireText = ShootingGame.assets.textBox.createTextContainer('FIRE !!!', 20, 120);
    ShootingGame.assets.textBox.deadText = ShootingGame.assets.textBox.createTextContainer('You are dead !', 15, 155);

    // Create entities
    var cowboy = new ShootingGame.entity.Enemy(2.5);
    cowboy.standing = setTimeout(function() { cowboy.changeState('standing'); }, cowboy.walkingTime);
    cowboy.shooting = setTimeout(function() { cowboy.changeState('shooting'); }, cowboy.shootDelay + cowboy.walkingTime);
    cowboy.winning = setTimeout(function() { cowboy.changeState('winning'); }, cowboy.reactionTime + cowboy.shootDelay + cowboy.walkingTime);
    ShootingGame.entity.cowboy = cowboy;

    ShootingGame.entity.crossHair = new createjs.Bitmap(queue.getResult("crossHair"));
    ShootingGame.entity.crossHair.dx = 5;
    ShootingGame.entity.crossHair.dy = 5;

    ShootingGame.entity.crossHair.update = function() {
        ShootingGame.entity.crossHair.crossHair.x = ShootingGame.entity.crossHair.crossHair.x + ShootingGame.entity.crossHair.dx;
        ShootingGame.entity.crossHair.crossHair.y = ShootingGame.entity.crossHair.crossHair.y + ShootingGame.entity.crossHair.dy;
    };

    //Add ticker
    createjs.Ticker.setFPS(45);
    createjs.Ticker.addEventListener('tick', stage);
    createjs.Ticker.addEventListener('tick', ShootingGame.tickEvent);

    window.onkeydown = ShootingGame.keyHandle.handleKeyDown;
    window.onkeyup = ShootingGame.keyHandle.handleKeyUp;
};

ShootingGame.tickEvent = function(event) {
    var timeFromLastUpdate = event.delta;
    ShootingGame.entity.cowboy.update(timeFromLastUpdate);
    ShootingGame.entity.crossHair.update();
};

ShootingGame.entity.Enemy = (function() {
  
    function Enemy(minimumReactionTime) {
        var stage = ShootingGame.stage;
    
        this.shootDelay = (Math.random() * 2 + 3) * 1000;  
        this.reactionTime = (Math.random() * 2 + minimumReactionTime) * 1000;
        this.walkingTime = 3400;

        this.x = 50;
        this.y = 250;
        this.state = 'walking';

        // Text messages references
        this.fireText = ShootingGame.assets.textBox.fireText;
        this.deadText = ShootingGame.assets.textBox.deadText;
        
        // Animations references
        this.animationWalking = ShootingGame.assets.animations.animationWalking;
        this.animationWalking.x = this.x;
        this.animationWalking.y = this.y;
        stage.addChildAt(this.animationWalking, 1);

        this.standAnimation = ShootingGame.assets.animations.standAnimation;
        this.animationShooting = ShootingGame.assets.animations.animationShooting;
        this.animationWinning = ShootingGame.assets.animations.animationWinning;
        this.animationDead = ShootingGame.assets.animations.animationDead;
    }

    Enemy.prototype.changeState = function(newState) {
        var stage = ShootingGame.stage;
        this.state = newState;

        switch(this.state) {
            case 'standing':
                stage.removeChild(this.animationWalking);
                this.standAnimation.x = this.x;
                this.standAnimation.y = this.y;
                stage.addChild(this.standAnimation); break;

            case 'shooting':
                this.timer = new Date().getTime();
                stage.removeChild(this.standAnimation);

                var maxReactionText = new createjs.Text((this.reactionTime / 1000).toFixed(2).toString(), '24px Monotype Corsiva', '#000');
                maxReactionText.x = 640;
                maxReactionText.y = 280;

                stage.addChild(this.fireText);
                stage.addChild(maxReactionText);

                this.animationShooting.x = this.x;
                this.animationShooting.y = this.y;
                stage.addChild(this.animationShooting);

                ShootingGame.entity.setCrossHairPosition();
                stage.addChild(ShootingGame.entity.crossHair); break;

            case 'winning':
                createjs.Sound.play("shot");
                setTimeout(function() { createjs.Sound.play("shot"); }, 1500);
                setTimeout(function() { createjs.Sound.play("shot"); }, 2500);
                setTimeout(function() { createjs.Sound.play("shot"); }, 4000);

                stage.removeChild(this.fireText);
                stage.removeChild(ShootingGame.entity.crossHair);
                stage.removeChild(this.animationShooting);

                stage.addChild(this.deadText);
                this.animationWinning.x = this.x;
                this.animationWinning.y = this.y;
                stage.addChild(this.animationWinning); break;

            case 'dead':
                stage.removeChild(this.fireText);
                stage.removeChild(this.animationShooting);
                stage.removeChild(ShootingGame.entity.crossHair);

                var reactionText = new createjs.Text('Your reaction: ' + ((new Date().getTime() - this.timer) / 1000).toFixed(2).toString(), '24px Monotype Corsiva', '#000');
                reactionText.x = 513;
                reactionText.y = 310;
                stage.addChild(reactionText);

                this.animationDead.x = this.x;
                this.animationDead.y = this.y;
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

ShootingGame.entity.setCrossHairPosition = function() {
    var crossHair = ShootingGame.entity.crossHair;
    var side = Math.round(Math.random());

    var leftBound = side === 0 ? 0 : 0.8 * ShootingGame.constants.WIDTH; 
    var rightBound = side === 0 ? 0.2 * ShootingGame.constants.WIDTH : ShootingGame.constants.WIDTH;

    crossHair.x = Math.random() * (rightBound - leftBound) + leftBound - 45;
    crossHair.y = Math.random() * ShootingGame.constants.HEIGHT - 45;
};

ShootingGame.keyHandle.handleKeyUp = function(e) {
    var keyMap = ShootingGame.keyHandle.map;

    if (e.keyCode in keyMap) {
        keyMap[e.keyCode] = false;
    }
};

ShootingGame.keyHandle.handleKeyDown = function(e) {
    var stage = ShootingGame.stage;
    var crossHair = ShootingGame.entity.crossHair;
    var keyMap = ShootingGame.keyHandle.map;

    keyMap[e.keyCode] = true;

    if(keyMap[65]) {
        crossHair.x -= 10;
    }
    if(keyMap[68]) {
        crossHair.x += 10;
    }
    if(keyMap[87]) {
        crossHair.y -= 10;
    }
    if(keyMap[83]) {
        crossHair.y += 10;
    }
    if(keyMap[77]) {
        var shotX = crossHair.x + 45;
        var shotY = crossHair.y + 45;
        var cowboy = ShootingGame.entity.cowboy;

        if(cowboy.getState() !== 'shooting' && cowboy.getState() !== 'dead' && cowboy.getState() !== 'winning') {
            console.log('not all');
            var text = new createjs.Text('You are not allowed to shoot !', '36px Arial', '#FFF');
            text.x = 200;
            text.y = 50;
            stage.addChild(text);
            setTimeout(function() {stage.removeChild(text);}, 1500);

        }else if(shotX >= cowboy.getX()- 25 - 20 && shotX <= cowboy.getX() - 25 + 10 && shotY <= cowboy.getY() + 40 && shotY >= cowboy.getY() - 35 && cowboy.getState() !== 'winning') {
            cowboy.changeState('dead');
            clearTimeout(cowboy.winning);

            var textWin = new createjs.Text('You win !', '36px Monotype Corsiva', '#FFF');
            textWin.x = 275;
            textWin.y = 20;
            stage.addChild(textWin);

            createjs.Sound.play('shot');
        }else if(cowboy.getState() !== 'winning'){
            createjs.Sound.play('shot');
        }
    }
};

ShootingGame.assets.textBox.createTextContainer = function(textInput, whiteSpace, width) {
    container = new createjs.Container(); 

    var g = new createjs.Graphics(); 
    g.setStrokeStyle(2); g.beginStroke(createjs.Graphics.getRGB(0, 0, 0)); g.beginFill(createjs.Graphics.getRGB(255, 255, 255)); g.drawRoundRect(0, 0, width, 40, 20);
    var s = new createjs.Shape(g);

    var text = new createjs.Text(textInput, '24px Monotype Corsiva', '#000');
    text.x = whiteSpace;
    text.y = 10;
    
    container.addChild(s);
    container.addChild(text);
    container.x = 250;
    container.y = 135;

    return container;
};
