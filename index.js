const express = require('express');
const app = express();
app.use(express.json());

// Webhook endpoint for Paynecta
app.post('/webhook', (req, res) => {
  console.log('📥 Webhook received:', req.body);
  
  // TODO: Store payment status in Supabase or your database
  // e.g., update pending_registrations table
  
  res.status(200).json({ status: 'received' });
});

app.listen(3000, () => console.log('Webhook server running on port 3000'));
