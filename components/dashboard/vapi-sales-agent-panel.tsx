"use client";

import { useRouter } from "@/i18n/navigation";
import { PhoneCall, RefreshCw } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type CallResponse = {
  error?: string;
  call?: {
    id: string;
    providerCallId?: string;
    status: string;
    summary?: string;
  };
  config?: {
    hasApiKey: boolean;
    hasAssistantId: boolean;
    hasPhoneNumberId: boolean;
    hasAppBaseUrl: boolean;
  };
};

export function VapiSalesAgentPanel() {
  const router = useRouter();
  const [leadName, setLeadName] = useState("נועה כהן");
  const [phone, setPhone] = useState("050-123-4567");
  const [interest, setInterest] = useState("מעוניינת בארון הזזה כולל התקנה");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CallResponse | null>(null);

  async function startCall(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    const response = await fetch("/api/vapi/calls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ leadName, phone, interest })
    });

    const payload = (await response.json()) as CallResponse;
    setResult(payload);
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>סוכן מכירות AI חי</CardTitle>
        <CardDescription>
          שלח שיחת outbound דרך Vapi לליד אמיתי. המפתח וה־assistant נשארים בצד שרת בלבד.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={startCall} className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            שם ליד
            <input
              value={leadName}
              onChange={(event) => setLeadName(event.target.value)}
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
              suppressHydrationWarning
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            טלפון
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              dir="ltr"
              required
              suppressHydrationWarning
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            במה הלקוח מתעניין
            <textarea
              value={interest}
              onChange={(event) => setInterest(event.target.value)}
              className="min-h-24 rounded-lg border border-input bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
              suppressHydrationWarning
            />
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <PhoneCall className="h-4 w-4" />
              {isSubmitting ? "מתחיל שיחה..." : "התקשר עם Vapi AI"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => router.refresh()}
            >
              <RefreshCw className="h-4 w-4" />
              רענן סטטוס
            </Button>
          </div>
        </form>

        {result ? (
          <div className="mt-5 rounded-lg border border-border bg-secondary/70 p-4 text-sm">
            {result.error ? (
              <div className="space-y-2">
                <p className="font-semibold text-foreground">השיחה לא יצאה</p>
                <p className="text-muted-foreground">{result.error}</p>
                {result.config ? (
                  <p className="text-muted-foreground">
                    בדוק ENV: VAPI_API_KEY, VAPI_ASSISTANT_ID, VAPI_PHONE_NUMBER_ID, APP_BASE_URL.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-semibold text-foreground">השיחה נשלחה ל־Vapi</p>
                <p className="text-muted-foreground">
                  סטטוס: {result.call?.status} | Call ID: {result.call?.providerCallId ?? result.call?.id}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
