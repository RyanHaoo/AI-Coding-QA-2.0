import { Building2, ChevronRight, ShieldCheck } from "lucide-react";

import { logoutAction, selectIdentityAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { projectTypeLabels, roleLabels } from "@/lib/identity/navigation";
import type { ProjectMembership } from "@/lib/identity/types";

type IdentitySelectionProps = {
  memberships: ProjectMembership[];
};

export function IdentitySelection({ memberships }: IdentitySelectionProps) {
  const user = memberships[0]?.profile;

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#f7f9fb] px-6 py-10 text-slate-900">
      <section className="w-full max-w-2xl border border-slate-100 bg-white p-6 shadow-[0_10px_30px_rgba(42,52,57,0.04)] md:p-8">
        <div className="mb-7 flex items-start gap-4">
          <div className="flex size-11 items-center justify-center bg-[#005ac2] text-white">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h1 className="font-semibold text-xl">选择本次登录身份</h1>
            <p className="mt-1 text-slate-500 text-sm">
              {user?.fullName} · {user?.department}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {memberships.map((membership) => (
            <form action={selectIdentityAction} key={membership.id}>
              <input name="membershipId" type="hidden" value={membership.id} />
              <button
                className="group flex w-full items-center justify-between border border-slate-100 bg-[#f8fafc] p-4 text-left transition-colors hover:border-[#005ac2]/25 hover:bg-white"
                type="submit"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center bg-white text-[#005ac2] ring-1 ring-slate-100">
                    <Building2 className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {membership.project.name} / {roleLabels[membership.role]}
                    </span>
                    <span className="mt-1 block truncate text-slate-500 text-xs">
                      {membership.project.city} ·{" "}
                      {projectTypeLabels[membership.project.projectType]} ·{" "}
                      {membership.project.clientName}
                    </span>
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#005ac2]" />
              </button>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}

export function EmptyIdentityState({ error }: { error: string | null }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#f7f9fb] px-6 py-10 text-slate-900">
      <section className="w-full max-w-lg border border-slate-100 bg-white p-8">
        <h1 className="font-semibold text-xl">演示资料未初始化</h1>
        <p className="mt-3 text-slate-500 text-sm leading-6">
          当前账号没有可用的项目身份。请确认已执行阶段 1 迁移和 seed 脚本。
        </p>
        {error ? (
          <p className="mt-4 border border-red-100 bg-red-50 px-3 py-2 text-red-700 text-sm">
            {error}
          </p>
        ) : null}
        <form action={logoutAction} className="mt-6">
          <Button type="submit" variant="outline">
            返回登录页
          </Button>
        </form>
      </section>
    </main>
  );
}
