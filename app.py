# app.py
# This is the updated Python backend server for a flat file structure.

import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import time

# --- 1. Initialize the Flask App ---
# Serve static files (HTML, CSS, JS) from the same directory as this script.
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app) # Allows the frontend to communicate with this server

# --- 2. Configuration ---
# We still use a subfolder for uploads to keep them separate from the source code.
# The script will create this folder if it doesn't exist.
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'md', 'docx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
DB_PATH = 'database.json'

# --- 3. Helper Functions ---

def allowed_file(filename):
    """Checks if the file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def read_db():
    """Reads the JSON database file."""
    if not os.path.exists(DB_PATH):
        with open(DB_PATH, 'w') as f:
            json.dump({"notes": [], "groups": ["Books", "Articles", "Notes"]}, f, indent=2)
    with open(DB_PATH, 'r') as f:
        return json.load(f)

def write_db(data):
    """Writes data to the JSON database file."""
    with open(DB_PATH, 'w') as f:
        json.dump(data, f, indent=2)

# --- 4. API Endpoints ---

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serves the uploaded files from the 'uploads' folder."""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/data', methods=['GET'])
def get_data():
    """Fetches all notes and groups, with optional search."""
    try:
        db = read_db()
        search_query = request.args.get('search', '').lower()
        
        filtered_notes = db['notes']
        if search_query:
            filtered_notes = [
                note for note in db['notes'] 
                if search_query in note['displayName'].lower() or 
                   search_query in note['group'].lower()
            ]
            
        return jsonify({'notes': filtered_notes, 'groups': db['groups']})
    except Exception as e:
        return jsonify({'message': f"Error reading data: {e}"}), 500

@app.route('/api/notes', methods=['POST'])
def upload_note():
    """Handles the upload of a new note."""
    try:
        if 'file' not in request.files or 'displayName' not in request.form:
            return jsonify({'message': 'Missing form data'}), 400
        
        file = request.files['file']
        display_name = request.form.get('displayName')
        group = request.form.get('group')
        new_group = request.form.get('newGroup')

        if file.filename == '':
            return jsonify({'message': 'No selected file'}), 400

        if file and allowed_file(file.filename):
            ext = file.filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{int(time.time())}_{secure_filename(display_name)}.{ext}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)

            db = read_db()
            final_group = group
            if new_group:
                final_group = new_group
                if new_group not in db['groups']:
                    db['groups'].append(new_group)

            new_note = {
                'id': int(time.time() * 1000),
                'displayName': display_name,
                'group': final_group,
                'fileName': unique_filename,
                'filePath': f'/uploads/{unique_filename}',
                'type': 'image' if ext in ['png', 'jpg', 'jpeg', 'gif'] else 'document'
            }

            db['notes'].append(new_note)
            write_db(db)
            return jsonify(new_note), 201
        else:
            return jsonify({'message': 'File type not allowed'}), 400
            
    except Exception as e:
        return jsonify({'message': f"Error uploading file: {e}"}), 500

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    """Deletes a note by its ID."""
    try:
        db = read_db()
        note_to_delete = next((note for note in db['notes'] if note['id'] == note_id), None)

        if not note_to_delete:
            return jsonify({'message': 'Note not found'}), 404

        file_path = os.path.join(app.config['UPLOAD_FOLDER'], note_to_delete['fileName'])
        if os.path.exists(file_path):
            os.remove(file_path)

        db['notes'] = [note for note in db['notes'] if note['id'] != note_id]
        write_db(db)

        return jsonify({'message': 'Note deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': f"Error deleting note: {e}"}), 500

@app.route('/')
def serve_index():
    """Serves the main index.html file from the root directory."""
    return send_from_directory('.', 'index.html')

# --- 5. Start the Server ---
if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True, port=3000)
