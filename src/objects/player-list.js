import { initializeApp } from "firebase/app";
import { 
  deleteDoc, getFirestore, collection, addDoc, getDocs, getDoc,
  query, orderBy, limit, where, doc, setDoc,onSnapshot,
  updateDoc
} from "firebase/firestore"; // ✅ Added missing imports
  import { getAnalytics } from "firebase/analytics";

  const botPlayers = [
    { username: "Bot1", highScore: Math.floor(Math.random() * 5000) },
    { username: "Bot2", highScore: Math.floor(Math.random() * 5000) },
    { username: "Bot3", highScore: Math.floor(Math.random() * 5000) },
    { username: "Bot4", highScore: Math.floor(Math.random() * 5000) },
    { username: "Bot5", highScore: Math.floor(Math.random() * 5000) },
  ];

  // Your Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCPeloTW3r_DvIavNuXIrVgp6s0upo7fXE",
    authDomain: "runrobo-84d8d.firebaseapp.com",
    projectId: "runrobo-84d8d",
    storageBucket: "runrobo-84d8d.firebasestorage.app",
    messagingSenderId: "964708927301",
    appId: "1:964708927301:web:45b71aa47ab931d7c4202c",
    measurementId: "G-C2FY6TJLK2"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getFirestore(app);

  async function generateBotPlayers() {
    const playersRef = collection(db, "players");

    for (const bot of botPlayers) {
        const nameExists = await checkIfNameExists(bot.username);

        if (!nameExists) {
            // Add bot only if it doesn't exist
            await addDoc(playersRef, {
                username: bot.username,
                currentScore: 0,
                highScore: bot.highScore, // Set the constant high score
            });
            console.log(`Added bot: ${bot.username}`);
        } else {
            console.log(`Bot ${bot.username} already exists. Skipping.`);
        }
    }
  }

  async function setUserSession(playerName, deviceId) {
    const playersRef = collection(db, "players");
    const q = query(playersRef, where("username", "==", playerName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const playerDocRef = doc(db, "players", querySnapshot.docs[0].id);
        await updateDoc(playerDocRef, { deviceId: deviceId });
    }
  }

  async function isUserLoggedIn(playerName, currentDeviceId) {
    const playersRef = collection(db, "players");
    const querySnapshot = await getDocs(playersRef);

    for (const doc of querySnapshot.docs) {
        const playerData = doc.data();
        if (playerData.username && playerName && playerData.username.toLowerCase() === playerName.toLowerCase()) {
          return playerData.deviceId && playerData.deviceId !== currentDeviceId;
        }
      
    }
    return false;
  }


  async function savePlayerData(username, newScore) {
    try {
        const playersRef = collection(db, "players");
        const q = query(playersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          querySnapshot.forEach(async (playerDoc) => {
              const playerRef = doc(db, "players", playerDoc.id);
              const existingData = playerDoc.data();

              const highScore = Math.max(newScore, existingData.highScore || 0);

              await updateDoc(playerRef, {
                  currentScore: newScore, 
                  highScore: highScore    
              });

              console.log(`${username}'s scores updated: Current Score = ${newScore}, High Score = ${highScore}`);
          });
      } else {
          await addDoc(playersRef, {
              username: username,
              currentScore: newScore, 
              highScore: newScore,    
              timestamp: new Date()
          });
          console.log("New player added!");
      }
    } catch (error) {
        console.error("Error saving player data: ", error);
    }
  }

  async function getLeaderboard() {
    const q = query(collection(db, "players"), orderBy("highScore", "desc"));
    const querySnapshot = await getDocs(q);

    let leaderboard = [];
    querySnapshot.forEach(doc => {
      leaderboard.push(doc.data());
    });

    return leaderboard;
  }

  async function displayLeaderboard(parent, scene, leaderboard, group,dimension) {
    parent.removeAll(true); // Clear previous leaderboard elements

    if (!leaderboard) {
        let loadingText = scene.add.text(scene.scale.width / 2, scene.scale.height / 2, "Loading...", {
            fontSize: "32px",
            fill: "#ffffff",
            fontStyle: "bold",
            backgroundColor: "#000000",
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }).setOrigin(0.5);
        parent.add(loadingText);

        leaderboard = await getLeaderboard();
        loadingText.destroy();
    }

    leaderboard.sort((a, b) => b.currentScore - a.currentScore);

    let currentPlayerIndex = leaderboard.findIndex(p => p.username === group.playerName);
    let currentPlayer = currentPlayerIndex !== -1 ? leaderboard[currentPlayerIndex] : null;

    let displayedPlayers = leaderboard.slice(0, 5);

    if (currentPlayer && !displayedPlayers.includes(currentPlayer)) {
        displayedPlayers.push(currentPlayer);
    } else if (!currentPlayer && leaderboard.length > 5) {
        displayedPlayers.push(leaderboard[5]);
    }

    displayedPlayers = displayedPlayers.slice(0, 6);

    // **Dynamic Sizing**
    let maxWidth = dimension.actualWidthL * 0.4; // 40% of screen width for left half
    let tableWidth = Math.min(500, maxWidth);
    let rowHeight = 50;
    let totalHeight = (displayedPlayers.length + 1) * rowHeight;
    let maxHeight = Math.min(dimension.actualHeightL * 0.7, totalHeight);
    let scaleFactor = Math.min(1, dimension.actualWidthL / tableWidth, dimension.actualHeightL / maxHeight);

    let leftHalfCenterX = dimension.actualWidthL / 4; // Center of the left half of the screen
    let centerY = dimension.actualHeightL / 2;

    let startX = leftHalfCenterX - (tableWidth / 2) - dimension.actualWidthL/2;
    let startY = centerY - (maxHeight / 2) - dimension.actualHeightL/2; // **Center Y position**

    console.log(startX,startY);
    // **Background Box**
    let background = scene.add.graphics();
    background.fillStyle(0xffffff, 1);
    background.fillRoundedRect(startX - 10, startY - 10, tableWidth + 20, maxHeight + 20, 10);
    background.lineStyle(5, 0x000000, 1);
    background.strokeRoundedRect(startX - 10, startY - 10, tableWidth + 20, maxHeight + 20, 10);
    parent.add(background);
    
    // **Header Row**
    let headers = ["#", "Username", "Score"];
    let columnWidths = [50, tableWidth - 200, 150];

    let headerBg = scene.add.graphics();
    headerBg.fillStyle(0x0000ff, 1);
    headerBg.fillRect(startX, startY, tableWidth, rowHeight);
    parent.add(headerBg);

    headers.forEach((text, i) => {
        let textObj = scene.add.text(
            startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10,
            startY + rowHeight / 2,
            text,
            { fontSize: "28px", fill: "#ffffff", fontWeight: "bold" }
        ).setOrigin(0, 0.5);
        parent.add(textObj);
    });

    // **Leaderboard Rows**
    displayedPlayers.forEach((player, index) => {
        let yPos = startY + (index + 1) * rowHeight;

        let rowColor = index % 2 === 0 ? 0xf0f0f0 : 0xdedede;
        if (player.username === group.playerName || (!currentPlayer && index === 5)) {
            rowColor = 0xffd700;
        }

        let rowBg = scene.add.graphics();
        rowBg.fillStyle(rowColor, 1);
        rowBg.fillRect(startX, yPos, tableWidth, rowHeight);
        parent.add(rowBg);

        let rowData = [`#${index + 1}`, player.username, player.currentScore];

        rowData.forEach((text, colIndex) => {
            let textObj = scene.add.text(
                startX + columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0) + 10,
                yPos + rowHeight / 2,
                text,
                { fontSize: "26px", fill: "#000000" }
            ).setOrigin(0, 0.5);
            parent.add(textObj);
        });
    });

    parent.setScale(scaleFactor); // **Scale down if needed**
}


  // Function to delete a player by name
  async function deletePlayerByName(username) {
    try {
        const q = query(collection(db, "players"), where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("No player found with that name.");
            return;
        }

        const deletePromises = querySnapshot.docs.map((playerDoc) =>
            deleteDoc(doc(db, "players", playerDoc.id))
        );

        await Promise.all(deletePromises);
        console.log(`Deleted player: ${username}`);
    } catch (error) {
        console.error("Error deleting player data:", error);
    }
  }

  // Function to delete all players
  async function deleteAllPlayers() {
    try {
        const querySnapshot = await getDocs(collection(db, "players"));

        if (querySnapshot.empty) {
            console.log("No players found.");
            return;
        }

        const deletePromises = querySnapshot.docs.map((playerDoc) =>
            deleteDoc(doc(db, "players", playerDoc.id))
        );

        await Promise.all(deletePromises);
        console.log("All player data deleted!");
    } catch (error) {
        console.error("Error deleting player data:", error);
    }
  }

  
  async function checkIfNameExists(playerName) {
    const playersRef = collection(db, "players");
    const q = query(playersRef, where("username", "==", playerName));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Returns true if name exists
  }

  async function updateBallSpeed(newSpeed) {
    const settingsRef = doc(db, "gameSettings", "ball");
    await setDoc(settingsRef, { speed: newSpeed }, { merge: true });
    console.log("Ball speed updated in Firestore:", newSpeed);
  }

  async function getBallSpeed() {
    const settingsRef = doc(db, "gameSettings", "ball");
    const docSnap = await getDoc(settingsRef); // ✅ Correct: Use getDoc() for a document

    if (docSnap.exists()) {
      console.log(docSnap.data())
        return docSnap.data().speed;
    } else {
        console.log("Ball speed document not found. Using default speed.");
        return 30; // Default speed
    }
} 

  function listenToBallSpeed(scene,xVelo) {
    const settingsRef = doc(db, "gameSettings", "ball");

    onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) {
            let newSpeed = docSnap.data().speed;
            scene.ball.setVelocity(xVelo, newSpeed); // Apply new speed
            console.log("Updated ball speed:", newSpeed);
        }
    });
  }

// Export all Firebase functions
export { deletePlayerByName, setUserSession, isUserLoggedIn, listenToBallSpeed,generateBotPlayers, getBallSpeed,updateBallSpeed,checkIfNameExists, deleteAllPlayers, savePlayerData, getLeaderboard, displayLeaderboard, db };
