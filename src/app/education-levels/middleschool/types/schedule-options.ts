export interface MiddleSchoolScheduleOptions {
  grades: string[];
  classOptions: Record<string, string[]>;
  fields: string[];
  mainPositions: string[];
  hourTypes: string[];
  teachingGroups: string[];
}

export const middleSchoolScheduleOptions: MiddleSchoolScheduleOptions = {
  grades: ['هفتم', 'هشتم', 'نهم'],
  
  classOptions: {
    'هفتم': ['الف', 'ب', 'ج', 'د'],
    'هشتم': ['الف', 'ب', 'ج', 'د'],
    'نهم': ['الف', 'ب', 'ج', 'د']
  },

  fields: ['عمومی', 'نمونه دولتی', 'شاهد', 'تیزهوشان'],

  mainPositions: [
    'دبیر',
    'مدیر',
    'معاون',
    'مشاور',
    'مربی پرورشی',
    'مربی ورزش',
    'مربی بهداشت'
  ],

  hourTypes: [
    'موظف اول',
    'موظف دوم',
    'غیرموظف اول',
    'غیرموظف دوم',
    'موظف معاونین',
    'اداری',
    'پرورشی'
  ],

  teachingGroups: [
    'ادبیات فارسی',
    'عربی',
    'زبان انگلیسی',
    'فرهنگ و معارف اسلامی',
    'مطالعات اجتماعی',
    'ریاضی',
    'علوم تجربی',
    'تربیت بدنی',
    'هنر',
    'کار و فناوری',
    'تفکر و سبک زندگی',
    'آمادگی دفاعی',
    'قرآن',
    'پرورشی',
    'مشاوره',
    'بهداشت',
    'انضباط',
    'آزمایشگاه',
    'کتابخانه'
  ]
}; 