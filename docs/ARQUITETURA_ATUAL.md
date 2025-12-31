# Documentação de Arquitetura - Versão 2.0 (Dezembro 2025)

## 1. Visão Geral da Mudança
O sistema foi refatorado para utilizar uma estratégia de **Rotas Separadas (Split Routing)**.
Anteriormente, todas as rotas eram carregadas juntas. Agora, o sistema decide na inicialização (`App.jsx`) qual conjunto de rotas carregar com base no domínio de acesso.

## 2. Estrutura de Rotas (`src/routes.jsx`)
O arquivo exporta dois componentes distintos:
- **`CustomerRoutes`**: Contém rotas públicas (Login, Cadastro) e rotas privadas do usuário (Dashboard, Trades, Calendar).
- **`AdminRoutes`**: Contém apenas rotas do administrador (`/admin/login`, `/admin/*`).

## 3. Controlador de Domínio (`src/App.jsx`)
O `App.jsx` possui um "Guard" que verifica o `window.location.hostname`:
- Se for `admin.*` -> Carrega `<AdminRoutes />`.
- Se for outros domínios -> Carrega `<CustomerRoutes />`.

## 4. Segurança (`AuthContext` e `AdminPrivateRoute`)
- **AdminLogin**: Localizado agora em `src/pages/admin/AdminLogin.jsx`.
- **Autenticação**: O `AdminPrivateRoute` verifica se o email é estritamente `juniorfray944@gmail.com`. Se não for, realiza logout forçado e redireciona para o login do admin.

## 5. Status Atual (Problemas Conhecidos)
- A navegação está correta (não redireciona mais incorretamente para a home do usuário).
- Login com Google no Admin ainda pendente de verificação (possível falta de autorização de domínio no Firebase Console).
