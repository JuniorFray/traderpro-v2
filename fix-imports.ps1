$files = @(
  'src/components/trades/MetricsCard.jsx',
  'src/components/trades/TradeForm.jsx',
  'src/features/auth/PrivateRoute.jsx',
  'src/features/calendar/Calendar.jsx',
  'src/features/settings/Settings.jsx',
  'src/features/trades/ClearAccountModal.jsx',
  'src/features/trades/ImportMT5Modal.jsx',
  'src/features/trades/TradeForm.jsx',
  'src/features/trades/TradesList.jsx',
  'src/pages/HomePage.jsx'
)

foreach ($file in $files) {
  $content = Get-Content $file -Raw
  $content = $content -replace 'from "\.\.\/\.\.\/components\/ui"', 'from "../../components/ui/TEMP"'
  $content = $content -replace 'import \{ Card \} from "\.\.\/\.\.\/components\/ui/TEMP"', 'import { Card } from "../../components/ui/Card"'
  $content = $content -replace 'import \{ Button \} from "\.\.\/\.\.\/components\/ui/TEMP"', 'import { Button } from "../../components/ui/Button"'
  $content = $content -replace 'import \{ Loading \} from "\.\.\/\.\.\/components\/ui/TEMP"', 'import { Loading } from "../../components/ui/Loading"'
  $content = $content -replace 'import \{ Input \} from "\.\.\/\.\.\/components\/ui/TEMP"', 'import { Input } from "../../components/ui/Input"'
  $content = $content -replace 'import \{ (Card|Button|Loading|Input), (Card|Button|Loading|Input) \} from "\.\.\/\.\.\/components\/ui/TEMP"', 'import { $1 } from "../../components/ui/$1"
import { $2 } from "../../components/ui/$2"'
  $content = $content -replace 'import \{ (Card|Button|Loading|Input), (Card|Button|Loading|Input), (Card|Button|Loading|Input) \} from "\.\.\/\.\.\/components\/ui/TEMP"', 'import { $1 } from "../../components/ui/$1"
import { $2 } from "../../components/ui/$2"
import { $3 } from "../../components/ui/$3"'
  Set-Content $file $content -NoNewline
  Write-Host "✅ Corrigido: $file" -ForegroundColor Green
}
