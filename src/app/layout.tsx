import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata:Metadata={
  title:'RELIQUNIX.SPACE — Abandoned, but not forgotten.',
  description:'Explore twelve NASA relics on the Moon and Mars in 3D. Inspect hardware, follow mission sources, and collect discoveries in your explorer notebook.',
  applicationName:'RELIQUNIX.SPACE',
  keywords:['NASA Space Apps','Moon','Mars','space archaeology','Apollo','Ingenuity','Opportunity','3D archive'],
  openGraph:{title:'We left more than footprints. — RELIQUNIX.SPACE',description:'Twelve relics. Two worlds. The stories that never made the return trip.',type:'website',locale:'en_US'},
  robots:{index:true,follow:true},
};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#08090a'};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml"/>
        <link rel="stylesheet" href="/assets/fonts/fonts.css"/>
      </head>
      {/* Late extension writes can add dynamic __processed_* body attributes. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
