# app.py - Backend alternatif menggunakan Python dan Flask
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Load variabel lingkungan dari file .env
load_dotenv()

app = Flask(__name__, static_folder='public')
CORS(app)  # Aktifkan CORS untuk semua domain

# Ambil API key dari environment variable
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY')

# Route untuk file statis (HTML, CSS, JS)
@app.route('/')
def index():
    return send_from_directory('public', 'index.html')

# Endpoint API untuk chat
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        
        # Permintaan ke API Hugging Face
        headers = {
            "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": user_message,
            "parameters": {
                "max_new_tokens": 250,
                "temperature": 0.7,
                "top_p": 0.95,
                "do_sample": True
            }
        }
        
        # URL untuk model Mistral dari Hugging Face
        api_url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
        response = requests.post(api_url, headers=headers, json=payload)
        
        # Cek apakah respons berhasil
        if response.status_code == 200:
            result = response.json()
            bot_reply = result[0]['generated_text']
            return jsonify({"reply": bot_reply})
        else:
            return jsonify({"error": f"API Error: {response.status_code}", "details": response.text}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Ambil port dari environment variable atau gunakan 5000 sebagai default
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)