import type { Member } from "../../members/types/members.types";

export type GroupCategory = 'REGION' | 'MINISTRY';

export interface Group {
  _id: string;
  name: string;
  category: GroupCategory;
  leaders: Member[];
  members: Member[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupDto {
  name: string;
  category: GroupCategory;
  leaders?: string[];
  members?: string[];
}

export interface UpdateGroupDto {
  name?: string;
  category?: GroupCategory;
}

export interface UpdateGroupParticipantsDto {
  addMembers?: string[];
  removeMembers?: string[];
  addLeaders?: string[];
  removeLeaders?: string[];
}
