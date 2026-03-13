export const metadata = {
  title: "New Grad Job Agent",
  description: "LinkedIn job intelligence for new graduates",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#080e1a" }}>{children}</body>
    </html>
  );
}
