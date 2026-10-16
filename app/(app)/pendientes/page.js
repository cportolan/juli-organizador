import { Suspense } from "react";
import Page from "@/components/layout/Page/Page";
import TodoBoardLoader from "@/features/todos/components/TodoBoardLoader/TodoBoardLoader";
import TodoBoardSkeleton from "@/features/todos/components/TodoBoardSkeleton/TodoBoardSkeleton";

export const metadata = { title: "Pendientes" };

export default function TodosPage() {
  return (
    <Page title="Pendientes">
      <Suspense fallback={<TodoBoardSkeleton />}>
        <TodoBoardLoader />
      </Suspense>
    </Page>
  );
}
