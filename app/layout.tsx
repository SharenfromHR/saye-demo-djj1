
export const metadata = { title: "SAYE Demo", description: "Portal" };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
