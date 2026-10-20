/* eslint-disable react-refresh/only-export-components */
import type { ReactElement, ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { render as rtlRender, type RenderOptions } from "@testing-library/react";
import AppProviders from "@/components/AppProviders";
import PageLayout from "@/components/PageLayout";

export * from "@testing-library/react";

/** Components that contain links need a router around them. */
const RouterWrapper = ({ children }: { children: ReactNode }) => <BrowserRouter>{children}</BrowserRouter>;

/** The real site shell: router, app-level providers, then navbar / main / floating button / footer. */
const PageWrapper = ({ children }: { children: ReactNode }) => (
  <BrowserRouter>
    <AppProviders>
      <PageLayout>{children}</PageLayout>
    </AppProviders>
  </BrowserRouter>
);

type Options = Omit<RenderOptions, "wrapper">;

/** Renders a component inside a router. */
export function render(ui: ReactElement, options?: Options) {
  return rtlRender(ui, { wrapper: RouterWrapper, ...options });
}

/** Renders a page inside the full shell, the way the app shows it. */
export function renderPage(ui: ReactElement, options?: Options) {
  return rtlRender(ui, { wrapper: PageWrapper, ...options });
}
