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
  UserCheck,
  ArrowLeft,
  RotateCcw
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
  const [projects, setProjects] = useState<ProjectInfo[]>(() => {
    const saved = localStorage.getItem("hb_projects_list");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p, idx) => ({ ...p, id: p.id || `proj_${idx}` }));
        }
      } catch (e) {}
    }
    return [{ ...defaultProject, id: "proj_default" }];
  });

  const [trashProjects, setTrashProjects] = useState<any[]>(() => {
    const saved = localStorage.getItem("hb_projects_trash");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const saved = localStorage.getItem("hb_active_project_id");
    return saved || "proj_default";
  });

  const [project, setProject] = useState<ProjectInfo>(() => {
    const pId = localStorage.getItem("hb_active_project_id") || "proj_default";
    const pKey = pId === "proj_default" ? "hb_project" : `hb_project_${pId}`;
    const saved = localStorage.getItem(pKey);
    if (saved) {
      try {
        return { ...JSON.parse(saved), id: pId };
      } catch (e) {}
    }
    // Fallback to legacy single-project hb_project if it's default
    const legacy = localStorage.getItem("hb_project");
    if (pId === "proj_default" && legacy) {
      try {
        return { ...JSON.parse(legacy), id: "proj_default" };
      } catch (e) {}
    }
    return { ...defaultProject, id: pId };
  });

  const [phases, setPhases] = useState<Phase[]>(() => {
    const pId = localStorage.getItem("hb_active_project_id") || "proj_default";
    const phKey = pId === "proj_default" ? "hb_phases" : `hb_project_${pId}_phases`;
    const saved = localStorage.getItem(phKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Fallback to legacy single-project hb_phases if it's default
    const legacy = localStorage.getItem("hb_phases");
    if (pId === "proj_default" && legacy) {
      try {
        return JSON.parse(legacy);
      } catch (e) {}
    }
    return defaultPhases;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const pId = localStorage.getItem("hb_active_project_id") || "proj_default";
    const tKey = pId === "proj_default" ? "hb_tasks" : `hb_project_${pId}_tasks`;
    const saved = localStorage.getItem(tKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Fallback to legacy single-project hb_tasks if it's default
    const legacy = localStorage.getItem("hb_tasks");
    if (pId === "proj_default" && legacy) {
      try {
        return JSON.parse(legacy);
      } catch (e) {}
    }
    return defaultTasks;
  });

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const pId = localStorage.getItem("hb_active_project_id") || "proj_default";
    const mKey = pId === "proj_default" ? "hb_milestones" : `hb_project_${pId}_milestones`;
    const saved = localStorage.getItem(mKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Fallback to legacy single-project hb_milestones if it's default
    const legacy = localStorage.getItem("hb_milestones");
    if (pId === "proj_default" && legacy) {
      try {
        return JSON.parse(legacy);
      } catch (e) {}
    }
    return defaultMilestones;
  });

  const [risks, setRisks] = useState<Risk[]>(() => {
    const pId = localStorage.getItem("hb_active_project_id") || "proj_default";
    const rKey = pId === "proj_default" ? "hb_risks" : `hb_project_${pId}_risks`;
    const saved = localStorage.getItem(rKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Fallback to legacy single-project hb_risks if it's default
    const legacy = localStorage.getItem("hb_risks");
    if (pId === "proj_default" && legacy) {
      try {
        return JSON.parse(legacy);
      } catch (e) {}
    }
    return defaultRisks;
  });

  const [activeTab, setActiveTab] = useState<"projects" | "dashboard" | "gantt" | "milestones" | "risks">("projects");
  const [showMilestonesOnGantt, setShowMilestonesOnGantt] = useState<boolean>(true);
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: "" });

  // ✏️ 편집 모드 및 커스텀 레이블 텍스트 상태 영속 제어
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [bannerBadge, setBannerBadge] = useState<string>(() => localStorage.getItem("hb_text_banner_badge") || "Project Portfolio Control Center");
  const [bannerTitle, setBannerTitle] = useState<string>(() => localStorage.getItem("hb_text_banner_title") || "프로젝트 포트폴리오 통합 제어반");
  const [bannerDesc, setBannerDesc] = useState<string>(() => localStorage.getItem("hb_text_banner_desc") || "조직 내부에서 추진하는 모든 프로젝트들의 수명주기 스펙과 일정을 개별적으로 보존하고 세부 계획을 전환 및 제어합니다. 아래 가용 프로젝트 목록에서 [상세 계획 관리 진입] 버튼을 클릭하여 구축 단계(Phases), 세부 작업(Tasks), 주요 이정표(Milestones), 리스크 정보를 실시간으로 관리하는 4가지 핵심 목차 화면으로 진입할 수 있습니다.");

  const [logoTitle, setLogoTitle] = useState<string>(() => localStorage.getItem("hb_text_logo_title") || "HealthBoard");
  const [logoSub, setLogoSub] = useState<string>(() => localStorage.getItem("hb_text_logo_sub") || "Risk-Driven Portfolio Management System");

  const [menuDashboard, setMenuDashboard] = useState<string>(() => localStorage.getItem("hb_text_menu_dashboard") || "종합 진단 요약");
  const [menuGantt, setMenuGantt] = useState<string>(() => localStorage.getItem("hb_text_menu_gantt") || "구축 마스터 기획");
  const [menuMilestones, setMenuMilestones] = useState<string>(() => localStorage.getItem("hb_text_menu_milestones") || "통합 마일스톤 추적");
  const [menuRisks, setMenuRisks] = useState<string>(() => localStorage.getItem("hb_text_menu_risks") || "위험 레지스터 관리");

  useEffect(() => { localStorage.setItem("hb_text_banner_badge", bannerBadge); }, [bannerBadge]);
  useEffect(() => { localStorage.setItem("hb_text_banner_title", bannerTitle); }, [bannerTitle]);
  useEffect(() => { localStorage.setItem("hb_text_banner_desc", bannerDesc); }, [bannerDesc]);
  useEffect(() => { localStorage.setItem("hb_text_logo_title", logoTitle); }, [logoTitle]);
  useEffect(() => { localStorage.setItem("hb_text_logo_sub", logoSub); }, [logoSub]);
  useEffect(() => { localStorage.setItem("hb_text_menu_dashboard", menuDashboard); }, [menuDashboard]);
  useEffect(() => { localStorage.setItem("hb_text_menu_gantt", menuGantt); }, [menuGantt]);
  useEffect(() => { localStorage.setItem("hb_text_menu_milestones", menuMilestones); }, [menuMilestones]);
  useEffect(() => { localStorage.setItem("hb_text_menu_risks", menuRisks); }, [menuRisks]);

  // 🔒 프로젝트 잠금/보호 기능용 상태 및 헬퍼 정의
  const [unlockedProjects, setUnlockedProjects] = useState<{[key: string]: boolean}>(() => {
    const saved = localStorage.getItem("hb_unlocked_projects");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem("hb_unlocked_projects", JSON.stringify(unlockedProjects));
  }, [unlockedProjects]);

  const [newProjPassword, setNewProjPassword] = useState("");
  const [passwordTargetProjId, setPasswordTargetProjId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>("");
  const [isShowingAdminFields, setIsShowingAdminFields] = useState<boolean>(false);
  const [unlockCallback, setUnlockCallback] = useState<(() => void) | null>(null);

  const isProjectUnlocked = (pId: string = activeProjectId) => {
    const target = projects.find(p => p.id === pId);
    if (!target) return true;
    if (!target.password) return true; // 비번이 안걸려있으면 항상 패스
    return !!unlockedProjects[pId];
  };

  const checkUnlockAndRun = (pId: string = activeProjectId, onUnlocked: () => void) => {
    if (isProjectUnlocked(pId)) {
      onUnlocked();
    } else {
      setPasswordTargetProjId(pId);
      setPasswordInput("");
      setAdminPasswordInput("");
      setIsShowingAdminFields(false);
      setUnlockCallback(() => onUnlocked);
      setActiveModal("projectUnlock");
    }
  };

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

  // 프로젝트별 자동 보존 및 상호 매핑 정책
  useEffect(() => {
    if (!activeProjectId) return;
    const key = activeProjectId === "proj_default" ? "hb_project" : `hb_project_${activeProjectId}`;
    localStorage.setItem(key, JSON.stringify(project));
    
    // projects 리스트 내부 필드 상태도 동기화해둡니다.
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, title: project.title, pm: project.pm, startDate: project.startDate, endDate: project.endDate, password: p.password || project.password } : p));
  }, [project, activeProjectId]);

  useEffect(() => {
    if (!activeProjectId) return;
    const key = activeProjectId === "proj_default" ? "hb_phases" : `hb_project_${activeProjectId}_phases`;
    localStorage.setItem(key, JSON.stringify(phases));
  }, [phases, activeProjectId]);

  useEffect(() => {
    if (!activeProjectId) return;
    const key = activeProjectId === "proj_default" ? "hb_tasks" : `hb_project_${activeProjectId}_tasks`;
    localStorage.setItem(key, JSON.stringify(tasks));
  }, [tasks, activeProjectId]);

  useEffect(() => {
    if (!activeProjectId) return;
    const key = activeProjectId === "proj_default" ? "hb_milestones" : `hb_project_${activeProjectId}_milestones`;
    localStorage.setItem(key, JSON.stringify(milestones));
  }, [milestones, activeProjectId]);

  useEffect(() => {
    if (!activeProjectId) return;
    const key = activeProjectId === "proj_default" ? "hb_risks" : `hb_project_${activeProjectId}_risks`;
    localStorage.setItem(key, JSON.stringify(risks));
  }, [risks, activeProjectId]);

  useEffect(() => {
    localStorage.setItem("hb_projects_list", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    setEditingProject({ ...project });
  }, [project]);

  // 새로운 프로젝트 추가 입력 폼 데이터
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjPm, setNewProjPm] = useState("");
  const [newProjStartDate, setNewProjStartDate] = useState("2026-06-01");
  const [newProjEndDate, setNewProjEndDate] = useState("2026-12-31");

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

  // --- 프로젝트 관리 및 전환 핸들러 ---
  const selectProject = (pId: string) => {
    // 1. 현재 주도하는 상태 리ко드를 로컬 스토리지 키로 안전하게 선 백업 보관
    const currentProjKey = activeProjectId === "proj_default" ? "hb_project" : `hb_project_${activeProjectId}`;
    const currentPhKey = activeProjectId === "proj_default" ? "hb_phases" : `hb_project_${activeProjectId}_phases`;
    const currentTKey = activeProjectId === "proj_default" ? "hb_tasks" : `hb_project_${activeProjectId}_tasks`;
    const currentMKey = activeProjectId === "proj_default" ? "hb_milestones" : `hb_project_${activeProjectId}_milestones`;
    const currentRKey = activeProjectId === "proj_default" ? "hb_risks" : `hb_project_${activeProjectId}_risks`;

    localStorage.setItem(currentProjKey, JSON.stringify(project));
    localStorage.setItem(currentPhKey, JSON.stringify(phases));
    localStorage.setItem(currentTKey, JSON.stringify(tasks));
    localStorage.setItem(currentMKey, JSON.stringify(milestones));
    localStorage.setItem(currentRKey, JSON.stringify(risks));

    // 2. 신규 로딩할 대상 프로젝트 탐색 및 스토리지 키 매칭
    const nextProjKey = pId === "proj_default" ? "hb_project" : `hb_project_${pId}`;
    const nextPhKey = pId === "proj_default" ? "hb_phases" : `hb_project_${pId}_phases`;
    const nextTKey = pId === "proj_default" ? "hb_tasks" : `hb_project_${pId}_tasks`;
    const nextMKey = pId === "proj_default" ? "hb_milestones" : `hb_project_${pId}_milestones`;
    const nextRKey = pId === "proj_default" ? "hb_risks" : `hb_project_${pId}_risks`;

    const savedProject = localStorage.getItem(nextProjKey);
    const savedPhases = localStorage.getItem(nextPhKey);
    const savedTasks = localStorage.getItem(nextTKey);
    const savedMilestones = localStorage.getItem(nextMKey);
    const savedRisks = localStorage.getItem(nextRKey);

    localStorage.setItem("hb_active_project_id", pId);
    setActiveProjectId(pId);

    const info = projects.find(p => p.id === pId) || { id: pId, title: "새 프로젝트", pm: "담당PM", startDate: "2026-06-01", endDate: "2026-12-31" };
    setProject(savedProject ? JSON.parse(savedProject) : { ...info });
    setPhases(savedPhases ? JSON.parse(savedPhases) : (pId === "proj_default" ? defaultPhases : [
      { id: `${pId}_p1`, name: "기획 및 요구사항 구체화", color: "indigo" },
      { id: `${pId}_p2`, name: "시스템 아키텍처 및 설계", color: "emerald" },
      { id: `${pId}_p3`, name: "개발 및 QA (알파/베타)", color: "purple" }
    ]));
    setTasks(savedTasks ? JSON.parse(savedTasks) : (pId === "proj_default" ? defaultTasks : []));
    setMilestones(savedMilestones ? JSON.parse(savedMilestones) : (pId === "proj_default" ? defaultMilestones : []));
    setRisks(savedRisks ? JSON.parse(savedRisks) : (pId === "proj_default" ? defaultRisks : []));

    // 프로젝트 선택 후 4가지 상세 목차(Dashboard)로 페이지 전환 진입
    setActiveTab("dashboard");
    showToast(`📁 ${info.title} 프로젝트 마스터플랜으로 진입하였습니다.`);
  };

  const handleCreateProject = (title: string, pm: string, startDate: string, endDate: string, password?: string) => {
    if (!title || !startDate || !endDate) {
      showToast("⚠️ 필수 요소를 모두 정확하게 기입해주세요.");
      return;
    }
    const newId = `proj_${Date.now()}`;
    const newProj: ProjectInfo = { id: newId, title, pm: pm || "담당 PM", startDate, endDate, password: password || undefined };
    
    const updatedList = [...projects, newProj];
    setProjects(updatedList);
    localStorage.setItem("hb_projects_list", JSON.stringify(updatedList));

    if (password) {
      setUnlockedProjects(prev => ({ ...prev, [newId]: true }));
    }

    // 전환
    selectProject(newId);
    showToast("✨ 새로운 스펙의 프로젝트가 생성 및 활성화되었습니다.");
  };

  const handleDeleteProject = (pId: string) => {
    const targetProj = projects.find(p => p.id === pId);
    if (!targetProj) return;

    // 프로젝트 삭제 데이터 보존용 백업 레코드 바인더 생성
    const pKey = pId === "proj_default" ? "hb_project" : `hb_project_${pId}`;
    const phKey = pId === "proj_default" ? "hb_phases" : `hb_project_${pId}_phases`;
    const tKey = pId === "proj_default" ? "hb_tasks" : `hb_project_${pId}_tasks`;
    const mKey = pId === "proj_default" ? "hb_milestones" : `hb_project_${pId}_milestones`;
    const rKey = pId === "proj_default" ? "hb_risks" : `hb_project_${pId}_risks`;

    let projInfoObj = targetProj;
    let phasesObj = defaultPhases;
    let tasksObj = defaultTasks;
    let milestonesObj = defaultMilestones;
    let risksObj = defaultRisks;

    if (activeProjectId === pId) {
      projInfoObj = { ...project };
      phasesObj = [...phases];
      tasksObj = [...tasks];
      milestonesObj = [...milestones];
      risksObj = [...risks];
    } else {
      try {
        const savedPObj = localStorage.getItem(pKey);
        if (savedPObj) projInfoObj = JSON.parse(savedPObj);
      } catch (e) {}

      try {
        const savedPhObj = localStorage.getItem(phKey);
        if (savedPhObj) phasesObj = JSON.parse(savedPhObj);
        else if (pId !== "proj_default") phasesObj = [
          { id: `${pId}_p1`, name: "기획 및 요구사항 구체화", color: "indigo" },
          { id: `${pId}_p2`, name: "시스템 아키텍처 및 설계", color: "emerald" },
          { id: `${pId}_p3`, name: "개발 및 QA (알파/베타)", color: "purple" }
        ];
      } catch (e) {}

      try {
        const savedTObj = localStorage.getItem(tKey);
        if (savedTObj) tasksObj = JSON.parse(savedTObj);
        else if (pId !== "proj_default") tasksObj = [];
      } catch (e) {}

      try {
        const savedMObj = localStorage.getItem(mKey);
        if (savedMObj) milestonesObj = JSON.parse(savedMObj);
        else if (pId !== "proj_default") milestonesObj = [];
      } catch (e) {}

      try {
        const savedRObj = localStorage.getItem(rKey);
        if (savedRObj) risksObj = JSON.parse(savedRObj);
        else if (pId !== "proj_default") risksObj = [];
      } catch (e) {}
    }

    const trashItem = {
      id: pId,
      projectInfo: projInfoObj,
      phases: phasesObj,
      tasks: tasksObj,
      milestones: milestonesObj,
      risks: risksObj,
      deletedAt: new Date().toISOString()
    };

    // 휴지통 전입
    const updatedTrash = [trashItem, ...trashProjects];
    setTrashProjects(updatedTrash);
    localStorage.setItem("hb_projects_trash", JSON.stringify(updatedTrash));

    const filtered = projects.filter(p => p.id !== pId);
    setProjects(filtered);
    localStorage.setItem("hb_projects_list", JSON.stringify(filtered));

    // 개별 데이터 파괴
    localStorage.removeItem(pKey);
    localStorage.removeItem(phKey);
    localStorage.removeItem(tKey);
    localStorage.removeItem(mKey);
    localStorage.removeItem(rKey);

    // 활성중인 기안을 지운 경우
    if (activeProjectId === pId) {
      if (filtered.length > 0) {
        const nextActiveId = filtered[0].id || "proj_default";
        localStorage.setItem("hb_active_project_id", nextActiveId);
        setActiveProjectId(nextActiveId);

        const nextKey = nextActiveId === "proj_default" ? "hb_project" : `hb_project_${nextActiveId}`;
        const nextPhKey = nextActiveId === "proj_default" ? "hb_phases" : `hb_project_${nextActiveId}_phases`;
        const nextTKey = nextActiveId === "proj_default" ? "hb_tasks" : `hb_project_${nextActiveId}_tasks`;
        const nextMKey = nextActiveId === "proj_default" ? "hb_milestones" : `hb_project_${nextActiveId}_milestones`;
        const nextRKey = nextActiveId === "proj_default" ? "hb_risks" : `hb_project_${nextActiveId}_risks`;

        const savedProject = localStorage.getItem(nextKey);
        const savedPhases = localStorage.getItem(nextPhKey);
        const savedTasks = localStorage.getItem(nextTKey);
        const savedMilestones = localStorage.getItem(nextMKey);
        const savedRisks = localStorage.getItem(nextRKey);

        const nextInfo = filtered[0];
        setProject(savedProject ? JSON.parse(savedProject) : { ...nextInfo });
        setPhases(savedPhases ? JSON.parse(savedPhases) : (nextActiveId === "proj_default" ? defaultPhases : [
          { id: `${nextActiveId}_p1`, name: "기획 및 요구사항 구체화", color: "indigo" },
          { id: `${nextActiveId}_p2`, name: "시스템 아키텍처 및 설계", color: "emerald" },
          { id: `${nextActiveId}_p3`, name: "개발 및 QA (알파/베타)", color: "purple" }
        ]));
        setTasks(savedTasks ? JSON.parse(savedTasks) : (nextActiveId === "proj_default" ? defaultTasks : []));
        setMilestones(savedMilestones ? JSON.parse(savedMilestones) : (nextActiveId === "proj_default" ? defaultMilestones : []));
        setRisks(savedRisks ? JSON.parse(savedRisks) : (nextActiveId === "proj_default" ? defaultRisks : []));
      } else {
        localStorage.removeItem("hb_active_project_id");
        setActiveProjectId("");
        setProject({
          id: "",
          title: "",
          pm: "",
          startDate: "",
          endDate: ""
        });
        setPhases([]);
        setTasks([]);
        setMilestones([]);
        setRisks([]);
      }
    }

    showToast(`🗑️ '${targetProj.title}' 프로젝트가 휴지통으로 이동되었습니다.`);
  };

  const handleRestoreProject = (pId: string) => {
    const targetTrashItem = trashProjects.find(item => item.id === pId);
    if (!targetTrashItem) {
      showToast("⚠️ 휴지통에서 대상을 탐색할 수 없습니다.");
      return;
    }

    // projects 리스토어 복구
    const restoredProj = targetTrashItem.projectInfo;
    const updatedList = [...projects, restoredProj];
    setProjects(updatedList);
    localStorage.setItem("hb_projects_list", JSON.stringify(updatedList));

    // 세부 연계 데이터 완벽 복원
    const pKey = pId === "proj_default" ? "hb_project" : `hb_project_${pId}`;
    const phKey = pId === "proj_default" ? "hb_phases" : `hb_project_${pId}_phases`;
    const tKey = pId === "proj_default" ? "hb_tasks" : `hb_project_${pId}_tasks`;
    const mKey = pId === "proj_default" ? "hb_milestones" : `hb_project_${pId}_milestones`;
    const rKey = pId === "proj_default" ? "hb_risks" : `hb_project_${pId}_risks`;

    localStorage.setItem(pKey, JSON.stringify(targetTrashItem.projectInfo));
    localStorage.setItem(phKey, JSON.stringify(targetTrashItem.phases));
    localStorage.setItem(tKey, JSON.stringify(targetTrashItem.tasks));
    localStorage.setItem(mKey, JSON.stringify(targetTrashItem.milestones));
    localStorage.setItem(rKey, JSON.stringify(targetTrashItem.risks));

    // 휴지통에서 소멸
    const updatedTrash = trashProjects.filter(item => item.id !== pId);
    setTrashProjects(updatedTrash);
    localStorage.setItem("hb_projects_trash", JSON.stringify(updatedTrash));

    showToast(`✨ '${restoredProj.title}' 프로젝트와 세부 기획·위험 리스트가 완벽히 제자리로 복구되었습니다!`);
  };

  const handlePermanentDelete = (pId: string) => {
    const targetTrashItem = trashProjects.find(item => item.id === pId);
    const title = targetTrashItem ? targetTrashItem.projectInfo.title : "선택된 프로젝트";
    
    if (confirm(`🚨 [영구 삭제 경고]\n'${title}' 프로젝트를 휴지통에서 영구히 삭제하시겠습니까?\n이 작업은 취소할 수 없으며 연결된 세부 일정 데이터는 물리적으로 완전히 소멸합니다.`)) {
      const updatedTrash = trashProjects.filter(item => item.id !== pId);
      setTrashProjects(updatedTrash);
      localStorage.setItem("hb_projects_trash", JSON.stringify(updatedTrash));
      showToast("💥 프로젝트가 영구적으로 파기 및 소멸되었습니다.");
    }
  };

  // 프로젝트별 요약 실시간 캘큘레이터
  const getProjectStats = (pId: string) => {
    const phKey = pId === "proj_default" ? "hb_phases" : `hb_project_${pId}_phases`;
    const tKey = pId === "proj_default" ? "hb_tasks" : `hb_project_${pId}_tasks`;
    const mKey = pId === "proj_default" ? "hb_milestones" : `hb_project_${pId}_milestones`;
    const rKey = pId === "proj_default" ? "hb_risks" : `hb_project_${pId}_risks`;

    let phCount = 0;
    let tCount = 0;
    let mCount = 0;
    let rCount = 0;

    try {
      const rawPh = localStorage.getItem(phKey);
      phCount = rawPh ? JSON.parse(rawPh).length : (pId === "proj_default" ? defaultPhases.length : 3);
    } catch (e) {}

    try {
      const rawT = localStorage.getItem(tKey);
      tCount = rawT ? JSON.parse(rawT).length : (pId === "proj_default" ? defaultTasks.length : 0);
    } catch (e) {}

    try {
      const rawM = localStorage.getItem(mKey);
      mCount = rawM ? JSON.parse(rawM).length : (pId === "proj_default" ? defaultMilestones.length : 0);
    } catch (e) {}

    try {
      const rawR = localStorage.getItem(rKey);
      rCount = rawR ? JSON.parse(rawR).length : (pId === "proj_default" ? defaultRisks.length : 0);
    } catch (e) {}

    return { phCount, tCount, mCount, rCount };
  };

  // --- CRUD 핸들러 정의 (순수 React 리액티브 반영) ---

  // 1. 프로젝트 총 정보 저장
  const handleSaveProject = () => {
    checkUnlockAndRun(activeProjectId, () => {
      if (!editingProject.title || !editingProject.startDate || !editingProject.endDate) {
        showToast("⚠️ 필수 정보를 모두 입력하세요.");
        return;
      }
      setProject({ ...editingProject });
      setActiveModal(null);
      showToast("📋 프로젝트 정보가 실시간 업데이트되었습니다.");
    });
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
    checkUnlockAndRun(activeProjectId, () => {
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
    });
  };

  const handleDeletePhase = (id: string) => {
    checkUnlockAndRun(activeProjectId, () => {
      if (confirm("🚨 이 단계를 삭제하시겠습니까?\n하위에 링크된 태스크 일정도 모두 영구히 삭제됩니다.")) {
        setPhases(phases.filter(p => p.id !== id));
        setTasks(tasks.filter(t => t.phaseId !== id));
        showToast("🗑️ 개발 단계와 하위 태스크가 전부 정리되었습니다.");
      }
    });
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
    checkUnlockAndRun(activeProjectId, () => {
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
    });
  };

  const handleDeleteTask = (id: string) => {
    checkUnlockAndRun(activeProjectId, () => {
      if (confirm("이 태스크 일정을 정말 삭제하시겠습니까?")) {
        setTasks(tasks.filter(t => t.id !== id));
        showToast("🗑️ 해당 세부 업무가 영구 삭제되었습니다.");
      }
    });
  };

  const handleUpdateTaskProgressInline = (id: string, progress: number) => {
    checkUnlockAndRun(activeProjectId, () => {
      setTasks(tasks.map(t => t.id === id ? { ...t, progress } : t));
    });
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
    checkUnlockAndRun(activeProjectId, () => {
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
    });
  };

  const handleDeleteMilestone = (id: string) => {
    checkUnlockAndRun(activeProjectId, () => {
      if (confirm("이 마일스톤을 제거하시겠습니까? 이정표에 설정되어 있던 모든 위험 위협 연결도 해제처리됩니다.")) {
        setMilestones(milestones.filter(m => m.id !== id));
        // 링크된 리스크의 msId를 공백으로 해제
        setRisks(risks.map(r => r.msId === id ? { ...r, msId: "" } : r));
        showToast("🗑️ 마일스톤이 정리되고 연계 리스크 매핑이 풀렸습니다.");
      }
    });
  };

  // 마일스톤 번개 퀵 업데이트 팝업 전용
  const handleOpenQuickUpdate = (m: Milestone) => {
    setQuickMilestone({ id: m.id, name: m.name, status: m.status, progress: m.progress });
    setActiveModal("quickUpdate");
  };

  const handleSaveQuickUpdate = () => {
    checkUnlockAndRun(activeProjectId, () => {
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
    });
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
    checkUnlockAndRun(activeProjectId, () => {
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
    });
  };

  const handleDeleteRisk = (id: string) => {
    checkUnlockAndRun(activeProjectId, () => {
      if (confirm("이 리스크 요인을 완전 종결 상태 및 데이터 소출 상태에서 영구 제명하시겠습니까?")) {
        setRisks(risks.filter(r => r.id !== id));
        showToast("🗑️ 리스크 요인이 레지스터에서 제거되었습니다.");
      }
    });
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
  const PHASE_COLORS = [
    { id: "indigo", name: "인디고 블루", bgClass: "bg-indigo-500", line: "bg-indigo-600", bar: "bg-indigo-500", text: "text-indigo-600", bgHex: "#6366f1" },
    { id: "blue", name: "클래식 블루", bgClass: "bg-blue-500", line: "bg-blue-600", bar: "bg-blue-500", text: "text-blue-600", bgHex: "#3b82f6" },
    { id: "sky", name: "스카이 블루", bgClass: "bg-sky-500", line: "bg-sky-600", bar: "bg-sky-500", text: "text-sky-600", bgHex: "#0ea5e9" },
    { id: "cyan", name: "시안 블루", bgClass: "bg-cyan-500", line: "bg-cyan-600", bar: "bg-cyan-500", text: "text-cyan-600", bgHex: "#06b6d4" },
    { id: "teal", name: "스페이스 틸", bgClass: "bg-teal-500", line: "bg-teal-600", bar: "bg-teal-500", text: "text-teal-600", bgHex: "#0d9488" },
    { id: "emerald", name: "에메랄드 그린", bgClass: "bg-emerald-500", line: "bg-emerald-600", bar: "bg-emerald-500", text: "text-emerald-600", bgHex: "#10b981" },
    { id: "green", name: "포레스트 그린", bgClass: "bg-green-500", line: "bg-green-600", bar: "bg-green-500", text: "text-green-600", bgHex: "#22c55e" },
    { id: "lime", name: "라임 그린", bgClass: "bg-lime-500", line: "bg-lime-600", bar: "bg-lime-500", text: "text-lime-600", bgHex: "#84cc16" },
    { id: "yellow", name: "썬플라워 옐로우", bgClass: "bg-yellow-400", line: "bg-yellow-500", bar: "bg-yellow-400", text: "text-yellow-600", bgHex: "#eab308" },
    { id: "amber", name: "스프링 앰버", bgClass: "bg-amber-500", line: "bg-amber-600", bar: "bg-amber-500", text: "text-amber-600", bgHex: "#f59e0b" },
    { id: "orange", name: "피치 오렌지", bgClass: "bg-orange-500", line: "bg-orange-600", bar: "bg-orange-500", text: "text-orange-600", bgHex: "#f97316" },
    { id: "red", name: "애플 레드", bgClass: "bg-red-500", line: "bg-red-600", bar: "bg-red-500", text: "text-red-600", bgHex: "#ef4444" },
    { id: "coral", name: "코랄 핑크", bgClass: "bg-orange-400", line: "bg-orange-500", bar: "bg-orange-400", text: "text-orange-500", bgHex: "#fb923c" },
    { id: "crimson", name: "크림슨 레드", bgClass: "bg-red-600", line: "bg-red-700", bar: "bg-red-600", text: "text-red-700", bgHex: "#be123c" },
    { id: "rose", name: "클래식 로즈", bgClass: "bg-rose-500", line: "bg-rose-600", bar: "bg-rose-500", text: "text-rose-600", bgHex: "#f43f5e" },
    { id: "pink", name: "베리 핑크", bgClass: "bg-pink-500", line: "bg-pink-600", bar: "bg-pink-500", text: "text-pink-600", bgHex: "#ec4899" },
    { id: "fuchsia", name: "네온 푸시아", bgClass: "bg-fuchsia-500", line: "bg-fuchsia-600", bar: "bg-fuchsia-500", text: "text-fuchsia-600", bgHex: "#d946ef" },
    { id: "purple", name: "네온 퍼플", bgClass: "bg-purple-500", line: "bg-purple-600", bar: "bg-purple-500", text: "text-purple-600", bgHex: "#a855f7" },
    { id: "violet", name: "디프 바이올렛", bgClass: "bg-violet-500", line: "bg-violet-600", bar: "bg-violet-500", text: "text-violet-600", bgHex: "#8b5cf6" },
    { id: "lavender", name: "라벤더", bgClass: "bg-violet-300", line: "bg-violet-400", bar: "bg-violet-300", text: "text-violet-500", bgHex: "#a78bfa" },
    { id: "plum", name: "딥 플럼", bgClass: "bg-fuchsia-700", line: "bg-fuchsia-800", bar: "bg-fuchsia-700", text: "text-fuchsia-800", bgHex: "#86198f" },
    { id: "peach", name: "크림 피치", bgClass: "bg-amber-300", line: "bg-amber-400", bar: "bg-amber-300", text: "text-amber-500", bgHex: "#fcd34d" },
    { id: "olive", name: "카키 올리브", bgClass: "bg-lime-700", line: "bg-lime-800", bar: "bg-lime-700", text: "text-lime-800", bgHex: "#3f6212" },
    { id: "mint", name: "리프 민트", bgClass: "bg-emerald-300", line: "bg-emerald-400", bar: "bg-emerald-300", text: "text-emerald-500", bgHex: "#34d399" },
    { id: "navy", name: "디프 네이비", bgClass: "bg-slate-800", line: "bg-slate-900", bar: "bg-slate-800", text: "text-slate-900", bgHex: "#0f172a" },
    { id: "slate", name: "스틸 슬레이트", bgClass: "bg-slate-500", line: "bg-slate-600", bar: "bg-slate-500", text: "text-slate-600", bgHex: "#64748b" },
    { id: "zinc", name: "쿨 그레이", bgClass: "bg-zinc-500", line: "bg-zinc-600", bar: "bg-zinc-500", text: "text-zinc-600", bgHex: "#71717a" },
    { id: "neutral", name: "뉴트럴 그레이", bgClass: "bg-neutral-500", line: "bg-neutral-600", bar: "bg-neutral-500", text: "text-neutral-600", bgHex: "#737373" },
    { id: "stone", name: "웜 스톤", bgClass: "bg-stone-500", line: "bg-stone-600", bar: "bg-stone-500", text: "text-stone-600", bgHex: "#78716c" },
    { id: "gold", name: "앤티크 골드", bgClass: "bg-yellow-500", line: "bg-yellow-600", bar: "bg-yellow-500", text: "text-yellow-600", bgHex: "#ca8a04" }
  ];

  const getPhaseColorMap = (colorName: string) => {
    const found = PHASE_COLORS.find(c => c.id === colorName);
    if (found) {
      return { line: found.line, bar: found.bar, text: found.text };
    }
    return { line: "bg-indigo-600", bar: "bg-indigo-500", text: "text-indigo-600" };
  };

  const getNavClass = (tabId: typeof activeTab) => {
    const base = "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border ";
    if (activeTab === tabId) {
      return base + "bg-white text-indigo-600 border-indigo-100 shadow-sm shadow-indigo-100/50 scale-[1.02]";
    }
    return base + "bg-transparent text-slate-500 border-transparent hover:bg-slate-50/70 hover:text-slate-900";
  };

  const projectHealth = calcProjectHealth();

  if (activeTab === "projects") {
    return (
      <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden font-sans antialiased">
        {/* 상단 통합 마스터 헤더 바 */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center flex-shrink-0 shadow-sm z-10">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-tr from-indigo-600 to-indigo-400 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              {isEditMode ? (
                <div className="flex flex-col gap-1 w-64">
                  <input
                    type="text"
                    value={logoTitle}
                    onChange={(e) => setLogoTitle(e.target.value)}
                    className="font-extrabold text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="로고 타이틀"
                  />
                  <input
                    type="text"
                    value={logoSub}
                    onChange={(e) => setLogoSub(e.target.value)}
                    className="text-[9px] text-indigo-600 font-bold bg-slate-50 border border-slate-200 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="로고 서브텍스트"
                  />
                </div>
              ) : (
                <>
                  <h1 className="font-extrabold text-xl tracking-tight text-slate-900 animate-pulse">{logoTitle}</h1>
                  <p className="text-[10px] text-indigo-600 font-bold tracking-widest uppercase">{logoSub}</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* ✏️ 편집 모드 전환 통합 토글 */}
            <button
              onClick={() => {
                const nextEditMode = !isEditMode;
                setIsEditMode(nextEditMode);
                showToast(nextEditMode ? "✏️ 편집 모드가 활성화되었습니다. 설명문, 헤더명, 메뉴를 자유롭게 편집하세요!" : "🔒 편집 모드가 비활성화되어, 수정 내용이 안전하게 저장되었습니다.");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border cursor-pointer ${
                isEditMode 
                  ? "bg-amber-500 border-amber-400 text-white hover:bg-amber-600 hover:scale-[1.01]" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{isEditMode ? "💾 편집완료 (저장)" : "✏️ 설명문/메뉴 편집개시"}</span>
            </button>

            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>기준시점: {todayStr}</span>
            </span>
          </div>
        </header>

        {/* 메인 스크롤 콘텐츠 구역 */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
            
            {/* 상단 소개 배너: 요청에 의거 배경색을 흰색(White)으로 전환 및 수정기능 탑재 */}
            <div className="bg-white rounded-2xl p-8 text-slate-800 border border-slate-200 shadow-md relative overflow-hidden transition-all duration-200 hover:shadow-lg">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <FolderPlus className="w-48 h-48 text-slate-900" />
              </div>
              <div className="relative z-10 max-w-3xl">
                {isEditMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-indigo-500 mb-1 uppercase tracking-widest">배너 상단 뱃지 텍스트</label>
                      <input
                        type="text"
                        value={bannerBadge}
                        onChange={(e) => setBannerBadge(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">배너 헤드라인 타이틀</label>
                      <input
                        type="text"
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        className="text-lg font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">배너 설명 본문</label>
                      <textarea
                        value={bannerDesc}
                        onChange={(e) => setBannerDesc(e.target.value)}
                        rows={3}
                        className="text-slate-600 text-xs leading-relaxed w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 inline-block">
                      {bannerBadge}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                      {bannerTitle}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mt-2.5">
                      {bannerDesc}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* 개설 폼 & 리바 그리드 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* 왼쪽: 새로운 프로젝트 개설 카드 */}
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between h-fit">
                <div>
                  <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 mb-6 font-semibold">
                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                      <FolderPlus className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">새로운 프로젝트 신규 개설</h4>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">프로젝트 명칭 <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={newProjTitle}
                        onChange={(e) => setNewProjTitle(e.target.value)}
                        placeholder="예: 차세대 빌링 시스템 아키텍처 수립"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">총괄 책임PM</label>
                      <input
                        type="text"
                        value={newProjPm}
                        onChange={(e) => setNewProjPm(e.target.value)}
                        placeholder="예: 홍길동 PM"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                        <span>수정 및 편집 비밀번호 (선택)</span>
                        <span className="text-[10px] text-indigo-500 font-normal">비지정시 누구나 수정가능</span>
                      </label>
                      <input
                        type="password"
                        value={newProjPassword}
                        onChange={(e) => setNewProjPassword(e.target.value)}
                        placeholder="설정 시 개설한 사람만 편집 가능"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">시작 기점일 <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          value={newProjStartDate}
                          onChange={(e) => setNewProjStartDate(e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-semibold text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">종료 목표일 <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          value={newProjEndDate}
                          onChange={(e) => setNewProjEndDate(e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-semibold text-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!newProjTitle) {
                      showToast("⚠️ 프로젝트 명칭을 상세하게 입력해주세요.");
                      return;
                    }
                    handleCreateProject(newProjTitle, newProjPm, newProjStartDate, newProjEndDate, newProjPassword);
                    setNewProjTitle("");
                    setNewProjPm("");
                    setNewProjPassword("");
                  }}
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white py-3 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-2 font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>새로운 프로젝트 마스터 개설</span>
                </button>
              </div>

              {/* 오른쪽: 가용 프로젝트 전체 리스트 */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                     <span>가용 가동 프로젝트</span>
                     <span className="bg-slate-200 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-extrabold">{projects.length}</span>
                  </h4>
                  <span className="text-xs font-medium text-slate-400">등록된 최적 일정 로드 또는 파기가 가능합니다.</span>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 pad-y-1 custom-scrollbar">
                  {projects.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                      <FolderPlus className="w-12 h-12 text-slate-300 mx-auto animate-bounce" />
                      <h5 className="font-extrabold text-slate-700 text-sm">가용한 활성 프로젝트가 존재하지 않습니다.</h5>
                      <p className="text-slate-400 text-xs leading-relaxed">왼쪽의 '새로운 프로젝트 마스터 개설' 구역에서 신규 마스터플랜 프로젝트를 설정하고 가동하여 주십시오.</p>
                    </div>
                  ) : (
                    projects.map((proj) => {
                      const isActive = (proj.id || "proj_default") === activeProjectId;
                      const stats = getProjectStats(proj.id || "proj_default");

                      return (
                        <div
                          key={proj.id || "proj_default"}
                          className={`p-6 rounded-2xl border transition-all duration-300 bg-white relative overflow-hidden ${
                            isActive
                              ? "border-indigo-400 shadow-md ring-2 ring-indigo-50"
                              : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
                          }`}
                        >
                          {isActive && (
                            <div className="absolute top-0 right-0">
                              <span className="bg-gradient-to-l from-indigo-600 to-indigo-500 text-white font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-4 rounded-bl-xl shadow-sm flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>직전 가동 (Active)</span>
                              </span>
                            </div>
                          )}

                          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                            <div className="space-y-2 max-w-lg">
                              <div className="flex items-center gap-2">
                                {isActive && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />}
                                <h5 className="font-extrabold text-slate-900 text-base leading-snug break-all">
                                  {proj.title}
                                </h5>
                              </div>
                              <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs text-slate-500 font-semibold mt-1">
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                  PM: {proj.pm || "미지정"}
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="flex items-center gap-1 bg-slate-50 text-slate-600 px-2.5 py-0.5 rounded-md font-medium">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {proj.startDate} ~ {proj.endDate}
                                </span>
                                {proj.password && (
                                  <>
                                    <span className="text-slate-300">|</span>
                                    {isProjectUnlocked(proj.id) ? (
                                      <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold border border-emerald-100">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                        🔓 편집허용 (해제됨)
                                      </span>
                                    ) : (
                                      <button 
                                        onClick={() => checkUnlockAndRun(proj.id, () => {
                                          showToast("🔓 프로젝트의 편집 권한을 확보했습니다.");
                                        })}
                                        className="bg-amber-50 text-amber-700 hover:bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1 font-extrabold border border-amber-200 cursor-pointer transition-all text-xs"
                                        title="비밀번호 입력 후 편집 차단 해제"
                                      >
                                        <span>🔒 편집제한 (잠금해제 대기)</span>
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2 md:mt-0 flex-shrink-0">
                              <button
                                onClick={() => {
                                  checkUnlockAndRun(proj.id || "proj_default", () => {
                                    selectProject(proj.id || "proj_default");
                                  });
                                }}
                                className="px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.01] inline-flex items-center gap-1.5"
                              >
                                <Zap className="w-3.5 h-3.5" />
                                <span>상세 계획 관리 진입 →</span>
                              </button>

                              {/* 관리자 비밀번호 초기화 버튼 */}
                              {proj.password && (
                                <button
                                  onClick={() => {
                                    const adminPw = prompt("🤫 관리자 비밀번호를 입력해주세요:");
                                    if (adminPw === null) return;
                                    if (adminPw === "7155") {
                                      setProjects(prev => prev.map(p => p.id === proj.id ? { ...p, password: undefined } : p));
                                      const pKey = proj.id === "proj_default" ? "hb_project" : `hb_project_${proj.id}`;
                                      const savedPObj = localStorage.getItem(pKey);
                                      if (savedPObj) {
                                        try {
                                          const parsed = JSON.parse(savedPObj);
                                          parsed.password = undefined;
                                          localStorage.setItem(pKey, JSON.stringify(parsed));
                                        } catch (e) {}
                                      }
                                      if (activeProjectId === proj.id) {
                                        setProject(prev => ({ ...prev, password: undefined }));
                                      }
                                      setUnlockedProjects(prev => ({ ...prev, [proj.id || ""]: true }));
                                      showToast("🔓 관리자 권한으로 프로젝트 비밀번호가 초기화되었습니다!");
                                    } else {
                                      alert("❌ 관리자 비밀번호가 올바르지 않습니다. (7155)");
                                    }
                                  }}
                                  className="p-2.5 bg-white text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-100 border-slate-200 rounded-xl text-xs font-bold transition-all border shadow-sm inline-flex items-center justify-center cursor-pointer"
                                  title="관리자 권한 비밀번호 초기화 (7155)"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              )}

                              {/* 삭제 버튼 - 휴지통 전직 */}
                              <button
                                onClick={() => {
                                  checkUnlockAndRun(proj.id || "proj_default", () => {
                                    if (confirm(`🚨 [프로젝트 삭제 확인]\n정말 '${proj.title}' 프로젝트를 삭제하시겠습니까?\n\n삭제된 프로젝트와 세부 기획 일정, 마일스톤, 위험 레지스터 정보는 아래 '보관 폴더 휴지통' 구역으로 전송되어 언제든지 손실 없이 완벽 복구하실 수 있습니다.`)) {
                                      handleDeleteProject(proj.id || "proj_default");
                                    }
                                  });
                                }}
                                className="p-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm inline-flex items-center justify-center bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 border-slate-200 cursor-pointer"
                                title="프로젝트를 임시 삭제 후 휴지통에 보관"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* 하단 요약 메트릭 컴포넌트 */}
                          <div className="grid grid-cols-4 gap-3 mt-5 bg-slate-50/70 p-4 rounded-xl border border-slate-100/80">
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">프로젝트 순기</span>
                              <span className="text-xs font-extrabold text-slate-600">{stats.phCount}개 단계</span>
                            </div>
                            <div className="border-l border-slate-200/60 pl-3">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">세부 테스크</span>
                              <span className="text-sm font-extrabold text-indigo-600">{stats.tCount}개 작업</span>
                            </div>
                            <div className="border-l border-slate-200/60 pl-3">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">마일스톤</span>
                              <span className="text-sm font-extrabold text-emerald-600">{stats.mCount}개 수립</span>
                            </div>
                            <div className="border-l border-slate-200/60 pl-3">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">위험 관리</span>
                              <span className="text-sm font-extrabold text-amber-600">{stats.rCount}건 포착</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* 하단 섹션: ♻️ 프로젝트 영구 보관용 휴지통 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
                    <Trash2 className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">보관 폴더 휴지통 (Recycle Bin)</h4>
                    <p className="text-[11px] text-slate-400 font-semibold">실수로 지웠거나 만료된 프로젝트를 안전하게 격리 보관하고, 원클릭으로 모든 리액티브 일정 데이터를 복구합니다.</p>
                  </div>
                </div>
                <span className="bg-rose-50 text-rose-600 text-xs px-3 py-1 rounded-full font-extrabold">
                  보관 수량: {trashProjects.length}개
                </span>
              </div>

              {trashProjects.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
                  <span className="text-3xl mb-2">♻️</span>
                  <p className="text-sm font-semibold text-slate-500">현재 휴지통에 보존된 유실 데이터가 없습니다.</p>
                  <p className="text-xs text-slate-400 mt-1">삭제버튼을 눌러 정리한 대안 프로젝트가 이곳에 자원 소출 상태 그대로 보호 보관됩니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trashProjects.map((item) => (
                    <div key={item.id} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/60 flex flex-col justify-between hover:bg-slate-50 transition-all">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <h5 className="font-bold text-slate-800 text-sm line-clamp-1">{item.projectInfo.title}</h5>
                          <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-2 py-0.5 rounded-md flex-shrink-0">
                            {new Date(item.deletedAt).toLocaleString("ko-KR", { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} 지움
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400 font-medium">
                          <span>PM: <strong>{item.projectInfo.pm || "미지정"}</strong></span>
                          <span>|</span>
                          <span>일정: {item.projectInfo.startDate} ~ {item.projectInfo.endDate}</span>
                        </div>
                        <div className="mt-3 text-[11px] text-slate-500 font-semibold bg-white p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
                          <span>단계: <strong className="text-indigo-600">{item.phases?.length || 0}개</strong></span>
                          <span>태스크: <strong className="text-purple-600">{item.tasks?.length || 0}개</strong></span>
                          <span>마일스톤: <strong className="text-emerald-600">{item.milestones?.length || 0}개</strong></span>
                          <span>리스크: <strong className="text-amber-600">{item.risks?.length || 0}개</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-slate-200/50">
                        <button
                          onClick={() => handleRestoreProject(item.id)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>선택 복구하기</span>
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.id)}
                          className="px-3 py-1.5 bg-white text-rose-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 rounded-lg text-xs font-bold border border-rose-100 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>영구 삭제</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 토스트 및 모달 보정 렌더 */}
        <div className="absolute">
          {toast.show && (
            <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center space-x-3 text-xs font-bold animate-slideUp">
              <span className="text-indigo-400 text-sm">💡</span>
              <span className="tracking-wide">{toast.msg}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Otherwise, render internal project details workspaces (4 tabs)
  return (
    <div className="h-screen w-full flex overflow-hidden bg-white text-slate-800 font-sans antialiased">
      
      {/* 1. 사이드바 내비게이션 레일 */}
      <aside className="w-72 bg-white text-slate-800 flex flex-col flex-shrink-0 z-20 shadow-xl border-r border-slate-200/80">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-4">
          <div className="bg-gradient-to-tr from-indigo-600 to-indigo-400 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            {isEditMode ? (
              <div className="flex flex-col gap-1 w-44">
                <input
                  type="text"
                  value={logoTitle}
                  onChange={(e) => setLogoTitle(e.target.value)}
                  className="font-bold text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  placeholder="로고"
                />
                <input
                  type="text"
                  value={logoSub}
                  onChange={(e) => setLogoSub(e.target.value)}
                  className="text-[9px] text-indigo-600 font-semibold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  placeholder="로고 서브"
                />
              </div>
            ) : (
              <>
                <h1 className="font-bold text-lg tracking-tight text-slate-900 font-extrabold">{logoTitle}</h1>
                <p className="text-[10px] text-indigo-600 font-semibold tracking-widest uppercase">{logoSub}</p>
              </>
            )}
          </div>
        </div>

        {/* 내비게이션 바 */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {/* 포트폴리오 메인 복귀 버튼 */}
          <button
            onClick={() => {
              setActiveTab("projects");
              showToast("📂 프로젝트 선택 및 포트폴리오 메인으로 복귀했습니다.");
            }}
            className="w-full flex items-center justify-center space-x-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 py-3.5 px-4 rounded-xl text-xs font-extrabold transition-all mb-4 border border-slate-200/80 hover:border-indigo-100 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← 포트폴리오 선택 복귀</span>
          </button>

          <button onClick={() => setActiveTab("dashboard")} className={getNavClass("dashboard")}>
            <ChartPie className="w-5 h-5" />
            {isEditMode ? (
              <input
                type="text"
                value={menuDashboard}
                onChange={(e) => setMenuDashboard(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-300 pointer-events-auto"
              />
            ) : (
              <span>{menuDashboard}</span>
            )}
          </button>
          <button onClick={() => setActiveTab("gantt")} className={getNavClass("gantt")}>
            <CalendarDays className="w-5 h-5" />
            {isEditMode ? (
              <input
                type="text"
                value={menuGantt}
                onChange={(e) => setMenuGantt(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-300 pointer-events-auto"
              />
            ) : (
              <span>{menuGantt}</span>
            )}
          </button>
          <button onClick={() => setActiveTab("milestones")} className={getNavClass("milestones")}>
            <Flag className="w-5 h-5" />
            {isEditMode ? (
              <input
                type="text"
                value={menuMilestones}
                onChange={(e) => setMenuMilestones(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-300 pointer-events-auto"
              />
            ) : (
              <span>{menuMilestones}</span>
            )}
          </button>
          <button onClick={() => setActiveTab("risks")} className={getNavClass("risks")}>
            <AlertTriangle className="w-5 h-5" />
            {isEditMode ? (
              <input
                type="text"
                value={menuRisks}
                onChange={(e) => setMenuRisks(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-300 pointer-events-auto"
              />
            ) : (
              <span>{menuRisks}</span>
            )}
          </button>
        </nav>

        {/* 푸터 마크다운 복사 */}
        <div className="p-5 bg-slate-50 border-t border-slate-200/60">
          <button
            onClick={handleExportWeeklyReport}
            className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 py-3 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer shadow-sm font-semibold"
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
                    checkUnlockAndRun(activeProjectId, () => {
                      setEditingProject({ ...project });
                      setActiveModal("projectSettings");
                    });
                  }}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                  title="프로젝트 스펙 변경"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>스펙 수정</span>
                </button>
                {project.password && (
                  isProjectUnlocked(activeProjectId) ? (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      편집 허용됨
                    </span>
                  ) : (
                    <button
                      onClick={() => checkUnlockAndRun(activeProjectId, () => {
                        showToast("🔓 프로젝트의 잠금이 해제되었습니다.");
                      })}
                      className="text-[10px] bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md font-extrabold flex items-center gap-1 cursor-pointer transition-all"
                      title="클릭하여 비밀번호 입력 및 해제"
                    >
                      <span>🔒 편집 잠김 (해제 필요)</span>
                    </button>
                  )
                )}
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                  목표일: <strong className="ml-1 text-slate-700">{project.endDate}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-semibold text-slate-500 flex items-center">
                  <User className="w-4 h-4 mr-1.5 text-slate-400" />
                  PM: <strong className="ml-1 text-slate-700">{project.pm}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-semibold text-slate-500 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1.5 text-indigo-500" />
                  기준시점: <strong className="ml-1 text-indigo-600">2026-05-28</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* ✏️ 편집 모드 전환 통합 토글 */}
            <button
              onClick={() => {
                const nextEditMode = !isEditMode;
                setIsEditMode(nextEditMode);
                showToast(nextEditMode ? "✏️ 편집 모드가 활성화되었습니다. 사이드바의 로고나 메뉴명을 클릭하여 수정하세요!" : "🔒 편집 모드가 비활성화되어, 수정 내용이 안전하게 저장되었습니다.");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border cursor-pointer ${
                isEditMode 
                  ? "bg-amber-500 border-amber-400 text-white hover:bg-amber-600 hover:scale-[1.01]" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{isEditMode ? "💾 편집완료 (저장)" : "✏️ 설명문/메뉴 편집개시"}</span>
            </button>

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
          </div>
        </header>

        {/* 탭 가변 뷰 스페이스 */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar font-sans">
          
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
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {/* 간트 차트 마일스톤 토글 옵션 */}
                  <label className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100/50 transition-all cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showMilestonesOnGantt}
                      onChange={(e) => setShowMilestonesOnGantt(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <Flag className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>마일스톤 동시 표시</span>
                  </label>

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
                            <div key={task.id} className="pl-8 pr-4 h-[68px] bg-slate-50/20 hover:bg-slate-50/70 flex justify-between items-center border-b border-slate-100/60 group transition-all">
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
                  <div className="min-w-[800px] flex flex-col h-full relative">
                    
                    {/* 마일스톤 오버레이 시각화 가이드라인 */}
                    {(() => {
                      if (!showMilestonesOnGantt) return null;

                      const projStart = new Date(project.startDate).getTime();
                      const projEnd = new Date(project.endDate).getTime();
                      const totalSpan = projEnd - projStart;

                      const positionedMilestones = milestones.map(m => {
                        const milestoneTime = new Date(m.targetDate).getTime();
                        let leftPercent = totalSpan > 0 ? ((milestoneTime - projStart) / totalSpan) * 100 : 0;
                        if (leftPercent < 0) leftPercent = 0;
                        if (leftPercent > 100) leftPercent = 100;
                        return { ...m, leftPercent };
                      }).sort((a, b) => a.leftPercent - b.leftPercent);

                      // 가로 겹침 방지 (스태거링) 레벨 연산
                      const levels: number[] = [];
                      const minSpacing = 12; // 겹침 판정 기준 간격 (12%)

                      const milestonesWithLevels = positionedMilestones.map(m => {
                        let level = 0;
                        for (let lvl = 0; lvl < 10; lvl++) {
                          if (levels[lvl] === undefined || m.leftPercent - levels[lvl] >= minSpacing) {
                            level = lvl;
                            levels[lvl] = m.leftPercent;
                            break;
                          }
                        }
                        return { ...m, level };
                      });

                      return milestonesWithLevels.map(m => {
                        const isDone = m.status === "완료";
                        const isWorking = m.status === "진행";
                        const iconColor = isDone ? "text-slate-400" : isWorking ? "text-indigo-600" : "text-amber-500";
                        const badgeBg = isDone 
                          ? "bg-slate-50/95 text-slate-500 border-slate-300" 
                          : isWorking 
                          ? "bg-indigo-50/95 text-indigo-700 border-indigo-200 ring-1 ring-indigo-100" 
                          : "bg-amber-50/95 text-amber-750 border-amber-200";

                        // 겹치는 이정표인 경우 레벨에 따라 세로 top 값을 다르게 엇갈림 배치합니다 (헤더 아래 54px 기준, 36px씩 스태거)
                        const topPosition = 54 + (m.level * 36);

                        return (
                          <div
                            key={m.id}
                            className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center z-20"
                            style={{ left: `${m.leftPercent}%` }}
                          >
                            {/* 가이드 수직 점선 */}
                            <div className="w-0 border-l border-dashed border-indigo-500/20 h-full absolute top-0 pointer-events-none"></div>
                            
                            {/* 귀여운 이정표 핀 뱃지 */}
                            <div 
                              className={`pointer-events-auto absolute -translate-x-1/2 flex items-center space-x-1 px-2.5 py-1 rounded-full border shadow-sm ${badgeBg} text-[10px] font-black whitespace-nowrap cursor-help hover:scale-105 hover:z-30 transition-all duration-150`}
                              style={{ top: `${topPosition}px` }}
                              title={`${m.name} (${m.targetDate}) - 진행단계: ${m.status}`}
                            >
                              <Flag className={`w-3 h-3 ${iconColor} fill-current`} />
                              <span>{m.name}</span>
                              <span className="text-[9px] opacity-85 font-normal">({m.targetDate.substring(5)})</span>
                            </div>
                          </div>
                        );
                      });
                    })()}

                    {/* 월 헤더 가로선 */}
                    <div className="flex border-b border-slate-200 sticky top-0 bg-white z-10 shadow-sm">
                      {getGanttMonths().map((month, idx) => (
                        <div key={idx} className="flex-1 py-4 text-center text-xs font-bold text-slate-500 border-r border-slate-100">
                          {month.getMonth() + 1}월
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
                                <div key={task.id} className="h-[68px] relative flex items-center border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                  {/* 타임라인 바 (도형) */}
                                  <div
                                    onClick={() => handleEditTask(task)}
                                    title={`${task.name} (${task.progress}% 완료)`}
                                    className={`absolute h-7 rounded-lg flex items-center justify-center px-2 text-[10px] font-extrabold text-white shadow-sm overflow-hidden transition-all duration-300 ${phaseColor.bar} cursor-pointer hover:opacity-90 max-w-full`}
                                    style={{
                                      left: `${barPlacement.left}%`,
                                      width: `${barPlacement.width}%`,
                                      top: '8px'
                                    }}
                                  >
                                    <div
                                      className="bg-white/20 absolute left-0 top-0 bottom-0 transition-all duration-700"
                                      style={{ width: `${task.progress}%` }}
                                    ></div>
                                    <span className="relative z-10 filter drop-shadow text-white font-extrabold">{task.progress}%</span>
                                  </div>

                                  {/* 도형 바로 아래 텍스트 (줄바꿈 없이 노출) */}
                                  <div
                                    onClick={() => handleEditTask(task)}
                                    className="absolute text-[11px] font-semibold text-slate-600 hover:text-indigo-600 cursor-pointer whitespace-nowrap z-10"
                                    style={{
                                      left: `${barPlacement.left}%`,
                                      top: '38px'
                                    }}
                                  >
                                    {task.name}
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
                <div className="min-w-[800px] relative h-36">
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
                          <span className="text-[10px] text-slate-500 font-extrabold mt-1.5 bg-white px-2.5 py-1 rounded-full border border-slate-100 shadow-sm whitespace-nowrap">
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

      {/* 0. 프로젝트 편집 보안 해제 모달 */}
      {activeModal === "projectUnlock" && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md overflow-hidden shadow-2xl animate-modalEntrance">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-amber-500" />
                <span>🔒 프로젝트 편집 제한 해제</span>
              </h3>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setUnlockCallback(null);
                }} 
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 font-sans">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed font-semibold">
                📁 대상 프로젝트명: <strong className="text-slate-800">
                  {projects.find(p => p.id === passwordTargetProjId)?.title || "지정 프로젝트"}
                </strong>
                <p className="mt-1.5 text-slate-500 font-medium">이 프로젝트는 개설 당시 비밀번호로 암호 보호되어 승인받지 않은 편집이 차단됩니다. 비밀번호를 정확히 기입하십시오.</p>
              </div>

              {!isShowingAdminFields ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">개설 비밀번호 입력</label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="프로젝트 생성 시 설정한 비밀번호"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const targetObj = projects.find(p => p.id === passwordTargetProjId);
                          if (targetObj && passwordInput === targetObj.password) {
                            setUnlockedProjects(prev => ({ ...prev, [passwordTargetProjId || ""]: true }));
                            setActiveModal(null);
                            showToast("🔓 프로젝트 잠금이 정상 해제되어 편집이 상시 허용되었습니다.");
                            if (unlockCallback) {
                              unlockCallback();
                              setUnlockCallback(null);
                            }
                          } else {
                            showToast("❌ 비밀번호가 올바르지 않습니다. 다시 입력해주세요.");
                          }
                        }
                      }}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        const targetObj = projects.find(p => p.id === passwordTargetProjId);
                        if (targetObj && passwordInput === targetObj.password) {
                          setUnlockedProjects(prev => ({ ...prev, [passwordTargetProjId || ""]: true }));
                          setActiveModal(null);
                          showToast("🔓 프로젝트 잠금이 정상 해제되어 편집이 상시 허용되었습니다.");
                          if (unlockCallback) {
                            unlockCallback();
                            setUnlockCallback(null);
                          }
                        } else {
                          showToast("❌ 비밀번호가 올바르지 않습니다. 다시 입력해주세요.");
                        }
                      }}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                    >
                      잠금 해제 (Unlock)
                    </button>
                    <button
                      onClick={() => {
                        setIsShowingAdminFields(true);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer"
                    >
                      비밀번호 분실 시 (관리자)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 border-t border-dashed border-slate-200 pt-4">
                  <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg text-rose-800 text-[11px] font-semibold leading-relaxed">
                    ⚙️ <strong>관리자 비밀번호 초기화 콘솔</strong><br/>
                    프로젝트의 기존 편집 비밀번호를 온전하게 강제 초기화(제거)할 수 있습니다. 관리자 마스터 패스워드를 인가해 주십시오.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">관리자 마스터 비밀번호 입력</label>
                    <input
                      type="password"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="관리자 전용 비밀번호(7155)"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-500 transition-all font-medium text-slate-800 placeholder-slate-400 animate-slideUp"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (adminPasswordInput === "7155") {
                          // 1. projects 에 비밀번호 완전 파기
                          setProjects(prev => prev.map(p => p.id === passwordTargetProjId ? { ...p, password: undefined } : p));
                          
                          // 2. localStorage 보존 레코드에서도 명기 초기화
                          const pKey = passwordTargetProjId === "proj_default" ? "hb_project" : `hb_project_${passwordTargetProjId}`;
                          const savedPObj = localStorage.getItem(pKey);
                          if (savedPObj) {
                            try {
                              const parsed = JSON.parse(savedPObj);
                              parsed.password = undefined;
                              localStorage.setItem(pKey, JSON.stringify(parsed));
                            } catch (e) {}
                          }

                          // 3. activeProject가 대상인 경우
                          if (activeProjectId === passwordTargetProjId) {
                            setProject(prev => ({ ...prev, password: undefined }));
                          }

                          // 4. 세션 즉각 잠금해제 적용
                          setUnlockedProjects(prev => ({ ...prev, [passwordTargetProjId || ""]: true }));

                          setActiveModal(null);
                          showToast("🔓 관리자 권한으로 프로젝트 비밀번호가 완벽 초기화 및 잠금해제 되었습니다.");
                          
                          if (unlockCallback) {
                            unlockCallback();
                            setUnlockCallback(null);
                          }
                        } else {
                          showToast("❌ 관리자 마스터 비밀번호 정보가 정확하지 않습니다.");
                        }
                      }}
                      className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-xl py-2.5 text-xs font-bold transition-all shadow-md shadow-rose-600/10 cursor-pointer"
                    >
                      초기화 및 강제 해제
                    </button>
                    <button
                      onClick={() => {
                        setIsShowingAdminFields(false);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer"
                    >
                      이전으로
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                <label className="block text-xs font-bold text-slate-500 mb-2">테마 색상 매핑 (30가지 풍부한 스펙트럼)</label>
                <div className="grid grid-cols-10 gap-2 p-3 border border-slate-100/90 rounded-xl bg-slate-50/50 max-h-[160px] overflow-y-auto">
                  {PHASE_COLORS.map(col => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setEditingPhase({ ...editingPhase, color: col.id })}
                      className={`w-7 h-7 rounded-full shadow-sm cursor-pointer border-2 transition-all hover:scale-110 active:scale-95 duration-150 ${
                        editingPhase.color === col.id ? "border-slate-800 scale-110 ring-2 ring-indigo-500/30" : "border-white/50"
                      } ${col.bgClass}`}
                      title={col.name}
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
