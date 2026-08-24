/**
 * Podcast PsiAtiva — programa pessoal da psicóloga Loivani Venturin Körner,
 * republicado aqui sob marca compartilhada (promoção mútua).
 *
 * ⚠️ `audioUrl` de cada episódio SEMPRE aponta para o endpoint anchor.fm/.../play/,
 * nunca para o CloudFront interno: é o endpoint que o Spotify for Podcasters
 * contabiliza. Usar o link direto do CDN torna as reproduções invisíveis
 * para as métricas do programa.
 */
export const PODCAST = {
  name: "PsiAtiva",
  description:
    "Um espaço para falar sobre Psicologia de forma leve, humana e sem complicações. " +
    "Emoções, relacionamentos, comportamento e saúde mental.",
  basePath: "/podcast/",
  rss: "https://anchor.fm/s/c24416d8/podcast/rss",
  apple: "https://podcasts.apple.com/us/podcast/psiativa/id1679960852",
  spotifyShow: "https://open.spotify.com/show/49HKfaVrPQRJIOCTzDjRVn",
  cover:
    "https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_nologo/32492422/32492422-1787142134193-669d90ff41fd.jpg",
  language: "pt-BR",

  /**
   * Badge oficial da Apple. ⛔ Regras da Apple Podcasts Identity Guidelines
   * (marketing.services.apple/apple-podcasts-identity-guidelines):
   *   - nunca recriar, recolorir, girar, animar ou aplicar sombra/brilho no badge;
   *   - nunca usar a maçã sozinha no lugar do badge;
   *   - altura minima 30px em tela; espaco livre >= 1/10 da altura do badge;
   *   - nunca traduzir o badge por conta propria. A Apple publica versoes
   *     localizadas: este arquivo e o USGB-EN (ingles). Para PT-BR, baixar o
   *     badge traduzido da Apple e trocar so o caminho abaixo.
   * O SVG oficial embute um PNG 2048x2048 (482 KB) — pesado para 41px, mas
   * reamostrar seria "alterar a arte". Fica como veio: 1 request, cacheado.
   */
  badge: {
    apple: "/images/external/apple/Apple_Podcast_Listen_on_Badge_RGB_USGB-EN_CI_111825.svg",
    appleAlt: "Listen on Apple Podcasts",
    appleWidth: 129,
    appleHeight: 41,
  },
  category: "Social Sciences",

  host: {
    name: "Loivani Venturin Körner",
    /** Art. 2º, Res. CFP 06/2019 — nome + CRP obrigatórios em publicidade profissional. */
    crp: "CRP 12/19699",
    role: "Psicóloga",
    instagram: "https://instagram.com/psi.loivani",
    linkedin: "https://www.linkedin.com/in/loivaniventurin/",
    whatsapp: "https://wa.me/5549991093426",
    lattes: "https://lattes.cnpq.br/7200761194546008",
  },
} as const;
