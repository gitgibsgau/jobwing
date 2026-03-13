import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { jobs, userProfile } = await req.json();

    const topJobs = (jobs || []).slice(0, 5);

    if (topJobs.length === 0) {
      return Response.json({ content: "" });
    }

    const jobList = topJobs
      .map(
        (j, i) =>
          `${i + 1}. ${j.role} at ${j.company} (${j.location})${j.level ? ` · ${j.level}` : ""}`
      )
      .join("\n");

    const profileSection =
      userProfile?.name || userProfile?.field || userProfile?.skills
        ? `About the candidate: Name: ${userProfile.name || "not provided"}. Field/target role: ${userProfile.field || "not provided"}. Key skills: ${userProfile.skills || "not provided"}. Experience level: ${userProfile.experience || "not provided"}.`
        : "No specific candidate profile provided — write the post as a general job-seeker.";

    const prompt = `${profileSection}

The candidate is exploring these job opportunities:
${jobList}

Write a 150-250 word LinkedIn post for this person that:
- Feels authentic and human, not corporate
- Briefly mentions what they are looking for or building toward
- References the types of roles/companies they are exploring (not a full list)
- Ends with a soft call to action (open to conversations, referrals, or connections)
- Does NOT use these phrases: "excited to announce", "passionate about", "thrilled", "I am humbled", "on this journey", "leverage", "synergies", "game-changer"
- Does NOT start with "I am" or a gerund like "Sharing…"
- Has no hashtag spam (max 3 relevant hashtags at the end, optional)
- Uses short paragraphs, no bullet points

Return only the post text. No intro, no explanation.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0]?.text || "";

    return Response.json({ content });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
