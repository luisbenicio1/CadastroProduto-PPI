const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session(
{
    secret: 'produto-session-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: 
    { 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

app.use(express.static('public'));

let produtos = [];

const usuarios = 
{
    'admin': 'admin123',
    'usuario': 'usu123'
};

function requireAuth(req, res, next) 
{
    if (req.session.usuario) 
    {
        next();
    } else 
    {
        res.status(401).send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Acesso Negado</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
                    .error { color: #d32f2f; }
                    .login-link { 
                        display: inline-block; 
                        margin-top: 20px; 
                        padding: 10px 20px; 
                        background: #1976d2; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 4px; 
                    }
                </style>
            </head>
            <body>
                <h2 class="error">Acesso Negado</h2>
                <p>Você precisa realizar o login para acessar esta página.</p>
                <a href="/login" class="login-link">Fazer Login</a>
            </body>
            </html>
        `);
    }
}

app.get('/', (req, res) => 
{
    if (req.session.usuario) 
    {
        res.redirect('/produtos');
    } else 
    {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => 
{
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login - Sistema de Produtos</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 40px; 
                    background: #f5f5f5;
                }
                .container { 
                    max-width: 400px; 
                    margin: 0 auto; 
                    background: white; 
                    padding: 30px; 
                    border-radius: 8px; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h2 { color: #333; text-align: center; margin-bottom: 30px; }
                .form-group { margin-bottom: 20px; }
                label { display: block; margin-bottom: 5px; font-weight: bold; }
                input { 
                    width: 100%; 
                    padding: 10px; 
                    border: 1px solid #ddd; 
                    border-radius: 4px; 
                    box-sizing: border-box;
                }
                button { 
                    width: 100%; 
                    padding: 12px; 
                    background: #1976d2; 
                    color: white; 
                    border: none; 
                    border-radius: 4px; 
                    cursor: pointer; 
                    font-size: 16px;
                }
                button:hover { background: #1565c0; }
                .info { 
                    margin-top: 20px; 
                    padding: 15px; 
                    background: #e3f2fd; 
                    border-radius: 4px; 
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Sistema de Cadastro de Produtos</h2>
                <form method="POST" action="/login">
                    <div class="form-group">
                        <label for="usuario">Usuário:</label>
                        <input type="text" id="usuario" name="usuario" required>
                    </div>
                    <div class="form-group">
                        <label for="senha">Senha:</label>
                        <input type="password" id="senha" name="senha" required>
                    </div>
                    <button type="submit">Entrar</button>
                </form>
                <div class="info">
                    <strong>Usuários de teste:</strong><br>
                    • admin / admin123<br>
                    • usuario / usu123
                </div>
            </div>
        </body>
        </html>
    `);
});

app.post('/login', (req, res) => 
{
    const { usuario, senha } = req.body;
    
    if (usuarios[usuario] && usuarios[usuario] === senha) 
    {
        req.session.usuario = usuario;
        
        const agora = new Date();
        res.cookie('ultimoAcesso', agora.toLocaleString('pt-BR'), 
        {
            maxAge: 30 * 24 * 60 * 60 * 1000, 
            httpOnly: false
        });
        
        res.redirect('/produtos');
    } else 
    {
        res.send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Erro de Login</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
                    .error { color: #d32f2f; }
                </style>
            </head>
            <body>
                <h2 class="error">Credenciais inválidas!</h2>
                <p>Usuário ou senha incorretos.</p>
                <a href="/login">Tentar novamente</a>
            </body>
            </html>
        `);
    }
});

app.get('/produtos', requireAuth, (req, res) => 
{
    const ultimoAcesso = req.cookies.ultimoAcesso || 'Primeiro acesso';
    
    const tabelaProdutos = produtos.length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>Código de Barras</th>
                    <th>Descrição</th>
                    <th>Preço Custo</th>
                    <th>Preço Venda</th>
                    <th>Data Validade</th>
                    <th>Estoque</th>
                    <th>Fabricante</th>
                </tr>
            </thead>
            <tbody>
                ${produtos.map(produto => `
                    <tr>
                        <td>${produto.codigoBarras}</td>
                        <td>${produto.descricao}</td>
                        <td>R$ ${parseFloat(produto.precoCusto).toFixed(2)}</td>
                        <td>R$ ${parseFloat(produto.precoVenda).toFixed(2)}</td>
                        <td>${produto.dataValidade}</td>
                        <td>${produto.qtdEstoque}</td>
                        <td>${produto.nomeFabricante}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '<p>Nenhum produto cadastrado ainda.</p>';

    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cadastro de Produtos</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    background: #f5f5f5;
                }
                .header { 
                    background: white; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .user-info { font-size: 14px; color: #666; }
                .logout { 
                    background: #d32f2f; 
                    color: white; 
                    padding: 8px 16px; 
                    text-decoration: none; 
                    border-radius: 4px;
                }
                .container { 
                    max-width: 1200px; 
                    margin: 0 auto;
                }
                .form-container { 
                    background: white; 
                    padding: 30px; 
                    border-radius: 8px; 
                    margin-bottom: 30px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .form-row { 
                    display: flex; 
                    gap: 20px; 
                    margin-bottom: 20px;
                }
                .form-group { 
                    flex: 1;
                    min-width: 200px;
                }
                label { 
                    display: block; 
                    margin-bottom: 5px; 
                    font-weight: bold;
                }
                input, select { 
                    width: 100%; 
                    padding: 10px; 
                    border: 1px solid #ddd; 
                    border-radius: 4px; 
                    box-sizing: border-box;
                }
                button { 
                    background: #4caf50; 
                    color: white; 
                    padding: 12px 30px; 
                    border: none; 
                    border-radius: 4px; 
                    cursor: pointer; 
                    font-size: 16px;
                }
                button:hover { background: #45a049; }
                .table-container { 
                    background: white; 
                    padding: 30px; 
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px;
                }
                th, td { 
                    padding: 12px; 
                    text-align: left; 
                    border-bottom: 1px solid #ddd;
                }
                th { 
                    background: #f5f5f5; 
                    font-weight: bold;
                }
                tr:hover { background: #f9f9f9; }
                h2 { color: #333; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <h1>Sistema de Cadastro de Produtos</h1>
                    <div class="user-info">
                        Usuário logado: <strong>${req.session.usuario}</strong><br>
                        Último acesso: <strong>${ultimoAcesso}</strong>
                    </div>
                </div>
                <a href="/logout" class="logout">Sair</a>
            </div>

            <div class="container">
                <div class="form-container">
                    <h2>Cadastrar Novo Produto</h2>
                    <form method="POST" action="/produtos">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="codigoBarras">Código de Barras:</label>
                                <input type="text" id="codigoBarras" name="codigoBarras" required>
                            </div>
                            <div class="form-group">
                                <label for="descricao">Descrição do Produto:</label>
                                <input type="text" id="descricao" name="descricao" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="precoCusto">Preço de Custo (R$):</label>
                                <input type="number" step="0.01" id="precoCusto" name="precoCusto" required>
                            </div>
                            <div class="form-group">
                                <label for="precoVenda">Preço de Venda (R$):</label>
                                <input type="number" step="0.01" id="precoVenda" name="precoVenda" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="dataValidade">Data de Validade:</label>
                                <input type="date" id="dataValidade" name="dataValidade" required>
                            </div>
                            <div class="form-group">
                                <label for="qtdEstoque">Quantidade em Estoque:</label>
                                <input type="number" id="qtdEstoque" name="qtdEstoque" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="nomeFabricante">Nome do Fabricante:</label>
                                <input type="text" id="nomeFabricante" name="nomeFabricante" required>
                            </div>
                        </div>
                        
                        <button type="submit">Cadastrar Produto</button>
                    </form>
                </div>

                <div class="table-container">
                    <h2>Produtos Cadastrados (${produtos.length} produtos)</h2>
                    ${tabelaProdutos}
                </div>
            </div>
        </body>
        </html>
    `);
});

app.post('/produtos', requireAuth, (req, res) => 
{
    const     
    {
        codigoBarras,
        descricao,
        precoCusto,
        precoVenda,
        dataValidade,
        qtdEstoque,
        nomeFabricante
    } = req.body;

    if (!codigoBarras || !descricao || !precoCusto || !precoVenda || 
        !dataValidade || !qtdEstoque || !nomeFabricante) {
        return res.status(400).send('Todos os campos são obrigatórios');
    }

    const produtoExistente = produtos.find(p => p.codigoBarras === codigoBarras);
    if (produtoExistente) 
    {
        return res.status(400).send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Erro</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
                    .error { color: #d32f2f; }
                </style>
            </head>
            <body>
                <h2 class="error">Erro no Cadastro</h2>
                <p>Já existe um produto com o código de barras: ${codigoBarras}</p>
                <a href="/produtos">Voltar</a>
            </body>
            </html>
        `);
    }

    const novoProduto = 
    {
        codigoBarras,
        descricao,
        precoCusto: parseFloat(precoCusto),
        precoVenda: parseFloat(precoVenda),
        dataValidade,
        qtdEstoque: parseInt(qtdEstoque),
        nomeFabricante,
        dataCadastro: new Date().toLocaleString('pt-BR')
    };

    produtos.push(novoProduto);

    res.redirect('/produtos');
});

app.get('/logout', (req, res) => 
{
    req.session.destroy((err) => 
    {
        if (err) 
        {
            console.error('Erro ao destruir sessão:', err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});
