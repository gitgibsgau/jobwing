export const metadata = {
  title: "JobWing — Your AI Wingman for Landing the Job",
  description:
    "Cold DMs, cover letters, interview prep, pipeline tracking, and recruiter suggestions — all in one place.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#f8fffe" }}>
        {children}
      </body>
    </html>
  );
}
