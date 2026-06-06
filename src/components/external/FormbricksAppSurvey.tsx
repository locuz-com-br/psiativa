import { useEffect, useState } from "react";
import formbricks from "@formbricks/js";
import { trackEvent } from "../../lib/analytics";

interface FormbricksAppSurveyProps {
  appUrl: string;
  workspaceId?: string;
  environmentId?: string;
  trigger: string;
}

export default function FormbricksAppSurvey({
  appUrl,
  workspaceId,
  environmentId,
  trigger,
}: FormbricksAppSurveyProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let cancelled = false;

    const setupSurvey = async () => {
      if (!workspaceId && !environmentId) {
        setStatus("error");
        return;
      }

      try {
        if (workspaceId) {
          await formbricks.setup({ workspaceId, appUrl });
        } else {
          await formbricks.setup({
            environmentId: environmentId as string,
            appUrl,
          });
        }

        if (!window.formbricks) {
          throw new Error("Formbricks SDK did not become available");
        }

        await formbricks.track(trigger);
        if (cancelled) return;

        trackEvent("survey_start", {
          survey_type: "website_app",
          survey_route: window.location.pathname,
        });
        setStatus("ready");
      } catch (error) {
        console.error("Failed to initialize Formbricks survey", error);
        if (!cancelled) setStatus("error");
      }
    };

    void setupSurvey();
    return () => {
      cancelled = true;
    };
  }, [appUrl, environmentId, trigger, workspaceId]);

  return (
    <div className="app-survey-shell" data-clarity-mask="true">
      <section className="app-survey-status" role="status">
        {status === "loading" && (
          <>
            <span className="survey-spinner" aria-hidden="true" />
            <h1>Carregando diagnóstico...</h1>
            <p>A pesquisa será aberta em instantes.</p>
          </>
        )}
        {status === "ready" && (
          <>
            <span className="survey-check" aria-hidden="true">✓</span>
            <h1>Diagnóstico carregado</h1>
            <p>
              Caso a pesquisa não apareça, atualize a página ou verifique as
              configurações de privacidade do navegador.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <h1>Não foi possível abrir o diagnóstico</h1>
            <p>
              A integração ainda não está configurada ou o serviço está
              indisponível. Tente novamente em alguns instantes.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
