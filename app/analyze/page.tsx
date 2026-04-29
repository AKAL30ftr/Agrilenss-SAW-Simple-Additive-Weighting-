import AnalyzeInput from '@/components/AnalyzeInput';
import AnalyzeComparativeMatrix from '@/components/AnalyzeComparativeMatrix';
import AnalyzeRankingOutcomes from '@/components/AnalyzeRankingOutcomes';
import { SAWProvider } from '@/hooks/useSAW';

export default function Analyze() {
  return (
    <SAWProvider>
      <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-20">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-emerald-400 mb-2 tracking-tight">Intelligence Dashboard</h1>
          <p className="text-white/60 font-medium">Compute SAW for multi-criteria agricultural optimization.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <AnalyzeInput />
          
          {/* Results Section */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <AnalyzeComparativeMatrix />
            <AnalyzeRankingOutcomes />
          </div>
        </div>
      </div>
    </SAWProvider>
  );
}
