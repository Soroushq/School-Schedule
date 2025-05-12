"use client";

import React, { Suspense } from 'react';
import { HighSchoolScheduleProvider } from '@/modules/high-school/components/HighSchoolScheduleProvider';
import HighSchoolPersonnelSchedulePage from '@/modules/high-school/components/PersonnelSchedulePage';

export default function PersonnelSchedule() {
  return (
    <HighSchoolScheduleProvider>
      <Suspense fallback={<div className="p-4">در حال بارگذاری...</div>}>
        <HighSchoolPersonnelSchedulePage />
      </Suspense>
    </HighSchoolScheduleProvider>
  );
} 