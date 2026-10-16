import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { Breadcrumbs } from "../page/Breadcrumbs.js";
import { ErrorState } from "../states/ErrorState.js";
import { type LinkProps, UIProvider } from "./UIProvider.js";

/**
 * The app's environment: its link component and its copy. Here a router's
 * link is stood in for by one that marks its anchors, and the copy is Spanish.
 */
const meta = { title: "Environment/UIProvider", component: UIProvider } satisfies Meta<
  typeof UIProvider
>;
export default meta;

function RouterLink({ ref, href, children, ...props }: LinkProps) {
  return (
    <a
      ref={ref}
      href={href}
      data-router-link=""
      {...props}
      onClick={(event) => event.preventDefault()}
    >
      {children}
    </a>
  );
}

export const InjectedLinkAndCopy: StoryObj = {
  render: () => (
    <UIProvider
      link={RouterLink}
      messages={{
        breadcrumb: { label: "Ruta de navegación" },
        states: { errorTitle: "Algo salió mal", retry: "Reintentar" },
      }}
    >
      <div className="flex max-w-xl flex-col gap-4">
        <Breadcrumbs crumbs={[{ label: "Agentes", href: "/agents" }, { label: "support-bot" }]} />
        <ErrorState error="Tiempo de espera agotado" onRetry={() => {}} />
      </div>
    </UIProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Agentes" })).toHaveAttribute("data-router-link");
    await expect(
      canvas.getByRole("navigation", { name: "Ruta de navegación" })
    ).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  },
};
