"use client";

import React, { Suspense } from 'react';
import { MiddleSchoolScheduleProvider } from '@/modules/high-school/components/MiddleSchoolScheduleProvider';
import ClassSchedulePage from '@/modules/high-school/components/ClassSchedulePage';

export default function MiddleSchoolClassSchedule() {
  return (
    <MiddleSchoolScheduleProvider>
      <Suspense fallback={<div className="p-4">در حال بارگذاری...</div>}>
        <ClassSchedulePage isVocational={false} />
      </Suspense>
    </MiddleSchoolScheduleProvider>
  );
} 