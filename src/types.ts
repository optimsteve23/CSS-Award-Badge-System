export type GradeLevel = 8 | 9 | 10;

export type BadgeCategory = 'hardware' | 'networking' | 'software' | 'safety' | 'conduct' | 'achievement';

export type BadgeRarity = 'bronze' | 'silver' | 'gold' | 'diamond' | 'master';

export type AttendanceType = 'present' | 'absent' | 'late' | 'cutting';

export interface Student {
  id: string;
  name: string;
  lrn?: string;
  grade: GradeLevel;
  section: string;
  gender?: 'M' | 'F';
  avatar?: string;
  quarter?: number;
  initialMedals?: number;
  notes?: string;
  createdAt: number;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  category: BadgeCategory;
  description: string;
  competencyCode?: string;
  iconName: string;
  rarity: BadgeRarity;
  colorScheme: string; // Tailwind color token
  recommendedCriteria?: string;
}

export interface AwardedBadge {
  id: string;
  studentId: string;
  badgeId: string;
  title: string;
  category: BadgeCategory;
  description: string;
  competencyCode?: string;
  iconName: string;
  rarity: BadgeRarity;
  awardedAt: string; // ISO date
  awardedBy: string;
  remarks?: string;
  status: 'active' | 'redeemed';
  redeemedAt?: string;
  redemptionReason?: string;
  redemptionScoreValue?: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  type: AttendanceType;
  isExcused: boolean;
  remarks?: string;
  quarter: number;
  timestamp: number;
}

export interface RedemptionRecord {
  id: string;
  studentId: string;
  studentName: string;
  badgeId: string;
  badgeTitle: string;
  category: BadgeCategory;
  requestedAt?: string;
  redeemedAt: string;
  purpose: string; // e.g. "Lab Practical Exam +5", "Quiz Re-take", "Midterm Bonus"
  rawScoreEquiv: number;
  teacherRemarks?: string;
}

export interface RubricMapping {
  rubricScore: number;
  rawScore: number;
  label: string;
  descriptor: string;
}

export interface TeacherAuthSettings {
  pin: string;
  teacherName: string;
  schoolName: string;
  currentQuarter: number;
  subjectTitle: string;
}
