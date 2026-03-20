# 🚀 Documentação Arquitetural: Blog Isa (SEO Content Machine)
*Data da compilação: Março 2026*

Este documento detalha linha a linha a infraestrutura tecnológica e as lógicas de negócios (SEO) construídas neste projeto. Este não é apenas um blog padrão em Next.js; é uma **máquina de publicação contínua orientada a arquitetura SEO de alta conversão, desenhada para se acoplar a Agentes LLM (Gemini/ChatGPT)**.

---

## 🏗️ 1. STACK TECNOLÓGICO BASE
*   **Framework Frontend**: Next.js (App Router / React).
*   **Estilo e UI**: TailwindCSS, Lucide React (Ícones).
*   **Editor de Texto**: Tiptap (Rich Text com HTML mapping direto).
*   **Banco de Dados & Autenticação**: Firebase Firestore (NoSQL) & Firebase Auth.
*   **Deploy Target**: Vercel/Netlify (Compatível com Server-Side Rendering e Static Generation).

---

## 🧠 2. AS 3 ENGRENAGENS DO SISTEMA (Article Types)
O banco de dados categoriza as postagens cirurgicamente para determinar como o Google deve ler a página estruturalmente.

### A. 📚 Educational (Informativo)
*   **Foco**: Topo de funil, atrair tráfego e gerar autoridade.
*   **Schema**: `Article`
*   **Blocos UI Ativos**: Prós/Contras, FAQ, Galeria, Rating Criteria (Critérios Avaliativos), Tabela Comparativa (opcional).

### B. 💰 Sales (Transacional / Conversão)
*   **Foco**: Fundo de funil, review de produtos, listas de compras.
*   **Schema**: `Product` (com `aggregateRating` injetado via JSON-LD no frontend).
*   **Blocos UI Ativos**: Dados Diretos de Produto (Nome, Preço, Estrelas, Link de Afiliado, Botão de Compra), Critérios Avaliativos, Prós/Contras, FAQ, Galeria, Tabela Comparativa.

### C. ✍️ Experience (Relato Pessoal / Lifestyle)
*   **Foco**: Meio de funil, humanização, blindagem contra punições de IA (YMYL - "Your Money or Your Life"). Trata-se do "Eu testei".
*   **Schema**: `BlogPosting` (Focado no Autor).
*   **Regras Graves de Schema**: O painel **NÃO** engatilha Schema de Venda, mesmo se houver botão de afiliado ao fim do texto, para que o Google considere o diário como experiência autêntica e não como spam de oferta.
*   **Blocos UI Dinâmicos**: 
    - `schemaAboutName` / `schemaAboutUrl` (O que está sendo avaliado, apontando preferencialmente para Wikipedia).
    - `schemaMentions` (Tópicos secundários do artigo para clusterização Semântica do GoogleBot).
    - `ctaLink` / `ctaText` (Botão estético de conversão – geralmente WhatsApp).

---

## 🎯 3. INTENÇÃO DE BUSCA (Search Intent)
Todo artigo no painel requer o preenchimento OBRIGATÓRIO de "Intenção de Busca". Isso alinha o título, a estrutura do Agente IA, e futuramente os relatórios de conversão em qual etapa do funil o lead se encontra:
1.  **Informational**: Focado em resolver dores e dúvidas ("Como fazer...", "O que é...").
2.  **Commercial**: Focado em comparação antes da compra ("Qual o melhor...", "X vs Y...", "Vale a pena...").
3.  **Transactional**: Focado na compra imediata ("Onde comprar...", "Desconto...", "Preço...").

---

## 🛡️ 4. O VALIDADOR QA IMPLACÁVEL (Quality Assurance Backend)
Para proteger o site contra publicações preguiçosas (principalmente da IA), o `PostEditor.tsx` trava o Firebase. Nenhum artigo é **salvo** se não cumprir o _Checklist de Qualidade Sênior_:

1.  **Bloqueio de Conteúdo Fraco**: Um regex purifica o HTML (remove tags e espaços) e conta palavras reais. Se for `< 800 palavras`, o save é abortado.
2.  **Obrigatoriedade de H2**: Se o texto não contiver `<h2>` (Headings primários), o sistema acusa erro de UI.
3.  **Trava de Cluster de Interlink**: Regex vasculha o código-fonte procurando no mínimo 2 âncoras (`<a href="...">`) que comecem com barras relativas (`/`) ou direcionem para o domínio canônico. Se faltar interlink, a publicação é bloqueada.
4.  **Veredito de Especialista**: O painel exige que o campo de Conclusão/Veredito tenha **> 100 caracteres**, forçando uma finalização com peso argumentativo humano.
5.  **Força do Título (CTR)**: O título precisa ter no mínimo `40 caracteres` no banco.
6.  **Tabela Inconsistente**: Se usar uma tabela comparativa, ela tem que ter **no mínimo 2 itens**, caso contrário, o editor trava denunciando spam estrutural.
7.  **Limpeza Anti-IA (Sanitização Automática)**: A função interna `cleanContent()` vasculha o HTML do Tiptap buscando vícios de resposta do modelo (ex: `\[cite: XX\]` ou `\[cite_start\]`). Isso ocorre em dois firewalls:
    *   Antes de enviar para o banco.
    *   Antes de exportar o JSON para o usuário.

---

## 🧱 5. ESTRUTURA DE BLOCOS DINÂMICOS (UI)
O sistema carrega campos isolados na interface "Blocos" que não poluem o corpo de texto (Content), mas montam a arquitetura renderizada ao leitor:

*   **Prós e Contras**: Arrays simples (`[string]`).
*   **Perguntas Frequentes (FAQ)**: Arrays de objetos gerando Microdados `FAQPage`.
*   **Critérios de Avaliação (`ratingCriteria`)**: Label + Score de Estrelas (1-5).
*   **Galeria de Imagens (`contentImages`)**: Arrays de `{url, caption}`, empilhados estilizados.
*   **Tabela de Comparação SEO**: Um array de `{label, peso, preco, precoKg}` que gera visuais de tabelas rígidas ideais para indexação de tabelas do Google ("Featured Snippets").

---

## 🔄 6. O CICLO DE TREINAMENTO: O "JSON PIPELINE"
A maior sacada da arquitetura é como ela conversa com Large Language Models (LLMs) fora do servidor:

1.  **Geração do Esquema Vivo (Export)**: O usuário clica em "Baixar JSON". O Painel pega o Tiptap, todos os Metadados, Intents, Schemas e Blocos e desidrata num `.json` limpo. *Ele lê a ABA ATIVA e exclui dados inúteis*. (ex: se é informativo, não abaixa dados de Preço de Produto).
2.  **Injeção em IA (Agent Workflow)**: Esse JSON é atirado na "Persona Isa" dentro do painel LLM, acompanhado das regras rígidas:
    *   *Information Gain*: Exigência de métricas e dados matemáticos (proibido enrolação).
    *   *Sintaxe Anti-Footprint*: Proibição de marcadores genéricos de IA, repetição de abertura e frases de transição recicladas.
    *   *Abertura Forte*: Introdução precisa engatilhar Problema Real + Gap de Curiosidade + Resposta Prometida (retenção brutal inicial).
3.  **Re-upload (Import)**: A IA cospe de volta o JSON processado e denso. O usuário clica no `<input file>` escondido no painel de Editor, o script mapeia chave por chave de volta pro estado do React. A mágica de auto-update acontece antes mesmo de salvar no banco de dados.

---

## 🌐 7. SEO ONSITE AVANÇADO
*   **Dynamic Sitemap XML**: `src/app/sitemap.ts` rastreia o Firestore e monta as listagens de posts publicados, categorias e rotas home, tudo com pontuação `<changefreq>` e `<priority>` automáticos para rastreadores de busca do Google Search Console.
*   **Favicon e Assets**: Base configurada limpa direto na raiz `/public`.
*   **Nofollow Sponsored**: Injetados via regex em botões de compras externos para proteger fluxo de PageRank e penalidades de links afiliados.

---

### 🚀 STATUS ATUAL DA MÁQUINA: **PRONTA PARA ESCALAR**
Este projeto deixou de ser um "CMS Simples" para se tornar uma plataforma fechada onde a máquina, o banco de relatórios abstratos e o editor de texto forçam, a cada linha de código, o produtor de conteúdo a jogar no meta jogo do core-update mais recente do Google HCU (Helpful Content Update).
