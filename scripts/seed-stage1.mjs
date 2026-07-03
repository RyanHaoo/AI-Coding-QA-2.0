import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SECRET_KEY;
const demoPassword = process.env.STAGE1_DEMO_PASSWORD ?? "QaDemo#2026";

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

const projects = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "上海瑞虹商业综合体",
    city: "上海",
    client_name: "瑞虹置业",
    project_type: "commercial",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "苏州智造园一期",
    city: "苏州",
    client_name: "恒岳制造",
    project_type: "industrial",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "杭州云栖住宅北区",
    city: "杭州",
    client_name: "云栖城投",
    project_type: "residential",
  },
];

const accounts = [
  {
    email: "li.qc@example.com",
    employee_number: "QC-1001",
    full_name: "李明",
    department: "质量管理部",
    memberships: [["11111111-1111-4111-8111-111111111111", "inspector"]],
  },
  {
    email: "wang.builder@example.com",
    employee_number: "BD-2001",
    full_name: "王强",
    department: "施工一部",
    memberships: [["11111111-1111-4111-8111-111111111111", "builder"]],
  },
  {
    email: "chen.admin@example.com",
    employee_number: "AD-3001",
    full_name: "陈静",
    department: "项目管理部",
    memberships: [["11111111-1111-4111-8111-111111111111", "admin"]],
  },
  {
    email: "ryan.multi@example.com",
    employee_number: "MX-9001",
    full_name: "Ryan Hao",
    department: "数字化项目组",
    memberships: [
      ["11111111-1111-4111-8111-111111111111", "admin"],
      ["22222222-2222-4222-8222-222222222222", "inspector"],
      ["33333333-3333-4333-8333-333333333333", "builder"],
    ],
  },
  {
    email: "zhao.builder@example.com",
    employee_number: "BD-2002",
    full_name: "赵磊",
    department: "施工二部",
    memberships: [
      ["22222222-2222-4222-8222-222222222222", "builder"],
      ["33333333-3333-4333-8333-333333333333", "builder"],
    ],
  },
  {
    email: "sun.qc@example.com",
    employee_number: "QC-1002",
    full_name: "孙敏",
    department: "质量管理部",
    memberships: [["33333333-3333-4333-8333-333333333333", "inspector"]],
  },
];

async function findUserByEmail(email) {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find((item) => item.email === email);
    if (user) {
      return user;
    }

    if (data.users.length < 100) {
      return null;
    }

    page += 1;
  }
}

async function ensureAuthUser(account) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: account.email,
    password: demoPassword,
    email_confirm: true,
    user_metadata: {
      full_name: account.full_name,
      employee_number: account.employee_number,
    },
  });

  if (data.user) {
    return data.user;
  }

  if (!error?.message.toLowerCase().includes("already")) {
    throw error;
  }

  const existing = await findUserByEmail(account.email);
  if (!existing) {
    throw new Error(`User exists but cannot be found: ${account.email}`);
  }

  return existing;
}

async function main() {
  const { error: projectError } = await supabase
    .from("projects")
    .upsert(projects, { onConflict: "id" });

  if (projectError) {
    throw projectError;
  }

  for (const account of accounts) {
    const user = await ensureAuthUser(account);

    const { error: profileError } = await supabase.from("app_users").upsert(
      {
        id: user.id,
        email: account.email,
        employee_number: account.employee_number,
        full_name: account.full_name,
        department: account.department,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      throw profileError;
    }

    const memberships = account.memberships.map(([projectId, role]) => ({
      user_id: user.id,
      project_id: projectId,
      role,
    }));

    const { error: membershipError } = await supabase
      .from("project_memberships")
      .upsert(memberships, { onConflict: "user_id,project_id,role" });

    if (membershipError) {
      throw membershipError;
    }
  }

  console.log(
    `Seeded ${accounts.length} users and ${projects.length} projects.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
