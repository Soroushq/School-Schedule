import React, { useState } from 'react';
import { ClassOption, Grade } from '../types/education';

interface ClassManagerProps {
  grade: Grade;
  onUpdate: (updatedGrade: Grade) => void;
}

export const ClassManager: React.FC<ClassManagerProps> = ({ grade, onUpdate }) => {
  const [showMore, setShowMore] = useState(false);
  const [newClass, setNewClass] = useState<Partial<ClassOption>>({
    name: '',
    section: '',
    capacity: 30
  });

  const handleAddClass = () => {
    if (!newClass.name || !newClass.section) return;

    const updatedClasses = [
      ...grade.classes,
      {
        id: Date.now().toString(),
        name: newClass.name,
        grade: grade.name,
        section: newClass.section,
        capacity: newClass.capacity || 30
      }
    ];

    onUpdate({
      ...grade,
      classes: updatedClasses
    });

    setNewClass({
      name: '',
      section: '',
      capacity: 30
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{grade.name}</h3>
      
      <div className="space-y-4">
        {grade.classes.slice(0, showMore ? undefined : 3).map((cls: ClassOption) => (
          <div key={cls.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <span className="font-medium">{cls.name}</span>
              <span className="text-gray-500 ml-2">(بخش {cls.section})</span>
            </div>
            <span className="text-sm text-gray-600">ظرفیت: {cls.capacity}</span>
          </div>
        ))}

        {grade.classes.length > 3 && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {showMore ? 'نمایش کمتر' : 'نمایش بیشتر'}
          </button>
        )}

        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h4 className="font-medium mb-2">افزودن کلاس جدید</h4>
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="نام کلاس"
              value={newClass.name}
              onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="بخش"
              value={newClass.section}
              onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="ظرفیت"
              value={newClass.capacity}
              onChange={(e) => setNewClass({ ...newClass, capacity: parseInt(e.target.value) })}
              className="p-2 border rounded"
            />
          </div>
          <button
            onClick={handleAddClass}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            افزودن کلاس
          </button>
        </div>
      </div>
    </div>
  );
}; 