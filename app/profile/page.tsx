import { LogOut } from 'lucide-react';
import ProfileHeader from '@/components/ProfileHeader';
import ProfileAccountSettings from '@/components/ProfileAccountSettings';
import ProfileAppPreferences from '@/components/ProfileAppPreferences';
import ProfileSupport from '@/components/ProfileSupport';

export default function Profile() {
  return (
    <div className="max-w-[900px] mx-auto px-6 space-y-8 pt-24">
      <ProfileHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProfileAccountSettings />
        <ProfileAppPreferences />
      </div>

      <ProfileSupport />

      {/* Sign Out */}
      <div className="flex justify-center pt-6 pb-4">
        <button className="flex items-center gap-3 bg-red-500/10 text-red-400 px-8 py-4 rounded-xl border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)] font-bold tracking-wide">
          <LogOut className="w-5 h-5" />
          Sign Out Securely
        </button>
      </div>
    </div>
  );
}
