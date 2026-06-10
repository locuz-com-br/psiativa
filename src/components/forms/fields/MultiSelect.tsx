import type { FieldProps } from "../../../lib/forms";

// Checkboxes: várias escolhas. NÃO auto-avança (precisa do botão Continuar).
export default function MultiSelect({ question, answer, onChange }: FieldProps) {
  const options = question.options ?? [];
  const selected = (answer?.value as string[]) ?? [];

  function toggle(id: string) {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    const labels = options.filter((o) => next.includes(o.id)).map((o) => o.label);
    onChange(next, labels);
  }

  return (
    <div className="nf-options" role="group" aria-label={question.prompt}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={selected.includes(o.id)}
          className="nf-option"
          onClick={() => toggle(o.id)}
        >
          <span className="nf-check" aria-hidden="true" />
          <span className="nf-option-label">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
