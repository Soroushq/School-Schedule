"use client";

import React, { Suspense } from 'react';
import { VocationalScheduleProvider } from '@/modules/high-school/components/VocationalScheduleProvider';
import ClassSchedulePage from '@/modules/high-school/components/ClassSchedulePage';

export default function VocationalClassSchedule() {
  return (
    <VocationalScheduleProvider>
      <Suspense fallback={<div className="p-4">در حال بارگذاری...</div>}>
        <ClassSchedulePage isVocational={true} />
      </Suspense>
    </VocationalScheduleProvider>
  );
} 