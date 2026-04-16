'use client';
import { useState, useRef, useEffect } from 'react';
import { CrisisState, SOSCluster } from '@/lib/types';

type Message = { role: 'ai' | 'user'; text: string };

type Props = {
  crisisState: CrisisState;
  selectedCluster: SOSCluster | null;
};

export default function CrisisGPT({ crisisState, selectedCluster }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCluster) analyze();
  }, [selectedCluster?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function analyze(query?: string) {
    setLoading(true);
    setApproved(false);
    try {
      const res = await fetch('/api/crisisgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crisisState,
          userQuery: query || `Analyze Cluster ${selectedCluster?.id} and recommend dispatch.`,
        }),
      });
      const data = await res.json();
      if (query) {
        setMessages((m) => [
          ...m,
          { role: 'user', text: query },
          { role: 'ai', text: data.response },
        ]);
      } else {
        setMessages([{ role: 'ai', text: data.response }]);
      }
    } catch {
      setMessages([{ role: 'ai', text: 'Error connecting to CrisisGPT.' }]);
    }
    setLoading(false);
  }

  function handleSend() {
    if (!input.trim() || loading) return;
    const q = input;
    setInput('');
    analyze(q);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-3 py-2 border-b border-gray-800 flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-widest">CrisisGPT</span>
        <span className="text-xs text-gray-600">Llama 3.3 · Groq</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {messages.length === 0 && (
          <p className="text-xs text-gray-600 italic">Select a cluster to analyze...</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-xs rounded-lg p-2.5 leading-relaxed ${
              m.role === 'ai'
                ? 'bg-blue-950 border border-blue-900 text-blue-100'
                : 'bg-gray-800 text-gray-300 ml-4'
            }`}
          >
            {m.role === 'ai' && (
              <span className="text-blue-400 font-bold text-xs block mb-1">CRISISGPT</span>
            )}
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="bg-gray-800 rounded-lg p-2.5 flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {messages.length > 0 && !approved && (
        <button
          onClick={() => setApproved(true)}
          className="mx-3 mb-2 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
        >
          ✓ Approve Dispatch
        </button>
      )}
      {approved && (
        <div className="mx-3 mb-2 py-2 bg-green-900 text-green-300 text-xs font-bold rounded-lg text-center">
          ✓ Dispatched
        </div>
      )}
      <div className="flex gap-2 p-3 border-t border-gray-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask CrisisGPT..."
          className="flex-1 bg-gray-800 text-xs text-white rounded-lg px-3 py-2 outline-none border border-gray-700 focus:border-blue-600"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-xs rounded-lg transition-colors disabled:opacity-40"
        >
          Ask
        </button>
      </div>
    </div>
  );
}