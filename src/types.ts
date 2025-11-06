
export type Profile = {
  id: string;
  display_name: string;
  emoji: string;
  color: string;
  created_at: string;
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
