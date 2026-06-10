import type { FieldProps } from "../../../lib/forms";

// Checkbox obrigatório. A island mostra o prompt como título; o helper é o
// rótulo ao lado da caixa.
export default function Consent({ question, answer, onChange }: FieldProps) {
  const checked = answer?.value === true;
  return (
    <label className="nf-consent">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked, question.helper ?? question.prompt)}
      />
      <span>{question.helper ?? question.prompt}</span>
    </label>
  );
}
