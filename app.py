from flask import Flask, request, jsonify, send_from_directory, render_template
import os
import yt_dlp
from urllib.parse import urlparse
import validators
from flask_cors import CORS
import logging
from datetime import datetime

# Configuration de l'application
app = Flask(__name__)
CORS(app)

# Configuration des dossiers
app.config['DOWNLOAD_FOLDER'] = os.path.join('static', 'downloads')
os.makedirs(app.config['DOWNLOAD_FOLDER'], exist_ok=True)

# Configuration du logging
logging.basicConfig(level=logging.INFO)
app.logger.info(f"Service démarré - Dossier de téléchargement: {app.config['DOWNLOAD_FOLDER']}")

# Liste des plateformes supportées
SUPPORTED_PLATFORMS = {
    'youtube': 'YouTube',
    'youtu.be': 'YouTube',
    'facebook': 'Facebook',
    'fb.watch': 'Facebook',
    'twitter': 'Twitter',
    'x.com': 'Twitter',
    'tiktok': 'TikTok',
    'snapchat': 'Snapchat',
    'pinterest': 'Pinterest',
    'instagram': 'Instagram'
}

def get_clean_filename(info):
    """Génère un nom de fichier propre avec timestamp"""
    title = info.get('title', 'video')
    ext = info.get('ext', 'mp4')
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{title[:50]}_{timestamp}.{ext}"

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/api/download', methods=['POST'])
def handle_download():
    try:
        data = request.get_json()
        video_url = data.get('url')
        format_quality = data.get('quality', 'best')

        # Validation de l'URL
        if not video_url or not validators.url(video_url):
            return jsonify({'error': 'URL de vidéo invalide'}), 400

        # Options de téléchargement
        ydl_opts = {
            'format': format_quality,
            'outtmpl': os.path.join(app.config['DOWNLOAD_FOLDER'], get_clean_filename),
            'quiet': False,
            'no_warnings': False,
            'progress_hooks': [progress_hook],
        }

        # Journalisation
        app.logger.info(f"Début du téléchargement: {video_url}")

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            filename = ydl.prepare_filename(info)
            
            # Vérification que le fichier existe
            if not os.path.exists(filename):
                raise FileNotFoundError("Le fichier téléchargé est introuvable")

        return jsonify({
            'success': True,
            'filename': os.path.basename(filename),
            'download_url': f'/api/downloads/{os.path.basename(filename)}',
            'title': info.get('title', '')
        })

    except Exception as e:
        app.logger.error(f"Erreur de téléchargement: {str(e)}")
        return jsonify({'error': str(e)}), 500

def progress_hook(d):
    """Hook pour suivre la progression"""
    if d['status'] == 'downloading':
        app.logger.info(f"Progression: {d.get('_percent_str', '0%')}")

@app.route('/api/downloads/<filename>')
def serve_file(filename):
    """Endpoint pour servir les fichiers téléchargés"""
    try:
        return send_from_directory(
            app.config['DOWNLOAD_FOLDER'],
            filename,
            as_attachment=True,
            mimetype='video/mp4'
        )
    except FileNotFoundError:
        return jsonify({'error': 'Fichier non trouvé'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)