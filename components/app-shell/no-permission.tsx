import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { roleLabels } from "@/lib/identity/navigation";
import type { ProjectMembership } from "@/lib/identity/types";

export function NoPermission({
  currentIdentity,
}: {
  currentIdentity: ProjectMembership;
}) {
  return (
    <div className="mx-auto grid min-h-[520px] w-full max-w-3xl place-items-center">
      <section className="w-full border border-slate-100 bg-white p-8 text-center">
        <div className="mx-auto mb-5 flex size-12 items-center justify-center bg-red-50 text-red-600">
          <ShieldAlert className="size-6" />
        </div>
        <h1 className="font-semibold text-xl text-slate-950">无权限访问</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-500 text-sm leading-6">
          当前身份为 {currentIdentity.project.name} /{" "}
          {roleLabels[currentIdentity.role]}，不能访问该页面。
        </p>
        <Button asChild className="mt-6 bg-[#005ac2] hover:bg-[#004fab]">
          <Link href="/?view=assistant">返回智能助手</Link>
        </Button>
      </section>
    </div>
  );
}
