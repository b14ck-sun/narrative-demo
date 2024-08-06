from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from functions import make_pdf, generate_appeal, generate_facts
from datetime import datetime
import logging
import os
import csv

app = Flask(__name__)

# Get allowed origins from environment variable, defaulting to empty list
allowed_origins = os.getenv('ALLOWED_ORIGINS', '').split(',')

if allowed_origins == ['']:
    allowed_origins = []

#CORS(app, origins=allowed_origins)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# UPLOAD_FOLDER = 'uploads'
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# RESOURCE_FOLDER = 'resources'
# os.makedirs(RESOURCE_FOLDER, exist_ok=True)
# DOWNLOAD_FOLDER = 'donwloads'
# os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

# logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# # Define the log file path
log_file_path = os.path.join(os.path.dirname(__file__), 'logs', 'access_log.csv')
# # Ensure the directory exists
os.makedirs(os.path.dirname(log_file_path), exist_ok=True)

def log_request_info():
    if request.headers.getlist("X-Forwarded-For"):
        ip = request.headers.getlist("X-Forwarded-For")[0]
    else:
        ip = request.remote_addr
    
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    with open(log_file_path, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([timestamp, ip])

@app.route('/api/usage_report')
def download_log():
    return send_file(log_file_path, as_attachment=True)

@app.route('/api/test')
def test():
    return 'Hello, World!'

@app.route("/api/generate_facts", methods = ['POST'])
def get_facts():
    try:
        req = request.get_json()
        message = req['text']
        response = generate_facts(message)
        return jsonify({'response': response})
    except Exception as e:
        logger.error(f"Error in /generate: {e}")
        return jsonify({'error': str(e)}), 500

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
        response = generate_appeal(message)
        return jsonify({'response': response})
    except Exception as e:
        logger.error(f"Error in /generate: {e}")
        return jsonify({'error': str(e)}), 500

@app.route("/api/download", methods = ['POST'])
def makefile():
    try:
        log_request_info()
        text = request.form.get('text')
        files = request.files.getlist('files')
        if not text:
            return jsonify({'error': 'Missing text'}), 400
        merged_pdf_path = make_pdf(text, files)
        return send_file(merged_pdf_path, as_attachment=True)
    except Exception as e:
        logger.error(f"Error in /download: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
