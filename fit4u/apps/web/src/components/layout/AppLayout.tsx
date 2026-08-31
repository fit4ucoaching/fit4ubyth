import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";

/** Layout applicatif — sidebar permanente + contenu responsive (Volume 4). */
export function AppLayout(): JSX.Element {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
