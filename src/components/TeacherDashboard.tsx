import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Award, 
  CheckCircle2, 
  Calendar, 
  Calculator, 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Key, 
  Users, 
  FileSpreadsheet, 
  Sparkles, 
  RefreshCw,
  AlertCircle,
  Clock,
  HelpCircle,
  Settings,
  ChevronRight,
  Search,
  Sliders,
  Check,
  X
} from 'lucide-react';
import { GradeLevel, AttendanceType, BadgeDefinition, Student, AwardedBadge } from '../types';
import { IconHelper } from './IconHelper';
import { RubricConverterModal } from './RubricConverterModal';
import { DEFAULT_BADGES, GRADE_SECTIONS_MAP } from '../data/defaultData';

export const TeacherDashboard: React.FC = () => {
  const {
    students,
    badges,
    awardedBadges,
    attendanceRecords,
    redemptionHistory,
    teacherSettings,
    isTeacherAuthenticated,
    loginTeacher,
    logoutTeacher,
    updateTeacherSettings,
    awardBadgesToStudents,
    redeemBadge,
    recordBatchAttendance,
    importClassList,
    addNewStudent,
    updateStudent,
    deleteStudent,
    createCustomBadge,
    resetToSampleData,
    getStudentActiveBadges,
    getStudentAttendanceSummary,
    syncStatus
  } = useApp();

  // Navigation tab inside teacher dashboard
  const [activeTab, setActiveTab] = useState<'award' | 'attendance' | 'redemption' | 'rubric' | 'students' | 'badges' | 'settings'>('award');

  // PIN login state
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Award Tab state
  const [awardGrade, setAwardGrade] = useState<GradeLevel | 'all'>(8);
  const [awardSection, setAwardSection] = useState<string>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>(badges[0]?.id || 'badge-pc-assembly');
  const [awardRemarks, setAwardRemarks] = useState<string>('Demonstrated competency in hands-on CSS laboratory activity.');
  const [isAwarding, setIsAwarding] = useState<boolean>(false);
  const [awardSuccessMsg, setAwardSuccessMsg] = useState<string>('');

  // Attendance Tab state
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceGrade, setAttendanceGrade] = useState<GradeLevel | 'all'>(8);
  const [attendanceSection, setAttendanceSection] = useState<string>('all');
  const [attendanceEntries, setAttendanceEntries] = useState<Record<string, { type: AttendanceType; isExcused: boolean; remarks: string }>>({});
  const [attendanceSavedMsg, setAttendanceSavedMsg] = useState<string>('');

  // Redemption Tab state
  const [redemptionSearch, setRedemptionSearch] = useState<string>('');
  const [selectedBadgeForRedeem, setSelectedBadgeForRedeem] = useState<AwardedBadge | null>(null);
  const [redemptionPurpose, setRedemptionPurpose] = useState<string>('+5 Pts in Lab Practical Exam');
  const [redemptionScoreValue, setRedemptionScoreValue] = useState<number>(5);

  // Import / Export state
  const [importText, setImportText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ msg: string; isError: boolean } | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState<boolean>(false);
  const [newStudentData, setNewStudentData] = useState<{
    name: string;
    lrn: string;
    grade: GradeLevel;
    section: string;
    gender: 'M' | 'F';
    notes: string;
  }>({
    name: '',
    lrn: '',
    grade: 8,
    section: 'Section Archimedes',
    gender: 'M',
    notes: ''
  });

  // Custom Badge Creator state
  const [showAddBadgeModal, setShowAddBadgeModal] = useState<boolean>(false);
  const [newBadgeData, setNewBadgeData] = useState<BadgeDefinition>({
    id: '',
    title: '',
    category: 'hardware',
    competencyCode: 'CSS-LAB-01',
    description: '',
    iconName: 'Cpu',
    rarity: 'gold',
    colorScheme: 'amber',
    recommendedCriteria: ''
  });

  // Settings state
  const [pinSettingsInput, setPinSettingsInput] = useState<string>(teacherSettings.pin);
  const [teacherNameInput, setTeacherNameInput] = useState<string>(teacherSettings.teacherName);
  const [schoolNameInput, setSchoolNameInput] = useState<string>(teacherSettings.schoolName);
  const [quarterInput, setQuarterInput] = useState<number>(teacherSettings.currentQuarter || 1);
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  // Filter students for awarding
  const awardStudentsList = useMemo(() => {
    return students.filter(s => {
      const matchGrade = awardGrade === 'all' || s.grade === awardGrade;
      const matchSection = awardSection === 'all' || s.section === awardSection;
      return matchGrade && matchSection;
    });
  }, [students, awardGrade, awardSection]);

  // Filter students for attendance
  const attendanceStudentsList = useMemo(() => {
    return students.filter(s => {
      const matchGrade = attendanceGrade === 'all' || s.grade === attendanceGrade;
      const matchSection = attendanceSection === 'all' || s.section === attendanceSection;
      return matchGrade && matchSection;
    });
  }, [students, attendanceGrade, attendanceSection]);

  // Initialize attendance entries when students or date change
  React.useEffect(() => {
    const initial: Record<string, { type: AttendanceType; isExcused: boolean; remarks: string }> = {};
    attendanceStudentsList.forEach(s => {
      // Check if existing record for this date
      const existing = attendanceRecords.find(r => r.studentId === s.id && r.date === attendanceDate);
      if (existing) {
        initial[s.id] = {
          type: existing.type,
          isExcused: existing.isExcused,
          remarks: existing.remarks || ''
        };
      } else {
        initial[s.id] = {
          type: 'present',
          isExcused: false,
          remarks: ''
        };
      }
    });
    setAttendanceEntries(initial);
  }, [attendanceStudentsList, attendanceDate, attendanceRecords]);

  // Handle PIN Login
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginTeacher(pinInput)) {
      setPinError('');
      setPinInput('');
    } else {
      setPinError('Incorrect PIN code. Default is 1234.');
    }
  };

  // Quick Keypad press
  const handleKeypadPress = (num: string) => {
    if (pinInput.length < 6) {
      setPinInput(prev => prev + num);
    }
  };

  // Handle Batch Award
  const handleExecuteAward = async () => {
    if (selectedStudentIds.length === 0) {
      alert('Please select at least one student to award the badge.');
      return;
    }
    setIsAwarding(true);
    await awardBadgesToStudents(selectedStudentIds, selectedBadgeId, awardRemarks, true);
    setIsAwarding(false);
    setAwardSuccessMsg(`Successfully awarded badge to ${selectedStudentIds.length} student(s)!`);
    setSelectedStudentIds([]);
    setTimeout(() => setAwardSuccessMsg(''), 4000);
  };

  // Handle Select All in Award tab
  const handleToggleSelectAllAward = () => {
    if (selectedStudentIds.length === awardStudentsList.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(awardStudentsList.map(s => s.id));
    }
  };

  // Handle Attendance Save
  const handleSaveAttendance = async () => {
    const recordsToSave = attendanceStudentsList.map(s => {
      const entry = attendanceEntries[s.id] || { type: 'present', isExcused: false, remarks: '' };
      return {
        studentId: s.id,
        date: attendanceDate,
        type: entry.type,
        isExcused: entry.isExcused,
        remarks: entry.remarks
      };
    });

    await recordBatchAttendance(recordsToSave);
    setAttendanceSavedMsg(`Attendance saved for ${recordsToSave.length} students on ${attendanceDate}!`);
    setTimeout(() => setAttendanceSavedMsg(''), 4000);
  };

  // Handle Mark All Present
  const handleMarkAllPresent = () => {
    const updated: Record<string, { type: AttendanceType; isExcused: boolean; remarks: string }> = {};
    attendanceStudentsList.forEach(s => {
      updated[s.id] = { type: 'present', isExcused: false, remarks: '' };
    });
    setAttendanceEntries(prev => ({ ...prev, ...updated }));
  };

  // Handle Badge Redemption Execution
  const handleConfirmRedemption = async () => {
    if (!selectedBadgeForRedeem) return;
    await redeemBadge(
      selectedBadgeForRedeem.id, 
      redemptionPurpose, 
      redemptionScoreValue,
      `Approved by ${teacherSettings.teacherName}`
    );
    setSelectedBadgeForRedeem(null);
  };

  // Handle CSV / JSON Import
  const handleProcessImport = async () => {
    if (!importText.trim()) {
      setImportStatus({ msg: 'Please paste CSV or JSON content.', isError: true });
      return;
    }

    try {
      let parsedStudents: Partial<Student>[] = [];

      if (importText.trim().startsWith('[') || importText.trim().startsWith('{')) {
        // Parse as JSON
        const raw = JSON.parse(importText);
        parsedStudents = Array.isArray(raw) ? raw : [raw];
      } else {
        // Parse as CSV (format: Name, Grade, Section, LRN, Gender, Notes)
        const lines = importText.trim().split('\n');
        const header = lines[0].toLowerCase();
        const startIndex = header.includes('name') || header.includes('grade') ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (cols.length >= 3) {
            parsedStudents.push({
              name: cols[0],
              grade: Number(cols[1]) as GradeLevel,
              section: cols[2],
              lrn: cols[3] || '',
              gender: (cols[4]?.toUpperCase() === 'F' ? 'F' : 'M') as 'M' | 'F',
              notes: cols[5] || ''
            });
          }
        }
      }

      if (parsedStudents.length === 0) {
        setImportStatus({ msg: 'No valid student records found in input.', isError: true });
        return;
      }

      const res = await importClassList(parsedStudents);
      setImportStatus({
        msg: `Import complete: ${res.added} student(s) added, ${res.updated} updated!`,
        isError: false
      });
      setImportText('');
    } catch (e: any) {
      setImportStatus({ msg: `Failed to parse import data: ${e.message}`, isError: true });
    }
  };

  // Download Sample CSV
  const handleDownloadSampleCSV = () => {
    const sample = `Name,Grade,Section,LRN,Gender,Notes
"Juan Dela Cruz",8,"Section Archimedes","109876543201","M","Excels at PC Disassembly"
"Maria Santos",8,"Section Archimedes","109876543202","F","Top in safety OHS"
"Gabriel Silang",9,"Section Turing","109876543211","M","Speed crimper"
"Bea Gomez",10,"Section Lovelace","109876543221","F","NC II candidate"`;

    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CSS_Class_List_Sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export all class data as CSV
  const handleExportDataCSV = () => {
    let csv = 'Student ID,Name,LRN,Grade,Section,Active Badges,Redeemed Badges,Raw Score (RS),Attendance Medals Remaining\n';
    students.forEach(s => {
      const activeB = getStudentActiveBadges(s.id).length;
      const allB = awardedBadges.filter(b => b.studentId === s.id).length;
      const redeemedB = allB - activeB;
      const rs = ((activeB + 1) / 2).toFixed(2);
      const att = getStudentAttendanceSummary(s.id);

      csv += `"${s.id}","${s.name}","${s.lrn || ''}",${s.grade},"${s.section}",${activeB},${redeemedB},${rs},${att.medalsRemaining}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CSS_Grades_Badges_Attendance_Q${teacherSettings.currentQuarter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTeacherSettings({
      pin: pinSettingsInput,
      teacherName: teacherNameInput,
      schoolName: schoolNameInput,
      currentQuarter: Number(quarterInput)
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // If Teacher is not authenticated, show secure PIN screen
  if (!isTeacherAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6" id="teacher-pin-lock-screen">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white font-display">
            Teacher Portal Access
          </h2>
          <p className="text-xs text-slate-400">
            Enter your 4-digit security PIN to access badge awarding, attendance marking, and redemption controls.
          </p>
        </div>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block text-center">
              Security PIN Code
            </label>
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="w-full text-center text-3xl tracking-widest font-mono font-bold py-3 px-4 rounded-2xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              id="teacher-pin-input"
              autoFocus
            />
          </div>

          {pinError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs text-center flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {pinError}
            </div>
          )}

          {/* Quick Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (k === 'C') setPinInput('');
                  else if (k === '⌫') setPinInput(prev => prev.slice(0, -1));
                  else handleKeypadPress(k);
                }}
                className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:bg-blue-600 text-slate-200 hover:text-white font-mono font-bold text-lg transition-all border border-slate-700/50"
              >
                {k}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            id="teacher-pin-submit-btn"
          >
            <Unlock className="w-4 h-4" />
            Unlock Teacher Dashboard
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
          <span>Default Teacher PIN is: </span>
          <code className="px-2 py-0.5 rounded bg-slate-950 text-blue-400 font-mono font-bold">1234</code>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="teacher-dashboard-main">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white font-display">
                {teacherSettings.teacherName} (Teacher Dashboard)
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                Authenticated
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {teacherSettings.subjectTitle} • Quarter {teacherSettings.currentQuarter} • {teacherSettings.schoolName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={logoutTeacher}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
            id="teacher-logout-btn"
          >
            <Lock className="w-3.5 h-3.5" />
            Lock Dashboard
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3" id="teacher-tabs-nav">
        {[
          { id: 'award', label: 'Award Badges', icon: Award },
          { id: 'attendance', label: 'Attendance Tracker', icon: Clock },
          { id: 'redemption', label: 'Redemption Approval', icon: CheckCircle2 },
          { id: 'rubric', label: 'Rubric Converter', icon: Calculator },
          { id: 'students', label: 'Class & Database Import', icon: Users },
          { id: 'badges', label: 'Badge Library', icon: Sparkles },
          { id: 'settings', label: 'Settings & PIN', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
              id={`teacher-tab-${tab.id}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: AWARD BADGES */}
      {activeTab === 'award' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="teacher-award-section">
          {/* Left Column: Student Selection */}
          <div className="lg:col-span-6 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-display">
                <Users className="w-4 h-4 text-blue-400" />
                1. Select Recipients ({selectedStudentIds.length} Selected)
              </h3>
              <button
                type="button"
                onClick={handleToggleSelectAllAward}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                id="award-select-all-btn"
              >
                {selectedStudentIds.length === awardStudentsList.length ? 'Deselect All' : 'Select All in Filter'}
              </button>
            </div>

            {/* Filter Grade & Section */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Grade:</label>
                <select
                  value={awardGrade}
                  onChange={(e) => {
                    const val = e.target.value === 'all' ? 'all' : Number(e.target.value) as GradeLevel;
                    setAwardGrade(val);
                    setAwardSection('all');
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                  id="award-grade-select"
                >
                  <option value="all">All Grades</option>
                  <option value={8}>Grade 8</option>
                  <option value={9}>Grade 9</option>
                  <option value={10}>Grade 10</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Section:</label>
                <select
                  value={awardSection}
                  onChange={(e) => setAwardSection(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                  id="award-section-select"
                >
                  <option value="all">All Sections</option>
                  {awardGrade !== 'all' && (GRADE_SECTIONS_MAP[awardGrade] || []).map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                  {awardGrade === 'all' && Array.from(new Set(students.map(s => s.section))).map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Student checkboxes */}
            <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1 border border-slate-800 rounded-xl p-2 bg-slate-950/50" id="award-students-checklist">
              {awardStudentsList.map((student) => {
                const isChecked = selectedStudentIds.includes(student.id);
                const activeCount = getStudentActiveBadges(student.id).length;
                return (
                  <label
                    key={student.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-blue-600/15 border-blue-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudentIds(prev => [...prev, student.id]);
                          } else {
                            setSelectedStudentIds(prev => prev.filter(id => id !== student.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-950 cursor-pointer"
                      />
                      <span className="text-base">{student.avatar || '👨‍🎓'}</span>
                      <div>
                        <p className="text-xs font-bold">{student.name}</p>
                        <p className="text-[10px] text-slate-400">Grade {student.grade} • {student.section}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800">
                      {activeCount} Active
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Right Column: Badge & Remarks Selection */}
          <div className="lg:col-span-6 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-display">
                <Sparkles className="w-4 h-4 text-blue-400" />
                2. Choose Badge & Remarks
              </h3>

              {/* Badge selector list */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Available CSS Badges ({badges.length}):</label>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 border border-slate-800 rounded-xl p-2 bg-slate-950/50" id="award-badges-list">
                  {badges.map((badge) => {
                    const isSelected = selectedBadgeId === badge.id;
                    return (
                      <div
                        key={badge.id}
                        onClick={() => setSelectedBadgeId(badge.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/20'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 flex-shrink-0">
                          <IconHelper name={badge.iconName} size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold truncate">{badge.title}</h4>
                            <span className="text-[10px] font-mono uppercase font-bold text-blue-400">
                              {badge.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{badge.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Teacher Remarks input */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Custom Teacher Remarks / Lab Activity Note:</label>
                <input
                  type="text"
                  value={awardRemarks}
                  onChange={(e) => setAwardRemarks(e.target.value)}
                  placeholder="e.g. Lab Activity #3: Straight-through cable termination 100% pass."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  id="award-remarks-input"
                />
              </div>

              {awardSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {awardSuccessMsg}
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={isAwarding || selectedStudentIds.length === 0}
              onClick={handleExecuteAward}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                selectedStudentIds.length > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              id="award-execute-btn"
            >
              <Award className="w-4 h-4" />
              Award Badge to {selectedStudentIds.length} Student{selectedStudentIds.length === 1 ? '' : 's'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE TRACKER */}
      {activeTab === 'attendance' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-5 shadow-lg" id="teacher-attendance-section">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Quarter Attendance Marker
              </h3>
              <p className="text-xs text-slate-400">
                10 Medals starting base • -1 per absence, -1 per 2 lates, -1 per cutting class • Toggle excused for 0 deduction
              </p>
            </div>

            {/* Quick date & section filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  id="attendance-date-input"
                />
              </div>

              <div>
                <select
                  value={attendanceGrade}
                  onChange={(e) => {
                    const val = e.target.value === 'all' ? 'all' : Number(e.target.value) as GradeLevel;
                    setAttendanceGrade(val);
                    setAttendanceSection('all');
                  }}
                  className="px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                  id="attendance-grade-select"
                >
                  <option value="all">All Grades</option>
                  <option value={8}>Grade 8</option>
                  <option value={9}>Grade 9</option>
                  <option value={10}>Grade 10</option>
                </select>
              </div>

              <div>
                <select
                  value={attendanceSection}
                  onChange={(e) => setAttendanceSection(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                  id="attendance-section-select"
                >
                  <option value="all">All Sections</option>
                  {attendanceGrade !== 'all' && (GRADE_SECTIONS_MAP[attendanceGrade] || []).map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                  {attendanceGrade === 'all' && Array.from(new Set(students.map(s => s.section))).map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition-all"
                id="attendance-mark-all-present-btn"
              >
                Mark All Present
              </button>
            </div>
          </div>

          {attendanceSavedMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {attendanceSavedMsg}
            </div>
          )}

          {/* Students Attendance Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">Status Selection</th>
                  <th className="px-4 py-3 font-semibold">Excused Toggle</th>
                  <th className="px-4 py-3 font-semibold">Remarks / Reason</th>
                  <th className="px-4 py-3 font-semibold text-right">Remaining Medals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {attendanceStudentsList.map((student) => {
                  const currentEntry = attendanceEntries[student.id] || { type: 'present', isExcused: false, remarks: '' };
                  const attSummary = getStudentAttendanceSummary(student.id);

                  return (
                    <tr key={student.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{student.avatar || '👨‍🎓'}</span>
                          <div>
                            <span className="font-bold text-white block">{student.name}</span>
                            <span className="text-[10px] text-slate-400">Grade {student.grade} • {student.section}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status radio buttons */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {[
                            { type: 'present', label: 'Present', color: 'text-emerald-400' },
                            { type: 'late', label: 'Late', color: 'text-amber-400' },
                            { type: 'absent', label: 'Absent', color: 'text-rose-400' },
                            { type: 'cutting', label: 'Cutting', color: 'text-red-400' }
                          ].map((st) => (
                            <button
                              key={st.type}
                              type="button"
                              onClick={() => {
                                setAttendanceEntries(prev => ({
                                  ...prev,
                                  [student.id]: {
                                    ...prev[student.id],
                                    type: st.type as AttendanceType
                                  }
                                }));
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                currentEntry.type === st.type
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Excused Toggle */}
                      <td className="px-4 py-3">
                        {currentEntry.type !== 'present' ? (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentEntry.isExcused}
                              onChange={(e) => {
                                setAttendanceEntries(prev => ({
                                  ...prev,
                                  [student.id]: {
                                    ...prev[student.id],
                                    isExcused: e.target.checked
                                  }
                                }));
                              }}
                              className="w-4 h-4 rounded border-slate-700 text-emerald-600 bg-slate-950 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className={`text-xs font-semibold ${currentEntry.isExcused ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {currentEntry.isExcused ? 'Excused (0 Ded.)' : 'Unexcused'}
                            </span>
                          </label>
                        ) : (
                          <span className="text-slate-600 text-xs font-mono">-</span>
                        )}
                      </td>

                      {/* Remarks */}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Optional remarks (e.g. excuse letter, clinic visit)..."
                          value={currentEntry.remarks}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAttendanceEntries(prev => ({
                              ...prev,
                              [student.id]: {
                                ...prev[student.id],
                                remarks: val
                              }
                            }));
                          }}
                          className="w-full px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                        />
                      </td>

                      {/* Remaining Medals Metric */}
                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          attSummary.medalsRemaining >= 8 ? 'bg-emerald-500/20 text-emerald-300' :
                          attSummary.medalsRemaining >= 5 ? 'bg-amber-500/20 text-amber-300' :
                          'bg-rose-500/20 text-rose-300'
                        }`}>
                          {attSummary.medalsRemaining} / 10 Medals
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveAttendance}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/30 flex items-center gap-2"
              id="attendance-save-all-btn"
            >
              <Check className="w-4 h-4" />
              Save Attendance for {attendanceStudentsList.length} Students
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: REDEMPTION APPROVAL */}
      {activeTab === 'redemption' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-5 shadow-lg" id="teacher-redemption-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                Badge Redemption & Score Conversion Approvals
              </h3>
              <p className="text-xs text-slate-400">
                Deduct "Active Badges" when students redeem them for quiz boosters, lab practical retakes, or exam bonuses.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search active badges / students..."
                value={redemptionSearch}
                onChange={(e) => setRedemptionSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                id="redemption-search-input"
              />
            </div>
          </div>

          {/* Active Badges List across all students */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Badges Available for Redemption ({awardedBadges.filter(b => b.status === 'active').length}):
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {awardedBadges
                .filter(b => b.status === 'active')
                .filter(b => {
                  const student = students.find(s => s.id === b.studentId);
                  const searchStr = `${b.title} ${student?.name || ''} ${b.category}`.toLowerCase();
                  return !redemptionSearch || searchStr.includes(redemptionSearch.toLowerCase());
                })
                .map((badge) => {
                  const student = students.find(s => s.id === badge.studentId);
                  return (
                    <div
                      key={badge.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400">
                            <IconHelper name={badge.iconName} size={20} />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white">{badge.title}</h5>
                            <span className="text-[10px] text-blue-400 font-mono">
                              {badge.competencyCode || badge.category}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ACTIVE
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-200">{student?.name || 'Unknown Student'}</span>
                          <span className="text-[10px] text-slate-500 block">Grade {student?.grade} • {student?.section}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedBadgeForRedeem(badge)}
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-sm"
                          id={`redeem-btn-${badge.id}`}
                        >
                          Redeem
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Historical Redemption Audit Log */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Redemption Audit History ({redemptionHistory.length} Logged):
            </h4>

            {redemptionHistory.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No badges redeemed yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2.5">Date</th>
                      <th className="px-3 py-2.5">Student</th>
                      <th className="px-3 py-2.5">Badge Redeemed</th>
                      <th className="px-3 py-2.5">Purpose / Subject</th>
                      <th className="px-3 py-2.5 text-right">Score Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 font-mono text-slate-300">
                    {redemptionHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/40">
                        <td className="px-3 py-2 text-slate-400">
                          {new Date(item.redeemedAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 font-sans font-semibold text-white">
                          {item.studentName}
                        </td>
                        <td className="px-3 py-2 font-sans text-blue-300">
                          {item.badgeTitle}
                        </td>
                        <td className="px-3 py-2 font-sans text-slate-300">
                          {item.purpose}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-400">
                          +{item.rawScoreEquiv} Pt
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Redemption Modal */}
          {selectedBadgeForRedeem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white font-display">
                    Approve Badge Redemption
                  </h3>
                  <button onClick={() => setSelectedBadgeForRedeem(null)} className="text-slate-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <p className="font-semibold text-white">{selectedBadgeForRedeem.title}</p>
                  <p className="text-slate-400">{selectedBadgeForRedeem.description}</p>
                  <p className="text-[11px] text-blue-400 font-mono">
                    Recipient: {students.find(s => s.id === selectedBadgeForRedeem.studentId)?.name}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Redemption Purpose / Benefit:</label>
                    <input
                      type="text"
                      value={redemptionPurpose}
                      onChange={(e) => setRedemptionPurpose(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                      placeholder="e.g. +5 Points in Lab Exam #2"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Score Value Equivalent:</label>
                    <input
                      type="number"
                      value={redemptionScoreValue}
                      onChange={(e) => setRedemptionScoreValue(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs">
                  ⚠️ <strong>Notice:</strong> Once redeemed, this badge will be greyed out with a "USED" tag in the student's digital trophy case, and deducted from their active badge count $B$ in $RS = (B+1)/2$.
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBadgeForRedeem(null)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRedemption}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/30"
                  >
                    Confirm & Deduct
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RUBRIC CONVERTER (Embedded) */}
      {activeTab === 'rubric' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg">
          <RubricConverterModal isEmbedded={true} />
        </div>
      )}

      {/* TAB 5: CLASS & DATABASE MANAGEMENT */}
      {activeTab === 'students' && (
        <div className="space-y-6" id="teacher-database-import-section">
          {/* Top Action Bar */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Class List & Database Importer
              </h3>
              <p className="text-xs text-slate-400">
                Safely upload or export student rosters into Firestore with grade, section, and LRN metadata
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSampleCSV}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
                id="download-sample-csv-btn"
              >
                <Download className="w-3.5 h-3.5" />
                Sample CSV Template
              </button>

              <button
                type="button"
                onClick={handleExportDataCSV}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
                id="export-class-csv-btn"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                Export Full Class CSV
              </button>

              <button
                type="button"
                onClick={() => setShowAddStudentModal(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-blue-500/30"
                id="add-single-student-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Single Student
              </button>
            </div>
          </div>

          {/* Import Paste Area */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-lg">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-blue-400" />
              Batch Upload Class List (CSV or JSON)
            </h4>

            <textarea
              rows={5}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`Paste CSV or JSON here, e.g.:
"Juan Dela Cruz",8,"Section Archimedes","109876543201","M","PC assembly pro"
"Maria Santos",8,"Section Archimedes","109876543202","F","OHS Safety lead"`}
              className="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
              id="import-textarea"
            />

            {importStatus && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                importStatus.isError 
                  ? 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
                  : 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
              }`}>
                {importStatus.isError ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {importStatus.msg}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleProcessImport}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/30 flex items-center gap-2"
                id="process-import-btn"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload and Sync to Firestore
              </button>
            </div>
          </div>

          {/* Current Enrolled Students List */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Enrolled Students ({students.length})
              </h4>
              <button
                type="button"
                onClick={resetToSampleData}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                id="reset-sample-data-btn"
              >
                <RefreshCw className="w-3 h-3" />
                Restore Default Sample Dataset
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Grade & Section</th>
                    <th className="px-4 py-3">LRN</th>
                    <th className="px-4 py-3">Active Badges</th>
                    <th className="px-4 py-3">Raw Score ($RS$)</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {students.map((student) => {
                    const activeCount = getStudentActiveBadges(student.id).length;
                    const rs = ((activeCount + 1) / 2).toFixed(2);

                    return (
                      <tr key={student.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{student.avatar || '👨‍🎓'}</span>
                            <span className="font-bold text-white">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          Grade {student.grade} • {student.section}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-400">
                          {student.lrn || 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-400 font-bold">
                          {activeCount} Badges
                        </td>
                        <td className="px-4 py-3 font-mono text-blue-400 font-bold">
                          {rs} pts
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove ${student.name} from class list?`)) {
                                deleteStudent(student.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded hover:bg-rose-950/30"
                            title="Remove student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Student Modal */}
          {showAddStudentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white font-display">
                    Add New Student
                  </h3>
                  <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 mb-1 block">Full Name:</label>
                    <input
                      type="text"
                      value={newStudentData.name}
                      onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                      placeholder="e.g. Juan C. Dela Cruz"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 mb-1 block">Grade Level:</label>
                      <select
                        value={newStudentData.grade}
                        onChange={(e) => setNewStudentData({ ...newStudentData, grade: Number(e.target.value) as GradeLevel })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                      >
                        <option value={8}>Grade 8</option>
                        <option value={9}>Grade 9</option>
                        <option value={10}>Grade 10</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 mb-1 block">Gender:</label>
                      <select
                        value={newStudentData.gender}
                        onChange={(e) => setNewStudentData({ ...newStudentData, gender: e.target.value as 'M' | 'F' })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                      >
                        <option value="M">Male (👨‍🎓)</option>
                        <option value="F">Female (👩‍🎓)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 mb-1 block">Section Name:</label>
                    <input
                      type="text"
                      value={newStudentData.section}
                      onChange={(e) => setNewStudentData({ ...newStudentData, section: e.target.value })}
                      placeholder="e.g. Section Archimedes"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 mb-1 block">Learner Reference Number (LRN):</label>
                    <input
                      type="text"
                      value={newStudentData.lrn}
                      onChange={(e) => setNewStudentData({ ...newStudentData, lrn: e.target.value })}
                      placeholder="12-digit DepEd LRN"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 mb-1 block">Notes / Specialization:</label>
                    <input
                      type="text"
                      value={newStudentData.notes}
                      onChange={(e) => setNewStudentData({ ...newStudentData, notes: e.target.value })}
                      placeholder="e.g. Lead hardware technician"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newStudentData.name) {
                        alert('Student name is required.');
                        return;
                      }
                      await addNewStudent({
                        name: newStudentData.name,
                        grade: newStudentData.grade,
                        section: newStudentData.section,
                        lrn: newStudentData.lrn,
                        gender: newStudentData.gender,
                        avatar: newStudentData.gender === 'F' ? '👩‍🎓' : '👨‍🎓',
                        notes: newStudentData.notes,
                        initialMedals: 10
                      });
                      setShowAddStudentModal(false);
                      setNewStudentData({
                        name: '',
                        lrn: '',
                        grade: 8,
                        section: 'Section Archimedes',
                        gender: 'M',
                        notes: ''
                      });
                    }}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                  >
                    Add Student
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: BADGE LIBRARY & CREATOR */}
      {activeTab === 'badges' && (
        <div className="space-y-6" id="teacher-badge-library-section">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                CSS Badge Library & Competency Definitions
              </h3>
              <p className="text-xs text-slate-400">
                Technical badge awards mapped to Computer Systems Servicing NC II competencies
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddBadgeModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/30 flex items-center gap-1.5"
              id="create-custom-badge-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Custom Badge
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <IconHelper name={badge.iconName} size={24} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{badge.title}</h4>
                    <span className="text-[10px] text-blue-400 font-mono">
                      {badge.competencyCode || badge.category}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400">{badge.description}</p>

                {badge.recommendedCriteria && (
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300 block">Criteria:</span>
                    {badge.recommendedCriteria}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono uppercase">
                  <span className="text-slate-500">Category: {badge.category}</span>
                  <span className="text-yellow-400 font-bold">Rarity: {badge.rarity}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Badge Modal */}
          {showAddBadgeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white font-display">
                    Create Custom CSS Badge
                  </h3>
                  <button onClick={() => setShowAddBadgeModal(false)} className="text-slate-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 mb-1 block">Badge Title:</label>
                    <input
                      type="text"
                      value={newBadgeData.title}
                      onChange={(e) => setNewBadgeData({ ...newBadgeData, title: e.target.value })}
                      placeholder="e.g. BIOS Firmware Flashing Master"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 mb-1 block">Category:</label>
                      <select
                        value={newBadgeData.category}
                        onChange={(e) => setNewBadgeData({ ...newBadgeData, category: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                      >
                        <option value="hardware">Hardware</option>
                        <option value="networking">Networking</option>
                        <option value="software">Software</option>
                        <option value="safety">OHS Safety</option>
                        <option value="conduct">Conduct & 5S</option>
                        <option value="achievement">Achievement</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 mb-1 block">Rarity:</label>
                      <select
                        value={newBadgeData.rarity}
                        onChange={(e) => setNewBadgeData({ ...newBadgeData, rarity: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                      >
                        <option value="bronze">Bronze</option>
                        <option value="silver">Silver</option>
                        <option value="gold">Gold</option>
                        <option value="diamond">Diamond</option>
                        <option value="master">Master NC-II</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 mb-1 block">Competency Code:</label>
                    <input
                      type="text"
                      value={newBadgeData.competencyCode}
                      onChange={(e) => setNewBadgeData({ ...newBadgeData, competencyCode: e.target.value })}
                      placeholder="e.g. CSS-CO4-FIRM"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 mb-1 block">Description:</label>
                    <textarea
                      rows={2}
                      value={newBadgeData.description}
                      onChange={(e) => setNewBadgeData({ ...newBadgeData, description: e.target.value })}
                      placeholder="Describe the skill or technical competency required..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 mb-1 block">Recommended Award Criteria:</label>
                    <input
                      type="text"
                      value={newBadgeData.recommendedCriteria}
                      onChange={(e) => setNewBadgeData({ ...newBadgeData, recommendedCriteria: e.target.value })}
                      placeholder="e.g. 100% pass on laboratory checklist."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBadgeModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newBadgeData.title) {
                        alert('Badge title is required.');
                        return;
                      }
                      const id = `badge-custom-${Date.now()}`;
                      await createCustomBadge({
                        ...newBadgeData,
                        id
                      });
                      setShowAddBadgeModal(false);
                      setNewBadgeData({
                        id: '',
                        title: '',
                        category: 'hardware',
                        competencyCode: 'CSS-LAB-01',
                        description: '',
                        iconName: 'Cpu',
                        rarity: 'gold',
                        colorScheme: 'amber',
                        recommendedCriteria: ''
                      });
                    }}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                  >
                    Save Badge
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: SETTINGS & PIN */}
      {activeTab === 'settings' && (
        <div className="max-w-xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-lg" id="teacher-settings-section">
          <div className="space-y-1 pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Teacher Account & Quarter Settings
            </h3>
            <p className="text-xs text-slate-400">
              Update teacher credentials, school name, and 4-digit security PIN
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold mb-1 block">Teacher Full Name:</label>
              <input
                type="text"
                value={teacherNameInput}
                onChange={(e) => setTeacherNameInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold mb-1 block">School / TechVoc Department:</label>
              <input
                type="text"
                value={schoolNameInput}
                onChange={(e) => setSchoolNameInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Active Quarter:</label>
                <select
                  value={quarterInput}
                  onChange={(e) => setQuarterInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value={1}>1st Quarter</option>
                  <option value={2}>2nd Quarter</option>
                  <option value={3}>3rd Quarter</option>
                  <option value={4}>4th Quarter</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Teacher Security PIN:</label>
                <input
                  type="text"
                  maxLength={6}
                  value={pinSettingsInput}
                  onChange={(e) => setPinSettingsInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold tracking-widest focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {settingsSaved && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Settings and PIN successfully updated and synchronized to Firestore!
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/30 flex items-center justify-center gap-2"
              id="save-teacher-settings-btn"
            >
              <Check className="w-4 h-4" />
              Save Settings & Update PIN
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
