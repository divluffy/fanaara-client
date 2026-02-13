// app\(onboarding)\signup\page.tsx

import SignupFeature from "@/features/signup";
import { serverMe } from "@/lib/server-auth";

export default async function Page() {
  const me = await serverMe();

  return <SignupFeature initialUser={me?.user ?? null} />;
}
