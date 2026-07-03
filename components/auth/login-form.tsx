"use client";

import { ArrowRight, BadgeIcon, LockKeyhole } from "lucide-react";
import { useActionState } from "react";

import { loginAction, type LoginActionState } from "@/app/actions";
import { Button } from "@/components/ui/button";

const initialState: LoginActionState = {
  message: "",
};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-[#f7f9fb] px-6 py-10 text-[#2a3439]">
      <div className="w-full max-w-[420px]">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex size-12 items-center justify-center bg-[#005ac2] text-white">
            <BadgeIcon className="size-6" />
          </div>
          <h1 className="mb-1 font-bold text-lg text-slate-900 tracking-normal">
            建筑施工质检情报员
          </h1>
          <p className="font-medium text-[11px] text-slate-400 uppercase tracking-[0.24em]">
            Construction Intelligence
          </p>
        </div>

        <section className="border border-transparent bg-white p-8 shadow-[0_10px_30px_rgba(42,52,57,0.04)] md:p-10">
          <div className="mb-8">
            <h2 className="mb-2 font-bold text-2xl text-slate-900">登录</h2>
            <div className="h-1 w-8 bg-[#005ac2]" />
          </div>

          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <label
                className="block font-bold text-[11px] text-slate-500 uppercase tracking-[0.14em]"
                htmlFor="email"
              >
                账号
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors group-focus-within:text-[#005ac2]">
                  <BadgeIcon className="size-5" />
                </div>
                <input
                  autoComplete="email"
                  className="block w-full border-transparent border-b bg-slate-100 py-3 pr-4 pl-10 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#005ac2] focus:bg-white"
                  id="email"
                  name="email"
                  placeholder="输入演示账号邮箱"
                  type="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="block font-bold text-[11px] text-slate-500 uppercase tracking-[0.14em]"
                htmlFor="password"
              >
                密码
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors group-focus-within:text-[#005ac2]">
                  <LockKeyhole className="size-5" />
                </div>
                <input
                  autoComplete="current-password"
                  className="block w-full border-transparent border-b bg-slate-100 py-3 pr-4 pl-10 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#005ac2] focus:bg-white"
                  id="password"
                  name="password"
                  placeholder="输入系统访问密码"
                  type="password"
                />
              </div>
            </div>

            {state.message ? (
              <p className="border border-red-100 bg-red-50 px-3 py-2 text-red-700 text-sm">
                {state.message}
              </p>
            ) : null}

            <div className="pt-4">
              <Button
                className="h-12 w-full rounded-none bg-[#005ac2] font-bold text-sm uppercase tracking-[0.18em] hover:bg-[#004fab]"
                disabled={pending}
                type="submit"
              >
                {pending ? "登录中" : "登录"}
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
