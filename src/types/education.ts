export interface ClassOption {
  id: string;
  name: string;
  grade: string;
  section: string;
  capacity: number;
  teacher?: string;
  field?: string;
}

export interface Grade {
  id: string;
  name: string;
  classes: ClassOption[];
}

export interface EducationLevel {
  id: string;
  name: string;
  grades: Grade[];
}

export interface EducationSystem {
  elementary: EducationLevel;
  middleSchool: EducationLevel;
  highSchool: EducationLevel;
  technicalVocational: EducationLevel;
}

// مقاطع تحصیلی
export const EDUCATION_LEVELS = {
  ELEMENTARY: 'elementary',
  MIDDLE_SCHOOL: 'middleSchool',
  HIGH_SCHOOL: 'highSchool',
  TECHNICAL_VOCATIONAL: 'technicalVocational'
} as const;

// پایه‌های تحصیلی
export const GRADES = {
  FIRST: 'first',
  SECOND: 'second',
  THIRD: 'third',
  FOURTH: 'fourth',
  FIFTH: 'fifth',
  SIXTH: 'sixth',
  SEVENTH: 'seventh',
  EIGHTH: 'eighth',
  NINTH: 'ninth',
  TENTH: 'tenth',
  ELEVENTH: 'eleventh',
  TWELFTH: 'twelfth'
} as const;

// رشته‌های تحصیلی
export const MAJORS = {
  MATHEMATICS: 'mathematics',
  EXPERIMENTAL: 'experimental',
  HUMANITIES: 'humanities',
  ISLAMIC_SCIENCES: 'islamic_sciences',
  TECHNICAL: 'technical',
  VOCATIONAL: 'vocational'
} as const;

// کلاس‌های پیش‌فرض برای هر پایه
export const DEFAULT_CLASSES = {
  // دوره ابتدایی
  elementary: {
    first: ['101', '102', '103'],
    second: ['201', '202', '203'],
    third: ['301', '302', '303'],
    fourth: ['401', '402', '403'],
    fifth: ['501', '502', '503'],
    sixth: ['601', '602', '603']
  },
  // دوره اول متوسطه
  middleSchool: {
    seventh: ['701', '702', '703'],
    eighth: ['801', '802', '803'],
    ninth: ['901', '902', '903']
  },
  // دوره دوم متوسطه
  highSchool: {
    tenth: ['1001', '1002', '1003'],
    eleventh: ['1101', '1102', '1103'],
    twelfth: ['1201', '1202', '1203']
  },
  // فنی و حرفه‌ای
  technicalVocational: {
    tenth: ['101', '102', '103'],
    eleventh: ['111', '112', '113'],
    twelfth: ['121', '122', '123']
  }
} as const;

// رشته‌های فنی و حرفه‌ای
export const TECHNICAL_VOCATIONAL_FIELDS = [
  'امور دامي',
  'امور زراعي',
  'پويانمايي (انيميشن)',
  'تأسيسات مكانيكي',
  'تربيت بدني',
  'تربيت كودك',
  'توليد برنامه‌ تلویزيوني',
  'چاپ',
  'حسابداري',
  'ساختمان',
  'سراميك',
  'سينما',
  'شبكه و نرم‌افزار رايانه',
  'صنايع چوب و مبلمان',
  'صنايع دستي - فرش',
  'صنايع شيميايي'
] as const;

// رشته‌های نظری
export const THEORETICAL_FIELDS = {
  MATHEMATICS: [
    'ریاضی',
    'فیزیک',
    'شیمی',
    'زیست‌شناسی',
    'زبان انگلیسی',
    'ادبیات فارسی',
    'عربی',
    'دینی',
    'فلسفه',
    'هندسه',
    'حسابان',
    'آمار و احتمال'
  ],
  EXPERIMENTAL: [
    'زیست‌شناسی',
    'شیمی',
    'فیزیک',
    'ریاضی',
    'زبان انگلیسی',
    'ادبیات فارسی',
    'عربی',
    'دینی',
    'زمین‌شناسی',
    'آزمایشگاه'
  ],
  HUMANITIES: [
    'ادبیات فارسی',
    'عربی',
    'دینی',
    'زبان انگلیسی',
    'تاریخ',
    'جغرافیا',
    'فلسفه',
    'روانشناسی',
    'جامعه‌شناسی',
    'اقتصاد'
  ],
  ISLAMIC_SCIENCES: [
    'ادبیات فارسی',
    'عربی',
    'دینی',
    'زبان انگلیسی',
    'تاریخ',
    'جغرافیا',
    'فلسفه',
    'اصول عقاید',
    'اخلاق',
    'تفسیر'
  ]
} as const; 