export function Mark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`mark ${compact ? "mark-compact" : ""}`} aria-label="Faultline">
      <span className="mark-f">F</span>
      <span className="mark-cut" aria-hidden="true">/</span>
      <span className="mark-l">L</span>
    </span>
  );
}
