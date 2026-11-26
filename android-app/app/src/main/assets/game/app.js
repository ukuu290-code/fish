if (window.location.protocol === 'file:') {
  document.querySelector('.install-help')?.remove();
} else if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('./service-worker.js')
    .catch(error => console.error('オフライン機能を設定できませんでした。', error));
}

let installPrompt = null;
const installButton = document.querySelector('#install-app');

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

window.addEventListener('appinstalled', () => {
  installPrompt = null;
  installButton.hidden = true;
});

installButton.addEventListener('click', async () => {
  if (!installPrompt) {
    return;
  }

  installButton.disabled = true;
  try {
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      installPrompt = null;
      installButton.hidden = true;
    }
  } catch (error) {
    console.error('アプリをインストールできませんでした。', error);
  } finally {
    installButton.disabled = false;
  }
});
