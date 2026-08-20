import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { GradeLevel } from '../types';
import { Users, Filter, Search, UserCheck, GraduationCap } from 'lucide-react';
import { GRADE_SECTIONS_MAP } from '../data/defaultData';

interface FilterProps {
  onSelectStudent?: (studentId: string) => void;
  showStudentPicker?: boolean;
}

export const GradeSectionFilter: React.FC<FilterProps> = ({ 
  onSelectStudent,
  showStudentPicker = true 
}) => {
  const { 
    students, 
    selectedGrade, 
    setSelectedGrade, 
    selectedSection, 
    setSelectedSection,
    selectedStudentId,
    setSelectedStudentId
  } = useApp();

  const [searchQuery, setSearchQuery] = React.useState<string>('');

  // Collect available sections dynamically from students dataset or default map
  const availableSections = useMemo(() => {
    if (selectedGrade === 'all') {
      const allSecs = new Set<string>();
      students.forEach(s => allSecs.add(s.section));
      return Array.from(allSecs).sort();
    } else {
      const secs = new Set<string>();
      // from students in this grade
      students.filter(s => s.grade === selectedGrade).forEach(s => secs.add(s.section));
      // from default map
      (GRADE_SECTIONS_MAP[selectedGrade] || []).forEach(s => secs.add(s));
      return Array.from(secs).sort();
    }
  }, [students, selectedGrade]);

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesGrade = selectedGrade === 'all' || student.grade === selectedGrade;
      const matchesSection = selectedSection === 'all' || student.section === selectedSection;
      const matchesSearch = !searchQuery || 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.lrn && student.lrn.includes(searchQuery));
      return matchesGrade && matchesSection && matchesSearch;
    });
  }, [students, selectedGrade, selectedSection, searchQuery]);

  const handleGradeChange = (g: GradeLevel | 'all') => {
    setSelectedGrade(g);
    setSelectedSection('all');
  };

  const handleStudentClick = (id: string) => {
    setSelectedStudentId(id);
    if (onSelectStudent) {
      onSelectStudent(id);
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-4 sm:p-5 shadow-lg shadow-black/20 space-y-4" id="grade-section-filter-card">
      {/* Grade Level Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            1. Select Grade Level
          </label>
          <span className="text-[11px] font-mono text-slate-500">
            {students.length} Total Students
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleGradeChange('all')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              selectedGrade === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
            }`}
            id="filter-grade-all"
          >
            All Grades
          </button>
          {[8, 9, 10].map((grade) => (
            <button
              key={grade}
              type="button"
              onClick={() => handleGradeChange(grade as GradeLevel)}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1 ${
                selectedGrade === grade
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
              }`}
              id={`filter-grade-${grade}`}
            >
              <span className="hidden sm:inline">Grade</span> {grade}
            </button>
          ))}
        </div>
      </div>

      {/* Section Filter Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            2. Select Section
          </label>
          <span className="text-[11px] text-slate-500 font-mono">
            {availableSections.length} Sections
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedSection('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedSection === 'all'
                ? 'bg-slate-100 text-slate-900 font-bold shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
            id="filter-section-all"
          >
            All Sections
          </button>
          {availableSections.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedSection === sec
                  ? 'bg-blue-500 text-white font-semibold shadow-sm shadow-blue-500/30'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
              id={`filter-section-${sec.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Student Picker list */}
      {showStudentPicker && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              3. Choose Student Profile
            </label>
            <span className="text-[11px] text-blue-400 font-mono">
              {filteredStudents.length} Found
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or LRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              id="student-search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Student quick scroll list */}
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 pt-1" id="students-picker-list">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                No students found matching current filters.
              </div>
            ) : (
              filteredStudents.map((student) => {
                const isSelected = selectedStudentId === student.id;
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => handleStudentClick(student.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/50 text-white shadow-sm ring-1 ring-blue-500/30'
                        : 'bg-slate-950/40 border-slate-800/60 text-slate-300 hover:bg-slate-800/40 hover:text-white'
                    }`}
                    id={`student-pick-btn-${student.id}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg flex-shrink-0">{student.avatar || '👨‍🎓'}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate leading-tight">
                          {student.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          Grade {student.grade} • {student.section} {student.lrn ? `• LRN: ${student.lrn}` : ''}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="flex-shrink-0 p-1 rounded-full bg-blue-500 text-white">
                        <UserCheck className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
