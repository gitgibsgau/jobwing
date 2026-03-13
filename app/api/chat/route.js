import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a specialized LinkedIn job intelligence agent for new graduates seeking jobs in the US.

You have two modes:

**MODE 1: SCRAPE & FIND** — When asked to find/search for new grad job postings:
- Use your web search tool to search for recent LinkedIn new grad job postings across the US
- Search queries like: "site:linkedin.com new grad 2025 hiring" or "new graduate jobs 2025 US hiring now"
- Extract key details: Company, Role, Location, Posted Date, Application Link if available
- Return results as a JSON array inside <jobs>...</jobs> tags with this structure:
[{"company":"...", "role":"...", "location":"...", "posted":"...", "link":"...", "summary":"..."}]
- After the JSON, write a brief human-readable summary

**MODE 2: SUGGEST POST** — When asked to write/suggest a LinkedIn post:
- Based on the jobs found, craft a compelling, authentic LinkedIn post the user can share
- The post should: express excitement about opportunities, show value (skills/background), invite recruiters to reach out
- Ask the user for their name, field/major, skills if not provided — or make it template-friendly with [YOUR NAME] placeholders
- Return the post inside <post>...</post> tags
- The post should feel human, not robotic. Use light formatting (emojis ok), 150-250 words

Always be helpful, concise, and action-oriented.`;

export async function POST(req) {
  try {
    const { messages, userProfile } = await req.json();

    const systemWithProfile =
      SYSTEM_PROMPT +
      (userProfile?.name || userProfile?.field || userProfile?.skills
        ? `\n\nUser profile: Name=${userProfile.name || "not provided"}, Field/Major=${userProfile.field || "not provided"}, Skills=${userProfile.skills || "not provided"}`
        : "");

    // First call
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: systemWithProfile,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages,
    });

    // Agentic loop — handle tool use
    if (response.stop_reason === "tool_use") {
      const toolResults = response.content
        .filter((b) => b.type === "tool_use")
        .map((b) => ({ type: "tool_result", tool_use_id: b.id, content: "Search completed" }));

      const continueMessages = [
        ...messages,
        { role: "assistant", content: response.content },
        { role: "user", content: toolResults },
      ];

      const response2 = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: systemWithProfile,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: continueMessages,
      });

      return Response.json({ content: response2.content, stop_reason: response2.stop_reason });
    }

    return Response.json({ content: response.content, stop_reason: response.stop_reason });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
