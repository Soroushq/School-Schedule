"use client";

import React, { Suspense } from 'react';
import { VocationalScheduleProvider } from '@/modules/high-school/components/VocationalScheduleProvider';
import PersonnelSchedulePage from '@/modules/high-school/components/PersonnelSchedulePage';

export default function VocationalPersonnelSchedule() {
  return (
    <VocationalScheduleProvider>
      <Suspense fallback={<div className="p-4">در حال بارگذاری...</div>}>
        <PersonnelSchedulePage isVocational={true} />
      </Suspense>
    </VocationalScheduleProvider>
  );
} 