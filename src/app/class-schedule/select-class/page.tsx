'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './select-class.module.css';

interface ClassInfo {
  grade: string;
  classNumber: string;
  field: string;
}

const grades = ['دهم', 'یازدهم', 'دوازدهم'];

const classNumbers = {
  'دهم': ['101', '102', '103'],
  'یازدهم': ['111', '112', '113'],
  'دوازدهم': ['121', '122', '123']
};

const fields = [
  'امور دامي',
  'امور زراعي',
  'پويانمايي (انيميشن)',
  'تأسيسات مكانيكي',
  'تربيت بدني',
  'تربيت كودك',
  'توليد برنامه‌ تلویزيوني',
  'چاپ',
  'حسابداري',
  'ساختمان',
  'سراميك',
  'سينما',
  'شبكه و نرم‌افزار رايانه',
  'صنايع چوب و مبلمان',
  'صنايع دستي - فرش',
  'صنايع شيميايي'
];

export default function SelectClass() {
  const router = useRouter();
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClassNumber, setSelectedClassNumber] = useState('');
  const [selectedField, setSelectedField] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGrade && selectedClassNumber && selectedField) {
      const classInfo: ClassInfo = {
        grade: selectedGrade,
        classNumber: selectedClassNumber,
        field: selectedField
      };
      // TODO: Save to database
      router.push(`/class-schedule/schedule?grade=${selectedGrade}&class=${selectedClassNumber}&field=${selectedField}`);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>
          بازگشت
        </Link>
        <h1>انتخاب کلاس</h1>
      </header>
      
      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="grade">پایه:</label>
            <select
              id="grade"
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedClassNumber('');
              }}
              required
            >
              <option value="">انتخاب کنید</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="classNumber">شماره کلاس:</label>
            <select
              id="classNumber"
              value={selectedClassNumber}
              onChange={(e) => setSelectedClassNumber(e.target.value)}
              disabled={!selectedGrade}
              required
            >
              <option value="">انتخاب کنید</option>
              {selectedGrade && classNumbers[selectedGrade as keyof typeof classNumbers].map(number => (
                <option key={number} value={number}>{number}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="field">گرایش کلاس:</label>
            <select
              id="field"
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              required
            >
              <option value="">انتخاب کنید</option>
              {fields.map(field => (
                <option key={field} value={field}>{field}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={!selectedGrade || !selectedClassNumber || !selectedField}
          >
            ادامه
          </button>
        </form>
      </main>
    </div>
  );
} 