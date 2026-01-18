// app/page.tsx
import LandingPage from "./(public)/landing/page";
import HomePage from "./(logged)/home/page";
import { serverMe } from "@/lib/server-auth";
import { LoggedLayout } from "@/layout";
import { redirect } from "next/navigation";

export default async function RootPage() {
  console.log("check auth");
  const me = await serverMe();
  console.log("me main page: ", me);

  // If user exists but needs signup completion
  if (me?.user?.status === "PENDING") {
    redirect("/signup");
  }

  if (!me?.user) return <LandingPage />;

  return (
    <LoggedLayout initialUser={me.user}>
      <HomePage />
    </LoggedLayout>
  );
}
