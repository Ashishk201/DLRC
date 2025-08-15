# app.py
# This READ-ONLY server is for hosting on OnRender.
# It serves the website and the files you've added via your local script.

import os
import json
from flask import Flask, jsonify, send_from_directory
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

@app.route('/api/data', methods=['GET'])
def get_data():
    """Reads and returns the database.json file."""
    try:
        with open(DB_PATH, 'r') as f:
            db = json.load(f)
        
        search_query = request.args.get('search', '').lower()
        if search_query:
            filtered_notes = [
                note for note in db['notes'] 
                if search_query in note['displayName'].lower() or 
                   search_query in note['group'].lower()
            ]
            return jsonify({'notes': filtered_notes, 'groups': db['groups']})
        
        return jsonify(db)
    except FileNotFoundError:
        return jsonify({"notes": [], "groups": []}), 404
    except Exception as e:
        return jsonify({'message': f"Error reading data: {e}"}), 500

@app.route('/')
def serve_index():
    """Serves the main index.html file."""
    return send_from_directory('.', 'index.html')

# --- 4. Start the Server (for local testing) ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)
