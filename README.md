## Configuração e Instalação

Siga os passos abaixo para configurar e executar o projeto localmente:

1.  **Clone o Repositório** (ou baixe os arquivos para uma pasta em seu computador):
    ```bash
    git clone https://github.com/luisbenicio1/CadastroProduto-PPI.git
    cd CadastroProduto-PPI
    ```
2.  **Navegue até a Pasta do Projeto:**
    Se você baixou os arquivos manualmente, navegue até a pasta onde salvou o projeto.

3.  **Instale as Dependências:**
    Abra o terminal na pasta raiz do projeto e execute o seguinte comando para instalar todas as dependências listadas no arquivo `package.json`:
    ```bash
    npm install
    ```

## Executando a Aplicação

1.  Após a instalação das dependências, inicie o servidor com o comando:
    ```bash
    npm start
    ```

2.  O servidor será iniciado na porta `3000` (ou na porta definida em `server.js`). Você verá uma mensagem no console indicando que o servidor está rodando:
    ```
    Servidor rodando na porta 3000
    Acesse: http://localhost:3000
    ```

3.  **Acesse a Aplicação:**
    Abra seu navegador de preferência e navegue para:
    [http://localhost:3000](http://localhost:3000)

## Credenciais de Login (Exemplo)

Para fazer login no sistema, utilize as seguintes credenciais de exemplo (definidas em `server.js`):
* **Usuário:** `admin`
* **Senha:** `password123`
