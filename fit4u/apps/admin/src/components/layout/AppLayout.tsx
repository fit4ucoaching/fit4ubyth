import { Outlet } from "react-router-dom";

import { RightPanel } from "./RightPanel";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

/** Layout ERP (Volume 6) : TopBar → Sidebar → Content → RightPanel. */
export function AppLayout(): JSX.Element {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
