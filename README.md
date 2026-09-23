# Gestão de Documentos

Aplicação web simples para gerenciar documentos (PDF, JPG ou PNG), permitindo upload e exclusão, além de manter um histórico de comentários associados a cada documento. Desenvolvida como parte da prova técnica para a vaga de Estagiário Desenvolvedor Full Stack.

## Tecnologias utilizadas

- **Back-end:** Node.js + Express
- **Upload de arquivos:** Multer (armazenamento local em `/uploads`)
- **Banco de dados:** SQLite (via `better-sqlite3`)
- **Front-end:** HTML, CSS e JavaScript puro (fetch API)

## Estrutura do projeto

```
doc-manager/
├── public/          # Front-end (HTML, CSS, JS)
├── uploads/          # Arquivos enviados pelos usuários
├── db.js             # Configuração e criação das tabelas do SQLite
├── server.js          # Servidor Express e rotas da API
├── package.json
└── README.md
```

## Como executar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor:
   ```bash
   npm start
   ```
3. Acesse no navegador:
   ```
   http://localhost:3000
   ```

O banco de dados (`database.db`) e a pasta `uploads/` são criados automaticamente na primeira execução.

### Rodando front-end e back-end separadamente (modo dev)

Por padrão o próprio Express serve o front-end (pasta `public/`) junto com a API, na mesma porta 3000. Se quiser rodar cada um separadamente:

1. **Back-end** (API, porta 3000):
   ```bash
   npm start
   ```
2. **Front-end** (arquivos estáticos, porta 5500), em outro terminal:
   ```bash
   npm run front
   ```
   Isso sobe apenas a pasta `public/` com o pacote `serve` em `http://localhost:5500`.
3. No arquivo `public/script.js`, altere a constante do topo:
   ```js
   const API_BASE_URL = 'http://localhost:3000';
   ```
   Isso faz o front (rodando na porta 5500) chamar a API no back-end (porta 3000).
   O back-end já tem CORS habilitado para aceitar essas chamadas.

Quando terminar de testar separado, lembre de voltar `API_BASE_URL` para `''` (vazio) se for usar o modo padrão, em que o Express serve tudo junto.

## Rotas da API

| Método | Rota                              | Descrição                              |
|--------|-----------------------------------|-----------------------------------------|
| POST   | `/documentos`                     | Envia um novo documento                 |
| GET    | `/documentos`                     | Lista todos os documentos               |
| GET    | `/documentos/:id`                 | Retorna detalhes de um documento        |
| DELETE | `/documentos/:id`                 | Exclui um documento, arquivo físico e seus comentários |
| POST   | `/documentos/:id/comentarios`     | Adiciona um comentário a um documento   |
| GET    | `/documentos/:id/comentarios`     | Lista os comentários de um documento    |

## Observações e limitações conhecidas

- Não há autenticação ou controle de acesso, conforme especificado na prova.
- Os arquivos são armazenados localmente no servidor (pasta `uploads/`); em ambientes de deploy com sistema de arquivos efêmero, os arquivos podem ser perdidos após reinicializações — recomenda-se usar um provedor com disco persistente (ex.: Render).
- Formatos de arquivo aceitos: PDF, JPG e PNG.

## Link do deploy

> Preencher após o deploy: `https://SEU-LINK-AQUI.onrender.com`