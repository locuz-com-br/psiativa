import type { FieldProps } from "../../../lib/forms";

// Escala min..max. style "number" (1–5, ou 0–10 estilo NPS) ou "star".
export default function RatingScale({ question, answer, onChange }: FieldProps) {
  const scale = question.scale ?? { min: 1, max: 5, style: "number" as const };
  const current = answer?.value as number | undefined;
  const isStar = scale.style === "star";

  const points: number[] = [];
  for (let n = scale.min; n <= scale.max; n++) points.push(n);

  const active = (n: number) =>
    current !== undefined && (isStar ? n <= current : n === current);

  return (
    <div className="nf-rating">
      <div className="nf-rating-row" role="group" aria-label={question.prompt}>
        {points.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={active(n)}
            aria-label={String(n)}
            className={
              "nf-rating-btn" + (isStar ? " is-star" : "") + (active(n) ? " is-active" : "")
            }
            onClick={() => onChange(n, String(n))}
          >
            {isStar ? "★" : n}
          </button>
        ))}
      </div>
      {(scale.minLabel || scale.maxLabel) && (
        <div className="nf-rating-labels">
          <span>{scale.minLabel}</span>
          <span>{scale.maxLabel}</span>
        </div>
      )}
    </div>
  );
}
