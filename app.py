# app.py
# This READ-ONLY server is for hosting on OnRender.
# It serves the website and the files you've added via your local script.

import os
import json
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS

# --- 1. Initialize the Flask App ---
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# --- 2. Configuration ---
DB_PATH = 'database.json'
LIBRARY_FOLDER = 'library_files'

# --- 3. API Endpoints ---

@app.route('/library_files/<path:filename>')
def serve_library_file(filename):
    """Serves the actual note/book files."""
    return send_from_directory(LIBRARY_FOLDER, filename)

@app.route('/database.json')
def get_data():
    """Reads and returns the database.json file directly."""
    return send_from_directory('.', DB_PATH)

@app.route('/')
def serve_index():
    """Serves the main index.html file."""
    return send_from_directory('.', 'index.html')

# --- 4. Start the Server (for local testing) ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)
