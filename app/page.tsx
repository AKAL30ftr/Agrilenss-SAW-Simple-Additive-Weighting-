import HeroSection from '@/components/HeroSection';
import OurMission from '@/components/OurMission';
import CoreIntelligence from '@/components/CoreIntelligence';
import SAWMethodology from '@/components/SAWMethodology';
import TargetUsers from '@/components/TargetUsers';
import SystemCapabilities from '@/components/SystemCapabilities';

export default function Home() {
  return (
    <div className="space-y-12 pb-10 w-full">
      <HeroSection />

      {/* Bento Grid Content */}
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-5">
        <OurMission />
        <CoreIntelligence />
        <SAWMethodology />
        <TargetUsers />
        <SystemCapabilities />
      </div>
    </div>
  );
}
