import "server-only";

/**
 * Minimal NVIDIA NIM chat client (OpenAI-compatible). Used to generate SEO
 * article copy. Model is env-configurable; defaults to openai/gpt-oss-20b, which
 * returns clean `content` (its reasoning goes to a separate field) and is
 * accessible on the current NVIDIA account.
 */
const BASE = (
  process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1"
).replace(/\/$/, "");
const MODEL = process.env.NVIDIA_MODEL || "openai/gpt-oss-20b";

export function isNvidiaConfigured(): boolean {
  return Boolean(process.env.NVIDIA_API_KEY);
}

export async function nvidiaChat(opts: {
  system?: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  onDelta?: (text: string) => Promise<void>;
}): Promise<string> {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) throw new Error("NVIDIA_API_KEY chưa cấu hình");

  const messages: { role: string; content: string }[] = [];
  if (opts.system) messages.push({ role: "system", content: opts.system });
  messages.push({ role: "user", content: opts.user });

  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: opts.temperature ?? 0.6,
      max_tokens: opts.maxTokens ?? 1500,
      stream: Boolean(opts.onDelta),
      // gpt-oss: keeps latency down and reasoning out of `content`.
      reasoning_effort: "low",
    }),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 120_000),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`NVIDIA API ${res.status}: ${body.slice(0, 200)}`);
  }
  if (opts.onDelta) {
    if (!res.body) throw new Error("NVIDIA API không trả về luồng nội dung");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let content = "";
    let done = false;
    const consumeEvent = async (event: string) => {
      for (const line of event.split(/\r?\n/)) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") {
          done = true;
          return;
        }
        if (!data) continue;
        const parsed = JSON.parse(data) as {
          choices?: { delta?: { content?: string } }[];
        };
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          content += delta;
          await opts.onDelta?.(content);
        }
      }
    };
    try {
      while (!done) {
        const next = await reader.read();
        buffer += decoder.decode(next.value, { stream: !next.done });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() ?? "";
        for (const event of events) await consumeEvent(event);
        if (next.done) {
          if (buffer.trim()) await consumeEvent(buffer);
          break;
        }
      }
    } finally {
      await reader.cancel().catch(() => {});
    }
    if (!content || !done) throw new Error("NVIDIA API ngắt luồng trước khi viết xong");
    return content;
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error("NVIDIA API không trả về nội dung");
  return content;
}
