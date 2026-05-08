"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ApiClientError, apiRequest } from "@/lib/api";
import { AlertCircle, Save } from "lucide-react";

type CreateAgentResponse = {
  agent: {
    id: string;
    name: string;
  };
};

export function NewAgentForm() {
  const t = useTranslations("agents.new");
  const router = useRouter();

  const [name, setName] = useState("");
  const [persona, setPersona] = useState("");
  const [servicesText, setServicesText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await apiRequest<CreateAgentResponse>("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, persona, servicesText })
      });
      router.replace(`/dashboard/agents/${result.agent.id}`);
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof ApiClientError
          ? submitError.message
          : submitError instanceof Error
            ? submitError.message
            : t("genericError");
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("formTitle")}</CardTitle>
        <CardDescription>{t("formDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="grid gap-2 text-sm font-medium">
            {t("nameLabel")}
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
              minLength={2}
              suppressHydrationWarning
            />
            <span className="text-xs font-normal text-muted-foreground">{t("nameHelp")}</span>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            {t("personaLabel")}
            <textarea
              value={persona}
              onChange={(event) => setPersona(event.target.value)}
              className="min-h-32 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
              minLength={20}
              placeholder={t("personaPlaceholder")}
              suppressHydrationWarning
            />
            <span className="text-xs font-normal text-muted-foreground">{t("personaHelp")}</span>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            {t("servicesLabel")}
            <textarea
              value={servicesText}
              onChange={(event) => setServicesText(event.target.value)}
              className="min-h-32 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
              minLength={10}
              placeholder={t("servicesPlaceholder")}
              suppressHydrationWarning
            />
            <span className="text-xs font-normal text-muted-foreground">{t("servicesHelp")}</span>
          </label>

          <div className="flex items-center justify-end">
            <Button type="submit" disabled={submitting} className="gap-2">
              <Save className="h-4 w-4" aria-hidden="true" />
              {submitting ? t("submitting") : t("submit")}
            </Button>
          </div>

          {error ? (
            <div
              className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              <p className="inline-flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {t("errorTitle")}
              </p>
              <p className="mt-1 leading-6">{error}</p>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
