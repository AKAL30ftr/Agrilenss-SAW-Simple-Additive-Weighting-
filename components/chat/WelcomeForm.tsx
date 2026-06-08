'use client';

interface WelcomeFormProps {
  formName: string;
  formGender: 'laki' | 'perempuan' | '';
  onFormNameChange: (value: string) => void;
  onFormGenderChange: (value: 'laki' | 'perempuan') => void;
  onSubmit: () => void;
}

export default function WelcomeForm({
  formName,
  formGender,
  onFormNameChange,
  onFormGenderChange,
  onSubmit,
}: WelcomeFormProps) {
  return (
    <div className="flex gap-2 max-w-[92%]">
      <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-emerald-400"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
      </div>
      <div className="rounded-2xl rounded-tl-sm p-3 border shadow-lg bg-white/10 backdrop-blur-md border-white/10 w-full">
        <div className="space-y-3">
          <div>
            <label htmlFor="form-nama" className="block text-xs text-white/60 mb-1 font-medium">Nama <span className="text-red-400">*</span></label>
            <input
              id="form-nama"
              type="text"
              value={formName}
              onChange={(e) => onFormNameChange(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-2 font-medium">Jenis Kelamin</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onFormGenderChange('laki')}
                className={`flex-1 text-sm px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${formGender === 'laki' ? 'bg-emerald-400/20 border-emerald-400/50 text-emerald-200' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
              >
                Laki-laki
              </button>
              <button
                type="button"
                onClick={() => onFormGenderChange('perempuan')}
                className={`flex-1 text-sm px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${formGender === 'perempuan' ? 'bg-emerald-400/20 border-emerald-400/50 text-emerald-200' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
              >
                Perempuan
              </button>
            </div>
          </div>
          <button
            onClick={onSubmit}
            disabled={!formName.trim()}
            className="w-full text-sm px-4 py-3 rounded-lg bg-emerald-400 text-black font-bold hover:bg-emerald-300 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Mulai Konsultasi
          </button>
        </div>
      </div>
    </div>
  );
}
