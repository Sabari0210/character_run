import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    init(){

    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', 'assets/bg.png');
        this.load.image('cloud1', 'assets/cloud1.png');
        this.load.image('cloud2', 'assets/cloud2.png');
        this.load.image('cloud3', 'assets/cloud3.png');
        this.load.image('layer', 'assets/layer.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('water', 'assets/water.png');

        for (let i = 1; i <= 9; i++) {
            this.load.image(`tree_${i}`, `assets/tree_${i}.png`);
        }

        for (let i = 1; i <= 8; i++) {
            this.load.image(`obs_${i}`, `assets/obs_${i}.png`);
        }
        
        for (let i = 1; i <= 8; i++) {
            this.load.image(`run/${i}`, `assets/robo/run/${i}.png`);
        }

        for (let i = 1; i <= 10; i++) {
            this.load.image(`jump/${i}`, `assets/robo/jump/${i}.png`);
        }

        for (let i = 2; i <= 9; i++) {
            this.load.image(`double_jumb/${i-1}`, `assets/robo/double/${i}.png`);
        }

        for (let i = 1; i <= 10; i++) {
            this.load.image(`dead/${i}`, `assets/robo/dead/${i}.png`);
        }

        for (let i = 1; i <= 10; i++) {
            this.load.image(`idle/${i}`, `assets/robo/idle/${i}.png`);
        }
        
        this.load.audio('click', 'sounds/click.mp3');
    }

    create ()
    {
        this.scene.start('Preloader');        
    }
}
