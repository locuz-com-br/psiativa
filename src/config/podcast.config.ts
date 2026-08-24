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
   * Artes OFICIAIS, copiadas de knowledge/sources/assets/ (o storage).
   * ⛔ Só entra em public/ o arquivo que a página realmente usa.
   *
   * APPLE — apple-podcasts-identity-guidelines:
   *   - nunca recriar, recolorir, girar, animar ou aplicar sombra/brilho;
   *   - nunca usar a maçã sozinha no lugar do badge;
   *   - altura mínima 30px em tela; espaço livre >= 1/10 da altura (41px -> 4.1px);
   *   - ⛔ nunca traduzir o badge por conta própria. Este é o BR-PT oficial da Apple.
   *   O SVG oficial embute um PNG 2048x2048 (482 KB) para renderizar a 41px.
   *   Fica como veio: reamostrar seria "alterar a arte". 1 request, cacheado.
   *
   * SPOTIFY — developer.spotify.com/documentation/design:
   *   - largura mínima 70px em tela (a 26px de altura dá ~95px);
   *   - espaço livre >= 1/2 da altura do logo (26px -> 13px);
   *   - só as variantes oficiais (verde/preto/branco). Nunca recolorir.
   *   O gap de 1rem (16px) atende Apple (4.1px) e Spotify (13px) ao mesmo tempo.
   */
  badge: {
    apple: "/images/external/apple/Apple_Podcast_Listen_on_Badge_RGB_BR-PT_CI_111825.svg",
    appleAlt: "Ouça no Apple Podcasts",
    appleWidth: 129,
    appleHeight: 41,
    spotify: "/images/external/spotify/Full_Logo_Green_RGB.svg",
    spotifyAlt: "Spotify",
    spotifyWidth: 95,
    spotifyHeight: 26,
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
