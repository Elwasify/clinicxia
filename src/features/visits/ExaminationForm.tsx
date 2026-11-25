import React, { useState, useEffect, useRef } from 'react';
import { Visit, ExaminationData, PrescriptionItem } from '../../types';
import { visitsApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PatientAlertsBanner } from '../patients/PatientAlertsBanner';
import { PrescriptionEditor } from '../prescriptions/PrescriptionEditor';
import { PrescriptionPrintView } from '../prescriptions/PrescriptionPrintView';
import { AddendumModal } from './AddendumModal';
import { VisitHistoryTimeline } from './VisitHistoryTimeline';
import { VoiceMicButton } from '../voice/VoiceMicButton';
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

  // Form Fields
  const [chiefComplaint, setChiefComplaint] = useState(visit.examination?.chiefComplaint || '');
  const [clinicalExamination, setClinicalExamination] = useState(visit.examination?.clinicalExamination || '');
  const [diagnosis, setDiagnosis] = useState(visit.examination?.diagnosis || '');
  const [treatmentPlan, setTreatmentPlan] = useState(visit.examination?.treatmentPlan || '');
  const [followUpDate, setFollowUpDate] = useState(visit.examination?.followUpDate || '');
  const [additionalNotes, setAdditionalNotes] = useState(visit.examination?.additionalNotes || '');
  const [prescription, setPrescription] = useState<PrescriptionItem[]>(visit.examination?.prescription || []);

  // UI States
  const [activeField, setActiveField] = useState<string>('chiefComplaint');
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showAddendumModal, setShowAddendumModal] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [selectedHistoryVisit, setSelectedHistoryVisit] = useState<Visit | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Undo history for speech insertion
  const lastInsertedRef = useRef<{ field: string; text: string } | null>(null);

  // Unsaved changes beforeunload guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isApproved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isApproved]);

  // Voice text insertion handler
  const handleVoiceInsert = (text: string) => {
    if (isApproved) return;
    lastInsertedRef.current = { field: activeField, text };
    setHasUnsavedChanges(true);

    const append = (current: string) => (current ? `${current} ${text}` : text);

    switch (activeField) {
      case 'chiefComplaint':
        setChiefComplaint((prev) => append(prev));
        break;
      case 'clinicalExamination':
        setClinicalExamination((prev) => append(prev));
        break;
      case 'diagnosis':
        setDiagnosis((prev) => append(prev));
        break;
      case 'treatmentPlan':
        setTreatmentPlan((prev) => append(prev));
        break;
      case 'additionalNotes':
        setAdditionalNotes((prev) => append(prev));
        break;
      default:
        setChiefComplaint((prev) => append(prev));
    }
  };

  const handleUndoSpeech = () => {
    if (!lastInsertedRef.current) return;
    const { field, text } = lastInsertedRef.current;
    const removeLast = (current: string) => current.replace(text, '').trim();

    switch (field) {
      case 'chiefComplaint':
        setChiefComplaint((prev) => removeLast(prev));
        break;
      case 'clinicalExamination':
        setClinicalExamination((prev) => removeLast(prev));
        break;
      case 'diagnosis':
        setDiagnosis((prev) => removeLast(prev));
        break;
      case 'treatmentPlan':
        setTreatmentPlan((prev) => removeLast(prev));
        break;
      case 'additionalNotes':
        setAdditionalNotes((prev) => removeLast(prev));
        break;
    }
    lastInsertedRef.current = null;
    addToast({ type: 'info', message: 'تم التراجع عن آخر إملاء صوتي' });
  };

  const {
    state: voiceState,
    language: voiceLang,
    setLanguage: setVoiceLang,
    errorMessage: voiceError,
    interimText,
    toggleListening,
  } = useVoiceDictation(handleVoiceInsert);

  const getFormData = (): ExaminationData => ({
    chiefComplaint,
    clinicalExamination,
    diagnosis,
    treatmentPlan,
    followUpDate,
    additionalNotes,
    prescription,
  });

  // Explicit Save Draft
  const handleSaveDraft = async () => {
    if (isApproved) return;
    setIsSaving(true);
    try {
      await visitsApi.saveDraft(visit.id, getFormData());
      setHasUnsavedChanges(false);
      addToast({
        type: 'success',
        title: 'تم الحفظ',
        message: 'تم حفظ مسودة الكشف الطبي بنجاح.',
      });
      onVisitUpdated();
    } catch {
      addToast({
        type: 'error',
        title: 'فشل الحفظ',
        message: 'تعذر حفظ المسودة، تم الاحتفاظ ببياناتك على الشاشة لإعادة المحاولة.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced Autosave (every 10s if unsaved changes exist)
  useEffect(() => {
    if (!hasUnsavedChanges || isApproved) return;
    const timer = setTimeout(() => {
      visitsApi.saveDraft(visit.id, getFormData()).then(() => {
        setHasUnsavedChanges(false);
      });
    }, 10000);
    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, isApproved, chiefComplaint, clinicalExamination, diagnosis, treatmentPlan, followUpDate, additionalNotes, prescription]);

  // Approve & Lock
  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await visitsApi.approve(visit.id, getFormData());
      setHasUnsavedChanges(false);
      setShowApproveConfirm(false);
      addToast({
        type: 'success',
        title: 'تم الاعتماد والإنهاء',
        message: 'تم قفل الكشف الطبي بنجاح وأصبح معتمداً ومتاحاً للطباعة.',
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
    <div className="flex flex-col gap-5 text-right">
      {/* Top Patient Header Strip */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-clinic-navy">
              كشف: {visit.patientName}
            </h2>
            <Badge variant={isApproved ? 'approved' : 'draft'}>
              {isApproved ? 'كشف معتمد (مقفل)' : 'مسودة قيد التحرير'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            كود: {visit.patientCode} • الدور: {visit.queueNumber} • السن: {visit.patientAge || '—'} سنة • وقت الحضور: {visit.arrivalTime}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isApproved ? (
            <>
              <Button
                variant="teal"
                size="sm"
                onClick={() => setShowPrintModal(true)}
                leftIcon={<span className="material-symbols-outlined text-base">print</span>}
              >
                طباعة الروشتة (A4)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddendumModal(true)}
                leftIcon={<span className="material-symbols-outlined text-base">post_add</span>}
              >
                إضافة استدراك طبي
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                isLoading={isSaving}
                leftIcon={<span className="material-symbols-outlined text-base">save</span>}
              >
                حفظ مسودة
              </Button>
              <Button
                variant="teal"
                size="sm"
                onClick={() => setShowApproveConfirm(true)}
                leftIcon={<span className="material-symbols-outlined text-base">verified</span>}
              >
                اعتماد وإنهاء الكشف
              </Button>
            </>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            leftIcon={<span className="material-symbols-outlined text-base">history</span>}
          >
            {showHistoryPanel ? 'إخفاء السجل' : 'السجل السابق'}
          </Button>

          <Button variant="ghost" size="sm" onClick={onBack}>
            الرجوع للطابور
          </Button>
        </div>
      </div>

      {/* Prominent Allergy & Chronic Warning Banner */}
      <PatientAlertsBanner
        allergies={visit.drugAllergies}
        chronicDiseases={visit.chronicDiseases}
      />

      {/* Main Grid: Form + Optional Collapsible History */}
      <div className={`grid gap-6 ${showHistoryPanel ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
        {/* Examination Form Columns */}
        <div className={`flex flex-col gap-5 ${showHistoryPanel ? 'lg:col-span-2' : ''}`}>
          {/* Voice Toolbar (Only shown to doctor in edit mode) */}
          {!isApproved && (
            <div className="bg-white p-3.5 rounded-xl border border-teal-200/80 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-clinic-teal text-xl">
                  mic
                </span>
                <span className="font-bold text-clinic-navy">التوثيق الصوتي الذكي:</span>
                <span className="text-slate-500">
                  الحقل النشط: [
                  <strong className="text-clinic-teal">
                    {activeField === 'chiefComplaint'
                      ? 'الشكوى'
                      : activeField === 'clinicalExamination'
                      ? 'الفحص'
                      : activeField === 'diagnosis'
                      ? 'التشخيص'
                      : activeField === 'treatmentPlan'
                      ? 'العلاج'
                      : 'ملاحظات'}
                  </strong>
                  ]
                </span>
              </div>

              <div className="flex items-center gap-2">
                {lastInsertedRef.current && (
                  <button
                    type="button"
                    onClick={handleUndoSpeech}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    تراجع عن الإملاء
                  </button>
                )}
                <VoiceMicButton
                  state={voiceState}
                  onToggle={toggleListening}
                  language={voiceLang}
                  onLanguageChange={setVoiceLang}
                  errorMessage={voiceError}
                  interimText={interimText}
                />
              </div>
            </div>
          )}

          {/* Form Fields Cards */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
            {/* 1. Chief Complaint */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-clinic-navy flex items-center justify-between">
                <span>1. الشكوى الرئيسية وتاريخ المرض الحالي (Chief Complaint)</span>
                <span className="text-[11px] text-slate-400 font-normal">كتابة حرة / إملاء</span>
              </label>
              <textarea
                rows={3}
                disabled={isApproved}
                value={chiefComplaint}
                onFocus={() => setActiveField('chiefComplaint')}
                onChange={(e) => {
                  setChiefComplaint(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="أدخل وصف الشكوى وأعراض المريض بالتفصيل..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs leading-relaxed focus-visible:outline-3 focus-visible:outline-clinic-teal disabled:bg-slate-50 disabled:text-slate-700"
              />
            </div>

            {/* 2. Clinical Examination */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-clinic-navy flex items-center justify-between">
                <span>2. الفحص الإكلينيكي والعلامات الحيوية (Clinical Examination)</span>
                <span className="text-[11px] text-slate-400 font-normal">الضغط، النبض، فحص البطن</span>
              </label>
              <textarea
                rows={3}
                disabled={isApproved}
                value={clinicalExamination}
                onFocus={() => setActiveField('clinicalExamination')}
                onChange={(e) => {
                  setClinicalExamination(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="نتائج الكشف السريري والجسدي..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs leading-relaxed focus-visible:outline-3 focus-visible:outline-clinic-teal disabled:bg-slate-50 disabled:text-slate-700"
              />
            </div>

            {/* 3. Diagnosis */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-clinic-navy flex items-center justify-between">
                <span>3. التشخيص الطبي المعتمد (Diagnosis) *</span>
                <span className="text-[11px] text-red-500 font-normal">مطلوب للاعتماد</span>
              </label>
              <textarea
                rows={2}
                disabled={isApproved}
                value={diagnosis}
                onFocus={() => setActiveField('diagnosis')}
                onChange={(e) => {
                  setDiagnosis(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="التشخيص الطبي الأولي أو النهائي..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs font-semibold leading-relaxed focus-visible:outline-3 focus-visible:outline-clinic-teal disabled:bg-slate-50 disabled:text-slate-700"
              />
            </div>

            {/* 4. Treatment Plan */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-clinic-navy">
                4. الخطة العلاجية والتعليمات الغذائية (Treatment Plan)
              </label>
              <textarea
                rows={2}
                disabled={isApproved}
                value={treatmentPlan}
                onFocus={() => setActiveField('treatmentPlan')}
                onChange={(e) => {
                  setTreatmentPlan(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="إرشادات الحمية الغذائية، التحاليل المطلوبة، مواعيد الجرعات..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs leading-relaxed focus-visible:outline-3 focus-visible:outline-clinic-teal disabled:bg-slate-50 disabled:text-slate-700"
              />
            </div>

            {/* 5. Prescription Component */}
            <div className="pt-2 border-t border-slate-100">
              <PrescriptionEditor
                items={prescription}
                onChange={(newItems) => {
                  setPrescription(newItems);
                  setHasUnsavedChanges(true);
                }}
                isReadOnly={isApproved}
              />
            </div>

            {/* 6. Follow-up & Additional Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-clinic-navy">
                  6. موعد الإعادة والمتابعة (Follow-up Date)
                </label>
                <input
                  type="date"
                  disabled={isApproved}
                  value={followUpDate}
                  onChange={(e) => {
                    setFollowUpDate(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="rounded-xl border border-slate-300 p-2.5 text-xs focus-visible:outline-3 focus-visible:outline-clinic-teal disabled:bg-slate-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-clinic-navy">
                  7. ملاحظات إضافية وتوصيات سريرية
                </label>
                <input
                  type="text"
                  disabled={isApproved}
                  value={additionalNotes}
                  onFocus={() => setActiveField('additionalNotes')}
                  onChange={(e) => {
                    setAdditionalNotes(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="أي ملاحظات موجهة أو احترازية..."
                  className="rounded-xl border border-slate-300 p-2.5 text-xs focus-visible:outline-3 focus-visible:outline-clinic-teal disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Documented Addenda List (if any) */}
            {visit.addenda && visit.addenda.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex flex-col gap-2.5">
                <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-700 text-lg">
                    verified
                  </span>
                  <span>الاستدراكات الطبية الموثقة رسمياً:</span>
                </h5>
                <div className="divide-y divide-amber-200/60">
                  {visit.addenda.map((add) => (
                    <div key={add.id} className="py-2 text-xs">
                      <p className="text-slate-800 font-medium">{add.note}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        بواسطة: {add.authorName} • {add.createdAt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible History Side Panel & Comparison View */}
        {showHistoryPanel && (
          <div className="flex flex-col gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-xs font-bold text-clinic-navy flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-clinic-teal text-lg">
                    history
                  </span>
                  <span>السجل الطبي السابق للمريض</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowHistoryPanel(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <VisitHistoryTimeline
                visits={patientHistory}
                currentVisitId={visit.id}
                onSelectVisit={(v) => setSelectedHistoryVisit(v)}
              />
            </div>

            {/* Comparison Card (Selected past visit vs current) */}
            {selectedHistoryVisit && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs flex flex-col gap-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-clinic-navy">
                    معاينة كشف سابق: {selectedHistoryVisit.examination?.updatedAt?.split('T')[0] || selectedHistoryVisit.arrivalTime}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedHistoryVisit(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    إغلاق
                  </button>
                </div>
                <p>
                  <strong className="text-slate-600 block">التشخيص السابق:</strong>
                  {selectedHistoryVisit.examination?.diagnosis || '—'}
                </p>
                <p>
                  <strong className="text-slate-600 block">العلاج السابق:</strong>
                  {selectedHistoryVisit.examination?.treatmentPlan || '—'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        title="تأكيد اعتماد وإنهاء الكشف الطبي"
        description="يرجى مراجعة التشخيص والروشتة قبل الاعتماد النهائي"
        maxWidth="sm"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowApproveConfirm(false)}
            >
              مواصلة التعديل
            </Button>
            <Button
              type="button"
              variant="teal"
              size="sm"
              onClick={handleApprove}
              isLoading={isApproving}
            >
              تأكيد الاعتماد والقفل
            </Button>
          </>
        }
      >
        <div className="text-xs text-slate-700 space-y-2">
          <p>
            المريض: <strong className="text-clinic-navy">{visit.patientName}</strong>
          </p>
          <p>
            التشخيص المسجل: <strong className="text-clinic-teal">{diagnosis || 'لم يسجل تشخيص'}</strong>
          </p>
          <p>عدد الأدوية الموصوفة: {prescription.length} أدوية</p>
          <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-[11px]">
            تنبيه: بعد الاعتماد، لن يمكن تعديل نص الكشف مباشرة حرصاً على مصداقية السجلات الطبية. أي تصحيح لاحق سيكون عبر استدراك موثق.
          </div>
        </div>
      </Modal>

      {/* Prescription A4 Print Modal */}
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
