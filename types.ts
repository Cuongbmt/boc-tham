export interface Proctor {
  id: number;
  name: string;
}

export enum Role {
  Proctor1 = 'Coi thi 1',
  Proctor2 = 'Coi thi 2',
  Supervisor = 'Giám sát',
}

export interface ExamSlot {
  date: string;
  time: string;
  room: string;
}

export interface Session {
  date: string;
  time: string;
  rooms: string[];
}

export interface Assignment {
  proctor: Proctor | null;
  role: Role;
  examSlot: ExamSlot;
}
