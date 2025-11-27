interface ProductHighlightsProps {
  items: string[];
}

export function ProductHighlights({ items }: ProductHighlightsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((paragraph) => (
        <div
          key={paragraph}
          className="rounded-2xl border border-border/60 bg-card/60 p-5 text-sm text-foreground/80 shadow-sm"
        >
          {paragraph}
        </div>
      ))}
    </div>
  );
}
