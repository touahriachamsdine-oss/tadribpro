'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { getSession } from '@/lib/clientAuth';
import { db, Trainee, SupportTicket, OFFICIAL_TRACKS, Certificate, CompanyMessage, Lesson, TrainingTrack } from '@/lib/db';
import { 
  BookOpen, 
  GraduationCap, 
  Clock, 
  Languages, 
  LogOut, 
  User, 
  Calendar,
  Layers,
  Award,
  X,
  ChevronLeft,
  ChevronRight,
  Printer,
  HelpCircle,
  Star,
  Send,
  MessageSquare,
  LayoutDashboard,
  FileText,
  ClipboardCheck
} from 'lucide-react';

export default function TraineePortalPage() {
  const { t, language, toggleLanguage, dir } = useLanguage();
  const router = useRouter();
  
  // States
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>('');
  const [currentTrainee, setCurrentTrainee] = useState<Trainee | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const certRequested = useRef(false);
  const [loading, setLoading] = useState(true);

  // Portal Tab Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'course' | 'lessons' | 'exams' | 'certificate'>('dashboard');

  // LMS Interactive Modal States
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [showQuizError, setShowQuizError] = useState<boolean>(false);

  // Helpdesk FAQ Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerTab, setDrawerTab] = useState<'faq' | 'support'>('faq');
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketMessage, setTicketMessage] = useState<string>('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState<boolean>(false);
  const [ticketSuccess, setTicketSuccess] = useState<boolean>(false);
  const [traineeTickets, setTraineeTickets] = useState<SupportTicket[]>([]);

  // Course Evaluation States
  const [showEvaluationModal, setShowEvaluationModal] = useState<boolean>(false);
  const [evaluatingModule, setEvaluatingModule] = useState<string | null>(null);
  const [ratingQuality, setRatingQuality] = useState<number>(0);
  const [ratingTechnical, setRatingTechnical] = useState<number>(0);
  const [ratingUtility, setRatingUtility] = useState<number>(0);
  const [evaluationFeedback, setEvaluationFeedback] = useState<string>('');
  const [isSubmittingEval, setIsSubmittingEval] = useState<boolean>(false);
  const [evalSuccess, setEvalSuccess] = useState<boolean>(false);

  // Messages & Lessons
  const [companyMessages, setCompanyMessages] = useState<CompanyMessage[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [companyTracks, setCompanyTracks] = useState<TrainingTrack[]>([]);

  async function refreshCertificate(traineeId: string) {
    try {
      const cert = await db.getCertificateByTrainee(traineeId);
      setCertificate(cert);
    } catch (err) {
      console.error('Error loading certificate:', err);
    }
  }

  async function ensureCertificate() {
    if (!currentTrainee) return;
    if (certificate || certRequested.current) return;
    certRequested.current = true;
    try {
      const cert = await db.addCertificate(
        currentTrainee.id,
        currentTrainee.name,
        currentTrainee.companyId,
        currentTrainee.companyName,
        currentTrainee.trackId,
        currentTrainee.trackTitleAr,
        currentTrainee.trackTitleFr
      );
      setCertificate(cert);
    } catch (err) {
      console.error('Error generating certificate:', err);
    }
  }

  async function loadTraineeData(traineeId: string, companyId: string, trackId: string) {
    try {
      const allTickets = await db.getTickets();
      const filtered = allTickets.filter(t => t.traineeId === traineeId);
      setTraineeTickets(filtered);

      const msgs = await db.getCompanyMessages(companyId);
      setCompanyMessages(msgs);

      // Load both company-specific lessons and global lessons
      const companyLessons = await db.getLessons(companyId);
      const globalLessons = await db.getLessons('global');
      const allLessons = [...companyLessons, ...globalLessons];
      const filteredLessons = allLessons.filter(l => l.trackIds && l.trackIds.includes(trackId));
      setLessons(filteredLessons);

      // Load both company-specific tracks and global tracks
      const companyTracksList = await db.getCompanyTracks(companyId);
      const globalTracksList = await db.getCompanyTracks('global');
      setCompanyTracks([...companyTracksList, ...globalTracksList]);
    } catch (err) {
      console.error('Error loading trainee data:', err);
    }
  }

  // Load the logged-in trainee (session-guarded) on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await getSession();
      if (!session || session.role !== 'trainee') {
        router.replace('/auth');
        return;
      }
      try {
        const me = await db.getTraineeByEmail(session.email);
        if (!me) {
          router.replace('/auth');
          return;
        }
        if (cancelled) return;
        const roster = await db.getTrainees(session.company_id || undefined);
        if (cancelled) return;
        setTrainees(roster);
        setCurrentTrainee(me);
        setSelectedTraineeId(me.id);
        await loadTraineeData(me.id, me.companyId, me.trackId);
        await refreshCertificate(me.id);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Keep current trainee view in sync with the roster local state
  useEffect(() => {
    if (selectedTraineeId) {
      const match = trainees.find(t => t.id === selectedTraineeId);
      if (match) {
        setCurrentTrainee(match);
      }
    }
  }, [selectedTraineeId, trainees]);

  // Handle checking/unchecking a module manually
  const handleToggleModule = async (moduleTitle: string, isChecked: boolean) => {
    if (!currentTrainee) return;

    try {
      // Call stateful database updater
      const updatedTrainee = await db.updateTraineeModule(currentTrainee.id, moduleTitle, isChecked);
      
      // Update local state to reflect new progress immediately
      setCurrentTrainee(updatedTrainee);
      setTrainees(prev => prev.map(item => item.id === updatedTrainee.id ? updatedTrainee : item));

      if (updatedTrainee.status === 'completed') {
        await ensureCertificate();
      }
    } catch (err) {
      console.error('Error toggling module:', err);
    }
  };

  interface Question {
    text: string;
    options: string[];
    correctAnswer: number;
  }

  // Slides content for the active module
  const getSlidesForModule = (moduleName: string) => {
    return [
      {
        title: language === 'ar' ? 'الخطوة 1: مقدمة وتمهيد للمادة' : 'Étape 1 : Introduction et Fondements',
        content: language === 'ar'
          ? `مرحباً بك في مقياس "${moduleName}". يهدف هذا البرنامج التكويني إلى تزويد الموظف العمومي بالمعارف والأسس القانونية والإجرائية المحدثة لتحسين الكفاءة المهنية والارتقاء بالأداء الإداري بما يتماشى مع معايير العصرنة في الجزائر.`
          : `Bienvenue dans le module "${moduleName}". Ce programme de formation continue vise à doter les fonctionnaires publics des compétences réglementaires et opérationnelles fondamentales pour moderniser l'action publique en Algérie.`
      },
      {
        title: language === 'ar' ? 'الخطوة 2: الإطار التنظيمي والتشريعي بالجزائر' : 'Étape 2 : Cadre Réglementaire en Algérie',
        content: language === 'ar'
          ? `يستند المقياس إلى المرسوم التنفيذي والأمر رقم 06-03 المتضمن القانون الأساسي العام للوظيفة العمومية. يحدد هذا النص القواعد الأساسية التي تضمن الانضباط والالتزام بالشفافية والسر المهني مع تكريس حق الموظف في الترقي المستمر.`
          : `Ce module repose sur les textes fondateurs de la législation algérienne, notamment l'Ordonnance n° 06-03 portant statut général de la Fonction Publique, qui régit les droits et devoirs des fonctionnaires au sein de l'appareil étatique.`
      },
      {
        title: language === 'ar' ? 'الخطوة 3: التطبيقات العملية وحلول الحالات' : 'Étape 3 : Application Opérationnelle et Cas Pratiques',
        content: language === 'ar'
          ? `يتطلب العمل الإداري تسييراً ذكياً للملفات والتواصل الفعال والنزيه مع الشركاء الاجتماعيين والمواطنين. نركز في هذه المرحلة على حل النزاعات وتدقيق البيانات المحاسبية وصياغة المحاضر والتقارير الإدارية بشكل رسمي خالٍ من الثغرات.`
          : `La pratique quotidienne exige une gestion agile des dossiers et une communication intègre avec les usagers. Cette étape aborde le traitement des requêtes, l'audit documentaire et la rédaction de rapports officiels sans équivoque.`
      },
      {
        title: language === 'ar' ? 'الخطوة 4: التقييم النهائي وأخلاقيات المهنة' : 'Étape 4 : Déontologie et Conclusion',
        content: language === 'ar'
          ? `خلاصة القول، إن الارتقاء بالرتبة المهنية ليس مجرد ترقية إدارية بل هو التزام متجدد بحماية المرفق العام وتقديم الخدمة بمسؤولية ونزاهة. لقد وصلت إلى نهاية العرض الدراسي، يرجى النقر على زر "الانتقال للاختبار" للبدء بالتقييم.`
          : `En somme, l'accès au grade supérieur constitue un engagement renouvelé pour la défense de l'intérêt général et un service public intègre. Vous êtes au terme du syllabus théorique ; veuillez passer au quiz pour valider le module.`
      }
    ];
  };

  // 4 Quiz Questions
  const getQuizForModule = (): Question[] => {
    return [
      {
        text: language === 'ar'
          ? `ما هو النص التشريعي المرجعي المنظم للوظيفة العمومية في الجزائر؟`
          : `Quel est le texte législatif de référence régissant la fonction publique en Algérie ?`,
        options: language === 'ar'
          ? [`الأمر رقم 06-03 المتضمن القانون الأساسي العام`, `القانون التجاري الجزائري الموحد`, `قانون تنظيم المرور والبلديات`]
          : [`L'Ordonnance n° 06-03 portant statut général`, `Le Code de Commerce Algérien`, `La loi sur le code de la route`],
        correctAnswer: 0
      },
      {
        text: language === 'ar'
          ? `أي من الخيارات التالية يعد من الواجبات المهنية الأساسية للموظف العام؟`
          : `Lequel des choix suivants constitue un devoir professionnel majeur de l'agent ?`,
        options: language === 'ar'
          ? [`إفشاء الأسرار والقرارات الإدارية قبل صدورها`, `الالتزام الكامل بالسر المهني والتحفظ والنزاهة`, `الغياب المتكرر عن العمل بدون مبرر مقبول`]
          : [`La divulgation anticipée de décisions confidentielles`, `Le respect absolu du secret professionnel et de la réserve`, `L'absence fréquente non autorisée`],
        correctAnswer: 1
      },
      {
        text: language === 'ar'
          ? `ما هي العقوبة الإدارية التي تندرج تحت الدرجة الأولى من العقوبات التأديبية؟`
          : `Quelle sanction administrative relève du premier degré de l'échelle disciplinaire ?`,
        options: language === 'ar'
          ? [`التسريح التلقائي من الخدمة مع الحرمان من المعاش`, `التنزيل المباشر في الرتبة الوظيفية`, `الإنذار الكتابي أو التوبيخ الموثق في السجل`]
          : [`La révocation d'office avec perte de pension`, `La rétrogradation de grade administrative`, `L'avertissement écrit ou le blâme consigné`],
        correctAnswer: 2
      },
      {
        text: language === 'ar'
          ? `كيف يتم احتساب التقدم المهني والترقية للموظفين في الإدارة الجزائرية؟`
          : `Comment s'effectue la promotion professionnelle des agents dans l'administration algérienne ?`,
        options: language === 'ar'
          ? [`عن طريق التكوين الترقوي والامتحانات المهنية المنظمة`, `تلقائياً دون شروط كفاءة أو أقدمية مطلقة`, `بناء على نظام القرعة السنوي للمصالح الإدارية`]
          : [`Par formation de promotion et examens professionnels officiels`, `Automatiquement sans conditions de rendement ni d'ancienneté`, `Par tirage au sort annuel au sein des départements`],
        correctAnswer: 0
      }
    ];
  };

  const startModuleLMS = (moduleTitle: string) => {
    setActiveModule(moduleTitle);
    setCurrentSlideIndex(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setShowQuizError(false);
  };

  const startModuleQuiz = (moduleTitle: string) => {
    setActiveModule(moduleTitle);
    setCurrentSlideIndex(4);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setShowQuizError(false);
  };

  const selectQuizOption = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const submitModuleQuiz = async () => {
    if (!activeModule || !currentTrainee) return;
    
    const quiz = getQuizForModule();
    let correctCount = 0;
    
    // Check all 4 answers are filled
    if (Object.keys(quizAnswers).length < 4) {
      setShowQuizError(true);
      return;
    }
    
    setShowQuizError(false);
    
    quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });
    
    setQuizScore(correctCount);
    setQuizSubmitted(true);
    
    if (correctCount === 4) {
      // SUCCESS! Mark module as completed in DB
      try {
        const updated = await db.updateTraineeModule(currentTrainee.id, activeModule, true);
        setCurrentTrainee(updated);
        setTrainees(prev => prev.map(item => item.id === updated.id ? updated : item));

        if (updated.status === 'completed') {
          await ensureCertificate();
        }
      } catch (err) {
        console.error('Error syncing module success to DB:', err);
      }
    }
  };

  // Submit Technical Support Ticket
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrainee || !ticketSubject.trim() || !ticketMessage.trim()) return;

    setIsSubmittingTicket(true);
    try {
      await db.addTicket(
        currentTrainee.id,
        currentTrainee.name,
        currentTrainee.companyId,
        ticketSubject,
        ticketMessage
      );
      setTicketSuccess(true);
      setTicketSubject('');
      setTicketMessage('');
      const allTickets = await db.getTickets();
      const filtered = allTickets.filter(t => t.traineeId === currentTrainee.id);
      setTraineeTickets(filtered);
      
      // Auto dismiss success toast after 3s
      setTimeout(() => setTicketSuccess(false), 4000);
    } catch (err) {
      console.error('Error submitting technical support ticket:', err);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // Submit Course Evaluation Form
  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrainee || !evaluatingModule || ratingQuality === 0 || ratingTechnical === 0 || ratingUtility === 0) return;

    setIsSubmittingEval(true);
    try {
      await db.addCourseEvaluation(
        currentTrainee.id,
        currentTrainee.name,
        currentTrainee.companyId,
        currentTrainee.trackId,
        evaluatingModule,
        ratingQuality,
        ratingTechnical,
        ratingUtility,
        evaluationFeedback
      );
      setEvalSuccess(true);
      setRatingQuality(0);
      setRatingTechnical(0);
      setRatingUtility(0);
      setEvaluationFeedback('');

      // Auto dismiss and close after 2.5 seconds
      setTimeout(() => {
        setShowEvaluationModal(false);
        setEvalSuccess(false);
        setEvaluatingModule(null);
      }, 2500);
    } catch (err) {
      console.error('Error submitting course evaluation:', err);
    } finally {
      setIsSubmittingEval(false);
    }
  };

  // Find modules for the current trainee's track
  const getTrackModules = (): string[] => {
    if (!currentTrainee) return [];
    const track = companyTracks.find(t => t.id === currentTrainee.trackId) || OFFICIAL_TRACKS.find(t => t.id === currentTrainee.trackId);
    if (!track) return [];
    return (language === 'ar' ? track.modules_ar : track.modules_fr) as string[];
  };

  // Get Top Trainees for department Leaderboard (Honor Board)
  const getLeaderboard = () => {
    if (!currentTrainee) return [];
    // Sort trainees by progress descending
    return [...trainees]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fbf8f3] text-[#2d2621]">
      
      {/* 1. SIDEBAR NAVIGATION - Responsive */}
      <aside className="w-full lg:w-72 bg-[#3E5C46] text-[#F3E4C9] flex flex-col justify-between z-30 lg:sticky lg:top-0 lg:h-screen shadow-none">
        
        {/* Top Logo */}
        <div className="p-6 hidden lg:flex items-center gap-3 border-b border-[#5C7449]/30 bg-[#3E5C46]">
          <div className="bg-[#CCD67F] text-[#3E5C46] p-2 rounded-full">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm block text-white leading-tight">
              بوابة المتكونين
            </span>
            <span className="text-[10px] text-[#F3E4C9]/70 block font-semibold uppercase tracking-wider mt-0.5">
              {language === 'ar' ? 'فضاء الموظف المتربص' : 'Trainee Space'}
            </span>
          </div>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex flex-row lg:flex-col lg:py-6 overflow-x-auto lg:overflow-x-visible w-full justify-around lg:justify-start lg:gap-2 flex-grow lg:flex-grow-0">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 py-4 px-6 text-sm font-semibold transition-all relative w-full min-w-[90px] lg:min-w-0 justify-center lg:justify-start ${
              activeTab === 'dashboard' ? 'text-white bg-[#5C7449]/30' : 'text-[#F3E4C9]/85 hover:text-white hover:bg-[#5C7449]/15'
            }`}
          >
            {activeTab === 'dashboard' && (
              <div className={`hidden lg:block absolute top-0 bottom-0 w-1 bg-[#CCD67F] ${dir === 'rtl' ? 'right-0' : 'left-0'}`} />
            )}
            <LayoutDashboard className="w-5 h-5 text-[#CCD67F]" />
            <span className="text-[10px] sm:text-xs lg:text-sm">
              {language === 'ar' ? 'لوحة التحكم' : 'Tableau de bord'}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('course')}
            className={`flex items-center gap-3 py-4 px-6 text-sm font-semibold transition-all relative w-full min-w-[90px] lg:min-w-0 justify-center lg:justify-start ${
              activeTab === 'course' ? 'text-white bg-[#5C7449]/30' : 'text-[#F3E4C9]/85 hover:text-white hover:bg-[#5C7449]/15'
            }`}
          >
            {activeTab === 'course' && (
              <div className={`hidden lg:block absolute top-0 bottom-0 w-1 bg-[#CCD67F] ${dir === 'rtl' ? 'right-0' : 'left-0'}`} />
            )}
            <BookOpen className="w-5 h-5 text-[#CCD67F]" />
            <span className="text-[10px] sm:text-xs lg:text-sm">{t('myActiveTrack')}</span>
          </button>

          <button 
            onClick={() => setActiveTab('lessons')}
            className={`flex items-center gap-3 py-4 px-6 text-sm font-semibold transition-all relative w-full min-w-[90px] lg:min-w-0 justify-center lg:justify-start ${
              activeTab === 'lessons' ? 'text-white bg-[#5C7449]/30' : 'text-[#F3E4C9]/85 hover:text-white hover:bg-[#5C7449]/15'
            }`}
          >
            {activeTab === 'lessons' && (
              <div className={`hidden lg:block absolute top-0 bottom-0 w-1 bg-[#CCD67F] ${dir === 'rtl' ? 'right-0' : 'left-0'}`} />
            )}
            <FileText className="w-5 h-5 text-[#CCD67F]" />
            <span className="text-[10px] sm:text-xs lg:text-sm">
              {language === 'ar' ? 'الدروس والملفات' : 'Documents PDF'}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('exams')}
            className={`flex items-center gap-3 py-4 px-6 text-sm font-semibold transition-all relative w-full min-w-[90px] lg:min-w-0 justify-center lg:justify-start ${
              activeTab === 'exams' ? 'text-white bg-[#5C7449]/30' : 'text-[#F3E4C9]/85 hover:text-white hover:bg-[#5C7449]/15'
            }`}
          >
            {activeTab === 'exams' && (
              <div className={`hidden lg:block absolute top-0 bottom-0 w-1 bg-[#CCD67F] ${dir === 'rtl' ? 'right-0' : 'left-0'}`} />
            )}
            <ClipboardCheck className="w-5 h-5 text-[#CCD67F]" />
            <span className="text-[10px] sm:text-xs lg:text-sm">
              {language === 'ar' ? 'الامتحانات' : 'Examens'}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-3 py-4 px-6 text-sm font-semibold transition-all relative w-full min-w-[90px] lg:min-w-0 justify-center lg:justify-start ${
              activeTab === 'certificate' ? 'text-white bg-[#5C7449]/30' : 'text-[#F3E4C9]/85 hover:text-white hover:bg-[#5C7449]/15'
            }`}
          >
            {activeTab === 'certificate' && (
              <div className={`hidden lg:block absolute top-0 bottom-0 w-1 bg-[#CCD67F] ${dir === 'rtl' ? 'right-0' : 'left-0'}`} />
            )}
            <Award className="w-5 h-5 text-[#CCD67F]" />
            <span className="text-[10px] sm:text-xs lg:text-sm">
              {language === 'ar' ? 'الشهادة' : 'Attestation'}
            </span>
          </button>

          <button 
            onClick={() => {
              setIsDrawerOpen(true);
              setDrawerTab('faq');
            }}
            className="flex items-center gap-3 py-4 px-6 text-sm font-semibold transition-all relative w-full min-w-[90px] lg:min-w-0 justify-center lg:justify-start text-[#F3E4C9]/85 hover:text-white hover:bg-[#5C7449]/15"
          >
            <HelpCircle className="w-5 h-5 text-[#CCD67F]/80" />
            <span className="text-[10px] sm:text-xs lg:text-sm">
              {language === 'ar' ? 'الدعم والأسئلة' : 'Support & FAQ'}
            </span>
          </button>
        </nav>

        {/* Sidebar Bottom Action - collapses on mobile */}
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

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-grow p-6 sm:p-8 lg:p-12 overflow-y-auto mb-16 lg:mb-0">
        
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between pb-6 border-b border-[#F3E4C9] mb-6">
          <span className="font-extrabold text-sm text-[#3E5C46]">
            {language === 'ar' ? 'التكوين الترقوي المشترك' : 'Formation Continue'}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setIsDrawerOpen(true);
                setDrawerTab('faq');
              }}
              className="p-2 text-[#3E5C46]"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button onClick={toggleLanguage} className="p-2 text-xs font-semibold rounded-full border border-[#3E5C46] text-[#3E5C46]">
              {language === 'ar' ? 'FR' : 'AR'}
            </button>
            <Link href="/auth" className="p-2 text-[#3E5C46]">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Mobile Tab Bar */}
        <div className="lg:hidden flex overflow-x-auto gap-2 pb-4 mb-6 -mx-2 px-2">
          {([
            { id: 'dashboard', label: language === 'ar' ? 'الرئيسية' : 'Accueil', icon: LayoutDashboard },
            { id: 'course', label: language === 'ar' ? 'التكوين' : 'Cours', icon: BookOpen },
            { id: 'lessons', label: language === 'ar' ? 'الملفات' : 'Docs', icon: FileText },
            { id: 'exams', label: language === 'ar' ? 'الامتحانات' : 'Examens', icon: ClipboardCheck },
            { id: 'certificate', label: language === 'ar' ? 'الشهادة' : 'Attestation', icon: Award }
          ] as { id: 'dashboard' | 'course' | 'lessons' | 'exams' | 'certificate'; label: string; icon: any }[]).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black transition-colors ${
                activeTab === item.id
                  ? 'bg-[#3E5C46] text-[#F3E4C9]'
                  : 'bg-[#F3E4C9] text-[#3E5C46] hover:bg-[#CCD67F]/40'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => { setIsDrawerOpen(true); setDrawerTab('faq'); }}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black bg-[#F3E4C9] text-[#3E5C46] hover:bg-[#CCD67F]/40 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'الدعم' : 'Aide'}</span>
          </button>
        </div>

        {/* Dynamic Trainee Account Selector removed — access is session-scoped to the logged-in trainee */}
        <div className="bg-[#F3E4C9] p-4 rounded-xl mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#3E5C46]" />
            <span className="text-xs font-bold text-[#3E5C46]">
              {language === 'ar' ? 'فضاءك الشخصي' : 'Votre espace personnel'}
            </span>
          </div>
        </div>

        {loading && (
          <div className="p-12 text-center text-[#5C7449] font-bold text-sm">
            {language === 'ar' ? 'جاري تحميل برنامج التكوين...' : 'Chargement du portail de formation...'}
          </div>
        )}

        {!loading && currentTrainee && (
          <div className="animate-fadeIn">
            
            {/* ===================== TAB: DASHBOARD ===================== */}
            {activeTab === 'dashboard' && (
              <>

                {/* Completion CTA when trainee finished the course */}
                {currentTrainee.status === 'completed' && (
                  <div className="mb-8 p-5 rounded-2xl bg-[#CCD67F]/30 border border-[#3E5C46]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#3E5C46] text-[#CCD67F] p-2.5 rounded-full">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-black text-[#3E5C46] block">
                          {language === 'ar' ? 'تهانينا! لقد أتممت جميع مقاييس التكوين' : 'Félicitations ! Parcours terminé'}
                        </span>
                        <span className="text-[11px] text-[#5C7449] font-semibold block">
                          {language === 'ar' ? 'شهادتك الرسمية جاهزة للطباعة.' : 'Votre attestation officielle est prête.'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('certificate')}
                      className="px-5 py-2 bg-[#3E5C46] text-white rounded-full text-xs font-black hover:bg-[#5C7449] transition-colors shrink-0"
                    >
                      {language === 'ar' ? 'عرض الشهادة' : 'Voir l\'attestation'}
                    </button>
                  </div>
                )}

            {/* Trainee Welcome Card (Flat, no shadows) */}
            <div className="bg-[#3E5C46] text-[#F3E4C9] p-8 rounded-3xl mb-8 relative overflow-hidden">
              {/* Background abstract decoration shape */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#5C7449]/20 skew-x-12 transform origin-top-right"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-black uppercase text-[#CCD67F] tracking-widest block mb-2">
                    {currentTrainee.companyName}
                  </span>
                  <h2 className="text-3xl font-black text-white mb-2">
                    {language === 'ar' ? `مرحباً، ${currentTrainee.name}` : `Bienvenue, ${currentTrainee.name}`}
                  </h2>
                  <p className="text-sm text-[#F3E4C9]/90 font-medium max-w-xl">
                    {language === 'ar'
                      ? `أنت مسجل حالياً في الدورة التكوينية الرسمية المؤهلة لرتبة: ${currentTrainee.trackTitleAr}. يرجى إتمام جميع المقاييس أدناه قبل الآجال.`
                      : `Vous êtes actuellement inscrit au parcours de promotion officielle pour la catégorie : ${currentTrainee.trackTitleFr}.`}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0 flex items-center gap-2 bg-[#F3E4C9] text-[#3E5C46] px-5 py-2.5 rounded-2xl">
                  {currentTrainee.status === 'completed' ? (
                    <>
                      <Award className="w-5 h-5 text-[#CCD67F] fill-[#CCD67F]" />
                      <span className="text-xs font-black uppercase">{t('statusCompleted')}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-[#5C7449]" />
                      <span className="text-xs font-black uppercase">{t('active')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              
              {/* Trainee progress tile */}
              <div className="bg-[#F3E4C9] p-6 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[#5C7449] uppercase tracking-wider">
                  {t('progress')}
                </span>
                <div className="mt-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-3xl font-black text-[#3E5C46]">{currentTrainee.progress}%</span>
                    <span className="text-xs text-[#5C7449] font-bold">
                      {currentTrainee.completedModules.length} / {getTrackModules().length} {language === 'ar' ? 'مقاييس مكتملة' : 'modules'}
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${currentTrainee.progress}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Deadline tile */}
              <div className="bg-[#F3E4C9] p-6 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[#5C7449] uppercase tracking-wider">
                  {t('deadline')}
                </span>
                <div className="mt-4">
                  <span className="text-2xl font-extrabold text-[#3E5C46] flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-[#5C7449]" />
                    {currentTrainee.deadline}
                  </span>
                  <p className="text-[10px] text-[#5C7449] mt-2 font-semibold">
                    {language === 'ar'
                      ? 'الرجاء تسليم التقارير الفردية في الوقت المحدد'
                      : 'Veuillez remettre vos fiches de synthèse à temps.'}
                  </p>
                </div>
              </div>

              {/* Certification Eligibility tile */}
              <div className="bg-[#F3E4C9] p-6 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[#5C7449] uppercase tracking-wider">
                  {language === 'ar' ? 'الأهلية للترقية المهنية' : 'Éligibilité à la Promotion'}
                </span>
                <div className="mt-4 flex items-center gap-3">
                  {currentTrainee.status === 'completed' ? (
                    <div className="w-10 h-10 rounded-full bg-[#CCD67F] flex items-center justify-center text-[#3E5C46] font-bold">
                      ✓
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#5C7449]/20 flex items-center justify-center text-[#3E5C46] font-bold text-xs">
                      ...
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-bold text-[#3E5C46] block">
                      {currentTrainee.status === 'completed' 
                        ? (language === 'ar' ? 'مؤهل - شهادة جاهزة' : 'Éligible - Attestation Prête')
                        : (language === 'ar' ? 'غير مؤهل بعد' : 'En Cours d’Étude')}
                    </span>
                    <span className="text-[10px] text-[#5C7449] font-medium block">
                      {currentTrainee.status === 'completed'
                        ? (language === 'ar' ? 'تم تحديث السجل الوظيفي' : 'Dossier mis à jour')
                        : (language === 'ar' ? 'أكمل بقية المقاييس لتنشيط الترقية' : 'Complétez les modules restants')}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            </> /* dashboard */
            )}

            {/* ===================== TAB: CERTIFICATE ===================== */}
            {activeTab === 'certificate' && (
              <>

            {/* DUAL-LANGUAGE PRINT-READY GRADUATION CERTIFICATE BLOCK */}
            {currentTrainee.status === 'completed' && (
              <section className="mb-12 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#F3E4C9] pb-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#3E5C46]" />
                    <h3 className="text-xl font-bold text-[#3E5C46]">
                      {language === 'ar' ? 'شهادة النجاح الرسمية' : 'Attestation Officielle de Réussite'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.print()}
                      className="btn-pill-sage py-2 px-6 text-xs flex items-center gap-2 bg-[#3E5C46] text-white hover:bg-[#5C7449] transition-colors rounded-full font-bold"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{language === 'ar' ? 'طباعة الشهادة الرسمية' : 'Imprimer l’Attestation'}</span>
                    </button>
                    <a
                      href={`/verify?code=${certificate ? certificate.id : 'CERT-2026-' + currentTrainee.id.toUpperCase()}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-pill-ghost py-2 px-6 text-xs flex items-center gap-2 border border-[#3E5C46]/35 text-[#3E5C46] hover:bg-[#3E5C46]/10 transition-colors rounded-full font-bold"
                    >
                      <Award className="w-4 h-4" />
                      <span>{language === 'ar' ? 'رابط التحقق العمومي' : 'Lien de Vérification'}</span>
                    </a>
                  </div>
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

                {/* High-Fidelity landscape styled dual-column institution certificate */}
                <div 
                  id="certificate-print-area" 
                  className="bg-[#F3E4C9]/25 p-8 sm:p-12 border-8 border-double border-[#3E5C46] rounded-3xl relative overflow-hidden bg-grain flex flex-col justify-between"
                  style={{ minHeight: '600px' }}
                >
                  {/* Decorative inner frame */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 bottom-2.5 border-2 border-[#CCD67F]/60 pointer-events-none rounded-2xl" />

                  {/* Backdrop Faint Logo Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none z-0">
                    <svg width="350" height="350" viewBox="0 0 100 100" fill="none" stroke="#3E5C46" strokeWidth="1.5">
                      <circle cx="50" cy="50" r="45" />
                      <polygon points="50,12 60,35 85,35 65,53 74,78 50,63 26,78 35,53 15,35 40,35" />
                    </svg>
                  </div>

                  {/* Top Section: Dual institutional headers */}
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
                        REG. N°: {certificate ? certificate.id : 'CERT-2026-' + currentTrainee.id.toUpperCase()}
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
                        رقم القيد: {certificate ? certificate.id : 'CERT-2026-' + currentTrainee.id.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Title of Certificate */}
                  <div className="text-center my-6 z-10 relative">
                    <div className="inline-block px-10 py-2.5 bg-[#3E5C46] text-[#F3E4C9] rounded-full font-black text-lg sm:text-xl uppercase tracking-wider mb-2">
                      شهادة إتمام التكوين المتواصل
                    </div>
                    <div className="text-[#3E5C46] font-mono text-[9px] sm:text-[10px] font-black tracking-widest mt-1">
                      ATTESTATION DE RÉUSSITE OFFICIELLE
                    </div>
                  </div>

                  {/* Main dual column content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-4 text-[#2d2621] z-10 relative">
                    
                    {/* Left Column: French details */}
                    <div className="text-left font-mono text-[11px] sm:text-xs flex flex-col justify-between md:pr-6 md:border-r border-[#3E5C46]/10">
                      <p className="leading-relaxed">
                        La Direction Générale de la Formation Continue certifie par la présente que l’agent public :
                      </p>
                      
                      <div className="my-3">
                        <h4 className="text-sm font-black text-[#3E5C46] uppercase tracking-wide">
                          {currentTrainee.name}
                        </h4>
                        <span className="text-[10px] text-[#5C7449] block font-bold mt-0.5">
                          Établissement : {currentTrainee.companyName}
                        </span>
                      </div>

                      <p className="leading-relaxed">
                        a complété avec succès le programme de formation de pré-promotion requis pour l’accès au grade supérieur de :
                      </p>

                      <div className="mt-2.5 py-1.5 px-3 bg-[#CCD67F]/15 rounded-xl inline-block border-l-4 border-[#CCD67F]">
                        <span className="text-[10px] sm:text-[11px] font-black text-[#3E5C46] font-sans">
                          {currentTrainee.trackTitleFr}
                        </span>
                      </div>

                      <p className="text-[9px] text-[#5C7449] font-bold mt-4 font-sans">
                        Délivré à Alger, le {new Date().toLocaleDateString('fr-FR')} sous le sceau de l’institut.
                      </p>
                    </div>

                    {/* Right Column: Arabic details */}
                    <div className="text-right font-tajawal text-[11px] sm:text-xs flex flex-col justify-between md:pl-6">
                      <p className="leading-loose">
                        تشهد المديرية العامة للتكوين المتواصل بأن الموظف العمومي المتربص:
                      </p>
                      
                      <div className="my-3">
                        <h4 className="text-sm font-black text-[#3E5C46]">
                          {currentTrainee.name}
                        </h4>
                        <span className="text-[10px] text-[#5C7449] block font-bold mt-0.5">
                          الهيئة الإدارية: {currentTrainee.companyName}
                        </span>
                      </div>

                      <p className="leading-loose">
                        قد أتم(ت) بنجاح كامل مقاييس التكوين الترقوي المشترك والامتحان المهني المنظم للترقية إلى رتبة:
                      </p>

                      <div className="mt-2.5 py-1.5 px-3 bg-[#CCD67F]/15 rounded-xl inline-block border-r-4 border-[#CCD67F]">
                        <span className="text-[10px] sm:text-[11px] font-black text-[#3E5C46]">
                          {currentTrainee.trackTitleAr}
                        </span>
                      </div>

                      <p className="text-[9px] text-[#5C7449] font-bold mt-4 font-mono">
                        حرر بالجزائر العاصمة في {new Date().toLocaleDateString('ar-DZ')} تحت السجل الرسمي للمؤسسة.
                      </p>
                    </div>

                  </div>

                  {/* Signatures & Seal row */}
                  <div className="grid grid-cols-3 items-end text-center mt-6 border-t border-[#3E5C46]/10 pt-6 z-10 relative">
                    
                    {/* Left: Chef de service */}
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] sm:text-[9px] font-bold text-[#5C7449] block uppercase font-mono">
                        Le Chef de Service
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-black text-[#3E5C46] block">
                        رئيس مصلحة التكوين
                      </span>
                      {/* Signature graphic SVG */}
                      <svg width="80" height="35" viewBox="0 0 100 50" className="text-[#3E5C46]/60 my-1">
                        <path d="M10,25 Q35,5 55,25 T95,25" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M25,18 Q45,38 65,18 T85,38" fill="none" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    </div>

                    {/* Middle: Stamp watermark */}
                    <div className="flex justify-center relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-dashed border-[#3E5C46]/40 flex items-center justify-center relative transform rotate-12 bg-white/40">
                        <div className="absolute inset-1.5 rounded-full border border-[#3E5C46]/30 flex flex-col items-center justify-center text-[6px] sm:text-[7px] font-black uppercase text-[#3E5C46]/85 leading-none text-center font-mono">
                          <span>MINISTÈRE FP</span>
                          <span className="text-[8px] text-[#CCD67F] font-bold my-0.5">AGENCE</span>
                          <span>تكوين رسمي</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Directeur general */}
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] sm:text-[9px] font-bold text-[#5C7449] block uppercase font-mono">
                        Le Directeur Général
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-black text-[#3E5C46] block">
                        المدير العام للمعهد
                      </span>
                      {/* Signature graphic SVG */}
                      <svg width="80" height="35" viewBox="0 0 100 50" className="text-[#3E5C46]/60 my-1">
                        <path d="M15,35 C35,15 45,45 70,25 C80,15 90,35 95,22" fill="none" stroke="currentColor" strokeWidth="2.5" />
                        <circle cx="55" cy="22" r="3" fill="currentColor" className="opacity-50" />
                      </svg>
                    </div>

                  </div>

                </div>
              </section>
            )}

            {/* Eligibility card shown in Certificate tab when course not yet completed */}
            {currentTrainee.status !== 'completed' && (
              <div className="p-10 sm:p-14 text-center bg-[#F3E4C9]/40 rounded-3xl border-2 border-dashed border-[#5C7449]/30 animate-fadeIn">
                <div className="bg-[#3E5C46] text-[#CCD67F] p-4 rounded-full inline-flex mb-5">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-[#3E5C46] mb-3">
                  {language === 'ar' ? 'شهادتك لم تُصدر بعد' : 'Attestation non encore disponible'}
                </h3>
                <p className="text-sm text-[#5C7449] font-medium max-w-md mx-auto leading-relaxed mb-6">
                  {language === 'ar'
                    ? `تظهر الشهادة الرسمية هنا بمجرد إتمام جميع مقاييس مسار "${currentTrainee.trackTitleAr}" والنجاح في امتحاناتها (التقدم 100%). تقدمك الحالي: ${currentTrainee.progress}%`
                    : `L'attestation officielle apparaîtra ici une fois que vous aurez validé tous les modules du parcours "${currentTrainee.trackTitleFr}" (progression 100%). Progression actuelle : ${currentTrainee.progress}%`}
                </p>
                <div className="progress-bar-container max-w-xs mx-auto">
                  <div className="progress-bar-fill" style={{ width: `${currentTrainee.progress}%` }}></div>
                </div>
                <button
                  onClick={() => setActiveTab('course')}
                  className="mt-6 px-6 py-2.5 rounded-full text-xs font-black bg-[#3E5C46] text-white hover:bg-[#5C7449] transition-colors"
                >
                  {language === 'ar' ? 'متابعة الدراسة' : 'Continuer la formation'}
                </button>
              </div>
            )}

              </>
            ) /* certificate */}

            {/* DUAL COLUMN RESPONSIVE WORKSPACE (sections filtered per active tab) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* 2/3 COLUMN: MAIN CONTENT (Messages, Lessons, Checklist) */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                
                {/* COMPANY ANNOUNCEMENTS / MESSAGES (Dashboard tab) */}
                {activeTab === 'dashboard' && companyMessages.length > 0 && (
                  <section className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#5C7449]/10 shadow-sm animate-fadeIn">
                    <div className="flex items-center gap-2 border-b border-[#F3E4C9] pb-3 mb-6">
                      <MessageSquare className="w-5 h-5 text-[#3E5C46]" />
                      <h3 className="text-xl font-bold text-[#3E5C46]">
                        {language === 'ar' ? 'إعلانات المؤسسة' : 'Annonces de l\'établissement'}
                      </h3>
                    </div>
                    <div className="flex flex-col gap-4">
                      {companyMessages.map(msg => (
                        <div key={msg.id} className="p-4 rounded-xl bg-[#F3E4C9]/40 border-l-4 sm:border-l-0 sm:border-r-4 border-[#3E5C46]">
                          <h4 className="font-black text-sm text-[#3E5C46] mb-1">{msg.title}</h4>
                          <p className="text-xs text-[#2d2621]/90 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          <div className="mt-2 text-[10px] text-[#5C7449] font-semibold">
                            {new Date(msg.createdAt).toLocaleString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* TARGETED LESSONS / PDF MATERIALS (Lessons tab) */}
                {activeTab === 'lessons' && lessons.length > 0 && (
                  <section className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#5C7449]/10 shadow-sm animate-fadeIn">
                    <div className="flex items-center gap-2 border-b border-[#F3E4C9] pb-3 mb-6">
                      <BookOpen className="w-5 h-5 text-[#3E5C46]" />
                      <h3 className="text-xl font-bold text-[#3E5C46]">
                        {language === 'ar' ? 'المواد التعليمية الإضافية' : 'Documents de formation'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {lessons.map(lesson => (
                        <div key={lesson.id} className="p-4 rounded-xl bg-white border border-[#5C7449]/20 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="bg-[#CCD67F]/20 p-2 rounded-lg text-[#3E5C46]">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-bold text-sm text-[#3E5C46] leading-tight">{lesson.title}</h4>
                                {lesson.companyId === 'global' && (
                                  <span className="text-[8px] font-black uppercase tracking-wider text-[#5C7449] bg-[#CCD67F]/30 px-1.5 py-0.5 rounded shrink-0">
                                    {language === 'ar' ? 'عالمي' : 'Global'}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] font-semibold text-[#5C7449] mt-0.5">{lesson.moduleTitle}</p>
                            </div>
                          </div>
                          <a
                            href={`/api/lesson/file?id=${lesson.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-white bg-[#3E5C46] hover:bg-[#5C7449] transition-colors py-1.5 px-3 rounded-lg w-full justify-center"
                          >
                            <span>{language === 'ar' ? 'فتح الملف PDF' : 'Ouvrir le PDF'}</span>
                            <span className="font-mono text-[9px] truncate max-w-[100px]">{lesson.fileName}</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {activeTab === 'course' && (
                <section className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#5C7449]/10">
                  <div className="flex items-center gap-2 border-b border-[#F3E4C9] pb-3 mb-6">
                    <Layers className="w-5 h-5 text-[#3E5C46]" />
                    <h3 className="text-xl font-bold text-[#3E5C46]">
                      {language === 'ar' ? 'محتوى البرنامج التكويني والتأطير' : 'Syllabus Moodle de Formation'}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4">
                    {getTrackModules().map((moduleTitle, index) => {
                      const isCompleted = currentTrainee.completedModules.includes(moduleTitle);
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
                            isCompleted ? 'bg-[#CCD67F]/25 border-l-4 sm:border-l-0 sm:border-r-4 border-[#CCD67F]' : 'bg-[#F3E4C9]/40 border-l-4 sm:border-l-0 sm:border-r-4 border-[#5C7449]/20'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Module number stamp */}
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              isCompleted ? 'bg-[#CCD67F] text-[#3E5C46]' : 'bg-[#5C7449]/20 text-[#3E5C46]'
                            }`}>
                              {index + 1}
                            </span>
                            
                            <div>
                              <h4 className="text-base font-bold text-[#3E5C46] leading-tight">
                                {moduleTitle}
                              </h4>
                              <span className="text-[10px] font-semibold text-[#5C7449] block mt-1">
                                {language === 'ar' ? 'مقياس إجباري • 30 ساعة دراسة' : 'Module Obligatoire • 30h'}
                              </span>
                            </div>
                          </div>

                          {/* Interactive Study Button & Custom Checkbox */}
                          <div className="flex flex-wrap items-center gap-4 self-end sm:self-auto">
                            <button
                              onClick={() => startModuleLMS(moduleTitle)}
                              className="px-4 py-1.5 rounded-full text-xs font-black bg-[#3E5C46] text-white hover:bg-[#5C7449] transition-colors flex items-center gap-1.5"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>
                                {isCompleted
                                  ? (language === 'ar' ? 'مراجعة المادة' : 'Réviser')
                                  : (language === 'ar' ? 'ابدأ الدراسة' : 'Étudier')}
                              </span>
                            </button>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#3E5C46]">
                                {isCompleted 
                                  ? (language === 'ar' ? 'مكتمل' : 'Terminé')
                                  : (language === 'ar' ? 'قيد الدراسة' : 'En cours')}
                              </span>
                              
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={isCompleted}
                                  onChange={(e) => handleToggleModule(moduleTitle, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-12 h-6 bg-[#5C7449]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] rtl:after:left-auto rtl:after:right-[4px] after:bg-[#3E5C46] after:border-[#3E5C46] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#CCD67F]"></div>
                              </label>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </section>
                )}
              </div>

              {/* 1/3 COLUMN: LEADERBOARD & HELPDESK QUICK-CARD (Dashboard tab) */}
              <div className="flex flex-col gap-6 lg:col-span-1">
                {activeTab === 'dashboard' && (
                <>
                
                {/* MOTIVATIONAL INTERACTIVE LEADERBOARD CARD */}
                <section className="bg-white p-6 rounded-3xl border-2 border-[#5C7449]/10">
                  <div className="flex items-center gap-2 border-b border-[#F3E4C9] pb-3 mb-4">
                    <Award className="w-5 h-5 text-[#3E5C46]" />
                    <h3 className="text-base font-black text-[#3E5C46]">
                      {language === 'ar' ? 'لوحة الشرف للمتكونين' : "Tableau d'Honneur"}
                    </h3>
                  </div>

                  <p className="text-[10px] text-[#5C7449] font-bold mb-4">
                    {language === 'ar' 
                      ? 'ترتيب أفضل المتكونين نشاطاً وتقديماً في دفعة التكوين:' 
                      : 'Les agents les plus actifs du parcours de formation continue :'}
                  </p>

                  <div className="flex flex-col gap-3">
                    {getLeaderboard().map((t, idx) => {
                      const isMe = t.id === currentTrainee.id;
                      const medals = ['🥇', '🥈', '🥉'];
                      
                      return (
                        <div 
                          key={t.id} 
                          className={`p-3 rounded-2xl flex items-center justify-between transition-colors ${
                            isMe ? 'bg-[#CCD67F]/20 border border-[#CCD67F]/60' : 'bg-[#F3E4C9]/25 hover:bg-[#F3E4C9]/45'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black w-6 text-center">
                              {idx < 3 ? medals[idx] : `${idx + 1}`}
                            </span>
                            <div>
                              <span className={`text-xs font-bold block ${isMe ? 'text-[#3E5C46]' : 'text-[#2d2621]'}`}>
                                {t.name} {isMe && (language === 'ar' ? ' (أنت)' : ' (Vous)')}
                              </span>
                              <span className="text-[9px] text-[#5C7449] font-medium block">
                                {t.companyName}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-black text-[#3E5C46] block">
                              {t.progress}%
                            </span>
                            <span className="text-[8px] text-[#5C7449] block font-bold">
                              {t.status === 'completed' 
                                ? (language === 'ar' ? 'مكتمل ✓' : 'Certifié ✓') 
                                : (language === 'ar' ? 'نشط' : 'En cours')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* HELPDESK & QUICK FAQ CARD */}
                <section className="bg-[#3E5C46] text-[#F3E4C9] p-6 rounded-3xl">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-[#CCD67F]" />
                    <h3 className="text-base font-bold text-white">
                      {language === 'ar' ? 'فضاء الدعم والأسئلة الشائعة' : 'Support & Assistance'}
                    </h3>
                  </div>

                  <p className="text-xs text-[#F3E4C9]/85 mb-4 leading-relaxed">
                    {language === 'ar' 
                      ? 'هل تواجه مشكلة تقنية أو تحتاج لتعديل معلومات الشهادة؟ اطلع على الأسئلة الشائعة أو تواصل معنا مباشرة.' 
                      : 'Besoin d’aide pour le téléchargement d’attestation ou de corriger vos coordonnées ?'}
                  </p>

                  <button
                    onClick={() => {
                      setIsDrawerOpen(true);
                      setDrawerTab('faq');
                    }}
                    className="w-full py-2.5 text-center text-xs font-black bg-[#CCD67F] text-[#3E5C46] rounded-full hover:bg-white transition-all shadow-none"
                  >
                    {language === 'ar' ? 'تصفح الأسئلة الشائعة والدعم' : 'Consulter les FAQs & Support'}
                  </button>
                </section>

                </>
                )}

              </div>

            </div>

            {/* ===================== TAB: LESSONS (empty state) ===================== */}
            {activeTab === 'lessons' && lessons.length === 0 && (
              <section className="bg-white p-10 sm:p-14 rounded-3xl border-2 border-[#5C7449]/10 text-center animate-fadeIn">
                <div className="bg-[#CCD67F]/30 text-[#3E5C46] p-4 rounded-full inline-flex mb-5">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-[#3E5C46] mb-2">
                  {language === 'ar' ? 'لا توجد ملفات مرفوعة بعد' : 'Aucun document disponible'}
                </h3>
                <p className="text-sm text-[#5C7449] font-medium max-w-md mx-auto leading-relaxed">
                  {language === 'ar'
                    ? 'لم يقم مسؤولو مؤسستك برفع ملفات أو دروس لمقياسك بعد. تابع التكوين أو تواصل مع إدارتك عبر تذكرة الدعم.'
                    : 'Votre établissement n’a pas encore partagé de documents pour votre module. Continuez votre formation ou contactez votre administration via un ticket.'}
                </p>
              </section>
            )}

            {/* ===================== TAB: EXAMS ===================== */}
            {activeTab === 'exams' && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <section className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#5C7449]/10">
                  <div className="flex items-center gap-2 border-b border-[#F3E4C9] pb-3 mb-6">
                    <ClipboardCheck className="w-5 h-5 text-[#3E5C46]" />
                    <h3 className="text-xl font-bold text-[#3E5C46]">
                      {language === 'ar' ? 'امتحانات المقاييس' : 'Examens des modules'}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4">
                    {getTrackModules().length === 0 ? (
                      <p className="text-sm text-[#5C7449] font-bold text-center py-6">
                        {language === 'ar' ? 'لا توجد مقاييس مسجلة لمسارك الحالي.' : 'Aucun module enregistré pour votre parcours.'}
                      </p>
                    ) : (
                      getTrackModules().map((moduleTitle, index) => {
                        const isCompleted = currentTrainee.completedModules.includes(moduleTitle);
                        return (
                          <div 
                            key={index} 
                            className={`p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-[#CCD67F]/25 border-l-4 sm:border-l-0 sm:border-r-4 border-[#CCD67F]' 
                                : 'bg-[#F3E4C9]/40 border-l-4 sm:border-l-0 sm:border-r-4 border-[#5C7449]/20'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                isCompleted ? 'bg-[#CCD67F] text-[#3E5C46]' : 'bg-[#5C7449]/20 text-[#3E5C46]'
                              }`}>
                                {index + 1}
                              </span>
                              <div>
                                <h4 className="text-base font-bold text-[#3E5C46] leading-tight">
                                  {moduleTitle}
                                </h4>
                                <span className={`text-[10px] font-semibold block mt-1 ${
                                  isCompleted ? 'text-[#3E5C46]' : 'text-[#5C7449]'
                                }`}>
                                  {isCompleted
                                    ? (language === 'ar' ? '✓ نجحت في امتحان هذا المقياس' : '✓ Examen validé')
                                    : (language === 'ar' ? 'لم يتم اجتياز الامتحان بعد • يشترط 4/4' : 'Examen non passé • Score requis 4/4')}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => startModuleQuiz(moduleTitle)}
                              className={`px-5 py-2 rounded-full text-xs font-black transition-colors flex items-center gap-1.5 self-end sm:self-auto ${
                                isCompleted 
                                  ? 'bg-[#3E5C46] text-white hover:bg-[#5C7449]' 
                                  : 'bg-[#CCD67F] text-[#3E5C46] hover:bg-[#3E5C46] hover:text-white'
                              }`}
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              <span>
                                {isCompleted
                                  ? (language === 'ar' ? 'إعادة الامتحان' : 'Repasser')
                                  : (language === 'ar' ? 'دخول الامتحان' : 'Passer l\'examen')}
                              </span>
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                <div className="bg-[#3E5C46] text-[#F3E4C9] p-6 rounded-3xl">
                  <h4 className="text-sm font-black text-white mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#CCD67F]" />
                    {language === 'ar' ? 'قواعد النجاح في الامتحانات' : 'Règles de validation'}
                  </h4>
                  <p className="text-xs text-[#F3E4C9]/85 leading-relaxed">
                    {language === 'ar'
                      ? 'لكل مقياس اختبار من 4 أسئلة اختيار متعدد. يشترط تحقيق العلامة الكاملة (4/4) لتسجيل المقياس كمكتمل، ويمكنك إعادة المحاولة دون حدود. عند إتمام جميع المقاييس تصبح شهادتك الرسمية جاهزة للطباعة.'
                      : 'Chaque module comporte un quiz de 4 questions à choix multiples. Un score parfait de 4/4 est requis pour valider le module. Les tentatives sont illimitées. Une fois tous les modules validés, votre attestation officielle sera prête.'}
                  </p>
                </div>
              </div>
            )}

            {/* FLOATING ACTION SUPPORT BUTTON */}
            <button
              onClick={() => {
                setIsDrawerOpen(true);
                setDrawerTab('support');
              }}
              className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 bg-[#3E5C46] text-white p-4 rounded-full shadow-lg hover:bg-[#5C7449] hover:scale-105 active:scale-95 transition-all z-40 flex items-center gap-2"
              dir="ltr"
            >
              <MessageSquare className="w-5 h-5 text-[#CCD67F]" />
              <span className="text-xs font-black hidden md:inline">
                {language === 'ar' ? 'تذكرة دعم فني' : 'Support Ticket'}
              </span>
            </button>

            {/* LMS Slide-Deck and Quiz Modal */}
            {activeModule && (
              <div className="fixed inset-0 bg-[#2d2621]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                <div 
                  className="w-full max-w-4xl bg-[#fbf8f3] rounded-3xl overflow-hidden flex flex-col relative z-50 border-4 border-[#3E5C46] card-flat"
                  dir={dir}
                >
                  {/* Header */}
                  <div className="bg-[#3E5C46] text-[#F3E4C9] p-6 flex items-center justify-between border-b border-[#5C7449]/30">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#CCD67F] text-[#3E5C46] p-1.5 rounded-full">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#F3E4C9]/70 font-bold block uppercase tracking-wider">
                          {language === 'ar' ? 'منصة التكوين التفاعلي' : 'LMS Interactif'}
                        </span>
                        <h3 className="text-base font-black text-white leading-tight">
                          {activeModule}
                        </h3>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveModule(null)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Top Progress bar of slides & quiz */}
                  <div className="w-full bg-[#F3E4C9] h-1.5 flex">
                    {Array.from({ length: 5 }).map((_, stepIdx) => (
                      <div 
                        key={stepIdx}
                        className={`flex-grow h-full border-r border-[#fbf8f3] transition-all duration-300 ${
                          currentSlideIndex >= stepIdx ? 'bg-[#CCD67F]' : 'bg-[#F3E4C9]'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Content body */}
                  <div className="p-8 sm:p-10 flex-grow min-h-[300px] flex flex-col justify-between">
                    
                    {currentSlideIndex < 4 ? (
                      /* SLIDE PRESENTATION CONTENT */
                      <div className="animate-fadeIn flex-grow flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-black uppercase text-[#5C7449] tracking-widest block mb-2 font-mono">
                            {language === 'ar' ? `شريحة ${currentSlideIndex + 1} من 4` : `Diapositive ${currentSlideIndex + 1} sur 4`}
                          </span>
                          
                          <h4 className="text-2xl font-black text-[#3E5C46] mb-6">
                            {getSlidesForModule(activeModule)[currentSlideIndex].title}
                          </h4>

                          <div className="bg-[#F3E4C9]/30 p-6 rounded-2xl border-r-4 border-l-0 rtl:border-l-4 rtl:border-r-0 border-[#CCD67F] text-base leading-relaxed text-[#2d2621] font-medium">
                            {getSlidesForModule(activeModule)[currentSlideIndex].content}
                          </div>
                        </div>

                        {/* Navigation controls for slides */}
                        <div className="flex items-center justify-between mt-8 border-t border-[#F3E4C9] pt-6">
                          <button
                            disabled={currentSlideIndex === 0}
                            onClick={() => setCurrentSlideIndex(prev => prev - 1)}
                            className={`px-4 py-2 text-xs font-bold rounded-full transition-colors flex items-center gap-1.5 ${
                              currentSlideIndex === 0 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'bg-[#5C7449]/20 text-[#3E5C46] hover:bg-[#5C7449]/40'
                            }`}
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>{language === 'ar' ? 'السابق' : 'Précédent'}</span>
                          </button>

                          <button
                            onClick={() => setCurrentSlideIndex(prev => prev + 1)}
                            className="px-6 py-2 text-xs font-black bg-[#CCD67F] text-[#3E5C46] rounded-full hover:bg-[#3E5C46] hover:text-white transition-all flex items-center gap-1.5"
                          >
                            <span>{language === 'ar' ? 'التالي' : 'Suivant'}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* QUIZ / MCQ CONTENT */
                      <div className="animate-fadeIn flex-grow flex flex-col justify-between">
                        
                        {!quizSubmitted ? (
                          /* QUIZ ACTIVE STATE */
                          <div>
                            <div className="mb-6">
                              <span className="text-xs font-black uppercase text-[#5C7449] tracking-widest block mb-1 font-mono">
                                {language === 'ar' ? 'التقييم والامتحان النهائي للمقياس' : 'EXAMEN FINAL DU MODULE'}
                              </span>
                              <h4 className="text-xl font-black text-[#3E5C46]">
                                {language === 'ar' ? 'أجب على الأسئلة الأربعة التالية لتحصيل المقياس:' : 'Répondez aux 4 questions pour valider le module :'}
                              </h4>
                            </div>

                            {showQuizError && (
                              <div className="p-4 bg-[#3E5C46]/10 text-[#3E5C46] rounded-2xl mb-6 text-xs font-bold border-l-4 border-[#3E5C46]">
                                {language === 'ar' 
                                  ? '⚠️ يرجى الإجابة على جميع الأسئلة المطروحة قبل المتابعة.' 
                                  : '⚠️ Veuillez répondre à toutes les questions avant de valider.'}
                              </div>
                            )}

                            <div className="flex flex-col gap-6 max-h-[380px] overflow-y-auto pr-2">
                              {getQuizForModule().map((q, qIdx) => {
                                const selectedOpt = quizAnswers[qIdx];
                                
                                return (
                                  <div key={qIdx} className="bg-[#F3E4C9]/20 p-5 rounded-2xl border border-[#5C7449]/10">
                                    <h5 className="text-sm font-bold text-[#3E5C46] mb-3 flex items-start gap-2">
                                      <span className="bg-[#3E5C46]/10 text-[#3E5C46] w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{qIdx + 1}</span>
                                      <span>{q.text}</span>
                                    </h5>
                                    
                                    <div className="grid grid-cols-1 gap-2.5">
                                      {q.options.map((opt, oIdx) => {
                                        const isSelected = selectedOpt === oIdx;
                                        return (
                                          <button
                                            key={oIdx}
                                            onClick={() => selectQuizOption(qIdx, oIdx)}
                                            className={`w-full text-start p-3.5 px-4 rounded-xl border-2 transition-all text-xs font-medium ${
                                              isSelected 
                                                ? 'bg-[#3E5C46] text-[#F3E4C9] border-[#3E5C46]' 
                                                : 'bg-white hover:bg-[#F3E4C9]/40 border-[#5C7449]/10 text-[#2d2621]'
                                            }`}
                                          >
                                            {opt}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Submission and Slide navigation */}
                            <div className="flex items-center justify-between mt-8 border-t border-[#F3E4C9] pt-6">
                              <button
                                onClick={() => setCurrentSlideIndex(3)}
                                className="px-4 py-2 text-xs font-bold rounded-full bg-[#5C7449]/20 text-[#3E5C46] hover:bg-[#5C7449]/40 transition-colors flex items-center gap-1.5"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                <span>{language === 'ar' ? 'رجوع للشرائح' : 'Retour aux slides'}</span>
                              </button>

                              <button
                                onClick={submitModuleQuiz}
                                className="px-8 py-2.5 text-xs font-black bg-[#CCD67F] text-[#3E5C46] rounded-full hover:bg-[#3E5C46] hover:text-white transition-all shadow-none"
                              >
                                {language === 'ar' ? 'تقديم الإجابات وتقييم المجموع' : 'Soumettre le Quiz'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* QUIZ RESULT STATE */
                          <div className="animate-fadeIn text-center py-4">
                            <div className="max-w-md mx-auto">
                              
                              {/* Score icon state */}
                              <div className="flex justify-center mb-6">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black ${
                                  quizScore === 4 
                                    ? 'bg-[#CCD67F] text-[#3E5C46]' 
                                    : 'bg-[#3E5C46]/10 text-[#3E5C46]'
                                }`}>
                                  {quizScore} / 4
                                </div>
                              </div>

                              <h4 className="text-2xl font-black text-[#3E5C46] mb-2">
                                {quizScore === 4 
                                  ? (language === 'ar' ? 'تهانينا! علامة كاملة' : 'Félicitations ! Score Parfait')
                                  : (language === 'ar' ? 'لم تنجح هذه المرة' : 'Évaluation Non Validée')}
                              </h4>
                              
                              <p className="text-sm text-[#5C7449] mb-6 leading-relaxed">
                                {quizScore === 4
                                  ? (language === 'ar' 
                                      ? 'لقد أجبت بشكل صحيح على جميع الأسئلة. تم إدراج المقياس كمكتمل في سجل ترقيتك بنجاح.' 
                                      : 'Vous avez répondu correctement à toutes les questions. Ce module est validé et enregistré.')
                                  : (language === 'ar'
                                      ? 'يجب تحقيق النتيجة الكاملة (4/4) لتسجيل المقياس بنجاح. يرجى المراجعة والمحاولة مجدداً.'
                                      : 'Un score parfait (4/4) est requis pour valider ce module. Veuillez réviser et réessayer.')}
                              </p>

                              {/* Detailed evaluation answers check */}
                              <div className="text-start bg-[#F3E4C9]/40 p-5 rounded-2xl border border-[#5C7449]/20 mb-8 max-h-[220px] overflow-y-auto">
                                <span className="text-[10px] font-bold text-[#5C7449] uppercase block mb-3 border-b border-[#5C7449]/10 pb-1">
                                  {language === 'ar' ? 'مراجعة الأجوبة والتحليل:' : 'Détail des réponses :'}
                                </span>
                                
                                {getQuizForModule().map((q, idx) => {
                                  const isCorrect = quizAnswers[idx] === q.correctAnswer;
                                  return (
                                    <div key={idx} className="mb-3 last:mb-0 text-xs">
                                      <span className="font-bold text-[#3E5C46] block mb-1">
                                        {idx + 1}. {q.text}
                                      </span>
                                      <div className="flex flex-col gap-1 pl-3 rtl:pl-0 rtl:pr-3">
                                        <span className={`font-semibold ${isCorrect ? 'text-[#3E5C46]' : 'text-red-700'}`}>
                                          {language === 'ar' ? 'إجابتك: ' : 'Votre réponse : '} 
                                          {q.options[quizAnswers[idx]]} {isCorrect ? '✓' : '✗'}
                                        </span>
                                        {!isCorrect && (
                                          <span className="text-green-700 font-bold">
                                            {language === 'ar' ? 'الإجابة الصحيحة: ' : 'Réponse correcte : '} 
                                            {q.options[q.correctAnswer]}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Footer Actions */}
                              <div className="flex items-center justify-center gap-4">
                                {quizScore === 4 ? (
                                  <button
                                    onClick={() => {
                                      // Close Quiz Modal and launch Course Evaluation Modal
                                      setEvaluatingModule(activeModule);
                                      setShowEvaluationModal(true);
                                      setActiveModule(null);
                                    }}
                                    className="px-8 py-2.5 text-xs font-black bg-[#CCD67F] text-[#3E5C46] rounded-full hover:bg-[#3E5C46] hover:text-white transition-all"
                                  >
                                    {language === 'ar' ? 'إتمام ومتابعة لتقييم المقياس' : 'Valider & Évaluer le module'}
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setQuizSubmitted(false);
                                        setQuizAnswers({});
                                        setCurrentSlideIndex(0);
                                      }}
                                      className="px-6 py-2.5 text-xs font-bold rounded-full bg-[#5C7449]/20 text-[#3E5C46] hover:bg-[#5C7449]/40 transition-colors"
                                    >
                                      {language === 'ar' ? 'إعادة قراءة المادة' : 'Relire le cours'}
                                    </button>
                                    
                                    <button
                                      onClick={() => {
                                        setQuizSubmitted(false);
                                        setQuizAnswers({});
                                      }}
                                      className="px-8 py-2.5 text-xs font-black bg-[#CCD67F] text-[#3E5C46] rounded-full hover:bg-[#3E5C46] hover:text-white transition-all"
                                    >
                                      {language === 'ar' ? 'إعادة الاختبار' : 'Réessayer le Quiz'}
                                    </button>
                                  </>
                                )}
                              </div>

                            </div>
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                </div>
              </div>
            )}

            {/* B2B HELPDESK & FAQ DRAWER PANEL */}
            {isDrawerOpen && (
              <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs animate-fadeIn">
                {/* Clicking overlay closes drawer */}
                <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />
                
                {/* Drawer Body */}
                <div 
                  className="w-full sm:w-[480px] bg-[#fbf8f3] h-full z-10 flex flex-col relative shadow-none border-l-4 rtl:border-l-0 rtl:border-r-4 border-[#3E5C46] animate-slideIn"
                  dir={dir}
                >
                  {/* Header */}
                  <div className="p-6 bg-[#3E5C46] text-[#F3E4C9] flex items-center justify-between border-b border-[#5C7449]/20">
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className="w-5 h-5 text-[#CCD67F]" />
                      <div>
                        <h3 className="font-extrabold text-sm text-white leading-tight">
                          {language === 'ar' ? 'الدعم الفني والأسئلة الشائعة' : 'Support Technique & FAQ'}
                        </h3>
                        <span className="text-[10px] text-[#F3E4C9]/70 font-semibold block mt-0.5">
                          {language === 'ar' ? 'فضاء المساعدة والمرافقة' : 'Espace de Maintien & Assistance'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsDrawerOpen(false)}
                      className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Drawer Tab Switches */}
                  <div className="flex bg-[#F3E4C9]/40 border-b border-[#5C7449]/10">
                    <button
                      onClick={() => setDrawerTab('faq')}
                      className={`flex-1 py-4 text-xs font-bold text-center border-b-2 transition-all ${
                        drawerTab === 'faq' 
                          ? 'border-[#3E5C46] text-[#3E5C46] bg-white' 
                          : 'border-transparent text-[#5C7449] hover:bg-white/50'
                      }`}
                    >
                      {language === 'ar' ? 'الأسئلة الشائعة (FAQ)' : 'Questions Fréquentes'}
                    </button>
                    <button
                      onClick={() => setDrawerTab('support')}
                      className={`flex-1 py-4 text-xs font-bold text-center border-b-2 transition-all ${
                        drawerTab === 'support' 
                          ? 'border-[#3E5C46] text-[#3E5C46] bg-white' 
                          : 'border-transparent text-[#5C7449] hover:bg-white/50'
                      }`}
                    >
                      {language === 'ar' ? 'تذكرة الدعم والمراسلة' : 'Créer un ticket'}
                    </button>
                  </div>

                  {/* Tab Scrollable Contents */}
                  <div className="flex-grow p-6 overflow-y-auto">
                    
                    {drawerTab === 'faq' ? (
                      /* FAQ TAB CONTENT */
                      <div className="flex flex-col gap-5 animate-fadeIn">
                        
                        {/* FAQ 1 */}
                        <div className="bg-white p-5 rounded-2xl border border-[#5C7449]/10">
                          <h4 className="text-xs font-extrabold text-[#3E5C46] mb-2">
                            {language === 'ar' ? 'كيف يمكنني استخراج شهادة الترقية الرسمية؟' : 'Comment générer mon attestation de pré-promotion ?'}
                          </h4>
                          <p className="text-[11px] text-[#5C7449] leading-relaxed">
                            {language === 'ar' 
                              ? 'بمجرد إتمام دراسة كافة مقاييس المسار التكويني الخاص بك والنجاح في امتحاناتها بنسبة 100%، سيقوم النظام تلقائياً بتوليد الشهادة وعرضها في لوحة التحكم الخاصة بك للطباعة الفورية بصيغة ثنائية اللغة.' 
                              : 'Dès que vous validez l’intégralité des modules de votre parcours (progression à 100%), votre attestation officielle bilingue s’affiche automatiquement en haut du tableau de bord.'}
                          </p>
                        </div>

                        {/* FAQ 2 */}
                        <div className="bg-white p-5 rounded-2xl border border-[#5C7449]/10">
                          <h4 className="text-xs font-extrabold text-[#3E5C46] mb-2">
                            {language === 'ar' ? 'ما هي شروط النجاح في المقياس؟' : 'Quelles sont les critères de validation d’un module ?'}
                          </h4>
                          <p className="text-[11px] text-[#5C7449] leading-relaxed">
                            {language === 'ar' 
                              ? 'لكل مقياس عرض تقديمي تفاعلي متبوع باختبار من 4 أسئلة اختيار متعدد. يشترط تحقيق العلامة الكاملة (4/4) لتسجيل المقياس كمكتمل، ويمكنك إعادة المحاولة وطلب المراجعة دون حدود.' 
                              : 'Chaque module comporte un cours théorique interactif et un quiz final de 4 questions. Vous devez obtenir un score parfait de 4/4 pour valider le cours. Les tentatives sont illimitées.'}
                          </p>
                        </div>

                        {/* FAQ 3 */}
                        <div className="bg-white p-5 rounded-2xl border border-[#5C7449]/10">
                          <h4 className="text-xs font-extrabold text-[#3E5C46] mb-2">
                            {language === 'ar' ? 'لقد وجدت خطأ إملائياً في اسمي على الشهادة، ماذا أفعل؟' : 'Mon nom est mal orthographié sur l’attestation, que faire ?'}
                          </h4>
                          <p className="text-[11px] text-[#5C7449] leading-relaxed">
                            {language === 'ar' 
                              ? 'لا تقلق، يرجى كتابة تذكرة دعم فني هنا عبر التبويب المجاور تتضمن تصحيح اللقب أو الاسم باللغتين العربية والفرنسية، وسيتولى مسؤول الموارد البشرية بمؤسستك تعديلها في كشوفات الإدارة فوراً.' 
                              : 'Pas d’inquiétude. Soumettez simplement un ticket via l’onglet d’assistance en précisant la correction souhaitée. L’administrateur de votre établissement rectifiera vos données.'}
                          </p>
                        </div>

                        {/* FAQ 4 */}
                        <div className="bg-white p-5 rounded-2xl border border-[#5C7449]/10">
                          <h4 className="text-xs font-extrabold text-[#3E5C46] mb-2">
                            {language === 'ar' ? 'هل تتأثر صلاحية تقدمي إذا انتهى الموعد المحدد؟' : 'Que se passe-t-il si je dépasse la date limite ?'}
                          </h4>
                          <p className="text-[11px] text-[#5C7449] leading-relaxed">
                            {language === 'ar' 
                              ? 'الموعد المحدد هو تنظيم إداري خاص بمديرية الموارد البشرية لمؤسستك. إذا واجهت ظروفاً تمنعك من إتمام البرنامج في الوقت المحدد، يمكنك التواصل مع مشرفك لطلب تمديد الآجال دون فقدان تقدمك الحالي.' 
                              : 'La date limite est fixée par la DRH de votre établissement. En cas de retard, prenez attache avec votre administration pour prolonger les délais sans perdre votre progression.'}
                          </p>
                        </div>

                      </div>
                    ) : (
                      /* SUPPORT TICKET FORM & HISTORY */
                      <div className="flex flex-col gap-6 animate-fadeIn">
                        
                        {/* New Ticket Form */}
                        <form onSubmit={handleSubmitTicket} className="bg-white p-5 rounded-2xl border border-[#5C7449]/10 flex flex-col gap-4">
                          <h4 className="text-xs font-black text-[#3E5C46] border-b border-[#F3E4C9] pb-2">
                            {language === 'ar' ? 'إرسال تذكرة دعم فني إداري' : 'Nouveau ticket d’assistance'}
                          </h4>

                          {ticketSuccess && (
                            <div className="p-3.5 bg-[#CCD67F]/20 text-[#3E5C46] rounded-xl text-[10px] font-bold border-l-4 border-[#CCD67F]">
                              {language === 'ar' 
                                ? '✓ تم إرسال تذكرتك بنجاح إلى مشرف مؤسستك للمراجعة!' 
                                : '✓ Votre ticket a bien été transmis à votre administration !'}
                            </div>
                          )}

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-[#5C7449] font-bold">
                              {language === 'ar' ? 'الموضوع:' : 'Sujet du ticket :'}
                            </label>
                            <input
                              type="text"
                              value={ticketSubject}
                              onChange={(e) => setTicketSubject(e.target.value)}
                              placeholder={language === 'ar' ? 'مثال: خطأ في كتابة اللقب بالفرنسية' : 'Ex: Correction de l’orthographe du nom'}
                              className="underline-input py-2 text-xs text-[#3E5C46]"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-[#5C7449] font-bold">
                              {language === 'ar' ? 'نص المشكلة / الرسالة بالتفصيل:' : 'Message / Explications :'}
                            </label>
                            <textarea
                              value={ticketMessage}
                              onChange={(e) => setTicketMessage(e.target.value)}
                              placeholder={language === 'ar' ? 'اكتب تفاصيل طلبك هنا بوضوح...' : 'Décrivez votre demande en détail...'}
                              rows={3}
                              className="underline-input py-2 text-xs text-[#3E5C46]"
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmittingTicket}
                            className="mt-2 py-2 px-6 rounded-full text-xs font-black bg-[#3E5C46] text-[#F3E4C9] hover:bg-[#5C7449] disabled:bg-gray-200 transition-colors flex items-center justify-center gap-2 self-end shadow-none"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>
                              {isSubmittingTicket 
                                ? (language === 'ar' ? 'جاري الإرسال...' : 'Envoi...') 
                                : (language === 'ar' ? 'إرسال تذكرة الدعم' : 'Soumettre le ticket')}
                            </span>
                          </button>
                        </form>

                        {/* Ticket History */}
                        <div className="flex flex-col gap-3">
                          <h4 className="text-xs font-black text-[#3E5C46] border-b border-[#F3E4C9] pb-2">
                            {language === 'ar' ? 'تذاكري السابقة والمتابعة:' : 'Historique de mes demandes :'}
                          </h4>

                          {traineeTickets.length === 0 ? (
                            <p className="text-[10px] text-[#5C7449] italic py-4 text-center">
                              {language === 'ar' ? 'لا توجد تذاكر دعم فني مرسلة بعد.' : 'Aucun ticket d’assistance pour le moment.'}
                            </p>
                          ) : (
                            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                              {traineeTickets.map(t => (
                                <div key={t.id} className="p-4 bg-white rounded-xl border border-[#5C7449]/10">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-[11px] font-bold text-[#3E5C46] leading-tight max-w-[70%]">
                                      {t.subject}
                                    </span>
                                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${
                                      t.status === 'resolved' 
                                        ? 'bg-[#CCD67F]/20 text-[#3E5C46]' 
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {t.status === 'resolved' 
                                        ? (language === 'ar' ? 'تم الحل' : 'Résolu') 
                                        : (language === 'ar' ? 'قيد المراجعة' : 'En attente')}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-[#5C7449] leading-relaxed mb-2 font-medium">
                                    {t.message}
                                  </p>
                                  <span className="text-[8px] text-gray-400 font-bold block font-mono">
                                    {new Date(t.createdAt).toLocaleString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                  </div>
                </div>
              </div>
            )}

            {/* REGULATORY COURSE EVALUATION MODAL (Fiche d'évaluation) */}
            {showEvaluationModal && evaluatingModule && (
              <div className="fixed inset-0 bg-[#2d2621]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div 
                  className="w-full max-w-xl bg-[#fbf8f3] rounded-3xl overflow-hidden border-4 border-[#3E5C46] flex flex-col relative z-50 card-flat"
                  dir={dir}
                >
                  {/* Header */}
                  <div className="bg-[#3E5C46] text-[#F3E4C9] p-6 flex items-center justify-between border-b border-[#5C7449]/30">
                    <div className="flex items-center gap-2.5">
                      <Award className="w-5 h-5 text-[#CCD67F]" />
                      <div>
                        <span className="text-[9px] text-[#F3E4C9]/70 font-bold block uppercase tracking-wider">
                          {language === 'ar' ? 'استمارة تقييم جودة مقياس التكوين' : 'Fiche d’évaluation obligatoire'}
                        </span>
                        <h3 className="font-extrabold text-sm text-white leading-tight">
                          {evaluatingModule}
                        </h3>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowEvaluationModal(false)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-8">
                    
                    {evalSuccess ? (
                      /* SUCCESS STATE */
                      <div className="text-center py-6 animate-fadeIn">
                        <div className="w-16 h-16 rounded-full bg-[#CCD67F] text-[#3E5C46] text-2xl font-black flex items-center justify-center mx-auto mb-4">
                          ✓
                        </div>
                        <h4 className="text-xl font-black text-[#3E5C46] mb-2">
                          {language === 'ar' ? 'شكراً لك على تقييمك!' : 'Merci pour votre évaluation !'}
                        </h4>
                        <p className="text-xs text-[#5C7449] font-medium leading-relaxed max-w-sm mx-auto">
                          {language === 'ar' 
                            ? 'تم إرسال استمارة التقييم بنجاح وتوثيق آرائك في كشوفات جودة التكوين للمشرفين.' 
                            : 'Vos réponses ont été enregistrées avec succès et aideront à améliorer la qualité de nos cours.'}
                        </p>
                      </div>
                    ) : (
                      /* EVALUATION FORM */
                      <form onSubmit={handleSubmitEvaluation} className="flex flex-col gap-6 animate-fadeIn">
                        <p className="text-xs text-[#5C7449] leading-relaxed font-bold border-b border-[#F3E4C9] pb-3">
                          {language === 'ar' 
                            ? 'يرجى ملء استمارة التقييم التنظيمية الإلزامية لمساعدتنا على تحسين جودة المضامين والخدمة التكوينية:' 
                            : 'Veuillez évaluer la pertinence et les conditions d’apprentissage pour ce module :'}
                        </p>

                        {/* Rating row 1: Quality */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-[#3E5C46] flex justify-between">
                            <span>{language === 'ar' ? '1. جودة المحتوى التعليمي والمحاور:' : '1. Qualité pédagogique du contenu :'}</span>
                            <span className="text-[10px] text-[#5C7449] font-bold">({ratingQuality} / 5)</span>
                          </label>
                          <div className="flex gap-2" dir="ltr">
                            {[1, 2, 3, 4, 5].map((starVal) => (
                              <button
                                key={starVal}
                                type="button"
                                onClick={() => setRatingQuality(starVal)}
                                className="p-1 hover:scale-110 active:scale-95 transition-all text-[#CCD67F]"
                              >
                                <Star 
                                  className={`w-6 h-6 ${
                                    ratingQuality >= starVal 
                                      ? 'text-[#3E5C46] fill-[#3E5C46]' 
                                      : 'text-[#5C7449]/30 fill-transparent'
                                  }`} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Rating row 2: Technical */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-[#3E5C46] flex justify-between">
                            <span>{language === 'ar' ? '2. الأداء التقني للمنصة التفاعلية:' : '2. Qualité technique de la plateforme :'}</span>
                            <span className="text-[10px] text-[#5C7449] font-bold">({ratingTechnical} / 5)</span>
                          </label>
                          <div className="flex gap-2" dir="ltr">
                            {[1, 2, 3, 4, 5].map((starVal) => (
                              <button
                                key={starVal}
                                type="button"
                                onClick={() => setRatingTechnical(starVal)}
                                className="p-1 hover:scale-110 active:scale-95 transition-all text-[#CCD67F]"
                              >
                                <Star 
                                  className={`w-6 h-6 ${
                                    ratingTechnical >= starVal 
                                      ? 'text-[#3E5C46] fill-[#3E5C46]' 
                                      : 'text-[#5C7449]/30 fill-transparent'
                                  }`} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Rating row 3: General Utility */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-[#3E5C46] flex justify-between">
                            <span>{language === 'ar' ? '3. الفائدة العامة للعمل اليومي والترقية:' : '3. Utilité pratique pour votre poste :'}</span>
                            <span className="text-[10px] text-[#5C7449] font-bold">({ratingUtility} / 5)</span>
                          </label>
                          <div className="flex gap-2" dir="ltr">
                            {[1, 2, 3, 4, 5].map((starVal) => (
                              <button
                                key={starVal}
                                type="button"
                                onClick={() => setRatingUtility(starVal)}
                                className="p-1 hover:scale-110 active:scale-95 transition-all text-[#CCD67F]"
                              >
                                <Star 
                                  className={`w-6 h-6 ${
                                    ratingUtility >= starVal 
                                      ? 'text-[#3E5C46] fill-[#3E5C46]' 
                                      : 'text-[#5C7449]/30 fill-transparent'
                                  }`} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Open Comment Feedback */}
                        <div className="flex flex-col gap-1 mt-2">
                          <label className="text-xs font-bold text-[#3E5C46]">
                            {language === 'ar' ? 'ملاحظات إضافية ومقترحات لتحسين المقياس:' : 'Observations générales / Améliorations :'}
                          </label>
                          <textarea
                            value={evaluationFeedback}
                            onChange={(e) => setEvaluationFeedback(e.target.value)}
                            placeholder={language === 'ar' ? 'اكتب تعليقك هنا بكل أمانة...' : 'Écrivez votre avis honnêtement...'}
                            rows={3}
                            className="underline-input py-2 text-xs text-[#3E5C46]"
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-3 mt-4 border-t border-[#F3E4C9] pt-6">
                          <button
                            type="button"
                            onClick={() => setShowEvaluationModal(false)}
                            className="px-5 py-2 text-xs font-bold text-[#3E5C46] hover:bg-[#5C7449]/10 rounded-full transition-colors"
                          >
                            {language === 'ar' ? 'تخطي التقييم' : 'Passer'}
                          </button>
                          
                          <button
                            type="submit"
                            disabled={isSubmittingEval || ratingQuality === 0 || ratingTechnical === 0 || ratingUtility === 0}
                            className="py-2.5 px-8 rounded-full text-xs font-black bg-[#3E5C46] text-[#F3E4C9] hover:bg-[#5C7449] disabled:bg-gray-200 transition-colors shadow-none"
                          >
                            {isSubmittingEval 
                              ? (language === 'ar' ? 'جاري الحفظ...' : 'Sauvegarde...') 
                              : (language === 'ar' ? 'إرسال التقييم الرسمي' : 'Valider l’évaluation')}
                          </button>
                        </div>
                      </form>
                    )}

                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
}
