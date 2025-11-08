# Canal de Denúncias – Plataforma

Este projeto contém o código de uma plataforma de recebimento, gestão e tratamento de denúncias.  A estrutura foi preparada para ser implantada por uma ferramenta de automação (como a do serviço solicitado) sem depender de passos manuais complexos.  Os arquivos estão no diretório raiz, organizados em duas partes — **backend** e **frontend** — que funcionam em conjunto para oferecer um serviço completo, simples de usar e configurável.

## Conteúdo

- **backend/** – aplicação Node que expõe uma interface HTTP para registro de casos, autenticação, chat e relatórios.  Inclui suporte a múltiplos clientes (multi‑tenant), controle de perfis, anonimato do denunciante e armazenamento em arquivos JSON para facilitar a instalação.
- **frontend/** – aplicação React que fornece as páginas visuais do sistema: login, painel, abertura de denúncia, área administrativa e gráficos.  A interface é responsiva, funcional em computadores e dispositivos móveis.

## Como usar

1. Instale as dependências na pasta do backend (necessário ter Node instalado):

   ```
   cd backend
   npm install
   ```

2. Configure a variável de segredo para gerar os tokens de acesso em `backend/.env`.  Já existe um valor padrão para testes, mas recomenda‑se alterar para um valor próprio.

3. Inicie o servidor:

   ```
   npm start
   ```

4. Em outra janela, instale e execute a aplicação do frontend:

   ```
   cd frontend
   npm install
   npm run dev
   ```

5. Acesse o endereço exibido no terminal (por padrão `http://localhost:5173`) para utilizar a interface.  O backend responde em `http://localhost:3000`.

Este repositório é apenas um ponto de partida.  Ele inclui exemplos básicos de integração com canais (através de arquivos stub), mas permite evoluir conforme as necessidades de cada organização.