const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Ambil kredensial dari environment variable yang aman
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Inisialisasi Firebase Admin
if (!initializeApp.length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

exports.handler = async function(event, context) {
  // Ambil userId dari parameter query, contoh: /.netlify/functions/getData?userId=abcde
  const userId = event.queryStringParameters.userId;

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'userId is required' }),
    };
  }

  try {
    // Ambil data links dan settings dari Firestore
    const linksSnapshot = await db.collection(`artifacts/default-app-id/users/${userId}/links`).get();
    const links = linksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const settingsDoc = await db.doc(`artifacts/default-app-id/users/${userId}/settings/appSettings`).get();
    const settings = settingsDoc.exists ? settingsDoc.data() : {};

    return {
      statusCode: 200,
      body: JSON.stringify({ links, settings }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data from Firebase.' }),
    };
  }
};