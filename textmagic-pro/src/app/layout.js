import './globals.css';

export const metadata = {
  title: 'TextMagic Pro - AI-Powered Text Tools',
  description: 'Transform your text with AI. Summarize, translate, rewrite, and more with our powerful text tools.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
