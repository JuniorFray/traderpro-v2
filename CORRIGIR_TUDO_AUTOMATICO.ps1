# ============================================================================
# SCRIPT AUTOMÁTICO DEFINITIVO - Correção de Encoding UTF-8
# TraderPro v2 - Corrige TODOS os arquivos de uma vez
# ============================================================================

$ErrorActionPreference = "Stop"
$projectPath = "C:\Users\junio\Desktop\traderpro-v2"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  CORRECAO AUTOMATICA COMPLETA - TraderPro v2" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Navegar para o projeto
Set-Location $projectPath

# ============================================================================
# BACKUP AUTOMÁTICO
# ============================================================================
Write-Host "[BACKUP] Criando backup de seguranca..." -ForegroundColor Yellow

$backupFolder = ".\backup_encoding_" + (Get-Date -Format "yyyyMMdd_HHmmss")
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null

$filesToBackup = @(
    "src\features\dashboard\Dashboard.jsx",
    "src\features\calendar\Calendar.jsx",
    "src\features\settings\Settings.jsx",
    "src\features\admin\Admin.jsx",
    "src\features\analytics\Analytics.jsx",
    "src\features\reports\Reports.jsx",
    "src\features\charts\Charts.jsx",
    "src\features\trades\TradesPage.jsx",
    "src\components\layout\MainLayout.jsx",
    "src\components\notifications\NotificationCenter.jsx"
)

foreach ($file in $filesToBackup) {
    if (Test-Path $file) {
        $backupPath = Join-Path $backupFolder $file
        $backupDir = Split-Path $backupPath -Parent
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        Copy-Item $file $backupPath -Force
    }
}

Write-Host "  Backup criado em: $backupFolder" -ForegroundColor Green
Write-Host ""

# ============================================================================
# DICIONÁRIO COMPLETO DE SUBSTITUIÇÕES
# ============================================================================

# Todas as substituições possíveis de caracteres corrompidos
$replacements = @{
    # Vogais com acento
    "Visï¿½o" = "Visão"
    "Lï¿½quido" = "Líquido"
    "Gaçãos" = "Ganhos"
    "Configuraï¿½ï¿½es" = "Configurações"
    "Configuraes" = "Configurações"
    "Informaï¿½ï¿½es" = "Informações"
    "Informaes" = "Informações"
    "Notificaï¿½ï¿½es" = "Notificações"
    "Notificaes" = "Notificações"
    "Notifica  es" = "Notificações"
    "Notificao" = "Notificação"
    "Calendï¿½rio" = "Calendário"
    "Calendrio" = "Calendário"
    "Usuï¿½rio" = "Usuário"
    "Usuri" = "Usuário"
    "Usu rios" = "Usuários"
    "Anlises" = "Análises"
    "Anlise" = "Análise"
    "Grficos" = "Gráficos"
    "Relatrios" = "Relatórios"
    "Histrico" = "Histórico"
    "Estratgia" = "Estratégia"
    "Prï¿½ximo" = "Próximo"
    "Prximo" = "Próximo"
    "Sï¿½b" = "Sáb"
    "Sï¿½bado" = "Sábado"
    "Seguranï¿½a" = "Segurança"
    "Seguran" = "Segurança"
    "Vitorias" = "Vitórias"
    "Vitrias" = "Vitórias"
    "Atualiza  o" = "Atualização"
    "Atualizao" = "Atualização"
    "Configura  o" = "Configuração"
    "Configurao" = "Configuração"

    # Palavras compostas
    "suaçãonta" = "sua conta"
    "suaonta" = "sua conta"
    "daçãonta" = "da conta"
    "daonta" = "da conta"
    "preferncias" = "preferências"
    "preferï¿½ncias" = "preferências"

    # Ações e verbos
    "aï¿½ï¿½o" = "ação"
    "ao" = "ação"
    "Sação" = "Situação"
    "Façãor" = "Factor"
    "Fator" = "Factor"
    "Comiss es" = "Comissões"
    "Comisses" = "Comissões"
    "Exclusï¿½o" = "Exclusão"
    "Excluso" = "Exclusão"
    "Carregão" = "Carregando"
    "Carregao" = "Carregando"

    # Prejuízo e relacionados
    "Preju zo" = "Prejuízo"
    "Prejuzo" = "Prejuízo"

    # Banco de dados
    "Bação" = "Banco"
    "Bao" = "Banco"

    # Sistema
    "Sistem" = "Sistema"

    # Versão
    "Versï¿½o" = "Versão"
    "Verso" = "Versão"

    # Será/serão
    "serï¿½o" = "serão"
    "sero" = "serão"

    # Não
    "nï¿½o" = "não"

    # Média
    "Mdia" = "Média"
    "Mï¿½dia" = "Média"

    # Geral - caracteres problemáticos genéricos
    "ï¿½" = ""
    " " = ""
    "Ã§Ã£" = "ç"
    "Ã§" = "ç"
    "Ã£" = "ã"
    "Ã©" = "é"
    "Ã­" = "í"
    "Ã³" = "ó"
    "Ãº" = "ú"
    "Ã¡" = "á"
    "Ã " = "à"
    "Ãª" = "ê"
    "Ã´" = "ô"
}

# ============================================================================
# FUNÇÃO DE CORREÇÃO
# ============================================================================

function Fix-FileEncoding {
    param(
        [string]$FilePath
    )

    if (-not (Test-Path $FilePath)) {
        return $false
    }

    try {
        # Ler arquivo
        $content = [System.IO.File]::ReadAllText($FilePath, [System.Text.Encoding]::UTF8)
        $originalContent = $content
        $changesCount = 0

        # Aplicar todas as substituições
        foreach ($key in $replacements.Keys) {
            if ($content -match [regex]::Escape($key)) {
                $content = $content -replace [regex]::Escape($key), $replacements[$key]
                $changesCount++
            }
        }

        # Se houve mudanças, salvar
        if ($content -ne $originalContent) {
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($FilePath, $content, $utf8NoBom)
            return $changesCount
        }

        return 0
    }
    catch {
        Write-Host "  ERRO: $($_.Exception.Message)" -ForegroundColor Red
        return -1
    }
}

# ============================================================================
# PROCESSAR TODOS OS ARQUIVOS
# ============================================================================

Write-Host "[CORRIGINDO] Processando arquivos..." -ForegroundColor Yellow
Write-Host ""

$totalFixed = 0
$filesProcessed = 0

$allFiles = @(
    "src\features\dashboard\Dashboard.jsx",
    "src\features\calendar\Calendar.jsx",
    "src\features\settings\Settings.jsx",
    "src\features\admin\Admin.jsx",
    "src\features\analytics\Analytics.jsx",
    "src\features\reports\Reports.jsx",
    "src\features\charts\Charts.jsx",
    "src\features\trades\TradesPage.jsx",
    "src\features\trades\MetricsCard.jsx",
    "src\components\layout\MainLayout.jsx",
    "src\components\notifications\NotificationCenter.jsx",
    "src\components\notifications\NotificationPopup.jsx",
    "src\features\admin\NotificationManager.jsx",
    "src\utils\metrics.js",
    "src\utils\exportReports.js"
)

foreach ($file in $allFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        Write-Host "  Processando: $fileName..." -NoNewline

        $changes = Fix-FileEncoding -FilePath $file

        if ($changes -gt 0) {
            Write-Host " OK ($changes correções)" -ForegroundColor Green
            $totalFixed += $changes
            $filesProcessed++
        }
        elseif ($changes -eq 0) {
            Write-Host " SEM ALTERAÇÕES" -ForegroundColor Gray
        }
        else {
            Write-Host " ERRO" -ForegroundColor Red
        }
    }
    else {
        $fileName = Split-Path $file -Leaf
        Write-Host "  $fileName - NÃO ENCONTRADO" -ForegroundColor Yellow
    }
}

# ============================================================================
# BUSCAR E CORRIGIR CARACTERES REMANESCENTES
# ============================================================================

Write-Host ""
Write-Host "[VARREDURA] Buscando caracteres problemáticos remanescentes..." -ForegroundColor Yellow

$problemChars = @("ï¿½", " ", "??", "Ã", "ã¡", "ã£", "ã©", "ã­", "ã³", "ãº")
$foundIssues = @()

Get-ChildItem -Path "src" -Recurse -Include "*.jsx","*.js" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    foreach ($char in $problemChars) {
        if ($content -match [regex]::Escape($char)) {
            $foundIssues += "  - $($_.FullName) contém: '$char'"
        }
    }
}

if ($foundIssues.Count -gt 0) {
    Write-Host ""
    Write-Host "  ATENÇÃO: Ainda há caracteres problemáticos em:" -ForegroundColor Yellow
    $foundIssues | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
    Write-Host "  Execute o script novamente ou corrija manualmente." -ForegroundColor Yellow
}
else {
    Write-Host "  Nenhum caractere problemático encontrado!" -ForegroundColor Green
}

