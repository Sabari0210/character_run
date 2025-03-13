export class EndCard extends Phaser.GameObjects.Container {
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
        
        this.x = dimensions.gameWidth/2;
        this.y = dimensions.gameHeight/2;

        this.frame.displayWidth = dimensions.actualWidth;
        this.frame.displayHeight = dimensions.actualHeight;
        // this.frame.x = this.x;
        // this.frame.y = this.y;

    }

    init() {
        this.currentScore = 0;
        this.highScore = 50;
        this.frame = this.scene.add.sprite(0,0,"whiteFrame");
        this.frame.setOrigin(0.5);
        this.add(this.frame);
        
        this.score = this.scene.add.text(0,-100, "GAME OVER", {
            font: 'bold 64px Arial',
            fill: '#bd2015'
        }).setOrigin(0.5, 0.5);
        this.add(this.score);

        this.scoreTxt = this.scene.add.text(-200,20, "CURRENT SCORE : "+ this.currentScore, {
            font: 'Bold 34px Arial',
            fill: '#000000'
        }).setOrigin(0.5, 0.5);
        this.add(this.scoreTxt);

        this.highScoreTxt = this.scene.add.text(200,20, "HIGH SCORE : "+ this.highScore, {
            font: 'Bold 34px Arial',
            fill: '#000000'
        }).setOrigin(0.5, 0.5);
        this.add(this.highScoreTxt);

        this.retryButton = this.scene.add.sprite(0,150,"retry");
        this.retryButton.setOrigin(.5);
        this.retryButton.setScale(.4);
        this.add(this.retryButton);

        this.retryButton.on('pointerup', function (pointer){
            this.onClick(pointer,this.retryButton);
        }.bind(this));

        this.visible  = false;
        // this.show();
    }

    onClick(pointer,icon){
        this.retryButton.disableInteractive();
        if(this.retryBtn_tween)this.retryBtn_tween.stop();
        this.retryButton.setScale(.4);
        this.scene.tweens.add({
            targets: [this.retryButton],
            scale: (this.retryButton.scaleX - .1),
            ease: "linear",
            duration: 100,
            yoyo:true,
            onComplete:()=>{
                this.hide();
            }
        })
    }

    show() {
        if (this.visible) return
        this.currentScore = this.scene.score.currentScore;
        this.scoreTxt.text = "CURRENT SCORE : "+ this.currentScore;
        this.visible = true;
        this.alpha = 0;
        this.score.alpha = 0;
        this.scoreTxt.alpha = 0;
        this.highScoreTxt.alpha = 0;
        this.retryButton.alpha = 0;
        this.score.setScale(2);
        this.scoreTxt.x = -400;
        this.highScoreTxt.x = 400;
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            ease: "linear",
            duration: 200,
            onComplete:()=>{
                this.scene.tweens.add({
                    targets: this.score,
                    scale: 1,
                    alpha: 1,
                    ease: "Power2",
                    duration: 200,
                    onComplete:()=>{
                        this.scene.tweens.add({
                            targets: this.scoreTxt,
                            x: -200,
                            alpha: 1,
                            ease: "Power4",
                            duration: 200,
                            onComplete:()=>{
                                
                            }
                        })

                        this.scene.tweens.add({
                            targets: this.highScoreTxt,
                            x: 200,
                            alpha: 1,
                            ease: "Power4",
                            duration: 200,
                            onComplete:()=>{
                                this.scene.tweens.add({
                                    targets: this.retryButton,
                                    alpha: 1,
                                    ease: "Power0",
                                    duration: 200,
                                    onComplete:()=>{
                                        this.retryButton.setInteractive();
                                        this.retryBtn_tween = this.scene.tweens.add({
                                            targets: this.retryButton,
                                            scale: {
                                                from: .4,
                                                to: .5,
                                            },
                                            duration: 300,
                                            ease: "Power2",
                                            yoyo:true,
                                            repeat:-1,
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
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
                this.scene.restartGame();
            }
        });
    }
}