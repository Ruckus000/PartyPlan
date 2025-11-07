
export type Profile = {
  id: string;
  display_name: string;
  emoji: string;
  color: string;
  created_at: string;
};

export type Squad = {
  id: string;
  name: string;
  invite_code: string | null;
  created_by: string;
  created_at: string;
  memberCount?: number; // Optional, for display purposes
};

export type SquadMember = {
  squad_id: string;
  profile_id: string;
  role: 'owner' | 'member';
  profile?: Profile; // Optional, populated via join
};

export type Plan = {
  id: string;
  squad_id: string;
  created_by: string;
  type: 'set' | 'meetup';
  set_id?: string | null;
  meet_time?: string | null;
  meet_location?: string | null;
  note?: string | null;
  created_at: string;
};

export type PendingOperation = {
  id: string;
  type: 'delete' | 'add' | 'update';
  planId: string;
  planData?: Plan; // Full Plan object for safe rollbacks (especially for delete operations)
  timestamp: number;
  retryCount: number;
};
