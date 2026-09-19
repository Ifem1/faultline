export function PageHead({ eyebrow, title, body, aside }: { eyebrow: string; title: string; body: string; aside?: string }) {
  return (
    <section className="page-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      <div className="page-head-copy"><p>{body}</p>{aside ? <small>{aside}</small> : null}</div>
    </section>
  );
}
