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
  RotateCcw,
  Lock,
  Unlock,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  Image,
  Upload,
  Camera,
  GripVertical
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
  { id: "t3", phaseId: "p2", name: "DB 모델링 / 메인 서버 하드웨어 장비 발주", startDate: "2026-07-01", endDate: "2026-07-15", progress: 80, owner: "이아키", hasOrder: true, orderLeadTime: 3 },
  { id: "t4", phaseId: "p2", name: "API 스펙 문서 작성 및 상용 솔루션 라이선스 발주", startDate: "2026-07-10", endDate: "2026-07-25", progress: 60, owner: "강서버", hasOrder: true, orderLeadTime: 2 },
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
  // --- 로그인 상태 관리 및 크리덴셜 통제 ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem("hb_logged_in") === "true";
  });
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (lockoutTimeRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTimeRemaining]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimeRemaining > 0) {
      setLoginError(`보안 정책에 의해 일시 잠금되었습니다. ${lockoutTimeRemaining}초 후에 다시 시도해주세요.`);
      return;
    }

    if (usernameInput === "dnsae" && passwordInput === "ae7155") {
      sessionStorage.setItem("hb_logged_in", "true");
      setIsLoggedIn(true);
      setLoginError("");
      setFailedAttempts(0);
      showToast("🔐 인증이 정상 조율되어 통합 제어반으로 진입합니다.");
    } else {
      const nextFailCount = failedAttempts + 1;
      setFailedAttempts(nextFailCount);
      if (nextFailCount >= 5) {
        setLockoutTimeRemaining(30);
        setLoginError("보안 정책: 5회 연속 로그인 실패로 인해 계정 진입이 30초 동안 잠금 조치되었습니다.");
      } else {
        setLoginError(`입력하신 아이디 또는 비밀번호가 올바르지 않습니다. (오류 횟수: ${nextFailCount}/5)`);
      }
    }
  };

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
  const [showOrderLeadTimeOnGantt, setShowOrderLeadTimeOnGantt] = useState<boolean>(true);
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: "" });
  
  // --- 간트 차트 뷰 모드 제어 상태 ("grid" = 행 완벽 정렬 뷰, "split" = 분리형 스크롤 뷰) ---
  const [ganttViewMode, setGanttViewMode] = useState<"grid" | "split">("grid");

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

  // 모달 제어용 상태
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // --- 스크린샷 캡처용 깔끔한 보기(클린 뷰) 및 검색·필터링 상태 ---
  const [isCleanView, setIsCleanView] = useState<boolean>(false);
  const [filterOwner, setFilterOwner] = useState<string>("All");
  const [filterProgress, setFilterProgress] = useState<string>("All"); // All, Completed, Ongoing, NotStarted
  const [filterHasOrder, setFilterHasOrder] = useState<string>("All"); // All, Yes, No
  const [searchQuery, setSearchQuery] = useState<string>("");

  // --- 드래그 앤 드롭을 통한 태스크 및 구분 단계(Phase) 순서 제어 상태 ---
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [draggedPhaseId, setDraggedPhaseId] = useState<string | null>(null);
  const [dragOverPhaseId, setDragOverPhaseId] = useState<string | null>(null);

  // 필터가 가미된 연동 고유 담당자 리스트 자동 추출
  const allTaskOwners = Array.from(new Set(tasks.map(t => t.owner).filter(Boolean)));

  // 필터가 반영된 디테일 태스크 목록 산출 헬퍼 함수
  const getFilteredTasks = (taskList: Task[] = tasks) => {
    return taskList.filter((task) => {
      // 1. 담당자 필터
      if (filterOwner !== "All" && task.owner !== filterOwner) return false;
      
      // 2. 발주품 연계 여부 필터
      if (filterHasOrder === "Yes" && !task.hasOrder) return false;
      if (filterHasOrder === "No" && task.hasOrder) return false;
      
      // 3. 진척율 필터
      if (filterProgress === "Completed" && task.progress !== 100) return false;
      if (filterProgress === "Ongoing" && (task.progress === 0 || task.progress === 100)) return false;
      if (filterProgress === "NotStarted" && task.progress !== 0) return false;
      
      // 4. 업무 타이틀 및 메모 퀵 검색 매칭
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const nameMatch = task.name.toLowerCase().includes(query);
        const ownerMatch = task.owner ? task.owner.toLowerCase().includes(query) : false;
        const memoMatch = task.memo ? task.memo.toLowerCase().includes(query) : false;
        if (!nameMatch && !ownerMatch && !memoMatch) return false;
      }
      
      return true;
    });
  };

  // 현재 활성화 및 편집 중인 객체 백업 상태
  const [editingProject, setEditingProject] = useState<ProjectInfo>({ ...project });
  const [editingPhase, setEditingPhase] = useState<Partial<Phase>>({});
  const [editingTask, setEditingTask] = useState<Partial<Task>>({});
  const [editingMilestone, setEditingMilestone] = useState<Partial<Milestone>>({});
  const [quickMilestone, setQuickMilestone] = useState<{ id: string; name: string; status: '완료' | '진행' | '예정'; progress: number } | null>(null);
  const [editingRisk, setEditingRisk] = useState<Partial<Risk>>({});
  const [activePreviewImageUrl, setActivePreviewImageUrl] = useState<string | null>(null);
  const [quickMemoTaskId, setQuickMemoTaskId] = useState<string | null>(null);
  const [quickMemoText, setQuickMemoText] = useState<string>("");

  // 시스템 기준 날짜 (현재 local time: 2026-05-28)
  const todayStr = "2026-05-28";

  // 프로젝트별 자동 보존 및 상호 매핑 정책
  useEffect(() => {
    const key = activeProjectId === "proj_default" ? "hb_project" : `hb_project_${activeProjectId}`;
    localStorage.setItem(key, JSON.stringify(project));
    
    // projects 리스트 내부 필드 상태도 동기화해둡니다.
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, title: project.title, pm: project.pm, startDate: project.startDate, endDate: project.endDate } : p));
  }, [project, activeProjectId]);

  useEffect(() => {
    const key = activeProjectId === "proj_default" ? "hb_phases" : `hb_project_${activeProjectId}_phases`;
    localStorage.setItem(key, JSON.stringify(phases));
  }, [phases, activeProjectId]);

  useEffect(() => {
    const key = activeProjectId === "proj_default" ? "hb_tasks" : `hb_project_${activeProjectId}_tasks`;
    localStorage.setItem(key, JSON.stringify(tasks));
  }, [tasks, activeProjectId]);

  useEffect(() => {
    const key = activeProjectId === "proj_default" ? "hb_milestones" : `hb_project_${activeProjectId}_milestones`;
    localStorage.setItem(key, JSON.stringify(milestones));
  }, [milestones, activeProjectId]);

  useEffect(() => {
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

  // --- 발주품 예상 납기(리드타임) 연장 바 폭 계산 엔진 ---
  const getDeliveryDate = (endDateStr: string, leadTimeMonths: number) => {
    try {
      const d = new Date(endDateStr);
      if (!isNaN(d.getTime())) {
        d.setMonth(d.getMonth() + leadTimeMonths);
        return d.toISOString().split("T")[0];
      }
    } catch (e) {}
    return endDateStr;
  };

  const getLeadTimeWidthPercent = (endDateStr: string, leadTimeMonths: number) => {
    const projStart = new Date(project.startDate).getTime();
    const projEnd = new Date(project.endDate).getTime();
    const totalDuration = projEnd - projStart;
    if (totalDuration <= 0) return 0;

    const taskEnd = new Date(endDateStr);
    const leadEnd = new Date(taskEnd);
    leadEnd.setMonth(leadEnd.getMonth() + leadTimeMonths);
    
    const taskEndTime = taskEnd.getTime();
    let leadEndTime = leadEnd.getTime();
    if (leadEndTime > projEnd) leadEndTime = projEnd; // 프로젝트 만료 기한 클리핑

    const leadSpan = leadEndTime - taskEndTime;
    if (leadSpan <= 0) return 0;

    return (leadSpan / totalDuration) * 100;
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

  const getTaskMilestones = (task: Task) => {
    if (!showMilestonesOnGantt) return [];
    return milestones.filter(m => {
      let bestTask = tasks.find(t => t.endDate === m.targetDate);
      if (!bestTask) {
        bestTask = tasks.find(t => t.startDate <= m.targetDate && t.endDate >= m.targetDate);
      }
      if (!bestTask && tasks.length > 0) {
        const mTime = new Date(m.targetDate).getTime();
        let minDiff = Infinity;
        let closest = tasks[0];
        for (const t of tasks) {
          const tEnd = new Date(t.endDate).getTime();
          const diff = Math.abs(tEnd - mTime);
          if (diff < minDiff) {
            minDiff = diff;
            closest = t;
          }
        }
        bestTask = closest;
      }
      return bestTask && bestTask.id === task.id;
    });
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

  const getDaysInMonthDateArray = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const days: number[] = [];
    for (let i = 1; i <= numDays; i++) {
      days.push(i);
    }
    return days;
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

  const handleCreateProject = (title: string, pm: string, startDate: string, endDate: string) => {
    if (!title || !startDate || !endDate) {
      showToast("⚠️ 필수 요소를 모두 정확하게 기입해주세요.");
      return;
    }
    const newId = `proj_${Date.now()}`;
    const newProj: ProjectInfo = { id: newId, title, pm: pm || "담당 PM", startDate, endDate };
    
    const updatedList = [...projects, newProj];
    setProjects(updatedList);
    localStorage.setItem("hb_projects_list", JSON.stringify(updatedList));

    // 전환
    selectProject(newId);
    showToast("✨ 새로운 스펙의 프로젝트가 생성 및 활성화되었습니다.");
  };

  const handleDeleteProject = (pId: string) => {
    if (projects.length <= 1) {
      showToast("⚠️ 최소 한 개 이상의 메인 프로젝트가 존재해야 하므로 삭제할 수 없습니다.");
      return;
    }

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

  // --- 드래그 앤 드롭을 이용한 세부 업무 순서 정렬 및 단계 이동 처리 ---
  const handleTaskDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleTaskDragOver = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    if (draggedTaskId !== taskId) {
      setDragOverTaskId(taskId);
    }
  };

  const handleTaskDragLeave = () => {
    setDragOverTaskId(null);
  };

  const handleTaskDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const handleTaskDrop = (e: React.DragEvent, targetTaskId: string, targetPhaseId: string) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      setDraggedTaskId(null);
      setDragOverTaskId(null);
      return;
    }

    const nextTasks = [...tasks];
    const dragIdx = nextTasks.findIndex(t => t.id === draggedTaskId);
    const targetIdx = nextTasks.findIndex(t => t.id === targetTaskId);

    if (dragIdx > -1 && targetIdx > -1) {
      const dragTask = { ...nextTasks[dragIdx] };
      // 만약 타겟 구분단계(페이즈)가 바뀌었다면 페이즈 소속도 갱신
      if (dragTask.phaseId !== targetPhaseId) {
        dragTask.phaseId = targetPhaseId;
      }
      
      // 기존 위치 삭제
      nextTasks.splice(dragIdx, 1);
      
      // 제거 후 타겟 위치 기준 신규 인덱스 추출 및 삽입
      const finalTargetIdx = nextTasks.findIndex(t => t.id === targetTaskId);
      if (finalTargetIdx > -1) {
        nextTasks.splice(finalTargetIdx, 0, dragTask);
      } else {
        // 배열 끝 또는 오차 발생시
        nextTasks.push(dragTask);
      }

      setTasks(nextTasks);
      showToast("↕️ 드래그 앤 드롭으로 세부 업무 순서를 변경하였습니다.");
    }

    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const handlePhaseDragStart = (e: React.DragEvent, phaseId: string) => {
    setDraggedPhaseId(phaseId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handlePhaseDragEnd = () => {
    setDraggedPhaseId(null);
    setDragOverPhaseId(null);
  };

  const handlePhaseDragOver = (e: React.DragEvent, phaseId: string) => {
    e.preventDefault();
    if (draggedPhaseId && draggedPhaseId !== phaseId) {
      setDragOverPhaseId(phaseId);
    }
  };

  const handlePhaseDragLeave = () => {
    setDragOverPhaseId(null);
  };

  const handlePhaseDrop = (e: React.DragEvent, targetPhaseId: string) => {
    e.preventDefault();
    
    // 1. 만약 태스크를 드래그 중인 경우 (세부 업무의 단계 이동)
    if (draggedTaskId) {
      const nextTasks = [...tasks];
      const dragIdx = nextTasks.findIndex(t => t.id === draggedTaskId);
      if (dragIdx > -1) {
        const dragTask = { ...nextTasks[dragIdx] };
        
        if (dragTask.phaseId !== targetPhaseId) {
          dragTask.phaseId = targetPhaseId;
          nextTasks.splice(dragIdx, 1);
          nextTasks.push(dragTask); // 해당 단계 최하단으로 정비
          setTasks(nextTasks);
          const pName = phases.find(ph => ph.id === targetPhaseId)?.name || "";
          showToast(`📂 선택한 세부 업무가 [${pName}] 단계의 하단으로 이동되었습니다.`);
        }
      }
    }
    // 2. 만약 단계를 드래그 중인 경우 (구분 단계의 순서 변경)
    else if (draggedPhaseId) {
      if (draggedPhaseId === targetPhaseId) {
        setDraggedPhaseId(null);
        setDragOverPhaseId(null);
        return;
      }

      const nextPhases = [...phases];
      const dragIdx = nextPhases.findIndex(p => p.id === draggedPhaseId);
      const targetIdx = nextPhases.findIndex(p => p.id === targetPhaseId);

      if (dragIdx > -1 && targetIdx > -1) {
        const dragPhase = nextPhases[dragIdx];
        nextPhases.splice(dragIdx, 1);
        
        const finalTargetIdx = nextPhases.findIndex(p => p.id === targetPhaseId);
        if (finalTargetIdx > -1) {
          nextPhases.splice(finalTargetIdx, 0, dragPhase);
        } else {
          nextPhases.push(dragPhase);
        }

        setPhases(nextPhases);
        showToast("↕️ 드래그 앤 드롭으로 구분 단계(Phase) 순서를 변경하였습니다.");
      }
    }

    setDraggedTaskId(null);
    setDragOverTaskId(null);
    setDraggedPhaseId(null);
    setDragOverPhaseId(null);
  };

  const handleSaveQuickMemo = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, memo: quickMemoText } : t));
    setQuickMemoTaskId(null);
    setQuickMemoText("");
    showToast("📝 간단 자필 메모 항목이 즉각 업데이트되었습니다.");
  };

  const handleQuickImageUpload = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, imageUrl: reader.result as string } : t));
        showToast("📸 업로드하신 참고 사진이 등록되었습니다.");
      };
      reader.readAsDataURL(file);
    }
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 font-sans antialiased relative overflow-hidden">
        {/* Ambient artistic background blobs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-100/40 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-45 -right-45 w-96 h-96 rounded-full bg-rose-100/30 blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-8 md:p-10 relative z-10 transition-all duration-300">
          <div className="flex flex-col mb-8 text-center items-center">
            {/* Logo Emblem */}
            <div className="bg-gradient-to-tr from-indigo-600 to-indigo-400 p-3.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20 mb-5">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            
            <h1 id="dns-ae-nad-board-title" className="text-2xl font-black text-slate-900 tracking-tight">DNS AE NAD BOARD</h1>
            <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-1.5">통합 포트폴리오 안전 통제반</p>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-xs mt-3.5">
              위험 지표 연동형 마인드맵 및 프로젝트 헬스케어의 원활한 종합 모니터링을 관장합니다. 시스템 보호를 위한 시큐어 크리덴셜 로그인이 필요합니다.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">클라이언트 아이디</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="아이디를 입력하세요"
                  disabled={lockoutTimeRemaining > 0}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 placeholder-slate-400 font-medium transition-all text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">패스코드 (비밀번호)</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  disabled={lockoutTimeRemaining > 0}
                  className="w-full pl-4 pr-11 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 placeholder-slate-400 font-medium transition-all text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={lockoutTimeRemaining > 0}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer disabled:cursor-not-allowed"
                  title={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="text-xs flex items-center space-x-2.5 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={lockoutTimeRemaining > 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white py-3.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-indigo-600/20 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
            >
              <LogIn className="w-4 h-4" />
              <span>로그인 및 제어반 진입</span>
            </button>
          </form>

          <div className="text-[10px] text-slate-400 text-center font-bold tracking-widest uppercase mt-8 pt-4 border-t border-slate-100">
            HealthBoard Port &copy; 2026 Admin Panel
          </div>
        </div>
      </div>
    );
  }

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

            <button
              onClick={() => {
                sessionStorage.removeItem("hb_logged_in");
                setIsLoggedIn(false);
                showToast("🔒 성공적으로 로그아웃되었습니다.");
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="로그아웃"
            >
              <LogIn className="w-3.5 h-3.5 rotate-180" />
              <span>로그아웃</span>
            </button>
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
                    handleCreateProject(newProjTitle, newProjPm, newProjStartDate, newProjEndDate);
                    setNewProjTitle("");
                    setNewProjPm("");
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
                  {projects.map((proj) => {
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
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-2 md:mt-0 flex-shrink-0">
                            <button
                              onClick={() => selectProject(proj.id || "proj_default")}
                              className="px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.01] inline-flex items-center gap-1.5"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>상세 계획 관리 진입 →</span>
                            </button>

                            {/* 삭제 버튼 - 휴지통 전직 */}
                            <button
                              onClick={() => {
                                if (confirm(`🚨 [프로젝트 삭제 확인]\n정말 '${proj.title}' 프로젝트를 삭제하시겠습니까?\n\n삭제된 프로젝트와 세부 기획 일정, 마일스톤, 위험 레지스터 정보는 아래 '보관 폴더 휴지통' 구역으로 전송되어 언제든지 손실 없이 완벽 복구하실 수 있습니다.`)) {
                                  handleDeleteProject(proj.id || "proj_default");
                                }
                              }}
                              disabled={projects.length <= 1}
                              className={`p-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm inline-flex items-center justify-center ${
                                projects.length <= 1
                                  ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                                  : "bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 border-slate-200 cursor-pointer"
                              }`}
                              title={projects.length <= 1 ? "최소 하나의 프로젝트 가동이 필요하여 삭제할 수 없습니다" : "프로젝트를 임시 삭제 후 휴지통에 보관"}
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
                  })}
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
      <aside className={`w-72 bg-white text-slate-800 flex flex-col flex-shrink-0 z-20 shadow-xl border-r border-slate-200/80 transition-all duration-300 ${isCleanView ? "hidden" : ""}`}>
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
        <header className={`border-b border-slate-200 px-8 ${isCleanView ? "py-3.5 bg-slate-50/70" : "py-5 bg-white"} flex justify-between items-center flex-shrink-0 shadow-sm z-10 transition-all duration-200`}>
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <span>{project.title}</span>
                  {isCleanView && (
                    <span className="text-[10px] bg-indigo-600 text-white rounded px-2 py-0.5 font-bold uppercase tracking-widest block shrink-0 animate-pulse">
                      📸 캡처 정돈 뷰
                    </span>
                  )}
                </h2>
                {!isCleanView && (
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
            {/* 📸 스크린샷 캡처용 깔끔한 보기 토글 */}
            <button
              onClick={() => {
                const nextClean = !isCleanView;
                setIsCleanView(nextClean);
                if (nextClean) {
                  showToast("📸 스크린샷 전용 정돈 모드가 적용되었습니다. 사이드바와 편집 단추들이 깔끔하게 정리됩니다.");
                } else {
                  showToast("🔄 일반 조작 및 양방향 편집 관리 모드로 복귀했습니다.");
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border cursor-pointer ${
                isCleanView 
                  ? "bg-slate-900 border-slate-800 text-white hover:bg-slate-800 hover:scale-[1.01]" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100"
              }`}
              title="스크린샷 촬영을 위한 클린 뷰 전환"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isCleanView ? "📸 일반 관리 뷰" : "📸 캡처 정돈 뷰"}</span>
            </button>

            {/* ✏️ 편집 모드 전환 통합 토글 - 클린 뷰일 때 숨김 */}
            {!isCleanView && (
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
            )}

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

            {/* 로그아웃 버튼 - 클린 뷰 일 때 숨김 */}
            {!isCleanView && (
              <button
                onClick={() => {
                  sessionStorage.removeItem("hb_logged_in");
                  setIsLoggedIn(false);
                  showToast("🔒 성공적으로 로그아웃되었습니다.");
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="로그아웃"
              >
                <LogIn className="w-3.5 h-3.5 rotate-180" />
                <span>로그아웃</span>
              </button>
            )}
          </div>
        </header>

        {/* 글로벌 조건 필터 및 실시간 캡처용 조율 패널 */}
        <div className="bg-slate-50 border-b border-slate-200 px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 transition-all">
          {isCleanView ? (
            // 클린뷰 작동 중일 때의 인쇄/캡처 최적화 요약 필터 배지
            <div className="flex items-center space-x-2.5 text-xs font-semibold text-slate-500 py-1">
              <span className="flex items-center gap-1 bg-indigo-50 border border-indigo-100/80 px-2.5 py-1 rounded-full text-[10px] text-indigo-700">
                <ShieldCheck className="w-3 h-3 text-indigo-500" />
                <strong>📸 캡처 전용 정돈 모드 활성 중 (사이드바 및 수정 도구 미출력)</strong>
              </span>
              {(filterOwner !== "All" || filterProgress !== "All" || filterHasOrder !== "All" || searchQuery.trim() !== "") ? (
                <span className="flex items-center gap-1 bg-amber-50 border border-amber-100/80 px-2.5 py-1 rounded-full text-[10px] text-amber-700">
                  <span>지정 필터 가동 중: </span>
                  {filterOwner !== "All" && <span className="font-extrabold font-mono">[{filterOwner}]</span>}
                  {filterProgress !== "All" && <span className="font-extrabold font-mono">[{filterProgress === "Completed" ? "완료" : filterProgress === "Ongoing" ? "진행중" : "미시작"}]</span>}
                  {filterHasOrder !== "All" && <span className="font-extrabold font-mono">[{filterHasOrder === "Yes" ? "발주품연관" : "발주품없음"}]</span>}
                  {searchQuery.trim() !== "" && <span className="font-extrabold font-mono">['{searchQuery}']</span>}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-medium">전체 데이터 투명 표출 상태</span>
              )}
            </div>
          ) : (
            // 일반 관리 중일 때 조작 가능한 친절하고 강력한 필터 정렬판
            <div className="flex flex-wrap items-center gap-3 w-full">
              <div className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-700 mr-2 shrink-0">
                <ChartPie className="w-4 h-4 text-indigo-500" />
                <span>데이터 필터 대시보드 :</span>
              </div>
              
              {/* 1. 담당자 필터 */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-400 font-black uppercase">담당자</span>
                <select
                  value={filterOwner}
                  onChange={(e) => setFilterOwner(e.target.value)}
                  className="bg-white border border-slate-200 hover:border-slate-350 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-300 cursor-pointer font-bold font-mono transition-all"
                >
                  <option value="All">전체 (All)</option>
                  {allTaskOwners.map(owner => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>
              </div>

              {/* 2. 진척도 필터 */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-400 font-black uppercase">진척도</span>
                <select
                  value={filterProgress}
                  onChange={(e) => setFilterProgress(e.target.value)}
                  className="bg-white border border-slate-200 hover:border-slate-350 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-300 cursor-pointer font-bold transition-all"
                >
                  <option value="All">진척 전체 (All)</option>
                  <option value="Completed">완료업무 (100%)</option>
                  <option value="Ongoing">진행업무 (1~99%)</option>
                  <option value="NotStarted">미시작업무 (0%)</option>
                </select>
              </div>

              {/* 3. 연동 발주품 필터 */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-400 font-black uppercase">연동발주</span>
                <select
                  value={filterHasOrder}
                  onChange={(e) => setFilterHasOrder(e.target.value)}
                  className="bg-white border border-slate-200 hover:border-slate-350 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-300 cursor-pointer font-bold transition-all"
                >
                  <option value="All">발주 연관전체</option>
                  <option value="Yes">📦 발주 연관만 표기</option>
                  <option value="No">일반 업무만 표기</option>
                </select>
              </div>

              {/* 4. 실시간 통합 텍스트 검색 */}
              <div className="relative flex-1 max-w-xs min-w-[150px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="업무명 및 담당자 실시간 검색..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 font-bold transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs font-black p-0.5"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* 5. 필터 초기화 버튼 */}
              {(filterOwner !== "All" || filterProgress !== "All" || filterHasOrder !== "All" || searchQuery.trim() !== "") && (
                <button
                  onClick={() => {
                    setFilterOwner("All");
                    setFilterProgress("All");
                    setFilterHasOrder("All");
                    setSearchQuery("");
                    showToast("🔄 모든 검색 및 조건 필터가 투명하게 초기화되었습니다.");
                  }}
                  className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-black hover:bg-indigo-100 hover:text-indigo-800 transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95 animate-fadeIn"
                  title="검색 및 필터 일괄 리셋"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>필터 초기화</span>
                </button>
              )}
            </div>
          )}

          {/* 클린뷰 해제용 콤팩트 스위치 */}
          {isCleanView && (
            <button
              onClick={() => setIsCleanView(false)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0 animate-fadeIn"
              title="관리용 일반 모드로 환원"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>일반 관리모드 환원</span>
            </button>
          )}
        </div>

        {/* 탭 가변 뷰 스페이스 */}
        <div className={`flex-grow ${isCleanView ? 'p-12 space-y-16' : 'p-8 space-y-8'} overflow-y-auto custom-scrollbar font-sans bg-slate-50/20`}>
          
          {/* ================= 탭 1: 종합 진단 요약 (대시보드) ================= */}
          {(isCleanView || activeTab === "dashboard") && (
            <div className="space-y-8 animate-fadeIn">
              {isCleanView && (
                <div className="border-b-2 border-slate-900 pb-3.5 mt-4">
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <span className="bg-slate-900 text-white rounded-lg text-xs px-3 py-1 font-mono tracking-widest">SECTION 1</span>
                    <span className="tracking-tight text-slate-800">📊 종합 진단 요약 (Executive Health Dashboard)</span>
                  </h3>
                </div>
              )}
              
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
                <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col ${isCleanView ? 'h-auto' : 'h-[400px]'}`}>
                  <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Flag className="w-4.5 h-4.5 text-indigo-500" />
                      <span>이정표 및 리스크 신뢰성</span>
                    </h3>
                    {!isCleanView && (
                      <button
                        onClick={() => setActiveTab("milestones")}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        전체보기
                      </button>
                    )}
                  </div>
                  <div className={`p-6 flex-1 ${isCleanView ? '' : 'overflow-y-auto max-h-[400px]'} space-y-4 custom-scrollbar`}>
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
                              <div className="flex-1 bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                                <div className={`h-1.5 rounded-full ${progressBg} transition-all duration-500`} style={{ width: `${confidence}%` }}></div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 shrink-0 w-8 text-right">신뢰도 {confidence}%</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* 실시간 리스크 탑 프로파일링 요약 */}
                <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col ${isCleanView ? 'h-auto' : 'h-[400px]'}`}>
                  <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
                      <span>핵심 고위험 리스크 레지스터 (Top Risks)</span>
                    </h3>
                    {!isCleanView && (
                      <button
                        onClick={() => setActiveTab("risks")}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        전체보기
                      </button>
                    )}
                  </div>
                  <div className={`p-6 flex-1 ${isCleanView ? '' : 'overflow-y-auto max-h-[400px]'} space-y-4 custom-scrollbar`}>
                    {risks.filter(r => r.status !== "Closed").length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
                        <p className="text-xs font-bold text-slate-500">지연 또는 병목 위협 중인 리스크 요인이 없습니다.</p>
                        <p className="text-[10px] text-slate-400 mt-1">모든 시스템 안정 및 안정적 진척 신뢰성 달성 완료</p>
                      </div>
                    ) : (
                      risks
                        .filter(r => r.status !== "Closed")
                        .sort((a, b) => getRiskScore(b.prob, b.impact) - getRiskScore(a.prob, a.impact))
                        .map(r => {
                          const score = getRiskScore(r.prob, r.impact);
                          const severityColor = score >= 15 ? "text-rose-600 bg-rose-50 border-rose-100 font-extrabold" : score >= 8 ? "text-amber-700 bg-amber-50 border-amber-100 font-extrabold" : "text-slate-600 bg-slate-100 border-slate-200 font-bold";
                          const targetMsName = milestones.find(m => m.id === r.msId)?.name || "특정 영역 한정 해제";

                          return (
                            <div key={r.id} className="p-4 bg-slate-50/80 border border-slate-200/65 rounded-xl flex items-center justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border leading-none ${severityColor}`}>
                                    위험지수 {score}
                                  </span>
                                  <p className="text-xs font-semibold text-slate-800 truncate" title={r.title}>{r.title}</p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                  <span className="font-bold text-slate-500">연동 기점:</span>
                                  <span className="truncate">{targetMsName}</span>
                                </div>
                              </div>
                              <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                                r.status === "Active" ? "bg-rose-100 text-rose-700 font-extrabold" : "bg-amber-100 text-amber-800 font-extrabold"
                              } shrink-0`}>
                                {r.status}
                              </span>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================= 탭 2: 간트 차트 (일정 & 연동 관리) ================= */}
          {(isCleanView || activeTab === "gantt") && (
            <div className="space-y-6 animate-fadeIn">
              {isCleanView && (
                <div className="border-b-2 border-slate-900 pb-3.5 mt-8">
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <span className="bg-slate-900 text-white rounded-lg text-xs px-3 py-1 font-mono tracking-widest">SECTION 2</span>
                    <span className="tracking-tight text-slate-800">📅 WBS 및 일정 관리 간트 차트 (Phase & Gantt Timeline)</span>
                  </h3>
                </div>
              )}
              
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 bg-slate-50/30 border border-slate-200 p-5 rounded-2xl">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-indigo-500" />
                    <span>실시간 태스크 진치율 및 예상 가시성 간트 (Gantt)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    프로젝트 각 단계별 완결 시기 및 인공지능 기반 리드타임 지연 위험을 종합 연계 시범 모니터링합니다.
                  </p>
                </div>
                
                {/* 간트 차트 뷰 컨트롤 헤더 패널 */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* 정렬 메뉴 필터 UI 제어부 */}
                  <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm text-slate-600">
                    <span>보기 모드:</span>
                    <select
                      value={ganttViewMode}
                      onChange={(e) => setGanttViewMode(e.target.value as "grid" | "split")}
                      className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="grid">격자 줄 맞춤 뷰 (Grid Align)</option>
                      <option value="split">세부 태스크 사이뷰 (Split View)</option>
                    </select>
                  </div>

                  <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={showMilestonesOnGantt}
                      onChange={(e) => setShowMilestonesOnGantt(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>목표일 및 납기일정 표기</span>
                  </label>
                  
                  <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={showOrderLeadTimeOnGantt}
                      onChange={(e) => setShowOrderLeadTimeOnGantt(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>발주 리드타임 연동 표기</span>
                  </label>
                  
                  {!isCleanView && (
                    <button
                      onClick={handleOpenAddTask}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>태스크 추가</span>
                    </button>
                  )}
                </div>
              </div>

               {/* 간트 스케줄 메인 스페이스 */}
              {ganttViewMode === "grid" ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className={`w-full custom-scrollbar overflow-auto ${isCleanView ? '' : 'max-h-[600px]'}`}>
                    <div className="min-w-[1240px] flex flex-col relative">
                      
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
                          return (
                            <div
                              key={m.id}
                              className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center z-10"
                              style={{ left: `calc(440px + calc(100% - 440px) * ${m.leftPercent} / 100)` }}
                            >
                              {/* 가이드 수직 점선 */}
                              <div className="w-0 border-l border-dashed border-indigo-500/20 h-full absolute top-0 pointer-events-none"></div>
                            </div>
                          );
                        });
                      })()}

                      {/* Header Row (Left Title & Right Month Cells) */}
                      <div className="flex flex-row border-b border-slate-200 sticky top-0 bg-white z-25 shadow-sm">
                        <div className="w-[440px] shrink-0 sticky left-0 bg-white z-30 border-r border-slate-200 px-5 py-4 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">단계 및 세부 업무 (좌우 가로 정렬 뷰)</span>
                          <span className="text-xs font-bold text-slate-400">진치율 조절 / 옵션</span>
                        </div>
                        <div className="flex-grow flex bg-white min-w-[800px] relative">
                          {/* 시작일 라벨 */}
                          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-slate-800/95 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 hover:scale-105 transition-all z-30 select-none font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>{project.startDate}</span>
                          </div>

                          {getGanttMonths().map((month, idx) => {
                            const days = getDaysInMonthDateArray(month);
                            return (
                              <div key={idx} className="flex-1 border-r border-slate-100 last:border-r-0 bg-white flex flex-col justify-between select-none">
                                {/* 1행: 월 */}
                                <div className="py-2 text-center text-xs font-black text-slate-600 bg-slate-50/50 border-b border-slate-100/60 flex-1 flex items-center justify-center">
                                  {month.getMonth() + 1}월
                                </div>
                                {/* 2행: 일 */}
                                <div className="flex justify-between px-1 py-1.5 text-[8px] font-mono font-medium text-slate-400/80 bg-white/95">
                                  {days.map(day => (
                                    <span key={day} className="flex-1 text-center text-[7.5px] scale-[0.85] leading-none min-w-[2px]">
                                      {day}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}

                          {/* 종료일 라벨 */}
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-slate-800/95 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 hover:scale-105 transition-all z-30 select-none font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            <span>{project.endDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Rows */}
                      <div className="divide-y divide-slate-100">
                        {phases.map(phase => {
                          const phaseColor = getPhaseColorMap(phase.color);
                          const phaseTasks = getFilteredTasks(tasks).filter(t => t.phaseId === phase.id);
                          const parentProgress = phaseTasks.length > 0
                            ? Math.round(phaseTasks.reduce((acc, task) => acc + task.progress, 0) / phaseTasks.length)
                            : 0;

                          return (
                            <div 
                              key={phase.id}
                              className={`flex flex-col transition-all duration-200 ${
                                draggedPhaseId === phase.id 
                                  ? "opacity-50 scale-[0.99] border-dashed border border-indigo-200" 
                                  : dragOverPhaseId === phase.id 
                                  ? "bg-indigo-50/20 border-t-2 border-t-indigo-600 border-b border-indigo-150" 
                                  : ""
                              }`}
                              onDragOver={(e) => handlePhaseDragOver(e, phase.id)}
                              onDragLeave={handlePhaseDragLeave}
                              onDrop={(e) => handlePhaseDrop(e, phase.id)}
                            >
                              {/* Phase Container Row */}
                              <div className="flex flex-row bg-slate-50/45 border-b border-slate-100 group h-[52px]">
                                {/* Left Sticky Phase Header */}
                                <div 
                                  draggable={!isCleanView}
                                  onDragStart={(e) => handlePhaseDragStart(e, phase.id)}
                                  onDragEnd={handlePhaseDragEnd}
                                  className={`w-[440px] shrink-0 sticky left-0 bg-slate-50/95 z-10 border-r border-slate-200 p-4 flex justify-between items-center transition-all ${!isCleanView ? "cursor-grab active:cursor-grabbing" : ""}`}
                                >
                                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                                    {!isCleanView && (
                                      <div className="text-slate-400 hover:text-indigo-500 p-0.5 transition-colors shrink-0">
                                        <GripVertical className="w-3.5 h-3.5" />
                                      </div>
                                    )}
                                    <span className={`w-3 h-3 rounded-full shrink-0 ${phaseColor.line}`}></span>
                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditPhase(phase);
                                      }}
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

                                {/* Right Side Phase Blank row space with subtle vertical dividers to map months */}
                                <div className="flex-grow flex relative items-center justify-center bg-slate-50/10 min-w-[800px] h-full">
                                  {getGanttMonths().map((_, idx) => (
                                    <div key={idx} className="flex-1 h-full border-r border-slate-100/50 last:border-r-0 pointer-events-none"></div>
                                  ))}
                                  <span className="absolute left-6 text-[10px] text-slate-400/80 font-bold italic tracking-wide">
                                    📂 {phase.name} 단계 구간
                                  </span>
                                </div>
                              </div>

                              {/* Task Rows inside the Phase */}
                              {phaseTasks.map(task => {
                                const isMemoEditing = quickMemoTaskId === task.id;
                                const isDragging = draggedTaskId === task.id;
                                const isDragOver = dragOverTaskId === task.id;
                                const barPlacement = calculateTimelineBarPosition(task.startDate, task.endDate);

                                return (
                                  <div 
                                    key={task.id}
                                    draggable={!isCleanView}
                                    onDragStart={(e) => handleTaskDragStart(e, task.id)}
                                    onDragOver={(e) => handleTaskDragOver(e, task.id)}
                                    onDragLeave={handleTaskDragLeave}
                                    onDragEnd={handleTaskDragEnd}
                                    onDrop={(e) => handleTaskDrop(e, task.id, phase.id)}
                                    className={`flex flex-row transition-all relative border-b border-slate-100/60 group ${
                                      isDragging 
                                        ? "bg-indigo-50/10 opacity-40 border-dashed border-indigo-200" 
                                        : isDragOver
                                        ? "bg-indigo-50/40 border-t-2 border-t-indigo-600 border-b border-indigo-105" 
                                        : "hover:bg-slate-50/40"
                                    }`}
                                  >
                                    {/* Left Sticky Task Metadata Cell */}
                                    <div className="w-[440px] shrink-0 sticky left-0 bg-white z-10 border-r border-slate-200 pl-6 pr-4 py-3.5 flex flex-col justify-center space-y-2.5 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                      <div className="flex justify-between items-start w-full gap-2">
                                        <div className="min-w-0 pr-1 flex-1 flex items-start gap-2">
                                          {!isCleanView && (
                                            <div 
                                              className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-indigo-500 p-0.5 mt-0.5 transition-colors shrink-0"
                                              title="드래그하여 순서 변경"
                                            >
                                              <GripVertical className="w-3.5 h-3.5" />
                                            </div>
                                          )}
                                          <div className="min-w-0 flex-1">
                                            <p
                                              onClick={() => handleEditTask(task)}
                                              className="text-xs md:text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:underline cursor-pointer truncate"
                                              title="태스크 상세 정보 변경"
                                            >
                                              {task.name}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mt-1.5 text-[10px] text-slate-400 font-bold">
                                              <span className="bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                <User className="w-3 h-3 text-slate-400" />
                                                {task.owner || "미지정"}
                                              </span>
                                              <span>{task.startDate} ~ {task.endDate}</span>
                                              {task.hasOrder && (
                                                <span className="bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded flex items-center gap-0.5" title="발주시 입고 예상 납기 연동 상태">
                                                  <span>📦 발주납기: <strong>{task.orderLeadTime || 1}M</strong></span>
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center space-x-2.5 flex-shrink-0">
                                          {!isCleanView ? (
                                            <div className="flex items-center space-x-1.5">
                                              <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={task.progress}
                                                onChange={(e) => handleUpdateTaskProgressInline(task.id, parseInt(e.target.value))}
                                                className="w-14 md:w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                title="인라인 진척률 직접 튜닝"
                                              />
                                              <span className="text-[10px] font-extrabold text-slate-500 w-8 text-right shrink-0">{task.progress}%</span>
                                            </div>
                                          ) : (
                                            <span className="text-xs font-extrabold text-slate-600 pr-2 shrink-0">{task.progress}%</span>
                                          )}
                                          {!isCleanView && (
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 items-center bg-white/80 p-0.5 rounded-lg border border-slate-100 shadow-sm">
                                              <button onClick={() => handleEditTask(task)} className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer" title="상세 정보">
                                                <Edit2 className="w-3.5 h-3.5" />
                                              </button>
                                              <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer" title="업무 삭제">
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* 메모 및 사진 퀵 컨트롤 버튼 */}
                                      {!isCleanView && (
                                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                          <button
                                            onClick={() => {
                                              if (isMemoEditing) {
                                                setQuickMemoTaskId(null);
                                              } else {
                                                setQuickMemoTaskId(task.id);
                                                setQuickMemoText(task.memo || "");
                                              }
                                            }}
                                            className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                              task.memo 
                                                ? "bg-amber-50/70 border-amber-200 text-amber-700 hover:bg-amber-50" 
                                                : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"
                                            }`}
                                          >
                                            <FileText className="w-3 h-3 shrink-0" />
                                            <span>{task.memo ? "메모 수정" : "메모 남기기"}</span>
                                          </button>

                                          <label className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all">
                                            <Camera className="w-3 h-3 shrink-0" />
                                            <span>{task.imageUrl ? "사진 갱신" : "사진 올리기"}</span>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              onChange={(e) => handleQuickImageUpload(task.id, e)}
                                            />
                                          </label>
                                        </div>
                                      )}

                                      {/* 인라인 퀵 메모 편집 영역 */}
                                      {isMemoEditing && (
                                        <div className="bg-amber-50/20 border border-amber-200/40 rounded-xl p-2.5 space-y-2 mt-1.5">
                                          <textarea
                                            value={quickMemoText}
                                            onChange={(e) => setQuickMemoText(e.target.value)}
                                            placeholder="이 구분 단계 또는 디테일 태스크에 명기할 정보 기입..."
                                            rows={2}
                                            className="w-full text-xs p-2 text-slate-800 bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder-slate-400 font-medium"
                                          />
                                          <div className="flex justify-end gap-1.5">
                                            <button
                                              onClick={() => setQuickMemoTaskId(null)}
                                              className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-md text-[10px] font-bold cursor-pointer"
                                            >
                                              취소
                                            </button>
                                            <button
                                              onClick={() => handleSaveQuickMemo(task.id)}
                                              className="px-2.5 py-0.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white rounded-md text-[10px] font-bold cursor-pointer transition-all shadow-sm"
                                            >
                                              메모 저장
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* 저장된 메모 및 참고 사진 동시 표출 */}
                                      {(task.memo || task.imageUrl) && !isMemoEditing && (
                                        <div className="flex flex-col gap-2 p-2.5 bg-indigo-50/20 border border-indigo-100/30 rounded-xl mt-1">
                                          {task.memo && (
                                            <div className="text-[11px] text-slate-600 leading-relaxed font-semibold flex items-start gap-1.5">
                                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                              <span>{task.memo}</span>
                                            </div>
                                          )}
                                          {task.imageUrl && (
                                            <div className="flex items-center gap-2">
                                              <div className="relative shrink-0">
                                                <img
                                                  src={task.imageUrl}
                                                  alt="첨부파일"
                                                  onClick={() => setActivePreviewImageUrl(task.imageUrl || null)}
                                                  className="w-10 h-10 rounded-lg object-cover cursor-zoom-in border border-slate-200 hover:scale-105 hover:border-slate-300 transition-all shadow-sm"
                                                  title="미리보기 (클릭)"
                                                />
                                              </div>
                                              <div className="text-[9px] text-slate-400 font-bold shrink-0 flex flex-col">
                                                <span>참고 사진 완료 (클릭 시 확대)</span>
                                                <button
                                                  onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, imageUrl: undefined } : t))}
                                                  className="text-rose-500 hover:text-rose-600 text-left underline font-extrabold mt-0.5"
                                                >
                                                  사진 지우기
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Right Side Task Timeline Cell (Height dynamic alignment!) */}
                                    <div className="flex-grow min-w-[800px] relative bg-white hover:bg-slate-50/5 transition-colors min-h-[72px] py-4">
                                      {/* Subtle background dividers representing months */}
                                      <div className="absolute inset-0 flex pointer-events-none">
                                        {getGanttMonths().map((_, idx) => (
                                          <div key={idx} className="flex-1 h-full border-r border-slate-100/40 last:border-r-0"></div>
                                        ))}
                                      </div>

                                      {/* 타임라인 바 (도형) */}
                                      <div
                                        onClick={() => handleEditTask(task)}
                                        title={`${task.name} (${task.progress}% 완료)`}
                                        className="absolute h-7 rounded-lg flex items-center justify-center px-2 text-[10px] font-extrabold text-slate-800 border border-slate-200/80 bg-slate-50/60 shadow-sm overflow-hidden transition-all duration-300 cursor-pointer hover:opacity-90 max-w-full"
                                        style={{
                                          left: `${barPlacement.left}%`,
                                          width: `${barPlacement.width}%`,
                                          top: '12px'
                                        }}
                                      >
                                        <div
                                          className={`${phaseColor.bar} absolute left-0 top-0 bottom-0 transition-all duration-700`}
                                          style={{ width: `${task.progress}%` }}
                                        ></div>
                                        <span className={`relative z-10 font-extrabold filter drop-shadow ${task.progress > 40 ? "text-white" : "text-slate-700"}`}>
                                          {task.hasOrder ? "📦 " : ""}
                                          {task.progress > 0 && task.progress < 100 ? `${task.progress}%` : ""}
                                        </span>
                                      </div>

                                      {/* 예상 납기 리드타임 연장 바 시각 표출 */}
                                      {task.hasOrder && task.orderLeadTime && showOrderLeadTimeOnGantt && (() => {
                                        const leadWidth = getLeadTimeWidthPercent(task.endDate, task.orderLeadTime);
                                        if (leadWidth <= 0) return null;
                                        const UnitedLeadLeft = barPlacement.left + barPlacement.width;
                                        return (
                                          <div
                                            onClick={() => handleEditTask(task)}
                                            title={`예상 납기: 완료일로부터 +${task.orderLeadTime}개월 소요 예상`}
                                            className="absolute h-7 rounded-lg border-2 border-dashed border-amber-400 bg-amber-50/50 flex items-center justify-center text-[9px] font-black text-amber-800 px-1.5 cursor-pointer hover:bg-amber-100/60 transition-all z-10 animate-pulse text-center"
                                            style={{
                                              left: `${UnitedLeadLeft}%`,
                                              width: `${leadWidth}%`,
                                              top: '12px'
                                            }}
                                          >
                                            <span className="truncate">🚚 납기:+{task.orderLeadTime}M</span>
                                          </div>
                                        );
                                      })()}

                                      {/* 완료 목표일 및 발주 리드타임 납기일정 표기 바 */}
                                      {showMilestonesOnGantt && (() => {
                                        const baseLeft = barPlacement.left + barPlacement.width;
                                        const leadWidth = task.hasOrder && task.orderLeadTime && showOrderLeadTimeOnGantt 
                                          ? getLeadTimeWidthPercent(task.endDate, task.orderLeadTime) 
                                          : 0;
                                        
                                        const badgeLeft = baseLeft + leadWidth;
                                        let offsetStyle: React.CSSProperties = {
                                          left: `${badgeLeft}%`,
                                          top: '12px',
                                          transform: 'translateX(6px)'
                                        };
                                        if (badgeLeft > 80) {
                                          const rightPct = 100 - (baseLeft + leadWidth);
                                          offsetStyle = {
                                            right: `${rightPct}%`,
                                            top: '12px',
                                            transform: 'translateX(-6px)'
                                          };
                                        }

                                        const deliveryDateStr = task.hasOrder && task.orderLeadTime 
                                          ? getDeliveryDate(task.endDate, task.orderLeadTime)
                                          : null;

                                        return (
                                          <div
                                            onClick={() => handleEditTask(task)}
                                            title={`🎯 완료 목표일: ${task.endDate}${deliveryDateStr ? ` | 🚚 납기 일정: ${deliveryDateStr}` : ""}`}
                                            className="absolute h-7 rounded-xl border border-indigo-200/80 bg-indigo-50/95 text-indigo-900 shadow-sm flex items-center space-x-1.5 px-3 py-1 cursor-pointer hover:scale-105 active:scale-95 hover:z-30 transition-all duration-150 text-[10px] font-black z-20 whitespace-nowrap"
                                            style={offsetStyle}
                                          >
                                            <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                                            <span>🎯 완료: {task.endDate}</span>
                                            {deliveryDateStr && (
                                              <>
                                                <span className="text-indigo-300 font-normal">|</span>
                                                <span className="text-amber-800">🚚 납기: {deliveryDateStr}</span>
                                              </>
                                            )}
                                          </div>
                                        );
                                      })()}

                                      {/* 도형 바로 아래 텍스트 (줄바꿈 없이 노출) */}
                                      <div
                                        onClick={() => handleEditTask(task)}
                                        className="absolute text-[11px] font-semibold text-slate-500 hover:text-indigo-600 cursor-pointer whitespace-nowrap z-10"
                                        style={{
                                          left: `${barPlacement.left}%`,
                                          top: '44px'
                                        }}
                                      >
                                        {task.name}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              {phaseTasks.length === 0 && (
                                <div className="flex flex-row border-b border-slate-100/60 bg-slate-50/10 h-12">
                                  <div className="w-[440px] shrink-0 sticky left-0 bg-white z-10 border-r border-slate-200 pl-8 flex items-center">
                                    <p className="text-[11px] text-slate-300 italic">이 단계에 배속된 태스크가 없습니다.</p>
                                  </div>
                                  <div className="flex-grow min-w-[800px] relative"></div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row">
                  
                  {/* 좌측 슬라이드: 태스크 목록(고정폭) */}
                  <div className="w-full lg:w-[480px] border-b lg:border-b-0 lg:border-r border-slate-200 flex-shrink-0 flex flex-col bg-slate-50/60">
                    <div className="border-b border-slate-200 px-5 py-4 flex justify-between items-center bg-white">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">단계 및 태스크 (클릭 시 수정)</span>
                      <span className="text-xs font-bold text-slate-400">진치율 조절 / 옵션</span>
                    </div>

                    <div className={`flex-1 ${isCleanView ? '' : 'overflow-y-auto max-h-[600px]'} divide-y divide-slate-100/70 custom-scrollbar`}>
                      {phases.map(phase => {
                        const phaseColor = getPhaseColorMap(phase.color);
                        const phaseTasks = getFilteredTasks(tasks).filter(t => t.phaseId === phase.id);
                        const parentProgress = phaseTasks.length > 0
                          ? Math.round(phaseTasks.reduce((acc, task) => acc + task.progress, 0) / phaseTasks.length)
                          : 0;

                        return (
                          <div 
                            key={phase.id} 
                            className={`bg-white transition-all duration-200 ${
                              draggedPhaseId === phase.id 
                                ? "opacity-50 scale-[0.99] border-dashed border border-indigo-200" 
                                : dragOverPhaseId === phase.id 
                                ? "bg-indigo-50/20 border-t-2 border-t-indigo-600 border-b border-indigo-150" 
                                : ""
                            }`}
                            onDragOver={(e) => handlePhaseDragOver(e, phase.id)}
                            onDragLeave={handlePhaseDragLeave}
                            onDrop={(e) => handlePhaseDrop(e, phase.id)}
                          >
                            
                            {/* Phase Header Row */}
                            <div 
                              draggable={!isCleanView}
                              onDragStart={(e) => handlePhaseDragStart(e, phase.id)}
                              onDragEnd={handlePhaseDragEnd}
                              className={`p-4 flex justify-between items-center bg-slate-50/40 border-b border-slate-100 group transition-all ${!isCleanView ? "cursor-grab active:cursor-grabbing" : ""}`}
                            >
                              <div className="flex items-center space-x-2 min-w-0 flex-1">
                                {!isCleanView && (
                                  <div className="text-slate-400 hover:text-indigo-500 p-0.5 transition-colors shrink-0">
                                    <GripVertical className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                <span className={`w-3 h-3 rounded-full shrink-0 ${phaseColor.line}`}></span>
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditPhase(phase);
                                  }}
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
                            {phaseTasks.map(task => {
                              const isMemoEditing = quickMemoTaskId === task.id;
                              const isDragging = draggedTaskId === task.id;
                              const isDragOver = dragOverTaskId === task.id;

                              return (
                                <div
                                  key={task.id}
                                  draggable={!isCleanView}
                                  onDragStart={(e) => handleTaskDragStart(e, task.id)}
                                  onDragOver={(e) => handleTaskDragOver(e, task.id)}
                                  onDragLeave={handleTaskDragLeave}
                                  onDragEnd={handleTaskDragEnd}
                                  onDrop={(e) => handleTaskDrop(e, task.id, phase.id)}
                                  className={`pl-6 pr-4 min-h-[76px] py-3.5 border-b transition-all flex flex-col justify-center space-y-2.5 group relative ${
                                    isDragging 
                                      ? "bg-indigo-50/20 opacity-40 border-dashed border-indigo-250" 
                                      : isDragOver
                                      ? "bg-indigo-50/50 border-t-2 border-t-indigo-600 border-b border-indigo-100" 
                                      : "bg-slate-50/10 hover:bg-slate-55/60 border-slate-100/60"
                                  }`}
                                >
                                  <div className="flex justify-between items-start w-full gap-2">
                                    <div className="min-w-0 pr-1 flex-1 flex items-start gap-2">
                                      {!isCleanView && (
                                        <div 
                                          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-indigo-500 p-0.5 mt-0.5 transition-colors shrink-0"
                                          title="드래그하여 순서 변경"
                                        >
                                          <GripVertical className="w-3.5 h-3.5" />
                                        </div>
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <p
                                          onClick={() => handleEditTask(task)}
                                          className="text-xs md:text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:underline cursor-pointer truncate"
                                          title="태스크 상세 정보 변경"
                                        >
                                          {task.name}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mt-1.5 text-[10px] text-slate-400 font-bold">
                                          <span className="bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                            <User className="w-3 h-3 text-slate-400" />
                                            {task.owner || "미지정"}
                                          </span>
                                          <span>{task.startDate} ~ {task.endDate}</span>
                                          {task.hasOrder && (
                                            <span className="bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded flex items-center gap-0.5" title="발주시 입고 예상 납기 연동 상태">
                                              <span>📦 발주납기: <strong>{task.orderLeadTime || 1}M</strong></span>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-2.5 flex-shrink-0">
                                      {!isCleanView ? (
                                        <div className="flex items-center space-x-1.5">
                                          <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={task.progress}
                                            onChange={(e) => handleUpdateTaskProgressInline(task.id, parseInt(e.target.value))}
                                            className="w-14 md:w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            title="인라인 진척률 직접 튜닝"
                                          />
                                          <span className="text-[10px] font-extrabold text-slate-500 w-8 text-right shrink-0">{task.progress}%</span>
                                        </div>
                                      ) : (
                                        <span className="text-xs font-extrabold text-slate-600 pr-2 shrink-0">{task.progress}%</span>
                                      )}
                                      {!isCleanView && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 items-center bg-white/80 p-0.5 rounded-lg border border-slate-100 shadow-sm">
                                          <button onClick={() => handleEditTask(task)} className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer" title="상세 정보">
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer" title="업무 삭제">
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* 메모 및 사진 퀵 컨트롤 버튼 - 클린 뷰에서는 숨김 */}
                                  {!isCleanView && (
                                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                      {/* 메모 추가/수정 버튼 */}
                                      <button
                                        onClick={() => {
                                          if (isMemoEditing) {
                                            setQuickMemoTaskId(null);
                                          } else {
                                            setQuickMemoTaskId(task.id);
                                            setQuickMemoText(task.memo || "");
                                          }
                                        }}
                                        className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                          task.memo 
                                            ? "bg-amber-50/70 border-amber-200 text-amber-700 hover:bg-amber-50" 
                                            : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"
                                        }`}
                                      >
                                        <FileText className="w-3 h-3 shrink-0" />
                                        <span>{task.memo ? "메모 수정" : "메모 남기기"}</span>
                                      </button>

                                      {/* 기기 상 사진 파일 업로드 */}
                                      <label className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all font-semibold">
                                        <Camera className="w-3 h-3 shrink-0" />
                                        <span>{task.imageUrl ? "사진 갱신" : "사진 올리기"}</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => handleQuickImageUpload(task.id, e)}
                                        />
                                      </label>
                                    </div>
                                  )}

                                  {/* 인라인 퀵 메모 편집 영역 */}
                                  {isMemoEditing && (
                                    <div className="bg-amber-50/25 border border-amber-200/40 rounded-xl p-2.5 space-y-2 mt-1.5 animate-fadeIn font-semibold">
                                      <textarea
                                        value={quickMemoText}
                                        onChange={(e) => setQuickMemoText(e.target.value)}
                                        placeholder="이 구분 단계 또는 디테일 태스크에 명기할 정보 기입..."
                                        rows={2}
                                        className="w-full text-xs p-2 text-slate-800 bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder-slate-400 font-medium"
                                      />
                                      <div className="flex justify-end gap-1.5">
                                        <button
                                          onClick={() => setQuickMemoTaskId(null)}
                                          className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-md text-[10px] font-bold cursor-pointer"
                                        >
                                          취소
                                        </button>
                                        <button
                                          onClick={() => handleSaveQuickMemo(task.id)}
                                          className="px-2.5 py-0.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white rounded-md text-[10px] font-bold cursor-pointer shadow-sm transition-all"
                                        >
                                          메모 저장
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* 저장된 메모 및 참고 사진 동시 표출 컨테이너 */}
                                  {(task.memo || task.imageUrl) && !isMemoEditing && (
                                    <div className="flex flex-col gap-2 p-2.5 bg-indigo-50/20 border border-indigo-100/30 rounded-xl mt-1">
                                      {task.memo && (
                                        <div className="text-[11px] text-slate-600 leading-relaxed font-semibold flex items-start gap-1.5">
                                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                          <span>{task.memo}</span>
                                        </div>
                                      )}
                                      {task.imageUrl && (
                                        <div className="flex items-center gap-2">
                                          <div className="relative shrink-0">
                                            <img
                                              src={task.imageUrl}
                                              alt="첨부파일"
                                              onClick={() => setActivePreviewImageUrl(task.imageUrl || null)}
                                              className="w-10 h-10 rounded-lg object-cover cursor-zoom-in border border-slate-200 hover:scale-105 hover:border-slate-300 transition-all shadow-sm"
                                              title="미리보기 (클릭)"
                                            />
                                          </div>
                                          <div className="text-[9px] text-slate-400 font-bold shrink-0 flex flex-col">
                                            <span>참고 스크린샷 연동 완료 (클릭 시 확대)</span>
                                            <button
                                              onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, imageUrl: undefined } : t))}
                                              className="text-rose-500 hover:text-rose-600 text-left underline font-extrabold mt-0.5"
                                            >
                                              사진 지우기
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {phaseTasks.length === 0 && (
                              <p className="text-[11px] py-3 text-slate-300 text-center italic">이 단계에 배속된 태스크가 없습니다.</p>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 우측 연계: 타임라인 그리드 (가로스크롤 대응) */}
                  <div className={`flex-1 overflow-x-auto bg-white relative custom-scrollbar ${isCleanView ? '' : 'max-h-[650px]'}`}>
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
                        return (
                          <div
                            key={m.id}
                            className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center z-20"
                            style={{ left: `${m.leftPercent}%` }}
                          >
                            {/* 가이드 수직 점선 */}
                            <div className="w-0 border-l border-dashed border-indigo-500/20 h-full absolute top-0 pointer-events-none"></div>
                          </div>
                        );
                      });
                    })()}

                    {/* 월 헤더 가로선 */}
                    <div className="flex border-b border-slate-200 sticky top-0 bg-white z-10 shadow-sm relative">
                      {/* 시작일 라벨 */}
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-slate-800/95 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 hover:scale-105 transition-all z-30 select-none font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>{project.startDate}</span>
                      </div>

                      {getGanttMonths().map((month, idx) => {
                        const days = getDaysInMonthDateArray(month);
                        return (
                          <div key={idx} className="flex-1 border-r border-slate-100 last:border-r-0 bg-white flex flex-col justify-between select-none">
                            {/* 1행: 월 */}
                            <div className="py-2 text-center text-xs font-black text-slate-600 bg-slate-50/50 border-b border-slate-100/60 flex-1 flex items-center justify-center">
                              {month.getMonth() + 1}월
                            </div>
                            {/* 2행: 일 */}
                            <div className="flex justify-between px-1 py-1.5 text-[8px] font-mono font-medium text-slate-400/80 bg-white/95">
                              {days.map(day => (
                                <span key={day} className="flex-1 text-center text-[7.5px] scale-[0.85] leading-none min-w-[2px]">
                                  {day}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {/* 종료일 라벨 */}
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-slate-800/95 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 hover:scale-105 transition-all z-30 select-none font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        <span>{project.endDate}</span>
                      </div>
                    </div>

                    {/* 타임라인 바 영역 */}
                    <div className="flex-1 divide-y divide-slate-100/60 pb-3">
                      {phases.map(p => {
                        const phaseColor = getPhaseColorMap(p.color);
                        const phaseTasks = getFilteredTasks(tasks).filter(t => t.phaseId === p.id);

                        return (
                          <div key={p.id}>
                            {/* Phase Space */}
                            <div className="h-[49px] border-b border-slate-100 bg-slate-50/20"></div>

                            {/* Task Rows Space */}
                            {phaseTasks.map(task => {
                              const barPlacement = calculateTimelineBarPosition(task.startDate, task.endDate);
                              return (
                                <div key={task.id} className="h-[72px] relative border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                  {/* 타임라인 바 (도형) */}
                                  <div
                                    onClick={() => handleEditTask(task)}
                                    title={`${task.name} (${task.progress}% 완료)`}
                                    className="absolute h-7 rounded-lg flex items-center justify-center px-2 text-[10px] font-extrabold text-slate-800 border border-slate-200/80 bg-slate-50/60 shadow-sm overflow-hidden transition-all duration-300 cursor-pointer hover:opacity-90 max-w-full"
                                    style={{
                                      left: `${barPlacement.left}%`,
                                      width: `${barPlacement.width}%`,
                                      top: '12px'
                                    }}
                                  >
                                    <div
                                      className={`${phaseColor.bar} absolute left-0 top-0 bottom-0 transition-all duration-700`}
                                      style={{ width: `${task.progress}%` }}
                                    ></div>
                                    <span className={`relative z-10 font-extrabold filter drop-shadow ${task.progress > 40 ? "text-white" : "text-slate-700"}`}>
                                      {task.hasOrder ? "📦 " : ""}
                                      {task.progress > 0 && task.progress < 100 ? `${task.progress}%` : ""}
                                    </span>
                                  </div>

                                  {/* 예상 납기 리드타임 연장 바 시각 표출 */}
                                  {task.hasOrder && task.orderLeadTime && showOrderLeadTimeOnGantt && (() => {
                                    const leadWidth = getLeadTimeWidthPercent(task.endDate, task.orderLeadTime);
                                    if (leadWidth <= 0) return null;
                                    const leadLeft = barPlacement.left + barPlacement.width;
                                    return (
                                      <div
                                        onClick={() => handleEditTask(task)}
                                        title={`예상 납기: 완료일로부터 +${task.orderLeadTime}개월 소요 예상`}
                                        className="absolute h-7 rounded-lg border-2 border-dashed border-amber-400 bg-amber-50/50 flex items-center justify-center text-[9px] font-black text-amber-800 px-1.5 cursor-pointer hover:bg-amber-100/60 transition-all z-10 animate-pulse text-center"
                                        style={{
                                          left: `${leadLeft}%`,
                                          width: `${leadWidth}%`,
                                          top: '12px'
                                        }}
                                      >
                                        <span className="truncate">🚚 납기:+{task.orderLeadTime}M</span>
                                      </div>
                                    );
                                  })()}

                                  {/* 완료 목표일 및 발주 리드타임 납기일정 표기 바 */}
                                  {showMilestonesOnGantt && (() => {
                                    const baseLeft = barPlacement.left + barPlacement.width;
                                    const leadWidth = task.hasOrder && task.orderLeadTime && showOrderLeadTimeOnGantt 
                                      ? getLeadTimeWidthPercent(task.endDate, task.orderLeadTime) 
                                      : 0;
                                    
                                    const badgeLeft = baseLeft + leadWidth;
                                    let offsetStyle: React.CSSProperties = {
                                      left: `${badgeLeft}%`,
                                      top: '12px',
                                      transform: 'translateX(6px)'
                                    };
                                    if (badgeLeft > 80) {
                                      const rightPct = 100 - (baseLeft + leadWidth);
                                      offsetStyle = {
                                        right: `${rightPct}%`,
                                        top: '12px',
                                        transform: 'translateX(-6px)'
                                      };
                                    }

                                    const deliveryDateStr = task.hasOrder && task.orderLeadTime 
                                      ? getDeliveryDate(task.endDate, task.orderLeadTime)
                                      : null;

                                    return (
                                      <div
                                        onClick={() => handleEditTask(task)}
                                        title={`🎯 완료 목표일: ${task.endDate}${deliveryDateStr ? ` | 🚚 납기 일정: ${deliveryDateStr}` : ""}`}
                                        className="absolute h-7 rounded-xl border border-indigo-200/80 bg-indigo-50/95 text-indigo-900 shadow-sm flex items-center space-x-1.5 px-3 py-1 cursor-pointer hover:scale-105 active:scale-95 hover:z-30 transition-all duration-150 text-[10px] font-black z-20 whitespace-nowrap"
                                        style={offsetStyle}
                                      >
                                        <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>🎯 완료: {task.endDate}</span>
                                        {deliveryDateStr && (
                                          <>
                                            <span className="text-indigo-300 font-normal">|</span>
                                            <span className="text-amber-800">🚚 납기: {deliveryDateStr}</span>
                                          </>
                                        )}
                                      </div>
                                    );
                                  })()}

                                  {/* 도형 바로 아래 텍스트 (줄바꿈 없이 노출) */}
                                  <div
                                    onClick={() => handleEditTask(task)}
                                    className="absolute text-[11px] font-semibold text-slate-500 hover:text-indigo-600 cursor-pointer whitespace-nowrap z-10"
                                    style={{
                                      left: `${barPlacement.left}%`,
                                      top: '44px'
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
            )}

            </div>
          )}

          {/* ================= 탭 3: 마일스톤 관리 및 퀵 업데이트 ================= */}
          {(isCleanView || activeTab === "milestones") && (
            <div className="space-y-6 animate-fadeIn">
              {isCleanView && (
                <div className="border-b-2 border-slate-900 pb-3.5 mt-8">
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <span className="bg-slate-900 text-white rounded-lg text-xs px-3 py-1 font-mono tracking-widest">SECTION 3</span>
                    <span className="tracking-tight text-slate-800">🚩 프로젝트 핵심 이정표 현황 (Milestones Ledger)</span>
                  </h3>
                </div>
              )}
              
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
                {!isCleanView && (
                  <button
                    onClick={handleOpenAddMilestone}
                    className="p-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/15 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>마일스톤 신규 추가</span>
                  </button>
                )}
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
                          {!isCleanView && (
                            <button
                              onClick={() => handleOpenQuickUpdate(m)}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                              title="진척도 신속 갱신"
                            >
                              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
                              <span>Quick Update</span>
                            </button>
                          )}
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
                           {!isCleanView && (
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
                           )}
                        </div>

                      </div>
                    );
                  })}
              </div>

            </div>
          )}

          {/* ================= 탭 4: 리스크 레지스터 ================= */}
          {(isCleanView || activeTab === "risks") && (
            <div className="space-y-6 animate-fadeIn">
              {isCleanView && (
                <div className="border-b-2 border-slate-900 pb-3.5 mt-8">
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <span className="bg-slate-900 text-white rounded-lg text-xs px-3 py-1 font-mono tracking-widest">SECTION 4</span>
                    <span className="tracking-tight text-slate-800">⚡ 프로젝트 위험 대장 (Critical Risks Management Ledger)</span>
                  </h3>
                </div>
              )}
              
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
                {!isCleanView && (
                  <button
                    onClick={handleOpenAddRisk}
                    className="p-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/15 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>새로운 위험 등록</span>
                  </button>
                )}
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
                        {!isCleanView && <th className="p-4 text-center w-24">옵션</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {risks.length === 0 ? (
                        <tr>
                          <td colSpan={isCleanView ? 5 : 6} className="text-center py-16 text-slate-400 text-sm">
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

                                {!isCleanView && (
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
                                )}

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
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-modalEntrance">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-indigo-500" />
                <span>프로젝트 정보 스펙 관리</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
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
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-modalEntrance">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FolderPlus className="w-4.5 h-4.5 text-indigo-500" />
                <span>프로젝트 관리 대단계 설정</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
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
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-modalEntrance">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CalendarDays className="w-4.5 h-4.5 text-indigo-500" />
                <span>체크리스트 디테일 태스크 편집</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
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
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3">
                <label className="flex items-center space-x-2.5 text-xs font-bold text-slate-750 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!editingTask.hasOrder}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setEditingTask({
                        ...editingTask,
                        hasOrder: checked,
                        orderLeadTime: checked ? (editingTask.orderLeadTime || 1) : undefined
                      });
                    }}
                    className="w-4.5 h-4.5 rounded text-indigo-650 border-slate-350 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>📦 이 세부 업무에 연관 발주품이 존재합니다 (예상 납기 입력)</span>
                </label>
                
                {editingTask.hasOrder && (
                  <div className="bg-amber-50/40 border border-amber-200 rounded-xl p-3.5 space-y-2 mt-1 animate-fadeIn">
                    <label className="block text-[11px] font-black text-amber-800">예상 입고 납기 (Lead Time 개월 단위)</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={editingTask.orderLeadTime || 1}
                        onChange={(e) => setEditingTask({ ...editingTask, orderLeadTime: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-24 px-3 py-1.5 border border-amber-300 rounded-lg text-sm font-extrabold focus:outline-none focus:border-amber-500 bg-white text-amber-900"
                      />
                      <span className="text-xs font-bold text-amber-700">개월 후 입고 연동 예상</span>
                    </div>
                    <p className="text-[10px] text-amber-600 font-medium leading-relaxed">
                      * 입력하신 예상 납기는 간트차트 마스터플랜의 업무 바(Bar) 종료일 뒤에 연장 표시 구간으로 시각화됩니다.
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>간단 업무 보강 메모</span>
                </label>
                <textarea
                  value={editingTask.memo || ""}
                  onChange={(e) => setEditingTask({ ...editingTask, memo: e.target.value })}
                  placeholder="예: 정합성 감사 필증 연장 서류 및 인력 보강 기획"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none bg-white font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>업무 참고 스크린샷 (사진 파일)</span>
                </label>
                {editingTask.imageUrl ? (
                  <div className="relative border border-slate-200 rounded-xl p-2.5 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                      <img src={editingTask.imageUrl} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                      <span className="text-xs text-slate-650 font-bold truncate">등록된 참고 사진</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingTask({ ...editingTask, imageUrl: undefined })}
                      className="px-2.5 py-1 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-150 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                      사진 삭제
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100/50 hover:border-indigo-300 transition-all">
                      <div className="flex flex-col items-center justify-center pt-3 pb-3">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <p className="text-xs text-slate-500 font-extrabold">여기를 클릭하여 파일 선택</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG 등의 이미지 파일</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditingTask({ ...editingTask, imageUrl: reader.result as string });
                              showToast("📸 참고 사진이 성공적으로 업로드되었습니다.");
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
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
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-modalEntrance">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Flag className="w-4.5 h-4.5 text-indigo-500" />
                <span>마일스톤 주요 마디 기획</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
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
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-modalEntrance">
            <div className="px-6 py-4 border-b border-indigo-50 flex justify-between items-center bg-indigo-50/20 shrink-0">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-300" />
                <span>지표 초고속 업데이트 팝업</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
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
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-modalEntrance">
            <div className="px-6 py-4.5 border-b border-rose-100 flex justify-between items-center bg-rose-50/40 shrink-0">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                <span>안전 및 일정 위협 리스크 포작제어</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
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

      {/* 9. 참고 사진 원본 확대 라이트박스 */}
      {activePreviewImageUrl && (
        <div 
          className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
          onClick={() => setActivePreviewImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden flex flex-col items-center">
            <button
              onClick={() => setActivePreviewImageUrl(null)}
              className="absolute -top-12 right-0 bg-slate-800 text-white rounded-full p-2 hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all shadow-md z-10 cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activePreviewImageUrl}
              alt="정밀 확대 사진"
              className="rounded-2xl max-w-full max-h-[80vh] object-contain shadow-2xl border border-slate-700/50 cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="text-center mt-3 text-xs font-bold text-slate-300 pointer-events-none select-none bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-750">
              구분 단계 연계 참고 원본 이미지 파일 (바탕 클릭 시 닫기)
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
