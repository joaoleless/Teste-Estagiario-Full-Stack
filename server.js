// server.js
// Servidor principal: rotas de documentos e comentarios.

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Permite que o front-end, quando rodado em outra porta/origem, chame esta API
app.use(cors());

// Garante que a pasta de uploads existe
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOAD_DIR)); // permite visualizar/baixar o arquivo

// Configuracao do Multer (upload de arquivos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extensao = path.extname(file.originalname);
    cb(null, `${timestamp}${extensao}`);
  }
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png'];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo nao permitido. Use PDF, JPG ou PNG.'));
  }
};

const upload = multer({ storage, fileFilter });

// ---------- ROTAS DE DOCUMENTOS ----------

// POST /documentos -> upload de um novo documento
app.post('/documentos', upload.single('arquivo'), (req, res) => {
  try {
    const { titulo, descricao } = req.body;

    if (!titulo || !req.file) {
      return res.status(400).json({ erro: 'Titulo e arquivo sao obrigatorios.' });
    }

    const stmt = db.prepare(`
      INSERT INTO documentos (titulo, descricao, nome_arquivo, caminho_arquivo, data_upload)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      titulo,
      descricao || '',
      req.file.originalname,
      `/uploads/${req.file.filename}`,
      new Date().toISOString()
    );

    res.status(201).json({ id: info.lastInsertRowid, mensagem: 'Documento cadastrado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao salvar documento.' });
  }
});

// GET /documentos -> lista todos os documentos
app.get('/documentos', (req, res) => {
  try {
    const documentos = db.prepare(`
      SELECT id, titulo, descricao, nome_arquivo, caminho_arquivo, data_upload
      FROM documentos
      ORDER BY data_upload DESC
    `).all();

    res.json(documentos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar documentos.' });
  }
});

// GET /documentos/:id -> detalhe de um documento (usado na tela de comentarios)
app.get('/documentos/:id', (req, res) => {
  const documento = db.prepare('SELECT * FROM documentos WHERE id = ?').get(req.params.id);
  if (!documento) return res.status(404).json({ erro: 'Documento nao encontrado.' });
  res.json(documento);
});

// DELETE /documentos/:id -> exclui um documento e o arquivo fisico
app.delete('/documentos/:id', (req, res) => {
  try {
    const documento = db.prepare('SELECT * FROM documentos WHERE id = ?').get(req.params.id);
    if (!documento) return res.status(404).json({ erro: 'Documento nao encontrado.' });

    db.prepare('DELETE FROM documentos WHERE id = ?').run(req.params.id);

    const filePath = path.join(__dirname, documento.caminho_arquivo);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ mensagem: 'Documento excluido com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir documento.' });
  }
});

// ---------- ROTAS DE COMENTARIOS ----------

// POST /documentos/:id/comentarios -> adiciona um comentario a um documento
app.post('/documentos/:id/comentarios', (req, res) => {
  try {
    const { id } = req.params;
    const { texto } = req.body;

    if (!texto || !texto.trim()) {
      return res.status(400).json({ erro: 'O comentario nao pode ser vazio.' });
    }

    const documento = db.prepare('SELECT id FROM documentos WHERE id = ?').get(id);
    if (!documento) return res.status(404).json({ erro: 'Documento nao encontrado.' });

    const stmt = db.prepare(`
      INSERT INTO comentarios (documento_id, texto, data_hora)
      VALUES (?, ?, ?)
    `);
    const info = stmt.run(id, texto.trim(), new Date().toISOString());

    res.status(201).json({ id: info.lastInsertRowid, mensagem: 'Comentario adicionado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao adicionar comentario.' });
  }
});

// GET /documentos/:id/comentarios -> lista comentarios de um documento
app.get('/documentos/:id/comentarios', (req, res) => {
  try {
    const comentarios = db.prepare(`
      SELECT id, texto, data_hora
      FROM comentarios
      WHERE documento_id = ?
      ORDER BY data_hora ASC
    `).all(req.params.id);

    res.json(comentarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar comentarios.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});