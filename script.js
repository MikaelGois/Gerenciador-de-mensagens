document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById('message-input');
  const addButton = document.getElementById('add-button');
  const sortSelect = document.getElementById('sort-select');
  const column1 = document.getElementById('column1');
  const column2 = document.getElementById('column2');
  const toggleDarkMode = document.getElementById('toggle-dark-mode');
  const notification = document.getElementById('notification');
  const importFile = document.getElementById('import-file');
  const importButton = document.getElementById('import-button');
  const exportButton = document.getElementById('export-button');
  const popup = document.getElementById('popup');
  const confirmDelete = document.getElementById('confirm-delete');
  const cancelDelete = document.getElementById('cancel-delete');

  let messages = JSON.parse(localStorage.getItem('messages')) || [];
  let darkMode = JSON.parse(localStorage.getItem('darkMode')) || false;
  let messageToDeleteIndex = null;

  const saveMessages = () => {
    localStorage.setItem('messages', JSON.stringify(messages));
  };

  const showNotification = (message) => {
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  };

  const renderMessages = () => {
    column1.innerHTML = '';
    column2.innerHTML = '';
    let sortedMessages = [...messages];
    const sortBy = sortSelect.value;

    if (sortBy === 'most-used') {
      sortedMessages.sort((a, b) => b.usageCount - a.usageCount);
    } else if (sortBy === 'recently-used') {
      sortedMessages.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
    } else if (sortBy === 'date-added-oldest') {
      sortedMessages.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
    } else if (sortBy === 'date-added-newest') {
      sortedMessages.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }

    sortedMessages.forEach((message, index) => {
      const messageBox = document.createElement('div');
      messageBox.classList.add('message-box');
      messageBox.textContent = message.text;
      messageBox.addEventListener('click', () => {
        // se estiver fora do modo de seleção, copia a mensagem para a área de transferência
        navigator.clipboard.writeText(message.text);
        message.usageCount += 1;
        message.lastUsed = new Date().toISOString();
        saveMessages();
        showNotification('Mensagem copiada para a área de transferência');
        renderMessages();
      });
      messageBox.addEventListener('contextmenu', (e) => {
        // se clicar com o botão direito do mouse, abre o popup de exclusão
        e.preventDefault();
        messageToDeleteIndex = index;
        document.body.classList.add('blur-background');
        popup.classList.add('show');
        popup.style.display = 'block';
      });
      if (index % 2 === 0) {
        column1.appendChild(messageBox);
      } else {
        column2.appendChild(messageBox);
      }
    });
  };

  addButton.addEventListener('click', () => {
    const messageText = messageInput.value.trim();
    if (messageText) {
      const newMessage = {
        text: messageText,
        dateAdded: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        usageCount: 0
      };
      messages.push(newMessage);
      saveMessages();
      renderMessages();
      showNotification('Mensagem adicionada');
      messageInput.value = '';
    }
  });

  sortSelect.addEventListener('change', renderMessages);

  toggleDarkMode.addEventListener('click', () => {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode', darkMode);
    document.querySelector('.container').classList.toggle('dark-mode', darkMode);
    toggleDarkMode.textContent = darkMode ? 'Modo Claro' : 'Modo Escuro';
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  });

  if (darkMode) {
    document.body.classList.add('dark-mode');
    document.querySelector('.container').classList.add('dark-mode');
    toggleDarkMode.textContent = 'Modo Claro';
  }

  const importMessages = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const importedMessages = content.split('\n').filter(line => line.trim()).map(line => {
          const text = line.replace(/^"|"$/g, '');
          return {
            text,
            dateAdded: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
            usageCount: 0
          };
        });
        messages = messages.concat(importedMessages);
        saveMessages();
        renderMessages();
        showNotification('Mensagens importadas');
      };
      reader.readAsText(file);
    }
  };

  importFile.addEventListener('change', importMessages);
  importButton.addEventListener('click', () => importFile.click());

  exportButton.addEventListener('click', () => {
    const content = messages.map(msg => `"${msg.text}"`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mensagens.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Mensagens exportadas');
  });

  confirmDelete.addEventListener('click', () => {
    if (messageToDeleteIndex !== null) {
      messages.splice(messageToDeleteIndex, 1);
      saveMessages();
      renderMessages();
      showNotification('Mensagem excluída');
      document.body.classList.remove('blur-background');
      popup.classList.remove('show');
      popup.style.display = 'none';
      messageToDeleteIndex = null;
    }
  });

  cancelDelete.addEventListener('click', () => {
    document.body.classList.remove('blur-background');
    popup.classList.remove('show');
    popup.style.display = 'none';
    messageToDeleteIndex = null;
  });

  document.addEventListener('click', (e) => {
    if (popup.classList.contains('show') && !popup.contains(e.target)) {
      document.body.classList.remove('blur-background');
      popup.classList.remove('show');
      popup.style.display = 'none';
      messageToDeleteIndex = null;
    }
  });

  renderMessages();
});
