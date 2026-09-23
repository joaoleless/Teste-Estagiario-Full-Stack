// db.js
// Configura o banco SQLite (arquivo local) e cria as tabelas necessarias.

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'database.db'));

// Habilita chaves estrangeiras (necessario no SQLite)
db.pragma('foreign_keys = ON');

// Tabela de documentos
db.exec(`
  CREATE TABLE IF NOT EXISTS documentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    nome_arquivo TEXT NOT NULL,
    caminho_arquivo TEXT NOT NULL,
    data_upload TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )
`);

// Tabela de comentarios, vinculada a documentos
db.exec(`
  CREATE TABLE IF NOT EXISTS comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    documento_id INTEGER NOT NULL,
    texto TEXT NOT NULL,
    data_hora TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (documento_id) REFERENCES documentos (id) ON DELETE CASCADE
  )
`);

export default db;