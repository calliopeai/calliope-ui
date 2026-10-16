import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BellIcon,
  BookOpenIcon,
  KeyRoundIcon,
  PaletteIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react";
import { fn } from "storybook/test";

import { UserMenu } from "./UserMenu.js";

const meta = {
  title: "Shell/UserMenu",
  component: UserMenu,
  args: {
    name: "Leo Mata",
    email: "leo@calliope.ai",
    onSignOut: fn(),
    groups: [
      [
        { label: "Profile", href: "/settings/profile", icon: UserIcon },
        { label: "Security", href: "/settings/security", icon: ShieldIcon },
        { label: "Notifications", href: "/settings/notifications", icon: BellIcon },
        { label: "API keys", href: "/tokens", icon: KeyRoundIcon },
      ],
      [
        { label: "Appearance", icon: PaletteIcon, onSelect: fn() },
        { label: "Documentation", href: "/documentation", icon: BookOpenIcon },
      ],
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-55 rounded-lg bg-sidebar p-2 text-sidebar-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UserMenu>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Collapsed: Story = { args: { collapsed: true } };
export const LongName: Story = {
  args: {
    name: "Maximiliana Alejandra de la Fuente-Ortega",
    email: "maximiliana.delafuente@weareconflict.com",
  },
};
