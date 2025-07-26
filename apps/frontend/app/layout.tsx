import type { Metadata } from 'next';
import { Geist, Space_Grotesk } from 'next/font/google';
import './(default)/css/globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
});

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: '简历匹配器',
  description: '使用简历匹配器优化您的简历',
  applicationName: '简历匹配器',
  keywords: ['简历', '匹配器', '工作', '求职', '应聘'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geist.variable} ${spaceGrotesk.variable} antialiased bg-gradient-to-br from-gray-900 via-slate-900 to-black text-gray-100`}
      >
        <div>{children}</div>
      </body>
    </html>
  );
}
