document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('download_btn');
    const videoUrlInput = document.getElementById('video_url');
    const formatSelect = document.getElementById('format');
    const progressContainer = document.getElementById('progress_container');
    const progressBar = document.getElementById('progress');
    const progressText = document.getElementById('progress_text');
    const messageDiv = document.getElementById('message');
    const downloadLink = document.getElementById('download_link');
    const videoTitle = document.getElementById('video_title');

    // Écouteurs d'événements
    downloadBtn.addEventListener('click', startDownload);
    videoUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') startDownload();
    });

    // Fonction principale
    async function startDownload() {
        const videoUrl = videoUrlInput.value.trim();
        const format = formatSelect.value;

        // Validation
        if (!videoUrl) {
            showMessage('Veuillez entrer une URL de vidéo', 'error');
            return;
        }

        // Réinitialisation UI
        resetUI();
        showProgress(true);

        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: videoUrl,
                    quality: format
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur serveur');
            }

            // Succès
            updateProgress(100);
            showMessage('Téléchargement terminé!', 'success');
            
            // Afficher le lien de téléchargement
            if (data.download_url) {
                videoTitle.textContent = data.title || 'Vidéo téléchargée';
                downloadLink.href = data.download_url;
                downloadLink.style.display = 'inline-block';
            }

        } catch (error) {
            showMessage(error.message || 'Erreur de connexion au serveur', 'error');
            console.error('Erreur:', error);
        } finally {
            showProgress(false);
        }
    }

    // Fonctions utilitaires
    function resetUI() {
        messageDiv.classList.add('hidden');
        downloadLink.style.display = 'none';
    }

    function showProgress(show) {
        progressContainer.style.display = show ? 'block' : 'none';
        if (show) {
            progressBar.style.width = '0%';
            progressText.textContent = '0%';
        }
    }

    function updateProgress(percent) {
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${Math.round(percent)}%`;
    }

    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = type;
        messageDiv.classList.remove('hidden');
    }

    // Simulation de progression (pour UI)
    function simulateProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 90) clearInterval(interval);
            updateProgress(progress);
        }, 300);
    }
});