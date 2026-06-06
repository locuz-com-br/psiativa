export type AnalyticsEventName =
  | "cta_click"
  | "whatsapp_click"
  | "generate_lead"
  | "form_error"
  | "survey_start"
  | "survey_complete"
  | "qualify_lead"
  | "disqualify_lead";

export type AnalyticsEventParams = Record<
  string,
  string | number | boolean | undefined
>;

declare global {
  interface Window {
    psiativaAnalytics?: {
      getConsent: () => "granted" | "denied" | null;
      setConsent: (value: "granted" | "denied") => void;
      trackEvent: (
        name: AnalyticsEventName,
        params?: AnalyticsEventParams,
      ) => void;
      openPreferences: () => void;
    };
  }
}

export function trackEvent(
  name: AnalyticsEventName,
  params: AnalyticsEventParams = {},
): void {
  if (typeof window === "undefined") return;
  window.psiativaAnalytics?.trackEvent(name, params);
}
