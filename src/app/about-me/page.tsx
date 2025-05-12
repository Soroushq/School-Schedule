'use client';

import React, { useState, useEffect, ReactNode, useRef } from 'react';
import Image from 'next/image';
import { FaEnvelope, FaGithub, FaLinkedin, FaDownload, FaCode, FaTools, FaDatabase, FaPhone, FaExternalLinkAlt, FaSchool, FaBriefcase, FaGraduationCap, FaArrowLeft } from "react-icons/fa";
import Link from 'next/link';
// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';

const LoadingSpinner = dynamic(() => import('@/components/LoadingSpinner'), { ssr: false });

interface Competency {
  icon: React.ReactNode;
  label: string;
}

interface Experience {
  title: string;
  company: string;
  period: string;
  details: (string | React.ReactElement)[];
}

interface Education {
  degree: string;
  institution: string;
  period: string;
}

interface Contact {
  email: string;
  linkedin: string;
  github: string;
  phone: string;
}

interface Content {
  title: string;
  subtitle: string;
  description: string;
  competencies: Competency[];
  downloadResume: string;
  experience: Experience[];
  education: Education[];
  contact: Contact;
}

export default function AboutMe() {
  const [language, setLanguage] = useState<'fa' | 'en'>('fa');
  const [mounted, setMounted] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState<string | null>(null);
  const { theme } = useTheme();
  // رفرنس‌ها برای اسکرول
  const experienceSectionRef = useRef<HTMLDivElement>(null);
  const educationSectionRef = useRef<HTMLDivElement>(null);
  // تایمر برای حذف انتخاب فعال
  const activeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // تنظیم زبان پیش‌فرض
    setLanguage('fa');
    setMounted(true);
  }, []);

  // تابع اسکرول به بخش مربوطه بر اساس دوره زمانی
  const scrollToTimeframe = (period: string, type: string) => {
    // اگر تایمر قبلی وجود داشته باشد، آن را پاک کن
    if (activeTimeoutRef.current) {
      clearTimeout(activeTimeoutRef.current);
    }
    
    // تنظیم دوره زمانی فعال
    setActiveTimeframe(period);
    
    // پس از 5 ثانیه، وضعیت فعال را حذف کن
    activeTimeoutRef.current = setTimeout(() => {
      setActiveTimeframe(null);
    }, 5000);
    
    // انتخاب مرجع بخش مناسب بر اساس نوع
    const targetRef = type === 'experience' ? experienceSectionRef : educationSectionRef;
    
    // اسکرول به بخش مربوطه با انیمیشن
    if (targetRef.current) {
      window.scrollTo({
        top: targetRef.current.offsetTop - 100, // کمی بالاتر از بخش
        behavior: 'smooth'
      });
    }
  };

  // نمایش لودینگ تا زمان هیدریشن
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={60} color="#3B82F6" />
      </div>
    );
  }

  const content: Content = language === "en" ? {
    title: "Soroush Qary Ivary",
    subtitle: "Frontend Developer",
    description:
      "Frontend Developer with expertise in scalable and dynamic web applications. Proficient in React, Next, Angular, using TypeScript with advanced skills in state management, responsive design, and TailwindCSS. Experienced in leading frontend development, integrating AI-driven solutions, and migrating legacy systems to modern frameworks. Strong understanding of Agile methodologies and API integration. Academic background includes a Master's in IT Management and a Bachelor's in Electrical Engineering.",
    competencies: [
      { icon: <FaCode className="text-blue-600" />, label: "Next.js, Angular, JavaScript, TypeScript" },
      { icon: <FaDatabase className="text-purple-600" />, label: "React, Redux, Context / REST API" },
      { icon: <FaTools className="text-green-600" />, label: "Vite, Webpack, Docker" },
      { icon: <FaCode className="text-orange-600" />, label: "TailwindCSS, CSS3, Responsive Design" },
      { icon: <FaCode className="text-blue-500" />, label: "Git, Agile, Scrum" },
      { icon: <FaTools className="text-red-500" />, label: "Debugging, Unit Testing, CI/CD" },
      { icon: <FaDatabase className="text-indigo-600" />, label: "PHP, WordPress, Python" },
      { icon: <FaDatabase className="text-teal-600" />, label: "AI Integration, SEO Optimization" }
    ],
    experience: [
      {
        title: "Frontend Developer",
        company: "Department of Education",
        period: "Jan 2024 - Present",
        details: [
          "Head of Front-End of Sajfa dev team",
          "Designed and implemented dynamic, responsive user interfaces using Angular, and TailwindCSS.",
          "Developed state management features with Redux, optimizing app performance and scalability.",
          "Migrated legacy systems to modern frontend frameworks, utilizing Vite for faster builds.",
          "Ensured accessibility and responsiveness across multiple devices.",
          "Current progress of the new site available at this address:",
          <a
            href="https://sajfa.sodmand.ir"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline inline-flex items-center gap-1"
          >
            sajfa.sodmand.ir <FaExternalLinkAlt className="text-sm" />
          </a>
        ],
      },
      {
        title: "HR Planning and Workforce Analyst",
        company: "Department of Education",
        period: "Sep 2024 - Present",
        details: [
          "Analyzed workforce data to provide actionable insights for strategic planning and optimization.",
        ],
      },
      {
        title: "Electrotechnics Practical Teacher",
        company: "Practical High School",
        period: "Jan 2023 - Jan 2024",
        details: [
          "Designed interactive lessons and hands-on activities, enhancing students' practical knowledge of electrotechnics.",
        ],
      },
      {
        title: "English Teacher",
        company: "English Institutes (Selection)",
        period: "Jan 2023 - Present",
        details: [
          "Teaching Touchstone and Oxford Word Skills to upper-intermediate learners.",
        ],
      },
    ],
    education: [
      {
        degree: "Master's in IT Management",
        institution: "Ferdowsi University",
        period: "Sep 2023 - Present",
      },
      {
        degree: "Bachelor's in Electrical Engineering",
        institution: "Shahid Rajaee Teacher Training University of Tehran",
        period: "Jan 2019 - Jan 2023",
      },
      {
        degree: "Diploma of Mathematics",
        institution: " SAMPAD (Shahid Hasheminejad) 2 High School, Mashhad",
        period: "Oct 2014 - Jun 2019",
      },
    ],
    contact: {
      email: "soroush.qary.eemit@gmail.com",
      linkedin: "https://www.linkedin.com/in/soroush-qary-08392334b",
      github: "https://github.com/Soroushq",
      phone: "09154758378",
    },
    downloadResume: "Download Resume",
  } : {
    title: "سروش قاری ایوری",
    subtitle: "توسعه‌دهنده فرانت‌اند",
    description:
      "توسعه‌دهنده فرانت‌اند با تخصص در طراحی و پیاده‌سازی وب اپلیکیشن‌های پویا و مقیاس‌پذیر. مسلط به React، Next, Angular و TypeScript آشنایی کامل به State Management، طراحی واکنش‌گرا و TailwindCSS. با تجربه در هدایت تیم‌های توسعه فرانت‌اند، ادغام راه‌حل‌های مبتنی بر هوش مصنوعی و مهاجرت سیستم‌های Legacy به فریم‌ورک‌های مدرن. آشنا به متدولوژی‌های Agile و یکپارچه‌سازی API. با تحصیلات کارشناسی ارشد مدیریت IT و کارشناسی مهندسی برق.",
    competencies: [
      { icon: <FaCode className="text-blue-600" />, label: "React, Angular, JavaScript, TypeScript" },
      { icon: <FaDatabase className="text-purple-600" />, label: "Next.js, Redux, Context / REST API" },
      { icon: <FaTools className="text-green-600" />, label: "Vite, Webpack, Docker" },
      { icon: <FaCode className="text-orange-600" />, label: "TailwindCSS, CSS3, طراحی واکنش‌گرا" },
      { icon: <FaCode className="text-blue-500" />, label: "Git, Agile, Scrum" },
      { icon: <FaTools className="text-red-500" />, label: "دیباگینگ، تست واحد، CI/CD" },
      { icon: <FaDatabase className="text-indigo-600" />, label: "PHP, WordPress, Python" },
      { icon: <FaDatabase className="text-teal-600" />, label: "ادغام هوش مصنوعی، بهینه‌سازی SEO" }
    ],
    experience: [
      {
        title: "لید فرانت سجفا",
        company: "اداره آموزش و پرورش",
        period: "فروردین ۱۴۰۳ - تاکنون",
        details: [
          "طراحی و پیاده‌سازی رابط‌های کاربری پویا و واکنش‌گرا با استفاده از Angular و TailwindCSS.",
          "توسعه ویژگی‌های مدیریت state با Redux برای بهینه‌سازی عملکرد و مقیاس‌پذیری برنامه.",
          "انتقال سیستم‌های قدیمی به فریم‌ورک‌های مدرن فرانت‌اند و ساخت کامپوننت‌ها کاملاً از صفر.",
          "اطمینان از دسترسی‌پذیری و واکنش‌گرایی در دستگاه‌های مختلف.",
          <>
            آدرس فعلی پروژه ماک{" "}
            <a
              href="https://sajfa.sodmand.ir"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline inline-flex items-center gap-1"
            >
              sajfa.sodmand.ir <FaExternalLinkAlt className="text-sm" />
            </a>
          </>,
        ],
      },
      {
        title: "کارشناس طرح و برنامه‌ریزی",
        company: "اداره کل آموزش و پرورش خراسان رضوی",
        period: "خرداد ۱۴۰۳ - تاکنون",
        details: [
          "پشتیبان سامانه سجفا (سامانه جامع فرآیند‌های اداری و آموزشی).",
          "سایر وظایف مرتبط با پست سازمانی، از جمله آمارگیری‌ها، طرح برنامه‌های مناسب جهت سازماندهی و به‌کارگیری تمامی نیروهای استان و رصد پروسه مهم نقل و انتقالات همکاران طبق جداول مازاد و نیاز هر کد رشته و پایه.",
        ],
      },
      {
        title: "هنرآموز الکتروتکنیک",
        company: "هنرستان کار دانش",
        period: "دی ۱۴۰۱ - خرداد ۱۴۰۲",
        details: [
          "طراحی درس‌های تعاملی و فعالیت‌های عملی برای افزایش دانش عملی دانش‌آموزان در زمینه الکتروتکنیک.",
          "تدریس کتب درسی رشته برق صنعت و تعمیرات لوازم خانگی و برگزاری کارگاه‌های عملی برای بستن و تعمیرات مدارهای مختلف و پروژه‌های ساختمانی.",
        ],
      },
      {
        title: "مدرس زبان",
        company: "به طور خصوصی و در موسسه",
        period: "خرداد ۱۴۰۲ - تاکنون",
        details: [
          "تدریس سری کتاب‌های Touchstone از سطوح پایین تا پیشرفته، همچنین کتب Oxford Word Skills.",
          "تدریس خصوصی کلاس‌های آمادگی آزمون IELTS و هر یک از مهارت‌های چهارگانه، خصوصاً مهارت Speaking.",
        ],
      },
      {
        title: "تولید محتوا و گویندگی",
        company: "همکاری با شرکت کالاصنعتی",
        period: "خرداد ۱۴۰۲",
        details: [
          "تهیه و تنظیم پادکست‌های صوتی و محتوای ویدیویی برای محصولات سایت جهت بهبود SEO و بازدید صفحات.",
        ],
      },
    ],
    education: [
      {
        degree: "کارشناسی ارشد مدیریت فناوری اطلاعات (گرایش کسب و کار الکترونیک)",
        institution: "دانشگاه فردوسی",
        period: "مهر ۱۴۰۲ - تاکنون",
      },
      {
        degree: "کارشناسی مهندسی برق (گرایش قدرت)",
        institution: "دانشگاه تربیت دبیر شهید رجایی تهران",
        period: "بهمن ۱۳۹۷ - بهمن ۱۴۰۱",
      },
      {
        degree: "دیپلم ریاضی فیزیک",
        institution: "دبیرستان سمپاد شهید هاشمی نژاد ۲ مشهد",
        period: "مهر ۱۳۹۳ - خرداد ۱۳۹۷",
      },
    ],
    contact: {
      email: "soroush.qary.eemit@gmail.com",
      linkedin: "https://www.linkedin.com/in/soroush-qary-08392334b",
      github: "https://github.com/Soroushq",
      phone: "09154758378",
    },
    downloadResume: "دانلود رزومه",
  };

  // استخراج همه تاریخ‌ها برای خط زمانی افقی خلاصه
  const timelineItems = [
    ...content.experience.map(exp => ({ 
      period: exp.period, 
      title: exp.title, 
      type: 'experience',
      color: theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-600' 
    })),
    ...content.education.map(edu => ({ 
      period: edu.period, 
      title: edu.degree, 
      type: 'education',
      color: theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'
    }))
  ].sort((a, b) => {
    // مرتب‌سازی بر اساس سال (از آخر به اول)
    const yearA = a.period.match(/\d{4}/g);
    const yearB = b.period.match(/\d{4}/g);
    if (!yearA || !yearB) return 0;
    return parseInt(yearB[0]) - parseInt(yearA[0]);
  });

  return (
    <div 
      dir="rtl" 
      className={`relative min-h-screen py-8 transition-colors duration-300 
        ${theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 to-indigo-950 text-white' 
          : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800'}`}
    >
      
      {/* دکمه بازگشت به صفحه اصلی */}
      <div className="absolute top-6 right-6 z-50">
        <Link 
          href="/" 
          className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all 
            ${theme === 'dark' 
              ? 'bg-gray-800 text-white' 
              : 'bg-white text-gray-800'}`}
        >
          <FaArrowLeft className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
          <span>بازگشت به صفحه اصلی</span>
        </Link>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* کارت اصلی با طراحی شیشه‌ای و سایه‌ها */}
        <div 
          className={`backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gray-800/90 border border-gray-700'
              : 'bg-white/90 border border-gray-100'
          }`}
        >
          <div className="p-6 sm:p-10">
            {/* بخش هدر با اطلاعات اصلی */}
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
              {/* عکس پروفایل با حاشیه شیک - تغییر چینش به راست */}
              <div className="relative w-48 h-48 md:w-64 md:h-64 order-1 md:order-1 ml-0 md:ml-0 md:mr-0">
                <div className={`w-full h-full rounded-full overflow-hidden border-4 border-gradient-to-r from-blue-400 to-purple-500 shadow-xl ${
                  theme === 'dark' ? 'shadow-blue-900/20' : ''
                }`}>
                  <Image
                    src="/photos/avatar/me.jpg"
                    alt="تصویر سروش قاری ایوری"
                    width={256}
                    height={256}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                <div className={`absolute -bottom-2 -right-2 text-white p-2 rounded-full shadow-lg ${
                  theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'
                }`}>
                  <FaBriefcase size={18} />
                </div>
              </div>

              {/* اطلاعات هویتی و توضیحات */}
              <div className="flex-1 text-right order-2 md:order-2">
                <h1 className={`text-4xl font-bold mb-2 bg-clip-text text-transparent ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600'
                }`}>
                  {content.title}
                </h1>
                <h2 className={`text-xl mb-4 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {content.subtitle}
                </h2>
                <p className={`leading-relaxed text-justify ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {content.description}
                </p>
                
                {/* دکمه‌های ارتباطی با آیکون و انیمیشن */}
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                  <a
                    href={`mailto:${content.contact.email}`}
                    className={`flex items-center gap-2 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md ${
                      theme === 'dark' ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <FaEnvelope />
                    <span className="hidden sm:inline">ایمیل</span>
                  </a>
                  <a
                    href={`tel:${content.contact.phone}`}
                    className={`flex items-center gap-2 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md ${
                      theme === 'dark' ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <FaPhone />
                    <span className="hidden sm:inline">تماس</span>
                  </a>
                  <a
                    href={content.contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md ${
                      theme === 'dark' ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <FaLinkedin />
                    <span className="hidden sm:inline">لینکدین</span>
                  </a>
                  <a
                    href={content.contact.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md ${
                      theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    <FaGithub />
                    <span className="hidden sm:inline">گیت‌هاب</span>
                  </a>
                  <a
                    href="/resume-soroush-qary.pdf"
                    download
                    className={`flex items-center gap-2 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md ${
                      theme === 'dark' ? 'bg-purple-700 hover:bg-purple-600' : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    <FaDownload />
                    <span>{content.downloadResume}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* بخش مهارت‌ها با کارت‌های متحرک */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className={`h-1 w-10 ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'}`}></div>
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  مهارت‌های اصلی
                </h2>
                <div className={`h-1 flex-grow ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-600/20'}`}></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {content.competencies.map((competency, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-r-4 border-r-blue-500 ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{competency.icon}</div>
                      <p>{competency.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* خط زمانی افقی خلاصه */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className={`h-1 w-10 ${theme === 'dark' ? 'bg-cyan-500' : 'bg-cyan-600'}`}></div>
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  خط زمانی
                </h2>
                <div className={`h-1 flex-grow ${theme === 'dark' ? 'bg-cyan-500/20' : 'bg-cyan-600/20'}`}></div>
              </div>

              <div 
                className={`relative py-6 ${
                  theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-100/60'
                } rounded-xl mb-6`}
              >
                <div className="absolute h-1 top-1/2 left-4 right-4 transform -translate-y-1/2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500"></div>
                
                <Swiper
                  modules={[FreeMode, Mousewheel]}
                  spaceBetween={8}
                  slidesPerView="auto"
                  freeMode={true}
                  mousewheel={true}
                  dir="rtl"
                  className="w-full select-none"
                  breakpoints={{
                    640: {
                      slidesPerView: 3,
                      spaceBetween: 15,
                    },
                    768: {
                      slidesPerView: 4,
                      spaceBetween: 20,
                    },
                    1024: {
                      slidesPerView: timelineItems.length,
                      spaceBetween: 25,
                    },
                  }}
                >
                  {timelineItems.map((item, index) => (
                    <SwiperSlide key={index} className="!w-auto">
                      <div 
                        className="flex flex-col items-center cursor-pointer group transition-all px-2"
                        onClick={() => scrollToTimeframe(item.period, item.type)}
                      >
                        <div className={`w-6 h-6 rounded-full ${
                          item.type === 'experience' 
                            ? theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-600'
                            : theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'
                        } ${
                          activeTimeframe === item.period ? 'ring-4 ring-offset-2' : ''
                        } ${
                          theme === 'dark' ? 'ring-gray-800' : 'ring-white'
                        } shadow-lg z-10 transition-all group-hover:scale-125`}></div>
                        
                        <div className={`px-3 py-1 rounded-lg mt-4 text-sm font-medium transition-all ${
                          activeTimeframe === item.period
                            ? theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                            : theme === 'dark' ? 'bg-gray-800/60 text-gray-300' : 'bg-white/60 text-gray-600'
                        } group-hover:scale-105 shadow-md max-w-[150px] text-center select-none`}>
                          <p className="whitespace-nowrap">{item.period}</p>
                          <p className="text-xs mt-1 truncate" title={item.title}>{item.title}</p>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </section>

            {/* بخش سوابق کاری با خط زمانی بهبود یافته */}
            <section ref={experienceSectionRef} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className={`h-1 w-10 ${theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-600'}`}></div>
                <h2 className={`text-2xl font-bold flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  <FaBriefcase className={theme === 'dark' ? 'text-emerald-500' : 'text-emerald-600'} />
                  تجربه‌های حرفه‌ای
                </h2>
                <div className={`h-1 flex-grow ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-600/20'}`}></div>
              </div>
              
              <div className="relative">
                {/* خط زمانی عمودی بهبود یافته */}
                <div className={`absolute top-0 right-6 md:right-9 bottom-0 w-1 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-b from-emerald-600/70 via-cyan-500/70 to-blue-500/70'
                    : 'bg-gradient-to-b from-emerald-600 via-cyan-500 to-blue-500'
                }`}></div>
                
                <div className="space-y-6">
                  {content.experience.map((exp, index) => (
                    <div 
                      key={index} 
                      id={`experience-${exp.period.replace(/\s/g, '-')}`}
                      className={`relative ${
                        activeTimeframe && activeTimeframe !== exp.period
                          ? 'opacity-90'
                          : 'opacity-100'
                      } transition-all duration-300`}
                    >
                      {/* نشانگر زمان روی خط */}
                      <div className="absolute right-4 md:right-7 top-6 transform translate-x-1/2 -translate-y-1/2 z-10">
                        <div className={`flex flex-col items-center group`}>
                          <div className={`w-6 h-6 rounded-full ${
                            theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'
                          } flex items-center justify-center group-hover:animate-pulse`}>
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          </div>
                          <div className={`mt-2 px-2 py-1 rounded-lg text-sm font-medium hidden md:block ${
                            theme === 'dark' 
                              ? 'bg-emerald-900/40 text-emerald-300' 
                              : 'bg-emerald-100 text-emerald-800'
                          } whitespace-nowrap`}>
                            {exp.period}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`mr-20 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all relative ${
                        theme === 'dark'
                          ? 'bg-gray-700 border border-gray-600'
                          : 'bg-white border border-gray-100'
                      }`}>
                        {/* مثلث اتصال به خط زمانی */}
                        <div className={`absolute top-6 right-0 w-4 h-4 transform rotate-45 -mr-2 ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-r border-t border-gray-600'
                            : 'bg-white border-r border-t border-gray-100'
                        }`}></div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <h3 className={`text-xl font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>{exp.title}</h3>
                          {/* نمایش تاریخ در داخل باکس در نمای موبایل */}
                          <div className="md:hidden text-sm font-medium">
                            <span className={`px-2 py-0.5 rounded ${
                              theme === 'dark' 
                                ? 'bg-emerald-900/40 text-emerald-300' 
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {exp.period}
                            </span>
                          </div>
                        </div>
                        <p className={`mb-3 font-medium ${
                          theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                        }`}>{exp.company}</p>
                        <ul className={`list-disc list-inside space-y-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {exp.details.map((detail, i) => (
                            <li key={i}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* بخش تحصیلات با خط زمانی بهبود یافته */}
            <section ref={educationSectionRef}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`h-1 w-10 ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'}`}></div>
                <h2 className={`text-2xl font-bold flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  <FaGraduationCap className={theme === 'dark' ? 'text-blue-500' : 'text-blue-600'} />
                  سوابق تحصیلی
                </h2>
                <div className={`h-1 flex-grow ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-600/20'}`}></div>
              </div>
              
              <div className="relative">
                {/* خط زمانی عمودی بهبود یافته */}
                <div className={`absolute top-0 right-6 md:right-9 bottom-0 w-1 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-b from-blue-600/70 via-cyan-500/70 to-emerald-500/70'
                    : 'bg-gradient-to-b from-blue-600 via-cyan-500 to-emerald-500'
                }`}></div>
                
                <div className="space-y-6">
                  {content.education.map((edu, index) => (
                    <div 
                      key={index} 
                      id={`education-${edu.period.replace(/\s/g, '-')}`}
                      className={`relative ${
                        activeTimeframe && activeTimeframe !== edu.period
                          ? 'opacity-90'
                          : 'opacity-100'
                      } transition-all duration-300`}
                    >
                      {/* نشانگر زمان روی خط */}
                      <div className="absolute right-4 md:right-7 top-6 transform translate-x-1/2 -translate-y-1/2 z-10">
                        <div className={`flex flex-col items-center group`}>
                          <div className={`w-6 h-6 rounded-full ${
                            theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                          } flex items-center justify-center group-hover:animate-pulse`}>
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          </div>
                          <div className={`mt-2 px-2 py-1 rounded-lg text-sm font-medium hidden md:block ${
                            theme === 'dark' 
                              ? 'bg-blue-900/40 text-blue-300' 
                              : 'bg-blue-100 text-blue-800'
                          } whitespace-nowrap`}>
                            {edu.period}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`mr-20 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all relative ${
                        theme === 'dark'
                          ? 'bg-gray-700 border border-gray-600'
                          : 'bg-white border border-gray-100'
                      }`}>
                        {/* مثلث اتصال به خط زمانی */}
                        <div className={`absolute top-6 right-0 w-4 h-4 transform rotate-45 -mr-2 ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-r border-t border-gray-600'
                            : 'bg-white border-r border-t border-gray-100'
                        }`}></div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <h3 className={`text-xl font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>{edu.degree}</h3>
                          {/* نمایش تاریخ در داخل باکس در نمای موبایل */}
                          <div className="md:hidden text-sm font-medium">
                            <span className={`px-2 py-0.5 rounded ${
                              theme === 'dark' 
                                ? 'bg-blue-900/40 text-blue-300' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {edu.period}
                            </span>
                          </div>
                        </div>
                        <p className={`mt-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>{edu.institution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      
      {/* استایل بهبود یافته برای خط زمانی */}
      <style jsx>{`
        .timeline::before {
          content: '';
          position: absolute;
          top: 0;
          right: 7px;
          height: 100%;
          width: 3px;
          background: linear-gradient(to bottom, 
            rgba(16, 185, 129, 0.7) 0%, 
            rgba(6, 182, 212, 0.7) 50%, 
            rgba(59, 130, 246, 0.7) 100%);
          z-index: 1;
          border-radius: 3px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        
        html.dark .timeline::before {
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          background: linear-gradient(to bottom, 
            rgba(16, 185, 129, 0.5) 0%, 
            rgba(6, 182, 212, 0.5) 50%, 
            rgba(59, 130, 246, 0.5) 100%);
        }
        
        .timeline-item:last-child {
          margin-bottom: 0;
        }
        
        /* افکت انیمیشن برای خط زمانی */
        .timeline-panel {
          transition: all 0.3s ease;
        }
        
        .timeline-panel:hover {
          transform: translateX(-5px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        html.dark .timeline-panel:hover {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
        }
        
        /* افکت انیمیشن برای بج‌های خط زمانی */
        .timeline-badge {
          transition: all 0.3s ease;
        }
        
        .timeline-item:hover .timeline-badge {
          transform: scale(1.1);
        }
        
        /* حذف نمایش اسکرول‌بار */
        .no-scrollbar {
          -ms-overflow-style: none;  /* برای اینترنت اکسپلورر و Edge */
          scrollbar-width: none;  /* برای Firefox */
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* برای Chrome, Safari, and Opera */
        }
        
        /* استایل‌های Swiper */
        :global(.swiper-slide) {
          width: auto;
          height: auto;
        }
        
        :global(.swiper) {
          padding: 0 10px;
        }
      `}</style>
    </div>
  );
} 