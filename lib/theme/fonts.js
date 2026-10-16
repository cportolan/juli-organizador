import {
  DM_Sans,
  DM_Serif_Display,
  Fraunces,
  Inter,
  Lora,
  Nunito,
  Playfair_Display,
  Roboto,
} from "next/font/google";

// Lora y Roboto son las predeterminadas y se precargan; el resto se
// descarga solo si el usuario las elige en Configuración.

const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap" });
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

// next/font exige opciones literales (sin spread ni variables).
const fraunces = Fraunces({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-fraunces" });
const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-playfair" });
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: "400",
  variable: "--font-dm-serif",
});
const inter = Inter({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-inter" });
const nunito = Nunito({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-nunito" });
const dmSans = DM_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-dm-sans" });

export const fontVariables = [lora, roboto, fraunces, playfair, dmSerif, inter, nunito, dmSans]
  .map((font) => font.variable)
  .join(" ");
