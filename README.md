# 🎓 New Grad Job Agent

An agentic AI built for graduating students to **discover new grad job opportunities across the US** and **craft personalized LinkedIn posts** to attract recruiters — all powered by Claude AI with live web search.

## ✨ Features

- 🔍 **Live Job Search** — Searches the web in real-time for new grad job postings (SWE, finance, and more)
- 🗂 **Job Board** — Displays company, role, location, and direct links in a clean card layout
- ✍️ **LinkedIn Post Generator** — Writes a personalized, human-sounding post based on current openings
- 🤖 **Agentic Loop** — Uses Claude + web search tool in a multi-step agent loop
- 👤 **Profile Customization** — Tailors posts to your name, major, and skills

---

## 📁 Project Structure

```
app/
  api/chat/route.js   ← Secure backend (API key lives here, never exposed)
  Agent.js            ← Frontend UI
  page.js             ← Next.js page entry
  layout.js           ← HTML shell
package.json
next.config.js
```

