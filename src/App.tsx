import React, { useState, useEffect } from "react";
import {
  HeartPulse,
  ChartPie,
  CalendarDays,
  Flag,
  AlertTriangle,
  FileText,
  Edit2,
  User,
  Calendar,
  Plus,
  FolderPlus,
  Trash2,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Maximize2,
  Settings,
  X,
  ChevronRight,
  Sparkles,
  UserCheck
} from "lucide-react";
import { ProjectInfo, Phase, Task, Milestone, Risk } from "./types";

// 기본 데이터셋 설정 (로컬 스토리지에 없을 시 활성화)
const defaultProject: ProjectInfo = {
  title: "차세대 클라우드 ERP 플랫폼 구축",
  pm: "김기획",
  startDate: "2026-06-01",
  endDate: "2026-12-31"
};

const defaultPhases: Phase[] = [
  { id: "p1", name: "기획 및 요구사항 구체화", color: "indigo" },
  { id: "p2", name: "시스템 아키텍처 및 설계", color: "emerald" },
  { id: "p3", name: "개발 및 QA (알파/베타)", color: "purple" }
];

const defaultTasks: Task[] = [
  { id: "t1", phaseId: "p1", name: "비즈니스 요구분석서 최종 합의", startDate: "2026-06-01", endDate: "2026-06-15", progress: 100, owner: "김PM" },
  { id: "t2", phaseId: "p1", name: "WBS 승인 및 마스터플랜 픽스", startDate: "2026-06-16", endDate: "2026-06-30", progress: 100, owner: "김PM" },
  { id: "t3", phaseId: "p2", name: "DB 모델링 / ERD 작성", startDate: "2026-07-01", endDate: "2026-07-15", progress: 80, owner: "이아키" },
  { id: "t4", phaseId: "p2", name: "API 스펙 문서 작성", startDate: "2026-07-10", endDate: "2026-07-25", progress: 60, owner: "강서버" },
  { id: "t5", phaseId: "p3", name: "인하우스 테스트용 알파 릴리즈", startDate: "2026-08-01", endDate: "2026-09-15", progress: 10, owner: "박개발" },
  { id: "t6", phaseId: "p3", name: "QA팀 검증 및 픽스 (베타 릴리즈)", startDate: "2026-09-20", endDate: "2026-11-20", progress: 0, owner: "최보안" }
];

const defaultMilestones: Milestone[] = [
  { id: "m1", name: "요구사항 확정 및 WBS 승인", targetDate: "2026-06-30", status: "완료", progress: 100, owner: "김PM", deliverable: "요구사항 정의서" },
  { id: "m2", name: "DB 모델링 및 아키텍처 수립", targetDate: "2026-07-25", status: "진행", progress: 80, owner: "이아키", deliverable: "ERD, API 스펙" },
  { id: "m3", name: "알파 릴리즈 (인하우스 테스트)", targetDate: "2026-09-15", status: "예정", progress: 10, owner: "박개발", deliverable: "알파 버전 앱" },
  { id: "m4", name: "베타 릴리즈 및 보안 감사", targetDate: "2026-11-20", status: "예정", progress: 0, owner: "최보안", deliverable: "보안 리포트, 베타 앱" },
  { id: "m5", name: "최종 상용화 릴리즈", targetDate: "2026-12-31", status: "예정", progress: 0, owner: "김PM", deliverable: "Production 배포" }
];

const defaultRisks: Risk[] = [
  { id: "r1", msId: "m2", title: "레거시 DB 구조 복잡도로 인한 마이그레이션 지연", prob: 4, impact: 4, strategy: "완화 (Mitigate)", mitigation: "주말 특근 및 외부 자문 투입 검토", owner: "이아키", status: "Mitigating" },
  { id: "r2", msId: "m3", title: "알파 테스트용 더미 데이터 생성 스크립트 부재", prob: 2, impact: 3, strategy: "수용 (Accept)", mitigation: "QA팀 수동 데이터 입력 합의", owner: "조QA", status: "Open" },
  { id: "r3", msId: "m4", title: "결제 API V2 업데이트에 따른 스펙 전면 수정 리스크", prob: 3, impact: 5, strategy: "완화 (Mitigate)", mitigation: "V1 유지 파트너사 협의", owner: "박개발", status: "Open" }
];

export default function App() {
  // --- 상태 관리 ---
  const [project, setProject] = useState<ProjectInfo>(() => {
    const saved = localStorage.getItem("hb_project");
    return saved ? JSON.parse(saved) : defaultProject;
  });

  const [phases, setPhases] = useState<Phase[]>(() => {
    const saved = localStorage.getItem("hb_phases");
    return saved ? JSON.parse(saved) : defaultPhases;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("hb_tasks");
    return saved ? JSON.parse(saved) : defaultTasks;
  });

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem("hb_milestones");
    return saved ? JSON.parse(saved) : defaultMilestones;
  });

  const [risks, setRisks] = useState<Risk[]>(() => {
    const saved = localStorage.getItem("hb_risks");
    return saved ? JSON.parse(saved) : defaultRisks;
  });

  const [activeTab, setActiveTab] = useState<"dashboard" | "gantt" | "milestones" | "risks">("dashboard");
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: "" });

  // 모달 제어용 상태
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // 현재 활성화 및 편집 중인 객체 백업 상태
  const [editingProject, setEditingProject] = useState<ProjectInfo>({ ...project });
  const [editingPhase, setEditingPhase] = useState<Partial<Phase>>({});
  const [editingTask, setEditingTask] = useState<Partial<Task>>({});
  const [editingMilestone, setEditingMilestone] = useState<Partial<Milestone>>({});
  const [quickMilestone, setQuickMilestone] = useState<{ id: string; name: string; status: '완료' | '진행' | '예정'; progress: number } | null>(null);
  const [editingRisk, setEditingRisk] = useState<Partial<Risk>>({});

  // 시스템 기준 날짜 (현재 local time: 2026-05-28)
  const todayStr = "2026-05-28";

  // 로컬 스토리지 자동 보존 정책
  useEffect(() => {
    localStorage.setItem("hb_project", JSON.stringify(project));
  }, [project]);

  useEffect(() => {
    localStorage.setItem("hb_phases", JSON.stringify(phases));
  }, [phases]);

  useEffect(() => {
    localStorage.setItem("hb_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("hb_milestones", JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    localStorage.setItem("hb_risks", JSON.stringify(risks));
  }, [risks]);

  // 토스트 팝업 제어
  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => {
      setToast({ show: false, msg: "" });
    }, 2500);
  };

  // --- 핵심 비즈니스 로직 계산 엔진 ---
  const getRiskScore = (prob: number = 1, impact: number = 1) => prob * impact;

  // 단일 마일스톤 일정 신뢰도(Confidence) 산출: 100 - (연결된 활성 리스크 점수의 합)
  const calcConfidence = (msId: string) => {
    const activeRisks = risks.filter(r => r.msId === msId && r.status !== "Closed");
    const penalty = activeRisks.reduce((sum, r) => sum + getRiskScore(r.prob, r.impact), 0);
    const confidence = 100 - penalty;
    return confidence < 0 ? 0 : confidence;
  };

  // 프로젝트 전체 종합 헬스 레벨 자동 연산
  const calcProjectHealth = () => {
    const activeRisks = risks.filter(r => r.status !== "Closed");
    
    // 15점 이상의 Critical Risk가 활성 상태에 존재하는가?
    const hasCriticalRisk = activeRisks.some(r => getRiskScore(r.prob, r.impact) >= 15);
    
    // 오늘의 기준일을 초과했음에도 미완료 상태인 지연 마일스톤이 존재하지 않는가?
    const hasSlippedMilestone = milestones.some(m => {
      const isPast = new Date(m.targetDate) < new Date(todayStr);
      return m.status !== "완료" && isPast;
    });

    // 마일스톤 평균 신뢰도 계산
    const totalConfidence = milestones.reduce((sum, m) => sum + calcConfidence(m.id), 0);
    const avgConfidence = milestones.length > 0 ? (totalConfidence / milestones.length) : 100;

    if (hasCriticalRisk || hasSlippedMilestone || avgConfidence < 60) {
      return "Red";
    }
    if (activeRisks.length > 0 || avgConfidence < 85) {
      return "Yellow";
    }
    return "Green";
  };

  // --- 타임라인 바 가로 백분율 위치 연산 엔진 ---
  const calculateTimelineBarPosition = (startStr: string, endStr: string) => {
    const projStart = new Date(project.startDate).getTime();
    const projEnd = new Date(project.endDate).getTime();
    let taskStart = new Date(startStr).getTime();
    let taskEnd = new Date(endStr).getTime();

    if (taskStart < projStart) taskStart = projStart;
    if (taskEnd > projEnd) taskEnd = projEnd;

    const totalDuration = projEnd - projStart;
    if (totalDuration <= 0) return { left: 0, width: 100 };

    let leftPercent = ((taskStart - projStart) / totalDuration) * 100;
    let widthPercent = ((taskEnd - taskStart) / totalDuration) * 100;

    if (widthPercent < 2) widthPercent = 2; // 최소 가시성 확보
    if (leftPercent < 0) leftPercent = 0;
    if (leftPercent + widthPercent > 100) widthPercent = 100 - leftPercent;

    return { left: leftPercent, width: widthPercent };
  };

  // --- 간트 개월 헤더 배열 계산 ---
  const getGanttMonths = () => {
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const months: Date[] = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);

    // 무한 루프 예방 및 방어 코드
    let safetyCounter = 0;
    while (current <= end && safetyCounter < 100) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
      safetyCounter++;
    }
    return months;
  };

  // --- CRUD 핸들러 정의 (순수 React 리액티브 반영) ---

  // 1. 프로젝트 총 정보 저장
  const handleSaveProject = () => {
    if (!editingProject.title || !editingProject.startDate || !editingProject.endDate) {
      showToast("⚠️ 필수 정보를 모두 입력하세요.");
      return;
    }
    setProject({ ...editingProject });
    setActiveModal(null);
    showToast("📋 프로젝트 정보가 실시간 업데이트되었습니다.");
  };

  // 2. 단계(Phase) CRUD
  const handleOpenAddPhase = () => {
    setEditingPhase({ id: "", name: "", color: "indigo" });
    setActiveModal("phase");
  };

  const handleEditPhase = (p: Phase) => {
    setEditingPhase({ ...p });
    setActiveModal("phase");
  };

  const handleSavePhase = () => {
    if (!editingPhase.name) {
      showToast("⚠️ 단계를 구분할 명칭을 작성해주세요.");
      return;
    }
    if (editingPhase.id) {
      // 수정
      setPhases(phases.map(p => p.id === editingPhase.id ? (editingPhase as Phase) : p));
      showToast("✏️ 단계 구조가 수정되었습니다.");
    } else {
      // 신규
      const newId = "p_" + Date.now();
      setPhases([...phases, { id: newId, name: editingPhase.name, color: editingPhase.color || "indigo" }]);
      showToast("📂 새로운 프로젝트 관리 단계가 설정되었습니다.");
    }
    setActiveModal(null);
  };

  const handleDeletePhase = (id: string) => {
    if (confirm("🚨 이 단계를 삭제하시겠습니까?\n하위에 링크된 태스크 일정도 모두 영구히 삭제됩니다.")) {
      setPhases(phases.filter(p => p.id !== id));
      setTasks(tasks.filter(t => t.phaseId !== id));
      showToast("🗑️ 개발 단계와 하위 태스크가 전부 정리되었습니다.");
    }
  };

  // 3. 태스크(Task) CRUD
  const handleOpenAddTask = () => {
    if (phases.length === 0) {
      showToast("⚠️ 태스크를 생성하기 전, 관리 단계(Phase)를 하나 이상 만드세요.");
      return;
    }
    setEditingTask({ id: "", phaseId: phases[0].id, name: "", startDate: project.startDate, endDate: project.endDate, progress: 0, owner: "" });
    setActiveModal("task");
  };

  const handleEditTask = (t: Task) => {
    setEditingTask({ ...t });
    setActiveModal("task");
  };

  const handleSaveTask = () => {
    if (!editingTask.name || !editingTask.startDate || !editingTask.endDate) {
      showToast("⚠️ 태스크 명칭과 일정을 빠짐없이 완벽히 기입해주세요.");
      return;
    }
    if (editingTask.id) {
      setTasks(tasks.map(t => t.id === editingTask.id ? (editingTask as Task) : t));
      showToast("✏️ 태스크 스펙이 리비전 상태에 반영되었습니다.");
    } else {
      const newId = "t_" + Date.now();
      setTasks([...tasks, { ...(editingTask as Task), id: newId }]);
      showToast("➕ 신규 직무 태스크가 성공적으로 추가되었습니다.");
    }
    setActiveModal(null);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm("이 태스크 일정을 정말 삭제하시겠습니까?")) {
      setTasks(tasks.filter(t => t.id !== id));
      showToast("🗑️ 해당 세부 업무가 영구 삭제되었습니다.");
    }
  };

  const handleUpdateTaskProgressInline = (id: string, progress: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, progress } : t));
  };

  // 4. 마일스톤(Milestone) CRUD
  const handleOpenAddMilestone = () => {
    setEditingMilestone({ id: "", name: "", targetDate: todayStr, status: "예정", progress: 0, owner: "", deliverable: "" });
    setActiveModal("milestone");
  };

  const handleEditMilestone = (m: Milestone) => {
    setEditingMilestone({ ...m });
    setActiveModal("milestone");
  };

  const handleSaveMilestone = () => {
    if (!editingMilestone.name || !editingMilestone.targetDate) {
      showToast("⚠️ 마일스톤 명칭과 마감일을 검증해 주세요.");
      return;
    }
    if (editingMilestone.id) {
      setMilestones(milestones.map(m => m.id === editingMilestone.id ? (editingMilestone as Milestone) : m));
      showToast("🚩 마일스톤 이정표가 캘린더에 재정리되었습니다.");
    } else {
      const newId = "m_" + Date.now();
      setMilestones([...milestones, { ...(editingMilestone as Milestone), id: newId, status: "예정", progress: 0 }]);
      showToast("🚩 전사 공표용 신규 마일스톤이 설정되었습니다.");
    }
    setActiveModal(null);
  };

  const handleDeleteMilestone = (id: string) => {
    if (confirm("이 마일스톤을 제거하시겠습니까? 이정표에 설정되어 있던 모든 위험 위협 연결도 해제처리됩니다.")) {
      setMilestones(milestones.filter(m => m.id !== id));
      // 링크된 리스크의 msId를 공백으로 해제
      setRisks(risks.map(r => r.msId === id ? { ...r, msId: "" } : r));
      showToast("🗑️ 마일스톤이 정리되고 연계 리스크 매핑이 풀렸습니다.");
    }
  };

  // 마일스톤 번개 퀵 업데이트 팝업 전용
  const handleOpenQuickUpdate = (m: Milestone) => {
    setQuickMilestone({ id: m.id, name: m.name, status: m.status, progress: m.progress });
    setActiveModal("quickUpdate");
  };

  const handleSaveQuickUpdate = () => {
    if (!quickMilestone) return;
    setMilestones(milestones.map(m => {
      if (m.id === quickMilestone.id) {
        const nextStatus = quickMilestone.progress === 100 ? "완료" : quickMilestone.status;
        return { ...m, progress: quickMilestone.progress, status: nextStatus };
      }
      return m;
    }));
    setActiveModal(null);
    showToast("⚡ 마일스톤 지표가 초고속 업데이트되었습니다.");
  };

  // 5. 리스크(Risk) CRUD
  const handleOpenAddRisk = () => {
    setEditingRisk({ id: "", msId: milestones[0]?.id || "", title: "", prob: 1, impact: 1, strategy: "완화 (Mitigate)", mitigation: "", owner: "", status: "Open" });
    setActiveModal("risk");
  };

  const handleEditRisk = (r: Risk) => {
    setEditingRisk({ ...r });
    setActiveModal("risk");
  };

  const handleSaveRisk = () => {
    if (!editingRisk.title) {
      showToast("⚠️ 리스크의 상세 내용을 간결히 작성해 주세요.");
      return;
    }
    if (editingRisk.id) {
      setRisks(risks.map(r => r.id === editingRisk.id ? (editingRisk as Risk) : r));
      showToast("🛡️ 위험 관리 레지스터가 갱신되어 신뢰성 모델에 즉시 적용되었습니다.");
    } else {
      const newId = "r_" + Date.now();
      setRisks([...risks, { ...(editingRisk as Risk), id: newId }]);
      showToast("🚨 신규 잠재적 위험 요인이 실시간 포착·등록되었습니다.");
    }
    setActiveModal(null);
  };

  const handleDeleteRisk = (id: string) => {
    if (confirm("이 리스크 요인을 완전 종결 상태 및 데이터 소출 상태에서 영구 제명하시겠습니까?")) {
      setRisks(risks.filter(r => r.id !== id));
      showToast("🗑️ 리스크 요인이 레지스터에서 제거되었습니다.");
    }
  };

  // --- 주간 마크다운 리포트 생성 & 클립보드 복사 엔진 ---
  const handleExportWeeklyReport = () => {
    const health = calcProjectHealth();
    const healthStr = health === "Green" ? "🟢 On Track (정상 가동)" : (health === "Yellow" ? "🟡 At Risk (주의 대상)" : "🔴 Off Track (핵심 지연 발생 및 위기 상태)");
    
    let md = `# 📊 주간 프로젝트 종합 건강성 리포트 (${todayStr})\n\n`;
    md += `## 🚀 프로젝트 종합 정보\n`;
    md += `- **프로젝트명**: ${project.title}\n`;
    md += `- **목표 기한**: ${project.startDate} ~ ${project.endDate}\n`;
    md += `- **프로젝트 지휘(PM)**: ${project.pm}\n`;
    md += `- **실시간 헬스 신호**: **${healthStr}**\n\n`;

    md += `## 🚩 마일스톤 진척 및 신뢰도 모델 통계\n`;
    const sortedMs = [...milestones].sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
    sortedMs.forEach(m => {
      const conf = calcConfidence(m.id);
      const stIcon = m.status === "완료" ? "✅ [완료]" : (m.status === "진행" ? "🔄 [진행]" : "🗓️ [예정]");
      md += `- ${stIcon} **${m.name}** (~목표일: ${m.targetDate})\n`;
      md += `  └ 진척 완성도: ${m.progress}% | 위험 가중치 차감 잔여 신뢰성(Confidence): **${conf}%**\n`;
    });

    md += `\n## ⚠️ 활성 고위험 요인 (Top Risks)\n`;
    const activeRisksList = risks
      .filter(r => r.status !== "Closed")
      .sort((a, b) => getRiskScore(b.prob, b.impact) - getRiskScore(a.prob, a.impact));
    
    if (activeRisksList.length === 0) {
      md += `- 🎉 현재 활성화되어 실질 위협을 주도하는 리스크 요인이 없습니다!\n`;
    } else {
      activeRisksList.slice(0, 3).forEach((r, idx) => {
        const score = getRiskScore(r.prob, r.impact);
        const refMs = milestones.find(m => m.id === r.msId)?.name || "매핑 해제";
        md += `### ${idx + 1}. [위기지수: ${score}점] ${r.title}\n`;
        md += `- **영향 전파 장벽**: ${refMs}\n`;
        md += `- **대응 조치 전략**: ${r.strategy}\n`;
        md += `- **실행 계획 (Mitigation Action)**: ${r.mitigation}\n`;
        md += `- **통제 담당자 (Owner)**: ${r.owner || "미지정"}\n\n`;
      });
    }

    navigator.clipboard.writeText(md).then(() => {
      setActiveModal("reportSuccess");
      setTimeout(() => {
        setActiveModal(null);
      }, 2500);
    }).catch(err => {
      showToast("⚠️ 클립보드 복사 중 예외가 검출되었습니다.");
    });
  };

  // --- 헬퍼 리소스: 칼라 뱃지 맵핑 ---
  const getPhaseColorMap = (colorName: string) => {
    switch (colorName) {
      case "indigo": return { line: "bg-indigo-600", bar: "bg-indigo-500", text: "text-indigo-600" };
      case "emerald": return { line: "bg-emerald-600", bar: "bg-emerald-500", text: "text-emerald-600" };
      case "amber": return { line: "bg-amber-600", bar: "bg-amber-500", text: "text-amber-600" };
      case "rose": return { line: "bg-rose-600", bar: "bg-rose-500", text: "text-rose-600" };
      case "purple": return { line: "bg-purple-600", bar: "bg-purple-500", text: "text-purple-600" };
      default: return { line: "bg-indigo-600", bar: "bg-indigo-500", text: "text-indigo-600" };
    }
  };

  // 대시보드 내비게이션 활성화 클래스 매퍼
  const getNavClass = (tabId: typeof activeTab) => {
    const base = "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border ";
    if (activeTab === tabId) {
      return base + "bg-white text-indigo-600 border-indigo-100 shadow-sm shadow-indigo-100/50 scale-[1.02]";
    }
    return base + "bg-transparent text-slate-500 border-transparent hover:bg-slate-50/70 hover:text-slate-900";
  };

  const projectHealth = calcProjectHealth();

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white text-slate-800 font-sans antialiased">
      
      {/* 1. 사이드바 내비게이션 레일 */}
      <aside className="w-72 bg-white text-slate-800 flex flex-col flex-shrink-0 z-20 shadow-xl border-r border-slate-200/80">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-4">
          <div className="bg-gradient-to-tr from-indigo-600 to-indigo-400 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-slate-900">HealthBoard</h1>
            <p className="text-[10px] text-indigo-600 font-semibold tracking-widest uppercase">Risk-Driven Planner</p>
          </div>
        </div>

        {/* 내비게이션 바 */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <button onClick={() => setActiveTab("dashboard")} className={getNavClass("dashboard")}>
            <ChartPie className="w-5 h-5" />
            <span>종합 진단 요약</span>
          </button>
          <button onClick={() => setActiveTab("gantt")} className={getNavClass("gantt")}>
            <CalendarDays className="w-5 h-5" />
            <span>간트 마스터플랜</span>
          </button>
          <button onClick={() => setActiveTab("milestones")} className={getNavClass("milestones")}>
            <Flag className="w-5 h-5" />
            <span>마일스톤 뷰어</span>
          </button>
          <button onClick={() => setActiveTab("risks")} className={getNavClass("risks")}>
            <AlertTriangle className="w-5 h-5" />
            <span>위험 레지스터</span>
          </button>
        </nav>

        {/* 푸터 마크다운 복사 */}
        <div className="p-5 bg-slate-50 border-t border-slate-200/60">
          <button
            onClick={handleExportWeeklyReport}
            className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 py-3 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer shadow-sm"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>주간 Markdown 보고서 복사</span>
          </button>
        </div>
      </aside>

      {/* 2. 메인 콘텐츠 대시보드 바디 */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* 최상단 마스터 헤더 바 */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center flex-shrink-0 shadow-sm z-10">
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                  {project.title}
                </h2>
                <button
                  onClick={() => {
                    setEditingProject({ ...project });
                    setActiveModal("projectSettings");
                  }}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                  title="프로젝트 스펙 변경"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>스펙 수정</span>
                </button>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs font-medium text-slate-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                  목표일: <strong className="ml-1 text-slate-700">{project.endDate}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-medium text-slate-500 flex items-center">
                  <User className="w-4 h-4 mr-1.5 text-slate-400" />
                  PM: <strong className="ml-1 text-slate-700">{project.pm}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-medium text-slate-500 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1.5 text-indigo-500" />
                  기준시점: <strong className="ml-1 text-indigo-600">2026-05-28</strong>
                </span>
              </div>
            </div>
          </div>

          {/* 실시간 헬스 신호등 배지 */}
          <div
            className={`flex items-center space-x-3 px-5 py-2.5 rounded-full border shadow-sm transition-all duration-300 ${
              projectHealth === "Green"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : projectHealth === "Yellow"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  projectHealth === "Green"
                    ? "bg-emerald-400"
                    : projectHealth === "Yellow"
                    ? "bg-amber-400"
                    : "bg-rose-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  projectHealth === "Green"
                    ? "bg-emerald-500"
                    : projectHealth === "Yellow"
                    ? "bg-amber-500"
                    : "bg-rose-600"
                }`}
              ></span>
            </div>
            <span className="text-sm font-bold tracking-wide">
              {projectHealth === "Green" ? "정상 가동 (On Track)" : projectHealth === "Yellow" ? "주의 관찰 (At Risk)" : "동력 상실 (Off Track)"}
            </span>
          </div>
        </header>

        {/* 탭 가변 뷰 스페이스 */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* ================= 탭 1: 종합 진단 요약 (대시보드) ================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* 스펙 진단 위젯 보드 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. 마일스톤 진척 현황 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-slate-500 font-bold">마일스톤 진척율</span>
                    <Flag className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex items-baseline space-x-2 mt-3">
                    <h3 className="text-3xl font-extrabold text-slate-900">
                      {milestones.filter(m => m.status === "완료").length}/{milestones.length}
                    </h3>
                    <span className="text-xs text-slate-400">건수 완료됨</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 mt-5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-2.5 rounded-full transition-all duration-700"
                      style={{
                        width: `${
                          milestones.length > 0
                            ? (milestones.filter(m => m.status === "완료").length / milestones.length) * 100
                            : 0
                        }%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* 2. 평균 일정 신뢰도 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-slate-500 font-bold">평균 일정 신뢰 지표 (Confidence)</span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="mt-3">
                    <h3
                      className={`text-3xl font-extrabold ${
                        milestones.length > 0 &&
                        (milestones.reduce((sum, m) => sum + calcConfidence(m.id), 0) / milestones.length) < 60
                          ? "text-rose-600 animate-pulse"
                          : "text-slate-900"
                      }`}
                    >
                      {milestones.length > 0
                        ? Math.round(milestones.reduce((sum, m) => sum + calcConfidence(m.id), 0) / milestones.length)
                        : 100}
                      %
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-5 leading-normal">
                    링크된 실시간 미종결 리스크 발생률 × 영향도 디버프가 적용된 상태입니다.
                  </p>
                </div>

                {/* 3. 활성 위협 점수 합계 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-slate-500 font-bold">활성 리스크 스코어 총합</span>
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                  </div>
                  <div className="flex items-baseline space-x-3 mt-3">
                    <h3 className="text-3xl font-extrabold text-slate-900">
                      {risks.filter(r => r.status !== "Closed").reduce((sum, r) => sum + getRiskScore(r.prob, r.impact), 0)}
                    </h3>
                    <span className="text-xs px-2.5 py-1 font-bold bg-rose-50 text-rose-600 rounded-full border border-rose-100 animate-pulse">
                      High {risks.filter(r => r.status !== "Closed" && getRiskScore(r.prob, r.impact) >= 15).length}건 검출
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-5 leading-normal">
                    활성 리스크 점수 = 위험발생 빈도(1-5) × 프로젝트 타격 영향성(1-5)
                  </p>
                </div>

              </div>

              {/* 하단 마일스톤 정밀 상태 스케줄러 & 위험 발생 풀 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 다가오는 이정표 리스트 */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[400px]">
                  <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Flag className="w-4.5 h-4.5 text-indigo-500" />
                      <span>이정표 및 리스크 신뢰성</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab("milestones")}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      전체보기
                    </button>
                  </div>
                  <div className="p-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                    {[...milestones]
                      .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
                      .map(m => {
                        const confidence = calcConfidence(m.id);
                        const progressBg = confidence >= 85 ? "bg-emerald-500" : confidence >= 60 ? "bg-amber-500" : "bg-rose-500";
                        return (
                          <div key={m.id} className="p-4 bg-slate-50/80 border border-slate-200/65 rounded-xl flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-2.5">
                              <div className="flex items-center space-x-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  m.status === "완료"
                                    ? "bg-slate-200 text-slate-600 font-medium"
                                    : m.status === "진행"
                                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                    : "bg-white border border-slate-200 text-slate-400 font-medium"
                                }`}>
                                  {m.status}
                                </span>
                                <span className="text-sm font-bold text-slate-800 tracking-tight truncate max-w-[200px]">{m.name}</span>
                              </div>
                              <span className="text-xs text-slate-400 font-semibold">{m.targetDate}</span>
                            </div>
                            <div className="flex items-center space-x-3 mt-1.5">
                              <span className="text-[10px] text-slate-400 font-semibold w-12 text-right uppercase tracking-wider">Conf.</span>
                              <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div className={`${progressBg} h-2 rounded-full transition-all duration-500`} style={{ width: `${confidence}%` }}></div>
                              </div>
                              <span className={`text-xs font-bold w-10 text-right ${confidence < 60 ? "text-rose-600" : "text-slate-700"}`}>{confidence}%</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Top 5 활성 위험 요소 */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[400px]">
                  <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
                      <span>핵심 요주 위험 순위 (Top 5 Risks)</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab("risks")}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                    >
                      리스크 관리로 이동
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {risks.filter(r => r.status !== "Closed").length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2" />
                        <p className="text-sm font-medium">활성화되거나 제어 불가 사태인 리스크 위협이 없습니다.</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {risks
                          .filter(r => r.status !== "Closed")
                          .sort((a, b) => getRiskScore(b.prob, b.impact) - getRiskScore(a.prob, a.impact))
                          .slice(0, 5)
                          .map(r => {
                            const score = getRiskScore(r.prob, r.impact);
                            const badgeColor = score >= 15
                              ? "bg-rose-50 text-rose-700 border-rose-200/60"
                              : score >= 8
                              ? "bg-amber-50 text-amber-700 border-amber-200/60"
                              : "bg-slate-50 text-slate-600 border-slate-200/60";
                            const mappingMs = milestones.find(m => m.id === r.msId)?.name || "특정 이정표 없음";
                            return (
                              <li key={r.id} className="p-4.5 hover:bg-slate-50/70 transition-colors flex items-start space-x-4">
                                <div className={`flex-shrink-0 px-3 py-1.5 rounded-xl border ${badgeColor} text-center min-w-[56px] shadow-sm`}>
                                  <p className="text-[9px] uppercase font-bold opacity-70 tracking-widest">위협</p>
                                  <p className="text-lg font-extrabold">{score}</p>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-sm font-bold text-slate-800 truncate tracking-tight">{r.title}</h4>
                                  <p className="text-xs text-slate-400 my-1 flex items-center gap-1">
                                    <Flag className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{mappingMs}</span>
                                  </p>
                                  <p className="text-xs text-indigo-600 font-semibold truncate flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>{r.strategy}: {r.mitigation || "-"}</span>
                                  </p>
                                </div>
                              </li>
                            );
                          })}
                      </ul>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================= 탭 2: 간트 마스터플랜 ================= */}
          {activeTab === "gantt" && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-indigo-500" />
                    <span>개발 단계별 마스터플랜 (Gantt Chart)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    프로젝트 각 단계별 세부 태스크 일정을 조율하세요.
                    <strong> 리스트의 항목명을 클릭하면 디테일 추가/수정과 데이터 제어가 가능합니다.</strong>
                  </p>
                </div>
                <div className="flex shrink-0 space-x-3">
                  <button
                    onClick={handleOpenAddPhase}
                    className="p-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <FolderPlus className="w-4 h-4 text-indigo-500" />
                    <span>구분 단계 추가</span>
                  </button>
                  <button
                    onClick={handleOpenAddTask}
                    className="p-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>디테일 업무 추가</span>
                  </button>
                </div>
              </div>

              {/* 간트 스케줄 메인 스페이스 */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row">
                
                {/* 좌측 슬라이드: 태스크 목록(고정폭) */}
                <div className="w-full lg:w-[480px] border-b lg:border-b-0 lg:border-r border-slate-200 flex-shrink-0 flex flex-col bg-slate-50/60">
                  <div className="border-b border-slate-200 px-5 py-4 flex justify-between items-center bg-white">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">단계 및 태스크 (클릭 시 수정)</span>
                    <span className="text-xs font-bold text-slate-400">진치율 조절 / 옵션</span>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-slate-100/70 custom-scrollbar">
                    {phases.map(phase => {
                      const phaseColor = getPhaseColorMap(phase.color);
                      const phaseTasks = tasks.filter(t => t.phaseId === phase.id);
                      const parentProgress = phaseTasks.length > 0
                        ? Math.round(phaseTasks.reduce((acc, task) => acc + task.progress, 0) / phaseTasks.length)
                        : 0;

                      return (
                        <div key={phase.id} className="bg-white">
                          
                          {/* Phase Header Row */}
                          <div className="p-4 flex justify-between items-center bg-slate-50/40 border-b border-slate-100 group transition-all">
                            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                              <span className={`w-3 h-3 rounded-full shrink-0 ${phaseColor.line}`}></span>
                              <span
                                onClick={() => handleEditPhase(phase)}
                                className="font-extrabold text-xs md:text-sm text-slate-900 hover:text-indigo-600 hover:underline cursor-pointer truncate"
                                title="단계 설정 수정"
                              >
                                {phase.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3 text-xs shrink-0">
                              <span className={`font-bold py-0.5 px-2.5 rounded-full bg-slate-100 text-[10px] ${phaseColor.text}`}>
                                {parentProgress}%
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1.5 items-center">
                                <button onClick={() => handleEditPhase(phase)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer" title="단계 상세">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDeletePhase(phase.id)} className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer" title="단계 제거">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Task Child Component List */}
                          {phaseTasks.map(task => (
                            <div key={task.id} className="pl-8 pr-4 py-3 bg-slate-50/20 hover:bg-slate-50/70 flex justify-between items-center border-b border-slate-100/60 group transition-all">
                              <div className="min-w-0 pr-3 flex-1">
                                <p
                                  onClick={() => handleEditTask(task)}
                                  className="text-xs md:text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:underline cursor-pointer truncate"
                                  title="태스크 상세 정보 변경"
                                >
                                  {task.name}
                                </p>
                                <div className="flex items-center space-x-3 mt-1 text-[10px] text-slate-400 font-bold">
                                  <span className="bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <User className="w-3 h-3 text-slate-400" />
                                    {task.owner || "미지정"}
                                  </span>
                                  <span>{task.startDate} ~ {task.endDate}</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3 flex-shrink-0">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={task.progress}
                                    onChange={(e) => handleUpdateTaskProgressInline(task.id, parseInt(e.target.value))}
                                    className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    title="인라인 진척률 직접 튜닝"
                                  />
                                  <span className="text-[10px] font-extrabold text-slate-500 w-8 text-right shrink-0">{task.progress}%</span>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 items-center">
                                  <button onClick={() => handleEditTask(task)} className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {phaseTasks.length === 0 && (
                            <p className="text-[11px] py-3 text-slate-300 text-center italic">이 단계에 배속된 태스크가 없습니다.</p>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 우측 연계: 타임라인 그리드 (가로스크롤 대응) */}
                <div className="flex-1 overflow-x-auto bg-white relative custom-scrollbar max-h-[650px]">
                  <div className="min-w-[800px] flex flex-col h-full">
                    
                    {/* 월 헤더 가로선 */}
                    <div className="flex border-b border-slate-200 sticky top-0 bg-white z-10 shadow-sm">
                      {getGanttMonths().map((month, idx) => (
                        <div key={idx} className="flex-1 py-4 text-center text-xs font-bold text-slate-500 border-r border-slate-100">
                          {month.getFullYear()}년 {month.getMonth() + 1}월
                        </div>
                      ))}
                    </div>

                    {/* 타임라인 바 영역 */}
                    <div className="flex-1 divide-y divide-slate-100/60 pb-3">
                      {phases.map(p => {
                        const phaseColor = getPhaseColorMap(p.color);
                        const phaseTasks = tasks.filter(t => t.phaseId === p.id);

                        return (
                          <div key={p.id}>
                            {/* Phase Space */}
                            <div className="h-[49px] border-b border-slate-100 bg-slate-50/20"></div>

                            {/* Task Rows Space */}
                            {phaseTasks.map(task => {
                              const barPlacement = calculateTimelineBarPosition(task.startDate, task.endDate);
                              return (
                                <div key={task.id} className="h-[57px] relative flex items-center border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                  <div
                                    onClick={() => handleEditTask(task)}
                                    title={`${task.name} (${task.progress}% 완료)`}
                                    className={`absolute h-7 rounded-lg flex items-center justify-between px-3 text-[10px] font-bold text-white shadow-sm overflow-hidden transition-all duration-300 ${phaseColor.bar} cursor-pointer hover:opacity-90 max-w-full`}
                                    style={{
                                      left: `${barPlacement.left}%`,
                                      width: `${barPlacement.width}%`,
                                    }}
                                  >
                                    <div
                                      className="bg-white/20 absolute left-0 top-0 bottom-0 transition-all duration-700"
                                      style={{ width: `${task.progress}%` }}
                                    ></div>
                                    <span className="relative z-10 truncate tracking-tight">{task.name}</span>
                                    <span className="relative z-10 text-[9px] filter drop-shadow font-extrabold text-white/95">{task.progress}%</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================= 탭 3: 마일스톤 관리 및 퀵 업데이트 ================= */}
          {activeTab === "milestones" && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex justify-between items-center mb-1">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Flag className="w-5 h-5 text-indigo-500" />
                    <span>프로젝트 전사 목표 이정표 (Milestones)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    주요 배포 마감 및 목표 기도를 통합 모니터링합니다. 번개 아이콘의
                    <strong> Quick Update </strong>를 이용하면 진척도와 진행단계를 원클릭으로 수정할 수 있습니다.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddMilestone}
                  className="p-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/15 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>마일스톤 신규 추가</span>
                </button>
              </div>

              {/* 밀스톤 타임 그리드 분포 모델 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto hide-scrollbar">
                <div className="min-w-[800px] relative h-28">
                  <div className="absolute bottom-6 left-0 right-0 h-1 bg-gradient-to-r from-indigo-100 to-indigo-200 rounded"></div>
                  
                  {milestones
                    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
                    .map((m, idx) => {
                      const projStart = new Date(project.startDate).getTime();
                      const projEnd = new Date(project.endDate).getTime();
                      const milestoneTime = new Date(m.targetDate).getTime();
                      const totalSpan = projEnd - projStart;
                      
                      let leftPercent = ((milestoneTime - projStart) / totalSpan) * 100;
                      if (leftPercent < 0) leftPercent = 0;
                      if (leftPercent > 100) leftPercent = 100;

                      const isDone = m.status === "완료";
                      const isWorking = m.status === "진행";
                      const dotBg = isDone ? "bg-slate-400" : isWorking ? "bg-indigo-600 animate-pulse" : "bg-white border-2 border-indigo-500";
                      const pillText = m.targetDate.substring(5); // MM-DD 가독용

                      return (
                        <div
                          key={m.id}
                          className="absolute bottom-0 flex flex-col items-center group z-10"
                          style={{ left: `${leftPercent}%`, transform: "translateX(-50%)" }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 absolute -top-12 bg-slate-900 text-white text-[10px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                            <span className="font-extrabold">{m.name}</span> <span className="text-indigo-300">({m.targetDate})</span>
                          </div>
                          
                          <div className={`w-5 h-5 rounded-full ${dotBg} border-3 border-white shadow-md flex items-center justify-center`}>
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[3.5]" />}
                          </div>
                          <div className="w-0.5 h-10 bg-slate-200 mt-2"></div>
                          <span className="text-[10px] text-slate-500 font-extrabold mt-1.5 bg-white px-2.5 py-1 rounded-full border border-slate-100 shadow-sm">
                            {pillText}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* 디테일 통합 이정표 카드 레이아웃 */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {milestones
                  .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
                  .map(m => {
                    const confidence = calcConfidence(m.id);
                    const linkedActiveRisks = risks.filter(r => r.msId === m.id && r.status !== "Closed");

                    return (
                      <div key={m.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
                        
                        <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                          <div>
                            <div className="flex items-center space-x-2.5 mb-1.5">
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                                m.status === "완료"
                                  ? "bg-slate-200 text-slate-600"
                                  : m.status === "진행"
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px]"
                                  : "bg-white border border-slate-200 text-slate-400"
                              }`}>
                                {m.status}
                              </span>
                              <span className="text-xs font-bold text-slate-400 flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-1" />
                                {m.targetDate}
                              </span>
                            </div>
                            <h3
                              onClick={() => handleEditMilestone(m)}
                              className="font-extrabold text-slate-900 text-base cursor-pointer hover:text-indigo-600 hover:underline tracking-tight"
                              title="마일스톤 직접 편집"
                            >
                              {m.name}
                            </h3>
                          </div>
                          <button
                            onClick={() => handleOpenQuickUpdate(m)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                            title="진척도 신속 갱신"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
                            <span>Quick Update</span>
                          </button>
                        </div>

                        <div className="p-5 flex-1 flex flex-col space-y-5">
                          
                          {/* 실시간 진척 슬라이더 & 리스크 디렉트 신뢰 스코어 헤드 */}
                          <div className="flex justify-between items-end">
                            <div className="flex-1 mr-6">
                              <div className="flex justify-between text-xs mb-1.5 font-bold">
                                <span className="text-slate-500">마일스톤 작업 진척율</span>
                                <span className="text-slate-800">{m.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${m.progress}%` }}></div>
                              </div>
                            </div>
                            <div className="w-24 text-right">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">안전성 (Conf.)</span>
                              <span className={`text-xl font-black ${confidence < 60 ? "text-rose-600" : "text-slate-800"}`}>
                                {confidence}%
                              </span>
                            </div>
                          </div>

                          {/* 마일스톤 밀결합 활성 위험물 조회 오프셋 */}
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/50 flex-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">연계 활성 위험 요인({linkedActiveRisks.length})</span>
                            {linkedActiveRisks.length === 0 ? (
                              <p className="text-xs text-slate-400 italic py-1">이 정표를 직접 위협하는 미종결 위험 요소가 없습니다.</p>
                            ) : (
                              <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar">
                                {linkedActiveRisks.map(r => {
                                  const riskScore = getRiskScore(r.prob, r.impact);
                                  return (
                                    <div key={r.id} className="flex items-start justify-between text-xs py-2 border-b border-dashed border-slate-200 last:border-0">
                                      <div className="flex-1 min-w-0 pr-3">
                                        <div className="flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0"></span>
                                          <strong className="text-slate-700 block truncate font-bold">{r.title}</strong>
                                        </div>
                                        <span className="text-[10px] text-slate-400 block mt-0.5 ml-3 font-semibold truncate leading-normal">
                                           mitigation: {r.mitigation || "-"}
                                        </span>
                                      </div>
                                      <span className="font-extrabold text-[10px] px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-md shrink-0">
                                        기회손실 {riskScore}점
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                        </div>

                        {/* 카드 하단 메타바 */}
                        <div className="px-5 py-3.5 bg-slate-50/60 border-t border-slate-100 flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold flex items-center">
                            <UserCheck className="w-4 h-4 mr-1 text-slate-400" />
                            인계 소유자: {m.owner || "미지정"}
                          </span>
                          <div className="space-x-3 shrink-0 flex items-center">
                            <button onClick={() => handleEditMilestone(m)} className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-0.5 cursor-pointer">
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>수정</span>
                            </button>
                            <button onClick={() => handleDeleteMilestone(m.id)} className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-0.5 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>삭제</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
              </div>

            </div>
          )}

          {/* ================= 탭 4: 리스크 레지스터 ================= */}
          {activeTab === "risks" && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex justify-between items-center mb-1">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
                    <span>프로젝트 리스크 조치 대장 (Risk Register)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    일정 신뢰도를 실시간으로 위협하는 변수들을 탐지하고 대응 완화전략(Mitigation)을 세웁니다.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddRisk}
                  className="p-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/15 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>새로운 위험 등록</span>
                </button>
              </div>

              {/* 리스크 마스터 그리드 테이블 */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <th className="p-4 text-center w-20">위험도</th>
                        <th className="p-4 min-w-[280px]">위험 실체 및 대응(Mitigation)</th>
                        <th className="p-4 w-48">전파 영향 이정표</th>
                        <th className="p-4 w-32">위험 전개 식</th>
                        <th className="p-4 w-32">조치 관리상태</th>
                        <th className="p-4 text-center w-24">옵션</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {risks.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-16 text-slate-400 text-sm">
                            등록된 안전 위협 리스크가 없습니다. 평화로운 마스터플랜 가동 중입니다.
                          </td>
                        </tr>
                      ) : (
                        [...risks]
                          .sort((a,b) => getRiskScore(b.prob, b.impact) - getRiskScore(a.prob, a.impact))
                          .map(r => {
                            const riskScore = getRiskScore(r.prob, r.impact);
                            const scoreClass = riskScore >= 15
                              ? "text-rose-600 stroke-[3]"
                              : riskScore >= 8
                              ? "text-amber-500"
                              : "text-slate-600";
                            
                            const mappingMs = milestones.find(m => m.id === r.msId)?.name || "특정 타겟 없음";

                            return (
                              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                
                                <td className="p-4 text-center cursor-pointer" onClick={() => handleEditRisk(r)}>
                                  <span className={`text-xl font-extrabold ${scoreClass}`}>{riskScore}</span>
                                </td>

                                <td className="p-4 min-w-[280px] cursor-pointer" onClick={() => handleEditRisk(r)}>
                                  <p className="font-extrabold text-sm text-slate-800 line-clamp-2 hover:text-indigo-600 hover:underline">
                                    {r.title}
                                  </p>
                                  <p className="text-xs text-indigo-600 font-bold mt-1.5 flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                    <span>{r.strategy}: {r.mitigation || "조치책 설계 마감 기속"}</span>
                                  </p>
                                </td>

                                <td className="p-4">
                                  <span className="text-xs text-slate-600 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200/50 truncate block max-w-[180px]">
                                    🚩 {mappingMs}
                                  </span>
                                </td>

                                <td className="p-4 text-xs font-semibold text-slate-400">
                                  빈도 {r.prob} × 강력도 {r.impact}
                                </td>

                                <td className="p-4">
                                  {r.status === "Open" ? (
                                    <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md text-[10px] font-extrabold border border-rose-100">발생(Open)</span>
                                  ) : r.status === "Mitigating" ? (
                                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-[10px] font-extrabold border border-amber-100">조치를 취하는 중</span>
                                  ) : (
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-400 rounded-md text-[10px] font-extrabold">종결(Closed)</span>
                                  )}
                                  <p className="text-[10px] text-slate-400 font-bold mt-1.5 flex items-center gap-0.5">
                                    <User className="w-3 h-3 text-slate-300" />
                                    {r.owner || "미정"}
                                  </p>
                                </td>

                                <td className="p-4 text-center">
                                  <div className="flex justify-center items-center space-x-2.5">
                                    <button onClick={() => handleEditRisk(r)} className="text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors" title="위험 사양 변경">
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteRisk(r.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer transition-colors" title="이 위험 제명">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>

                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* ================= 3. 정교하고 수려한 모달 다이얼로그 가동창 ================= */}

      {/* 1. 프로젝트 스펙 편집 모달 */}
      {activeModal === "projectSettings" && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md overflow-hidden shadow-2xl animate-modalEntrance">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-indigo-500" />
                <span>프로젝트 정보 스펙 관리</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">프로젝트 명칭</label>
                <input
                  type="text"
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-505"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">시작 기점일</label>
                  <input
                    type="date"
                    value={editingProject.startDate}
                    onChange={(e) => setEditingProject({ ...editingProject, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">종료 목표일</label>
                  <input
                    type="date"
                    value={editingProject.endDate}
                    onChange={(e) => setEditingProject({ ...editingProject, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">총괄 책임PM</label>
                <input
                  type="text"
                  value={editingProject.pm}
                  onChange={(e) => setEditingProject({ ...editingProject, pm: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex justify-end space-x-2 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-extrabold text-slate-600 transition-colors cursor-pointer">
                취소
              </button>
              <button onClick={handleSaveProject} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-colors cursor-pointer">
                적용 및 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. 단계(Phase) 관리 팝업 */}
      {activeModal === "phase" && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md overflow-hidden shadow-2xl animate-modalEntrance">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FolderPlus className="w-4.5 h-4.5 text-indigo-500" />
                <span>프로젝트 관리 대단계 설정</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">단계 이름 (Phase Name)</label>
                <input
                  type="text"
                  value={editingPhase.name || ""}
                  onChange={(e) => setEditingPhase({ ...editingPhase, name: e.target.value })}
                  placeholder="예: 클라이언트 연동 테스트"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">테마 색상 매핑</label>
                <div className="flex space-x-3.5">
                  {(["indigo", "emerald", "amber", "rose", "purple"] as const).map(col => (
                    <button
                      key={col}
                      onClick={() => setEditingPhase({ ...editingPhase, color: col })}
                      className={`w-8 h-8 rounded-full shadow-sm cursor-pointer border-2 transition-all ${
                        editingPhase.color === col ? "border-slate-800 scale-110 ring-2 ring-indigo-500/10" : "border-transparent"
                      } ${
                        col === "indigo" ? "bg-indigo-500" : col === "emerald" ? "bg-emerald-500" : col === "amber" ? "bg-amber-500" : col === "rose" ? "bg-rose-500" : "bg-purple-500"
                      }`}
                    ></button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex justify-end space-x-2 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-extrabold text-slate-600 cursor-pointer">
                취소
              </button>
              <button onClick={handleSavePhase} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold cursor-pointer">
                단계정보 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. 태스크(Task) 관리 팝업 */}
      {activeModal === "task" && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md overflow-hidden shadow-2xl animate-modalEntrance">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CalendarDays className="w-4.5 h-4.5 text-indigo-500" />
                <span>체크리스트 디테일 태스크 편집</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">속해 있는 개발 단계 (Phase)</label>
                <select
                  value={editingTask.phaseId || ""}
                  onChange={(e) => setEditingTask({ ...editingTask, phaseId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-white"
                >
                  {phases.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">태스크 항목명</label>
                <input
                  type="text"
                  value={editingTask.name || ""}
                  onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                  placeholder="예: 신규 보안 API 취약성 감사"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">태스크 시작일</label>
                  <input
                    type="date"
                    value={editingTask.startDate || ""}
                    onChange={(e) => setEditingTask({ ...editingTask, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">태스크 완료 목표일</label>
                  <input
                    type="date"
                    value={editingTask.endDate || ""}
                    onChange={(e) => setEditingTask({ ...editingTask, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-500">작업 진척 완결도</label>
                  <span className="text-xs font-extrabold text-indigo-600">{editingTask.progress || 0}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editingTask.progress || 0}
                  onChange={(e) => setEditingTask({ ...editingTask, progress: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">업무 담당 주체 (Owner)</label>
                <input
                  type="text"
                  value={editingTask.owner || ""}
                  onChange={(e) => setEditingTask({ ...editingTask, owner: e.target.value })}
                  placeholder="예: 최보안 연구원"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex justify-end space-x-2 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-extrabold text-slate-600 cursor-pointer">
                취소
              </button>
              <button onClick={handleSaveTask} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold cursor-pointer animate-pulse">
                업무 스펙 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. 마일스톤 이정표 전체 편집 팝업 */}
      {activeModal === "milestone" && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md overflow-hidden shadow-2xl animate-modalEntrance">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Flag className="w-4.5 h-4.5 text-indigo-500" />
                <span>마일스톤 주요 마디 기획</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">마일스톤 타이틀</label>
                <input
                  type="text"
                  value={editingMilestone.name || ""}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, name: e.target.value })}
                  placeholder="예: 내부 보안성 평가 통과"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">목표 마감 예정일</label>
                  <input
                    type="date"
                    value={editingMilestone.targetDate || ""}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, targetDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">확답 책임 PM</label>
                  <input
                    type="text"
                    value={editingMilestone.owner || ""}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, owner: e.target.value })}
                    placeholder="담당자 이름"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">인계 산출 목표물 (Deliverable)</label>
                <input
                  type="text"
                  value={editingMilestone.deliverable || ""}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, deliverable: e.target.value })}
                  placeholder="예: API 취약검출 제로 감사 필 보고서"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex justify-end space-x-2 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-extrabold text-slate-600 cursor-pointer">
                취소
              </button>
              <button onClick={handleSaveMilestone} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold cursor-pointer">
                이정표 캘린더 등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. 마일스톤 번개 퀵 업데이트 모달 */}
      {activeModal === "quickUpdate" && quickMilestone && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-modalEntrance">
            <div className="px-6 py-4 border-b border-indigo-50 flex justify-between items-center bg-indigo-50/20">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-300" />
                <span>지표 초고속 업데이트 팝업</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block mb-1">업데이트 대상 </span>
                <p className="text-sm font-extrabold text-indigo-700 truncate leading-relaxed">
                  {quickMilestone.name}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2.5">목표 상태 변경</label>
                <div className="flex space-x-2">
                  {(["예정", "진행", "완료"] as const).map(st => (
                    <label key={st} className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="quick-status"
                        value={st}
                        checked={quickMilestone.status === st}
                        onChange={() => setQuickMilestone({ ...quickMilestone, status: st, progress: st === "완료" ? 100 : quickMilestone.progress })}
                        className="peer sr-only"
                      />
                      <div className="text-center py-2.5 text-xs font-bold border rounded-xl transition-all duration-200 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 peer-checked:text-white border-slate-200 text-slate-500 hover:bg-slate-50">
                        {st}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2 font-bold">
                  <label className="text-xs text-slate-500">지표 달성률</label>
                  <span className="text-xs text-indigo-600 font-extrabold">{quickMilestone.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={quickMilestone.progress}
                  onChange={(e) => {
                    const nextVal = parseInt(e.target.value);
                    const nextStatus = nextVal === 100 ? "완료" : quickMilestone.status === "완료" ? "진행" : quickMilestone.status;
                    setQuickMilestone({ ...quickMilestone, progress: nextVal, status: nextStatus });
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={handleSaveQuickUpdate}
                className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl text-xs font-bold tracking-wide cursor-pointer transition-all shadow p-2"
              >
                변경 완료 사항 전사 전파
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. 리스크(Risk) 생성 및 편집 모달 */}
      {activeModal === "risk" && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg overflow-hidden shadow-2xl animate-modalEntrance">
            <div className="px-6 py-4.5 border-b border-rose-100 flex justify-between items-center bg-rose-50/40">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                <span>안전 및 일정 위협 리스크 포작제어</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">위험 사슬 장벽 마일스톤 (매핑)</label>
                <select
                  value={editingRisk.msId || ""}
                  onChange={(e) => setEditingRisk({ ...editingRisk, msId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 bg-white"
                >
                  <option value="">-- 특정 지표에 바인딩하지 않음 --</option>
                  {milestones.map(m => (
                    <option key={m.id} value={m.id}>[{m.targetDate}] {m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">리스크 내용</label>
                <input
                  type="text"
                  value={editingRisk.title || ""}
                  onChange={(e) => setEditingRisk({ ...editingRisk, title: e.target.value })}
                  placeholder="예: 외부 게이트웨이 사양 불일치 리스크 검출"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* 확률 연산 슬라이더 위젯 */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">리스크 위협 지수 산정 (P × I)</span>
                  <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center text-xs">
                    <span className="text-slate-400 font-semibold mr-1">연산된 점수:</span>
                    <span className="font-extrabold text-rose-600 text-base">
                      {getRiskScore(editingRisk.prob || 1, editingRisk.impact || 1)}점
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1.5">
                      <span>발생 가능성 (Probability)</span>
                      <span className="text-slate-800">{editingRisk.prob || 1}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={editingRisk.prob || 1}
                      onChange={(e) => setEditingRisk({ ...editingRisk, prob: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 mt-1.5 font-bold">
                      <span>희박</span><span>극도로 확실</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1.5">
                      <span>타격 영향량 (Impact)</span>
                      <span className="text-slate-800">{editingRisk.impact || 1}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={editingRisk.impact || 1}
                      onChange={(e) => setEditingRisk({ ...editingRisk, impact: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 mt-1.5 font-bold">
                      <span>단순 기우</span><span>치명적 마비</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 완화 액션 전략식 스페이스 */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">리스크 대응 및 방어 조치 전략 (Action Plan)</label>
                <div className="flex space-x-2.5">
                  <select
                    value={editingRisk.strategy || "완화 (Mitigate)"}
                    onChange={(e) => setEditingRisk({ ...editingRisk, strategy: e.target.value })}
                    className="w-1/3 px-2 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-rose-500 bg-white"
                  >
                    <option value="완화 (Mitigate)">완화 (Mitigate)</option>
                    <option value="회피 (Avoid)">회피 (Avoid)</option>
                    <option value="수용 (Accept)">수용 (Accept)</option>
                    <option value="전가 (Transfer)">전가 (Transfer)</option>
                  </select>
                  <input
                    type="text"
                    value={editingRisk.mitigation || ""}
                    onChange={(e) => setEditingRisk({ ...editingRisk, mitigation: e.target.value })}
                    placeholder="예: 2안 백업 이중화 모듈 사전 테스트 가동 합의"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">리스크 담당 통제자</label>
                  <input
                    type="text"
                    value={editingRisk.owner || ""}
                    onChange={(e) => setEditingRisk({ ...editingRisk, owner: e.target.value })}
                    placeholder="예: 강서버 파트장"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">진행 조치 등급 상태</label>
                  <select
                    value={editingRisk.status || "Open"}
                    onChange={(e) => setEditingRisk({ ...editingRisk, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 bg-white"
                  >
                    <option value="Open">신규 발생 (Open)</option>
                    <option value="Mitigating">집중 통제 조치 중 (Mitigating)</option>
                    <option value="Closed">위험 해제/종결 (Closed)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex justify-end space-x-2 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-extrabold text-slate-600 cursor-pointer">
                취소
              </button>
              <button onClick={handleSaveRisk} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold cursor-pointer">
                위험요소 통제대장 기록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. 정교한 리포트 복사 완료 오버레이 알림 */}
      {activeModal === "reportSuccess" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-slate-900/95 text-white p-6 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm border border-slate-800 transition-all duration-300 transform scale-100">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3 animate-bounce" />
            <h4 className="font-extrabold text-sm tracking-tight text-white mb-1">Markdown 보고서 클립보드 복사 완료!</h4>
            <p className="text-[11px] text-slate-400 text-center leading-normal">
              주간 전사 보고용 마크다운 스페셜 패키지가 마그넷 처리되어 클립보드에 안착했습니다. 슬랙이나 아웃룩에 붙여넣으세요.
            </p>
          </div>
        </div>
      )}

      {/* 8. 미니 하단 토스트 숏컷 피드백 알림 */}
      <div
        className={`fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 transform transition-all duration-300 ${
          toast.show ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
        }`}
      >
        <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
        <span className="text-xs font-bold text-slate-200" id="toast-msg">
          {toast.msg}
        </span>
      </div>

    </div>
  );
}
