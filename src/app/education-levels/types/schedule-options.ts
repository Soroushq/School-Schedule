export interface BaseScheduleOptions {
  grades: string[];
  classOptions: Record<string, string[]>;
  fields: string[];
  mainPositions: string[];
  hourTypes: string[];
  teachingGroups: string[];
}

export type EducationLevel = 'elementary' | 'middleschool' | 'highschool' | 'vocational';

import { elementaryScheduleOptions } from '../elementary/types/schedule-options';
import { middleSchoolScheduleOptions } from '../middleschool/types/schedule-options';
import { highSchoolScheduleOptions } from '../highschool/types/schedule-options';
import { vocationalScheduleOptions } from '../vocational/types/schedule-options';

export { elementaryScheduleOptions, middleSchoolScheduleOptions, highSchoolScheduleOptions, vocationalScheduleOptions };

export const getScheduleOptions = (level: EducationLevel): BaseScheduleOptions => {
  switch (level) {
    case 'elementary':
      return elementaryScheduleOptions;
    case 'middleschool':
      return middleSchoolScheduleOptions;
    case 'highschool':
      return highSchoolScheduleOptions;
    case 'vocational':
      return vocationalScheduleOptions;
    default:
      throw new Error(`Invalid education level: ${level}`);
  }
}; 