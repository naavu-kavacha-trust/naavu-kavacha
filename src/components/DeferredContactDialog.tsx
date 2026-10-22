import { cloneElement, lazy, Suspense, useEffect, useRef, useState, type MouseEvent, type ReactElement, type Ref } from "react";
import type { ContactDialogProps } from "@/components/ContactDialog";

const ContactDialog = lazy(() => import("@/components/ContactDialog"));

/** Load the contact dialog only after its trigger is used. */
const DeferredContactDialog = ({
  children,
  open,
  onOpenChange,
  onCloseAutoFocus,
  ...dialogProps
}: ContactDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activated, setActivated] = useState(open === true);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const isOpen = open ?? internalOpen;
  const isLoaded = activated || open === true;

  useEffect(() => {
    if (isOpen && !returnFocusRef.current && document.activeElement instanceof HTMLElement) {
      returnFocusRef.current = document.activeElement;
    }
  }, [isOpen]);

  const setOpen = (nextOpen: boolean) => {
    if (nextOpen) setActivated(true);
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const restoreFocus = (event: Event) => {
    onCloseAutoFocus?.(event);
    if (!event.defaultPrevented) {
      event.preventDefault();
      returnFocusRef.current?.focus({ preventScroll: true });
    }
    returnFocusRef.current = null;
  };

  if (!children) {
    const trigger = <button type="button" tabIndex={-1} aria-hidden="true" className="sr-only" />;
    return isLoaded ? (
      <Suspense fallback={trigger}>
        <ContactDialog {...dialogProps} open={isOpen} onOpenChange={setOpen} onCloseAutoFocus={restoreFocus}>
          {trigger}
        </ContactDialog>
      </Suspense>
    ) : trigger;
  }

  const trigger = children as ReactElement<{ onClick?: (event: MouseEvent) => void }>;
  const originalRef = trigger.ref as Ref<HTMLElement> | undefined;
  const deferredTrigger = cloneElement(trigger, {
    ref: (node: HTMLElement | null) => {
      returnFocusRef.current = node;
      if (typeof originalRef === "function") originalRef(node);
      else if (originalRef) originalRef.current = node;
    },
    onClick: (event) => {
      trigger.props.onClick?.(event);
      if (!event.defaultPrevented) {
        returnFocusRef.current = event.currentTarget;
        setActivated(true);
        setOpen(true);
      }
    },
  });

  return isLoaded ? (
    <Suspense fallback={deferredTrigger}>
      <ContactDialog {...dialogProps} open={isOpen} onOpenChange={setOpen} onCloseAutoFocus={restoreFocus}>
        {deferredTrigger}
      </ContactDialog>
    </Suspense>
  ) : (
    deferredTrigger
  );
};

export default DeferredContactDialog;
