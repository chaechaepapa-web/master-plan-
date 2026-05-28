export interface ProjectInfo {
  title: string;
  pm: string;
  startDate: string;
  endDate: string;
}

export interface Phase {
  id: string;
  name: string;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export interface Task {
  id: string;
  phaseId: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  owner: string;
}

export interface Milestone {
  id: string;
  name: string;
  targetDate: string;
  status: '완료' | '진행' | '예정';
  progress: number;
  owner: string;
  deliverable: string;
}

export interface Risk {
  id: string;
  msId: string; // 연결된 마일스톤 ID (없을 수 있음)
  title: string;
  prob: number; // 1 ~ 5
  impact: number; // 1 ~ 5
  strategy: string;
  mitigation: string;
  owner: string;
  status: 'Open' | 'Mitigating' | 'Closed';
}
