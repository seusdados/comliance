# Canal de Denúncias – Plataforma

Este projeto contém o código de uma plataforma de recebimento, gestão e tratamento de denúncias.  A estrutura foi preparada para ser implantada por uma ferramenta de automação (como a do serviço solicitado) sem depender de passos manuais complexos.  Os arquivos estão no diretório raiz, organizados em duas partes — **backend** e **frontend** — que funcionam em conjunto para oferecer um serviço completo, simples de usar e configurável.

## Conteúdo

- **backend/** – aplicação Node que expõe uma interface HTTP para registro de casos, autenticação, chat e relatórios.  Inclui suporte a múltiplos clientes (multi‑tenant), controle de perfis, anonimato do denunciante e armazenamento em arquivos JSON para facilitar a instalação.  Agora traz módulos de IA (classificação de categoria e resumo simples), um cofre de identidades com criptografia AES‑256‑GCM e stubs de integração com Instagram, Facebook, WhatsApp e e‑mail.
  Esta versão adiciona módulos prontos para integração real com os principais canais: Instagram (Graph API), Facebook Messenger, WhatsApp Business (Cloud API), e‑mail (SMTP) e telefone (Twilio).  As chamadas externas são encapsuladas em serviços que utilizam variáveis de ambiente para receber suas chaves.  No backend você encontrará endpoints de webhook (`/api/webhooks/instagram`, `/api/webhooks/facebook`, `/api/webhooks/whatsapp`, `/api/webhooks/email` e `/api/webhooks/phone`) que recebem os eventos enviados por cada canal e abrem novos casos automaticamente, preservando o anonimato do remetente.

  Além dos webhooks, é possível acionar observadores (polling) para os canais Instagram, Facebook e WhatsApp por meio do módulo `backend/integrations/watchers.js`.  Para habilitá‑los, defina `ENABLE_INTEGRATION_WATCHERS=true` e ative cada serviço com as variáveis `ENABLE_INSTAGRAM_POLL`, `ENABLE_FACEBOOK_POLL` e `ENABLE_WHATSAPP_POLL`.  Esses observadores consultam periodicamente as APIs oficiais para capturar novas mensagens e as encaminham para as rotas internas.

  Foram incluídos ainda um cofre de mensagens cifradas e de identidades (AES‑256‑GCM), um módulo de transcrição de áudio via API externa, um módulo de resumo e classificação, e um módulo de **avaliação de prioridade** que atribui a cada denúncia um nível (baixo, médio ou alto) com base em heurísticas.  O workflow básico permite atribuir responsáveis a um caso e avançar seu status entre as etapas “novo”, “triagem” e “em investigação”.

  A versão atual adiciona suporte opcional a **automação avançada**.  Definindo `USE_ADVANCED_AI=true` e configurando os serviços externos apropriados no `.env`, o sistema passa a:

  - Transcrever automaticamente áudios para texto utilizando um serviço de reconhecimento de fala.
  - Traduzir relatos recebidos em outros idiomas para o idioma padrão do sistema antes da análise.
  - Enviar o texto para um serviço de IA capaz de sugerir categorias e priorizar casos com base em padrões mais complexos do que simples palavras‑chave.

  Essas funcionalidades são descritas e reguladas no documento `POLITICAS.md`.
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