export const metadata = {
  title: 'Zindan & Zar',
  description: 'Türkçe AI RPG Oyun Platformu',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0d0d0f' }}>{children}</body>
    </html>
  );
}
