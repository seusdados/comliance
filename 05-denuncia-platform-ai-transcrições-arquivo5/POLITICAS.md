# Políticas e Diretrizes do Canal de Denúncias

Este documento resume as políticas de segurança, privacidade e integração para o canal de denúncias. As instruções aqui descritas têm por objetivo garantir o sigilo do denunciante, a conformidade com legislações aplicáveis (como LGPD/GDPR) e a interoperabilidade segura com outros sistemas.

## Privacidade e Proteção de Dados

* **Anonimato por padrão** – Denunciantes podem optar por enviar relatos sem se identificar. Quando o modo anônimo é utilizado, nenhum dado pessoal é coletado além do necessário para responder ao relato. O sistema não armazena endereço IP ou localização do remetente.
* **Cofre de Identidades** – Informações sensíveis de usuários identificados são criptografadas com AES‑256‑GCM e armazenadas separadamente das denúncias. O acesso a essas informações é restrito e monitorado.
* **Criptografia de Mensagens** – O conteúdo de cada mensagem é cifrado antes de ser persistido em armazenamento. Apenas usuários autorizados podem descriptografar mensagens para fins de investigação.
* **Retenção de Dados** – Os casos e seus dados associados são mantidos pelo prazo estritamente necessário para atender às obrigações legais e contratuais. Passado esse período, são eliminados de forma segura.
* **Auditoria e Registro** – Todas as operações críticas (criação, visualização, atribuição, alteração de status, exportação) geram eventos de auditoria contendo o responsável, o horário e o motivo da ação, sem expor dados pessoais.

## Integrações Externas

* **Webhooks e Observadores** – A plataforma fornece rotas internas (`/api/webhooks/instagram`, `/api/webhooks/facebook`, `/api/webhooks/whatsapp`, `/api/webhooks/email`, `/api/webhooks/phone`) que recebem eventos de canais externos. Sempre que possível, configure webhooks diretos nos provedores (Meta, provedores de e‑mail, Twilio, etc.) para encaminhar mensagens a essas rotas.
* **Polling controlado** – Para situações em que webhooks não estejam disponíveis, o módulo `backend/integrations/watchers.js` pode ser ativado via variáveis de ambiente (por exemplo, `ENABLE_INSTAGRAM_POLL=true`) para realizar consultas periódicas. Estes observadores usam tokens de acesso definidos no arquivo `.env` e encaminham apenas mensagens novas para a API interna.
* **Segurança de Tokens** – Todos os tokens e credenciais de acesso a APIs externas devem ser armazenados em variáveis de ambiente e nunca em código fonte. Recomenda‑se utilizar um cofre de segredos (como um gerenciador de chaves ou KMS) para gerenciar essas credenciais.
* **Validação e Sanitização** – Dados recebidos de canais externos são validados e higienizados antes de serem processados. Mensagens malformadas são descartadas e registradas para posterior investigação.

## Fluxo de Caso

1. **Recebimento** – A denúncia é recebida via formulário, API externa ou canal de mensagem. Caso o denunciante forneça dados pessoais, estes são armazenados no Cofre de Identidades.
2. **Classificação e Priorização** – Um classificador simples sugere categorias com base em palavras‑chave e calcula um nível de prioridade (baixo, médio, alto) para orientar a triagem.
3. **Triagem** – O responsável designado avalia a denúncia, complementa informações e decide pela abertura de investigação. O status muda de `novo` para `triagem`.
4. **Investigação** – Um investigador conduz diligências, coleta evidências e mantém contato com o denunciante por meio da caixa de mensagens criptografada. O status passa para `em_investigacao`.
5. **Ações Corretivas e Encerramento** – Concluída a investigação, as medidas cabíveis são executadas e o caso é encerrado. Registra‑se se houve procedência, se foram tomadas ações disciplinares, etc.
6. **Follow‑up** – Quando necessário, o denunciante ou a área de compliance podem ser notificados sobre os desdobramentos finais. O acompanhamento é feito sem expor a identidade de terceiros.

## Recomendações de Configuração

* **Variáveis de Ambiente** – Utilize o arquivo `.env.example` como base para criar seu próprio `.env`. Preencha todas as chaves (tokens de Instagram, Facebook, WhatsApp, e‑mail, Twilio, segredos de criptografia).
* **Ativação de Observadores** – Defina `ENABLE_INTEGRATION_WATCHERS=true` para iniciar os observadores quando a API for iniciada. Além disso, habilite cada canal individualmente (`ENABLE_INSTAGRAM_POLL`, `ENABLE_FACEBOOK_POLL`, `ENABLE_WHATSAPP_POLL`) conforme necessário.
* **Tenant padrão** – Caso utilize vários clientes, defina `DEFAULT_TENANT_ID` para garantir que os observadores enviem eventos para o inquilino correto.

## Conformidade Legal

* O sistema foi projetado de acordo com as práticas recomendadas em normas como ISO 37002 (gestão de denúncias) e ISO 27001/27701 (segurança e privacidade da informação). Ainda assim, recomenda‑se consultar o departamento jurídico para ajustes específicos à jurisdição de cada cliente.
* As integrações externas (Meta/WhatsApp, Twilio, provedores de e‑mail) devem ser contratadas com atenção às cláusulas de proteção de dados e cumprimento das leis de privacidade vigentes.

## Uso de IA Avançada

Quando habilitado através da variável `USE_ADVANCED_AI`, o sistema utiliza serviços de inteligência artificial externos para:

* **Transcrição de voz** – Áudios recebidos de denunciante podem ser convertidos em texto por um serviço de reconhecimento de fala. O arquivo de áudio não é armazenado após a transcrição, preservando a privacidade.
* **Tradução automática** – Relatos em outros idiomas são traduzidos para o idioma de trabalho (por padrão, Português) antes de serem analisados, garantindo uniformidade na triagem.
* **Classificação e priorização avançadas** – Um modelo de linguagem identifica padrões além das simples palavras‑chave, sugerindo categorias e níveis de prioridade com base no conteúdo e no contexto do relato.

### Transparência e Supervisão

O uso de IA não substitui a análise humana. Sugestões de categorias e prioridade são recomendações que devem ser revisadas pela equipe de triagem. É responsabilidade do administrador garantir que os modelos utilizados sigam padrões éticos, sem vieses discriminatórios e com forte proteção de dados.

### Configuração

Para ativar estas funcionalidades, preencha no arquivo `.env` as seguintes variáveis:

* `USE_ADVANCED_AI=true` – Habilita a automação avançada.
* `ADVANCED_STT_API_URL` e `ADVANCED_STT_API_KEY` – Serviço de transcrição de áudio.
* `TRANSLATION_API_URL` e `TRANSLATION_API_KEY` – Serviço de tradução de texto.
* `AI_CLASSIFICATION_API_URL` e `AI_CLASSIFICATION_API_KEY` – Serviço de classificação e priorização.

Caso estas variáveis não estejam configuradas, o sistema recorre a heurísticas locais simples para classificação e prioridade.