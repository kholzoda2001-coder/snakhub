import type { Metadata } from "next";
import { Barlow_Condensed, Nunito } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";

// Self-hosted at build time. Previously these came from fonts.googleapis.com,
// which meant two extra DNS lookups and TLS handshakes blocking first paint —
// the single worst thing on a slow connection.
const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-display",
  display: "swap",
});

const body = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Snack Hub | Snacks · Energy · Protein",
  description: "Your premium snacks & energy destination in the UAE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The inline script below rewrites lang/dir before React hydrates, so the
    // server's "en"/ltr will not match the client. That difference is the whole
    // point, and it applies to this element's attributes only.
    <html lang="en" dir="ltr" data-theme="light" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head>
        <meta name="theme-color" content="#f5f4f1" />
        {/* Runs before first paint so an Arabic visitor never sees a flash of
            left-to-right English. Mirrors detectLocale() in LanguageContext. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
var k='snackhub_lang',s=null;
try{s=localStorage.getItem(k)}catch(e){}
if(s!=='en'&&s!=='ar'){
  var m=document.cookie.match(/(?:^|; )snackhub_lang=(en|ar)/);
  s=m?m[1]:null;
}
if(s!=='en'&&s!=='ar'){
  var l=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language];
  s='en';
  for(var i=0;i<l.length;i++){if(l[i]&&l[i].toLowerCase().indexOf('ar')===0){s='ar';break}}
}
document.documentElement.lang=s;
document.documentElement.dir=(s==='ar')?'rtl':'ltr';
}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
