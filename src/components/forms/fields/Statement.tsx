import type { FieldProps } from "../../../lib/forms";

// Sem input: a island renderiza o prompt como título e o botão Continuar.
// Aqui vai só o corpo (helper).
export default function Statement({ question }: FieldProps) {
  if (!question.helper) return null;
  return <p className="nf-statement-body">{question.helper}</p>;
}
