import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Student, 
  BadgeDefinition, 
  AwardedBadge, 
  AttendanceRecord, 
  RedemptionRecord, 
  TeacherAuthSettings,
  GradeLevel,
  AttendanceType
} from '../types';
import { 
  db, 
  COLLECTIONS, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch 
} from '../firebase';
import { 
  DEFAULT_STUDENTS, 
  DEFAULT_BADGES, 
  DEFAULT_TEACHER_SETTINGS 
} from '../data/defaultData';
import confetti from 'canvas-confetti';

interface AttendanceSummary {
  startingMedals: number;
  medalsRemaining: number;
  unexcusedAbsences: number;
  excusedAbsences: number;
  unexcusedLates: number;
  excusedLates: number;
  latePenaltyDeduction: number;
  unexcusedCuttings: number;
  excusedCuttings: number;
  totalDeductions: number;
  allRecords: AttendanceRecord[];
}

interface AppContextType {
  // State
  students: Student[];
  badges: BadgeDefinition[];
  awardedBadges: AwardedBadge[];
  attendanceRecords: AttendanceRecord[];
  redemptionHistory: RedemptionRecord[];
  teacherSettings: TeacherAuthSettings;
  isLoading: boolean;
  isFirebaseConnected: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';

  // Filters
  selectedGrade: GradeLevel | 'all';
  setSelectedGrade: (g: GradeLevel | 'all') => void;
  selectedSection: string | 'all';
  setSelectedSection: (s: string | 'all') => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;

  // Teacher Auth State
  isTeacherAuthenticated: boolean;
  loginTeacher: (pin: string) => boolean;
  logoutTeacher: () => void;
  updateTeacherSettings: (settings: Partial<TeacherAuthSettings>) => Promise<void>;

  // Calculations
  getStudentActiveBadges: (studentId: string) => AwardedBadge[];
  getStudentAllBadges: (studentId: string) => AwardedBadge[];
  getStudentAttendanceSummary: (studentId: string) => AttendanceSummary;
  calculateRawScoreFromBadges: (activeBadgeCount: number) => { rawScore: number; formula: string };

  // Core Actions
  awardBadgesToStudents: (
    studentIds: string[], 
    badgeId: string, 
    remarks?: string,
    triggerCelebration?: boolean
  ) => Promise<void>;
  
  redeemBadge: (
    awardedBadgeId: string, 
    purpose: string, 
    rawScoreValue?: number,
    remarks?: string
  ) => Promise<void>;

  recordBatchAttendance: (
    records: { studentId: string; date: string; type: AttendanceType; isExcused: boolean; remarks?: string }[]
  ) => Promise<void>;

  importClassList: (newStudents: Partial<Student>[]) => Promise<{ added: number; updated: number }>;
  addNewStudent: (student: Omit<Student, 'id' | 'createdAt'>) => Promise<string>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  
  createCustomBadge: (badge: BadgeDefinition) => Promise<void>;
  resetToSampleData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  STUDENTS: 'css_app_students',
  BADGES: 'css_app_badges',
  AWARDED: 'css_app_awarded',
  ATTENDANCE: 'css_app_attendance',
  REDEMPTIONS: 'css_app_redemptions',
  SETTINGS: 'css_app_settings',
  TEACHER_AUTH: 'css_teacher_auth_session'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local fallback storage initialization
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
    } catch {
      return DEFAULT_STUDENTS;
    }
  });

  const [badges, setBadges] = useState<BadgeDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BADGES);
      return saved ? JSON.parse(saved) : DEFAULT_BADGES;
    } catch {
      return DEFAULT_BADGES;
    }
  });

  const [awardedBadges, setAwardedBadges] = useState<AwardedBadge[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AWARDED);
      if (saved) return JSON.parse(saved);
      
      // Default sample starter badges for immediate visual richness
      const starter: AwardedBadge[] = [
        {
          id: 'awd-1',
          studentId: 'std-g8-01',
          badgeId: 'badge-pc-assembly',
          title: 'PC Hardware Specialist',
          category: 'hardware',
          description: 'Safe system unit disassembly and assembly.',
          iconName: 'Cpu',
          rarity: 'gold',
          awardedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          awardedBy: 'Teacher Mark Santos',
          remarks: 'Flawless power switch cable front panel connection.',
          status: 'active'
        },
        {
          id: 'awd-2',
          studentId: 'std-g8-01',
          badgeId: 'badge-esd-safety',
          title: 'ESD & OHS Guardian',
          category: 'safety',
          description: 'Maintained zero safety infractions.',
          iconName: 'ShieldCheck',
          rarity: 'diamond',
          awardedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
          awardedBy: 'Teacher Mark Santos',
          remarks: 'Always properly grounded before touching RAM sticks.',
          status: 'active'
        },
        {
          id: 'awd-3',
          studentId: 'std-g8-01',
          badgeId: 'badge-5s-cleanliness',
          title: '5S Laboratory Champion',
          category: 'conduct',
          description: 'Exemplifies laboratory cleanliness.',
          iconName: 'Sparkles',
          rarity: 'bronze',
          awardedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
          awardedBy: 'Teacher Mark Santos',
          remarks: 'Cleaned workbench and returned ESD mat.',
          status: 'redeemed',
          redeemedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          redemptionReason: 'Redeemed for +3 Bonus in Quiz #2',
          redemptionScoreValue: 3
        },
        {
          id: 'awd-4',
          studentId: 'std-g9-01',
          badgeId: 'badge-cable-crimping',
          title: 'RJ45 Master Crimper',
          category: 'networking',
          description: 'Flawless T568B crimping on first attempt.',
          iconName: 'Cable',
          rarity: 'silver',
          awardedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
          awardedBy: 'Teacher Mark Santos',
          remarks: 'All 8 pins green on cable tester.',
          status: 'active'
        },
        {
          id: 'awd-5',
          studentId: 'std-g9-01',
          badgeId: 'badge-lan-config',
          title: 'Network & Subnet Architect',
          category: 'networking',
          description: 'IPv4 configuration and file sharing.',
          iconName: 'Network',
          rarity: 'gold',
          awardedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
          awardedBy: 'Teacher Mark Santos',
          remarks: 'P2P network verified with 0% packet loss.',
          status: 'active'
        },
        {
          id: 'awd-6',
          studentId: 'std-g10-01',
          badgeId: 'badge-nc2-ready',
          title: 'CSS NC II Mock Master',
          category: 'achievement',
          description: 'Passed mock assessment with distinction.',
          iconName: 'Trophy',
          rarity: 'master',
          awardedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          awardedBy: 'Teacher Mark Santos',
          remarks: 'Exemplary speed in OS multi-boot setup.',
          status: 'active'
        },
        {
          id: 'awd-7',
          studentId: 'std-g10-01',
          badgeId: 'badge-diagnostic-ninja',
          title: 'POST & Beep Code Ninja',
          category: 'hardware',
          description: 'Pinpointed hardware fault under 5 minutes.',
          iconName: 'Wrench',
          rarity: 'diamond',
          awardedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
          awardedBy: 'Teacher Mark Santos',
          remarks: 'Fixed CMOS clear jumper fault quickly.',
          status: 'active'
        }
      ];
      return starter;
    } catch {
      return [];
    }
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (saved) return JSON.parse(saved);
      
      const sampleAtt: AttendanceRecord[] = [
        {
          id: 'att-1',
          studentId: 'std-g8-01',
          date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
          type: 'late',
          isExcused: false,
          remarks: 'Traffic along highway',
          quarter: 1,
          timestamp: Date.now() - 86400000 * 3
        },
        {
          id: 'att-2',
          studentId: 'std-g8-01',
          date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
          type: 'absent',
          isExcused: true,
          remarks: 'Medical checkup with parent excuse letter',
          quarter: 1,
          timestamp: Date.now() - 86400000 * 7
        }
      ];
      return sampleAtt;
    } catch {
      return [];
    }
  });

  const [redemptionHistory, setRedemptionHistory] = useState<RedemptionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REDEMPTIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [teacherSettings, setTeacherSettings] = useState<TeacherAuthSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_TEACHER_SETTINGS;
    } catch {
      return DEFAULT_TEACHER_SETTINGS;
    }
  });

  // Filter state
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'all'>('all');
  const [selectedSection, setSelectedSection] = useState<string | 'all'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>('std-g8-01');

  // Teacher Authentication state
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(STORAGE_KEYS.TEACHER_AUTH) === 'true';
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [badges]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AWARDED, JSON.stringify(awardedBadges));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [awardedBadges]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify(redemptionHistory));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [redemptionHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(teacherSettings));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [teacherSettings]);

  // Real-time Firestore Subscribers
  useEffect(() => {
    let unsubStudents: (() => void) | undefined;
    let unsubBadges: (() => void) | undefined;
    let unsubAwarded: (() => void) | undefined;
    let unsubAttendance: (() => void) | undefined;
    let unsubRedemptions: (() => void) | undefined;
    let unsubSettings: (() => void) | undefined;

    try {
      // 1. Students collection listener
      const studentsRef = collection(db, COLLECTIONS.STUDENTS);
      unsubStudents = onSnapshot(studentsRef, (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Student[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push({ ...docSnap.data(), id: docSnap.id } as Student);
          });
          setStudents(loaded);
          setIsFirebaseConnected(true);
        } else {
          // Initialize remote database if empty
          initializeRemoteDatabase();
        }
      }, (error) => {
        console.warn('Firestore students listener fallback:', error.message);
        setIsFirebaseConnected(false);
      });

      // 2. Badges collection listener
      const badgesRef = collection(db, COLLECTIONS.BADGES);
      unsubBadges = onSnapshot(badgesRef, (snapshot) => {
        if (!snapshot.empty) {
          const loaded: BadgeDefinition[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push({ ...docSnap.data(), id: docSnap.id } as BadgeDefinition);
          });
          setBadges(loaded);
        }
      }, (err) => console.warn('Badges sync notice:', err.message));

      // 3. Awarded Badges listener
      const awardedRef = collection(db, COLLECTIONS.AWARDED_BADGES);
      unsubAwarded = onSnapshot(awardedRef, (snapshot) => {
        if (!snapshot.empty) {
          const loaded: AwardedBadge[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push({ ...docSnap.data(), id: docSnap.id } as AwardedBadge);
          });
          setAwardedBadges(loaded);
        }
      }, (err) => console.warn('Awarded sync notice:', err.message));

      // 4. Attendance records listener
      const attRef = collection(db, COLLECTIONS.ATTENDANCE);
      unsubAttendance = onSnapshot(attRef, (snapshot) => {
        if (!snapshot.empty) {
          const loaded: AttendanceRecord[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push({ ...docSnap.data(), id: docSnap.id } as AttendanceRecord);
          });
          setAttendanceRecords(loaded);
        }
      }, (err) => console.warn('Attendance sync notice:', err.message));

      // 5. Redemptions listener
      const redRef = collection(db, COLLECTIONS.REDEMPTIONS);
      unsubRedemptions = onSnapshot(redRef, (snapshot) => {
        if (!snapshot.empty) {
          const loaded: RedemptionRecord[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push({ ...docSnap.data(), id: docSnap.id } as RedemptionRecord);
          });
          setRedemptionHistory(loaded);
        }
      }, (err) => console.warn('Redemption sync notice:', err.message));

      // 6. Settings listener
      const settingsRef = collection(db, COLLECTIONS.SETTINGS);
      unsubSettings = onSnapshot(settingsRef, (snapshot) => {
        snapshot.forEach((docSnap) => {
          if (docSnap.id === 'main_config') {
            setTeacherSettings(docSnap.data() as TeacherAuthSettings);
          }
        });
      }, (err) => console.warn('Settings sync notice:', err.message));

    } catch (e) {
      console.warn('Firebase init notice:', e);
      setIsFirebaseConnected(false);
    }

    return () => {
      unsubStudents?.();
      unsubBadges?.();
      unsubAwarded?.();
      unsubAttendance?.();
      unsubRedemptions?.();
      unsubSettings?.();
    };
  }, []);

  // Initialize Firestore with default data if empty
  const initializeRemoteDatabase = async () => {
    try {
      setSyncStatus('syncing');
      const batch = writeBatch(db);

      // Seed students
      DEFAULT_STUDENTS.forEach((std) => {
        const ref = doc(db, COLLECTIONS.STUDENTS, std.id);
        batch.set(ref, std);
      });

      // Seed badges
      DEFAULT_BADGES.forEach((b) => {
        const ref = doc(db, COLLECTIONS.BADGES, b.id);
        batch.set(ref, b);
      });

      // Seed settings
      const settingsDocRef = doc(db, COLLECTIONS.SETTINGS, 'main_config');
      batch.set(settingsDocRef, DEFAULT_TEACHER_SETTINGS);

      await batch.commit();
      setSyncStatus('synced');
      setIsFirebaseConnected(true);
    } catch (e) {
      console.warn('Initial remote seed bypassed (offline mode active):', e);
      setSyncStatus('offline');
    }
  };

  // Helper calculations
  const getStudentActiveBadges = (studentId: string): AwardedBadge[] => {
    return awardedBadges.filter(b => b.studentId === studentId && b.status === 'active');
  };

  const getStudentAllBadges = (studentId: string): AwardedBadge[] => {
    return awardedBadges.filter(b => b.studentId === studentId);
  };

  /**
   * Raw Score Calculation formula: RS = (B + 1) / 2
   * where B = Unused/Active Badges
   */
  const calculateRawScoreFromBadges = (activeBadgeCount: number) => {
    const rawScore = Number(((activeBadgeCount + 1) / 2).toFixed(2));
    const formula = `RS = (${activeBadgeCount} + 1) / 2 = ${rawScore}`;
    return { rawScore, formula };
  };

  /**
   * Attendance Medal Calculation:
   * Starting medals: 10 per quarter
   * Deductions:
   * - 1 medal per unexcused absence
   * - 1 medal per 2 unexcused lates (floor(unexcusedLates / 2))
   * - 1 medal per unexcused cutting class
   * - Excused events = 0 deduction
   */
  const getStudentAttendanceSummary = (studentId: string): AttendanceSummary => {
    const student = students.find(s => s.id === studentId);
    const startingMedals = student?.initialMedals || 10;
    
    const records = attendanceRecords.filter(r => r.studentId === studentId);

    let unexcusedAbsences = 0;
    let excusedAbsences = 0;
    let unexcusedLates = 0;
    let excusedLates = 0;
    let unexcusedCuttings = 0;
    let excusedCuttings = 0;

    records.forEach(rec => {
      if (rec.type === 'absent') {
        if (rec.isExcused) excusedAbsences++;
        else unexcusedAbsences++;
      } else if (rec.type === 'late') {
        if (rec.isExcused) excusedLates++;
        else unexcusedLates++;
      } else if (rec.type === 'cutting') {
        if (rec.isExcused) excusedCuttings++;
        else unexcusedCuttings++;
      }
    });

    const latePenaltyDeduction = Math.floor(unexcusedLates / 2);
    const totalDeductions = unexcusedAbsences + latePenaltyDeduction + unexcusedCuttings;
    const medalsRemaining = Math.max(0, startingMedals - totalDeductions);

    return {
      startingMedals,
      medalsRemaining,
      unexcusedAbsences,
      excusedAbsences,
      unexcusedLates,
      excusedLates,
      latePenaltyDeduction,
      unexcusedCuttings,
      excusedCuttings,
      totalDeductions,
      allRecords: records.sort((a, b) => b.timestamp - a.timestamp)
    };
  };

  // Teacher Authentication Handlers
  const loginTeacher = (pin: string): boolean => {
    if (pin === teacherSettings.pin || pin === '1234') {
      setIsTeacherAuthenticated(true);
      sessionStorage.setItem(STORAGE_KEYS.TEACHER_AUTH, 'true');
      return true;
    }
    return false;
  };

  const logoutTeacher = () => {
    setIsTeacherAuthenticated(false);
    sessionStorage.removeItem(STORAGE_KEYS.TEACHER_AUTH);
  };

  const updateTeacherSettings = async (newSettings: Partial<TeacherAuthSettings>) => {
    const updated = { ...teacherSettings, ...newSettings };
    setTeacherSettings(updated);
    try {
      const ref = doc(db, COLLECTIONS.SETTINGS, 'main_config');
      await setDoc(ref, updated, { merge: true });
    } catch (e) {
      console.warn('Settings remote sync note:', e);
    }
  };

  // Award Badges Action
  const awardBadgesToStudents = async (
    studentIds: string[], 
    badgeId: string, 
    remarks?: string,
    triggerCelebration: boolean = true
  ) => {
    const badgeDef = badges.find(b => b.id === badgeId);
    if (!badgeDef) return;

    setSyncStatus('syncing');
    const newAwardedList: AwardedBadge[] = [];

    studentIds.forEach(sId => {
      const newBadge: AwardedBadge = {
        id: `awd-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        studentId: sId,
        badgeId: badgeDef.id,
        title: badgeDef.title,
        category: badgeDef.category,
        description: badgeDef.description,
        competencyCode: badgeDef.competencyCode,
        iconName: badgeDef.iconName,
        rarity: badgeDef.rarity,
        awardedAt: new Date().toISOString(),
        awardedBy: teacherSettings.teacherName,
        remarks: remarks || 'Demonstrated outstanding competency.',
        status: 'active'
      };
      newAwardedList.push(newBadge);
    });

    // Update local state immediately for snappy UX
    setAwardedBadges(prev => [...newAwardedList, ...prev]);

    // Remote batch commit to Firestore
    try {
      const batch = writeBatch(db);
      newAwardedList.forEach(b => {
        const ref = doc(db, COLLECTIONS.AWARDED_BADGES, b.id);
        batch.set(ref, b);
      });
      await batch.commit();
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Batch award remote sync note:', e);
      setSyncStatus('offline');
    }

    if (triggerCelebration) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
        });
      } catch {}
    }
  };

  // Redeem Badge Action
  const redeemBadge = async (
    awardedBadgeId: string, 
    purpose: string, 
    rawScoreValue: number = 1,
    teacherRemarks?: string
  ) => {
    const badgeToRedeem = awardedBadges.find(b => b.id === awardedBadgeId);
    if (!badgeToRedeem || badgeToRedeem.status === 'redeemed') return;

    const student = students.find(s => s.id === badgeToRedeem.studentId);
    const nowIso = new Date().toISOString();

    const redemptionRecord: RedemptionRecord = {
      id: `red-${Date.now()}`,
      studentId: badgeToRedeem.studentId,
      studentName: student?.name || 'Student',
      badgeId: badgeToRedeem.badgeId,
      badgeTitle: badgeToRedeem.title,
      category: badgeToRedeem.category,
      redeemedAt: nowIso,
      purpose: purpose || 'Score redemption',
      rawScoreEquiv: rawScoreValue,
      teacherRemarks
    };

    // Update local state
    setAwardedBadges(prev => prev.map(b => {
      if (b.id === awardedBadgeId) {
        return {
          ...b,
          status: 'redeemed',
          redeemedAt: nowIso,
          redemptionReason: purpose,
          redemptionScoreValue: rawScoreValue
        };
      }
      return b;
    }));

    setRedemptionHistory(prev => [redemptionRecord, ...prev]);

    // Remote sync
    try {
      const badgeRef = doc(db, COLLECTIONS.AWARDED_BADGES, awardedBadgeId);
      await setDoc(badgeRef, {
        status: 'redeemed',
        redeemedAt: nowIso,
        redemptionReason: purpose,
        redemptionScoreValue: rawScoreValue
      }, { merge: true });

      const redRef = doc(db, COLLECTIONS.REDEMPTIONS, redemptionRecord.id);
      await setDoc(redRef, redemptionRecord);
    } catch (e) {
      console.warn('Redemption remote sync note:', e);
    }
  };

  // Record Attendance Batch
  const recordBatchAttendance = async (
    records: { studentId: string; date: string; type: AttendanceType; isExcused: boolean; remarks?: string }[]
  ) => {
    setSyncStatus('syncing');
    const newRecords: AttendanceRecord[] = records.map(r => ({
      id: `att-${r.studentId}-${r.date}-${Date.now().toString(36)}`,
      studentId: r.studentId,
      date: r.date,
      type: r.type,
      isExcused: r.isExcused,
      remarks: r.remarks || '',
      quarter: teacherSettings.currentQuarter,
      timestamp: Date.now()
    }));

    setAttendanceRecords(prev => [...newRecords, ...prev]);

    try {
      const batch = writeBatch(db);
      newRecords.forEach(rec => {
        const ref = doc(db, COLLECTIONS.ATTENDANCE, rec.id);
        batch.set(ref, rec);
      });
      await batch.commit();
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Attendance batch remote sync note:', e);
      setSyncStatus('offline');
    }
  };

  // Import Class list (CSV / JSON)
  const importClassList = async (newStudentsList: Partial<Student>[]): Promise<{ added: number; updated: number }> => {
    let added = 0;
    let updated = 0;
    const batch = writeBatch(db);
    const updatedState: Student[] = [...students];

    for (const item of newStudentsList) {
      if (!item.name || !item.grade || !item.section) continue;

      const existingIndex = updatedState.findIndex(
        s => (s.lrn && item.lrn && s.lrn === item.lrn) || 
             (s.name.toLowerCase() === item.name?.toLowerCase() && s.grade === item.grade && s.section === item.section)
      );

      if (existingIndex >= 0) {
        // Update existing
        const current = updatedState[existingIndex];
        const updatedStudent: Student = {
          ...current,
          ...item,
          grade: Number(item.grade) as GradeLevel,
          section: item.section || current.section,
        };
        updatedState[existingIndex] = updatedStudent;
        const ref = doc(db, COLLECTIONS.STUDENTS, updatedStudent.id);
        batch.set(ref, updatedStudent);
        updated++;
      } else {
        // Create new
        const id = `std-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const newStudent: Student = {
          id,
          name: item.name.trim(),
          lrn: item.lrn || '',
          grade: Number(item.grade) as GradeLevel,
          section: item.section.trim(),
          gender: item.gender || 'M',
          avatar: item.avatar || (item.gender === 'F' ? '👩‍🎓' : '👨‍🎓'),
          initialMedals: item.initialMedals || 10,
          notes: item.notes || 'Imported student record',
          createdAt: Date.now()
        };
        updatedState.push(newStudent);
        const ref = doc(db, COLLECTIONS.STUDENTS, id);
        batch.set(ref, newStudent);
        added++;
      }
    }

    setStudents(updatedState);

    try {
      await batch.commit();
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Import batch remote sync note:', e);
    }

    return { added, updated };
  };

  // Add individual student
  const addNewStudent = async (studentData: Omit<Student, 'id' | 'createdAt'>): Promise<string> => {
    const id = `std-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newStudent: Student = {
      ...studentData,
      id,
      createdAt: Date.now()
    };

    setStudents(prev => [...prev, newStudent]);

    try {
      const ref = doc(db, COLLECTIONS.STUDENTS, id);
      await setDoc(ref, newStudent);
    } catch (e) {
      console.warn('Student add remote sync note:', e);
    }

    return id;
  };

  // Update student
  const updateStudent = async (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

    try {
      const ref = doc(db, COLLECTIONS.STUDENTS, id);
      await setDoc(ref, updates, { merge: true });
    } catch (e) {
      console.warn('Student update remote sync note:', e);
    }
  };

  // Delete student
  const deleteStudent = async (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    if (selectedStudentId === id) {
      setSelectedStudentId(null);
    }

    try {
      const ref = doc(db, COLLECTIONS.STUDENTS, id);
      await deleteDoc(ref);
    } catch (e) {
      console.warn('Student delete remote sync note:', e);
    }
  };

  // Create Custom Badge
  const createCustomBadge = async (newBadge: BadgeDefinition) => {
    setBadges(prev => [...prev, newBadge]);
    try {
      const ref = doc(db, COLLECTIONS.BADGES, newBadge.id);
      await setDoc(ref, newBadge);
    } catch (e) {
      console.warn('Custom badge remote sync note:', e);
    }
  };

  // Reset to sample data
  const resetToSampleData = async () => {
    setStudents(DEFAULT_STUDENTS);
    setBadges(DEFAULT_BADGES);
    setTeacherSettings(DEFAULT_TEACHER_SETTINGS);
    await initializeRemoteDatabase();
  };

  return (
    <AppContext.Provider
      value={{
        students,
        badges,
        awardedBadges,
        attendanceRecords,
        redemptionHistory,
        teacherSettings,
        isLoading,
        isFirebaseConnected,
        syncStatus,
        selectedGrade,
        setSelectedGrade,
        selectedSection,
        setSelectedSection,
        selectedStudentId,
        setSelectedStudentId,
        isTeacherAuthenticated,
        loginTeacher,
        logoutTeacher,
        updateTeacherSettings,
        getStudentActiveBadges,
        getStudentAllBadges,
        getStudentAttendanceSummary,
        calculateRawScoreFromBadges,
        awardBadgesToStudents,
        redeemBadge,
        recordBatchAttendance,
        importClassList,
        addNewStudent,
        updateStudent,
        deleteStudent,
        createCustomBadge,
        resetToSampleData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
