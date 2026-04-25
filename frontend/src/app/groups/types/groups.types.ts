import type { Member } from "../../members/types/members.types";

export type GroupCategory = 'REGION' | 'MINISTRY';

export interface Group {
  _id: string;
  name: string;
  category: GroupCategory;
  leaders: Member[];
  members: Member[];
  allocatedBudget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: string;
  groupId: string;
  amount: number;
  description: string;
  receiptUrl?: string;
  submittedBy?: { firstName: string; lastName: string };
  createdAt: string;
}

export interface CreateGroupDto {
  name: string;
  category: GroupCategory;
  leaders?: string[];
  members?: string[];
  allocatedBudget?: number;
}

export interface UpdateGroupDto {
  name?: string;
  category?: GroupCategory;
  allocatedBudget?: number;
}

export interface UpdateGroupParticipantsDto {
  addMembers?: string[];
  removeMembers?: string[];
  addLeaders?: string[];
  removeLeaders?: string[];
}
