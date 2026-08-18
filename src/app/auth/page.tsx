'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { login, registerCompany } from '@/lib/clientAuth';
import { Landmark, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

function AuthPageContent() {
  const { t, language, dir } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle default tab select from url params
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    searchParams.get('tab') === 'register' ? 'register' : 'login'
  );

  // Form Fields - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'super-admin' | 'company' | 'trainee'>('company');

  // Form Fields - Register
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regSector, setRegSector] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Status Notices
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!loginEmail || !loginPassword) {
      setErrorMsg(language === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة.' : 'Veuillez remplir tous les champs requis.');
      return;
    }

    setLoading(true);
    try {
      const { ok, status, body } = await login(loginEmail, loginPassword, loginRole);
      if (!ok) {
        const msg =
          status === 401
            ? language === 'ar'
              ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
              : 'Email ou mot de passe incorrect.'
            : status === 503
            ? (language === 'ar' ? 'قاعدة البيانات غير مهيأة حالياً.' : 'Base de données non configurée.')
            : (language === 'ar' ? 'تعذر تسجيل الدخول.' : 'Échec de la connexion.');
        setErrorMsg(msg);
        setLoading(false);
        return;
      }

      setSuccessMsg(t('authSuccess'));
      const target = body.user?.role === 'super-admin' ? '/super-admin' : body.user?.role === 'trainee' ? '/trainee' : '/company';
      setTimeout(() => {
        router.push(target);
      }, 800);
    } catch (err) {
      setLoading(false);
      setErrorMsg(language === 'ar' ? 'حدث خطأ أثناء الاتصال بالخادم.' : 'Erreur lors de la connexion au serveur.');
      console.error(err);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!regCompanyName || !regSector || !regEmail || !regPassword) {
      setErrorMsg(language === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة.' : 'Veuillez remplir tous les champs requis.');
      return;
    }

    setLoading(true);
    try {
      const { ok, status } = await registerCompany(regCompanyName, regSector, regEmail, regPassword);
      if (!ok) {
        const msg =
          status === 409
            ? language === 'ar'
              ? 'مؤسسة مسجلة بهذا البريد الإلكتروني مسبقاً.'
              : 'Un établissement avec cet e-mail existe déjà.'
            : status === 503
            ? (language === 'ar' ? 'قاعدة البيانات غير مهيأة حالياً.' : 'Base de données non configurée.')
            : (language === 'ar' ? 'تعذر تسجيل المؤسسة.' : 'L\'inscription a échoué.');
        setErrorMsg(msg);
        setLoading(false);
        return;
      }

      setSuccessMsg(
        language === 'ar'
          ? 'تم تسجيل مؤسستك بنجاح! جارٍ تحويلك للوحة التحكم.'
          : 'Inscription réussie ! Redirection vers votre espace.'
      );
      setTimeout(() => {
        router.push('/company');
      }, 1200);
    } catch (err) {
      setLoading(false);
      const errMsg = err instanceof Error ? err.message : String(err);
      setErrorMsg(t('authError') + ' ' + errMsg);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#fbf8f3]">
      
      {/* LEFT SPLIT PANEL: Brand & Abstract Geometric CSS Pattern */}
      <div className="lg:col-span-5 bg-[#F3E4C9] p-10 flex flex-col justify-between relative overflow-hidden min-h-[300px] lg:min-h-screen">
        
        {/* CSS-based dynamic geometric grid overlay in #5C7449 */}
        <div className="absolute inset-0 opacity-15 pointer-events-none z-0">
          <div className="absolute top-[-50px] right-[-50px] w-[350px] h-[350px] rounded-full border-[24px] border-[#5C7449]"></div>
          <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full border-[16px] border-[#5C7449]"></div>
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, #5C7449 2px, transparent 0)',
              backgroundSize: '32px 32px'
            }}
          ></div>
        </div>

        {/* Header brand logo */}
        <div className="flex items-center gap-3 z-10 relative">
          <Link href="/" className="bg-[#3E5C46] text-[#F3E4C9] p-3 rounded-full flex items-center justify-center">
            <Landmark className="w-6 h-6" />
          </Link>
          <div>
            <span className="font-extrabold text-2xl text-[#3E5C46] block">
              {language === 'ar' ? t('brandName') : 'TadribPro'}
            </span>
            <span className="text-xs text-[#5C7449] font-semibold block">
              {language === 'ar' ? 'التكوين المتواصل' : 'Formation Continue'}
            </span>
          </div>
        </div>

        {/* Large graphic statement */}
        <div className="my-auto z-10 relative py-12 max-w-sm">
          <h2 className="text-3xl lg:text-4xl font-black text-[#3E5C46] leading-tight mb-4">
            {t('authSlogan')}
          </h2>
          <p className="text-sm text-[#5C7449] leading-relaxed">
            {language === 'ar'
              ? 'الجيل الجديد من منصات التكوين الوظيفي. ترقيات إلكترونية مرنة، تتبع تقدم الموظفين، وتقارير أداء فورية متوافقة بالكامل مع القوانين.'
              : 'La nouvelle génération de formation professionnelle. Promotions simplifiées, suivi de progression, conformité totale aux décrets officiels.'}
          </p>
        </div>

        {/* Back to landing */}
        <div className="z-10 relative">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#3E5C46] hover:underline">
            {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {language === 'ar' ? 'الرجوع للصفحة الرئيسية' : 'Retour à l’accueil'}
          </Link>
        </div>
      </div>

      {/* RIGHT PANEL: Beige/White form container */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 md:p-20 relative">
        <div className="w-full max-w-md flex flex-col gap-8">
          
          {/* Navigation Tabs (flat, underline style only) */}
          <div className="flex border-b border-[#F3E4C9] pb-0.5">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 text-center py-3 text-sm font-bold tab-underline ${
                activeTab === 'login' ? 'active' : 'text-[#5C7449]'
              }`}
            >
              {t('tabLogin')}
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 text-center py-3 text-sm font-bold tab-underline ${
                activeTab === 'register' ? 'active' : 'text-[#5C7449]'
              }`}
            >
              {t('tabRegister')}
            </button>
          </div>

          {/* Success / Error Messages */}
          {successMsg && (
            <div className="bg-[#CCD67F]/30 text-[#3E5C46] p-4 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-semibold">{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="bg-[#3E5C46]/10 text-[#3E5C46] p-4 rounded-xl flex items-start gap-3 border-l-4 border-[#3E5C46]">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* 1. LOGIN TAB VIEW */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-6">
              <div>
                <h3 className="text-2xl font-black text-[#3E5C46] mb-1">
                  {language === 'ar' ? 'مرحبًا بك مجددًا' : 'Ravi de vous revoir'}
                </h3>
                <p className="text-xs text-[#5C7449]">
                  {language === 'ar' ? 'سجل الدخول للمتابعة وإدارة التكوين.' : 'Connectez-vous pour suivre ou administrer vos cours.'}
                </p>
              </div>

              {/* Email underline-only input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#3E5C46] uppercase tracking-wider">
                  {t('inputEmail')}
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@institution.dz"
                  className="underline-input"
                  required
                />
              </div>

              {/* Password underline-only input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#3E5C46] uppercase tracking-wider">
                  {t('inputPassword')}
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="underline-input"
                  required
                />
              </div>

              {/* Account Role Selector (Interactive preview selection) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#3E5C46] uppercase tracking-wider">
                  {t('inputRole')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoginRole('super-admin')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                      loginRole === 'super-admin'
                        ? 'bg-[#3E5C46] text-[#F3E4C9] border-[#3E5C46]'
                        : 'border-[#F3E4C9] text-[#5C7449] hover:bg-[#F3E4C9]/40'
                    }`}
                  >
                    {language === 'ar' ? 'مدير المنصة' : 'Super Admin'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginRole('company')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                      loginRole === 'company'
                        ? 'bg-[#3E5C46] text-[#F3E4C9] border-[#3E5C46]'
                        : 'border-[#F3E4C9] text-[#5C7449] hover:bg-[#F3E4C9]/40'
                    }`}
                  >
                    {language === 'ar' ? 'مشرف المؤسسة' : 'Etablissement'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginRole('trainee')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                      loginRole === 'trainee'
                        ? 'bg-[#3E5C46] text-[#F3E4C9] border-[#3E5C46]'
                        : 'border-[#F3E4C9] text-[#5C7449] hover:bg-[#F3E4C9]/40'
                    }`}
                  >
                    {language === 'ar' ? 'موظف متكون' : 'Trainee'}
                  </button>
                </div>
                <span className="text-[10px] text-[#5C7449] block mt-1 leading-normal">
                  💡 {language === 'ar' 
                    ? 'التحويل بين الأدوار مفعل لتسهيل استعراض لوحات التحكم في النسخة التجريبية.'
                    : 'Le commutateur de rôle est activé pour simplifier l’examen de l’interface.'}
                </span>
              </div>

              {/* Sage Green Pill Button with dynamic color-slide hover */}
              <button
                type="submit"
                disabled={loading}
                className="btn-pill-sage w-full py-3.5 mt-4 text-center"
              >
                {loading ? (language === 'ar' ? 'جاري التحقق...' : 'Vérification...') : t('btnSubmitLogin')}
              </button>
            </form>
          )}

          {/* 2. REGISTER TAB VIEW */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-5">
              <div>
                <h3 className="text-2xl font-black text-[#3E5C46] mb-1">
                  {t('tabRegister')}
                </h3>
                <p className="text-xs text-[#5C7449]">
                  {language === 'ar' 
                    ? 'سجل إدارة أو مؤسسة عمومية جديدة لبدء تكوين موظفيك.'
                    : 'Inscrivez une nouvelle entité pour gérer les formations de vos agents.'}
                </p>
              </div>

              {/* Company name input */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#3E5C46] uppercase tracking-wider">
                  {t('inputCompanyName')}
                </label>
                <input
                  type="text"
                  value={regCompanyName}
                  onChange={(e) => setRegCompanyName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: بلدية وهران' : 'Ex: APC de Constantine'}
                  className="underline-input"
                  required
                />
              </div>

              {/* Sector input */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#3E5C46] uppercase tracking-wider">
                  {t('inputSector')}
                </label>
                <input
                  type="text"
                  value={regSector}
                  onChange={(e) => setRegSector(e.target.value)}
                  placeholder={language === 'ar' ? 'القطاع الإداري / المرفق' : 'Ex: Administration Locale'}
                  className="underline-input"
                  required
                />
              </div>

              {/* Admin email input */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#3E5C46] uppercase tracking-wider">
                  {t('inputEmail')}
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="contact@institution.gov.dz"
                  className="underline-input"
                  required
                />
              </div>

              {/* Password input */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#3E5C46] uppercase tracking-wider">
                  {t('inputPassword')}
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="underline-input"
                  required
                />
              </div>

              {/* Sage Green Pill Button with dynamic color-slide hover */}
              <button
                type="submit"
                disabled={loading}
                className="btn-pill-sage w-full py-3.5 mt-4 text-center"
              >
                {loading ? (language === 'ar' ? 'جاري التسجيل...' : 'Inscription...') : t('btnSubmitRegister')}
              </button>
            </form>
          )}

        </div>
      </div>

    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F3E4C9] flex items-center justify-center text-[#3E5C46] font-bold">Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
