import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { AppearancePicker } from "./AppearancePicker.js";
import { useAppearance } from "./AppearanceProvider.js";
import type { OrgAppearancePolicy } from "./appearance.js";

/**
 * The person's appearance, for the product in context. Choices apply to the
 * whole catalog until the toolbar moves again. Status colours are not on
 * offer: they never change.
 */
const meta = {
  title: "Appearance/AppearancePicker",
  component: AppearancePicker,
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppearancePicker>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Hands an org policy to the provider, as an app's signed-in layout does once it knows the org. */
function WithPolicy({
  policy,
  children,
}: {
  policy: OrgAppearancePolicy;
  children: React.ReactNode;
}) {
  const { setPolicy } = useAppearance();
  React.useEffect(() => {
    setPolicy(policy);
    return () => setPolicy(null);
  }, [policy, setPolicy]);
  return <>{children}</>;
}

const LOCKED: OrgAppearancePolicy = {
  locked: true,
  orgDefault: { ground: "charcoal", accent: "ice" },
};

/** Astrolift: named themes, five family accents, six grounds. */
export const Astrolift: Story = { globals: { product: "astrolift" } };

/** Zentinelle: teal first, the family accents beside it, no emerald ground and no named themes. */
export const Zentinelle: Story = { globals: { product: "zentinelle", ground: "black" } };

/** An org house theme, locked: the picker is read-only and says why. */
export const LockedByOrg: Story = {
  render: () => (
    <WithPolicy policy={LOCKED}>
      <AppearancePicker />
    </WithPolicy>
  ),
};

/** Any colour that stands 3:1 off the ground, here on black. */
export const CustomAccent: Story = { globals: { ground: "black", accent: "#d94f8a" } };
