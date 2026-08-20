import { BadgeDefinition, Student, RubricMapping, TeacherAuthSettings } from '../types';

export const DEFAULT_TEACHER_SETTINGS: TeacherAuthSettings = {
  pin: '1234',
  teacherName: 'Teacher Mark Santos',
  schoolName: 'Junior High School - TechVoc Department',
  currentQuarter: 1,
  subjectTitle: 'TLE - Computer Systems Servicing (CSS)'
};

export const DEFAULT_BADGES: BadgeDefinition[] = [
  {
    id: 'badge-pc-assembly',
    title: 'PC Hardware Specialist',
    category: 'hardware',
    competencyCode: 'CSS-CO1-ASM',
    description: 'Expertly disassembles and reassembles system unit components, applying proper thermal paste and cable management.',
    iconName: 'Cpu',
    rarity: 'gold',
    colorScheme: 'amber',
    recommendedCriteria: '100% working POST boot after complete disassembly.'
  },
  {
    id: 'badge-esd-safety',
    title: 'ESD & OHS Guardian',
    category: 'safety',
    competencyCode: 'CSS-CO1-OHS',
    description: 'Maintains strict compliance with Occupational Health and Safety (OHS) standards, grounding straps, and PPE protocols.',
    iconName: 'ShieldCheck',
    rarity: 'diamond',
    colorScheme: 'emerald',
    recommendedCriteria: 'Zero safety infractions across all practical laboratory activities.'
  },
  {
    id: 'badge-cable-crimping',
    title: 'RJ45 Master Crimper',
    category: 'networking',
    competencyCode: 'CSS-CO2-UTP',
    description: 'Terminates standard T568A and T568B UTP Ethernet cables with 100% pin-out continuity on cable tester on the first attempt.',
    iconName: 'Cable',
    rarity: 'silver',
    colorScheme: 'cyan',
    recommendedCriteria: 'Both Straight-Through and Cross-Over cables pass 8-pin test.'
  },
  {
    id: 'badge-lan-config',
    title: 'Network & Subnet Architect',
    category: 'networking',
    competencyCode: 'CSS-CO2-NET',
    description: 'Configures IPv4 addressing, custom subnets, peer-to-peer file sharing, and printer sharing across lab workstations.',
    iconName: 'Network',
    rarity: 'gold',
    colorScheme: 'blue',
    recommendedCriteria: 'Successful bidirectional ping and shared folder access.'
  },
  {
    id: 'badge-router-wifi',
    title: 'WLAN & Router Pro',
    category: 'networking',
    competencyCode: 'CSS-CO2-WIFI',
    description: 'Sets up wireless access point routers, SSID broadcasting, WPA3 encryption, and MAC address security filters.',
    iconName: 'Wifi',
    rarity: 'silver',
    colorScheme: 'sky',
    recommendedCriteria: 'Client devices connect securely with DHCP lease verified.'
  },
  {
    id: 'badge-os-installer',
    title: 'OS & Bootloader Wizard',
    category: 'software',
    competencyCode: 'CSS-CO3-OS',
    description: 'Creates bootable flash drives and installs UEFI/GPT operating systems (Windows 11 / Linux) with verified device drivers.',
    iconName: 'HardDriveDownload',
    rarity: 'gold',
    colorScheme: 'indigo',
    recommendedCriteria: 'Clean installation with Device Manager showing 0 missing drivers.'
  },
  {
    id: 'badge-storage-backup',
    title: 'Partition & Backup Engineer',
    category: 'software',
    competencyCode: 'CSS-CO3-DISK',
    description: 'Configures GPT/MBR partition tables, disk cloning, system restore points, and automated scheduled backups.',
    iconName: 'Database',
    rarity: 'silver',
    colorScheme: 'violet',
    recommendedCriteria: 'Successfully creates a system recovery image.'
  },
  {
    id: 'badge-diagnostic-ninja',
    title: 'POST & Beep Code Ninja',
    category: 'hardware',
    competencyCode: 'CSS-CO4-TRBL',
    description: 'Rapidly pinpoints and resolves hardware faults (RAM reseating, CMOS resets, thermal throttling, PSU failure) under 5 minutes.',
    iconName: 'Wrench',
    rarity: 'diamond',
    colorScheme: 'rose',
    recommendedCriteria: 'Solves 3 induced hardware faults during timed exam.'
  },
  {
    id: 'badge-antivirus-defender',
    title: 'Cyber Hygiene Defender',
    category: 'software',
    competencyCode: 'CSS-CO3-SEC',
    description: 'Performs malware remediation, optimizes system startup services, and enables Windows Defender firewall rules.',
    iconName: 'Lock',
    rarity: 'bronze',
    colorScheme: 'teal',
    recommendedCriteria: 'Full system audit and cleanup checklist completed.'
  },
  {
    id: 'badge-5s-cleanliness',
    title: '5S Laboratory Champion',
    category: 'conduct',
    competencyCode: 'CSS-GEN-5S',
    description: 'Exemplifies Sort, Set in order, Shine, Standardize, and Sustain; leaves workstation, screwdrivers, and testers in pristine order.',
    iconName: 'Sparkles',
    rarity: 'bronze',
    colorScheme: 'amber',
    recommendedCriteria: 'Workstation rated 5/5 on tool inventory check at dismissal.'
  },
  {
    id: 'badge-peer-mentor',
    title: 'Peer Tech Helper',
    category: 'conduct',
    competencyCode: 'CSS-GEN-HELP',
    description: 'Shows outstanding camaraderie by coaching and mentoring classmates through challenging lab crimping and OS steps.',
    iconName: 'Users',
    rarity: 'silver',
    colorScheme: 'purple',
    recommendedCriteria: 'Commended by peers and teacher for collaborative assistance.'
  },
  {
    id: 'badge-nc2-ready',
    title: 'CSS NC II Mock Master',
    category: 'achievement',
    competencyCode: 'CSS-ASSESS-NC2',
    description: 'Successfully performed all 4 Core Competency Assessment packages with zero critical errors during school mock review.',
    iconName: 'Trophy',
    rarity: 'master',
    colorScheme: 'yellow',
    recommendedCriteria: 'Earned Competent rating on all institutional rubric rubrics.'
  }
];

export const DEFAULT_STUDENTS: Student[] = [
  // Grade 8
  {
    id: 'std-g8-01',
    name: 'Juan Dela Cruz',
    lrn: '109876543201',
    grade: 8,
    section: 'Section Archimedes',
    gender: 'M',
    avatar: '👨‍🎓',
    initialMedals: 10,
    notes: 'Excels at safety procedures and tool handling.',
    createdAt: Date.now() - 86400000 * 30
  },
  {
    id: 'std-g8-02',
    name: 'Maria Clara Santos',
    lrn: '109876543202',
    grade: 8,
    section: 'Section Archimedes',
    gender: 'F',
    avatar: '👩‍🎓',
    initialMedals: 10,
    notes: 'Demonstrates great precision in component disassembly.',
    createdAt: Date.now() - 86400000 * 30
  },
  {
    id: 'std-g8-03',
    name: 'Gabriel Silang',
    lrn: '109876543203',
    grade: 8,
    section: 'Section Pasteur',
    gender: 'M',
    avatar: '👨‍💻',
    initialMedals: 10,
    notes: 'Active laboratory team leader.',
    createdAt: Date.now() - 86400000 * 30
  },
  {
    id: 'std-g8-04',
    name: 'Princess Nicole Reyes',
    lrn: '109876543204',
    grade: 8,
    section: 'Section Pasteur',
    gender: 'F',
    avatar: '👩‍💻',
    initialMedals: 10,
    notes: 'Consistent top scorer in tool identification.',
    createdAt: Date.now() - 86400000 * 30
  },

  // Grade 9
  {
    id: 'std-g9-01',
    name: 'Joshua Andrei Bautista',
    lrn: '109876543211',
    grade: 9,
    section: 'Section Turing',
    gender: 'M',
    avatar: '🧑‍💻',
    initialMedals: 10,
    notes: 'Speed crimper and network troubleshooting lead.',
    createdAt: Date.now() - 86400000 * 45
  },
  {
    id: 'std-g9-02',
    name: 'Bea Patricia Gomez',
    lrn: '109876543212',
    grade: 9,
    section: 'Section Turing',
    gender: 'F',
    avatar: '👩‍🔧',
    initialMedals: 10,
    notes: 'High attention to detail in router configuration.',
    createdAt: Date.now() - 86400000 * 45
  },
  {
    id: 'std-g9-03',
    name: 'Ethan Kyle Mendoza',
    lrn: '109876543213',
    grade: 9,
    section: 'Section Babbage',
    gender: 'M',
    avatar: '👨‍🔧',
    initialMedals: 10,
    notes: 'Peer mentor during cable testing activities.',
    createdAt: Date.now() - 86400000 * 45
  },
  {
    id: 'std-g9-04',
    name: 'Sophia Denise Alcantara',
    lrn: '109876543214',
    grade: 9,
    section: 'Section Babbage',
    gender: 'F',
    avatar: '👩‍🎓',
    initialMedals: 10,
    notes: 'Always practices 5S and workplace hygiene.',
    createdAt: Date.now() - 86400000 * 45
  },

  // Grade 10
  {
    id: 'std-g10-01',
    name: 'Alexander Christian Tan',
    lrn: '109876543221',
    grade: 10,
    section: 'Section Lovelace',
    gender: 'M',
    avatar: '👨‍💻',
    initialMedals: 10,
    notes: 'Candidate for National Certificate NC II assessment.',
    createdAt: Date.now() - 86400000 * 60
  },
  {
    id: 'std-g10-02',
    name: 'Hannah Mae Villanueva',
    lrn: '109876543222',
    grade: 10,
    section: 'Section Lovelace',
    gender: 'F',
    avatar: '👩‍💻',
    initialMedals: 10,
    notes: 'Exceptional proficiency in multi-boot OS setup.',
    createdAt: Date.now() - 86400000 * 60
  },
  {
    id: 'std-g10-03',
    name: 'Carl Vincent Ramos',
    lrn: '109876543223',
    grade: 10,
    section: 'Section Hopper',
    gender: 'M',
    avatar: '🧑‍🔧',
    initialMedals: 10,
    notes: 'Master in server role configuration and storage partitions.',
    createdAt: Date.now() - 86400000 * 60
  },
  {
    id: 'std-g10-04',
    name: 'Alyssa Jane Fernandez',
    lrn: '109876543224',
    grade: 10,
    section: 'Section Hopper',
    gender: 'F',
    avatar: '👩‍🔧',
    initialMedals: 10,
    notes: 'Fastest POST diagnostic troubleshooter in class.',
    createdAt: Date.now() - 86400000 * 60
  }
];

export const DEFAULT_RUBRIC_MAPPINGS: RubricMapping[] = [
  { rubricScore: 4.00, rawScore: 25, label: '4.00 (Exemplary)', descriptor: 'Mastery / Flawless execution & adherence to OHS standards' },
  { rubricScore: 3.75, rawScore: 23, label: '3.75 (Outstanding)', descriptor: 'High precision with minimal minor guidance' },
  { rubricScore: 3.50, rawScore: 21, label: '3.50 (Very Satisfactory)', descriptor: 'Consistent competency with proper safety handling' },
  { rubricScore: 3.25, rawScore: 18, label: '3.25 (Proficient+)', descriptor: 'Completed task with standard proficiency' },
  { rubricScore: 3.00, rawScore: 16, label: '3.00 (Satisfactory)', descriptor: 'Acceptable performance with occasional check-ins' },
  { rubricScore: 2.75, rawScore: 13, label: '2.75 (Approaching Mastery)', descriptor: 'Functional execution with minor timing or step delays' },
  { rubricScore: 2.50, rawScore: 10, label: '2.50 (Developing+)', descriptor: 'Required teacher prompt for intermediate steps' },
  { rubricScore: 2.00, rawScore: 7, label: '2.00 (Developing)', descriptor: 'Needs improvement in tool safety or cable sequence' },
  { rubricScore: 1.50, rawScore: 4, label: '1.50 (Beginning)', descriptor: 'Incomplete procedure; safety reminder needed' },
  { rubricScore: 1.00, rawScore: 1, label: '1.00 (Needs Improvement)', descriptor: 'Minimal work submitted or non-functional boot' }
];

export const GRADE_SECTIONS_MAP: Record<number, string[]> = {
  8: ['Section Archimedes', 'Section Pasteur', 'Section Curie', 'Section Einstein'],
  9: ['Section Turing', 'Section Babbage', 'Section Lovelace', 'Section Berners-Lee'],
  10: ['Section Lovelace', 'Section Hopper', 'Section Torvalds', 'Section Wozniak']
};
