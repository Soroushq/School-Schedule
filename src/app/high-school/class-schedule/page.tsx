"use client";

import React, { Suspense } from 'react';
import { HighSchoolScheduleProvider } from '@/modules/high-school/components/HighSchoolScheduleProvider';
import HighSchoolClassSchedulePage from '@/modules/high-school/components/ClassSchedulePage';

export default function ClassSchedule() {
  return (
    <HighSchoolScheduleProvider>
      <Suspense fallback={<div className="p-4">در حال بارگذاری...</div>}>
        <HighSchoolClassSchedulePage />
      </Suspense>
    </HighSchoolScheduleProvider>
  );
} 