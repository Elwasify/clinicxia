import React, { useState, useEffect, useRef } from 'react';
import { Visit, ExaminationData, PrescriptionItem } from '../../types';
import { visitsApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { PrescriptionPrintView } from '../prescriptions/PrescriptionPrintView';
import { AddendumModal } from './AddendumModal';
import { VisitHistoryTimeline } from './VisitHistoryTimeline';
import { useVoiceDictation } from '../voice/useVoiceDictation';
import { useToastStore } from '../../components/ui/Toast';

export interface ExaminationFormProps {
  visit: Visit;
  patientHistory?: Visit[];
  onBack: () => void;
  onVisitUpdated: () => void;
}

export const ExaminationForm: React.FC<ExaminationFormProps> = ({
  visit,
  patientHistory = [],
  onBack,
  onVisitUpdated,
}) => {
  const isApproved = visit.examinationStatus === 'approved';
  const addToast = useToastStore((s) => s.addToast);

  // Active Tab: الكشف الحالي | التاريخ الطبي | الأدوية السابقة | التحاليل والأشعة
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'meds' | 'labs'>('current');

  // Form Fields
  const [chiefComplaint, setChiefComplaint] = useState(visit.examination?.chiefComplaint || '');
  const [diagnosis, setDiagnosis] = useState(visit.examination?.diagnosis || '');
  const [treatmentPlan, setTreatmentPlan] = useState(visit.examination?.treatmentPlan || '');
  const [followUpOption, setFollowUpOption] = useState<'finished' | 'needs_tests' | 'needs_revisit'>('needs_revisit');
  const [revisitPeriod, setRevisitPeriod] = useState('شهر');
  const [prescription, setPrescription] = useState<PrescriptionItem[]>(visit.examination?.prescription || []);

  // UI States
  const [isApproving, setIsApproving] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showAddendumModal, setShowAddendumModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Voice text insertion handler
  const handleVoiceInsert = (text: string) => {
    if (isApproved) return;
    setHasUnsavedChanges(true);
    setDiagnosis((prev) => (prev ? `${prev} ${text}` : text));
  };

  const {
    state: voiceState,
    language: voiceLang,
    setLanguage: setVoiceLang,
    errorMessage: voiceError,
    interimText,
    toggleListening,
  } = useVoiceDictation(handleVoiceInsert);

  const isListening = voiceState === 'listening';

  // Timer for voice dictation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const formattedTimer = `${String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:${String(
    recordingSeconds % 60
  ).padStart(2, '0')}`;

  const getFormData = (): ExaminationData => ({
    chiefComplaint,
    clinicalExamination: diagnosis,
    diagnosis,
    treatmentPlan,
    followUpDate: followUpOption === 'needs_revisit' ? revisitPeriod : undefined,
    additionalNotes: followUpOption === 'finished' ? 'كشف منتهي' : followUpOption === 'needs_tests' ? 'يحتاج فحص وتحاليل' : `إعادة زيارة بعد ${revisitPeriod}`,
    prescription,
  });

  // Approve & Lock
  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await visitsApi.approve(visit.id, getFormData());
      setHasUnsavedChanges(false);
      setShowApproveConfirm(false);
      addToast({
        type: 'success',
        title: 'تم الإنهاء والاعتماد',
        message: 'تم إنهاء الكشف وحفظ الملاحظات بنجاح.',
      });
      onVisitUpdated();
    } catch {
      addToast({
        type: 'error',
        title: 'خطأ',
        message: 'فشل اعتماد الكشف الطبي',
      });
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-right">
      {/* 1. Patient Header Strip matching Doctor Dashboard in Design Board */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-clinic-teal font-black text-xl shrink-0">
            {visit.patientName.charAt(0)}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-clinic-navy">{visit.patientName}</h2>
              <span className="font-mono text-sm font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {visit.patientCode}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
              <span>{visit.patientGender === 'female' ? 'أنثى' : 'ذكر'}</span>
              <span>•</span>
              <span>{visit.patientAge || '32'} سنة</span>
              <span>•</span>
              <span className="font-mono text-slate-600">{visit.patientPhone}</span>
            </div>
          </div>
        </div>

        {/* Allergy Warning Badge matching the design board */}
        <div className="flex items-center gap-3">
          {visit.drugAllergies.length > 0 ? (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold shadow-xs">
              <span className="material-symbols-outlined text-red-600 text-lg">warning</span>
              <span>حساسية من {visit.drugAllergies.join('، ')}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              لا توجد حساسيات مسجلة
            </span>
          )}

          <Button variant="outline" size="sm" onClick={onBack}>
            الرجوع للقائمة
          </Button>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-5 rounded-2xl shadow-xs">
        {[
          { id: 'current', label: 'الكشف الحالي' },
          { id: 'history', label: 'التاريخ الطبي' },
          { id: 'meds', label: 'الأدوية السابقة' },
          { id: 'labs', label: 'التحاليل والأشعة' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-clinic-teal text-clinic-teal'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: History / Meds / Labs View */}
      {activeTab !== 'current' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <VisitHistoryTimeline visits={patientHistory} currentVisitId={visit.id} />
        </div>
      )}

      {/* 3. Main Split 2-Column Layout matching Doctor Dashboard in Design Board */}
      {activeTab === 'current' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: التشخيص والملاحظات مع التسجيل الصوتي */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-clinic-navy flex items-center gap-2">
                <span className="material-symbols-outlined text-clinic-teal text-lg">
                  clinical_notes
                </span>
                <span>التشخيص والملاحظات</span>
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setVoiceLang('ar-EG')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    voiceLang === 'ar-EG'
                      ? 'bg-clinic-navy text-white'
                      : 'text-slate-500 hover:text-clinic-navy'
                  }`}
                >
                  عربي
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceLang('en-US')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    voiceLang === 'en-US'
                      ? 'bg-clinic-navy text-white'
                      : 'text-slate-500 hover:text-clinic-navy'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Circular Voice Dictation Area matching design board */}
            {!isApproved && (
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80 gap-3 text-center">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse scale-105'
                      : 'bg-clinic-teal hover:bg-clinic-teal-light text-white'
                  }`}
                  title="اضغط للتسجيل الصوتي أو استخدم اختصار F2"
                >
                  <span className="material-symbols-outlined text-3xl">mic</span>
                </button>

                <div>
                  <span className="text-xs font-bold text-slate-700 block">
                    {isListening ? 'جاري الاستماع...' : 'اضغط للتسجيل (F2)'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
                    {formattedTimer}
                  </span>
                </div>

                {/* Animated Sound Wave Graphic */}
                <div className="flex items-center gap-1 h-8 mt-1">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full bg-clinic-teal transition-all ${
                        isListening ? 'soundwave-bar' : 'h-1.5 opacity-30'
                      }`}
                      style={{
                        animationDelay: `${(i % 5) * 0.15}s`,
                      }}
                    />
                  ))}
                </div>

                {interimText && (
                  <p className="text-xs text-clinic-teal italic max-w-sm font-medium">
                    "{interimText}"
                  </p>
                )}

                {voiceError && (
                  <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded-lg border border-red-200">
                    {voiceError}
                  </p>
                )}
              </div>
            )}

            {/* Diagnosis Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                التشخيص الطبي السريري
              </label>
              <textarea
                rows={4}
                disabled={isApproved}
                value={diagnosis}
                onChange={(e) => {
                  setDiagnosis(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="أدخل التشخيص الطبي أو تحدث عبر الميكروفون أعلاه..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs leading-relaxed focus-visible:outline-3 focus-visible:outline-clinic-teal disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Right Column: خطة العلاج والروشتة */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-clinic-navy flex items-center gap-2">
                <span className="material-symbols-outlined text-clinic-teal text-lg">
                  prescriptions
                </span>
                <span>خطة العلاج والروشتة</span>
              </h3>

              {isApproved && (
                <button
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  className="text-xs font-bold text-clinic-teal hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  <span>طباعة الروشتة (A4)</span>
                </button>
              )}
            </div>

            {/* Rich text / prescription toolbar icons */}
            <div className="flex items-center gap-1 p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs">
              <button type="button" className="p-1 hover:bg-slate-200 rounded" title="عريض">
                <span className="material-symbols-outlined text-base">format_bold</span>
              </button>
              <button type="button" className="p-1 hover:bg-slate-200 rounded" title="مائل">
                <span className="material-symbols-outlined text-base">format_italic</span>
              </button>
              <button type="button" className="p-1 hover:bg-slate-200 rounded" title="قائمة">
                <span className="material-symbols-outlined text-base">format_list_bulleted</span>
              </button>
              <div className="h-4 w-px bg-slate-300 mx-1" />
              <button type="button" className="p-1 hover:bg-slate-200 rounded" title="إدراج جدول">
                <span className="material-symbols-outlined text-base">table_chart</span>
              </button>
              <button type="button" className="p-1 hover:bg-slate-200 rounded" title="أدوية جاهزة">
                <span className="material-symbols-outlined text-base">medication</span>
              </button>
            </div>

            {/* Treatment plan text area */}
            <div className="flex flex-col gap-1.5">
              <textarea
                rows={5}
                disabled={isApproved}
                value={treatmentPlan}
                onChange={(e) => {
                  setTreatmentPlan(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="اكتب الأدوية الموصوفة، الجرعات، والتعليمات الطبية هنا..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs leading-relaxed focus-visible:outline-3 focus-visible:outline-clinic-teal disabled:bg-slate-50"
              />
            </div>

            {/* Options at bottom matching the design board */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="followUpOption"
                    checked={followUpOption === 'finished'}
                    onChange={() => setFollowUpOption('finished')}
                    className="accent-clinic-teal"
                  />
                  <span>كشف منتهي</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="followUpOption"
                    checked={followUpOption === 'needs_tests'}
                    onChange={() => setFollowUpOption('needs_tests')}
                    className="accent-clinic-teal"
                  />
                  <span>يحتاج فحص</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="followUpOption"
                    checked={followUpOption === 'needs_revisit'}
                    onChange={() => setFollowUpOption('needs_revisit')}
                    className="accent-clinic-teal"
                  />
                  <span>يحتاج إعادة زيارة</span>
                </label>
              </div>

              {followUpOption === 'needs_revisit' && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">مهلة الإعادة:</span>
                  <select
                    value={revisitPeriod}
                    onChange={(e) => setRevisitPeriod(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800"
                  >
                    <option value="أسبوع">أسبوع</option>
                    <option value="أسبوعين">أسبوعين</option>
                    <option value="شهر">شهر</option>
                    <option value="شهرين">شهرين</option>
                  </select>
                </div>
              )}
            </div>

            {/* Final CTA button matching design board: إنهاء الكشف وحفظ الملاحظات ← */}
            {!isApproved ? (
              <button
                type="button"
                onClick={() => setShowApproveConfirm(true)}
                className="w-full mt-3 py-3 px-6 rounded-xl bg-clinic-teal hover:bg-clinic-teal-light active:bg-teal-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>إنهاء الكشف وحفظ الملاحظات</span>
                <span className="material-symbols-outlined text-lg rtl:rotate-180">
                  arrow_forward
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="teal"
                  size="md"
                  onClick={() => setShowPrintModal(true)}
                  className="flex-1"
                  leftIcon={<span className="material-symbols-outlined text-base">print</span>}
                >
                  طباعة الروشتة الرسمية
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowAddendumModal(true)}
                  leftIcon={<span className="material-symbols-outlined text-base">post_add</span>}
                >
                  استدراك طبي
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        title="تأكيد إنهاء واعتماد الكشف"
        description="يرجى التأكد من التشخيص والعلاج قبل الاعتماد النهائي"
        maxWidth="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowApproveConfirm(false)}>
              تراجع
            </Button>
            <Button
              variant="teal"
              size="sm"
              onClick={handleApprove}
              isLoading={isApproving}
            >
              نعم، إنهاء الكشف
            </Button>
          </>
        }
      >
        <div className="text-xs text-slate-700 space-y-2">
          <p>
            المريض: <strong className="text-clinic-navy">{visit.patientName}</strong>
          </p>
          <p>
            التشخيص: <strong className="text-clinic-teal">{diagnosis || 'تشخيص عام'}</strong>
          </p>
          <p>
            الحالة: <strong className="text-slate-800">{followUpOption === 'finished' ? 'كشف منتهي' : followUpOption === 'needs_tests' ? 'فحوصات مطلوبة' : `إعادة زيارة (${revisitPeriod})`}</strong>
          </p>
        </div>
      </Modal>

      {/* Prescription Print Modal */}
      {showPrintModal && (
        <PrescriptionPrintView
          visit={{
            ...visit,
            examination: getFormData(),
          }}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Addendum Entry Modal */}
      <AddendumModal
        isOpen={showAddendumModal}
        onClose={() => setShowAddendumModal(false)}
        visitId={visit.id}
        onAdded={onVisitUpdated}
      />
    </div>
  );
};
