// script.js
// Logica do front-end: upload, listagem e comentarios via fetch.

// URL base da API.
// - Se o front for servido PELO PRÓPRIO Express (junto com o back), deixe vazio ('').
// - Se o front for servido separadamente (ex.: outra porta, live-server, etc.),
//   troque para o endereço do back-end, ex.: 'http://localhost:3000'.
const API_BASE_URL = '';

const formUpload = document.getElementById('form-upload');
const msgUpload = document.getElementById('msg-upload');
const listaDocumentos = document.getElementById('lista-documentos');

const modal = document.getElementById('modal-comentarios');
const fecharModal = document.getElementById('fechar-modal');
const modalTitulo = document.getElementById('modal-titulo-documento');
const listaComentarios = document.getElementById('lista-comentarios');
const formComentario = document.getElementById('form-comentario');
const textoComentario = document.getElementById('texto-comentario');

let documentoAtualId = null;

// ---------- Carregar lista de documentos ----------
async function carregarDocumentos() {
  try {
    const resposta = await fetch(`${API_BASE_URL}/documentos`);
    const documentos = await resposta.json();

    listaDocumentos.innerHTML = '';

    documentos.forEach((doc) => {
      const linha = document.createElement('tr');
      const dataFormatada = new Date(doc.data_upload).toLocaleString('pt-BR');

      linha.innerHTML = `
        <td>${doc.titulo}</td>
        <td>${dataFormatada}</td>
        <td>
          <a class="acao" href="${API_BASE_URL}${doc.caminho_arquivo}" target="_blank">Ver/Baixar</a>
          <a class="acao" href="#" data-id="${doc.id}" data-titulo="${doc.titulo}">Comentários</a>
        </td>
      `;

      listaDocumentos.appendChild(linha);
    });

    // Liga o clique do botao "Comentarios" de cada linha
    document.querySelectorAll('[data-id]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        abrirModalComentarios(link.dataset.id, link.dataset.titulo);
      });
    });
  } catch (erro) {
    console.error('Erro ao carregar documentos:', erro);
  }
}

// ---------- Envio de novo documento ----------
formUpload.addEventListener('submit', async (e) => {
  e.preventDefault();
  msgUpload.textContent = '';

  const formData = new FormData(formUpload);

  try {
    const resposta = await fetch(`${API_BASE_URL}/documentos`, {
      method: 'POST',
      body: formData
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      msgUpload.textContent = dados.erro || 'Erro ao enviar documento.';
      msgUpload.style.color = 'red';
      return;
    }

    msgUpload.textContent = 'Documento enviado com sucesso!';
    msgUpload.style.color = 'green';
    formUpload.reset();
    carregarDocumentos();
  } catch (erro) {
    console.error(erro);
    msgUpload.textContent = 'Erro de conexão ao enviar documento.';
    msgUpload.style.color = 'red';
  }
});

// ---------- Modal de comentários ----------
async function abrirModalComentarios(id, titulo) {
  documentoAtualId = id;
  modalTitulo.textContent = `Comentários — ${titulo}`;
  modal.classList.remove('oculto');
  await carregarComentarios(id);
}

async function carregarComentarios(id) {
  try {
    const resposta = await fetch(`${API_BASE_URL}/documentos/${id}/comentarios`);
    const comentarios = await resposta.json();

    listaComentarios.innerHTML = '';

    if (comentarios.length === 0) {
      listaComentarios.innerHTML = '<p>Nenhum comentário ainda.</p>';
      return;
    }

    comentarios.forEach((c) => {
      const div = document.createElement('div');
      div.className = 'comentario';
      const dataFormatada = new Date(c.data_hora).toLocaleString('pt-BR');
      div.innerHTML = `<span>${c.texto}</span><small>${dataFormatada}</small>`;
      listaComentarios.appendChild(div);
    });
  } catch (erro) {
    console.error('Erro ao carregar comentários:', erro);
  }
}

formComentario.addEventListener('submit', async (e) => {
  e.preventDefault();

  const texto = textoComentario.value.trim();
  if (!texto) return;

  try {
    const resposta = await fetch(`${API_BASE_URL}/documentos/${documentoAtualId}/comentarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto })
    });

    if (resposta.ok) {
      textoComentario.value = '';
      carregarComentarios(documentoAtualId);
    }
  } catch (erro) {
    console.error('Erro ao adicionar comentário:', erro);
  }
});

fecharModal.addEventListener('click', () => {
  modal.classList.add('oculto');
});

// Fecha o modal clicando fora dele
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.add('oculto');
});

// Carrega a lista assim que a página abre
carregarDocumentos();