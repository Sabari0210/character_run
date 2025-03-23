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
        console.log("adjust")
        if(!this.scene.positioned)return;
        if(this.adjustPositioned)return;

        let dimensions = this.dimension;
        
        this.x = dimensions.gameWidth / 2;
        this.y = dimensions.gameHeight/2;

        this.touchSpace.displayWidth = dimensions.actualWidth;
        this.touchSpace.displayHeight = dimensions.actualHeight;
    }

    init() {

        this.adjustPositioned = false;
        this.playerCollision = this.scene.matter.world.nextGroup(true);
        this.coinCollision = this.scene.matter.world.nextGroup(true);
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
        this.addCoin();
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

        this.add(this.touchSpace);

        this.touchSpace.setInteractive();
        this.touchSpace.on("pointerup", this.onDown, this);

        // setTimeout(() => {
        //     this.startGame();
        // }, 1000);

        this.visible = false;

    }

    destroyBodies(){
        // this.scene.matter.world.remove(element);
        this.layerArr.forEach(element => {
            if(element.graphics){
                this.scene.matter.world.remove(element);
                // console.log("flkjflkjflkjl")
            }
        })

        this.coinArr.forEach(element => {
            if(element){
                this.scene.matter.world.remove(element);
                // console.log("flkjflkjflkjl")
            }
        })

        this.obstacleArr.forEach(element => {
            if(element){
                this.scene.matter.world.remove(element);
                // console.log("flkjflkjflkjl")
            }
        })

        this.scene.matter.world.remove(this.player.graphics);
        this.scene.matter.world.off('collisionactive');

    }

    disableBody(part) {
        const body = part.body; // Get the Matter body
    
        if (body && body.parts) {
            body.parts.forEach((part) => {
                part.isSensor = true; // Make each part a sensor (no collisions)
            });
        }
    }

    addCoin(){
        this.coinArr = [];

        let startX = 150;
        for(let i=0;i<15;i++){
            let coin = this.scene.matter.add.sprite(startX,Phaser.Math.Between(-100,0),"star").setStatic(true).setCollisionCategory(this.coinCollision).setCollidesWith(this.playerCollision);
            coin.setOrigin(.5);
            coin.setScale(.1);
            this.add(coin);
            coin.isCoin = true;
            this.coinArr.push(coin);
            startX += (coin.displayWidth + Phaser.Math.Between(20,300))
            this.disableBody(coin);
        }
    }

    startGame(){
        this.gameStarted = true;
        this.player.play("run");
        this.adjustPositioned = true;
        // this.updateSpeed();
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

        if(pointA.isPlayer && pointB.isCoin){
            this.collectCoin(pointB);
        }else if(pointB.isPlayer && pointA.isCoin){
            this.collectCoin(pointA);
        }

        if(((pointA.isWall && pointB.isPlayer) || (pointB.isWall && pointA.isPlayer)) && this.playerStatus != "run" ){
            this.player.stop("jump");//double_jumb
            this.player.stop("double_jumb");//double_jumb
            this.player.play("run");
            this.playerStatus = "run"; 
            this.speed = this.currentSpeed;
        }

        if((((pointA.ishit && pointB.isPlayer) && (pointA.x>(pointB.x-pointB.displayWidth/2))) || ((pointB.ishit && pointA.isPlayer) && (pointB.x>(pointA.x-pointA.displayWidth/2))) )){
            this.gameFail();
        }
    }

    gameFail(){
        if(!this.gameStarted)return;
        this.gameStarted = false;
        this.player.stop("run");
        this.player.play("dead");
        this.scene.matter.world.remove(this.player.graphics.body);
        this.player.graphics.destroy();
        this.scene.playSound('fail', { volume: .3 });
        this.scene.playerData.addedscore();
        setTimeout(() => {
            this.scene.showEndCard();
        }, 1000);
    }

    collectCoin(coin){
        if(coin.alpha == 0)return;
        this.scene.playSound('coin', { volume: .3 });
        coin.alpha = 0;
        this.scene.score.updateScore();
    }

    onDown(){
        if(!this.gameStarted)return;
        if(this.playerStatus == "double_jumb")return

        this.scene.playSound('jump', { volume: .1 });

        if(this.playerStatus == "jump"){
            this.playerStatus = "double_jumb";
            this.player.stop("jump");
            this.player.play("double_jumb");
            this.player.graphics.setVelocity(0, -7);
            return;
        }
        this.player.stop("run");
        this.playerStatus = "jump";
        this.player.play("jump");
        this.player.graphics.setVelocity(0, -10);
        // if(this.currentSpeed < 5)
        //     this.speed = this.currentSpeed+1;
    

    }

    addPlayer(){
        this.player = this.scene.add.sprite(-200,30,"run/1");
        this.player.setOrigin(.5);
        this.player.setScale(.2);
        this.addAnimation("run",8,this.speed*2,-1);
        this.addAnimation("jump",10,8,0);
        this.addAnimation("double_jumb",9,8,0);
        this.addAnimation("idle",10,8,0);
        this.addAnimation("dead",10,16,0);
        this.player.play("idle");

        let playerGraphics = this.scene.matter.add.sprite(-200,40,"whiteFrame").setCollisionCategory(this.playerCollision).setCollidesWith(this.wallCollision,this.stoneCollision,this.coinCollision);
        playerGraphics.setOrigin(.5);
        playerGraphics.alpha = 0;
        playerGraphics.displayWidth = this.player.displayWidth/2;
        playerGraphics.displayHeight = this.player.displayHeight - 20;
        this.add(playerGraphics);
        playerGraphics.setFixedRotation(true); // Adjust speed as needed
        this.add(this.player);
        playerGraphics.player = this.player;
        this.player.graphics = playerGraphics;
        playerGraphics.isPlayer = true;

    }

    addLayer(){
        let startX = -500;
        this.layerArr = [];
        for(let i=0;i<4;i++){
            let layer = this.scene.add.sprite(startX, 100, 'layer')//.setStatic(true).setCollisionCategory(this.wallCollision).setCollidesWith(this.playerCollision,this.stoneCollision);
            layer.setOrigin(0.5);
            if(i%2 != 0){
                layer.setScale(-1,1);
            }
            this.add(layer);
            this.layerArr.push(layer);

            let layerGraphics = this.scene.matter.add.sprite(startX, 110, 'whiteFrame');
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
        if (this.visible) return
        this.visible = true;
        this.alpha = 0;
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            ease: "linear",
            duration: 200,
            onComplete:()=>{
                this.startGame();
            }
        })
    }

    hide(){
        if(!this.visible)return;
        this.destroyBodies();
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

        for(let i=0;i<this.coinArr.length;i++){
            if(((this.coinArr[i].x + this.x)  + this.coinArr[i].displayWidth/2 + 100) < ((this.dimension.leftOffset))){
                let element = this.coinArr.shift();
                element.x = this.coinArr[this.coinArr.length-1].x + this.coinArr[this.coinArr.length-1].displayWidth + Phaser.Math.Between(20,300);
                this.coinArr.push(element);
                element.alpha = 1;
            }
        }
    }
}