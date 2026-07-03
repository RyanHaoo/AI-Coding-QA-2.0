import { MessageCircle, Search, Upload } from "lucide-react";

const prompts = [
  {
    icon: MessageCircle,
    text: "C栋B户型采光系数低于标准，帮我创建工单。",
  },
  {
    icon: Search,
    text: "查一下我的待处理工单。",
  },
  {
    icon: Upload,
    text: "上传现场图片后，我会和文字一起整理建单草稿。",
  },
];

export function AssistantEmptyState() {
  return (
    <div className="grid min-h-[280px] content-center gap-4 py-10">
      <div>
        <h2 className="font-semibold text-2xl text-slate-950">智能助手</h2>
        <p className="mt-2 max-w-xl text-slate-500 text-sm leading-6">
          直接描述问题、上传现场图片，或用编号和关键词查询当前身份可见工单。
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {prompts.map((prompt) => {
          const Icon = prompt.icon;
          return (
            <div
              className="rounded-lg border border-slate-200 bg-white p-3 text-slate-600 text-sm"
              key={prompt.text}
            >
              <Icon className="mb-2 size-4 text-[#005ac2]" />
              {prompt.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
