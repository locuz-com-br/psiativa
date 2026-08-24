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
    "Um espaço para falar sobre Psicologia de forma leve, humana e sem complicações — " +
    "emoções, relacionamentos, comportamento e saúde mental.",
  basePath: "/podcast/",
  rss: "https://anchor.fm/s/c24416d8/podcast/rss",
  apple: "https://podcasts.apple.com/us/podcast/psiativa/id1679960852",
  spotifyShow: "https://podcasters.spotify.com/pod/show/loivani-venturin",
  cover:
    "https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_nologo/32492422/32492422-1787142134193-669d90ff41fd.jpg",
  language: "pt-BR",
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
