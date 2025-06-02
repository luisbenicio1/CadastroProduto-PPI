const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session(
  {
    secret: 'seu-segredo-super-secreto-aqui', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
  }
));

app.use(express.static(path.join(__dirname, 'public')));

let users = [
  { username: 'admin', password: 'password123' } 
];
let products = [];

function isAuthenticated(req, res, next)
{
  if (req.session.user)
  {
    return next();
  }
  res.redirect('/login.html?message=Você precisa realizar o login.');
}

app.get('/', (req, res) =>
  {
    if (req.session.user)
    {
      res.redirect('/cadastro-produto');
    }
    else
    {
      res.redirect('/login.html');
    }
  }
);

app.post('/login', (req, res) =>
  {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user)
    {
      req.session.user = { username: user.username };

      const now = new Date();
      const lastAccess = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      res.cookie('lastAccess', lastAccess, { maxAge: 900000, httpOnly: true }); 

      res.redirect('/cadastro-produto');
    }
    else
    {
      res.redirect('/login.html?message=Usuário ou senha inválidos.');
    }
  }
);

app.get('/cadastro-produto', isAuthenticated, (req, res) =>
  {
    res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
  }
);

app.post('/cadastrar-produto', isAuthenticated, (req, res) =>
  {
    const {
      codigoBarras,
      descricaoProduto,
      precoCusto,
      precoVenda,
      dataValidade,
      qtdEstoque,
      nomeFabricante
    } = req.body;

    if (!codigoBarras || !descricaoProduto || !precoCusto || !precoVenda)
    {
      return res.status(400).redirect('/cadastro-produto?message=Preencha os campos obrigatórios.');
    }

    const newProduct = {
      id: products.length + 1, 
      codigoBarras,
      descricaoProduto,
      precoCusto: parseFloat(precoCusto),
      precoVenda: parseFloat(precoVenda),
      dataValidade,
      qtdEstoque: parseInt(qtdEstoque),
      nomeFabricante
    };

    products.push(newProduct);

    const now = new Date();
    const lastAccess = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    res.cookie('lastAccess', lastAccess, { maxAge: 900000, httpOnly: true });

    res.redirect('/cadastro-produto'); 
  }
);

app.get('/api/produtos', isAuthenticated, (req, res) =>
  {
    res.json(products);
  }
);

app.get('/api/session-info', isAuthenticated, (req, res) =>
  {
    const lastAccessFromCookie = req.cookies.lastAccess || 'Nenhum acesso registrado ainda.';
    res.json(
      {
        username: req.session.user.username,
        lastAccess: lastAccessFromCookie
      }
    );
  }
);

app.get('/logout', (req, res) =>
  {
    req.session.destroy(err =>
      {
        if (err)
        {
          return res.redirect('/cadastro-produto'); 
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/login.html?message=Logout realizado com sucesso.');
      }
    );
  }
);

app.listen(PORT, () =>
  {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
  }
);
