interface CaseStudyProps {
  paragraphs: string[];
}

export function CaseStudy({ paragraphs }: CaseStudyProps) {
  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="text-sm text-foreground/80 md:text-base">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
