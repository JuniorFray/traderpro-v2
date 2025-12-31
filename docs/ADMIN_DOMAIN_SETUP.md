# Configuração do Domínio Admin

## Visão Geral
Configuração do subdomínio `admin.diariotraderpro.com.br` para acesso ao painel administrativo do TraderPro.

## Arquitetura

### Sites Firebase Hosting
1. **meudiariotrade-29864** (Principal)
   - Domínio: `diariotraderpro.com.br`
   - Target: `main`
   - Público: `dist/`

2. **meudiariotrade-admin** (Admin)
   - Domínio: `admin.diariotraderpro.com.br`
   - Target: `admin`
   - Público: `dist/`

### Aplicação Única
- Ambos os sites hospedam a mesma build (`dist/`)
- Roteamento gerenciado pelo React Router
- Detecção de domínio em `App.jsx` redireciona automaticamente

## Configuração DNS (Registro.br)

### Registros Necessários
A admin.diariotraderpro.com.br → 199.36.158.100
A admin.diariotraderpro.com.br → 199.36.158.101
TXT admin.diariotraderpro.com.br → hosting-site=meudiariotrade-admin

text

### ⚠️ IMPORTANTE
- **REMOVER** qualquer registro CNAME existente para `admin.diariotraderpro.com.br`
- Registros A e CNAME não podem coexistir para o mesmo hostname

## Configuração Firebase

### firebase.json
```json
{
  "hosting": [
    {
      "target": "main",
      "public": "dist",
      "rewrites": [{"source": "**", "destination": "/index.html"}]
    },
    {
      "target": "admin",
      "public": "dist",
      "rewrites": [{"source": "**", "destination": "/index.html"}]
    }
  ]
}
Vincular Targets
bash
firebase target:apply hosting main meudiariotrade-29864
firebase target:apply hosting admin meudiariotrade-admin
Deploy
bash
npm run build
firebase deploy --only hosting
Implementação React
App.jsx - Detecção de Domínio
jsx
function DomainRedirect() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const hostname = window.location.hostname
    
    if (hostname === 'admin.diariotraderpro.com.br' && !location.pathname.startsWith('/admin')) {
      navigate('/admin/login', { replace: true })
    }
  }, [navigate, location])

  return <AppRoutes />
}
AdminLogin.jsx - Autenticação
Usa signInWithRedirect para evitar problemas de CORS

Verifica isAdmin em users/{uid} no Firestore

Redireciona para /admin após sucesso

Armazena contexto admin no localStorage

Fluxo de Login Admin
Usuário acessa admin.diariotraderpro.com.br

Redirecionado para /admin/login

Clica em "Entrar com Google"

signInWithRedirect leva ao Google

Retorna para /admin/login

useEffect detecta getRedirectResult

Verifica isAdmin no Firestore

Se admin → redireciona para /admin

Se não admin → desloga e mostra erro

Problemas Conhecidos e Soluções
❌ Cross-Origin-Opener-Policy Errors
Problema: Erros no console sobre COOP policy bloqueando popups

Causa: signInWithPopup não funciona bem com Firebase Hosting

Solução: Usar signInWithRedirect em vez de popup

❌ Login Redireciona para Sistema Normal
Problema: Após login, vai para / em vez de /admin

Causa: navigate('/') no código

Solução: Usar navigate('/admin', { replace: true })

❌ Cache do Navegador
Problema: Alterações não aparecem após deploy

Solução:

Hard refresh: Ctrl + Shift + R

Limpar cache: Ctrl + Shift + Delete

Testar em modo anônimo

Deletar dist/ e rebuildar

Status Atual
✅ Completado
 Site admin criado no Firebase

 Domínio configurado no Firebase Console

 DNS configurado no Registro.br

 Targets configurados

 Deploy funcionando

 Detecção de domínio implementada

 AdminLogin refatorado para redirect

🔄 Pendente
 Validar fluxo completo de login admin

 Confirmar redirecionamento pós-autenticação

 Testar verificação de permissão isAdmin

 Remover logs de debug após validação

Comandos Úteis
Deploy
bash
npm run build
firebase deploy --only hosting
Limpar e Rebuildar
bash
Remove-Item -Recurse -Force dist
npm run build
firebase deploy --only hosting
Ver Status DNS
bash
nslookup admin.diariotraderpro.com.br
nslookup -type=TXT admin.diariotraderpro.com.br
Limpar Cache DNS
bash
ipconfig /flushdns
Próximos Passos
Testar login admin com logs de debug

Validar campo isAdmin no Firestore para usuários admin

Confirmar redirecionamento completo

Remover console.logs após validação

Documentar permissões admin no Firestore