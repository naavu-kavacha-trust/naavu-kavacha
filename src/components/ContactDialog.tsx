import { useState, type ReactNode } from "react";
import { Check, Copy, ExternalLink, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EMAIL } from "@/data/siteConfig";
import { buildGmailUrl, buildMailtoUrl, copyToClipboard } from "@/lib/contact";

interface ContactDialogProps {
  subject: string;
  /** Pre-filled message body. */
  body?: string;
  title?: string;
  /** Short line under the title. */
  intro?: string;
  /** The element that opens the dialog. Omit when controlling with `open`. */
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Email chooser. A bare `mailto:` link does nothing on devices without a mail
 * app, so this offers three routes: the device's mail app, Gmail on the web,
 * or copying the address.
 */
const ContactDialog = ({
  subject,
  body = "Hello Naavu Kavacha team,\n\n",
  title = "Email Naavu Kavacha",
  intro = "Choose how you'd like to send your message.",
  children,
  open,
  onOpenChange,
}: ContactDialogProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(EMAIL);
    if (ok) {
      setCopied(true);
      toast.success("Email address copied");
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Couldn't copy automatically. Please select the address and copy it.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{title}</DialogTitle>
          <DialogDescription>{intro}</DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Send to</p>
          <p className="select-all break-all font-medium text-foreground">{EMAIL}</p>
          <p className="mt-2 text-xs text-muted-foreground">Subject: {subject}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild className="h-11 rounded-full">
            <a href={buildMailtoUrl(subject, body)}>
              <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
              Open in email app
            </a>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full">
            <a
              href={buildGmailUrl(subject, body)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
              Open in Gmail
            </a>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-full"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy email address"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
