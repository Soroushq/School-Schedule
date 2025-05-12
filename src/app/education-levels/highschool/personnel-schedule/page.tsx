"use client";

import React, { Suspense } from 'react';
import { HighSchoolScheduleProvider } from '@/modules/high-school/components/HighSchoolScheduleProvider';
import PersonnelSchedulePage from '@/modules/high-school/components/PersonnelSchedulePage';

export default function HighSchoolPersonnelSchedule() {
  return (
    <HighSchoolScheduleProvider>
      <Suspense fallback={<div className="p-4">در حال بارگذاری...</div>}>
        <PersonnelSchedulePage isVocational={false} />
      </Suspense>
    </HighSchoolScheduleProvider>
  );
} 