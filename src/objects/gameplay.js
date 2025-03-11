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
    }

    init() {

        this.addLayer();

        this.addTree();
        this.addObstacles();

        // this.barValue = 10;
        // this.currentVal = 0;
        // this.barFrame = this.scene.add.sprite(0,-50, "icons/scroll-bar");
        // this.barFrame.setOrigin(.5);
        // this.barFrame.setScale(.34);
        // this.add(this.barFrame);

        // this.emptyBar = this.scene.add.sprite(0,-50, "icons/scroll-bar");
        // this.emptyBar.setOrigin(.5);
        // this.emptyBar.setScale(.34);
        // this.add(this.emptyBar);

        // this.fillBar = this.scene.add.sprite(0, -50, "icons/scroll-bar-fill");
        // this.fillBar.setOrigin(.5);
        // this.fillBar.setScale(.34);
        // this.add(this.fillBar);
        // this.fillBar.orgWidth = this.fillBar.width;

        // this.scoreTxt = this.scene.add.text(this.barFrame.displayWidth/2 - 40,-70, this.score + " / 10", {
        //     font: '24px Arial',
        //     fill: '#000000'
        // }).setOrigin(0.5, 0.5);
        // this.add(this.scoreTxt);

        // this.visible = false;
    }

    addLayer(){
        let startX = -400;

        for(let i=0;i<5;i++){
            let layer = this.scene.add.sprite(startX, 100, 'layer');
            layer.setOrigin(0.5);
            if(i%2 != 0){
                layer.setScale(-1,1);
            }
            this.add(layer);
            startX += layer.displayWidth - 5;
        }
    }

    addTree(){
        let startX = -500;

        let treeArr = ["tree1","tree2","tree"]
        for(let i=0;i<6;i++){
            let tree = this.scene.add.sprite(startX, 75, treeArr[Phaser.Math.Between(0,treeArr.length-1)]);
            tree.setOrigin(0.5,1);
            this.add(tree);
            startX += 500;
        }
    }

    addObstacles(){
        let startX = 300;

        let treeArr = ["stone1","stone2","stone3"]
        for(let i=0;i<6;i++){
            let tree = this.scene.add.sprite(startX, 85, treeArr[Phaser.Math.Between(0,treeArr.length-1)]);
            tree.setOrigin(0.5,1);
            tree.setScale(0.3);
            this.add(tree);
            startX += Phaser.Math.Between(500,1000);
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
        // this.x -=2;
    }
}