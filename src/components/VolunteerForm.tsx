import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Instagram, Loader2 } from "lucide-react";
import DeferredContactDialog from "@/components/DeferredContactDialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { VOLUNTEER_INTERESTS } from "@/data/interests";
import { INSTAGRAM_URL, VOLUNTEER_ENDPOINT, WHATSAPP_CHANNEL_URL } from "@/data/siteConfig";
import { useVolunteerPrefill } from "@/hooks/use-volunteer-prefill";
import {
  AVAILABILITY_OPTIONS,
  buildEmailBody,
  buildPayload,
  submitVolunteer,
  volunteerDefaults,
  volunteerSchema,
  type VolunteerFormValues,
} from "@/lib/volunteer";

type Status = "idle" | "sending" | "success" | "error";

const labelClass = "text-base font-medium text-foreground";
const inputClass = "h-12 rounded-xl border-border bg-background text-base shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary/30";

const VolunteerForm = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailBody, setEmailBody] = useState("");
  const successRef = useRef<HTMLHeadingElement>(null);
  const { interests: prefillInterests, clear: clearPrefill } = useVolunteerPrefill();

  const form = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: volunteerDefaults,
    mode: "onTouched",
  });

  // "Volunteer for this activity" pre-selects that activity's interest (added to any already ticked).
  useEffect(() => {
    if (prefillInterests.length === 0) return;
    const valid = VOLUNTEER_INTERESTS.filter((i) => prefillInterests.includes(i));
    const current = form.getValues("interests") ?? [];
    form.setValue("interests", Array.from(new Set([...current, ...valid])), {
      shouldDirty: true,
      shouldValidate: form.formState.isSubmitted,
    });
    clearPrefill();
  }, [prefillInterests, clearPrefill, form]);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const openEmailFallback = (values: VolunteerFormValues) => {
    setEmailBody(buildEmailBody(values));
    setEmailOpen(true);
  };

  const onSubmit = async (values: VolunteerFormValues) => {
    // Honeypot: people never see this field. Quietly drop the submission.
    if (values.website) {
      setStatus("success");
      return;
    }

    // No endpoint configured: never pretend it was sent. Hand the details over by email instead.
    if (!VOLUNTEER_ENDPOINT) {
      openEmailFallback(values);
      return;
    }

    setStatus("sending");
    try {
      await submitVolunteer(VOLUNTEER_ENDPOINT, buildPayload(values));
      form.reset(volunteerDefaults);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div role="status" className="py-6 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" strokeWidth={1.5} aria-hidden="true" />
        <h3
          ref={successRef}
          tabIndex={-1}
          className="font-display text-2xl font-bold text-foreground outline-none"
        >
          Thank you — we'll reach out soon
        </h3>
        <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
          In the meantime, follow what we're up to and join the conversation.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <WhatsAppIcon className="h-4 w-4 shrink-0" />
            Join our WhatsApp channel
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Instagram className="h-4 w-4" aria-hidden="true" />
            Follow on Instagram
          </a>
        </div>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Register someone else
        </button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5" aria-busy={sending}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Name *</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" inputMode="email" autoComplete="email" className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Phone number *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organisation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>College / Organisation</FormLabel>
                  <FormControl>
                    <Input autoComplete="organization" className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="interests"
            render={({ field }) => (
              <FormItem>
                <fieldset>
                  <legend className={labelClass}>Areas of interest * (choose at least one)</legend>
                  <FormControl>
                    <div className="mt-2 grid gap-x-4 sm:grid-cols-2">
                      {VOLUNTEER_INTERESTS.map((interest) => {
                        const checked = field.value?.includes(interest) ?? false;
                        return (
                          <label
                            key={interest}
                            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1 text-base text-foreground/90 hover:bg-muted/60"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(next) => {
                                const current = field.value ?? [];
                                field.onChange(
                                  next === true
                                    ? [...current, interest]
                                    : current.filter((i) => i !== interest),
                                );
                              }}
                              onBlur={field.onBlur}
                            />
                            {interest}
                          </label>
                        );
                      })}
                    </div>
                  </FormControl>
                </fieldset>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <fieldset>
                  <legend className={labelClass}>Availability *</legend>
                  <FormControl>
                    <RadioGroup
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      className="mt-2 grid gap-x-4 sm:grid-cols-2"
                    >
                      {AVAILABILITY_OPTIONS.map((option) => (
                        <label
                          key={option}
                          className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1 text-base text-foreground/90 hover:bg-muted/60"
                        >
                          <RadioGroupItem value={option} />
                          {option}
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </fieldset>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Message (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Anything you'd like us to know?"
                    className="min-h-28 resize-y rounded-xl border-border bg-background text-base shadow-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Leave this field empty
              <input type="text" tabIndex={-1} autoComplete="off" {...form.register("website")} />
            </label>
          </div>

          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg py-2 text-base text-foreground/90">
                  <FormControl>
                    <Checkbox
                      className="mt-0.5"
                      checked={field.value === true}
                      onCheckedChange={(next) => field.onChange(next === true ? true : undefined)}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <span>I agree to be contacted by Naavu Kavacha about volunteering. *</span>
                </label>
                <FormMessage />
              </FormItem>
            )}
          />

          {status === "error" && (
            <div
              role="alert"
              className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
              <div>
                <p className="font-medium">We couldn't send your details.</p>
                <p className="mt-1 text-muted-foreground">
                  Please check your connection and try again, or{" "}
                  <button
                    type="button"
                    onClick={() => openEmailFallback(form.getValues())}
                    className="font-medium text-primary underline underline-offset-4"
                  >
                    email us instead
                  </button>
                  .
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {sending && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            <span className="volunteer-submit-label">
              {sending ? "Sending…" : status === "error" ? "Try again" : "Become a Volunteer"}
            </span>
          </button>

          {!VOLUNTEER_ENDPOINT && (
            <p className="text-center text-xs text-muted-foreground">
              Submitting opens an email to our team with your details filled in. Nothing is sent
              until you press send in your email.
            </p>
          )}

          <p className="text-center text-xs text-muted-foreground">
            We use your details to coordinate volunteer opportunities and contact you about them. Read our{" "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</a>.
          </p>
        </form>
      </Form>

      <DeferredContactDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        subject="Volunteer Registration"
        title="Send your details by email"
        intro="Your registration has not been sent yet. Choose how to email it to our team; your details are already filled in."
        body={emailBody}
      />
    </>
  );
};

export default VolunteerForm;
