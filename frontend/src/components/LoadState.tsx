export function LoadState({ text = "reading finalized state" }: { text?: string }) {
  return <div className="load-state"><span /><p>{text}</p></div>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="empty-state"><div className="empty-glyph">∅</div><h3>{title}</h3><p>{body}</p></div>;
}
