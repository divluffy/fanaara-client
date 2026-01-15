// app/(public)/login/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/redux/api";

const schema = z.object({
  emailOrUsername: z
    .string()
    .min(3, "اكتب الإيميل أو اسم المستخدم")
    .max(100, "القيمة طويلة جدًا"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
});

type FormValues = z.infer<typeof schema>;

function getApiErrorMessage(err: unknown) {
  if (typeof err === "object" && err !== null) {
    const anyErr = err as any;
    const data = anyErr?.data;

    if (typeof data === "string") return data;

    const msg = data?.message ?? anyErr?.error;
    if (Array.isArray(msg)) return msg.join(" • ");
    if (typeof msg === "string") return msg;

    if (typeof data?.error === "string") return data.error;
  }
  return "حدث خطأ غير متوقع";
}

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const redirectTo = search.get("redirect") || "/";

  const [login, { isLoading, error }] = useLoginMutation();
  console.log("error login: ", error);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { emailOrUsername: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values: FormValues) => {
    const res = await login({
      emailOrUsername: values.emailOrUsername.trim(),
      password: values.password,
    }).unwrap();
    console.log("res: ", res);

    router.push(redirectTo);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">تسجيل الدخول</h1>
        <p className="mt-1 text-sm text-neutral-600">
          أدخل بياناتك للوصول إلى حسابك.
        </p>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {getApiErrorMessage(error)}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium">
              الإيميل أو اسم المستخدم
            </label>
            <input
              {...register("emailOrUsername")}
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
              placeholder="you@example.com أو devluffy"
              autoComplete="username"
            />
            {errors.emailOrUsername && (
              <p className="mt-1 text-xs text-red-600">
                {errors.emailOrUsername.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">كلمة المرور</label>
            <input
              {...register("password")}
              type="password"
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
              placeholder="********"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-neutral-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {isLoading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <Link className="text-neutral-900 underline" href="/signup">
              إنشاء حساب
            </Link>

            {/* اتركه placeholder لصفحة forgot-password لاحقاً */}
            <button
              type="button"
              className="text-neutral-700 underline"
              onClick={() => router.push("/forgot-password")}
            >
              نسيت كلمة المرور؟
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
