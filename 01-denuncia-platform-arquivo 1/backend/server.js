const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Carrega variáveis de ambiente
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'canal-denuncia-segredo';

app.use(cors());
app.use(express.json());

// Diretório onde os arquivos JSON são armazenados
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Funções utilitárias para ler e gravar arquivos JSON
function loadData(filename) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  try {
    return content ? JSON.parse(content) : [];
  } catch (err) {
    console.error('Erro ao ler', filename, err);
    return [];
  }
}

function saveData(filename, data) {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Carrega usuários e casos da base de dados (JSON)
let users = loadData('users.json');
let cases = loadData('cases.json');

// Se não existir usuário administrador, cria um padrão
if (users.length === 0) {
  const adminId = uuidv4();
  users.push({
    id: adminId,
    tenantId: 'default',
    name: 'Administrador',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  });
  saveData('users.json', users);
}

// Middleware para identificar o tenant a partir do cabeçalho
function tenantMiddleware(req, res, next) {
  const tenantId = req.headers['x-tenant-id'] || 'default';
  req.tenantId = tenantId;
  next();
}
app.use(tenantMiddleware);

// Middleware de autenticação por token
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ mensagem: 'Token não fornecido' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ mensagem: 'Token inválido' });
    }
    req.user = decoded;
    next();
  });
}

// Middleware para verificar perfil do usuário
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ mensagem: 'Sem permissão' });
    }
    next();
  };
}

// Rota de registro de usuário (somente administradores podem criar usuários)
app.post('/api/auth/register', authMiddleware, requireRole('admin'), (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ mensagem: 'Nome, e‑mail, senha e perfil são obrigatórios' });
  }
  // Verifica se já existe o e‑mail
  if (users.find(u => u.email === email && u.tenantId === req.tenantId)) {
    return res.status(400).json({ mensagem: 'Usuário já existe' });
  }
  const id = uuidv4();
  const newUser = { id, tenantId: req.tenantId, name, email, password, role };
  users.push(newUser);
  saveData('users.json', users);
  return res.status(201).json({ mensagem: 'Usuário criado', user: { id, name, email, role } });
});

// Rota de login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const tenantId = req.tenantId;
  const user = users.find(u => u.email === email && u.password === password && u.tenantId === tenantId);
  if (!user) {
    return res.status(401).json({ mensagem: 'Credenciais inválidas' });
  }
  const payload = { id: user.id, tenantId: user.tenantId, role: user.role, name: user.name };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '4h' });
  res.json({ token, user: payload });
});

// Obter usuários (somente administradores e diretores)
app.get('/api/users', authMiddleware, requireRole('admin', 'ceo'), (req, res) => {
  const tenantUsers = users.filter(u => u.tenantId === req.tenantId).map(u => {
    return { id: u.id, name: u.name, email: u.email, role: u.role };
  });
  res.json({ users: tenantUsers });
});

// Criar novo caso (qualquer usuário logado)
app.post('/api/cases', authMiddleware, (req, res) => {
  const { title, description, category, anonymous } = req.body;
  if (!title || !description) {
    return res.status(400).json({ mensagem: 'Título e descrição são obrigatórios' });
  }
  const newCase = {
    id: uuidv4(),
    tenantId: req.tenantId,
    title,
    description,
    category: category || null,
    status: 'novo',
    createdAt: new Date().toISOString(),
    createdBy: anonymous ? null : req.user.id,
    anonymous: !!anonymous,
    messages: []
  };
  cases.push(newCase);
  saveData('cases.json', cases);
  return res.status(201).json({ mensagem: 'Caso criado', case: newCase });
});

// Listar casos do tenant (visões diferentes conforme perfil)
app.get('/api/cases', authMiddleware, (req, res) => {
  const tenantCases = cases.filter(c => c.tenantId === req.tenantId);
  let result;
  // Perfis com visão ampliada
  if (['admin', 'ceo', 'triage', 'investigator'].includes(req.user.role)) {
    result = tenantCases;
  } else {
    // Usuário comum vê apenas os casos que abriu
    result = tenantCases.filter(c => c.createdBy === req.user.id);
  }
  res.json({ cases: result });
});

// Obter detalhes de um caso
app.get('/api/cases/:id', authMiddleware, (req, res) => {
  const caseId = req.params.id;
  const found = cases.find(c => c.id === caseId && c.tenantId === req.tenantId);
  if (!found) {
    return res.status(404).json({ mensagem: 'Caso não encontrado' });
  }
  // Permissões: administradores, diretores, triagem, investigador ou dono
  if (!['admin', 'ceo', 'triage', 'investigator'].includes(req.user.role) && found.createdBy !== req.user.id) {
    return res.status(403).json({ mensagem: 'Sem permissão para este caso' });
  }
  res.json({ case: found });
});

// Adicionar mensagem a um caso
app.post('/api/cases/:id/messages', authMiddleware, (req, res) => {
  const caseId = req.params.id;
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ mensagem: 'Mensagem vazia' });
  }
  const foundIndex = cases.findIndex(c => c.id === caseId && c.tenantId === req.tenantId);
  if (foundIndex < 0) {
    return res.status(404).json({ mensagem: 'Caso não encontrado' });
  }
  const caseItem = cases[foundIndex];
  // Verifica permissão
  if (!['admin', 'ceo', 'triage', 'investigator'].includes(req.user.role) && caseItem.createdBy !== req.user.id) {
    return res.status(403).json({ mensagem: 'Sem permissão para este caso' });
  }
  const message = {
    id: uuidv4(),
    author: req.user.id,
    content,
    createdAt: new Date().toISOString()
  };
  caseItem.messages.push(message);
  cases[foundIndex] = caseItem;
  saveData('cases.json', cases);
  res.status(201).json({ mensagem: 'Mensagem adicionada', message });
});

// Atualizar status do caso (apenas triagem, investigador, administradores ou diretores)
app.patch('/api/cases/:id', authMiddleware, requireRole('admin', 'ceo', 'triage', 'investigator'), (req, res) => {
  const caseId = req.params.id;
  const { status } = req.body;
  const foundIndex = cases.findIndex(c => c.id === caseId && c.tenantId === req.tenantId);
  if (foundIndex < 0) {
    return res.status(404).json({ mensagem: 'Caso não encontrado' });
  }
  cases[foundIndex].status = status || cases[foundIndex].status;
  saveData('cases.json', cases);
  res.json({ mensagem: 'Atualizado', case: cases[foundIndex] });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`API iniciada na porta ${PORT}`);
});