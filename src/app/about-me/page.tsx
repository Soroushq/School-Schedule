'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import Image from 'next/image';
import { FaEnvelope, FaGithub, FaLinkedin, FaDownload, FaCode, FaTools, FaDatabase, FaPhone, FaExternalLinkAlt, FaSchool, FaBriefcase, FaGraduationCap, FaArrowLeft, FaMoon, FaSun } from "react-icons/fa";
import Link from 'next/link';

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
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  useEffect(() => {
    // بررسی حالت تم ذخیره شده در localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
    
    // تنظیم زبان پیش‌فرض
    setLanguage('fa');
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

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

  return (
    <div dir="rtl" className={`relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 py-8`}>
      {/* دکمه بازگشت به صفحه اصلی */}
      <div className="absolute top-6 right-6 z-50">
        <Link href="/" className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all">
          <FaArrowLeft className="text-blue-600 dark:text-blue-400" />
          <span>بازگشت به صفحه اصلی</span>
        </Link>
      </div>
      
      {/* دکمه تغییر تم با طراحی بهتر */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center bg-white/90 dark:bg-gray-800/90 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
          aria-label={darkMode ? "روشن کردن تم" : "تاریک کردن تم"}
        >
          {darkMode ? (
            <FaSun className="text-yellow-500 text-2xl" />
          ) : (
            <FaMoon className="text-blue-600 text-2xl" />
          )}
        </button>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* کارت اصلی با طراحی شیشه‌ای و سایه‌ها */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-6 sm:p-10">
            {/* بخش هدر با اطلاعات اصلی */}
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
              {/* عکس پروفایل با حاشیه شیک - تغییر چینش به راست */}
              <div className="relative w-48 h-48 md:w-64 md:h-64 order-1 md:order-1 ml-0 md:ml-0 md:mr-0">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-gradient-to-r from-blue-400 to-purple-500 shadow-xl">
                  <Image
                    src="/photos/avatar/me.jpg"
                    alt="تصویر سروش قاری ایوری"
                    width={256}
                    height={256}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg">
                  <FaBriefcase size={18} />
                </div>
              </div>

              {/* اطلاعات هویتی و توضیحات */}
              <div className="flex-1 text-right order-2 md:order-2">
                <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                  {content.title}
                </h1>
                <h2 className="text-xl text-gray-600 dark:text-gray-300 mb-4">{content.subtitle}</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                  {content.description}
                </p>
                
                {/* دکمه‌های ارتباطی با آیکون و انیمیشن */}
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                  <a
                    href={`mailto:${content.contact.email}`}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    <FaEnvelope />
                    <span className="hidden sm:inline">ایمیل</span>
                  </a>
                  <a
                    href={`tel:${content.contact.phone}`}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    <FaPhone />
                    <span className="hidden sm:inline">تماس</span>
                  </a>
                  <a
                    href={content.contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    <FaLinkedin />
                    <span className="hidden sm:inline">لینکدین</span>
                  </a>
                  <a
                    href={content.contact.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    <FaGithub />
                    <span className="hidden sm:inline">گیت‌هاب</span>
                  </a>
                  <a
                    href="/resume-soroush-qary.pdf"
                    download
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"
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
                <div className="h-1 w-10 bg-blue-600"></div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">مهارت‌های اصلی</h2>
                <div className="h-1 flex-grow bg-blue-600/20"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {content.competencies.map((competency, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-r-4 border-r-blue-500"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{competency.icon}</div>
                      <p className="text-gray-700 dark:text-gray-200">{competency.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* بخش سوابق کاری با خط زمانی بهبود یافته */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-10 bg-green-600"></div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <FaBriefcase className="text-green-600" />
                  تجربه‌های حرفه‌ای
                </h2>
                <div className="h-1 flex-grow bg-green-600/20"></div>
              </div>
              
              <div className="space-y-0 relative timeline">
                {content.experience.map((exp, index) => (
                  <div key={index} className="timeline-item mb-8 relative z-0">
                    <div className="timeline-badge absolute top-0 right-0 w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/60 flex items-center justify-center shadow-md -mr-7 z-10 backdrop-blur-sm border-2 border-green-400 dark:border-green-500">
                      <div className="w-7 h-7 rounded-full bg-green-600 dark:bg-green-400 flex items-center justify-center">
                        <FaBriefcase className="text-white text-sm" />
                      </div>
                    </div>
                    
                    <div className="timeline-panel mr-20 bg-white dark:bg-gray-700 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all relative border border-gray-100 dark:border-gray-600">
                      {/* مثلث کوچک برای اتصال به خط زمانی - بهبود یافته */}
                      <div className="absolute top-4 right-0 w-4 h-4 bg-white dark:bg-gray-700 transform rotate-45 -mr-2 border-r border-t border-gray-100 dark:border-gray-600"></div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{exp.title}</h3>
                        <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-sm px-3 py-1 rounded-full border border-green-200 dark:border-green-700 shadow-sm backdrop-blur-sm">
                          {exp.period}
                        </span>
                      </div>
                      <p className="text-blue-600 dark:text-blue-400 mb-3 font-medium">{exp.company}</p>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                        {exp.details.map((detail, i) => (
                          <li key={i}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* بخش تحصیلات با خط زمانی بهبود یافته */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-10 bg-purple-600"></div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <FaGraduationCap className="text-purple-600" />
                  سوابق تحصیلی
                </h2>
                <div className="h-1 flex-grow bg-purple-600/20"></div>
              </div>
              
              <div className="space-y-0 relative timeline">
                {content.education.map((edu, index) => (
                  <div key={index} className="timeline-item mb-8 relative z-0">
                    <div className="timeline-badge absolute top-0 right-0 w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center shadow-md -mr-7 z-10 backdrop-blur-sm border-2 border-purple-400 dark:border-purple-500">
                      <FaGraduationCap className="text-purple-600 dark:text-purple-300 text-xl" />
                    </div>
                    
                    <div className="timeline-panel mr-20 bg-white dark:bg-gray-700 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all relative border border-gray-100 dark:border-gray-600">
                      {/* مثلث کوچک برای اتصال به خط زمانی - بهبود یافته */}
                      <div className="absolute top-4 right-0 w-4 h-4 bg-white dark:bg-gray-700 transform rotate-45 -mr-2 border-r border-t border-gray-100 dark:border-gray-600"></div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{edu.degree}</h3>
                        <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 text-sm px-3 py-1 rounded-full border border-purple-200 dark:border-purple-700 shadow-sm backdrop-blur-sm">
                          {edu.period}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{edu.institution}</p>
                    </div>
                  </div>
                ))}
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
            rgba(74, 222, 128, 0.7) 0%, 
            rgba(74, 222, 128, 0.7) 50%, 
            rgba(168, 85, 247, 0.7) 50%, 
            rgba(168, 85, 247, 0.7) 100%);
          z-index: 1;
          border-radius: 3px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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
        
        /* افکت انیمیشن برای بج‌های خط زمانی */
        .timeline-badge {
          transition: all 0.3s ease;
        }
        
        .timeline-item:hover .timeline-badge {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
} 