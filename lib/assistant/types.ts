import type { FileUIPart, UIMessage } from "ai";

import type { ProjectMembership } from "@/lib/identity/types";
import type {
  TicketSeverity,
  TicketSpecialty,
  TicketStatus,
} from "@/lib/tickets/types";

export type AssistantSession = {
  draftState: TicketDraft | null;
  id: string;
  messages: UIMessage[];
};

export type AssistantUploadedFile = FileUIPart & {
  filename: string;
  mediaType: string;
  type: "file";
  url: string;
};

export type TicketDraft = {
  assigneeMembershipId: string | null;
  description: string;
  imageUrls: string[];
  locationDetail: string;
  missingFields: string[];
  severity: TicketSeverity;
  specialty: TicketSpecialty;
  summary: string;
};

export type AssistantTicketResult = {
  assigneeName: string;
  detailHref: string;
  locationDetail: string;
  severity: TicketSeverity;
  status: TicketStatus;
  summary: string;
  ticketId: string;
  ticketNumber: string;
};

export type AssistantRuntimeContext = {
  currentIdentity: ProjectMembership;
  sessionId: string;
  uploadedImageUrls: string[];
  userId: string;
};
