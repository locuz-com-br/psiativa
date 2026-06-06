import { useEffect, useRef, useState } from "react";
import { trackEvent } from "../../lib/analytics";

interface FormbricksLinkSurveyProps {
  appUrl: string;
  surveyId: string;
  redirectUrl?: string;
  redirectDelay?: number;
}

const VISITOR_KEY = "psiativa-visitor-id";
const completedKey = (surveyId: string) =>
  `fb-survey-completed-${surveyId}`;

function getOrCreateVisitorId(): string {
  const existing = localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;

  const id = `anon-${crypto.randomUUID()}`;
  localStorage.setItem(VISITOR_KEY, id);
  return id;
}

export default function FormbricksLinkSurvey({
  appUrl,
  surveyId,
  redirectUrl,
  redirectDelay = 3000,
}: FormbricksLinkSurveyProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [completed, setCompleted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const normalizedAppUrl = appUrl.replace(/\/$/, "");
  const surveyOrigin = new URL(normalizedAppUrl).origin;
  const visitorId =
    typeof window === "undefined" ? "" : getOrCreateVisitorId();
  const surveyUrl =
    `${normalizedAppUrl}/s/${encodeURIComponent(surveyId)}` +
    `?embed=true&userId=${encodeURIComponent(visitorId)}`;

  useEffect(() => {
    setCompleted(
      localStorage.getItem(completedKey(surveyId)) === "true",
    );
  }, [surveyId]);

  useEffect(() => {
    trackEvent("survey_start", {
      survey_type: "link",
      survey_route: window.location.pathname,
    });

    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== surveyOrigin ||
        event.source !== iframeRef.current?.contentWindow ||
        event.data !== "formbricksSurveyCompleted"
      ) {
        return;
      }

      localStorage.setItem(completedKey(surveyId), "true");
      setCompleted(true);
      trackEvent("survey_complete", {
        survey_type: "link",
        survey_route: window.location.pathname,
      });

      if (redirectUrl) {
        window.setTimeout(() => {
          window.location.assign(redirectUrl);
        }, redirectDelay);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [redirectDelay, redirectUrl, surveyId, surveyOrigin]);

  if (completed) {
    return (
      <div className="survey-complete">
        <section className="survey-complete-card">
          <span className="survey-check" aria-hidden="true">✓</span>
          <h1>Obrigado!</h1>
          <p>
            Suas respostas foram registradas com sucesso. Entraremos em
            contato em breve.
          </p>
          {redirectUrl && <small>Redirecionando em alguns segundos...</small>}
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(completedKey(surveyId));
              setCompleted(false);
            }}
          >
            Refazer pesquisa
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="survey-iframe-shell" data-clarity-mask="true">
      {!loaded && (
        <div className="survey-loading" role="status">
          Carregando diagnóstico...
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={surveyUrl}
        title="Diagnóstico PsiAtiva"
        allow="clipboard-write"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
