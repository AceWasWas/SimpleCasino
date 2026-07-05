"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-navy-950">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
