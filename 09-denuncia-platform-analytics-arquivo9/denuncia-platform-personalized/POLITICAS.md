# Políticas e Diretrizes do Canal de Denúncias

Este documento resume as políticas de segurança, privacidade e integração para o canal de denúncias. As instruções aqui descritas têm por objetivo garantir o sigilo do denunciante, a conformidade com legislações aplicáveis (como LGPD/GDPR) e a interoperabilidade segura com outros sistemas.

## Privacidade e Proteção de Dados

* **Anonimato por padrão** – Denunciantes podem optar por enviar relatos sem se identificar. Quando o modo anônimo é utilizado, nenhum dado pessoal é coletado além do necessário para responder ao relato. O sistema não armazena endereço IP ou localização do remetente.
* **Cofre de Identidades** – Informações sensíveis de usuários identificados são criptografadas com AES‑256‑GCM e armazenadas separadamente das denúncias. O acesso a essas informações é restrito e monitorado.
* **Criptografia de Mensagens** – O conteúdo de cada mensagem é cifrado antes de ser persistido em armazenamento. Apenas usuários autorizados podem descriptografar mensagens para fins de investigação.
* **Retenção de Dados** – Os casos e seus dados associados são mantidos pelo prazo estritamente necessário para atender às obrigações legais e contratuais. Passado esse período, são eliminados de forma segura.
* **Auditoria e Registro** – Todas as operações críticas (criação, visualização, atribuição, alteração de status, exportação) geram eventos de auditoria contendo o responsável, o horário e o motivo da ação, sem expor dados pessoais.

## Sigilo absoluto e Criptografia ponta‑a‑ponta

Em conformidade com as diretrizes das normas ISO 37002 e ISO 37008, a plataforma oferece um modo de sigilo absoluto para maximizar a proteção do denunciante:

* **Cifragem ponta‑a‑ponta** – Todos os campos sensíveis de uma denúncia (título, descrição, resumo, categorias e nível de prioridade) são cifrados no navegador do denunciante usando uma chave aleatória gerada localmente. Essa chave não é enviada nem armazenada no servidor. Somente quem possui a chave consegue descriptografar os dados. Assim, mesmo administradores e investigadores não conseguem acessar o conteúdo dos relatos sem cooperação do denunciante.
* **Codinomes e anonimato** – Cada caso pode receber um codinome para evitar a identificação direta da pessoa investigada ou da denúncia. A norma ISO 37008 recomenda atribuir um codinome ao caso e ao sujeito para anonimizar a investigação【836251127327609†L1988-L2005】.
* **Sem rastros de IP ou localização** – O servidor não registra endereços IP, localização geográfica ou outros metadados de conexão. A coleta de dados é limitada ao necessário para o processamento e nunca inclui informações que possam permitir a reidentificação da pessoa【938468719210140†L1970-L1984】.
* **Pseudonimização de remetentes externos** – Relatos recebidos por telefone, redes sociais ou e‑mail passam por um hashing que gera um identificador anônimo, impossibilitando o rastreamento do remetente sem acesso às plataformas externas.
* **Proteção contra identificação indireta** – A norma ISO 37002 alerta que diversas características podem identificar inadvertidamente uma pessoa (como voz, gênero ou departamento)【938468719210140†L1998-L2007】. Por isso, a plataforma oculta ou remove automaticamente metadados de anexos (por exemplo, EXIF de imagens) e restringe o acesso às informações de contexto. Mensagens de áudio são transcritas e os arquivos originais são descartados após a transcrição para evitar a identificação pela voz.
* **Eliminação de rastros digitais** – Durante a coleta e a análise de dados eletrônicos, convém que a equipe de investigação e o departamento de TI tomem cuidado para não deixar pegadas digitais【836251127327609†L2103-L2104】. A plataforma implementa rotinas de limpeza de logs, utilização de conexões seguras e remoção de dados temporários para reduzir o rastro de informações.

* **Criptografia de tarefas e anexos** – Todas as tarefas relacionadas ao caso são armazenadas em formato cifrado. Os títulos e descrições das tarefas são codificados como um objeto JSON e protegidos com AES‑256‑GCM. Quando um usuário autorizado recupera as tarefas, o sistema descriptografa os conteúdos para exibir as informações de forma transparente.  Os anexos enviados ao caso (por exemplo, imagens ou documentos base64) são criptografados antes de serem persistidos, e o conteúdo só é descriptografado na hora da leitura.

Os procedimentos de sigilo absoluto são recomendados para denúncias altamente sensíveis ou quando houver risco de retaliação. A ativação deste modo deve ser comunicada ao denunciante junto com instruções claras sobre como armazenar sua chave de descriptografia, já que a perda dessa chave impossibilitará a recuperação do conteúdo.

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

## Fluxo de Investigação Completa

Para as situações em que uma denúncia demanda uma apuração aprofundada, a plataforma oferece um conjunto de tarefas padronizadas que guiam a equipe ao longo de todo o processo investigativo. Essas tarefas se baseiam em orientações das normas internacionais sobre investigações internas (ISO 37008) e são automaticamente geradas quando um caso é atribuído a um investigador.

1. **Avaliação preliminar** – A equipe de investigação analisa a seriedade e a credibilidade da denúncia e verifica se há elementos suficientes para uma investigação completa【836251127327609†L950-L971】. Caso necessário, são solicitados detalhes adicionais ao denunciante.
2. **Determinação do escopo** – Definem‑se os objetivos e o alcance da investigação: qual o período a ser verificado, quais locais e pessoas estão envolvidos e se há suspeita de violação de políticas ou leis【836251127327609†L976-L1027】.
3. **Planejamento da investigação** – Elabora‑se um plano de trabalho com cronograma, recursos necessários, lista de entrevistas e fontes de evidências. Esse plano é tratado como documento vivo e ajustado conforme o caso evolui【836251127327609†L1028-L1098】.
4. **Confidencialidade e avisos** – Controla‑se rigorosamente o fluxo de informações, emitindo avisos formais sobre a importância do sigilo e as consequências de divulgar dados da investigação【836251127327609†L1101-L1146】.
5. **Coleta e análise de evidências** – A equipe obtém, preserva e analisa documentos e registros, inclusive dados eletrônicos, com apoio de especialistas quando necessário【836251127327609†L1158-L1193】.
6. **Preparação de entrevistas** – São definidas as pessoas a serem ouvidas, elaboradas as perguntas e preparado o cronograma, sempre considerando a cultura local e técnicas adequadas de entrevista【836251127327609†L1205-L1233】.
7. **Condução de entrevistas** – As entrevistas são conduzidas de forma respeitosa, com registros precisos e, quando apropriado, presença de testemunhas ou pessoas de apoio【836251127327609†L1252-L1274】. O entrevistado revisa e confirma o relato.
8. **Elaboração de relatório** – Compilam‑se os fatos e evidências em relatório claro e factual, documentando limitações e obstáculos encontrados【836251127327609†L1334-L1369】.
9. **Proposição de medidas corretivas** – A equipe recomenda medidas provisórias e finais para mitigar impactos, com base na análise das causas‑raiz, e sugere melhorias nos controles internos【836251127327609†L1370-L1407】.
10. **Monitoramento das medidas** – A implementação das ações corretivas é acompanhada e avaliada quanto à sua eficácia; ajustes no programa de compliance podem ser recomendados【836251127327609†L1429-L1436】.

As tarefas acima compõem uma linha do tempo visível no módulo de detalhes do caso, permitindo que investigadores, triadores e gestores acompanhem o andamento, definam prazos, atribuam responsáveis e registrem a conclusão de cada etapa. A conclusão de uma tarefa não muda automaticamente o status do caso, mas serve como evidência do progresso e facilita a prestação de contas.

## Personalização e Usabilidade

A plataforma é flexível e personalizável para atender às necessidades de diferentes organizações e perfis de usuários. Essa personalização é inspirada nas diretrizes das normas ISO que orientam a criação de canais acessíveis, visíveis, multilíngues e adaptados a públicos diversos【938468719210140†L2155-L2171】【938468719210140†L1286-L1299】【989042326995849†L1852-L1867】. 

* **Formulários por perfil** – Administradores podem definir formulários diferentes para denunciantes, vítimas, consultores e outros perfis. Cada formulário determina quais campos são obrigatórios, o tipo de dado esperado (texto, data, seleção, arquivo) e o rótulo apresentado em cada idioma. Isso permite orientar corretamente cada tipo de usuário e coletar apenas informações relevantes.

* **Idiomas configuráveis** – A interface do usuário (menus, botões, mensagens de erro) e os formulários são traduzidos automaticamente de acordo com o idioma selecionado. O administrador pode habilitar ou desabilitar idiomas para cada empresa, garantindo que as instruções sejam claras e compreensíveis para todos【938468719210140†L1286-L1299】.

* **Acessibilidade** – Os formulários são construídos com rótulos associados aos campos, suporte a navegação por teclado e foco visual, e evitam jargões técnicos. As diretrizes da ISO destacam que canais devem ser acessíveis e visíveis para todas as pessoas, incluindo aquelas com deficiências ou necessidades especiais【938468719210140†L2155-L2171】.

* **Configuração de categorias, fluxos, idiomas e temas** – Cada empresa pode personalizar a lista de categorias de denúncia, o conjunto de etapas do processo (fluxo de status), os idiomas oferecidos na interface e o esquema de cores da interface para se adequar à identidade visual, à cultura e ao processo interno. Essas configurações são armazenadas por inquilino (tenant) e podem ser atualizadas via painel de configurações sem intervenção de código.

* **Experiência unificada** – Mesmo com a personalização, todos os dados permanecem protegidos pelos mesmos mecanismos de sigilo absoluto, criptografia e auditoria. A norma ISO 37301 recomenda que os canais de denúncia sejam visíveis, acessíveis e permitam o envio anônimo sem medo de represálias【989042326995849†L1852-L1867】; a plataforma atende a esses requisitos enquanto oferece interface clara e adequada para cada público.

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

## Relatórios e Métricas

As normas ISO de gestão de denúncias orientam que a organização estabeleça indicadores para avaliar a eficácia do canal e divulgue periodicamente os resultados para a alta administração【938468719210140†L1104-L1128】. A plataforma oferece painéis e gráficos interativos que permitem acompanhar, de forma intuitiva e visual, a evolução dos casos e auxiliar decisões estratégicas.  Todos os dados apresentados são **anonimizados** e **agregados**, de modo a proteger a identidade dos denunciantes e participantes【938468719210140†L2000-L2013】.

### Indicadores Disponíveis

- **Distribuição por status:** número de casos em cada etapa do processo (novo, triagem, em investigação, ações, encerrado).  
- **Distribuição por categoria:** número de casos em cada tipo de irregularidade denunciada.  
- **Casos por mês:** tendência temporal do volume de denúncias.  
- **Distribuição por canal:** origem das denúncias (formulário web, e‑mail, redes sociais, telefone, etc.).  
- **Duração média por etapa:** tempo médio decorrido em cada fase do processo, permitindo identificar gargalos.  
- **Categorias recorrentes:** categorias com mais de um caso, evidenciando reincidência de problemas em determinadas áreas.  
- **Categorias críticas:** número de casos de alta severidade por categoria, ajudando a priorizar ações corretivas.  
- **Casos de retaliação:** quantidade de denúncias que mencionam ou indicam retaliação, conforme identificação por palavras‑chave ou marcação do investigador.  
- **Tempo médio de encerramento:** média de dias entre a abertura e o encerramento de casos concluídos.  

Esses indicadores refletem exemplos de métricas sugeridas pela norma ISO 37002, como número de relatos, tempo para reconhecer e tratar denúncias, proporção de relatos que avançam em cada fase, reincidência e medidas corretivas【938468719210140†L2740-L2786】.  

### Painéis Interativos

Os relatórios são apresentados por meio de gráficos de barras, linhas e pizza em uma interface responsiva. O cliente pode personalizar as cores dos gráficos conforme o tema definido nas configurações. Além disso, há **cartões de resumo** que mostram o total de casos, tempo médio de encerramento, número de casos abertos, quantidade de casos de retaliação, número de categorias recorrentes e casos críticos.  

### Exportação Segura

O módulo de relatórios fornece botões para exportar os dados em formato **CSV** ou **JSON**. Os arquivos gerados contêm apenas dados agregados, sem campos que identifiquem pessoas. Isso possibilita compartilhar relatórios com auditorias externas, autoridades regulatórias ou comitês internos, em conformidade com a LGPD/GDPR e as recomendações da ISO.  

Essas funcionalidades visam instrumentalizar reuniões de liderança, orientar a tomada de decisões e fornecer evidências da efetividade do canal, promovendo a cultura de integridade e transparência nas organizações.