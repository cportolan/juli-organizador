import { Suspense } from "react";
import Page from "@/components/layout/Page/Page";
import PeopleLoader from "@/features/people/components/PeopleLoader/PeopleLoader";
import PeopleSkeleton from "@/features/people/components/PeopleSkeleton/PeopleSkeleton";

export const metadata = { title: "Usuarios" };

export default function PeoplePage() {
  return (
    <Page title="Usuarios" description="Fichas con notas y adjuntos de cada persona.">
      <Suspense fallback={<PeopleSkeleton />}>
        <PeopleLoader />
      </Suspense>
    </Page>
  );
}
