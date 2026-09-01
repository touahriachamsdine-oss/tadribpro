'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { BookOpen, Shield, Users, Landmark, Mail, Phone, MapPin } from 'lucide-react';

export default function LandingPage() {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f3]">
      {/* 1. Global Navigation Bar */}
      <header className="border-b border-[#F3E4C9] bg-[#fbf8f3] z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="TakwinPro" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full shadow-md bg-[#fbf8f3]" />
            <div>
              <span className="font-bold text-lg sm:text-xl block leading-tight text-[#3E5C46]">
                {language === 'ar' ? t('brandName') : 'TakwinPro'}
              </span>
              <span className="text-[10px] sm:text-xs text-[#5C7449] block tracking-tight hidden sm:block">
                {language === 'ar' ? 'التكوين المتواصل' : 'Formation Continue'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full border border-[#3E5C46] text-[#3E5C46] hover:bg-[#3E5C46] hover:text-[#F3E4C9] transition-colors"
            >
              {language === 'ar' ? 'Français' : 'العربية'}
            </button>

            {/* Ghost login */}
            <Link href="/auth" className="btn-pill-ghost hidden sm:inline-flex text-sm">
              {t('ctaLogin')}
            </Link>

            {/* Sage Pill Register */}
            <Link href="/auth?tab=register" className="btn-pill-sage text-xs sm:text-sm py-2 px-4 sm:px-6">
              {t('register')}
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Grain Texture */}
      <section className="bg-grain relative overflow-hidden bg-gradient-to-br from-[#F3E4C9] via-[#fbf8f3] to-[#F3E4C9] py-12 sm:py-20 lg:py-32 border-b border-[#F3E4C9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Hero text */}
          <div className="lg:col-span-7 flex flex-col items-start gap-4 sm:gap-6 text-start">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 bg-[#CCD67F]/45 text-[#3E5C46] rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3E5C46]"></span>
              الجزائر — الجمهورية الديمقراطية الشعبية
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#3E5C46] leading-[1.25] tracking-tight">
              {t('heroTitle')}
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-[#5C7449] leading-relaxed max-w-2xl">
              {t('heroSubtitle')}
            </p>
            
            <p className="text-xs sm:text-sm text-[#3E5C46] font-semibold">
              ⭐ {t('heroTagline')}
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4 mt-2 w-full sm:w-auto">
              <Link href="/auth?tab=register" className="btn-pill-sage text-sm sm:text-base w-full sm:w-auto text-center">
                {t('ctaJoin')}
              </Link>
              <Link href="/auth" className="btn-pill-ghost text-sm sm:text-base w-full sm:w-auto text-center">
                {t('ctaLogin')}
              </Link>
            </div>
          </div>

          {/* Hero Abstract Graphic */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            {/* Cool floating logo */}
            <img src="/logo.svg" alt="TP" className="absolute -top-8 -right-8 w-48 h-48 sm:w-72 sm:h-72 opacity-20 rotate-[12deg] pointer-events-none select-none z-0" />
            <div className="w-full max-w-md aspect-square bg-[#F3E4C9] p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden rounded-3xl border-2 border-[#5C7449] z-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCD67F]/30 rounded-bl-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#5C7449]/20 rounded-tr-full pointer-events-none"></div>
              
              <div className="flex justify-between items-start z-10">
                <span className="text-2xl sm:text-3xl font-black text-[#3E5C46]">01</span>
                <span className="px-3 py-1 bg-[#CCD67F] text-[#3E5C46] text-[10px] sm:text-xs font-bold rounded-full">TakwinPro</span>
              </div>
              
              <div className="z-10 my-4 sm:my-6">
                <h3 className="text-xl sm:text-2xl font-bold text-[#3E5C46] mb-2">
                  {language === 'ar' ? 'نظام مودل المطور' : 'Structure Moodle Adaptée'}
                </h3>
                <p className="text-sm text-[#5C7449]">
                  {language === 'ar' 
                    ? 'مسارات موجهة للترقية الإدارية والموظفين المتربصين بأسلاك الوظيفة العمومية.' 
                    : 'Parcours certifiants pour la promotion de grade dans la fonction publique algérienne.'}
                </p>
              </div>

              <div className="flex items-center gap-3 z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-[#CCD67F]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#5C7449]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#3E5C46]"></div>
                <div className="h-0.5 flex-grow bg-[#5C7449]/30"></div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Features Columns (Flat, borderless, zero card-shadows, negative space) */}
      <section className="py-12 sm:py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-10 sm:mb-16 flex flex-col items-center gap-3">
          <span className="text-xs sm:text-sm font-bold text-[#3E5C46] uppercase tracking-widest bg-[#F3E4C9] px-4 py-1 rounded-full">
            {t('featureTitle')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#3E5C46]">
            {language === 'ar' ? 'بوابة التكوين الرقمية المتكاملة' : 'Une ingénierie de formation intégrée'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
          
          {/* Card 1 - Structured Training */}
          <div className="bg-[#F3E4C9] p-6 sm:p-8 flex flex-col gap-5 justify-between relative overflow-hidden rounded-2xl group transition-all duration-300 hover:bg-[#EBDCBE]">
            <div className="bg-[#3E5C46] text-[#F3E4C9] w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-[#3E5C46]">
                {t('feature1Title')}
              </h3>
              <p className="text-sm text-[#5C7449] leading-relaxed">
                {t('feature1Desc')}
              </p>
            </div>
            <div className="h-1 bg-[#3E5C46] w-12 group-hover:w-full transition-all duration-300"></div>
          </div>

          {/* Card 2 - Company Panels */}
          <div className="bg-[#F3E4C9] p-6 sm:p-8 flex flex-col gap-5 justify-between relative overflow-hidden rounded-2xl group transition-all duration-300 hover:bg-[#EBDCBE]">
            <div className="bg-[#3E5C46] text-[#F3E4C9] w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-[#3E5C46]">
                {t('feature2Title')}
              </h3>
              <p className="text-sm text-[#5C7449] leading-relaxed">
                {t('feature2Desc')}
              </p>
            </div>
            <div className="h-1 bg-[#3E5C46] w-12 group-hover:w-full transition-all duration-300"></div>
          </div>

          {/* Card 3 - National Certification */}
          <div className="bg-[#F3E4C9] p-6 sm:p-8 flex flex-col gap-5 justify-between relative overflow-hidden rounded-2xl group transition-all duration-300 hover:bg-[#EBDCBE]">
            <div className="bg-[#3E5C46] text-[#F3E4C9] w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-[#3E5C46]">
                {t('feature3Title')}
              </h3>
              <p className="text-sm text-[#5C7449] leading-relaxed">
                {t('feature3Desc')}
              </p>
            </div>
            <div className="h-1 bg-[#3E5C46] w-12 group-hover:w-full transition-all duration-300"></div>
          </div>

        </div>
      </section>

      {/* Developer Sandbox Nav Overlay for quick previewing during B2B client demo */}
      <div className="fixed bottom-3 left-3 right-3 sm:left-auto bg-[#3E5C46] text-[#F3E4C9] p-3 sm:p-4 flex flex-wrap items-center gap-2 rounded-2xl shadow-xl z-50 border border-[#5C7449] max-w-xl">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#CCD67F] block border-b border-[#CCD67F] pb-1 w-full">
          ⚙️ لوحة تتبع العرض العميل (Demo Quick Hop)
        </span>
        <Link href="/" className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 bg-[#5C7449] rounded hover:bg-[#fbf8f3] hover:text-[#3E5C46] transition-colors font-semibold">
          Landing Page
        </Link>
        <Link href="/auth" className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 bg-[#5C7449] rounded hover:bg-[#fbf8f3] hover:text-[#3E5C46] transition-colors font-semibold">
          Sign In / Register
        </Link>
        <Link href="/super-admin?demo=1" className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 bg-[#5C7449] rounded hover:bg-[#fbf8f3] hover:text-[#3E5C46] transition-colors font-semibold">
          Super Admin Panel
        </Link>
        <Link href="/company?demo=1" className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 bg-[#5C7449] rounded hover:bg-[#fbf8f3] hover:text-[#3E5C46] transition-colors font-semibold">
          Company Panel
        </Link>
        <Link href="/trainee?demo=1" className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 bg-[#5C7449] rounded hover:bg-[#fbf8f3] hover:text-[#3E5C46] transition-colors font-semibold">
          Trainee View
        </Link>
        <Link href="/verify" className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 bg-[#CCD67F] text-[#3E5C46] rounded hover:bg-[#fbf8f3] hover:text-[#3E5C46] transition-colors font-bold">
          Verify Portal
        </Link>
      </div>

      {/* 4. Footer Section */}
      <footer className="mt-auto bg-[#3E5C46] text-[#F3E4C9] py-10 sm:py-16 border-t-4 border-[#CCD67F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10">
          
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#CCD67F] text-[#3E5C46] p-2 rounded-full">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl">{t('brandName')}</span>
            </div>
            <p className="text-sm text-[#F3E4C9]/80 leading-relaxed max-w-sm">
              {language === 'ar'
                ? 'النظام المطور لإدارة التكوين المسبق للترقية والإدماج المهني لموظفي الإدارات والمؤسسات العمومية الجزائرية.'
                : 'Portail officiel développé pour la formation continue et la gestion des parcours de promotion des agents de la fonction publique.'}
            </p>
          </div>

          <div className="md:col-span-4 flex flex-col gap-4">
            <h4 className="font-bold text-lg text-[#CCD67F] border-b border-[#F3E4C9]/20 pb-2">
              {t('footerContact')}
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#CCD67F]" />
                <span>{t('footerAddress')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#CCD67F]" />
                <span dir="ltr">+213 (0) 21 00 00 00</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#CCD67F]" />
                <span>contact@takwinpro.dz</span>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className="font-bold text-lg text-[#CCD67F] border-b border-[#F3E4C9]/20 pb-2">
              {language === 'ar' ? 'القطاعات الرسمية' : 'Secteurs de formation'}
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-[#F3E4C9]/70">
              <li>{language === 'ar' ? 'الأسلاك المشتركة' : 'Corps Communs'}</li>
              <li>{language === 'ar' ? 'أسلاك دعم البحث' : 'Soutien à la Recherche'}</li>
              <li>{language === 'ar' ? 'الأسلاك الإقليمية' : 'Territorial & Régional'}</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 sm:mt-12 pt-6 border-t border-[#F3E4C9]/10 text-center text-xs text-[#F3E4C9]/50">
          {t('footerCopyright')}
        </div>
      </footer>
    </div>
  );
}
