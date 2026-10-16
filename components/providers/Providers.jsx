"use client";

import { ToastProvider } from "@/components/ui/Toast/Toast";
import { useThemeSync } from "@/lib/theme/useTheme";

export default function Providers({ children }) {
  useThemeSync();
  return <ToastProvider>{children}</ToastProvider>;
}
