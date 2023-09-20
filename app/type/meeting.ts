export type TEvent = {
  id: number;
  title: string;
  username: string;
  userId: number;
  start: Date | null;
  end: Date | null;
};

export type TMeeting = {
  id: number;
  company_name: string;
  room_id: number;
  user: {
    id: number;
    name: string;
  };
  start_date: Date;
  end_date: Date;
};
