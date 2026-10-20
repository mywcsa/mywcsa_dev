export type EmsActor = {
  id: string;
  email: string;
  name: string;
  mode: "staff" | "organiser";
  role?: string;
};

export type EmsEvent = {
  id: string;
  reference: string;
  organiser_name: string;
  name: string;
  category: string;
  venue_name: string;
  venue_address?: string;
  start_date: string;
  end_date: string;
  status: string;
  capture_channel?: string;
  date_received?: string|null;
  captured_by_email?: string|null;
  created_at: string;
};
