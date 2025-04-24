from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

API_TOKEN = "MASUKKAN_TOKEN_HUGGINGFACE_KAMU"
HEADERS = {"Authorization": f"Bearer {API_TOKEN}"}
API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1"

@app.route('/tanya', methods=['POST'])
def tanya_ai():
    data = request.get_json()
    pertanyaan = data.get("pesan", "")
    response = requests.post(API_URL, headers=HEADERS, json={"inputs": pertanyaan})
    result = response.json()
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
