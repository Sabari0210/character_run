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
        this.load.image('gamelogo', 'assets/gamelogo.png');
        
        
        this.load.once('complete', () => {
            this.loadAssets();
            this.load.start();
        })    
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
    }

    loadImage(){
        this.load.image('background', 'assets/bg.png');
        this.load.image('cloud1', 'assets/cloud1.png');
        this.load.image('cloud2', 'assets/cloud2.png');
        this.load.image('cloud3', 'assets/cloud3.png');
        this.load.image('layer', 'assets/layer.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('water', 'assets/water.png');
        this.load.image('retry', 'assets/retry.png');
        this.load.image('logo', 'assets/logo.png');

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

        for (let i = 2; i <= 10; i++) {
            this.load.image(`double_jumb/${i-1}`, `assets/robo/double/${i}.png`);
        }

        for (let i = 1; i <= 10; i++) {
            this.load.image(`dead/${i}`, `assets/robo/dead/${i}.png`);
        }

        for (let i = 1; i <= 10; i++) {
            this.load.image(`idle/${i}`, `assets/robo/idle/${i}.png`);
        }
    }

    loadSound(){
        this.load.audio('bgm', 'sounds/bgm.mp3');
        this.load.audio('click', 'sounds/click.mp3');
        this.load.audio('coin', 'sounds/coin.mp3');
        this.load.audio('fail', 'sounds/fail.mp3');
        this.load.audio('jump', 'sounds/jump.mp3');
    }

    loadAssets(){
        let width = this.cameras.main.width;
        let height = this.cameras.main.height;        

        // Create a graphics object for the progress bar
        // let loadingScreen = this.add.image(width / 2, height / 2, "loading...");
        // loadingScreen.setOrigin(0.5, 0.5);

        let logo = this.add.image(width / 2, height / 2 - 40, "gamelogo");
        logo.setOrigin(0.5, 0.5);
        logo.setScale(0.3);

        let progressBox = this.add.graphics();
        let progressBar = this.add.graphics();

        // Draw a background rectangle for the progress box
        progressBox.fillStyle(0x222222, 1);
        progressBox.fillRect(width/2 - 245, height - 165, 510, 40,15);

        // // Calculate scale factors for both dimensions
        // let scaleX = width / loadingScreen.width;
        // let scaleY = height / loadingScreen.height;
        
        // Choose the larger scale to ensure the image covers the entire screen
        // let scale = Math.max(scaleX, scaleY);
        
        // // Apply the scale
        // loadingScreen.setScale(scale);
        
        // // Optional: Center the image again (should already be centered by setOrigin)
        // loadingScreen.setPosition(width / 2, height / 2);

        // Loading text
        let loadingText = this.add.text(width / 2, height - 60, 'Loading...', {
            font: '40px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5);

        // Progress percentage text
        let percentText = this.add.text(width / 2, height - 145, '0%', {
            font: '28px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5);

        // Load assets and update progress bar
        this.load.on('progress', (value) => {
            let percentage = Math.floor(value * 100);
            if (percentage % 5 === 0) { // Update only every 5%
                percentText.setText(`${percentage}%`);
                progressBar.clear();
                progressBar.fillStyle(0xffffff, .5);
                progressBar.fillRect(width / 2 - 240, height  - 161, (500) * value, 32,15);
            }
        });

        // Clear graphics after loading is complete

            // Once all assets are loaded, transition to the Preloader scene
        this.load.once('complete', () => {
            this.loadImage();
            this.loadSound();
            this.load.start();
            this.load.once('complete', () => {
                progressBar.destroy();
                progressBox.destroy();
                loadingText.destroy();
                percentText.destroy();
                WebFont.load({
                    custom: {
                        families: ["Playground", "Starborn","debussy"]
                    },
                    active: () => {
                       
                        console.log("Fonts Loaded!");
                        this.scene.start('Preloader'); 
                        // this.createText(); // Call a function to add text after fonts load
                    }
                });
            });
        });

    }

    create ()
    {
        // this.scene.start('Preloader');        
    }
}
