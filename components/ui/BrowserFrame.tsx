type BrowserFrameProps = {
  children: React.ReactNode;
  /** Build-type badge shown in the fake URL bar, e.g. "WordPress" / "Custom Build". */
  label?: string;
};

/**
 * Pure-CSS browser chrome (dot cluster + fake URL pill) so website-portfolio
 * screenshots read as "a website" rather than a generic image. Decorative
 * only — wraps whatever image/placeholder the caller passes as children.
 */
export default function BrowserFrame({ children, label }: BrowserFrameProps) {
  return (
    <div className="absolute inset-0 flex flex-col bg-zaz-bg-deep">
      <div aria-hidden className="flex h-7 shrink-0 items-center gap-3 border-b border-zaz-border bg-zaz-surface px-3">
        <span className="flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-zaz-muted/50" />
          <span className="h-1.5 w-1.5 rounded-full bg-zaz-muted/50" />
          <span className="h-1.5 w-1.5 rounded-full bg-zaz-muted/50" />
        </span>
        <span className="flex h-3.5 flex-1 items-center rounded-[3px] bg-zaz-bg-deep/60 px-2">
          {label && (
            <span className="zaz-label truncate text-[9px] leading-none text-zaz-muted">{label}</span>
          )}
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
