document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('download_btn');
    const videoUrlInput = document.getElementById('video_url');
    const formatSelect = document.getElementById('format');
    const progressContainer = document.getElementById('progress_container');
    const progressBar = document.getElementById('progress');
    const progressText = document.getElementById('progress_text');
    const messageDiv = document.getElementById('message');
    
    downloadBtn.addEventListener('click', startDownload);
    
    function startDownload() {
        const videoUrl = videoUrlInput.value.trim();
        const format = formatSelect.value;
        
        if (!videoUrl) {
            showMessage('Veuillez entrer une URL valide', 'error');
            return;
        }
        
        // Vérification basique de l'URL
        if (!isValidUrl(videoUrl)) {
            showMessage('URL invalide. Veuillez entrer une URL complète (commençant par http:// ou https://)', 'error');
            return;
        }
        
        // Afficher la progression
        progressContainer.classList.remove('hidden');
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        
        // Simuler la progression pour la démo (à remplacer par une vraie implémentation)
        simulateProgress();
        
        // Envoyer la requête au serveur
        fetch('/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `video_url=${encodeURIComponent(videoUrl)}&format=${format}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage(data.message, 'success');
                if (data.download_url) {
                    // Créer un lien de téléchargement automatique
                    setTimeout(() => {
                        window.location.href = data.download_url;
                    }, 1000);
                }
            } else {
                showMessage(data.error || 'Erreur lors du téléchargement', 'error');
            }
        })
        .catch(error => {
            showMessage('Erreur de connexion au serveur', 'error');
            console.error('Error:', error);
        });
    }
    
    function simulateProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            updateProgress(progress);
        }, 300);
    }
    
    function updateProgress(percent) {
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${Math.round(percent)}%`;
    }
    
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = type;
        messageDiv.classList.remove('hidden');
        
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
    
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    // Si un message de succès est présent dans l'URL (après redirection)
    const urlParams = new URLSearchParams(window.location.search);
    const successParam = urlParams.get('success');
    const errorParam = urlParams.get('error');
    const filenameParam = urlParams.get('filename');
    
    if (successParam && filenameParam) {
        showMessage(`${successParam} Cliquez <a href="/downloads/${filenameParam}" download>ici</a> si le téléchargement ne commence pas automatiquement.`, 'success');
        // Démarrer le téléchargement automatiquement
        setTimeout(() => {
            window.location.href = `/downloads/${filenameParam}`;
        }, 1000);
    }
    
    if (errorParam) {
        showMessage(errorParam, 'error');
    }
});
