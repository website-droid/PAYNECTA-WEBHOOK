const express = require('express');
const admin = require('firebase-admin');
const app = express();

// Parse JSON bodies
app.use(express.json());

// Initialize Firebase Admin SDK
// Use environment variables for service account (recommended)
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Fallback for local development – you can also use a local file
  serviceAccount = require('./serviceAccountKey.json');
}
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Webhook endpoint for Paynecta
app.post('/webhook', async (req, res) => {
  console.log('📥 Webhook received:', req.body);

  const { transaction_ref, status, mpesa_code } = req.body;

  // Update pending registration in Firestore
  if (status === 'completed' || status === 'success') {
    try {
      const docRef = db.collection('pending_registrations').doc(transaction_ref);
      await docRef.update({
        status: 'paid',
        mpesa_code: mpesa_code || null,
        paid_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Payment confirmed for ${transaction_ref}`);
    } catch (error) {
      console.error('❌ Firestore update error:', error);
    }
  } else {
    console.log(`⏳ Payment status: ${status} for ${transaction_ref}`);
  }

  res.status(200).json({ status: 'received' });
});

// Health check endpoint (for Render)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});
