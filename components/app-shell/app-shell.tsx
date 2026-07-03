"use client";

import Link from "next/link";
import {
  BotMessageSquare,
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  SearchCheck,
  X,
} from "lucide-react";
import { useState } from "react";

import { logoutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { roleLabels } from "@/lib/identity/navigation";
import type {
  AppView,
  NavigationItem,
  ProjectMembership,
} from "@/lib/identity/types";

type AppShellProps = {
  activeView: AppView;
  children: React.ReactNode;
  currentIdentity: ProjectMembership;
  navigation: NavigationItem[];
};

const iconByView = {
  "admin-tickets": SearchCheck,
  assistant: BotMessageSquare,
  dashboard: LayoutDashboard,
  tickets: ClipboardList,
} as const;

export function AppShell({
  activeView,
  children,
  currentIdentity,
  navigation,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeLabel =
    navigation.find((item) => item.view === activeView)?.label ?? "无权限";

  return (
    <div className="min-h-svh bg-[#f7f9fb] text-slate-900">
      <aside className="fixed top-0 left-0 z-40 hidden h-full w-64 flex-col gap-1 border-slate-100 border-r bg-[#f7f9fb] px-3 py-4 md:flex">
        <SidebarContent
          activeView={activeView}
          currentIdentity={currentIdentity}
          navigation={navigation}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="关闭菜单"
            className="absolute inset-0 bg-slate-950/20"
            onClick={() => setMobileOpen(false)}
            type="button"
          />
          <aside className="relative flex h-full w-[min(20rem,86vw)] flex-col gap-1 border-slate-100 border-r bg-[#f7f9fb] px-3 py-4 shadow-xl">
            <div className="mb-2 flex justify-end">
              <Button
                aria-label="关闭菜单"
                onClick={() => setMobileOpen(false)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X className="size-4" />
              </Button>
            </div>
            <SidebarContent
              activeView={activeView}
              currentIdentity={currentIdentity}
              navigation={navigation}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="min-h-svh md:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-slate-100 border-b bg-white/90 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <Button
              aria-label="打开菜单"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Menu className="size-4" />
            </Button>
            <p className="text-slate-500 text-sm">首页 / {activeLabel}</p>
          </div>
        </header>

        <main className="px-4 py-8 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  activeView,
  currentIdentity,
  navigation,
  onNavigate,
}: {
  activeView: AppView;
  currentIdentity: ProjectMembership;
  navigation: NavigationItem[];
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="mb-6 flex flex-col gap-1 px-2">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center bg-white text-[#005ac2] shadow-sm">
            <Building2 className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-bold text-base text-slate-800">
              施工质检情报员
            </h2>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {navigation.map((item) => {
          const Icon = iconByView[item.view];
          const active = item.view === activeView;

          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded px-3 py-2 text-[13px] transition-all",
                active
                  ? "bg-white font-medium text-[#005ac2] shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/50",
              )}
              href={item.href}
              key={item.view}
              onClick={onNavigate}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-slate-100 border-t px-2 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-bold text-blue-700">
            {currentIdentity.profile.fullName.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-800 text-sm">
              {currentIdentity.profile.fullName}{" "}
              {currentIdentity.profile.department}
            </p>
            <p className="truncate text-[10px] text-slate-500 uppercase tracking-wider">
              {currentIdentity.project.name} /{" "}
              {roleLabels[currentIdentity.role]}
            </p>
          </div>
        </div>
        <form action={logoutAction}>
          <Button
            className="w-full justify-start text-slate-600"
            type="submit"
            variant="ghost"
          >
            <LogOut className="size-4" />
            退出登录
          </Button>
        </form>
      </div>
    </>
  );
}
