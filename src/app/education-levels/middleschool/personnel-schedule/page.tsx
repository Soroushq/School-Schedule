"use client";

import React, { Suspense } from 'react';
import { MiddleSchoolScheduleProvider } from '@/modules/high-school/components/MiddleSchoolScheduleProvider';
import PersonnelSchedulePage from '@/modules/high-school/components/PersonnelSchedulePage';

export default function MiddleSchoolPersonnelSchedule() {
  return (
    <MiddleSchoolScheduleProvider>
      <Suspense fallback={<div className="p-4">در حال بارگذاری...</div>}>
        <PersonnelSchedulePage isVocational={false} />
      </Suspense>
    </MiddleSchoolScheduleProvider>
  );
} 