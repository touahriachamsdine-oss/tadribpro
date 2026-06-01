'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { db, Company, Trainee, OFFICIAL_TRACKS } from '@/lib/db';
import { 
  Home, 
  Building2, 
  GraduationCap, 
  Users2, 
  Settings2, 
  Plus, 
  Trash2, 
  LogOut, 
  Landmark,
  Languages,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  TrendingUp,
  PieChart,
  Edit3,
  ExternalLink
} from 'lucide-react';

export default function SuperAdminPage() {
  const { t, language, toggleLanguage, dir } = useLanguage();
  
  // Dashboard states
  const [companies, setCompanies] = useState<Company[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'companies' | 'tracks' | 'users' | 'settings'>('dashboard');
  
  // Stats
  const [totalTrainees, setTotalTrainees] = useState(0);
  const [ongoingCourses, setOngoingCourses] = useState(0);

  // New Company form states
  const [compName, setCompName] = useState('');
  const [compSector, setCompSector] = useState('');
  const [compEmail, setCompEmail] = useState('');
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Editing Company states
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editName, setEditName] = useState('');
  const [editSector, setEditSector] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Fetch initial databases on load
  const loadData = async () => {
    try {
      const companyList = await db.getCompanies();
      setCompanies(companyList);
      
      const traineesList = await db.getTrainees();
      setTrainees(traineesList);
      setTotalTrainees(traineesList.length);
      
      const activeCount = traineesList.filter(t => t.status === 'active').length;
      setOngoingCourses(activeCount);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!compName || !compSector || !compEmail) {
      setError(language === 'ar' ? 'الرجاء ملء جميع الفراغات.' : 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      const added = await db.addCompany(compName, compSector, compEmail);
      setSuccess(
        language === 'ar' 
          ? `تم إضافة المؤسسة "${added.name}" بنجاح!` 
          : `L'institution "${added.name}" a été ajoutée !`
      );
      
      // Reset
      setCompName('');
      setCompSector('');
      setCompEmail('');
      
      // Reload
      loadData();

      // Clear success notification
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error occurred.';
      setError(errorMsg);
    }
  };

  const handleDeleteCompany = async (id: string, name: string) => {
    const consent = window.confirm(
      language === 'ar' 
        ? `هل أنت متأكد من حذف المؤسسة "${name}"؟ سيتم حذف جميع الموظفين التابعين لها.`
        : `Êtes-vous sûr de vouloir supprimer "${name}" ? Tous les stagiaires associés seront supprimés.`
    );
    if (!consent) return;

    try {
      await db.deleteCompany(id);
      loadData();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error deleting.';
      alert(errorMsg);
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany || !editName || !editSector || !editEmail) return;

    try {
      await db.updateCompany(editingCompany.id, editName, editSector, editEmail);
      setSuccess(
        language === 'ar'
          ? `تم تحديث بيانات المؤسسة بنجاح!`
          : `L'institution a été mise à jour avec succès !`
      );
      setEditingCompany(null);
      loadData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error updating.';
      alert(errorMsg);
    }
  };

  // Excel-compatible CSV export for companies
  const exportCompaniesToCSV = () => {
    const headers = language === 'ar'
      ? ['معرف المؤسسة', 'اسم المؤسسة', 'القطاع الإداري', 'البريد الإلكتروني للمشرف', 'عدد المتربصين']
      : ['ID Etablissement', 'Nom de l\'Institution', 'Secteur Administratif', 'Email Administrateur', 'Stagiaires Inscrits'];

    const rows = companies.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.sector.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      c.traineeCount || 0
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TakwinPro_Etablissements_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Excel-compatible CSV export for trainees
  const exportTraineesToCSV = () => {
    const headers = language === 'ar'
      ? ['معرف الموظف', 'الاسم الكامل', 'البريد الإلكتروني', 'المؤسسة التابعة', 'المسار التكويني المعتمد', 'نسبة التقدم %', 'حالة التكوين', 'الآجال القصوى']
      : ['ID Agent', 'Nom Complet', 'Email Professionnel', 'Institution Affiliee', 'Parcours Assignee', 'Progression %', 'Statut de Formation', 'Echeance Limite'];

    const rows = trainees.map(t => [
      t.id,
      `"${t.name.replace(/"/g, '""')}"`,
      `"${t.email.replace(/"/g, '""')}"`,
      `"${t.companyName.replace(/"/g, '""')}"`,
      `"${(language === 'ar' ? t.trackTitleAr : t.trackTitleFr).replace(/"/g, '""')}"`,
      `${t.progress}%`,
      t.status === 'completed' ? (language === 'ar' ? 'مكتمل' : 'Complete') : (language === 'ar' ? 'نشط' : 'Actif'),
      t.deadline
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TakwinPro_Trainees_Global_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Nav menu items
  const menuItems = [
    { id: 'dashboard', label: t('menuDashboard'), icon: Home },
    { id: 'companies', label: t('menuCompanies'), icon: Building2 },
    { id: 'tracks', label: t('menuTracks'), icon: GraduationCap },
    { id: 'users', label: language === 'ar' ? 'قائمة الموظفين' : 'Liste des agents', icon: Users2 },
    { id: 'settings', label: t('menuSettings'), icon: Settings2 },
  ];


  // Helper to compute progression buckets for Trainees
  const getProgressionRanges = () => {
    const ranges = {
      '0-25%': 0,
      '26-50%': 0,
      '51-75%': 0,
      '76-100%': 0
    };
    trainees.forEach(t => {
      if (t.progress <= 25) ranges['0-25%']++;
      else if (t.progress <= 50) ranges['26-50%']++;
      else if (t.progress <= 75) ranges['51-75%']++;
      else ranges['76-100%']++;
    });
    return Object.entries(ranges).map(([range, count]) => ({ range, count }));
  };

  const progressBuckets = getProgressionRanges();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fbf8f3] text-[#2d2621]">
      
      {/* 1. LEFT SIDEBAR: Collapses to bottom navigation on mobile */}
      <aside className="w-full lg:w-72 bg-[#3E5C46] text-[#F3E4C9] flex flex-col justify-between z-30 lg:sticky lg:top-0 lg:h-screen shadow-none">
        
        {/* Top Logo - hidden on mobile bar layout */}
        <div className="p-6 hidden lg:flex items-center gap-3 border-b border-[#5C7449]/30 bg-[#3E5C46]">
          <div className="bg-[#CCD67F] text-[#3E5C46] p-2 rounded-full">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg block text-white">
              {language === 'ar' ? t('brandName') : 'TakwinPro'}
            </span>
            <span className="text-[10px] text-[#F3E4C9]/70 block font-semibold uppercase tracking-wider">
              {language === 'ar' ? 'فضاء مدير المنصة' : 'Super Admin Area'}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-row lg:flex-col lg:py-6 overflow-x-auto lg:overflow-x-visible w-full justify-around lg:justify-start lg:gap-2 flex-grow lg:flex-grow-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id as 'dashboard' | 'companies' | 'tracks' | 'users' | 'settings')}
                className={`flex items-center gap-3 py-4 px-6 text-sm font-semibold transition-all relative w-full min-w-[90px] lg:min-w-0 justify-center lg:justify-start ${
                  isActive 
                    ? 'text-white bg-[#5C7449]/30' 
                    : 'text-[#F3E4C9]/80 hover:text-white hover:bg-[#5C7449]/10'
                }`}
              >
                {/* Active left indicator (sage green strip) */}
                {isActive && (
                  <div className={`hidden lg:block absolute top-0 bottom-0 w-1 bg-[#CCD67F] ${
                    dir === 'rtl' ? 'right-0' : 'left-0'
                  }`} />
                )}
                
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#CCD67F]' : 'text-[#F3E4C9]/70'}`} />
                <span className="text-[10px] sm:text-xs lg:text-sm block lg:inline-block">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer options - collapses on mobile */}
        <div className="p-6 hidden lg:flex flex-col gap-4 border-t border-[#5C7449]/20 bg-[#3E5C46]">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-3 text-sm text-[#F3E4C9] hover:text-white transition-colors"
          >
            <Languages className="w-5 h-5 text-[#CCD67F]" />
            <span>{language === 'ar' ? 'Français' : 'العربية'}</span>
          </button>
          
          <Link href="/auth" className="flex items-center gap-3 text-sm text-[#F3E4C9] hover:text-white transition-colors mt-2">
            <LogOut className="w-5 h-5 text-[#CCD67F]" />
            <span>{t('logout')}</span>
          </Link>
        </div>

      </aside>

      {/* 2. MAIN WORK AREA */}
      <main className="flex-grow p-6 sm:p-8 lg:p-12 overflow-y-auto mb-16 lg:mb-0">
        
        {/* Mobile Top Header (Mobile only) */}
        <header className="lg:hidden flex items-center justify-between pb-6 border-b border-[#F3E4C9] mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#3E5C46] text-white p-2 rounded-full">
              <Landmark className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base text-[#3E5C46]">
              {language === 'ar' ? t('brandName') : 'TakwinPro'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 text-xs font-semibold rounded-full border border-[#3E5C46] text-[#3E5C46]"
            >
              {language === 'ar' ? 'FR' : 'AR'}
            </button>
            <Link href="/auth" className="p-2 text-[#3E5C46]">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Page Title & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#3E5C46] tracking-tight">
              {activeMenu === 'dashboard' 
                ? (language === 'ar' ? 'لوحة تحكم إحصائيات التكوين' : 'Tableau de bord de formation')
                : activeMenu === 'companies' ? t('menuCompanies') 
                : activeMenu === 'tracks' ? t('menuTracks')
                : activeMenu === 'users' ? (language === 'ar' ? 'قائمة الموظفين المتكونين' : 'Roster Global des Agents')
                : t('menuSettings')}
            </h1>
            <p className="text-sm text-[#5C7449] mt-1 leading-normal">
              {activeMenu === 'dashboard'
                ? (language === 'ar' ? 'إحصائيات فورية وتوزع الموظفين والهيئات المنخرطة في برامج الترقية الوطنية.' : 'Statistiques en temps réel et répartition des agents et établissements publics.')
                : language === 'ar' 
                  ? 'مراقبة المؤسسات العمومية، إدارة عقود التدريب المهني، والتحقق من التراخيص الرسمية.' 
                  : 'Supervision des établissements, gestion des contrats de formation professionnelle et habilitations.'}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#CCD67F]/30 rounded-full text-xs font-bold text-[#3E5C46]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3E5C46] animate-ping"></span>
            {language === 'ar' ? 'لوحة تحكم مركزية نشطة' : 'Console Centrale Active'}
          </div>
        </div>

        {/* 3. QUICK STATS MATRIX (Flat colored cards, no borders, no shadows) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          
          {/* Card 1 - Total Companies */}
          <div className="bg-[#F3E4C9] p-6 flex flex-col justify-between min-h-[120px] rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#5C7449]/10 rounded-bl-full"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#5C7449]">
              {t('statTotalCompanies')}
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-[#3E5C46]">{companies.length}</span>
              <span className="text-xs text-[#3E5C46] font-semibold">
                {language === 'ar' ? 'مؤسسة عمومية' : 'institutions'}
              </span>
            </div>
          </div>

          {/* Card 2 - Active Trainees */}
          <div className="bg-[#F3E4C9] p-6 flex flex-col justify-between min-h-[120px] rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#5C7449]/10 rounded-bl-full"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#5C7449]">
              {t('statActiveTrainees')}
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-[#3E5C46]">{totalTrainees}</span>
              <span className="text-xs text-[#3E5C46] font-semibold">
                {language === 'ar' ? 'موظف مسجل' : 'agents inscrits'}
              </span>
            </div>
          </div>

          {/* Card 3 - Ongoing courses */}
          <div className="bg-[#F3E4C9] p-6 flex flex-col justify-between min-h-[120px] rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#5C7449]/10 rounded-bl-full"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#5C7449]">
              {t('statOngoingCourses')}
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-[#3E5C46]">{ongoingCourses}</span>
              <span className="text-xs text-[#3E5C46] font-semibold">
                {language === 'ar' ? 'تربص نشط' : 'sessions actives'}
              </span>
            </div>
          </div>

        </section>

        {/* 4. ACTIVE SUB-VIEW */}
        {activeMenu === 'dashboard' && (
          <div className="flex flex-col gap-10">
            
            {/* Handcrafted Raw SVG Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* SVG Donut Chart for Sectors */}
              <div className="bg-[#F3E4C9]/40 p-8 rounded-3xl border border-[#5C7449]/20 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#3E5C46] mb-2 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-[#3E5C46]" />
                    {language === 'ar' ? 'توزع المؤسسات حسب القطاع الإداري' : 'Répartition des institutions par secteur'}
                  </h3>
                  <p className="text-xs text-[#5C7449] mb-6">
                    {language === 'ar' ? 'نسب التواجد الفعلي لمختلف قطاعات الوظيفة العمومية.' : 'Pourcentage de participation des différents secteurs étatiques.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                  {/* SVG Pie Rendering */}
                  <svg width="160" height="160" viewBox="0 0 36 36" className="flex-shrink-0">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F3E4C9" strokeWidth="3" />
                    {/* Ring 1 - Education (66%) */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3E5C46" strokeWidth="3.5" 
                      strokeDasharray="66 34" strokeDashoffset="25" />
                    {/* Ring 2 - Regional/Municipalities (34%) */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#CCD67F" strokeWidth="3.5" 
                      strokeDasharray="34 66" strokeDashoffset="-41" />
                  </svg>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-[#3E5C46] rounded"></div>
                      <div>
                        <span className="text-xs font-bold text-[#3E5C46] block">التعليم العالي والبحث العلمي</span>
                        <span className="text-[10px] text-[#5C7449]">66% ({language === 'ar' ? 'وزارات وهيئات جامعية' : 'Ministères / Univ'})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-[#CCD67F] rounded"></div>
                      <div>
                        <span className="text-xs font-bold text-[#3E5C46] block">الإدارة المحلية والجماعات الإقليمية</span>
                        <span className="text-[10px] text-[#5C7449]">34% ({language === 'ar' ? 'البلديات والولايات' : 'Collectivités'})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SVG Bar Chart for Trainee Progress Levels */}
              <div className="bg-[#F3E4C9]/40 p-8 rounded-3xl border border-[#5C7449]/20 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#3E5C46] mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#3E5C46]" />
                    {language === 'ar' ? 'مستويات تقدم الموظفين في المناهج' : 'Niveaux de progression des stagiaires'}
                  </h3>
                  <p className="text-xs text-[#5C7449] mb-6">
                    {language === 'ar' ? 'مستويات دراسة وفهم المقاييس موزعة حسب الفئات المئوية.' : 'Volume d’employés selon le taux de complétion de leur parcours.'}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {progressBuckets.map((bucket, i) => {
                    const maxCount = Math.max(...progressBuckets.map(b => b.count), 1);
                    const percentageWidth = Math.max(10, (bucket.count / maxCount) * 100);
                    return (
                      <div key={i} className="flex items-center justify-between gap-4">
                        <span className="text-xs font-extrabold text-[#3E5C46] w-14 font-mono">{bucket.range}</span>
                        <div className="flex-grow h-5 bg-[#F3E4C9] rounded-lg overflow-hidden relative">
                          <div 
                            className="h-full bg-[#CCD67F] transition-all duration-500 rounded-lg"
                            style={{ width: `${percentageWidth}%` }}
                          />
                          <span className="absolute inset-0 flex items-center px-3 text-[10px] font-bold text-[#3E5C46]">
                            {bucket.count} {language === 'ar' ? 'موظفين' : 'agents'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trainees per Organization Chart (Dynamic Handcrafted SVG Bar Chart) */}
              <div className="bg-[#F3E4C9]/40 p-8 rounded-3xl border border-[#5C7449]/20 flex flex-col justify-between lg:col-span-2">
                <div>
                  <h3 className="text-lg font-black text-[#3E5C46] mb-2 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#3E5C46]" />
                    {language === 'ar' ? 'توزع الموظفين المتكونين حسب الهيئة المشرفة' : 'Volume de stagiaires par établissement public'}
                  </h3>
                  <p className="text-xs text-[#5C7449] mb-6">
                    {language === 'ar' ? 'عدد الأعوان والعمال الإداريين المنتسبين لكل مؤسسة عمومية منخرطة.' : 'Nombre de candidats en cours de formation pour chaque institution administrative inscrite.'}
                  </p>
                </div>

                <div className="w-full flex justify-center py-4 bg-transparent rounded-2xl">
                  <svg viewBox="0 0 800 180" className="w-full h-auto">
                    {(() => {
                      const data = companies.map(c => {
                        const count = trainees.filter(t => t.companyId === c.id).length;
                        return { name: c.name, count };
                      });
                      const maxCount = Math.max(...data.map(d => d.count), 1);
                      return data.map((item, index) => {
                        const barWidth = (item.count / maxCount) * 450;
                        const y = index * 45 + 15;
                        return (
                          <g key={index}>
                            {/* Label */}
                            <text 
                              x={dir === 'rtl' ? 790 : 10} 
                              y={y + 14} 
                              fill="#3E5C46" 
                              fontSize="11" 
                              fontWeight="bold"
                              textAnchor={dir === 'rtl' ? 'end' : 'start'}
                            >
                              {item.name}
                            </text>
                            
                            {/* Background Bar */}
                            <rect 
                              x={dir === 'rtl' ? 800 - 300 - 450 : 300} 
                              y={y + 3} 
                              width="450" 
                              height="14" 
                              fill="#F3E4C9" 
                              rx="7" 
                            />
                            
                            {/* Filled Bar */}
                            <rect 
                              x={dir === 'rtl' ? 800 - 300 - barWidth : 300} 
                              y={y + 3} 
                              width={barWidth} 
                              height="14" 
                              fill="#3E5C46" 
                              rx="7" 
                              className="transition-all duration-500"
                            />
                            
                            {/* Count Label */}
                            <text 
                              x={dir === 'rtl' ? 800 - 300 - barWidth - 10 : 300 + barWidth + 10} 
                              y={y + 14} 
                              fill="#3E5C46" 
                              fontSize="11" 
                              fontWeight="extrabold"
                              textAnchor={dir === 'rtl' ? 'end' : 'start'}
                            >
                              {item.count} {language === 'ar' ? 'متربصين' : 'agents'}
                            </text>
                          </g>
                        );
                      });
                    })()}
                  </svg>
                </div>
              </div>

            </div>

            {/* General Administrative Utilities (Excel Exporter, quick jump) */}
            <div className="bg-[#3E5C46] text-[#F3E4C9] p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#CCD67F]" />
                  {language === 'ar' ? 'مركز التقارير الإدارية الموحد' : 'Générateur de Rapports Étatiques'}
                </h3>
                <p className="text-xs text-[#F3E4C9]/85 max-w-xl leading-normal">
                  {language === 'ar'
                    ? 'قم بتحميل الملفات الإحصائية الكاملة للمؤسسات والموظفين بصيغة إكسيل متوافقة تدعم الخطوط العربية بالكامل (UTF-8 BOM).'
                    : 'Téléchargez les rapports complets conformes aux structures ministérielles au format Excel.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 w-full sm:w-auto flex-shrink-0">
                <button
                  onClick={exportCompaniesToCSV}
                  className="px-5 py-2.5 bg-[#CCD67F] text-[#3E5C46] rounded-full text-xs font-black hover:bg-white transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  {language === 'ar' ? 'تحميل كشف الإدارات' : 'Rapport Institutions'}
                </button>
                <button
                  onClick={exportTraineesToCSV}
                  className="px-5 py-2.5 bg-[#5C7449] text-white rounded-full text-xs font-black hover:bg-white hover:text-[#3E5C46] transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  {language === 'ar' ? 'تحميل كشف المتربصين' : 'Rapport Stagiaires'}
                </button>
              </div>
            </div>

          </div>
        )}

        {activeMenu === 'companies' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
            
            {/* Registered Companies Table (Zebra Stripes, No Outer Borders) */}
            <div className="xl:col-span-8 flex flex-col gap-4 w-full">
              <div className="flex items-center justify-between border-b border-[#F3E4C9] pb-3">
                <h3 className="text-xl font-bold text-[#3E5C46]">
                  {language === 'ar' ? 'لائحة المؤسسات النشطة' : 'Établissements Publiques Habilités'}
                </h3>
                <button 
                  onClick={exportCompaniesToCSV}
                  className="inline-flex items-center gap-1.5 text-xs text-[#3E5C46] hover:underline font-bold"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#5C7449]" />
                  {language === 'ar' ? 'تصدير للوحة Excel' : 'Exporter Excel'}
                </button>
              </div>

              {companies.length === 0 ? (
                <div className="p-12 text-center bg-[#F3E4C9]/20 rounded-2xl border border-dashed border-[#5C7449]/30 text-[#5C7449] text-sm">
                  {language === 'ar' ? 'لا توجد مؤسسات عمومية مسجلة حاليًا.' : 'Aucune institution inscrite pour le moment.'}
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="flat-table">
                    <thead>
                      <tr>
                        <th>{t('tableCompany')}</th>
                        <th>{t('tableSector')}</th>
                        <th>{t('inputEmail')}</th>
                        <th>{t('tableTrainees')}</th>
                        <th>{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((c) => (
                        <tr key={c.id}>
                          <td className="font-bold text-[#3E5C46]">{c.name}</td>
                          <td className="text-xs font-semibold">{c.sector}</td>
                          <td className="text-xs font-mono text-[#5C7449]" dir="ltr">{c.email}</td>
                          <td className="text-center font-bold">
                            <span className="px-2.5 py-1 bg-[#3E5C46]/10 rounded-full text-xs text-[#3E5C46]">
                              {c.traineeCount || 0}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              {/* Manage (Impersonate) Button */}
                              <Link
                                href={`/company?companyId=${c.id}`}
                                className="p-1.5 text-[#3E5C46] hover:bg-[#3E5C46]/10 rounded transition-colors flex items-center justify-center"
                                title={language === 'ar' ? 'إدارة الهيئة' : 'Gérer l\'institution'}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              
                              {/* Edit Button */}
                              <button
                                onClick={() => {
                                  setEditingCompany(c);
                                  setEditName(c.name);
                                  setEditSector(c.sector);
                                  setEditEmail(c.email);
                                }}
                                className="p-1.5 text-[#5C7449] hover:bg-[#5C7449]/10 rounded transition-colors flex items-center justify-center"
                                title={language === 'ar' ? 'تعديل البيانات' : 'Modifier'}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteCompany(c.id, c.name)}
                                className="p-1.5 text-red-700 hover:bg-red-50 rounded transition-colors flex items-center justify-center"
                                title={language === 'ar' ? 'حذف المؤسسة' : 'Supprimer'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Register New Company Panel (Flat Warm Beige Container, Zero drop shadow) */}
            <div className="xl:col-span-4 bg-[#F3E4C9] p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-[#3E5C46] mb-2 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#3E5C46]" />
                {language === 'ar' ? 'تسجيل إدارة جديدة' : 'Nouvelle Institution'}
              </h3>
              <p className="text-xs text-[#5C7449] mb-6 leading-normal">
                {language === 'ar'
                  ? 'تسجيل وترخيص هيئة إدارية أو شركة في المنصة وتعيين بريد المشرف الخاص بها.'
                  : 'Inscrire officiellement un nouvel organisme et configurer son accès de gestion.'}
              </p>

              {success && (
                <div className="bg-[#CCD67F]/40 text-[#3E5C46] p-3.5 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}
              {error && (
                <div className="bg-red-100 text-red-800 p-3.5 rounded-xl mb-4 text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleAddCompany} className="flex flex-col gap-4">
                {/* Company Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E5C46] uppercase tracking-wider">
                    {t('inputCompanyName')}
                  </label>
                  <input
                    type="text"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: جامعة باب الزوار' : 'Ex: Université USTHB'}
                    className="underline-input text-sm"
                    required
                  />
                </div>

                {/* Sector */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E5C46] uppercase tracking-wider">
                    {t('inputSector')}
                  </label>
                  <input
                    type="text"
                    value={compSector}
                    onChange={(e) => setCompSector(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: التعليم العالي والبحث' : 'Ex: Recherche & Science'}
                    className="underline-input text-sm"
                    required
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E5C46] uppercase tracking-wider">
                    {t('inputEmail')}
                  </label>
                  <input
                    type="email"
                    value={compEmail}
                    onChange={(e) => setCompEmail(e.target.value)}
                    placeholder="admin@univ.gov.dz"
                    className="underline-input text-sm"
                    required
                  />
                </div>

                {/* Pill submit */}
                <button
                  type="submit"
                  className="btn-pill-sage w-full py-3 mt-4 text-xs font-bold"
                >
                  {t('btnNewCompany')}
                </button>
              </form>
            </div>

          </div>
        )}

        {activeMenu === 'tracks' && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-[#F3E4C9] pb-3 mb-2 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#3E5C46] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#3E5C46]" />
                {language === 'ar' ? 'كتالوج الشعب والمسارات الوطنية المعتمدة' : 'Catalogue National des Parcours Agréés'}
              </h3>
              <span className="text-xs font-bold text-[#CCD67F] bg-[#3E5C46] px-3 py-1 rounded-full">
                {OFFICIAL_TRACKS.length} {language === 'ar' ? 'مسارات رسمية' : 'parcours'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {OFFICIAL_TRACKS.map((track, i) => (
                <div key={i} className="bg-[#F3E4C9]/40 p-6 rounded-2xl border border-[#5C7449]/20 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#3E5C46] tracking-widest block mb-1">
                      {language === 'ar' ? track.sector_ar : track.sector_fr}
                    </span>
                    <h4 className="text-lg font-black text-[#3E5C46] leading-tight mb-4">
                      {language === 'ar' ? track.title_ar : track.title_fr}
                    </h4>

                    <div className="flex flex-col gap-2 mt-2">
                      <span className="text-xs font-bold text-[#5C7449] block mb-1">
                        📚 {language === 'ar' ? 'المقاييس المبرمجة بالمسار:' : 'Modules d’études programmés :'}
                      </span>
                      {(language === 'ar' ? track.modules_ar : track.modules_fr).map((mod, j) => (
                        <div key={j} className="text-xs flex items-center gap-2 font-semibold text-[#3E5C46]">
                          <ChevronRight className="w-3.5 h-3.5 text-[#CCD67F]" />
                          <span>{mod}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeMenu === 'users' && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-[#F3E4C9] pb-3 mb-2 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#3E5C46] flex items-center gap-2">
                <Users2 className="w-5 h-5 text-[#3E5C46]" />
                {language === 'ar' ? 'سجل الموظفين المتربصين على المنصة' : 'Roster Global de tous les Stagiaires'}
              </h3>
              
              <button 
                onClick={exportTraineesToCSV}
                className="inline-flex items-center gap-1.5 text-xs text-[#3E5C46] hover:underline font-bold"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#5C7449]" />
                {language === 'ar' ? 'تحميل جدول المتربصين (Excel)' : 'Rapport Stagiaires'}
              </button>
            </div>

            {trainees.length === 0 ? (
              <div className="p-12 text-center bg-[#F3E4C9]/20 rounded-2xl border border-dashed border-[#5C7449]/30 text-[#5C7449]">
                {language === 'ar' ? 'لا يوجد أي موظف متكون مسجل حالياً.' : 'Aucun agent stagiaire enregistré pour le moment.'}
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="flat-table">
                  <thead>
                    <tr>
                      <th>{language === 'ar' ? 'الاسم الكامل' : 'Nom Complet'}</th>
                      <th>{language === 'ar' ? 'المؤسسة التابعة' : 'Organisme'}</th>
                      <th>{t('menuTracks')}</th>
                      <th>{t('progress')}</th>
                      <th>{t('status')}</th>
                      <th>{t('deadline')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainees.map((t) => (
                      <tr key={t.id}>
                        <td className="font-bold text-[#3E5C46]">
                          <div>{t.name}</div>
                          <div className="text-[10px] text-[#5C7449] font-normal" dir="ltr">{t.email}</div>
                        </td>
                        <td className="text-xs font-semibold">{t.companyName}</td>
                        <td className="text-xs font-semibold">
                          {language === 'ar' ? t.trackTitleAr : t.trackTitleFr}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-16 progress-bar-container">
                              <div className="progress-bar-fill" style={{ width: `${t.progress}%` }}></div>
                            </div>
                            <span className="text-xs font-black text-[#3E5C46]">{t.progress}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            t.status === 'completed' 
                              ? 'bg-[#CCD67F]/30 text-[#3E5C46]' 
                              : 'bg-[#5C7449]/20 text-[#3E5C46]'
                          }`}>
                            {t.status === 'completed' ? (language === 'ar' ? 'مكتمل' : 'Comple') : (language === 'ar' ? 'نشط' : 'Actif')}
                          </span>
                        </td>
                        <td className="text-xs font-mono text-[#3E5C46]">{t.deadline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeMenu === 'settings' && (
          <div className="p-12 text-center bg-[#F3E4C9]/20 rounded-2xl border border-dashed border-[#5C7449]/30 text-[#5C7449]">
            <h3 className="text-lg font-bold text-[#3E5C46] mb-2 uppercase">
              {language === 'ar' ? 'إعدادات المنصة المتقدمة' : 'Paramètres Avancés'}
            </h3>
            <p className="text-xs text-[#5C7449] leading-relaxed max-w-md mx-auto">
              {language === 'ar'
                ? 'إدارة تراخيص المعهد، تخصيص القوالب الوطنية للشهادات، وضبط الحماية والمزامنة الفورية مع قواعد البيانات.'
                : 'Configurez la sécurité des sessions, configurez l’API Neon DB et gérez les clés d’accès.'}
            </p>
          </div>
        )}

      </main>

      {/* EDIT COMPANY MODAL */}
      {editingCompany && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fbf8f3] rounded-3xl w-full max-w-lg p-8 border border-[#5C7449]/20 flex flex-col gap-6 relative animate-in fade-in zoom-in-95 duration-200" dir={dir}>
            <div>
              <h3 className="text-xl font-black text-[#3E5C46] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#3E5C46]" />
                {language === 'ar' ? 'تعديل بيانات المؤسسة' : 'Modifier les informations de l\'institution'}
              </h3>
              <p className="text-xs text-[#5C7449] mt-1 leading-normal">
                {language === 'ar'
                  ? 'تعديل الاسم والقطاع والبريد الإلكتروني الخاص بمدير هذه المؤسسة.'
                  : 'Modifiez le nom, le secteur et l\'adresse email de l\'administrateur de cet établissement.'}
              </p>
            </div>

            <form onSubmit={handleUpdateCompany} className="flex flex-col gap-4">
              {/* Edit Company Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#3E5C46] uppercase tracking-wider">
                  {t('inputCompanyName')}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={language === 'ar' ? 'اسم المؤسسة' : 'Nom de l\'institution'}
                  className="underline-input text-sm"
                  required
                />
              </div>

              {/* Edit Sector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#3E5C46] uppercase tracking-wider">
                  {t('inputSector')}
                </label>
                <input
                  type="text"
                  value={editSector}
                  onChange={(e) => setEditSector(e.target.value)}
                  placeholder={language === 'ar' ? 'القطاع الإداري' : 'Secteur administratif'}
                  className="underline-input text-sm"
                  required
                />
              </div>

              {/* Edit Email */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#3E5C46] uppercase tracking-wider">
                  {t('inputEmail')}
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="admin@domain.com"
                  className="underline-input text-sm"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-4 mt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="px-6 py-2.5 rounded-full text-xs font-bold text-[#3E5C46] hover:bg-[#3E5C46]/10 transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#3E5C46] hover:bg-[#5C7449] text-[#F3E4C9] rounded-full text-xs font-bold transition-colors"
                >
                  {language === 'ar' ? 'حفظ التغييرات' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
