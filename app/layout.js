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

// viewport-fit=cover habilita env(safe-area-inset-*) para la barra de pestañas;
// con resizes-content el teclado achica la página en vez de taparla.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#19181d" },
  ],
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
