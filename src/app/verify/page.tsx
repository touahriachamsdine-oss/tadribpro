'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { db, Certificate } from '@/lib/db';
import {
  Search,
  CheckCircle2,
  XCircle,
  Printer,
  Award,
  Languages,
  Building2,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  HelpCircle
} from 'lucide-react';

// Local dictionary for high-fidelity bilingual translations inside the verification route
const localTranslations = {
  ar: {
    verifyTitle: 'البوابة الوطنية للتحقق من الشهادات',
    verifySubtitle: 'تحقق فورياً من مصداقية وصحة شهادات التكوين التأهيلي الممنوحة لموظفي الإدارات والمؤسسات العمومية بالجزائر.',
    placeholderCode: 'أدخل رقم الشهادة (مثال: CERT-2026-0391) أو رمز التحقق (Hash)...',
    btnVerify: 'تحقق من الصحة',
    verifying: 'جاري مطابقة البيانات...',
    statusValid: 'شهادة رسمية معتمدة',
    statusValidDesc: 'تم التحقق بنجاح! هذه الشهادة مسجلة رسمياً في قاعدة البيانات الوطنية للوظيفة العمومية ومطابقة لكافة شروط الترقية.',
    statusInvalid: 'رقم القيد غير مدرج',
    statusInvalidDesc: 'عذراً، لم نتمكن من العثور على أي شهادة تطابق هذا الرمز في سجلات التكوين المعتمدة. يرجى التأكد من كتابته بشكل صحيح.',
    inspectorsGuide: 'دليل المفتشين والإدارات العمومية',
    inspectorsGuideDesc: 'أين تجد رمز التحقق؟ يظهر الرمز في الجزء السفلي أو العلوي للشهادة المطبوعة تحت مسمى "Registry N°" أو "رقم القيد". يمكن أيضاً استخدام مفتاح التشفير الفريد (Hash) المطبوع.',
    labelTrainee: 'اسم الموظف المتكون',
    labelInstitution: 'الهيئة الإدارية / المؤسسة',
    labelTrack: 'الشعبة / المسار التكويني',
    labelIssueDate: 'تاريخ إصدار الشهادة',
    labelRegistryNo: 'رقم القيد والتسجيل',
    printAttestation: 'طباعة النسخة الرسمية للشهادة',
    backToHome: 'العودة للصفحة الرئيسية',
    searchHint: 'النظام يدعم التحقق الفوري لجميع الأسلاك المشتركة والتقنية والإقليمية.',
    officialAttestation: 'شهادة إتمام التكوين المتواصل المعتمدة',
    officialReg: 'رقم القيد الرسمي',
    certifiedBy: 'مصدق من قبل وزارة الوظيفة العمومية'
  },
  fr: {
    verifyTitle: 'Portail National de Vérification des Attestations',
    verifySubtitle: 'Vérifiez instantanément l’authenticité et la conformité des certificats de formation continue délivrés aux fonctionnaires en Algérie.',
    placeholderCode: 'Entrez le numéro d’attestation (ex: CERT-2026-0391) ou la clé de hachage (Hash)...',
    btnVerify: 'Vérifier l’authenticité',
    verifying: 'Vérification dans le registre...',
    statusValid: 'Attestation Officielle Validée',
    statusValidDesc: 'Vérification réussie ! Ce certificat est officiellement enregistré dans le registre national de la fonction publique et validé pour la promotion.',
    statusInvalid: 'Numéro d’enregistrement introuvable',
    statusInvalidDesc: 'Aucune attestation correspondante n’a été trouvée dans nos registres. Veuillez vérifier la saisie ou contacter l’établissement émetteur.',
    inspectorsGuide: 'Guide pour les inspecteurs et administrations',
    inspectorsGuideDesc: 'Où trouver le code de vérification ? Le code d’identification est inscrit au bas ou au haut du document officiel sous l’intitulé "Registry N°" ou "رقم القيد". La clé numérique (Hash) est également valide.',
    labelTrainee: 'Nom du fonctionnaire stagiaire',
    labelInstitution: 'Administration publique / Organisme',
    labelTrack: 'Filière / Parcours de formation',
    labelIssueDate: 'Date de délivrance',
    labelRegistryNo: 'N° d’enregistrement officiel',
    printAttestation: 'Imprimer l’attestation officielle',
    backToHome: 'Retour à l’accueil',
    searchHint: 'Le système supporte la vérification instantanée pour tous les corps communs et filières.',
    officialAttestation: 'ATTESTATION DE RÉUSSITE OFFICIELLE',
    officialReg: 'N° de registre officiel',
    certifiedBy: 'Certifié par le Ministère de la Fonction Publique'
  }
};

export default function CertificateVerificationPage() {
  const { language, toggleLanguage, dir } = useLanguage();
  
  // Localized dictionary accessor
  const lt = localTranslations[language];

  // States
  const [searchCode, setSearchCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  // Auto-populate from URL query if present (e.g. ?code=CERT-2026-0391)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code') || params.get('id');
      if (code) {
        setSearchCode(code);
        triggerVerification(code);
      }
    }
  }, []);

  const triggerVerification = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;
    setIsVerifying(true);
    setSearched(false);
    setCertificate(null);

    // Simulate database lookup latency for ultra-premium verification feel
    setTimeout(async () => {
      try {
        const result = await db.verifyCertificate(codeToVerify);
        setCertificate(result);
        setSearched(true);
      } catch (err) {
        console.error('Verification error:', err);
      } finally {
        setIsVerifying(false);
      }
    }, 1200);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerVerification(searchCode);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#fbf8f3] text-[#2d2621] flex flex-col justify-between font-sans">
      
      {/* 1. TOP LOGO & HEADER SECTION */}
      <header className="border-b border-[#F3E4C9] bg-white/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-[#3E5C46] text-[#F3E4C9] p-2 rounded-full transition-transform group-hover:scale-105">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base text-[#3E5C46] block leading-tight">
                منصة التكوين المتواصل
              </span>
              <span className="text-[10px] sm:text-xs text-[#5C7449] font-semibold block uppercase tracking-wider mt-0.5 font-mono">
                TakwinPro Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#3E5C46] hover:text-[#5C7449] border border-[#3E5C46]/30 px-3 py-1.5 rounded-full transition-colors bg-[#F3E4C9]/10"
            >
              <Languages className="w-4 h-4 text-[#CCD67F]" />
              <span>{language === 'ar' ? 'Français' : 'العربية'}</span>
            </button>

            <Link
              href="/"
              className="text-xs sm:text-sm font-bold text-[#5C7449] hover:underline flex items-center gap-1"
            >
              {dir === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              <span>{lt.backToHome}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. DYNAMIC WATERMARK BACKGROUND CONTAINER */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-12 relative overflow-hidden">
        
        {/* Backdrop faint watermark design */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none z-0">
          <svg width="450" height="450" viewBox="0 0 100 100" fill="none" stroke="#3E5C46" strokeWidth="1.2">
            <circle cx="50" cy="50" r="45" />
            <path d="M50 15 L50 85 M15 50 L85 50 M25 25 L75 75 M25 75 L75 25" />
            <circle cx="50" cy="50" r="25" fill="none" />
          </svg>
        </div>

        <div className="relative z-10">
          
          {/* Main Title Block */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase text-[#5C7449] tracking-widest bg-[#CCD67F]/20 px-4 py-1.5 rounded-full inline-block mb-4">
              🛡️ {language === 'ar' ? 'التحقق الآمن' : 'Vérification Sécurisée'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-[#3E5C46] tracking-tight leading-tight">
              {lt.verifyTitle}
            </h1>
            <p className="text-sm text-[#5C7449] mt-3 leading-relaxed font-medium">
              {lt.verifySubtitle}
            </p>
          </div>

          {/* Elegant Institutional Verification Form Card */}
          <div className="bg-white border-t-4 border-[#3E5C46] p-6 sm:p-8 rounded-2xl shadow-sm max-w-3xl mx-auto mb-12">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-grow w-full">
                <label className="block text-xs font-bold text-[#3E5C46] uppercase tracking-wider mb-2">
                  {language === 'ar' ? 'رمز التسجيل أو رقم القيد الفريد' : 'Code d’enregistrement officiel'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    placeholder={lt.placeholderCode}
                    className="underline-input w-full text-sm sm:text-base font-bold text-[#3E5C46] pr-10 font-mono tracking-wider"
                    required
                    autoCapitalize="characters"
                  />
                  <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} flex items-center pr-3 pointer-events-none`}>
                    <Search className="w-5 h-5 text-[#5C7449]" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="btn-pill-sage py-3 px-8 text-sm w-full sm:w-auto flex-shrink-0 bg-[#3E5C46] text-white hover:bg-[#5C7449] transition-colors font-bold flex items-center justify-center gap-2 rounded-full"
              >
                {isVerifying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{lt.verifying}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>{lt.btnVerify}</span>
                  </>
                )}
              </button>
            </form>

            <span className="text-[10px] font-semibold text-[#5C7449] mt-3 block leading-normal">
              💡 {lt.searchHint}
            </span>
          </div>

          {/* 3. DYNAMIC STATUS & RESULTS DISPATCH */}
          {searched && (
            <div className="max-w-4xl mx-auto mb-12 animate-fadeIn">
              
              {/* IF CERTIFICATE VALID AND FOUND */}
              {certificate ? (
                <div className="flex flex-col gap-8">
                  
                  {/* Status Banner */}
                  <div className="bg-[#3E5C46]/10 border-l-4 border-[#3E5C46] p-5 rounded-2xl flex items-start gap-4">
                    <CheckCircle2 className="w-8 h-8 text-[#3E5C46] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-base text-[#3E5C46]">
                        {lt.statusValid}
                      </h4>
                      <p className="text-xs text-[#5C7449] font-medium mt-1 leading-relaxed">
                        {lt.statusValidDesc}
                      </p>
                    </div>
                  </div>

                  {/* Dual-Language printable graduation attestation itself */}
                  <div className="flex items-center justify-between border-b border-[#F3E4C9] pb-3 mt-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5C7449]">
                      📄 {language === 'ar' ? 'معاينة الشهادة المعتمدة' : 'Aperçu du certificat certifié'}
                    </span>
                    <button
                      onClick={handlePrint}
                      className="btn-pill-sage py-2.5 px-6 text-xs flex items-center gap-2 bg-[#3E5C46] text-white hover:bg-[#5C7449] transition-colors rounded-full font-bold shadow-none"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{lt.printAttestation}</span>
                    </button>
                  </div>

                  {/* Print Stylesheet integration for clean print dispatch */}
                  <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                      body * {
                        visibility: hidden !important;
                      }
                      #certificate-print-area, #certificate-print-area * {
                        visibility: visible !important;
                      }
                      #certificate-print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        margin: 0 !important;
                        padding: 2.5rem !important;
                        box-shadow: none !important;
                        border: 8px double #3E5C46 !important;
                        background: white !important;
                        page-break-after: avoid !important;
                        page-break-before: avoid !important;
                      }
                      @page {
                        size: landscape;
                        margin: 0.5cm;
                      }
                    }
                  `}} />

                  {/* Institution Official Document Frame */}
                  <div
                    id="certificate-print-area"
                    className="bg-[#F3E4C9]/25 p-8 sm:p-12 border-8 border-double border-[#3E5C46] rounded-3xl relative overflow-hidden bg-grain flex flex-col justify-between"
                    style={{ minHeight: '600px' }}
                  >
                    {/* Decorative inner frame */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 bottom-2.5 border-2 border-[#CCD67F]/60 pointer-events-none rounded-2xl" />

                    {/* Backdrop Faint Star Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none z-0">
                      <svg width="350" height="350" viewBox="0 0 100 100" fill="none" stroke="#3E5C46" strokeWidth="1.5">
                        <circle cx="50" cy="50" r="45" />
                        <polygon points="50,12 60,35 85,35 65,53 74,78 50,63 26,78 35,53 15,35 40,35" />
                      </svg>
                    </div>

                    {/* Top: Institutional Headers */}
                    <div className="grid grid-cols-2 gap-6 text-center border-b-2 border-[#3E5C46]/20 pb-6 z-10 relative">
                      {/* Left: French header */}
                      <div className="text-left font-mono text-[9px] sm:text-[10px] text-[#3E5C46] flex flex-col gap-0.5">
                        <span className="font-extrabold uppercase text-[10px] sm:text-[11px] block text-[#3E5C46] leading-normal">
                          République Algérienne Démocratique et Populaire
                        </span>
                        <span className="font-semibold block text-[#5C7449]">
                          Ministère de la Fonction Publique et de la Réforme Administrative
                        </span>
                        <span className="font-medium block text-[#5C7449]">
                          Direction Générale de la Formation et du Perfectionnement
                        </span>
                        <span className="font-bold text-[9px] text-[#3E5C46] mt-2 block font-sans">
                          REG. N°: {certificate.id}
                        </span>
                      </div>

                      {/* Right: Arabic header */}
                      <div className="text-right font-tajawal text-[10px] sm:text-[11px] text-[#3E5C46] flex flex-col gap-0.5">
                        <span className="font-black text-[11px] sm:text-[12px] block text-[#3E5C46] leading-normal">
                          الجمهورية الجزائرية الديمقراطية الشعبية
                        </span>
                        <span className="font-bold block text-[#5C7449]">
                          وزارة الوظيفة العمومية والإصلاح الإداري
                        </span>
                        <span className="font-medium block text-[#5C7449]">
                          المديرية العامة للتكوين وتحسين المستويات
                        </span>
                        <span className="font-extrabold text-[9px] sm:text-[10px] text-[#3E5C46] mt-2 block font-mono">
                          رقم القيد: {certificate.id}
                        </span>
                      </div>
                    </div>

                    {/* Certificate Title */}
                    <div className="text-center my-6 z-10 relative">
                      <div className="inline-block px-10 py-2.5 bg-[#3E5C46] text-[#F3E4C9] rounded-full font-black text-lg sm:text-xl uppercase tracking-wider mb-2">
                        شهادة إتمام التكوين المتواصل
                      </div>
                      <div className="text-[#3E5C46] font-mono text-[9px] sm:text-[10px] font-black tracking-widest mt-1">
                        ATTESTATION DE RÉUSSITE OFFICIELLE
                      </div>
                    </div>

                    {/* Main dual column details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-4 text-[#2d2621] z-10 relative">
                      
                      {/* Left: French details */}
                      <div className="text-left font-mono text-[11px] sm:text-xs flex flex-col justify-between md:pr-6 md:border-r border-[#3E5C46]/10">
                        <p className="leading-relaxed">
                          La Direction Générale de la Formation Continue certifie par la présente que l’agent public :
                        </p>
                        
                        <div className="my-3">
                          <h4 className="text-sm font-black text-[#3E5C46] uppercase tracking-wide">
                            {certificate.traineeName}
                          </h4>
                          <span className="text-[10px] text-[#5C7449] block font-bold mt-0.5">
                            Établissement : {certificate.companyName}
                          </span>
                        </div>

                        <p className="leading-relaxed">
                          a complété avec succès le programme de formation de pré-promotion requis pour l’accès au grade supérieur de :
                        </p>

                        <div className="mt-2.5 py-1.5 px-3 bg-[#CCD67F]/15 rounded-xl inline-block border-l-4 border-[#CCD67F]">
                          <span className="text-[10px] sm:text-[11px] font-black text-[#3E5C46] font-sans">
                            {certificate.trackTitleFr}
                          </span>
                        </div>

                        <div className="text-[9px] text-[#5C7449] font-bold mt-4 font-sans flex flex-col gap-0.5">
                          <span>Sceau Électronique : {certificate.hash}</span>
                          <span>Délivré le {certificate.issueDate}</span>
                        </div>
                      </div>

                      {/* Right: Arabic details */}
                      <div className="text-right font-tajawal text-[11px] sm:text-xs flex flex-col justify-between md:pl-6">
                        <p className="leading-loose">
                          تشهد المديرية العامة للتكوين المتواصل بأن الموظف العمومي المتربص:
                        </p>
                        
                        <div className="my-3">
                          <h4 className="text-sm font-black text-[#3E5C46]">
                            {certificate.traineeName}
                          </h4>
                          <span className="text-[10px] text-[#5C7449] block font-bold mt-0.5">
                            الهيئة الإدارية: {certificate.companyName}
                          </span>
                        </div>

                        <p className="leading-loose">
                          قد أتم بنجاح البرنامج التكويني والتربص المبرمج والامتحانات المهنية المؤهلة للترقية لدرجة ورتبة:
                        </p>

                        <div className="mt-2.5 py-1.5 px-3 bg-[#CCD67F]/15 rounded-xl inline-block border-r-4 border-[#CCD67F]">
                          <span className="text-[10px] sm:text-[11px] font-black text-[#3E5C46]">
                            {certificate.trackTitleAr}
                          </span>
                        </div>

                        <div className="text-[9px] text-[#5C7449] font-bold mt-4 font-mono flex flex-col gap-0.5">
                          <span>رمز التحقق الإلكتروني: {certificate.hash}</span>
                          <span>تاريخ التخرج والاعتماد: {certificate.issueDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Signatures / Footers */}
                    <div className="border-t border-[#3E5C46]/10 pt-4 flex flex-col sm:flex-row justify-between items-center text-[9px] text-[#5C7449] font-bold z-10 relative">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#3E5C46] flex items-center justify-center text-white text-[8px]">✓</div>
                        <span>{lt.certifiedBy}</span>
                      </div>
                      <div className="mt-2 sm:mt-0 font-mono text-[9px] text-center sm:text-right">
                        VERIFICATION HASH ID: {certificate.hash.toUpperCase()}
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-red-50/75 border-l-4 border-red-600 p-5 rounded-2xl flex items-start gap-4">
                  {/* IF CERTIFICATE CODE NOT FOUND */}
                  <XCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-base text-red-800">
                      {lt.statusInvalid}
                    </h4>
                    <p className="text-xs text-red-700/90 font-medium mt-1 leading-relaxed">
                      {lt.statusInvalidDesc}
                    </p>
                  </div>
                </div>

              )}

            </div>
          )}

          {/* 4. PUBLIC HELP & GUIDE CARD FOR GOVERNMENTAL AUDITORS */}
          <div className="max-w-3xl mx-auto bg-[#F3E4C9]/40 border border-[#5C7449]/20 p-6 rounded-2xl flex flex-col sm:flex-row gap-5 items-start">
            <div className="bg-[#3E5C46] text-[#F3E4C9] p-3 rounded-xl flex-shrink-0">
              <HelpCircle className="w-6 h-6 text-[#CCD67F]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#3E5C46] mb-1 flex items-center gap-1.5">
                <span>{lt.inspectorsGuide}</span>
              </h3>
              <p className="text-xs text-[#5C7449] leading-relaxed font-semibold">
                {lt.inspectorsGuideDesc}
              </p>
              
              <div className="mt-4 pt-3 border-t border-[#5C7449]/10 flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-[#5C7449] font-bold">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'المديرية العامة للوظيفة العمومية' : 'Direction Générale de la Fonction Publique'}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'معهد التكوين الإداري المشترك' : 'Institut de Formation Administrative Commune'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* 5. FOOTER */}
      <footer className="bg-[#3E5C46] text-[#F3E4C9] py-8 border-t-4 border-[#CCD67F] mt-12 text-center text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-medium">
          <div>
            <span>منصة التكوين المتواصل | </span>
            <span className="font-bold text-[#CCD67F] font-mono">TakwinPro Algeria</span>
          </div>
          <div className="text-[10px] opacity-75">
            {language === 'ar' ? '© 2026 وزارة الوظيفة العمومية والإصلاح الإداري. كل الحقوق محفوظة.' : '© 2026 Ministère de la Fonction Publique. Tous droits réservés.'}
          </div>
        </div>
      </footer>

    </div>
  );
}
