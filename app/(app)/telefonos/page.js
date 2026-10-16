import { Suspense } from "react";
import Page from "@/components/layout/Page/Page";
import PhoneBookLoader from "@/features/phones/components/PhoneBookLoader/PhoneBookLoader";
import PhoneBookSkeleton from "@/features/phones/components/PhoneBookSkeleton/PhoneBookSkeleton";

export const metadata = { title: "Teléfonos" };

export default function PhonesPage() {
  return (
    <Page title="Teléfonos" description="Oficinas, agentes e internos.">
      <Suspense fallback={<PhoneBookSkeleton />}>
        <PhoneBookLoader />
      </Suspense>
    </Page>
  );
}
