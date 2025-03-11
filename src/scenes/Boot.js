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
        this.load.image('tree', 'assets/tree.png');
        this.load.image('tree1', 'assets/tree1.png');
        this.load.image('tree2', 'assets/tree2.png');
        this.load.image('tree3', 'assets/tree3.png');
        this.load.image('water', 'assets/water.png');
        this.load.image('stone1', 'assets/stone1.png');
        this.load.image('stone2', 'assets/stone2.png');
        this.load.image('stone3', 'assets/stone3.png');
        
        this.load.audio('click', 'sounds/click.mp3');
    }

    create ()
    {
        this.scene.start('Preloader');        
    }
}
