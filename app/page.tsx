// app/page.tsx
import LandingPage from "./(public)/landing/page";
import HomePage from "./(logged)/home/page";
import { serverMe } from "@/lib/server-auth";
import { LoggedLayout } from "@/layout";

export default async function RootPage() {
  console.log("check auth");
  const me = await serverMe();
  

  if (!me?.user) return <LandingPage />;

  return (
    <LoggedLayout initialUser={me.user}>
      <HomePage />
    </LoggedLayout>
  );
}
