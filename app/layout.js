import { fontVariables } from "@/lib/theme/fonts";
import { DEFAULT_THEME, themeInitScript } from "@/lib/theme/themeConfig";
import Providers from "@/components/providers/Providers";
import "./globals.css";

export const metadata = {
  title: {
    template: "%s · Organizador Juli",
    default: "Organizador Juli",
  },
  description: "Agenda, pendientes, teléfonos y notas de Juli.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={fontVariables}
      data-theme="light"
      data-heading-font={DEFAULT_THEME.headingFont}
      data-body-font={DEFAULT_THEME.bodyFont}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
