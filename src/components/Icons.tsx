import type { ClueId } from "../config/gameConfig";

interface IconProps { className?: string }

export function ClueIcon({ id, className }: { id: ClueId; className?: string }) {
  if (id === "carta") return <MailIcon className={className} />;
  if (id === "radio") return <RadioIcon className={className} />;
  return <PrintsIcon className={className} />;
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <rect x="6" y="12" width="36" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M8 14 L24 28 L40 14" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

export function RadioIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <rect x="8" y="16" width="32" height="22" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="18" cy="27" r="5" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M28 23 h8 M28 28 h8 M28 33 h5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 16 L28 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function PrintsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <ellipse cx="18" cy="30" rx="6" ry="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <ellipse cx="31" cy="22" rx="5" ry="7" transform="rotate(-18 31 22)" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

export function GearIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="7" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M24 7 v5 M24 36 v5 M7 24 h5 M36 24 h5 M12 12 l3.5 3.5 M32.5 32.5 L36 36 M36 12 l-3.5 3.5 M15.5 32.5 L12 36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function ExpandIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M10 20 V10 H20 M38 20 V10 H28 M10 28 V38 H20 M38 28 V38 H28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function CaseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <rect x="8" y="16" width="32" height="22" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M18 16 v-3 a6 6 0 0 1 12 0 v3" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M8 26 h32" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}
