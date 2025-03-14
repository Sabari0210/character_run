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

  async function displayLeaderboard(parent, scene) {
    const leaderboard = await getLeaderboard();
    let y = 0;

    leaderboard.forEach((player, index) => {
      let text = scene.add.text(0, y, `#${index + 1} ${player.username}: Score = ${player.currentScore}, High Score = ${player.highScore}`, { fontSize: '34px', fill: '#fff' });
      y += 60;
      text.setOrigin(0.5);
      parent.add(text);
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
