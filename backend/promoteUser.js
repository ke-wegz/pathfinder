const { db } = require('./firebase');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node promoteUser.js <email>');
  process.exit(1);
}

const promoteUser = async () => {
  try {
    const querySnapshot = await db.collection('users')
      .where('email', '==', email.toLowerCase().trim())
      .get();

    if (querySnapshot.empty) {
      console.error(`Error: User with email "${email}" not found in Firestore.`);
      process.exit(1);
    }

    const userDoc = querySnapshot.docs[0];
    await userDoc.ref.update({ role: 'Admin' });
    console.log(`Success: Promoted user "${email}" (UID: ${userDoc.id}) to Admin role in Firestore.`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to promote user:', error.message);
    process.exit(1);
  }
};

promoteUser();
