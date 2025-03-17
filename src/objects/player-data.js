import { deleteAllPlayers, displayLeaderboard, savePlayerData, generateBotPlayers, checkIfNameExists, isUserLoggedIn, setUserSession, getLeaderboard } from "./player-list";

export class PlayerData extends Phaser.GameObjects.Container {
    constructor(scene, x, y, gameScene,dimension) {
        super(scene);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.gameScene = gameScene;
        this.dimension = dimension;
        this.scene.add.existing(this);
        this.init();
    }

    adjust() {
        if(!this.scene.positioned)return;
        let dimensions = this.dimension;
    
        this.x = dimensions.gameWidth/2;
        this.y = dimensions.gameHeight/2;

        // Get Phaser's canvas position relative to the viewport
        const gameCanvas = this.scene.sys.game.canvas;
        const canvasRect = gameCanvas.getBoundingClientRect(); 
    
        // Set input field size
        this.input_field.style.width = "200px";
        this.input_field.style.height = "30px";
    
        this.input_field.style.position = "absolute";
        this.input_field.style.top = `${canvasRect.height/2}px`; // Center vertically (-15px to align correctly)
        this.input_field.style.left = `${canvasRect.width/2 - 100}px`; // Center horizontally (-100px to center width)

        // Set input field size
        this.button.style.width = "100px";
        this.button.style.height = "30px";
    
        this.button.style.position = "absolute";
        this.button.style.top = `${canvasRect.height/2 + 60}px`; // Center vertically (-15px to align correctly)
        this.button.style.left = `${canvasRect.width/2 - 50}px`; // Center horizontally (-100px to center width)
    }

    init() {

        this.name = this.scene.add.text(0, -50, "Enter Your Name", { font: "bold 40px san", fill: "#ffffff" });
        this.name.setOrigin(0.5);
        this.add(this.name);

        // deleteAllPlayers();
        // Create an input field
        // generateBotPlayers();
        this.input_field = document.createElement("input");
        this.input_field.type = "text";
        this.input_field.placeholder = "Enter Name";
        this.input_field.style.position = "absolute";
        this.input_field.style.top = `${80}px`;  // Adjust position as needed
        this.input_field.style.left = "100px";
        this.input_field.style.fontSize = "20px";
        this.input_field.style.borderRadius = "10px"; // Rounded corners
        this.input_field.style.fontFamily = "Arial, sans-serif"; // Font family
        document.body.appendChild(this.input_field);

        this.button = document.createElement("button");
        this.button.innerText = "Submit";
        this.button.style.position = "absolute";
        this.button.style.top = "120px";
        this.button.style.left = "100px";
        this.button.style.fontSize = "18px";
        this.button.style.borderRadius = "10px"; // Rounded corners
        document.body.appendChild(this.button);

        let progress = this.scene.loadProgress();
       
        this.button.addEventListener("click", async () => {
            const playerName = this.input_field.value.trim();
            let deviceId = Math.random().toString(36).substr(2, 9);
            if(progress[playerName]){
                deviceId = progress[playerName].deviceId
            }
            this.currentDevice = deviceId;
            if (playerName) {//d43ohk13z
                const alreadyLoggedIn = await isUserLoggedIn(playerName, deviceId);
                // const nameExists = await checkIfNameExists(playerName);
                console.log(alreadyLoggedIn);
                if (alreadyLoggedIn) {
                    alert("Username already exists! Please enter a different name.");
                } else {
                    this.scene.saveProgress(playerName,deviceId);
                    this.playerName = playerName;
                    this.input_field.remove();
                    this.name.visible = false;
                    this.button.remove();
                    this.scene.score.show();
                    this.scene.gamePlay.show();
                    await savePlayerData(this.playerName, this.scene.score.currentScore);
                }
            }
        });
        

        // this.scene.time.delayedCall(2000, () => {
        //     savePlayerData("Player1", Math.floor(Math.random() * 5000)); // Random score
        //   });
      
        //   // Example: Display Leaderboard
        //   this.scene.time.delayedCall(3000, () => {
        //     displayLeaderboard(this.scene,this.dimension);
        //   });
    }

    async addedscore(){
        await savePlayerData(this.playerName, this.scene.score.currentScore);
        await setUserSession(this.playerName, this.currentDevice);
    }

    async endGame(score) {
        let leaderboardData = await getLeaderboard();
        leaderboardData.sort((a, b) => b.currentScore - a.currentScore); // Sort instantly
        
        if (this.textGrp) {
            this.textGrp.destroy(); // Remove old leaderboard
        }
        this.textGrp = this.scene.add.container();
        this.add(this.textGrp);
    
        displayLeaderboard(this.textGrp, this.scene, leaderboardData,this); // Pass updated data
    
        this.textGrp.x = this.dimension.leftOffset - this.x;
        this.textGrp.y = -200;
    }
    
}