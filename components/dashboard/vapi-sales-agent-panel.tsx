"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "@/i18n/navigation";
import { ApiClientError, apiRequest } from "@/lib/api";
import {
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  Radio,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";

type CallResponse = {
  call?: {
    id: string;
    providerCallId?: string;
    status: string;
    summary?: string;
  };
};

export function VapiSalesAgentPanel() {
  const t = useTranslations("agentPage.live");
  const router = useRouter();
  const [leadName, setLeadName] = useState("Or test lead");
  const [toNumber, setToNumber] = useState("+972526365123");
  const [interest, setInterest] = useState(
    "E2E test call from Busy AI dashboard",
  );
  const [isCalling, setIsCalling] = useState(false);
  const [result, setResult] = useState<CallResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startOutboundCall(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCalling(true);
    setResult(null);
    setError(null);

    try {
      console.info("[vapi:outbound-ui] Submitting outbound call", {
        toNumber,
        hasLeadName: Boolean(leadName.trim()),
        hasInterest: Boolean(interest.trim()),
      });

      const payload = await apiRequest<CallResponse>("/api/vapi/calls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leadName, phone: toNumber, interest }),
      });

      console.info("[vapi:outbound-ui] Outbound call response", { payload });

      setResult(payload);
      router.refresh();
    } catch (callError) {
      const message =
        callError instanceof ApiClientError
          ? callError.message
          : callError instanceof Error
            ? callError.message
            : t("outbound.genericError");
      setError(message);
    } finally {
      setIsCalling(false);
    }
  }

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='border-b border-border/60 bg-secondary/35'>
        <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <Badge className='w-fit border border-primary/20 bg-primary/10 text-primary'>
            <Radio className='me-1.5 h-3.5 w-3.5' aria-hidden='true' />
            {t("status.idle")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-5'>
        <form
          onSubmit={startOutboundCall}
          className='grid gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4 md:p-5'
          aria-labelledby='vapi-outbound-call-title'>
          <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
            <div className='min-w-0'>
              <p
                id='vapi-outbound-call-title'
                className='inline-flex items-center gap-2 font-semibold text-foreground'>
                <PhoneCall
                  className='h-4 w-4 text-primary'
                  aria-hidden='true'
                />
                {t("outbound.title")}
              </p>
              <p className='mt-1 text-sm leading-6 text-muted-foreground'>
                {t("outbound.description")}
              </p>
            </div>
            <Badge className='w-fit border border-primary/20 bg-background text-primary'>
              <ShieldCheck className='me-1.5 h-3.5 w-3.5' aria-hidden='true' />
              {t("outbound.primaryBadge")}
            </Badge>
          </div>

          <div className='flex items-center gap-4'>
            <label className='grid gap-2 text-sm font-medium'>
              {t("outbound.leadName")}
              <input
                value={leadName}
                onChange={(event) => setLeadName(event.target.value)}
                className='h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring'
                autoComplete='name'
                required
                suppressHydrationWarning
              />
            </label>

            <label className='grid gap-2 text-sm font-medium'>
              {t("outbound.toNumber")}
              <input
                value={toNumber}
                onChange={(event) => setToNumber(event.target.value)}
                placeholder='+972501234567'
                className='h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring'
                dir='ltr'
                type='tel'
                inputMode='tel'
                autoComplete='tel'
                required
                suppressHydrationWarning
              />
            </label>
          </div>
          <span className='text-xs font-normal leading-5 text-muted-foreground'>
            {t("outbound.phoneHelp")}
          </span>

          <label className='grid gap-2 text-sm font-medium'>
            {t("outbound.interest")}
            <textarea
              value={interest}
              onChange={(event) => setInterest(event.target.value)}
              className='min-h-20 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring'
              required
              suppressHydrationWarning
            />
          </label>

          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <Button
              type='button'
              variant='outline'
              className='gap-2'
              onClick={() => router.refresh()}>
              <RefreshCw className='h-4 w-4' aria-hidden='true' />
              {t("refreshStatus")}
            </Button>
            <Button
              type='submit'
              className='min-w-full gap-2 sm:min-w-44'
              disabled={isCalling || !toNumber.trim()}>
              {isCalling ? (
                <RefreshCw
                  className='h-4 w-4 animate-spin'
                  aria-hidden='true'
                />
              ) : (
                <Radio className='h-4 w-4' aria-hidden='true' />
              )}
              {isCalling ? t("outbound.calling") : t("outbound.start")}
            </Button>
          </div>

          {error ? (
            <div
              className='rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive'
              role='alert'>
              <p className='inline-flex items-center gap-2 font-medium'>
                <AlertCircle className='h-4 w-4' aria-hidden='true' />
                {t("outbound.errorTitle")}
              </p>
              <p className='mt-1 leading-6'>{error}</p>
            </div>
          ) : null}

          {result?.call ? (
            <div
              className='rounded-lg border border-primary/20 bg-background p-3 text-sm'
              aria-live='polite'>
              <p className='inline-flex items-center gap-2 font-medium text-foreground'>
                <CheckCircle2
                  className='h-4 w-4 text-primary'
                  aria-hidden='true'
                />
                {t("outbound.successTitle")}
              </p>
              <p className='mt-1 text-muted-foreground'>
                {t("outbound.successDescription")}
              </p>
              <div className='mt-3 grid gap-2 text-xs text-muted-foreground'>
                <p className='break-all' dir='ltr'>
                  Status: {result.call.status}
                </p>
                <p className='break-all' dir='ltr'>
                  Call ID: {result.call.providerCallId ?? result.call.id}
                </p>
                {result.call.summary ? (
                  <p className='break-all'>{result.call.summary}</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
