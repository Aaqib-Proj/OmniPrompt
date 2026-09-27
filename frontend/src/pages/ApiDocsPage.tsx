import React, { useEffect, useState } from 'react';
import { Copy, Check, Info } from 'lucide-react';
import { api } from '../services/api';
import { PageHeader } from '../components/common/ui';

const useCopy = () => {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied; the text is still selectable.
    }
  };
  return { copied, copy };
};

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const { copied, copy } = useCopy();
  return (
    <button onClick={() => copy(text)} className="btn btn-sm btn-ghost btn-icon w-7" aria-label="Copy" title="Copy">
      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

const CodeBlock: React.FC<{ tabs: { label: string; code: string }[] }> = ({ tabs }) => {
  const [active, setActive] = useState(0);
  return (
    <div className="box overflow-hidden">
      <div className="box-header py-1.5">
        {tabs.length > 1 ? (
          <div className="segmented" role="group" aria-label="Language">
            {tabs.map((t, i) => (
              <button key={t.label} onClick={() => setActive(i)} aria-pressed={active === i}>
                {t.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs font-medium text-fg-muted">{tabs[0].label}</span>
        )}
        <CopyButton text={tabs[active].code} />
      </div>
      <pre className="p-4 bg-inset font-mono text-[12.5px] leading-relaxed overflow-x-auto">{tabs[active].code}</pre>
    </div>
  );
};

const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section id={id} className="pt-8 mt-8 border-t border-line-muted first:border-t-0 first:mt-0 first:pt-0">
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    {children}
  </section>
);

export const ApiDocsPage: React.FC = () => {
  const [exampleId, setExampleId] = useState('PROMPT_ID');
  const [exampleResponse, setExampleResponse] = useState<string | null>(null);

  const origin = import.meta.env.VITE_API_URL || window.location.origin;
  const endpoint = `${origin}/api/v1/public/prompts/${exampleId}`;

  // Show a real response from this instance instead of a hand-written sample.
  useEffect(() => {
    api.getPrompts({ sort: 'stars', limit: 1 })
      .then(async ({ prompts }) => {
        const id = prompts[0]?.id;
        if (!id) return;
        setExampleId(id);
        const res = await fetch(`${origin}/api/v1/public/prompts/${id}`);
        if (!res.ok) return;
        const body = await res.json();
        if (typeof body.promptText === 'string' && body.promptText.length > 90) {
          body.promptText = `${body.promptText.slice(0, 90)}…`;
        }
        setExampleResponse(JSON.stringify(body, null, 2));
      })
      .catch(() => {});
  }, []);

  const curlExample = `curl ${endpoint}`;
  const jsExample = `const res = await fetch("${endpoint}");
const prompt = await res.json();

console.log(prompt.model, prompt.parameters);
console.log(prompt.promptText);`;
  const pythonExample = `import requests

prompt = requests.get("${endpoint}").json()
print(prompt["model"], prompt["parameters"])`;

  return (
    <div className="page py-8">
      <div className="max-w-3xl">
        <PageHeader title="Developer API" description="Read prompts, their parameters and version info over a small REST API." />

        <div className="mt-8">
          <Section id="base-url" title="Base URL">
            <div className="flex items-center justify-between gap-3 h-10 pl-4 pr-1.5 rounded-md border border-line bg-inset font-mono text-[13px]">
              <span className="truncate">{origin}/api/v1</span>
              <CopyButton text={`${origin}/api/v1`} />
            </div>
          </Section>

          <Section id="access" title="Access &amp; limits">
            <div className="flex gap-2.5 px-4 py-3 rounded-md border border-link/30 bg-link/5 text-[13px]">
              <Info className="w-4 h-4 text-link shrink-0 mt-0.5" />
              <p>
                These endpoints are public and read-only — no API key or sign-in required. Requests are rate limited to
                300 per 15 minutes per IP.
              </p>
            </div>
          </Section>

          <Section id="get-prompt" title="Get a prompt">
            <div className="flex items-center gap-2 font-mono text-[13px]">
              <span className="inline-flex items-center h-6 px-2 rounded-md bg-success/15 text-success text-xs font-semibold">GET</span>
              <span>/public/prompts/{'{id}'}</span>
            </div>
            <p className="mt-3 text-fg-muted">
              Returns the latest version of a public prompt: its text, target model, parameters and license.
            </p>

            <div className="box mt-4 overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-subtle text-left text-xs text-fg-muted">
                  <tr>
                    <th className="px-4 py-2 font-medium">Parameter</th>
                    <th className="px-4 py-2 font-medium">Type</th>
                    <th className="px-4 py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-line-muted">
                    <td className="px-4 py-2.5 font-mono text-xs">id</td>
                    <td className="px-4 py-2.5 text-fg-muted">string</td>
                    <td className="px-4 py-2.5">The prompt’s ID. Returns 404 for private or unknown prompts.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-[14px] font-semibold mt-6 mb-2">Request</h3>
            <CodeBlock
              tabs={[
                { label: 'cURL', code: curlExample },
                { label: 'JavaScript', code: jsExample },
                { label: 'Python', code: pythonExample },
              ]}
            />

            <h3 className="text-[14px] font-semibold mt-6 mb-2">Response</h3>
            {exampleResponse ? (
              <CodeBlock tabs={[{ label: '200 OK · application/json', code: exampleResponse }]} />
            ) : (
              <div className="skeleton h-48 rounded-lg" />
            )}
          </Section>
        </div>
      </div>
    </div>
  );
};
