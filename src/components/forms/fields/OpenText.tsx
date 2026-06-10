import type { FieldProps } from "../../../lib/forms";

// Texto curto (input) e longo (textarea via type === "long_text").
export default function OpenText({ question, answer, onChange }: FieldProps) {
  const value = (answer?.value as string) ?? "";
  const multiline = question.type === "long_text";

  if (multiline) {
    return (
      <textarea
        className="nf-textarea"
        rows={4}
        value={value}
        maxLength={question.maxLength}
        placeholder={question.placeholder}
        aria-label={question.prompt}
        onChange={(e) => onChange(e.currentTarget.value, e.currentTarget.value)}
      />
    );
  }

  return (
    <input
      className="nf-input"
      type="text"
      value={value}
      maxLength={question.maxLength}
      placeholder={question.placeholder}
      aria-label={question.prompt}
      onChange={(e) => onChange(e.currentTarget.value, e.currentTarget.value)}
    />
  );
}
