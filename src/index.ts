/**
 * @calliopelabs/ui: the Calliope AI operator UI, shared by Astrolift AI and
 * Zentinelle AI. Styles: `@import "@calliopelabs/ui/preset.css"` after Tailwind.
 */

// Environment
export {
  UIProvider,
  useUI,
  type LinkComponent,
  type LinkProps,
  type UIProviderProps,
} from "./provider/UIProvider.js";
export {
  defaultMessages,
  mergeMessages,
  type MessageOverrides,
  type Messages,
} from "./provider/messages.js";
export { cn } from "./lib/cn.js";

// Tokens
export {
  ACCENTS,
  ACCENT_KEYS,
  DENSITIES,
  DENSITY_KEYS,
  GROUNDS,
  GROUND_KEYS,
  MODE_TOKENS,
  SURFACES,
  type AccentSpec,
  type Density,
  type FamilyAccent,
  type Ground,
  type Mode,
  type StatusName,
} from "./theme/tokens.js";
export {
  MIN_NON_TEXT_CONTRAST,
  MIN_TEXT_CONTRAST,
  contrastRatio,
  luminance,
} from "./theme/contrast.js";

// Product and appearance
export {
  CORNERS,
  defineProduct,
  type BrandAccent,
  type Corners,
  type Product,
  type ProductAccent,
  type ProductConfig,
  type ProductTheme,
} from "./appearance/product.js";
export { astroliftBrand, zentinelleBrand } from "./appearance/brands.js";
export {
  accentContrast,
  appearanceFromServer,
  applyAppearance,
  clearAppearance,
  inkFor,
  isCustomAccent,
  modeFor,
  normalize,
  normalizePartial,
  parseCustomAccent,
  readAppearance,
  resolveAppearance,
  writeAppearance,
  type Appearance,
  type CustomAccent,
  type OrgAppearancePolicy,
  type ResolvedAppearance,
} from "./appearance/appearance.js";
export { appearanceScript, productStyles } from "./appearance/boot.js";
export { AppearanceScript, type AppearanceScriptProps } from "./appearance/AppearanceScript.js";
export {
  AppearanceProvider,
  useAppearance,
  useDensity,
  useProduct,
  type AppearanceContextValue,
  type AppearanceProviderProps,
} from "./appearance/AppearanceProvider.js";
export { AppearancePicker } from "./appearance/AppearancePicker.js";

// Navigation
export {
  activeFor,
  areaSwitcher,
  localizeNav,
  visibleNav,
  type CrumbSwitchOption,
  type NavActive,
  type NavArea,
  type NavFunction,
  type NavGroup,
  type NavIcon,
  type NavModel,
} from "./nav/model.js";
export { Nav, type NavProps } from "./nav/Nav.js";

// Shell
export { AppShell, type AppShellProps } from "./shell/AppShell.js";
export { Sidebar, type SidebarProps } from "./shell/Sidebar.js";
export { BrandMark, type BrandMarkProps } from "./shell/BrandMark.js";
export { UserMenu, type UserMenuItem, type UserMenuProps } from "./shell/UserMenu.js";
export { RailPanel, type RailPanelProps } from "./shell/RailPanel.js";
export {
  RailTree,
  type RailTreeGroup,
  type RailTreeItem,
  type RailTreeProps,
} from "./shell/RailTree.js";
export { useRailState, useRailWidth } from "./shell/rail-state.js";

// Page
export { PageFrame, type PageFrameProps } from "./page/PageFrame.js";
export { PageHeader, type PageHeaderProps } from "./page/PageHeader.js";
export { Breadcrumbs, type BreadcrumbsProps, type Crumb } from "./page/Breadcrumbs.js";
export { TabNav, type TabNavItem, type TabNavProps } from "./page/TabNav.js";
export { Section, type SectionProps } from "./page/Section.js";

// Data
export { DataTable, type DataTableProps } from "./data/DataTable.js";
export { List, ListItem, type ListItemProps, type ListProps } from "./data/List.js";
export { useRowSelection, type RowSelection } from "./data/use-row-selection.js";
export {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES,
  type Column,
  type EmptyStateSpec,
  type PageState,
  type SortDirection,
  type SortState,
  type TableController,
} from "./data/types.js";

// Status
export { StatusBadge, type StatusBadgeProps } from "./status/StatusBadge.js";
export { StatusDot, type StatusDotProps } from "./status/StatusDot.js";
export {
  DOT_TONE,
  IN_FLIGHT,
  PILL_TONE,
  STATUS_TONES,
  TONE_TOKEN,
  type StatusTone,
} from "./status/tones.js";

// States
export { EmptyState, type EmptyStateProps } from "./states/EmptyState.js";
export { ErrorState, type ErrorStateProps } from "./states/ErrorState.js";
export { LoadingState, type LoadingStateProps } from "./states/LoadingState.js";

// Overlays
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./overlays/Dialog.js";
export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./overlays/Drawer.js";
export {
  ConfirmDialog,
  type ConfirmDialogProps,
  type ConfirmReason,
} from "./overlays/ConfirmDialog.js";

// Primitives
export { Button, buttonVariants, type ButtonProps } from "./primitives/Button.js";
export { Input } from "./primitives/Input.js";
export { Checkbox } from "./primitives/Checkbox.js";
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./primitives/DropdownMenu.js";
export { Popover, PopoverContent, PopoverTrigger } from "./primitives/Popover.js";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./primitives/Tabs.js";
export { Skeleton } from "./primitives/Skeleton.js";
