"use client";

import { BadgeIcon, Building2, UserRound } from "lucide-react";
import { useActionState } from "react";

import { loginAction, type LoginActionState } from "@/app/actions";
import { Button } from "@/components/ui/button";

const initialState: LoginActionState = {
  message: "",
};

const demoPassword = "QaDemo#2026";

const demoIdentities = [
  {
    email: "li.qc@example.com",
    name: "李明",
    role: "质检员",
    project: "上海瑞虹商业综合体",
  },
  {
    email: "wang.builder@example.com",
    name: "王强",
    role: "施工方",
    project: "上海瑞虹商业综合体",
  },
  {
    email: "chen.admin@example.com",
    name: "陈静",
    role: "管理员",
    project: "上海瑞虹商业综合体",
  },
  {
    email: "ryan.multi@example.com",
    name: "Ryan Hao",
    role: "多项目",
    project: "身份选择",
  },
  {
    email: "zhao.builder@example.com",
    name: "赵磊",
    role: "施工方",
    project: "多项目",
  },
  {
    email: "sun.qc@example.com",
    name: "孙敏",
    role: "质检员",
    project: "杭州云栖住宅北区",
  },
];

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-[#f7f9fb] px-6 py-10 text-[#2a3439]">
      <div className="w-full max-w-[680px]">
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
            <h2 className="mb-2 font-bold text-2xl text-slate-900">
              选择身份登录
            </h2>
            <div className="h-1 w-8 bg-[#005ac2]" />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {demoIdentities.map((identity) => (
              <form action={formAction} key={identity.email}>
                <input name="email" type="hidden" value={identity.email} />
                <input name="password" type="hidden" value={demoPassword} />
                <Button
                  aria-label={`以${identity.name}身份登录`}
                  className="h-auto min-h-20 w-full justify-start rounded-none border border-slate-200 bg-slate-50 px-4 py-4 text-left text-slate-900 hover:border-[#005ac2] hover:bg-white hover:text-slate-900 focus-visible:border-[#005ac2] focus-visible:ring-[#005ac2]/20 disabled:opacity-60"
                  disabled={pending}
                  type="submit"
                  variant="outline"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center bg-[#005ac2] text-white">
                    <UserRound className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-base leading-5">
                      {identity.name}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-[12px] text-slate-500 leading-5">
                      <Building2 className="size-3.5 shrink-0" />
                      <span className="truncate">
                        {identity.project} / {identity.role}
                      </span>
                    </span>
                  </span>
                </Button>
              </form>
            ))}
          </div>

          {state.message ? (
            <p className="mt-6 border border-red-100 bg-red-50 px-3 py-2 text-red-700 text-sm">
              {state.message}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
