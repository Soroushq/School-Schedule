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
    'اول': ['الف', 'ب', 'ج'],
    'دوم': ['الف', 'ب', 'ج'],
    'سوم': ['الف', 'ب', 'ج'],
    'چهارم': ['الف', 'ب', 'ج'],
    'پنجم': ['الف', 'ب', 'ج'],
    'ششم': ['الف', 'ب', 'ج']
  },

  fields: ['عمومی'],

  mainPositions: [
    'آموزگار',
    'مدیر',
    'معاون',
    'مربی پرورشی',
    'مربی بهداشت',
    'مربی ورزش',
    'مربی زبان',

    


    
  ],

  hourTypes: [
    'موظف',
    'غیرموظف',
    'موظف معاونین'
  ],

  teachingGroups: [
    'آموزگار پایه',
    'تربیت بدنی',
    'هنر',
    'قرآن',
    'زبان انگلیسی'
  ]
}; 