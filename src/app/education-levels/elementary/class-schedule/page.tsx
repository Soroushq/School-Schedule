"use client";

import React, { Suspense } from 'react';
import { ElementaryScheduleProvider } from '@/modules/high-school/components/ElementaryScheduleProvider';
import ClassSchedulePage from '@/modules/high-school/components/ClassSchedulePage';

export default function ElementaryClassSchedule() {
  return (
    <ElementaryScheduleProvider>
      <Suspense fallback={<div className="p-4">در حال بارگذاری...</div>}>
        <ClassSchedulePage isVocational={false} />
      </Suspense>
    </ElementaryScheduleProvider>
  );
} 