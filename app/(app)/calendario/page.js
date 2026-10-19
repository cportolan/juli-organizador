import { Suspense } from "react";
import Page from "@/components/layout/Page/Page";
import CalendarLoader from "@/features/calendar/components/CalendarLoader/CalendarLoader";
import CalendarAsideLoader from "@/features/calendar/components/CalendarAsideLoader/CalendarAsideLoader";
import CalendarSkeleton, { CalendarAsideSkeleton } from "@/features/calendar/components/CalendarSkeleton/CalendarSkeleton";

export const metadata = { title: "Calendario" };

export default function CalendarPage({ searchParams }) {
  return (
    <Page
      title="Calendario"
      hideHeader
      wide
      aside={
        <Suspense fallback={<CalendarAsideSkeleton />}>
          <CalendarAsideLoader />
        </Suspense>
      }
    >
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarLoader searchParams={searchParams} />
      </Suspense>
    </Page>
  );
}
