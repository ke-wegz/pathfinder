const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountConfig = (() => {
  const envValue = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!envValue) {
    const defaultPath = path.join(__dirname, 'serviceAccountKey.json');
    if (fs.existsSync(defaultPath)) {
      return require(defaultPath);
    }
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not set and default serviceAccountKey.json not found');
  }

  try {
    return JSON.parse(envValue);
  } catch (jsonError) {
    const possiblePath = path.isAbsolute(envValue)
      ? envValue
      : path.join(__dirname, envValue);
    if (fs.existsSync(possiblePath)) {
      return require(possiblePath);
    }
    throw new Error('FIREBASE_SERVICE_ACCOUNT must be valid JSON or a path to a service account JSON file');
  }
})();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountConfig)
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
