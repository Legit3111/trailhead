function inlineMd(s: string): string {
  return s
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

export function Markdown({ text }: { text: string }) {
  const blocks = text.split("\n\n");
  return (
    <>
      {blocks.map((block, bi) => {
        const codeMatch = block.match(/^```(\w+)?\n([\s\S]*?)```$/);
        if (codeMatch) {
          return (
            <pre key={bi}>
              <code>{codeMatch[2]}</code>
            </pre>
          );
        }
        if (/^[-*]\s/.test(block)) {
          const items = block.split("\n").map((l) => l.replace(/^[-*]\s/, ""));
          return (
            <ul key={bi}>
              {items.map((it, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: inlineMd(it) }} />
              ))}
            </ul>
          );
        }
        if (/^\d+\.\s/.test(block)) {
          const items = block.split("\n").map((l) => l.replace(/^\d+\.\s/, ""));
          return (
            <ol key={bi}>
              {items.map((it, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: inlineMd(it) }} />
              ))}
            </ol>
          );
        }
        return <p key={bi} dangerouslySetInnerHTML={{ __html: inlineMd(block) }} />;
      })}
    </>
  );
}
