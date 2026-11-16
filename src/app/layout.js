import "./globals.css";

export const metadata = {
  title: {
    default: "me-HR Admin",
    template: "%s · me-HR Admin",
  },
  description: "me-HR content and analytics admin panel",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
