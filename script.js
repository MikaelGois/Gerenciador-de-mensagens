document.addEventListener('DOMContentLoaded', () => {
  const addButton = document.getElementById('add-button');
  const messageInput = document.getElementById('message-input');

  const column1 = document.getElementById('column1');
  const column2 = document.getElementById('column2');

  const toggleDarkMode = document.getElementById('toggle-dark-mode');

  const notification = document.getElementById('notification');

  const deleteOption = document.getElementById('delete-option');
  const deletePopup = document.getElementById('delete-popup');
  const confirmDelete = document.getElementById('confirm-delete');
  const cancelDelete = document.getElementById('cancel-delete');

  const editOption = document.getElementById('edit-option');
  const editPopup = document.getElementById('edit-popup');
  const editMessageInput = document.getElementById('edit-message-input');
  const confirmEdit = document.getElementById('confirm-edit');
  const cancelEdit = document.getElementById('cancel-edit');

  const contextMenu = document.getElementById('context-menu');
  const sortSelect = document.getElementById('sort-select');


  const importFile = document.getElementById('import-file');
  const selectButton = document.getElementById('select-button');
  const importButton = document.getElementById('import-button');
  const exportButton = document.getElementById('export-button');
  const deleteSelectedButton = document.getElementById('delete-selected-button');

  const prevPage = document.getElementById('prev-page');
  const nextPage = document.getElementById('next-page');

  let messages = JSON.parse(localStorage.getItem('messages')) || [];
  let darkMode = JSON.parse(localStorage.getItem('darkMode')) || false;

  let messageToDeleteIndex = null;
  let messageToEditIndex = null;

  let currentPage = 1;
  const messagesPerPage = 10;

  let selectMode = false;
  let selectedMessages = new Set();

  const saveMessages = () => {
    localStorage.setItem('messages', JSON.stringify(messages));
  };

  // Adiciona mensagem - Funcionando
  addButton.addEventListener('click', () => {
    const messageText = messageInput.value.trim();
    if (messageText) {
      const newMessage = {
        text: messageText,
        dateAdded: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        usageCount: 0,
      };
      messages.push(newMessage);
      saveMessages();
      messageInput.value = '';
      renderMessages();
      showNotification('Mensagem adicionada com sucesso');
    }
  });

  // Notificação de confirmação
  const showNotification = (message) => {
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  };

  // Mostra mensagens
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

    // const start = (currentPage - 1) * messagesPerPage;
    // const end = start + messagesPerPage;
    // const paginatedMessages = sortedMessages.slice(start, end);

    sortedMessages.forEach((message, index) => {
      // paginatedMessages.forEach((message, index) => {
      const messageBox = document.createElement('div');
      messageBox.classList.add('message-box');
      messageBox.textContent = message.text;
      if (selectMode) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('message-checkbox');
        checkbox.checked = selectedMessages.has(start + index);
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            selectedMessages.add(start + index);
          } else {
            selectedMessages.delete(start + index);
          }
          updateButtons();
        });
        messageBox.appendChild(checkbox);
        messageBox.addEventListener('click', (e) => {
          if (e.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
          }
        });
      } else {
        // se estiver fora do modo de seleção, copia a mensagem para a área de transferência
        messageBox.addEventListener('click', () => {
          navigator.clipboard.writeText(message.text);
          message.usageCount += 1;
          message.lastUsed = new Date().toISOString();
          saveMessages();
          showNotification('Mensagem copiada para a área de transferência');
          renderMessages();
        });
      }
      // Adiciona um menu de contexto ao clicar com o botão direito do mouse - Funcionando
      messageBox.addEventListener('contextmenu', (e) => {
        if (!selectMode) {
          // Apresenta o menu de contexto apenas se o modo de seleção não estiver ativado
          e.preventDefault();
          // messageToEditIndex = start + index;
          // messageToDeleteIndex = start + index;
          contextMenu.style.top = `${e.clientY}px`;
          contextMenu.style.left = `${e.clientX}px`;
          contextMenu.style.display = 'block';
          contextMenu.classList.add('show');
          contextMenu.dataset.index = start + index;
          document.body.classList.add('blur-background');

          // contextMenu.addEventListener('click', () => {
          //     // Ao clicar em "Editar" - Quebrado
          //     confirmEdit.addEventListener('click', () => {
          //         if (messageToEditIndex !== null) {
          //             messages[messageToEditIndex].text = document.getElementById('edit-message-input').value;
          //             saveMessages();
          //             renderMessages();
          //             showNotification('Mensagem editada');
          //             document.body.classList.remove('blur-background');
          //             editPopup.classList.remove('show');
          //             editPopup.style.display = 'none';
          //             messageToEditIndex = null;
          //         }
          //     });

          //     cancelEdit.addEventListener('click', () => {
          //         document.body.classList.remove('blur-background');
          //         editPopup.classList.remove('show');
          //         editPopup.style.display = 'none';
          //         messageToEditIndex = null;
          //     });

          //     editOption.addEventListener('click', () => {
          //         messageToEditIndex = contextMenu.dataset.index;
          //         document.getElementById('edit-message-input').value = messages[messageToEditIndex].text;
          //         document.body.classList.add('blur-background');
          //         editPopup.classList.add('show');
          //         editPopup.style.display = 'block';
          //         contextMenu.style.display = 'none';
          //     });

          //     // Ao clicar em "Deletar" - Quebrado
          //     confirmDelete.addEventListener('click', () => {
          //         if (messageToDeleteIndex !== null) {
          //             messages.splice(messageToDeleteIndex, 1);
          //             saveMessages();
          //             renderMessages();
          //             showNotification('Mensagem excluída');
          //             document.body.classList.remove('blur-background');
          //             deletePopup.classList.remove('show');
          //             deletePopup.style.display = 'none';
          //             messageToDeleteIndex = null;
          //         }
          //     });

          //     cancelDelete.addEventListener('click', () => {
          //         document.body.classList.remove('blur-background');
          //         deletePopup.classList.remove('show');
          //         deletePopup.style.display = 'none';
          //         messageToDeleteIndex = null;
          //     });
          // });

          // e.preventDefault();
          // messageToEditIndex = start + index;
          // contextMenu.style.top = `${e.clientY}px`;
          // contextMenu.style.left = `${e.clientX}px`;
          // contextMenu.style.display = 'block';
          // document.body.classList.add('blur-background');
        }
      });

      if (index % 2 === 0) {
        column1.appendChild(messageBox);
      } else {
        column2.appendChild(messageBox);
      }
    });

    updateButtons();
  };

  // --- Inicio do menu de contexto - Parcialmente funcional

  // Ao clicar em "Editar" - Parcialmente funcional
  confirmEdit.addEventListener('click', () => {
    if (messageToEditIndex !== null) {
      messages[messageToEditIndex].text = document.getElementById('edit-message-input').value;
      saveMessages();
      renderMessages();
      showNotification('Mensagem editada');
      document.body.classList.remove('blur-background');
      editPopup.classList.remove('show');
      editPopup.style.display = 'none';
      messageToEditIndex = null;
    }
  });

  cancelEdit.addEventListener('click', () => {
    document.body.classList.remove('blur-background');
    editPopup.classList.remove('show');
    editPopup.style.display = 'none';
    messageToEditIndex = null;
  });

  editOption.addEventListener('click', () => {
    messageToEditIndex = contextMenu.dataset.index;
    document.getElementById('edit-message-input').value = messages[messageToEditIndex].text;
    document.body.classList.add('blur-background');
    editPopup.classList.add('show');
    editPopup.style.display = 'block';
    contextMenu.style.display = 'none';
  });

  // Ao clicar em "Deletar" - Funcionando
  confirmDelete.addEventListener('click', () => {
    if (messageToDeleteIndex !== null) {
      messages.splice(messageToDeleteIndex, 1);
      saveMessages();
      renderMessages();
      showNotification('Mensagem excluída');
      document.body.classList.remove('blur-background');
      deletePopup.classList.remove('show');
      deletePopup.style.display = 'none';
      messageToDeleteIndex = null;
    }
  });

  cancelDelete.addEventListener('click', () => {
    document.body.classList.remove('blur-background');
    deletePopup.classList.remove('show');
    deletePopup.style.display = 'none';
    messageToDeleteIndex = null;
  });

  deleteOption.addEventListener('click', () => {
    messageToDeleteIndex = contextMenu.dataset.index;
    document.body.classList.add('blur-background');
    deletePopup.classList.add('show');
    deletePopup.style.display = 'block';
    contextMenu.style.display = 'none';
  });

  // Cancela ao clicar fora do menu de contexto - Funcionando
  document.addEventListener('click', (e) => {
    if (contextMenu.style.display !== 'none') {
      if (contextMenu.classList.contains('show') && !contextMenu.contains(e.target)) {
        document.body.classList.remove('blur-background');
        contextMenu.style.display = 'none';
        contextMenu.classList.remove('show');
        messageToEditIndex = null;
        messageToDeleteIndex = null;
      }
    };
  });

  // --- Fim do menu de contexto

  // --- Inicio modo escuro

  // Modo escuro - Funcionando
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

  // --- Fim modo escuro


  // Habilita ou desabilita os botões de acordo com o modo de seleção - Funcionando
  const updateButtons = () => {
    if (selectMode) {
      importButton.disabled = true; // Desabilita o botão de importação
      exportButton.disabled = selectedMessages.size === 0; // Desabilita o botão de exportação se nenhuma mensagem estiver selecionada
      deleteSelectedButton.style.display = selectedMessages.size > 0 ? 'block' : 'none'; // Exibe o botão de exclusão se houver mensagens selecionadas
    } else {
      importButton.disabled = false; // Habilita o botão de importação
      exportButton.disabled = false; // Habilita o botão de exportação
      deleteSelectedButton.style.display = 'none'; // Oculta o botão de exclusão
    }
  };

  // Entra ou sai do modo de seleção - Funcionando
  const toggleSelectMode = () => {
    selectMode = !selectMode;
    selectedMessages.clear();
    selectButton.textContent = selectMode ? 'Cancelar Seleção' : 'Selecionar';
    renderMessages();
  };

  // Deleta mensagens selecionadas - Parcialmente funcional
  const deleteSelectedMessages = () => {
    messages = messages.filter((_, index) => !selectedMessages.has(index));
    selectedMessages.clear();
    saveMessages();
    renderMessages();
    showNotification('Mensagens deletadas com sucesso');
    // Deve sair do modo de seleção
  };

  // Exporta mensagens - Parcialmente funcional
  const exportMessages = () => {
    if (selectMode) {
      // Exporta apenas as mensagens selecionadas - Funcionando
      selected = messages.filter((_, index) => selectedMessages.has(index));
      // const blob = new Blob([JSON.stringify(selected)], { type: 'application/json' });
      const content = selected.map(msg => `"${msg.text}"`).join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mensagens_selecionadas.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('Mensagens selecionadas exportadas com sucesso!');
      // Deve sair do modo de seleção
    } else {
      // Exporta todas as mensagens - Funcionando
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
      showNotification('Mensagens exportadas com sucesso!');
    }
  };

  // Importa mensagens - Funcionando
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
        showNotification('Mensagens importadas com sucesso!');
      };
      reader.readAsText(file);
    }
  };

  importFile.addEventListener('change', importMessages);
  importButton.addEventListener('click', () => importFile.click());
  exportButton.addEventListener('click', exportMessages);
  selectButton.addEventListener('click', toggleSelectMode);
  deleteSelectedButton.addEventListener('click', deleteSelectedMessages);

  // Re-organiza a exibição das mensagens com base no filtro
  sortSelect.addEventListener('change', renderMessages);

  renderMessages();
});