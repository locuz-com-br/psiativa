import type { FieldProps } from "../../../lib/forms";

// Radio: uma escolha. A island auto-avança ao selecionar (decisão de UX do /quiz).
export default function SingleSelect({ question, answer, onChange }: FieldProps) {
  const selected = answer?.value as string | undefined;
  return (
    <div className="nf-options" role="radiogroup" aria-label={question.prompt}>
      {(question.options ?? []).map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={selected === o.id}
          className="nf-option"
          onClick={() => onChange(o.id, o.label)}
        >
          <span className="nf-radio" aria-hidden="true" />
          <span className="nf-option-label">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
