"use client";

import React, { Suspense } from 'react';
import { HighSchoolScheduleProvider } from '@/modules/high-school/components/HighSchoolScheduleProvider';
import ClassSchedulePage from '@/modules/high-school/components/ClassSchedulePage';

export default function HighSchoolClassSchedule() {
  return (
    <HighSchoolScheduleProvider>
      <Suspense fallback={<div className="p-4">در حال بارگذاری...</div>}>
        <ClassSchedulePage isVocational={false} />
      </Suspense>
    </HighSchoolScheduleProvider>
  );
} 