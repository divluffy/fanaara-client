"use client";

// app/(logged)/home/page.tsx
import { LanguageMenuToggle } from "@/components";
import { ThemeToggle } from "@/components";
import { useLogoutMutation } from "@/store/api";
import { UserProps } from "@/types";

const HomePage = ({ user }: { user?: UserProps }) => {
  console.log("user from home page: ", user);
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      // optional: redirect or refresh
      // window.location.href = '/login';
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <main className="min-h-screen  bg-amber-300">

      <hr />
      <hr />
      <h1 className="text-2xl font-semibold">
        أهلاً
        {/* {user?.name}  */}
        👋
      </h1>
      <p className="mt-2 text-gray-600">
        هذا هو الـ feed الخاص بالأنمي والمانجا للأعضاء المسجلين.
      </p>
      هنا تحط: الأنميات الموصى بها، آخر الحلقات، نشاط الأصدقاء...
      <ThemeToggle />
      <LanguageMenuToggle />
      <hr />
      <button onClick={handleLogout} disabled={isLoading}>
        {isLoading ? "Logging out..." : "Logout"}
      </button>
      <hr />
      <div className="p-8 bg-blue-200">
        <button>ht</button>
        <br />
        <hr />
      </div>
      <div className="p-8 bg-blue-200">
        <button>ht</button>
        <br />
        <hr />
      </div>
      <div className="p-8 bg-blue-200">
        <button>ht</button>
        <br />
        <hr />
      </div>
      <img
        src="https://images.alphacoders.com/131/thumbbig-1311951.webp"
        alt="sdgsdg"
      />
      <div className="p-8 bg-blue-200">
        <button>ht</button>
        <br />
        <hr />
      </div>
      <div className="p-8 bg-blue-200">
        <button>ht</button>
        <br />
        <hr />
      </div>
      <div className="p-8 bg-blue-200">
        <button>ht</button>
        <br />
        <hr />
      </div>
      <div className="p-8 bg-blue-200">
        <button>ht</button>
        <br />
        <hr />
      </div>
      <div className="p-8 bg-blue-200">
        <button>ht</button>
        <br />
        <hr />
      </div>
      <div className="p-8 bg-blue-200">
        <button>00000</button>
        <br />
        <hr />
      </div>
    </main>
  );
};

export default HomePage;
