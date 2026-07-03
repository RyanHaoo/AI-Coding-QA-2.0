export type Role = "inspector" | "builder" | "admin";

export type ProjectType =
  | "commercial"
  | "industrial"
  | "residential"
  | "government";

export type AppView = "assistant" | "tickets" | "dashboard" | "admin-tickets";

export type UserProfile = {
  avatarUrl: string | null;
  department: string;
  email: string;
  employeeNumber: string;
  fullName: string;
  id: string;
};

export type Project = {
  city: string;
  clientName: string;
  id: string;
  name: string;
  projectType: ProjectType;
};

export type ProjectMembership = {
  id: string;
  profile: UserProfile;
  project: Project;
  role: Role;
};

export type NavigationItem = {
  description: string;
  href: string;
  label: string;
  view: AppView;
};
