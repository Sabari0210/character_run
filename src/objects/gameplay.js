export class GamePlay extends Phaser.GameObjects.Container {
    constructor(scene, x, y, gameScene,dimension) {
        super(scene);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.gameScene = gameScene;
        this.dimension = dimension;
        this.scene.add.existing(this);
        this.score = 0
        this.init();
    }

    adjust() {

        if(!this.scene.positioned)return;
        let dimensions = this.dimension;
        
        this.x = dimensions.gameWidth / 2;
        this.y = dimensions.gameHeight/2;

        this.touchSpace.displayWidth = dimensions.actualWidth;
        this.touchSpace.displayHeight = dimensions.actualHeight;
    }

    init() {

        this.playerCollision = this.scene.matter.world.nextGroup(true);
        this.wallCollision = this.scene.matter.world.nextGroup(true);
        this.stoneCollision = this.scene.matter.world.nextGroup(true);

        this.touchSpace = this.scene.add.sprite(0,0,"whiteFrame");
        this.touchSpace.setOrigin(.5);
        this.touchSpace.alpha = .00001;
        this.speed = 3;
        this.currentSpeed = this.speed;
        this.addLayer();

        this.addTree();
        this.addCloud();
        this.addObstacles();

        this.addPlayer();
        this.playerStatus = "run";

        this.scene.matter.world.on('collisionactive', (event) => {
            event.pairs.forEach((pair) => {
                this.checkPair(pair);
            });
        });
        
        this.scene.matter.world.on('collisionend', (event) => {
            event.pairs.forEach((pair) => {
             });
        });

        // this.scoreTxt = this.scene.add.text(this.barFrame.displayWidth/2 - 40,-70, this.score + " / 10", {
        //     font: '24px Arial',
        //     fill: '#000000'
        // }).setOrigin(0.5, 0.5);
        // this.add(this.scoreTxt);

        // this.visible = false;
        this.add(this.touchSpace);

        this.touchSpace.setInteractive();
        this.touchSpace.on("pointerup", this.onDown, this);

        setTimeout(() => {
            this.startGame();
        }, 1000);

    }

    startGame(){
        this.gameStarted = true;
        this.player.play("run");

        this.updateSpeed();
    }
    
    updateSpeed(){
        if(this.speedTimeInterval)this.speedTimeInterval.remove();

        this.speedTimeInterval = this.scene.time.addEvent({
            delay: 10000, // Runs every 5 seconds
            callback: () => {
                this.currentSpeed += 1;
                if (this.currentSpeed > 7){
                    this.currentSpeed = 7;
                    if(this.speedTimeInterval)this.speedTimeInterval.remove();
                }
                this.speed = this.currentSpeed;
            },
            callbackScope: this, // Ensures 'this' refers to the correct object
            loop: true // Keeps running indefinitely
        });
    }

    addCloud(){

        this.cloudArr = [];
        let startX = -300;
        for(let i=0;i<8;i++){
            let cloud = this.scene.add.sprite(startX,Phaser.Math.Between(-150,-250),"cloud"+Phaser.Math.Between(1,3));
            cloud.setOrigin(.5);
            this.add(cloud);
            cloud.alpha = .5;
            let randomValue = Phaser.Math.FloatBetween(0.4, 1);
            randomValue = Math.round(randomValue * 10) / 10; // Round to 1 decimal place
            cloud.setScale(randomValue);

            this.cloudArr.push(cloud);

            startX += cloud.displayWidth + Phaser.Math.Between(100,200)
        }
    }

    checkPair(pair){
        if(!pair.bodyB || !pair.bodyA)return
        if(!pair.bodyB.gameObject)return
        if(!pair.bodyA.gameObject)return

        let pointA = pair.bodyA.gameObject;
        let pointB = pair.bodyB.gameObject;

        if(((pointA.isWall && pointB.isPlayer) || (pointB.isWall && pointA.isPlayer)) && this.playerStatus != "run" ){
            this.player.stop("jump");
            this.player.play("run");
            this.playerStatus = "run"; 
            this.speed = this.currentSpeed;
        }

        if(((pointA.ishit && pointB.isPlayer) || (pointB.ishit && pointA.isPlayer))){
            this.gameStarted = false;
            this.player.stop("run");
            this.player.play("dead");
            this.scene.matter.world.remove(this.player.graphics.body);
            this.player.graphics.destroy();
        }
    }

    onDown(){
        if(!this.gameStarted)return;
        if(this.playerStatus == "jump")return;
        this.player.stop("run");
        this.playerStatus = "jump";
        this.player.play("jump");
        this.player.graphics.setVelocity(0, -10)
        if(this.currentSpeed < 5)
            this.speed = this.currentSpeed+1;
    

    }

    addPlayer(){
        this.player = this.scene.add.sprite(-200,30,"run/1");
        this.player.setOrigin(.5);
        this.player.setScale(.2);
        this.addAnimation("run",8,this.speed*2,-1);
        this.addAnimation("jump",10,8,0);
        this.addAnimation("idle",10,8,0);
        this.addAnimation("dead",10,13,0);
        this.player.play("idle");

        let playerGraphics = this.scene.matter.add.sprite(-200,30,"whiteFrame").setCollisionCategory(this.playerCollision).setCollidesWith(this.wallCollision,this.stoneCollision);
        playerGraphics.setOrigin(.5);
        // playerGraphics.alpha = 0;
        playerGraphics.displayWidth = this.player.displayWidth/2;
        playerGraphics.displayHeight = this.player.displayHeight;
        this.add(playerGraphics);
        this.add(this.player);
        playerGraphics.player = this.player;
        this.player.graphics = playerGraphics;
        playerGraphics.isPlayer = true;

    }

    addLayer(){
        let startX = -400;
        this.layerArr = [];
        for(let i=0;i<4;i++){
            let layer = this.scene.add.sprite(startX, 100, 'layer')//.setStatic(true).setCollisionCategory(this.wallCollision).setCollidesWith(this.playerCollision,this.stoneCollision);
            layer.setOrigin(0.5);
            if(i%2 != 0){
                layer.setScale(-1,1);
            }
            this.add(layer);
            this.layerArr.push(layer);

            let layerGraphics = this.scene.matter.add.sprite(startX, 117, 'whiteFrame');
            layerGraphics.displayWidth = layer.displayWidth;
            layerGraphics.displayHeight = layer.displayHeight;
            layerGraphics.setStatic(true).setCollisionCategory(this.wallCollision).setCollidesWith(this.playerCollision,this.stoneCollision);
            layerGraphics.setOrigin(0.5);
            this.add(layerGraphics);
            layerGraphics.visible = false;
            layerGraphics.isWall = true;
            layer.graphics = layerGraphics;
            layerGraphics.layer = layer;
            startX += layer.displayWidth - 5;
        }
    }

    addAnimation(anim,len,speed,loop){
        if (this.scene.anims.exists(anim)) {
            this.scene.anims.remove(anim);
        }

        this.scene.anims.create({
            key: anim,
            frames: Array.from({ length: len }, (_, i) => ({ key: anim + "/" + `${i + 1}` })), 
            frameRate: speed, // Adjust speed
            repeat: loop // Loop indefinitely
        });
    }

    addTree(){
        let startX = -500;
        this.treeArr = [];
        let arr = [1,2,3,4,5,6,7,8,9];
        arr = Phaser.Utils.Array.Shuffle(arr);
        for(let i=0;i<9;i++){
            let tree = this.scene.add.sprite(startX, 80, "tree_" + arr[i]);
            tree.setOrigin(0.5,1);
            this.add(tree);
            this.treeArr.push(tree);
            startX += Phaser.Math.Between(400,700);
        }
    }

    addObstacles(){
        let startX = 200;
        this.obstacleArr = [];
        let arr = [1,2,3,4,5,6,7,8];
        arr = Phaser.Utils.Array.Shuffle(arr)
        for(let i=0;i<8;i++){
            let tree = this.scene.matter.add.sprite(startX, 85, "obs_"+arr[i]).setStatic(true).setCollisionCategory(this.stoneCollision).setCollidesWith(this.playerCollision,this.wallCollision);
            tree.setOrigin(0.5,1);
            tree.setScale(0.3);
            tree.ishit = true;
            this.add(tree);
            this.obstacleArr.push(tree);
            startX += Phaser.Math.Between(600,1000);
        }
    }

    show(score) {
        this.incrementBar(score);
        if (this.visible) return
        this.visible = true;
        this.alpha = 0;
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            ease: "linear",
            duration: 200,
            onComplete:()=>{
                
            }
        })
    }

    hide(){
        if(!this.visible)return;
        this.scene.tweens.add({
            targets: this,
            alpha:0,
            duration: 200,        // Smooth duration in milliseconds
            ease: 'Power0', // Easing for smoothness
            onComplete:()=>{
                this.alpha = 0;
                this.visible = false;
            }
        });
    }

    update() {
        if(!this.gameStarted)return
        this.x -=this.speed;
        this.player.graphics.x +=this.speed;
        this.touchSpace.x +=this.speed;
        this.player.x = this.player.graphics.x;
        this.player.y = this.player.graphics.y;
        
        for(let i=0;i<this.layerArr.length;i++){
            if(((this.layerArr[i].x + this.x)  + this.layerArr[i].displayWidth/2 + 100) < ((this.dimension.leftOffset))){
                let element = this.layerArr.shift();
                element.x = this.layerArr[this.layerArr.length-1].x + element.displayWidth - 5;
                element.graphics.x = element.x;
                this.layerArr.push(element);
            }
        }

        for(let i=0;i<this.cloudArr.length;i++){
            if(((this.cloudArr[i].x + this.x)  + this.cloudArr[i].displayWidth/2 + 100) < ((this.dimension.leftOffset))){
                let element = this.cloudArr.shift();
                element.x = this.cloudArr[this.cloudArr.length-1].x + this.cloudArr[this.cloudArr.length-1].displayWidth + Phaser.Math.Between(100,200);
                this.cloudArr.push(element);
            }
        }

        for(let i=0;i<this.treeArr.length;i++){
            if(((this.treeArr[i].x + this.x)  + this.treeArr[i].displayWidth/2 + 100) < ((this.dimension.leftOffset))){
                let element = this.treeArr.shift();
                element.x = this.treeArr[this.treeArr.length-1].x + Phaser.Math.Between(400,700);
                this.treeArr.push(element);
            }
        }

        for(let i=0;i<this.obstacleArr.length;i++){
            if(((this.obstacleArr[i].x + this.x)  + this.obstacleArr[i].displayWidth/2 + 100) < ((this.dimension.leftOffset))){
                let element = this.obstacleArr.shift();
                element.x = this.obstacleArr[this.obstacleArr.length-1].x + Phaser.Math.Between(500,800);
                this.obstacleArr.push(element);
            }
        }
    }
}