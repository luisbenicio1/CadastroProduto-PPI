async function carregarInfoSessao()
{
    try
    {
        const response = await fetch('/api/session-info');
        if (!response.ok)
        {
            if (response.status === 401 || response.status === 403)
            {
                window.location.href = '/login.html?message=Sessão expirada. Faça login novamente.';
                return;
            }
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const data = await response.json();
        document.getElementById('username-display').textContent = data.username;
        document.getElementById('last-access-display').textContent = data.lastAccess;
    }
    catch (error)
    {
        console.error('Erro ao buscar informações da sessão:', error);
        document.getElementById('username-display').textContent = 'Erro';
        document.getElementById('last-access-display').textContent = 'Não disponível';
        window.location.href = '/login.html?message=Erro ao carregar dados da sessão.';
    }
}

async function carregarProdutos()
{
    try
    {
        const response = await fetch('/api/produtos');
        if (!response.ok)
        {
             if (response.status === 401 || response.status === 403)
            {
                window.location.href = '/login.html?message=Sessão expirada. Faça login novamente para ver os produtos.';
                return;
            }
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const produtos = await response.json();
        const tabelaBody = document.getElementById('tabela-produtos').getElementsByTagName('tbody')[0];
        const pNenhumProduto = document.getElementById('nenhum-produto');

        tabelaBody.innerHTML = ''; 

        if (produtos.length === 0)
        {
            pNenhumProduto.style.display = 'block';
            document.getElementById('tabela-produtos').style.display = 'none';
        }
        else
        {
            pNenhumProduto.style.display = 'none';
            document.getElementById('tabela-produtos').style.display = 'table';
            produtos.forEach(produto =>
                {
                    const row = tabelaBody.insertRow();
                    row.insertCell().textContent = produto.id;
                    row.insertCell().textContent = produto.codigoBarras;
                    row.insertCell().textContent = produto.descricaoProduto;
                    row.insertCell().textContent = `R$ ${produto.precoCusto.toFixed(2)}`;
                    row.insertCell().textContent = `R$ ${produto.precoVenda.toFixed(2)}`;
                    row.insertCell().textContent = produto.dataValidade ? new Date(produto.dataValidade).toLocaleDateString('pt-BR') : 'N/A';
                    row.insertCell().textContent = produto.qtdEstoque || 'N/A';
                    row.insertCell().textContent = produto.nomeFabricante || 'N/A';
                }
            );
        }
    }
    catch (error)
    {
        console.error('Erro ao buscar produtos:', error);
        const pNenhumProduto = document.getElementById('nenhum-produto');
        pNenhumProduto.textContent = 'Erro ao carregar produtos.';
        pNenhumProduto.style.display = 'block';
        document.getElementById('tabela-produtos').style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () =>
    {
        if (document.getElementById('tabela-produtos'))
        {
            carregarInfoSessao();
            carregarProdutos();
        }

        const urlParams = new URLSearchParams(window.location.search);
        const message = urlParams.get('message');
        const messageElement = document.getElementById('message'); 
        if (message && messageElement)
        {
            messageElement.textContent = decodeURIComponent(message);
        }
    }
);