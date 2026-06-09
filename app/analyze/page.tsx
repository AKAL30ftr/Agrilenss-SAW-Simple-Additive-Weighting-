import ChatWidget from '@/components/ChatWidget';

export default function Analyze() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="glass-card rounded-2xl overflow-hidden" style={{ height: '70vh', minHeight: '500px' }}>
        <ChatWidget fullPage />
      </div>
    </div>
  );
}
