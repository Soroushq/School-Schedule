import { EducationSystem, EDUCATION_LEVELS } from '../types/education';

export const initialEducationSystem: EducationSystem = {
  elementary: {
    id: EDUCATION_LEVELS.ELEMENTARY,
    name: 'دوره ابتدایی',
    grades: [
      {
        id: '1',
        name: 'پایه اول',
        classes: [
          { id: '101', name: 'کلاس 101', grade: 'پایه اول', section: 'الف', capacity: 30 },
          { id: '102', name: 'کلاس 102', grade: 'پایه اول', section: 'ب', capacity: 30 },
          { id: '103', name: 'کلاس 103', grade: 'پایه اول', section: 'ج', capacity: 30 }
        ]
      },
      {
        id: '2',
        name: 'پایه دوم',
        classes: [
          { id: '201', name: 'کلاس 201', grade: 'پایه دوم', section: 'الف', capacity: 30 },
          { id: '202', name: 'کلاس 202', grade: 'پایه دوم', section: 'ب', capacity: 30 },
          { id: '203', name: 'کلاس 203', grade: 'پایه دوم', section: 'ج', capacity: 30 }
        ]
      },
      {
        id: '3',
        name: 'پایه سوم',
        classes: [
          { id: '301', name: 'کلاس 301', grade: 'پایه سوم', section: 'الف', capacity: 30 },
          { id: '302', name: 'کلاس 302', grade: 'پایه سوم', section: 'ب', capacity: 30 },
          { id: '303', name: 'کلاس 303', grade: 'پایه سوم', section: 'ج', capacity: 30 }
        ]
      },
      {
        id: '4',
        name: 'پایه چهارم',
        classes: [
          { id: '401', name: 'کلاس 401', grade: 'پایه چهارم', section: 'الف', capacity: 30 },
          { id: '402', name: 'کلاس 402', grade: 'پایه چهارم', section: 'ب', capacity: 30 },
          { id: '403', name: 'کلاس 403', grade: 'پایه چهارم', section: 'ج', capacity: 30 }
        ]
      },
      {
        id: '5',
        name: 'پایه پنجم',
        classes: [
          { id: '501', name: 'کلاس 501', grade: 'پایه پنجم', section: 'الف', capacity: 30 },
          { id: '502', name: 'کلاس 502', grade: 'پایه پنجم', section: 'ب', capacity: 30 },
          { id: '503', name: 'کلاس 503', grade: 'پایه پنجم', section: 'ج', capacity: 30 }
        ]
      },
      {
        id: '6',
        name: 'پایه ششم',
        classes: [
          { id: '601', name: 'کلاس 601', grade: 'پایه ششم', section: 'الف', capacity: 30 },
          { id: '602', name: 'کلاس 602', grade: 'پایه ششم', section: 'ب', capacity: 30 },
          { id: '603', name: 'کلاس 603', grade: 'پایه ششم', section: 'ج', capacity: 30 }
        ]
      }
    ]
  },
  middleSchool: {
    id: EDUCATION_LEVELS.MIDDLE_SCHOOL,
    name: 'دوره اول متوسطه',
    grades: [
      {
        id: '7',
        name: 'پایه هفتم',
        classes: [
          { id: '701', name: 'کلاس 701', grade: 'پایه هفتم', section: 'الف', capacity: 30 },
          { id: '702', name: 'کلاس 702', grade: 'پایه هفتم', section: 'ب', capacity: 30 },
          { id: '703', name: 'کلاس 703', grade: 'پایه هفتم', section: 'ج', capacity: 30 }
        ]
      },
      {
        id: '8',
        name: 'پایه هشتم',
        classes: [
          { id: '801', name: 'کلاس 801', grade: 'پایه هشتم', section: 'الف', capacity: 30 },
          { id: '802', name: 'کلاس 802', grade: 'پایه هشتم', section: 'ب', capacity: 30 },
          { id: '803', name: 'کلاس 803', grade: 'پایه هشتم', section: 'ج', capacity: 30 }
        ]
      },
      {
        id: '9',
        name: 'پایه نهم',
        classes: [
          { id: '901', name: 'کلاس 901', grade: 'پایه نهم', section: 'الف', capacity: 30 },
          { id: '902', name: 'کلاس 902', grade: 'پایه نهم', section: 'ب', capacity: 30 },
          { id: '903', name: 'کلاس 903', grade: 'پایه نهم', section: 'ج', capacity: 30 }
        ]
      }
    ]
  },
  highSchool: {
    id: EDUCATION_LEVELS.HIGH_SCHOOL,
    name: 'دوره دوم متوسطه',
    grades: [
      {
        id: '10',
        name: 'پایه دهم',
        classes: [
          { id: '1001', name: 'کلاس 1001', grade: 'پایه دهم', section: 'الف', capacity: 30 },
          { id: '1002', name: 'کلاس 1002', grade: 'پایه دهم', section: 'ب', capacity: 30 },
          { id: '1003', name: 'کلاس 1003', grade: 'پایه دهم', section: 'ج', capacity: 30 }
        ]
      },
      {
        id: '11',
        name: 'پایه یازدهم',
        classes: [
          { id: '1101', name: 'کلاس 1101', grade: 'پایه یازدهم', section: 'الف', capacity: 30 },
          { id: '1102', name: 'کلاس 1102', grade: 'پایه یازدهم', section: 'ب', capacity: 30 },
          { id: '1103', name: 'کلاس 1103', grade: 'پایه یازدهم', section: 'ج', capacity: 30 }
        ]
      },
      {
        id: '12',
        name: 'پایه دوازدهم',
        classes: [
          { id: '1201', name: 'کلاس 1201', grade: 'پایه دوازدهم', section: 'الف', capacity: 30 },
          { id: '1202', name: 'کلاس 1202', grade: 'پایه دوازدهم', section: 'ب', capacity: 30 },
          { id: '1203', name: 'کلاس 1203', grade: 'پایه دوازدهم', section: 'ج', capacity: 30 }
        ]
      }
    ]
  },
  technicalVocational: {
    id: EDUCATION_LEVELS.TECHNICAL_VOCATIONAL,
    name: 'فنی و حرفه‌ای',
    grades: [
      {
        id: '10-tech',
        name: 'پایه دهم',
        classes: [
          { id: '101', name: 'کلاس 101', grade: 'پایه دهم', section: 'الف', capacity: 30 },
          { id: '102', name: 'کلاس 102', grade: 'پایه دهم', section: 'ب', capacity: 30 },
          { id: '103', name: 'کلاس 103', grade: 'پایه دهم', section: 'ج', capacity: 30 }
        ]
      },
      {
        id: '11-tech',
        name: 'پایه یازدهم',
        classes: [
          { id: '111', name: 'کلاس 111', grade: 'پایه یازدهم', section: 'الف', capacity: 30 },
          { id: '112', name: 'کلاس 112', grade: 'پایه یازدهم', section: 'ب', capacity: 30 },
          { id: '113', name: 'کلاس 113', grade: 'پایه یازدهم', section: 'ج', capacity: 30 }
        ]
      },
      {
        id: '12-tech',
        name: 'پایه دوازدهم',
        classes: [
          { id: '121', name: 'کلاس 121', grade: 'پایه دوازدهم', section: 'الف', capacity: 30 },
          { id: '122', name: 'کلاس 122', grade: 'پایه دوازدهم', section: 'ب', capacity: 30 },
          { id: '123', name: 'کلاس 123', grade: 'پایه دوازدهم', section: 'ج', capacity: 30 }
        ]
      }
    ]
  }
}; 