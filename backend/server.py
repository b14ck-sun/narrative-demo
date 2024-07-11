from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from functions import make_pdf, ask_chatgpt
import logging
import os

app = Flask(__name__)

# Get allowed origins from environment variable, defaulting to empty list
allowed_origins = os.getenv('ALLOWED_ORIGINS', '').split(',')

if allowed_origins == ['']:
    allowed_origins = []

CORS(app, origins=allowed_origins)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route("/api/generate", methods = ['POST'])
def process():
    try:
        req = request.get_json()
        message = ''
        for item in req:
            text = item.get('text', '')
            files = item.get('files', [])
            if files:
                message += f'{text} [Reference {files}] \n'
            else:
                message += f'{text}\n'
        response = ask_chatgpt(message)
        return jsonify({'response': response})
    except Exception as e:
        logger.error(f"Error in /generate: {e}")
        return jsonify({'error': str(e)}), 500

@app.route("/api/download", methods = ['POST'])
def makefile():
    try:
        text = request.form.get('text')
        files = request.files.getlist('files')
        if not text or not files:
            return jsonify({'error': 'Missing text or files'}), 400
        merged_pdf_path = make_pdf(text, files)
        return send_file(merged_pdf_path, as_attachment=True)
    except Exception as e:
        logger.error(f"Error in /download: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    from waitress import serve
    serve(app, host='0.0.0.0', port=8080)