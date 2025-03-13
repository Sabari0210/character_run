export class Water extends Phaser.GameObjects.Container {
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
        this.y = dimensions.bottomOffset - 50;

    }

    init() {

        this.waterArr = [];
        this.waterArr1 = [];
        let startX = -700
        for(let i=0;i<20;i++){
            // let water = this.scene.add.sprite(startX,30,"water");
            // water.setOrigin(.5);
            // water.alpha = .8;
            // this.add(water);
            // this.waterArr1.push(water);

            let water = this.scene.add.sprite(startX,30,"water");
            water.setOrigin(.5);
            water.alpha = .8;
            this.add(water);
            this.waterArr.push(water);

           

            startX += water.displayWidth - 1;
        }

        for(let i=0;i<this.waterArr.length;i++){
            let water = this.waterArr[i];
            setTimeout(() => {
                this.scene.tweens.add({
                    targets: water,
                    y: water.y - 3,
                    x: water.x + 3,
                    ease: "Power1",
                    duration: 500,
                    yoyo:true,
                    repeat:-1,
                    onComplete:()=>{
                    }
                })
            }, 50*i);
        }

        // for(let i=0;i<this.waterArr1.length;i++){
        //     let water = this.waterArr1[i];
        //     setTimeout(() => {
        //         this.scene.tweens.add({
        //             targets: water,
        //             y: water.y - 50,
        //             x: water.x + 3,
        //             ease: "linear",
        //             duration: 1000,
        //             yoyo:true,
        //             repeat:-1,
        //             onComplete:()=>{
        //             }
        //         })
        //     }, 20*i);
        // }

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
            }
        });
    }
}