export interface ElementaryScheduleOptions {
  grades: string[];
  classOptions: Record<string, string[]>;
  fields: string[];
  mainPositions: string[];
  hourTypes: string[];
  teachingGroups: string[];
}

export const elementaryScheduleOptions: ElementaryScheduleOptions = {
  grades: ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم'],
  
  classOptions: {
    'اول': ['الف', 'ب', 'ج', 'د'],
    'دوم': ['الف', 'ب', 'ج', 'د'],
    'سوم': ['الف', 'ب', 'ج', 'د'],
    'چهارم': ['الف', 'ب', 'ج', 'د'],
    'پنجم': ['الف', 'ب', 'ج', 'د'],
    'ششم': ['الف', 'ب', 'ج', 'د']
  },

  fields: ['عمومی'],

  mainPositions: [
    'آموزگار',
    'دبیر',
    'مدیر',
    'معاون',
    'مربی پرورشی',
    'مربی ورزش',
    'مربی بهداشت'
  ],

  hourTypes: [
    'موظف',
    'غیرموظف',
    'اداری',
    'پرورشی'
  ],

  teachingGroups: [
    'قرآن',
    'فارسی',
    'نگارش',
    'املا',
    'ریاضی',
    'علوم تجربی',
    'هدیه‌های آسمانی',
    'مطالعات اجتماعی',
    'هنر',
    'کار و فناوری',
    'تربیت بدنی',
    'تفکر و پژوهش',
    'مهارت‌های زندگی',
    'پرورشی',
    'بهداشت',
    'انضباط',
    'آزمایشگاه',
    'کتابخانه'
  ]
}; 