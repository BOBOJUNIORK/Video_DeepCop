from flask import Flask, render_template, request, redirect, url_for, send_from_directory
import os
import yt_dlp
from urllib.parse import urlparse
import validators

app = Flask(__name__)
app.config['DOWNLOAD_FOLDER'] = 'static/downloads'

# Créer le dossier de téléchargement s'il n'existe pas
os.makedirs(app.config['DOWNLOAD_FOLDER'], exist_ok=True)

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

def detect_platform(url):
    domain = urlparse(url).netloc.lower()
    for platform in SUPPORTED_PLATFORMS:
        if platform in domain:
            return SUPPORTED_PLATFORMS[platform]
    return None

def download_video(url):
    platform = detect_platform(url)
    if not platform:
        return None, "Plateforme non supportée"
    
    ydl_opts = {
        'format': 'best',
        'outtmpl': os.path.join(app.config['DOWNLOAD_FOLDER'], '%(title)s.%(ext)s'),
        'quiet': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            return filename, None
    except Exception as e:
        return None, str(e)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        video_url = request.form.get('video_url')
        if not validators.url(video_url):
            return render_template('index.html', error="URL invalide")
        
        filename, error = download_video(video_url)
        if error:
            return render_template('index.html', error=error)
        
        return render_template('index.html', 
                             success=f"Vidéo téléchargée avec succès!",
                             filename=os.path.basename(filename))
    
    return render_template('index.html')

@app.route('/downloads/<filename>')
def download_file(filename):
    return send_from_directory(app.config['DOWNLOAD_FOLDER'], filename, as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
