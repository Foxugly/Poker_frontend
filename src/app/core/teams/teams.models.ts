export type TeamRole = 'owner' | 'admin' | 'member';

export interface Team {
  id: number;
  name: string;
  owner_email: string;
  created_at: string;
  my_role: TeamRole;
  member_count: number;
  card_back_color: string;
  felt_color: string;
  is_paid: boolean;
  billing_enabled: boolean;
  subscription_status: string;
}

export interface Membership {
  id: number;
  user: { id: number; email: string; display_name: string };
  role: TeamRole;
  joined_at: string;
}

export interface Invitation {
  id: number;
  email: string;
  role: TeamRole;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}
