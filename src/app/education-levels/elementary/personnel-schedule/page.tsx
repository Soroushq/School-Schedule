"use client";

import React, { Suspense } from 'react';
import { ElementaryScheduleProvider } from '@/modules/high-school/components/ElementaryScheduleProvider';
import PersonnelSchedulePage from '@/modules/high-school/components/PersonnelSchedulePage';

export default function ElementaryPersonnelSchedule() {
  return (
    <ElementaryScheduleProvider>
      <Suspense fallback={<div className="p-4">در حال بارگذاری...</div>}>
        <PersonnelSchedulePage isVocational={false} />
      </Suspense>
    </ElementaryScheduleProvider>
  );
} 