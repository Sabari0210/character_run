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
    const q = query(playersRef, where("username", "==", playerName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const playerData = querySnapshot.docs[0].data();
        return playerData.deviceId && playerData.deviceId !== currentDeviceId;
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
    const q = query(collection(db, "players"), orderBy("highScore", "desc"), limit(10));
    const querySnapshot = await getDocs(q);

    let leaderboard = [];
    querySnapshot.forEach(doc => {
      leaderboard.push(doc.data());
    });

    return leaderboard;
  }

  async function displayLeaderboard(parent, scene, leaderboard,group) {
    // Clear previous leaderboard elements
    parent.removeAll(true);

    // If leaderboard data is not provided, fetch it
    if (!leaderboard) {
        let loadingText = scene.add.text(250, 300, "Loading...", {
            fontSize: "32px",
            fill: "#ffffff",
            fontStyle: "bold",
            backgroundColor: "#000000",
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }).setOrigin(0.5);
        parent.add(loadingText);

        leaderboard = await getLeaderboard(); // Fetch latest leaderboard data
        loadingText.destroy();
    }

    // Sort leaderboard so highest score is first
    leaderboard.sort((a, b) => b.currentScore - a.currentScore);

    // Find current player
    let currentPlayerIndex = leaderboard.findIndex(p => p.username === scene.playerName);
    let currentPlayer = leaderboard[currentPlayerIndex];

    // If current player exists and is not already first, move them to the top
    if (currentPlayerIndex > 0) {
        leaderboard.splice(currentPlayerIndex, 1); // Remove from current position
        leaderboard.unshift(currentPlayer); // Move to first position
    }

    // Table dimensions
    const tableWidth = 500;
    const rowHeight = 60;
    const startX = 50;
    const startY = 50;

    // Background box
    let background = scene.add.graphics();
    background.fillStyle(0xffffff, 1);
    background.fillRoundedRect(startX - 10, startY - 10, tableWidth + 20, (leaderboard.length + 1) * rowHeight + 20, 10);
    background.lineStyle(5, 0x000000, 1);
    background.strokeRoundedRect(startX - 10, startY - 10, tableWidth + 20, (leaderboard.length + 1) * rowHeight + 20, 10);
    parent.add(background);

    // Table header
    let headers = ["#", "Username", "Score"];
    let columnWidths = [50, 300, 150];
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

    // Draw leaderboard rows
    leaderboard.forEach((player, index) => {
        let yPos = startY + (index + 1) * rowHeight;

        // Highlight current player
        let rowColor = index % 2 === 0 ? 0xf0f0f0 : 0xdedede;
        if(player.username == group.playerName)rowColor = 0xffd700;
        console.log(player.username,group.playerName)
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
