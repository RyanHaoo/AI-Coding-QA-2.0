import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SECRET_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SECRET_KEY. Check .env.local before seeding.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const projectIds = {
  hangzhou: "33333333-3333-4333-8333-333333333333",
  shanghai: "11111111-1111-4111-8111-111111111111",
  suzhou: "22222222-2222-4222-8222-222222222222",
};

const membershipKeys = [
  {
    key: "liShanghaiInspector",
    email: "li.qc@example.com",
    projectId: projectIds.shanghai,
    role: "inspector",
  },
  {
    key: "wangShanghaiBuilder",
    email: "wang.builder@example.com",
    projectId: projectIds.shanghai,
    role: "builder",
  },
  {
    key: "chenShanghaiAdmin",
    email: "chen.admin@example.com",
    projectId: projectIds.shanghai,
    role: "admin",
  },
  {
    key: "ryanShanghaiAdmin",
    email: "ryan.multi@example.com",
    projectId: projectIds.shanghai,
    role: "admin",
  },
  {
    key: "ryanSuzhouInspector",
    email: "ryan.multi@example.com",
    projectId: projectIds.suzhou,
    role: "inspector",
  },
  {
    key: "zhaoSuzhouBuilder",
    email: "zhao.builder@example.com",
    projectId: projectIds.suzhou,
    role: "builder",
  },
  {
    key: "sunHangzhouInspector",
    email: "sun.qc@example.com",
    projectId: projectIds.hangzhou,
    role: "inspector",
  },
  {
    key: "ryanHangzhouBuilder",
    email: "ryan.multi@example.com",
    projectId: projectIds.hangzhou,
    role: "builder",
  },
  {
    key: "zhaoHangzhouBuilder",
    email: "zhao.builder@example.com",
    projectId: projectIds.hangzhou,
    role: "builder",
  },
];

const ticketSeed = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    ticket_number: "WO-2026-0001",
    project_id: projectIds.shanghai,
    creator: "liShanghaiInspector",
    assignee: "wangShanghaiBuilder",
    status: "pending",
    severity: "urgent",
    specialty: "structure",
    summary: "承重墙裂缝宽度超过允许范围",
    location_detail: "A 栋 12 层东侧核心筒墙体",
    description:
      "现场巡检发现竖向裂缝连续贯通，裂缝两侧有轻微错台，需暂停后续饰面施工并复核结构安全。",
    image_urls: ["/ticket-images/structure-crack.svg"],
    created_at: "2026-07-01T09:10:00+08:00",
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    ticket_number: "WO-2026-0002",
    project_id: projectIds.shanghai,
    creator: "liShanghaiInspector",
    assignee: "wangShanghaiBuilder",
    status: "completed",
    severity: "normal",
    specialty: "architecture",
    summary: "外墙涂料局部色差明显",
    location_detail: "商业裙楼南立面 3 层",
    description: "南立面样板段与相邻区域存在肉眼可见色差，影响外观交付效果。",
    root_cause: "不同批次涂料未充分复核色号，局部施工环境湿度偏高。",
    preventive_action: "后续外墙涂料施工前统一做批次复核和小样确认。",
    image_urls: ["/ticket-images/facade-finish.svg"],
    created_at: "2026-06-29T14:30:00+08:00",
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    ticket_number: "WO-2026-0003",
    project_id: projectIds.shanghai,
    creator: "liShanghaiInspector",
    assignee: "wangShanghaiBuilder",
    status: "rejected",
    severity: "minor",
    specialty: "plumbing",
    summary: "临时水管接口疑似渗水",
    location_detail: "B1 机房临时给水支管接口",
    description: "巡检记录接口周边有水迹，需要施工方确认是否为渗漏。",
    image_urls: ["/ticket-images/water-leak.svg"],
    created_at: "2026-06-27T10:20:00+08:00",
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    ticket_number: "WO-2026-0004",
    project_id: projectIds.shanghai,
    creator: "chenShanghaiAdmin",
    assignee: "wangShanghaiBuilder",
    status: "pending",
    severity: "serious",
    specialty: "structure",
    summary: "梁柱节点蜂窝麻面需复核",
    location_detail: "L22 层 C-D 轴交 3-4 轴",
    description:
      "拆模后梁柱节点存在蜂窝麻面，局部钢筋保护层不足，需施工方提交整改方案。",
    image_urls: ["/ticket-images/structure-crack.svg"],
    created_at: "2026-07-02T15:45:00+08:00",
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    ticket_number: "WO-2026-0005",
    project_id: projectIds.shanghai,
    creator: "ryanShanghaiAdmin",
    assignee: "wangShanghaiBuilder",
    status: "completed",
    severity: "serious",
    specialty: "plumbing",
    summary: "消防管道支架间距偏大",
    location_detail: "地下二层消防泵房出水主管",
    description: "现场支架间距超过专项方案要求，管道运行振动风险较高。",
    root_cause: "施工班组按通用间距安装，未复核消防主管专项方案。",
    preventive_action: "消防主管支架安装前由班组长复核专项方案并留存检查记录。",
    image_urls: [],
    created_at: "2026-06-25T11:05:00+08:00",
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    ticket_number: "WO-2026-0006",
    project_id: projectIds.suzhou,
    creator: "ryanSuzhouInspector",
    assignee: "zhaoSuzhouBuilder",
    status: "pending",
    severity: "urgent",
    specialty: "plumbing",
    summary: "屋面雨水斗周边持续渗漏",
    location_detail: "1 号厂房屋面西北角雨水斗",
    description: "雨后 24 小时仍有渗漏，影响下方生产区设备进场条件。",
    image_urls: ["/ticket-images/water-leak.svg"],
    created_at: "2026-07-02T09:35:00+08:00",
  },
  {
    id: "10000000-0000-4000-8000-000000000007",
    ticket_number: "WO-2026-0007",
    project_id: projectIds.suzhou,
    creator: "ryanSuzhouInspector",
    assignee: "zhaoSuzhouBuilder",
    status: "completed",
    severity: "minor",
    specialty: "architecture",
    summary: "办公区隔墙阴角不顺直",
    location_detail: "综合楼 2 层办公区走廊",
    description: "阴角线局部不顺直，影响最终观感。",
    root_cause: "基层找平不足，腻子收口未按样板标准执行。",
    preventive_action: "批量施工前复核样板阴角线标准，完成后做拉线检查。",
    image_urls: [],
    created_at: "2026-06-26T16:10:00+08:00",
  },
  {
    id: "10000000-0000-4000-8000-000000000008",
    ticket_number: "WO-2026-0008",
    project_id: projectIds.suzhou,
    creator: "ryanSuzhouInspector",
    assignee: "zhaoSuzhouBuilder",
    status: "rejected",
    severity: "normal",
    specialty: "structure",
    summary: "设备基础边角破损责任不清",
    location_detail: "2 号厂房动力设备基础 F-08",
    description: "设备基础边角有缺损，需确认是否为土建施工质量问题。",
    image_urls: ["/ticket-images/structure-crack.svg"],
    created_at: "2026-06-24T13:00:00+08:00",
  },
  {
    id: "10000000-0000-4000-8000-000000000009",
    ticket_number: "WO-2026-0009",
    project_id: projectIds.hangzhou,
    creator: "sunHangzhouInspector",
    assignee: "ryanHangzhouBuilder",
    status: "pending",
    severity: "serious",
    specialty: "architecture",
    summary: "精装样板间墙面空鼓",
    location_detail: "5 号楼 802 户型客厅东墙",
    description: "敲击检查发现连续空鼓，需施工方复查基层处理和抹灰质量。",
    image_urls: ["/ticket-images/facade-finish.svg"],
    created_at: "2026-07-01T17:20:00+08:00",
  },
  {
    id: "10000000-0000-4000-8000-000000000010",
    ticket_number: "WO-2026-0010",
    project_id: projectIds.hangzhou,
    creator: "sunHangzhouInspector",
    assignee: "zhaoHangzhouBuilder",
    status: "completed",
    severity: "normal",
    specialty: "plumbing",
    summary: "卫生间地漏坡向不足",
    location_detail: "7 号楼 403 户型主卫",
    description: "闭水前检查发现局部坡向不足，地面有积水风险。",
    root_cause: "找坡层施工控制点不足，未按地漏位置复核坡度。",
    preventive_action:
      "卫生间找坡完成后增加泼水检查，整改合格后进入防水层施工。",
    image_urls: ["/ticket-images/water-leak.svg"],
    created_at: "2026-06-28T08:55:00+08:00",
  },
  {
    id: "10000000-0000-4000-8000-000000000011",
    ticket_number: "WO-2026-0011",
    project_id: projectIds.hangzhou,
    creator: "sunHangzhouInspector",
    assignee: "ryanHangzhouBuilder",
    status: "rejected",
    severity: "minor",
    specialty: "architecture",
    summary: "公共走道踢脚线色差",
    location_detail: "3 号楼 6 层公共走道",
    description: "踢脚线局部观感与样板不一致，需要确认是否属于整改范围。",
    image_urls: ["/ticket-images/facade-finish.svg"],
    created_at: "2026-06-23T14:15:00+08:00",
  },
  {
    id: "10000000-0000-4000-8000-000000000012",
    ticket_number: "WO-2026-0012",
    project_id: projectIds.hangzhou,
    creator: "sunHangzhouInspector",
    assignee: "zhaoHangzhouBuilder",
    status: "pending",
    severity: "urgent",
    specialty: "structure",
    summary: "地下车库顶板裂缝伴随渗水",
    location_detail: "地下车库 B 区 18-20 轴顶板",
    description: "顶板裂缝伴随渗水，需立即排查防水层和结构裂缝处理方案。",
    image_urls: [
      "/ticket-images/structure-crack.svg",
      "/ticket-images/water-leak.svg",
    ],
    created_at: "2026-07-03T09:25:00+08:00",
  },
];

async function loadMembershipMap() {
  const { data, error } = await supabase.from("project_memberships").select(`
      id,
      role,
      user_id,
      project_id,
      profile:app_users(email)
    `);

  if (error) {
    throw error;
  }

  const memberships = new Map();

  for (const item of data ?? []) {
    const profile = Array.isArray(item.profile)
      ? item.profile[0]
      : item.profile;
    const match = membershipKeys.find(
      (candidate) =>
        candidate.email === profile?.email &&
        candidate.projectId === item.project_id &&
        candidate.role === item.role,
    );

    if (match) {
      memberships.set(match.key, item.id);
    }
  }

  const missing = membershipKeys.filter((item) => !memberships.has(item.key));
  if (missing.length > 0) {
    throw new Error(
      `Missing stage 1 memberships: ${missing
        .map((item) => `${item.email}/${item.role}`)
        .join(", ")}`,
    );
  }

  return memberships;
}

function ticketRows(memberships) {
  return ticketSeed.map(({ assignee, creator, ...ticket }) => ({
    ...ticket,
    assignee_membership_id: memberships.get(assignee),
    creator_membership_id: memberships.get(creator),
    updated_at: ticket.created_at,
  }));
}

function activityRows(memberships) {
  return ticketSeed.flatMap((ticket, index) => {
    const createdLog = {
      id: `20000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      ticket_id: ticket.id,
      actor_membership_id: memberships.get(ticket.creator),
      activity_type: "created",
      reason: null,
      content: `创建工单并指派给当前责任人，初始状态为待处理。`,
      created_at: ticket.created_at,
    };

    if (ticket.status === "pending") {
      return [createdLog];
    }

    const closedAt = new Date(ticket.created_at);
    closedAt.setDate(closedAt.getDate() + 1);

    if (ticket.status === "completed") {
      return [
        createdLog,
        {
          id: `21000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
          ticket_id: ticket.id,
          actor_membership_id: memberships.get(ticket.assignee),
          activity_type: "resolved",
          reason: ticket.root_cause ?? "已完成现场整改。",
          content: "责任人提交整改结果，工单状态变为已完成。",
          created_at: closedAt.toISOString(),
        },
      ];
    }

    return [
      createdLog,
      {
        id: `22000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
        ticket_id: ticket.id,
        actor_membership_id: memberships.get(ticket.assignee),
        activity_type: "rejected",
        reason: "经现场复核，该问题不属于当前责任范围或不构成质量缺陷。",
        content: "责任人拒绝处理，工单状态变为已拒绝。",
        created_at: closedAt.toISOString(),
      },
    ];
  });
}

async function main() {
  const memberships = await loadMembershipMap();

  const { error: ticketError } = await supabase
    .from("tickets")
    .upsert(ticketRows(memberships), { onConflict: "id" });

  if (ticketError) {
    throw ticketError;
  }

  const { error: activityError } = await supabase
    .from("ticket_activity_logs")
    .upsert(activityRows(memberships), { onConflict: "id" });

  if (activityError) {
    throw activityError;
  }

  console.log(`Seeded ${ticketSeed.length} tickets for stage 2.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
