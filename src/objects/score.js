export class Score extends Phaser.GameObjects.Container {
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
        
        this.x = dimensions.leftOffset + this.frame.displayWidth/2 + 10;
        this.y = dimensions.topOffset + this.frame.displayHeight/2 + 10;

    }

    init() {
        this.currentScore = 0;
        this.frame = this.scene.add.sprite(0,0,"roundFrame");
        this.frame.setOrigin(0.5);
        this.add(this.frame);
        
        this.score = this.scene.add.text(0,-20, "SCORE", {
            font: 'Bold 24px Arial',
            fill: '#000000'
        }).setOrigin(0.5, 0.5);
        this.add(this.score);

        this.scoreTxt = this.scene.add.text(0,20, this.currentScore, {
            font: 'Bold 34px Arial',
            fill: '#000000'
        }).setOrigin(0.5, 0.5);
        this.add(this.scoreTxt);
    }

    resetScore(){
        this.currentScore = 0;
        this.scoreTxt.text = this.currentScore;
    }

    updateScore(){
        this.currentScore +=1;
        this.scoreTxt.text = this.currentScore;

        if(this.currentScore%10 == 0){
            this.scene.gamePlay.currentSpeed +=.3;
                if (this.scene.gamePlay.currentSpeed > 7){
                    this.scene.gamePlay.currentSpeed = 7;
                }
                this.scene.gamePlay.speed = this.scene.gamePlay.currentSpeed;
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
                this.resetScore();
            }
        });
    }
}