import ReactMarkdown from "react-markdown";

export function Markdown({ content }: { content: string }) {
    return (
        <ReactMarkdown
            components={{
                p: ({ children }) => (
                    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                ),
                strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                ),
                em: ({ children }) => (
                    <em className="italic">{children}</em>
                ),
                ul: ({ children }) => (
                    <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                    <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>
                ),
                li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                ),
                h1: ({ children }) => (
                    <h1 className="text-base font-semibold mb-2">{children}</h1>
                ),
                h2: ({ children }) => (
                    <h2 className="text-sm font-semibold mb-2">{children}</h2>
                ),
                h3: ({ children }) => (
                    <h3 className="text-sm font-semibold mb-1">{children}</h3>
                ),
                code: ({ children }) => (
                    <code className="bg-black/10 rounded px-1 py-0.5 text-xs font-mono">
                        {children}
                    </code>
                ),
                blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-zinc-300 pl-3 italic text-zinc-500 my-2">
                        {children}
                    </blockquote>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
}