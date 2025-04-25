// server.js - File backend untuk chatbot dengan Hugging Face API
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();
console.log("API Key:", process.env.HUGGINGFACE_API_KEY); // Debugging

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Folder untuk file HTML, CSS, dan JS frontend

// Endpoint untuk API Hugging Face
app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    
    // Siapkan request ke Hugging Face Inference API
    const response = await axios({
      method: 'post',
      url: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', // Contoh model
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        inputs: userMessage,
        parameters: {
          max_new_tokens: 250,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true
        }
      }
    });
    
    // Kirim response dari Hugging Face ke frontend
    res.json({ 
      reply: response.data[0].generated_text 
    });
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ 
      error: 'Terjadi kesalahan saat menghubungi API Hugging Face'
    });
  }
});

// Mulai server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});