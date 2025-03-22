import { Scene } from 'phaser';
import portrait from '../data/portrait.js';
import landscape from '../data/landscape.js';
import { GamePlay } from '../objects/gameplay.js';
import { Water } from '../objects/water.js';
import { Score } from '../objects/score.js';
import { EndCard } from '../objects/endcard.js';
import { PlayerData } from '../objects/player-data.js';

let dimensions = { 
                }

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    preload() {
        this.scale.lockOrientation(this.game.orientation);
        // this.scale.lockOrientation('portrait');
        // this.scale.lockOrientation('landscape');

        let ratio = window.devicePixelRatio;
        dimensions.fullWidth = window.innerWidth * ratio;
        dimensions.fullHeight = window.innerHeight * ratio;
        // Check and adjust resolution for Portrait
        // if (dimensions.fullWidth > dimensions.fullHeight) {
        //     [dimensions.fullHeight, dimensions.fullWidth] = [dimensions.fullWidth, dimensions.fullHeight];
        // }
        // this.switchMode();

        // Check and adjust resolution for landscape
        // if (dimensions.fullWidth < dimensions.fullHeight) {
        //     [dimensions.fullWidth, dimensions.fullHeight] = [dimensions.fullHeight, dimensions.fullWidth];
        // }
        // this.switchMode();
       
        if (dimensions.isPortrait != dimensions.fullWidth < dimensions.fullHeight) {
            this.switchMode(!dimensions.isPortrait);
        } else {
            this.switchMode(dimensions.isPortrait);
        }

        this.scale.displaySize.setAspectRatio(dimensions.fullWidth / dimensions.fullHeight);
        this.scale.refresh();
    }

    switchMode(isPortrait) {

        console.log(isPortrait)
        dimensions.isPortrait = isPortrait;
        dimensions.isLandscape = !isPortrait;

        let mode = portrait;

        if (dimensions.isLandscape)
            mode = landscape;

        // for portrait
        // dimensions.isPortrait = true;
        // dimensions.isLandscape = false;
        // let mode = portrait;

        // for landscape
        // dimensions.isPortrait = false;
        // dimensions.isLandscape = true;
        // let mode = landscape;

        dimensions.gameWidth = mode.gameWidth;
        dimensions.gameHeight = mode.gameHeight;
    }

    gameResized() {
        try {
			if (`${PLATFORM}` !== "tiktok") {
				try {
					if (mraid) {
						var screenSize = mraid.getScreenSize();
						mraid.setResizeProperties({"width": screenSize.width, "height": screenSize.height, "offsetX": 0, "offsetY": 0});
						mraid.expand();
					}
				} catch (e) {

				}
			}
		}
		catch (e) {
			
		}        

        if (this.resizing) return;
        this.resizing = true; // Set a flag to indicate resizing is in progress

        try {
            let size;
            try {
                size = {
                    width: Math.ceil(window.innerWidth) * window.devicePixelRatio,
                    height: Math.ceil(window.innerHeight) * window.devicePixelRatio,
                };
            } catch (error) {
                console.error("Error getting screen size:", error);
                size = { width: 800, height: 600 }; // Fallback dimensions
            }

            dimensions.fullWidth = size.width;
            dimensions.fullHeight = size.height;

            // Force Portrait dimensions
            // if (dimensions.fullWidth > dimensions.fullHeight) {
            //     [dimensions.fullHeight, dimensions.fullWidth] = [dimensions.fullWidth, dimensions.fullHeight];
            // }

            // Force landscape dimensions
            // if (dimensions.fullWidth < dimensions.fullHeight) {
            //     [dimensions.fullWidth, dimensions.fullHeight] = [dimensions.fullHeight, dimensions.fullWidth];
            // }

            // this.switchMode();

            if (dimensions.isPortrait != dimensions.fullWidth < dimensions.fullHeight) {
                this.switchMode(!dimensions.isPortrait);
            } else {
                this.switchMode(dimensions.isPortrait);
            }
            this.game.scale.setGameSize(dimensions.fullWidth, dimensions.fullHeight);

            this.game.canvas.style.width = `${dimensions.fullWidth}px`;
            this.game.canvas.style.height = `${dimensions.fullHeight}px`;
            this.game.scale.updateBounds();
            this.game.scale.refresh();

            this.setGameScale();
            // this.checkOrientation();
            this.setPositions();
        } finally {
            // Clear the resizing flag
            this.resizing = false;
        }
    }

    setGameScale() {
        let scaleX = dimensions.fullWidth / dimensions.gameWidth;
        let scaleY = dimensions.fullHeight / dimensions.gameHeight;

        this.gameScale = (scaleX < scaleY) ? scaleX : scaleY;

        dimensions.actualWidth = this.game.canvas.width / this.gameScale;
        dimensions.actualHeight = this.game.canvas.height / this.gameScale;

        dimensions.leftOffset = -(dimensions.actualWidth - dimensions.gameWidth) / 2;
        dimensions.rightOffset = dimensions.gameWidth - dimensions.leftOffset;
        dimensions.topOffset = -(dimensions.actualHeight - dimensions.gameHeight) / 2;
        dimensions.bottomOffset = dimensions.gameHeight - dimensions.topOffset;

        this.positioned = true;
    }

    update(){
        super.update();
        this.gamePlay.update();
    }

    create ()
    {
        this.gameScale = 1;
        this.positioned = false;
        this.gameOver = false;

        // localStorage.clear();
        this.cameras.main.setBackgroundColor(0x00ff00);
        this.superGroup = this.add.container();
        this.gameGroup = this.add.container();
        this.superGroup.add(this.gameGroup);

        this.soundMuted = false;

        this.bg = this.add.image(0,0,"background");
        this.bg.setOrigin(0.5);
        this.gameGroup.add(this.bg);
        this.addGraphicsAssets();

        this.gamePlay = new GamePlay(this,0,0,this,dimensions);
        this.gameGroup.add(this.gamePlay);

        this.water = new Water(this,0,0,this,dimensions);
        this.gameGroup.add(this.water);

        this.score = new Score(this,0,0,this,dimensions);
        this.gameGroup.add(this.score);

        this.endCard = new EndCard(this,0,0,this,dimensions);
        this.gameGroup.add(this.endCard);

        this.playerData = new PlayerData(this,0,0,this,dimensions);
        this.gameGroup.add(this.playerData);

        this.logo = this.add.image(0,0,"logo");
        this.logo.setOrigin(.5);
        this.logo.setScale(.12);
        this.gameGroup.add(this.logo);

        this.phaser3 = this.add.text(30,0, "PHASER-3", {
            fontFamily: 'Playground', fontSize: 55, color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
            align: 'center'
        })
        this.phaser3.setOrigin(0.5);
        this.gameGroup.add(this.phaser3);
        this.phaser3.alpha = 0;

        this.bgm = this.sound.add('bgm', {
            loop: true,    // Loop the background music
            volume: 0.5    // Set volume to 50%
        });
    
        // Play the background music
        this.bgm.play();

        this.setPositions();
        try {
            dapi.addEventListener("adResized", this.gameResized.bind(this));
        } catch (error) {
            this.scale.on('resize', this.gameResized, this)
        }
        this.gameResized();
        this.checkOrientation();
        
        window.addEventListener("resize", () => this.checkOrientation());
        // window.addEventListener("orientationchange", () => this.checkOrientation());
    }

    checkOrientation() {
        const gameCanvas = this.game.canvas; // Get game canvas
    
        if (dimensions.fullWidth < dimensions.fullHeight) {
            // Portrait Mode - Pause everything
            this.scene.pause(this); // Ensure the correct scene is paused
            this.matter.world.pause(); // Pause physics
            this.tweens.pauseAll(); // Stop all tweens
            gameCanvas.style.display = "none"; // Hide game
    
            // Hide input field and button
            if (this.playerData.input_field) this.playerData.input_field.style.display = "none";
            if (this.playerData.button) this.playerData.button.style.display = "none";
            this.endCard.setVisible(false);
            setTimeout(() => {
                alert("Please rotate your device to landscape mode to continue.");
            }, 100);
        } else {
            // Landscape Mode - Resume everything
            this.scene.resume(this);
            this.matter.world.resume();
            this.tweens.resumeAll();
            if(this.gameOver)
            this.endCard.setVisible(true);
    
            // Force reflow to refresh canvas
            gameCanvas.style.display = "none";
            void gameCanvas.offsetHeight;
            gameCanvas.style.display = "block";
    
            setTimeout(() => {
                this.scale.resize(window.innerWidth, window.innerHeight);
                this.scale.updateBounds();
            }, 100);
    
            // Show input field and button
            if (this.playerData.input_field) this.playerData.input_field.style.display = "block";
            if (this.playerData.button) this.playerData.button.style.display = "block";
        }
    }
    

    showEndCard(){
        // const deviceId = localStorage.getItem("deviceId") || Math.random().toString(36).substr(2, 9);

        this.saveProgress(this.playerData.playerName,this.playerData.currentDevice);
        // this.playerData.endGame();
        setTimeout(() => {
            // this.playSound('fail', { volume: .3 });
            this.gamePlay.hide();
            this.water.hide();
            // this.timer.hide();
            this.score.hide();
            this.endCard.show();
        }, 500);
    }

    restartGame(){
        this.gamePlay.destroy();
        setTimeout(() => {
            this.gamePlay = new GamePlay(this,0,0,this,dimensions);
            this.gameGroup.add(this.gamePlay);
            this.gameOver = false;

            this.gamePlay.show();

            this.gameGroup.bringToTop(this.water);
            this.gameGroup.bringToTop(this.score);
            this.gameGroup.bringToTop(this.endCard);
            this.gameGroup.bringToTop(this.logo);
            this.gameGroup.bringToTop(this.playerData);
            if(this.playerData.textGrp)
                this.playerData.textGrp.destroy();
            this.water.show();
            this.score.show();
            this.setPositions();
        }, 100);
        
    }

    saveProgress(name,deviceId) {
        const progress = this.loadProgress();
        if (!progress[name]) {
            progress[name] = { highScore: 0,score:0,deviceId : deviceId};
        }

        if(progress[name].highScore && progress[name].highScore > this.score.currentScore){
            progress[name].highScore  = progress[name].highScore;

        }else{
            progress[name].highScore  = this.score.currentScore;
        }

        progress[name].score  = this.score.currentScore;
        progress[name].deviceId  = deviceId;

        console.log(progress)
        this.highScore = progress[name].highScore;
        localStorage.setItem('gameProgress', JSON.stringify(progress));
    }

    loadProgress() {
        const savedProgress = localStorage.getItem('gameProgress');
        return savedProgress ? JSON.parse(savedProgress) : {};
    }

    addGraphicsAssets(){
        let graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 160, 100);

        graphics.generateTexture('whiteFrame', 160, 100);
        this.gameGroup.add(graphics);

        graphics.destroy();

        graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRoundedRect(0, 0, 160, 100,30);

        graphics.generateTexture('roundFrame', 160, 100,30);
        this.gameGroup.add(graphics);

        graphics.destroy();
    }

    playSound( key, config) {
        // Check if the sound key exists
        if(this.soundMuted)config = {volume: 0};

        if (this.cache.audio.exists(key)) {
            this.sound.play(key, config);
        } else {
            console.warn(`Sound with key '${key}' not found`);
        }
    }

    setPositions() {

        this.superGroup.scale = (this.gameScale);
        this.gameGroup.x = (this.game.canvas.width / this.gameScale - dimensions.gameWidth) / 2;
        this.gameGroup.y = (this.game.canvas.height / this.gameScale - dimensions.gameHeight) / 2 ;

        this.bg.setScale(1);

        let scaleX = dimensions.actualWidth / this.bg.displayWidth;
        let scaleY = dimensions.actualHeight / this.bg.displayHeight;
        let scale = Math.max(scaleX, scaleY);

        this.bg.setScale(scale);

        console.log(scale);

        this.bg.x = dimensions.gameWidth/2;
        this.bg.y = dimensions.gameHeight/2;

        this.bg.visible = true;

        this.phaser3.x = dimensions.gameWidth/2;
        this.phaser3.y = dimensions.gameHeight/2;

        this.logo.x = dimensions.rightOffset - 70;
        this.logo.y = dimensions.topOffset + 40;

        this.gamePlay.adjust();
        this.water.adjust();
        this.score.adjust();
        this.endCard.adjust();
        this.playerData.adjust();
    }

    offsetMouse() {
        return {
            x: (this.game.input.activePointer.worldX * dimensions.actualWidth / dimensions.fullWidth) + ((dimensions.gameWidth - dimensions.actualWidth) / 2),
            y: (this.game.input.activePointer.worldY * dimensions.actualHeight / dimensions.fullHeight) + ((dimensions.gameHeight - dimensions.actualHeight) / 2)
        };
    }

    offsetWorld(point) {
        return {
            x: (point.x * dimensions.actualWidth / this.game.width),
            y: (point.y * dimensions.actualHeight / this.game.height)
        };
    }
}
