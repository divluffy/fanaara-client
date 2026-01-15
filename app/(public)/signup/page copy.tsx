// app/(public)/signup/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // لو Pages Router استخدم: import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignupMutation } from "@/redux/api";

const schema = z
  .object({
    username: z
      .string()
      .min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
      .max(24, "اسم المستخدم طويل")
      .regex(/^[a-zA-Z0-9_]+$/, "فقط أحرف/أرقام/underscore بدون مسافات"),
    first_name: z
      .string()
      .min(2, "الاسم الأول قصير جدًا")
      .max(30, "الاسم الأول طويل جدًا"),
    last_name: z
      .string()
      .min(2, "اسم العائلة قصير جدًا")
      .max(30, "اسم العائلة طويل جدًا"),
    email: z.string().email("الإيميل غير صحيح"),
    password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    confirmPassword: z.string().min(8, "أكد كلمة المرور"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "كلمة المرور غير متطابقة",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

function getApiErrorMessage(err: unknown) {
  // RTK Query error غالباً يحتوي: { status, data }
  if (typeof err === "object" && err !== null) {
    const anyErr = err as any;

    const data = anyErr?.data;
    if (typeof data === "string") return data;

    // NestJS عادة يرجّع { message: string | string[] }
    const msg = data?.message ?? anyErr?.error;
    if (Array.isArray(msg)) return msg.join(" • ");
    if (typeof msg === "string") return msg;

    // أحياناً data = { error: "...", message: "..."}
    if (typeof data?.error === "string") return data.error;
  }
  return "حدث خطأ غير متوقع";
}

export default function SignupPage() {
  const router = useRouter();
  const [signup, { isLoading, error }] = useSignupMutation();
  console.log("error: ", error);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: FormValues) => {
    const log = {
      username: values.username.trim(),
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
    };
    console.log("log: ", log);
    const res = await signup({
      username: values.username.trim(),
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
    }).unwrap();

    console.log("res: ", res);
    // بعد نجاح التسجيل: روح للـ login (أو "/" حسب تدفقك)
    router.push("/login");
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">إنشاء حساب</h1>
        <p className="mt-1 text-sm text-neutral-600">
          أدخل بياناتك لإنشاء حساب جديد.
        </p>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {getApiErrorMessage(error)}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium">اسم المستخدم</label>
            <input
              {...register("username")}
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
              placeholder="devluffy"
              autoComplete="username"
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">الاسم الأول</label>
              <input
                {...register("first_name")}
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
                placeholder="محمد"
                autoComplete="given-name"
              />
              {errors.first_name && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">اسم العائلة</label>
              <input
                {...register("last_name")}
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
                placeholder="أحمد"
                autoComplete="family-name"
              />
              {errors.last_name && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">الإيميل</label>
            <input
              {...register("email")}
              type="email"
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
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
              autoComplete="new-password"
            />

            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* create new input for datepicker */}
          <div>
            <label className="text-sm font-medium">تأكيد كلمة المرور</label>
            <input
              {...register("confirmPassword")}
              type="password"
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
              placeholder="********"
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-neutral-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {isLoading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}
          </button>

          <p className="text-center text-sm text-neutral-700">
            عندك حساب؟{" "}
            <Link
              className="font-medium text-neutral-900 underline"
              href="/login"
            >
              تسجيل الدخول
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
