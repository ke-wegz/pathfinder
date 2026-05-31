const { db } = require('./firebase');

async function check() {
  try {
    const users = await db.collection('users').get();
    if (users.empty) {
      console.log("No users found in the Firestore database yet.");
    } else {
      console.log(`Found ${users.size} user(s) in Firestore:`);
      users.forEach(doc => {
        console.log(doc.id, "=>", doc.data());
      });
    }
  } catch (err) {
    console.error("Error querying database:", err);
  }
}

check();
