"use client";

import { formatBRL } from "../../lib/calculadora";
import type { Lang } from "../../lib/useSiteLang";

interface ChartProps {
  curvaSem: number[];
  curvaCom: number[];
  labelSem: string;
  labelCom: string;
  gap: number;
  autoQualified: boolean;
  lang: Lang;
}

// Copy interno do gráfico (rótulos/aria). labelSem/labelCom chegam já
// resolvidos pela island; aqui ficam só os textos próprios do SVG.
const CHART_COPY = {
  pt: {
    title: "Faturamento acumulado: com método vs. sem método",
    months: "MESES",
    moneyOnTable: "Dinheiro na mesa",
    thousands: (n: string) => `R$ ${n} mil`,
    ariaAuto: (n: number) =>
      `Gráfico de faturamento acumulado em ${n} meses. Com e sem um processo de captação, suas curvas ficam próximas. A diferença é pequena.`,
    aria: (n: number, com: string, sem: string, g: string) =>
      `Gráfico de faturamento acumulado em ${n} meses. Com um processo de captação a curva chega a ${com}; sem processo, a ${sem}. A diferença no ciclo é de ${g}.`,
  },
  en: {
    title: "Cumulative revenue: with a method vs. without",
    months: "MONTHS",
    moneyOnTable: "Money on the table",
    thousands: (n: string) => `R$ ${n}k`,
    ariaAuto: (n: number) =>
      `Cumulative revenue chart over ${n} months. With and without an acquisition process, your curves stay close. The difference is small.`,
    aria: (n: number, com: string, sem: string, g: string) =>
      `Cumulative revenue chart over ${n} months. With an acquisition process the curve reaches ${com}; without one, ${sem}. The difference over the cycle is ${g}.`,
  },
};

// ── ViewBox geometry ──────────────────────────────────────────
const W = 720;
const H = 420;
const PAD = { top: 24, right: 18, bottom: 44, left: 72 };
const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;

// NOTA: var() não resolve em atributos de apresentação SVG (fill="var(--x)").
// Só resolve em CSS — por isso toda tinta baseada em token vai via `style`.
const AXIS_TEXT: React.CSSProperties = { fill: "var(--text-secondary)", fontFamily: "var(--font-ui)" };

function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

function compactBRL(v: number, c: (typeof CHART_COPY)[Lang]): string {
  if (v >= 1000) {
    const milhares = v / 1000;
    const n = milhares >= 10 ? Math.round(milhares) : Math.round(milhares * 10) / 10;
    return c.thousands(n.toLocaleString("pt-BR"));
  }
  return formatBRL(v);
}

export default function Chart({ curvaSem, curvaCom, labelSem, labelCom, gap, autoQualified, lang }: ChartProps) {
  const c = CHART_COPY[lang];
  const n = Math.max(curvaCom.length, curvaSem.length, 2);
  const maxY = niceCeil(Math.max(1, ...curvaCom, ...curvaSem));

  const xAt = (i: number) => PAD.left + (n <= 1 ? 0 : (i / (n - 1)) * plotW);
  const yAt = (v: number) => PAD.top + plotH - (v / maxY) * plotH;

  const ptsCom = curvaCom.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ");
  const ptsSem = curvaSem.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ");

  // Área do gap: curva "com" indo, "sem" voltando.
  const areaPts =
    curvaCom.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ") +
    " " +
    curvaSem.map((_, i) => `${xAt(curvaSem.length - 1 - i)},${yAt(curvaSem[curvaSem.length - 1 - i])}`).join(" ");

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxY);

  const endCom = curvaCom[curvaCom.length - 1] ?? 0;
  const endSem = curvaSem[curvaSem.length - 1] ?? 0;

  const ariaLabel = autoQualified
    ? c.ariaAuto(n)
    : c.aria(n, formatBRL(endCom), formatBRL(endSem), formatBRL(gap));

  return (
    <figure style={{ margin: 0 }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label={ariaLabel}
        style={{ display: "block", height: "auto", overflow: "visible" }}
      >
        <title>{c.title}</title>
        <desc>{ariaLabel}</desc>

        {/* Gridlines + rótulos do eixo Y */}
        {ticks.map((t, i) => (
          <g key={`y${i}`}>
            <line x1={PAD.left} y1={yAt(t)} x2={W - PAD.right} y2={yAt(t)} style={{ stroke: "var(--color-border)" }} strokeWidth={1} />
            <text x={PAD.left - 12} y={yAt(t) + 4} textAnchor="end" fontSize={14} style={AXIS_TEXT}>
              {compactBRL(t, c)}
            </text>
          </g>
        ))}

        {/* Rótulos do eixo X */}
        {curvaCom.map((_, i) => (
          <text key={`x${i}`} x={xAt(i)} y={H - PAD.bottom + 24} textAnchor="middle" fontSize={14} style={AXIS_TEXT}>
            {i + 1}
          </text>
        ))}
        <text x={PAD.left + plotW / 2} y={H - 6} textAnchor="middle" fontSize={13} letterSpacing="0.04em" style={AXIS_TEXT}>
          {c.months}
        </text>

        {/* Área do gap = dinheiro deixado na mesa */}
        {!autoQualified && gap > 0 && <polygon points={areaPts} style={{ fill: "var(--yellow)" }} fillOpacity={0.16} />}

        {/* Curva sem método (realidade atual) */}
        <polyline
          points={ptsSem}
          fill="none"
          style={{ stroke: "var(--text-secondary)" }}
          strokeWidth={2.5}
          strokeDasharray="6 5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Curva com método (cenário) */}
        <polyline
          points={ptsCom}
          fill="none"
          style={{ stroke: "var(--primary)" }}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pontos finais */}
        <circle cx={xAt(curvaSem.length - 1)} cy={yAt(endSem)} r={5} style={{ fill: "var(--text-secondary)" }} />
        <circle cx={xAt(curvaCom.length - 1)} cy={yAt(endCom)} r={6} style={{ fill: "var(--primary)" }} />
      </svg>

      {/* Legenda */}
      <figcaption
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.25rem",
          justifyContent: "center",
          marginTop: "0.75rem",
          fontFamily: "var(--font-ui)",
          fontSize: "0.875rem",
          color: "var(--text-secondary)",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ width: 22, height: 0, borderTop: "3.5px solid var(--primary)", display: "inline-block" }} />
          {labelCom}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ width: 22, height: 0, borderTop: "2.5px dashed var(--text-secondary)", display: "inline-block" }} />
          {labelSem}
        </span>
        {!autoQualified && gap > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: 16, height: 16, background: "var(--yellow)", opacity: 0.32, borderRadius: 3, display: "inline-block" }} />
            {c.moneyOnTable}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
