import { useNavigate } from 'react-router-dom'

export const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div dangerouslySetInnerHTML={{ __html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TraderPro - Diário de Trading Profissional</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #000;
            color: #fff;
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .hero { 
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 80px 20px;
        }
        h1 { 
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 800;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #00e676 0%, #00c853 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .subtitle { 
            font-size: clamp(1.1rem, 2vw, 1.5rem);
            color: #aaa;
            margin-bottom: 30px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #00e676, #00c853);
            color: #000;
            padding: 18px 48px;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 700;
            text-decoration: none;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 10px 40px rgba(0, 230, 118, 0.3);
            cursor: pointer;
            border: none;
        }
        .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 50px rgba(0, 230, 118, 0.5);
        }
        .features {
            padding: 80px 20px;
            background: #0a0a0a;
        }
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 60px;
        }
        .feature-card {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 20px;
            padding: 40px;
            transition: transform 0.3s, border-color 0.3s;
        }
        .feature-card:hover {
            transform: translateY(-5px);
            border-color: #00e676;
        }
        .feature-icon {
            font-size: 3rem;
            margin-bottom: 20px;
        }
        .feature-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 15px;
        }
        .feature-desc {
            color: #888;
            font-size: 1rem;
        }
        .alert-box {
            background: linear-gradient(135deg, #ffeb3b20, #ffc10720);
            border: 2px solid #ffeb3b;
            border-radius: 15px;
            padding: 20px;
            margin: 40px auto;
            max-width: 800px;
            text-align: center;
        }
        .testimonials {
            padding: 80px 20px;
            background: #000;
        }
        .testimonial-card {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 20px;
            padding: 30px;
            margin: 20px 0;
        }
        .testimonial-text {
            font-style: italic;
            color: #ccc;
            margin-bottom: 15px;
        }
        .testimonial-author {
            font-weight: 700;
            color: #00e676;
        }
        .final-cta {
            padding: 100px 20px;
            text-align: center;
            background: linear-gradient(135deg, #1a1a1a, #0a0a0a);
        }
        @media (max-width: 768px) {
            .hero { padding: 60px 20px; }
            h1 { font-size: 2rem; }
            .subtitle { font-size: 1rem; }
        }
    </style>
</head>
<body>
    <section class="hero">
        <div class="container">
            <h1>📊 TraderPro</h1>
            <p class="subtitle">
                Análise automática de Win Rate, Payoff e Drawdown.<br>
                Relatórios PDF profissionais. Gestão de risco inteligente.
            </p>
            
            <div class="alert-box">
                ⚠️ <strong>Atenção:</strong> Acesso PRO gratuito limitado ao período BETA. Garanta sua vaga agora!
            </div>
            
            <button class="cta-button" onclick="window.location.href='/cadastro'">
                GARANTIR MINHA VAGA GRÁTIS 🚀
            </button>
        </div>
    </section>

    <section class="features">
        <div class="container">
            <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 20px;">
                Ferramentas Profissionais
            </h2>
            <p style="text-align: center; color: #888; max-width: 600px; margin: 0 auto 40px;">
                Tudo que você precisa para evoluir como trader profissional
            </p>
            
            <div class="feature-grid">
                <div class="feature-card">
                    <div class="feature-icon">📈</div>
                    <h3 class="feature-title">Métricas Avançadas</h3>
                    <p class="feature-desc">
                        Win Rate, Payoff, Drawdown, Expectativa Matemática e mais 15 métricas calculadas em tempo real.
                    </p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">📄</div>
                    <h3 class="feature-title">Relatórios PDF</h3>
                    <p class="feature-desc">
                        Documentos profissionais com gráficos. Perfeito para auditoria, prop firms ou análise pessoal.
                    </p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">☁️</div>
                    <h3 class="feature-title">Sincronização Cloud</h3>
                    <p class="feature-desc">
                        Opere no PC e lance trades pelo celular. Sincronização instantânea via Google Cloud.
                    </p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">🔒</div>
                    <h3 class="feature-title">Segurança Total</h3>
                    <p class="feature-desc">
                        Dados criptografados e protegidos pela infraestrutura do Google. Backup automático.
                    </p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3 class="feature-title">Importação MT5</h3>
                    <p class="feature-desc">
                        Importe suas operações direto da corretora. Compatível com MT5, ProfitChart e planilhas.
                    </p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">⚠️</div>
                    <h3 class="feature-title">Gestão de Risco</h3>
                    <p class="feature-desc">
                        Acompanhe drawdown máximo, recuperação e exposure. Opere dentro dos seus limites.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <section class="testimonials">
        <div class="container">
            <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 60px;">
                O Que Traders Estão Dizendo
            </h2>
            
            <div class="testimonial-card">
                <p class="testimonial-text">
                    "Meu Win Rate subiu de 48% para 67% em 2 meses. Finalmente entendi onde estava errando. 
                    O relatório PDF me ajudou a conseguir funding em prop firm!"
                </p>
                <p class="testimonial-author">— Rafael M., Trader Profissional</p>
            </div>
            
            <div class="testimonial-card">
                <p class="testimonial-text">
                    "Estava usando planilha do Excel. TraderPro economiza 2 horas por dia e ainda me mostra 
                    insights que eu nunca veria sozinha. Gratuito é inacreditável!"
                </p>
                <p class="testimonial-author">— Ana Carolina, Day Trader</p>
            </div>
            
            <div class="testimonial-card">
                <p class="testimonial-text">
                    "Faço 50+ operações por dia. O lance rápido pelo celular é ESSENCIAL. A sincronização é 
                    instantânea e nunca falhou. Melhor ferramenta que já usei."
                </p>
                <p class="testimonial-author">— Lucas P., Scalper</p>
            </div>
        </div>
    </section>

    <section class="final-cta">
        <div class="container">
            <h2 style="font-size: 2.5rem; margin-bottom: 20px;">
                Pronto para Evoluir Seu Trading?
            </h2>
            <p style="color: #888; font-size: 1.2rem; margin-bottom: 40px;">
                Junte-se a 847 traders que já estão analisando suas operações profissionalmente.<br>
                <strong>100% gratuito</strong> enquanto estamos em BETA.
            </p>
            <button class="cta-button" onclick="window.location.href='/cadastro'">
                GARANTIR MINHA VAGA GRÁTIS 🚀
            </button>
        </div>
    </section>
</body>
</html>
    `}} />
  )
}
