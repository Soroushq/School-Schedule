export interface Personnel {
  id: string;
  personnelCode: string;
  fullName: string;
  mainPosition: string;
  employmentStatus: string;
}

export const personnelData: Personnel[] = [
  {
    id: '1',
    personnelCode: '1001',
    fullName: 'علی محمدی',
    mainPosition: 'هنرآموز',
    employmentStatus: 'شاغل'
  },
  {
    id: '2',
    personnelCode: '1002',
    fullName: 'سارا احمدی',
    mainPosition: 'دبیر',
    employmentStatus: 'شاغل'
  },
  {
    id: '3',
    personnelCode: '1003',
    fullName: 'محمد رضایی',
    mainPosition: 'معاون',
    employmentStatus: 'شاغل'
  },
  {
    id: '4',
    personnelCode: '1004',
    fullName: 'فاطمه حسینی',
    mainPosition: 'دبیر',
    employmentStatus: 'شاغل'
  },
  {
    id: '5',
    personnelCode: '1005',
    fullName: 'حسین علوی',
    mainPosition: 'استادکار',
    employmentStatus: 'بازنشسته'
  },
  {
    id: '6',
    personnelCode: '1006',
    fullName: 'مریم کریمی',
    mainPosition: 'هنرآموز',
    employmentStatus: 'شاغل'
  },
  {
    id: '7',
    personnelCode: '1007',
    fullName: 'جواد قاسمی',
    mainPosition: 'سرپرست بخش',
    employmentStatus: 'شاغل'
  },
  {
    id: '8',
    personnelCode: '1008',
    fullName: 'زهرا نوری',
    mainPosition: 'دبیر',
    employmentStatus: 'شاغل'
  },
  {
    id: '9',
    personnelCode: '1009',
    fullName: 'امیر صادقی',
    mainPosition: 'مدیر',
    employmentStatus: 'شاغل'
  },
  {
    id: '10',
    personnelCode: '1010',
    fullName: 'نرگس موسوی',
    mainPosition: 'هنرآموز',
    employmentStatus: 'خرید خدمات'
  },
  {
    id: '11',
    personnelCode: '1011',
    fullName: 'رضا جعفری',
    mainPosition: 'دبیر',
    employmentStatus: 'بازنشسته'
  },
  {
    id: '12',
    personnelCode: '1012',
    fullName: 'سمیه فرهادی',
    mainPosition: 'استادکار',
    employmentStatus: 'خرید خدمات'
  }
];

export const findPersonnelByCode = (code: string): Personnel | undefined => {
  return personnelData.find(person => person.personnelCode === code);
}; 