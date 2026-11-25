import React, { useState } from 'react';
import { PrescriptionItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export interface PrescriptionEditorProps {
  items: PrescriptionItem[];
  onChange: (items: PrescriptionItem[]) => void;
  isReadOnly?: boolean;
}

export const PrescriptionEditor: React.FC<PrescriptionEditorProps> = ({
  items,
  onChange,
  isReadOnly = false,
}) => {
  const [drugName, setDrugName] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugName.trim()) return;

    const newItem: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      drugName: drugName.trim(),
      dose: dose.trim() || 'قرص واحد',
      frequency: frequency.trim() || 'مرتين يومياً',
      duration: duration.trim() || 'أسبوع',
      instructions: instructions.trim() || 'بعد الأكل مع الماء',
    };

    onChange([...items, newItem]);
    setDrugName('');
    setDose('');
    setFrequency('');
    setDuration('');
    setInstructions('');
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col gap-4 text-right">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-clinic-navy flex items-center gap-1.5">
          <span className="material-symbols-outlined text-clinic-teal text-lg">
            medication
          </span>
          <span>الروشتة الدوائية الموصوفة (Rx)</span>
        </h4>
        <span className="text-[11px] font-mono text-slate-500">
          عدد الأدوية: {items.length}
        </span>
      </div>

      {/* Add Item Row (if not read-only) */}
      {!isReadOnly && (
        <form
          onSubmit={handleAddItem}
          className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end text-xs"
        >
          <div className="sm:col-span-2">
            <Input
              label="اسم الدواء والتركيز"
              placeholder="مثال: Nexium 40mg"
              value={drugName}
              onChange={(e) => setDrugName(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              label="الجرعة"
              placeholder="قرص واحد"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
            />
          </div>
          <div>
            <Input
              label="التكرار"
              placeholder="مرتين يومياً"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />
          </div>
          <div>
            <Button type="submit" variant="teal" size="sm" className="w-full">
              + إضافة للدواء
            </Button>
          </div>
        </form>
      )}

      {/* Items List Table */}
      {items.length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          لم يتم إدراج أي أدوية في هذه الروشتة بعد.
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                <th className="p-2.5 pe-3">#</th>
                <th className="p-2.5">اسم الدواء</th>
                <th className="p-2.5">الجرعة والتكرار</th>
                <th className="p-2.5">المدة والتعليمات</th>
                {!isReadOnly && <th className="p-2.5 ps-3 text-center">حذف</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  <td className="p-2.5 pe-3 font-mono font-bold text-slate-400">
                    {index + 1}
                  </td>
                  <td className="p-2.5 font-bold text-clinic-navy ltr-text">
                    {item.drugName}
                  </td>
                  <td className="p-2.5 text-slate-700">
                    {item.dose} • {item.frequency}
                  </td>
                  <td className="p-2.5 text-slate-600">
                    {item.duration && <span>{item.duration}</span>}
                    {item.instructions && (
                      <span className="block text-[11px] text-slate-400">
                        {item.instructions}
                      </span>
                    )}
                  </td>
                  {!isReadOnly && (
                    <td className="p-2.5 ps-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="text-slate-400 hover:text-red-600 cursor-pointer"
                        title="حذف"
                      >
                        <span className="material-symbols-outlined text-base">
                          delete
                        </span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
