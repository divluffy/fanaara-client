// app/dashboard/influencer/layout.tsx
import { redirect } from "next/navigation";
import DashboardProgramLayoutClient from "./layout.client";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProgramLayoutClient program="influencer">
      {children}
    </DashboardProgramLayoutClient>
  );
}
