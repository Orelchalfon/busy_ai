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
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import {
  AlertCircle,
  CheckCircle2,
  Headphones,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Radio,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type TokenResponse = {
  token?: string;
  error?: string;
  config?: {
    hasApiKey: boolean;
  };
};

type OutboundCallResponse = {
  error?: string;
  call?: {
    success?: boolean;
    message?: string;
    conversation_id?: string | null;
    callSid?: string | null;
  };
};

type ConversationMessage = {
  id: string;
  source: "ai" | "user";
  message: string;
};

function ElevenLabsSalesAgentPanelContent() {
  const t = useTranslations("agentPage.live");
  const [isStarting, setIsStarting] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(
    null,
  );
  const [outboundError, setOutboundError] = useState<string | null>(null);
  const [textMessage, setTextMessage] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [leadName, setLeadName] = useState("Or test lead");
  const [toNumber, setToNumber] = useState("+972526365123");
  const [interest, setInterest] = useState(
    "E2E test call from Busy AI dashboard",
  );
  const [isCalling, setIsCalling] = useState(false);
  const [outboundResult, setOutboundResult] =
    useState<OutboundCallResponse | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      setIsStarting(false);
      setConversationError(null);
    },
    onDisconnect: () => {
      setIsStarting(false);
    },
    onError: (message) => {
      setIsStarting(false);
      setConversationError(
        typeof message === "string" ? message : t("genericError"),
      );
    },
    onMessage: (message) => {
      if (!message.message) {
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: `${message.event_id ?? Date.now()}-${current.length}`,
          source: message.source,
          message: message.message,
        },
      ]);
    },
  });

  const endSessionRef = useRef(conversation.endSession);
  const isConnected = conversation.status === "connected";
  const isConnecting = conversation.status === "connecting" || isStarting;
  const canStart = !isConnected && !isConnecting;

  const statusLabel = useMemo(() => {
    if (isStarting) {
      return t("status.preparing");
    }

    if (conversation.status === "connected") {
      return conversation.isSpeaking
        ? t("status.speaking")
        : t("status.listening");
    }

    if (conversation.status === "connecting") {
      return t("status.connecting");
    }

    if (conversation.status === "error") {
      return t("status.error");
    }

    return t("status.idle");
  }, [conversation.isSpeaking, conversation.status, isStarting, t]);

  useEffect(() => {
    endSessionRef.current = conversation.endSession;
  }, [conversation.endSession]);

  useEffect(() => {
    return () => {
      endSessionRef.current();
    };
  }, []);

  async function startConversation() {
    setIsStarting(true);
    setConversationError(null);

    try {
      console.info("[elevenlabs:conversation-ui] Start clicked", {
        status: conversation.status,
      });

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(t("microphoneUnsupported"));
      }

      console.info(
        "[elevenlabs:conversation-ui] Requesting microphone permission",
      );
      await navigator.mediaDevices.getUserMedia({ audio: true });

      console.info(
        "[elevenlabs:conversation-ui] Requesting conversation token",
      );
      const response = await fetch("/api/elevenlabs/conversation-token", {
        method: "GET",
        cache: "no-store",
      });
      const payload = (await response
        .json()
        .catch(() => ({}))) as TokenResponse;

      console.info("[elevenlabs:conversation-ui] Token response", {
        status: response.status,
        ok: response.ok,
        hasToken: Boolean(payload.token),
        error: payload.error,
      });

      if (!response.ok || !payload.token) {
        throw new Error(payload.error ?? t("tokenError"));
      }

      console.info("[elevenlabs:conversation-ui] Starting WebRTC session");
      conversation.startSession({
        conversationToken: payload.token,
        connectionType: "webrtc",
      });
    } catch (startError) {
      console.error("[elevenlabs:conversation-ui] Start failed", startError);
      setIsStarting(false);
      setConversationError(
        startError instanceof Error ? startError.message : t("genericError"),
      );
    }
  }

  function stopConversation() {
    setConversationError(null);
    setIsStarting(false);
    conversation.endSession();
  }

  function sendTextMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = textMessage.trim();

    if (!message || !isConnected) {
      return;
    }

    conversation.sendUserMessage(message);
    setTextMessage("");
  }

  async function startOutboundCall() {
    setIsCalling(true);
    setOutboundError(null);
    setOutboundResult(null);

    try {
      console.info("[elevenlabs:outbound-ui] Submitting outbound call", {
        toNumber,
        hasLeadName: Boolean(leadName.trim()),
        hasInterest: Boolean(interest.trim()),
      });

      const response = await fetch("/api/elevenlabs/outbound-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leadName, toNumber, interest }),
      });
      const payload = (await response
        .json()
        .catch(() => ({}))) as OutboundCallResponse;

      console.info("[elevenlabs:outbound-ui] Outbound call response", {
        status: response.status,
        ok: response.ok,
        payload,
      });

      setOutboundResult(payload);

      if (!response.ok || payload.error) {
        setOutboundError(payload.error ?? t("outbound.genericError"));
      }
    } catch (callError) {
      const message =
        callError instanceof Error
          ? callError.message
          : t("outbound.genericError");
      setOutboundError(message);
      setOutboundResult({ error: message });
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
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-5'>
        <div
          className='grid gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4 md:p-5'
          aria-labelledby='outbound-call-title'>
          <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
            <div className='min-w-0'>
              <p
                id='outbound-call-title'
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
              suppressHydrationWarning
            />
          </label>

          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm text-muted-foreground'>
              {t("outbound.callerNumber")}{" "}
              <span dir='ltr' className='font-medium text-foreground'>
                +14709467589
              </span>
            </p>
            <Button
              type='button'
              className='min-w-full gap-2 sm:min-w-44'
              disabled={isCalling || !toNumber.trim()}
              onClick={(event) => {
                event.preventDefault();
                void startOutboundCall();
              }}>
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

          {outboundError ? (
            <div
              className='rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive'
              role='alert'>
              <p className='inline-flex items-center gap-2 font-medium'>
                <AlertCircle className='h-4 w-4' aria-hidden='true' />
                {t("outbound.errorTitle")}
              </p>
              <p className='mt-1 leading-6'>{outboundError}</p>
            </div>
          ) : null}

          {outboundResult && !outboundResult.error ? (
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
                {outboundResult.call?.message ??
                  t("outbound.successDescription")}
              </p>
              <div className='mt-3 grid gap-2 text-xs text-muted-foreground'>
                {outboundResult.call?.conversation_id ? (
                  <p className='break-all' dir='ltr'>
                    Conversation ID: {outboundResult.call.conversation_id}
                  </p>
                ) : null}
                {outboundResult.call?.callSid ? (
                  <p className='break-all' dir='ltr'>
                    Call SID: {outboundResult.call.callSid}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className='rounded-lg border border-border/70 bg-background/85 p-4 md:p-5'>
          <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
            <div className='min-w-0'>
              <p className='inline-flex items-center gap-2 font-semibold text-foreground'>
                <Headphones
                  className='h-4 w-4 text-muted-foreground'
                  aria-hidden='true'
                />
                {t("browser.title")}
              </p>
              <p className='mt-1 text-sm leading-6 text-muted-foreground'>
                {t("description")}
              </p>
              <p
                className='mt-1 break-all text-xs text-muted-foreground'
                dir='ltr'>
                agent_0901kqqs0myteq79638e1rbk5hp1
              </p>
            </div>
            <Badge className='w-fit border border-border bg-secondary text-secondary-foreground'>
              {statusLabel}
            </Badge>
          </div>

          <div className='mt-4 grid gap-3 sm:grid-cols-2'>
            <div className='rounded-lg border border-border/70 bg-secondary/45 p-3'>
              <p className='text-xs font-medium uppercase text-muted-foreground'>
                {t("connectionLabel")}
              </p>
              <p className='mt-1 text-sm font-medium'>{statusLabel}</p>
            </div>
            <div className='rounded-lg border border-border/70 bg-secondary/45 p-3'>
              <p className='text-xs font-medium uppercase text-muted-foreground'>
                {t("modeLabel")}
              </p>
              <p className='mt-1 inline-flex items-center gap-2 text-sm font-medium'>
                {conversation.isSpeaking ? (
                  <Radio className='h-4 w-4 text-primary' aria-hidden='true' />
                ) : (
                  <MicOff
                    className='h-4 w-4 text-muted-foreground'
                    aria-hidden='true'
                  />
                )}
                {conversation.isSpeaking ? t("speaking") : t("listening")}
              </p>
            </div>
          </div>

          <div className='mt-4 flex flex-col gap-2 sm:flex-row'>
            <Button
              type='button'
              variant='outline'
              className='gap-2'
              disabled={!canStart}
              onClick={(event) => {
                event.preventDefault();
                void startConversation();
              }}>
              {isConnecting ? (
                <RefreshCw
                  className='h-4 w-4 animate-spin'
                  aria-hidden='true'
                />
              ) : (
                <Mic className='h-4 w-4' aria-hidden='true' />
              )}
              {isConnecting ? t("starting") : t("start")}
            </Button>
            <Button
              type='button'
              variant='ghost'
              className='gap-2'
              disabled={!isConnected && !isConnecting}
              onClick={stopConversation}>
              <PhoneOff className='h-4 w-4' aria-hidden='true' />
              {t("stop")}
            </Button>
          </div>

          {conversationError ? (
            <div
              className='mt-4 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive'
              role='alert'>
              <p className='inline-flex items-center gap-2 font-medium'>
                <AlertCircle className='h-4 w-4' aria-hidden='true' />
                {t("errorTitle")}
              </p>
              <p className='mt-1 leading-6'>{conversationError}</p>
            </div>
          ) : null}
        </div>

        <form
          onSubmit={sendTextMessage}
          className='flex flex-col gap-2 sm:flex-row'>
          <label className='sr-only' htmlFor='elevenlabs-text-message'>
            {t("textInputLabel")}
          </label>
          <input
            id='elevenlabs-text-message'
            value={textMessage}
            onChange={(event) => setTextMessage(event.target.value)}
            placeholder={t("textInputPlaceholder")}
            className='min-h-11 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring'
            disabled={!isConnected}
            suppressHydrationWarning
          />
          <Button
            type='submit'
            variant='outline'
            className='gap-2'
            disabled={!isConnected || !textMessage.trim()}>
            <Send className='h-4 w-4' aria-hidden='true' />
            {t("send")}
          </Button>
        </form>

        <div className='rounded-lg border border-border/70 bg-background/85 p-4'>
          <p className='font-medium text-foreground'>{t("messagesTitle")}</p>
          {messages.length === 0 ? (
            <p className='mt-2 text-sm text-muted-foreground'>
              {t("messagesEmpty")}
            </p>
          ) : (
            <div className='mt-3 space-y-3'>
              {messages.slice(-6).map((message) => (
                <div
                  key={message.id}
                  className='rounded-lg border border-border/70 bg-secondary/45 p-3'>
                  <p className='text-xs font-medium uppercase text-muted-foreground'>
                    {message.source === "ai"
                      ? t("agentMessage")
                      : t("userMessage")}
                  </p>
                  <p className='mt-1 text-sm leading-6 text-foreground'>
                    {message.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ElevenLabsSalesAgentPanel() {
  return (
    <ConversationProvider>
      <ElevenLabsSalesAgentPanelContent />
    </ConversationProvider>
  );
}
