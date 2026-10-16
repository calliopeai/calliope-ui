/**
 * A router for the example shells: links change a path held in state, so
 * the sidebar, the breadcrumb switcher and the tabs work inside the catalog.
 * An app passes its real router's link to UIProvider instead.
 */
import * as React from "react";

import { type LinkProps, UIProvider } from "../provider/UIProvider.js";

const PathContext = React.createContext<{ path: string; go: (path: string) => void }>({
  path: "/",
  go: () => {},
});

export function usePath() {
  return React.useContext(PathContext);
}

function ExampleLink({ ref, href, onClick, children, ...props }: LinkProps) {
  const { go } = usePath();
  return (
    <a
      ref={ref}
      href={href}
      {...props}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
        if (!href.startsWith("#") && !href.startsWith("?")) go(href);
      }}
    >
      {children}
    </a>
  );
}

export function ExampleRouter({
  initialPath,
  children,
}: {
  initialPath: string;
  children: React.ReactNode;
}) {
  const [path, setPath] = React.useState(initialPath);
  const value = React.useMemo(() => ({ path, go: setPath }), [path]);
  return (
    <PathContext.Provider value={value}>
      <UIProvider link={ExampleLink}>{children}</UIProvider>
    </PathContext.Provider>
  );
}
