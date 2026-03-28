'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Send, ArrowLeft, Globe, AlertTriangle, RefreshCw, ChevronDown, Cpu } from 'lucide-react';
import { useChatStore } from '@/store/chat';
import { extractRisk, cleanResponseText, RiskInfo } from '@/lib/risk';
import Link from 'next/link';

const SYMPTOM_CHIPS_EN = [
  { label: '🤕 Headache', value: 'I have a bad headache' },
  { label: '🦶 Swollen feet', value: 'My feet and ankles are very swollen' },
  { label: '🩸 Bleeding', value: 'I am experiencing vaginal bleeding' },
  { label: '👶 Baby not moving', value: 'My baby has not been moving for a while' },
  { label: '🌡️ Fever', value: 'I have a high fever' },
  { label: '👁️ Blurred vision', value: 'My vision is blurry and I have a headache' },
  { label: '🤢 Nausea', value: 'I feel very nauseous and want to vomit' },
  { label: '💊 Back pain', value: 'I have severe back pain' },
  { label: '💔 Chest pain', value: 'I have chest pain and difficulty breathing' },
  { label: '😵 Dizziness', value: 'I feel very dizzy and weak' },
  { label: '💧 Discharge', value: 'I have unusual discharge' },
  { label: '⚡ Contractions', value: 'I am having strong contractions' },
];

const SYMPTOM_CHIPS_TW = [
  { label: '🤕 Ti haw', value: 'Mewɔ ti haw a ɛyɛ den' },
  { label: '🦶 Nan ho', value: "M'anan ne m'anim ho" },
  { label: '🩸 Mogya firi', value: 'Mogya refiri me ho' },
  { label: '👶 Onipa ketewa', value: "M'onipa ketewa nni mu" },
  { label: '🌡️ Ohu', value: 'Mewɔ ohu a ɛyɛ den' },
  { label: '👁️ Ani nni ho', value: "M'aniwa nni hɔ yiye" },
  { label: '🤢 Ahohora', value: 'Mewɔ ahohora a ɛyɛ den' },
  { label: '💊 Akyi haw', value: "M'akyi yɛ me ya" },
  { label: '💔 Yafunu haw', value: "M'yafunu yɛ me ya" },
  { label: '😵 Tiri san san', value: "M'eti san san" },
  { label: '💨 Home den', value: 'Home yɛ me den' },
  { label: '⚡ Aniantan', value: 'Mewɔ aniantan' },
];

const RISK_STYLES: Record<string, { banner: string; badge: string; border: string; text: string }> = {
  LOW:      { banner: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-800 border-green-300', border: 'border-green-200', text: 'text-green-700' },
  MEDIUM:   { banner: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-800 border-amber-300', border: 'border-amber-200', text: 'text-amber-700' },
  HIGH:     { banner: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-800 border-orange-300', border: 'border-orange-200', text: 'text-orange-700' },
  CRITICAL: { banner: 'bg-red-50 border-red-300', badge: 'bg-red-100 text-red-900 border-red-400', border: 'border-red-300', text: 'text-red-800' },
  UNKNOWN:  { banner: 'bg-gray-50 border-gray-200', badge: 'bg-gray-100 text-gray-600 border-gray-200', border: 'border-gray-200', text: 'text-gray-600' },
};

function RiskBanner({ risk }: { risk: RiskInfo }) {
  const styles = RISK_STYLES[risk.level] || RISK_STYLES.UNKNOWN;
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 border-b ${styles.banner} ${risk.pulse ? 'animate-pulse' : ''}`}>
      <div className="flex items-center gap-2">
        <span className="text-base">{risk.emoji}</span>
        <div>
          <p className={`text-xs font-bold ${styles.text}`}>
            {risk.label} RISK
          </p>
          {risk.requiresEscalation && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
              <AlertTriangle size={10} /> Seek medical care immediately
            </p>
          )}
        </div>
      </div>
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles.badge}`}>
        Active Assessment
      </span>
    </div>
  );
}

function MessageBubble({ message }: { message: { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; risk?: RiskInfo } }) {
  const isUser = message.role === 'user';
  const styles = message.risk ? (RISK_STYLES[message.risk.level] || RISK_STYLES.UNKNOWN) : null;

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-sm"
          style={{ background: '#B5451B' }}
        >
          🤱
        </div>
      )}

      <div className={`max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Risk badge inline for assistant */}
        {message.risk && styles && (
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border mb-1.5 ${styles.badge} ${message.risk.pulse ? 'animate-pulse' : ''}`}>
            {message.risk.emoji} {message.risk.label}
          </span>
        )}

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'text-white rounded-br-none'
              : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
          }`}
          style={isUser ? { background: '#B5451B' } : {}}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-400 mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialLang = (searchParams.get('lang') as 'en' | 'tw') || 'en';

  const {
    messages,
    currentRisk,
    isLoading,
    language,
    sessionId,
    selectedModel,
    addMessage,
    setLoading,
    setLanguage,
    setCurrentRisk,
    setSessionId,
    setSelectedModel,
    clearChat,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLanguage(initialLang);
  }, [initialLang, setLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Load available Ollama models on mount
  useEffect(() => {
    fetch('/api/models')
      .then((r) => r.json())
      .then((data) => {
        if (data.models?.length) {
          setAvailableModels(data.models.map((m: { name: string; label?: string }) => m.name));
          if (data.default) setSelectedModel(data.default);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const symptoms = language === 'tw' ? SYMPTOM_CHIPS_TW : SYMPTOM_CHIPS_EN;

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: text.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    setLoading(true);
    setStreamingText('');

    const conversationHistory = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory, language, sessionId, model: selectedModel }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let finalRisk: RiskInfo | null = null;
      let finalSessionId: string | null = null;
      let apiError: string | null = null;

      if (!reader) throw new Error('No stream available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'delta') {
              fullText += data.text;
              setStreamingText(fullText);
              // Update risk badge immediately when tag appears in stream
              const streamRisk = extractRisk(fullText);
              if (streamRisk.level !== 'UNKNOWN') {
                setCurrentRisk(streamRisk);
              }
            } else if (data.type === 'done') {
              finalRisk = data.risk;
              finalSessionId = data.sessionId;
            } else if (data.type === 'error') {
              // ← Bug fix: handle API error events
              apiError = data.message || 'An error occurred. Please try again.';
            }
          } catch {
            // ignore parse errors on partial chunks
          }
        }
      }

      const content = apiError
        ? apiError
        : cleanResponseText(fullText) || 'I was unable to process your request. Please try again.';

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content,
        timestamp: new Date(),
        risk: apiError ? undefined : (finalRisk || undefined),
      };

      addMessage(assistantMessage);
      if (finalRisk && !apiError) setCurrentRisk(finalRisk);
      if (finalSessionId) setSessionId(finalSessionId);
    } catch {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'I had trouble connecting. Please check your internet connection and try again.',
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
      setStreamingText('');
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'tw' : 'en';
    setLanguage(newLang);
    router.push(`/chat?lang=${newLang}`);
  };

  const placeholder =
    language === 'tw'
      ? 'Ka sɛ wo ho te sɛn... (Twi anaa Broni kasa)'
      : 'Describe how you feel... e.g. "I am 7 months pregnant with a bad headache and blurred vision"';

  return (
    <div className="flex flex-col h-dvh" style={{ background: '#F5F0EB' }}>
      {/* Header */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4 py-3"
        style={{ background: '#B5451B' }}
      >
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white/70 hover:text-white transition-colors p-1">
            <ArrowLeft size={18} />
          </Link>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
            🤱
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-none">MomAlert</h1>
            <p className="text-white/60 text-xs mt-0.5">
              {language === 'tw' ? 'Wo Ahoɔden Agyinamdie' : 'Maternal Health Companion'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model picker */}
          <div className="relative">
            <button
              onClick={() => setShowModelPicker((v) => !v)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/15 text-white text-xs font-medium hover:bg-white/25 transition-colors border border-white/20"
            >
              <Cpu size={11} />
              <span className="max-w-[100px] truncate">{selectedModel.includes('deepseek') ? 'DeepSeek' : selectedModel.includes('gemma') ? 'Gemma' : selectedModel.includes('mistral') ? 'Mistral' : selectedModel.split(':')[0]}</span>
              <ChevronDown size={10} />
            </button>
            {showModelPicker && availableModels.length > 0 && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 min-w-[160px]">
                <p className="text-xs text-gray-400 px-3 pt-2 pb-1 font-medium">Ollama Cloud models</p>
                {availableModels.map((m) => (
                  <button
                    key={m}
                    onClick={() => { setSelectedModel(m); setShowModelPicker(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between gap-2 ${m === selectedModel ? 'font-semibold' : ''}`}
                    style={m === selectedModel ? { color: '#B5451B' } : { color: '#374151' }}
                  >
                    <span>{m.includes('deepseek') ? 'DeepSeek V3.1 671B' : m.includes('gemma') ? 'Gemma 3 27B' : m.includes('mistral-large') ? 'Mistral Large 675B' : m}</span>
                    {m === selectedModel && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {messages.length > 0 && (
            <button
              onClick={() => { clearChat(); router.push(`/chat?lang=${language}`); }}
              className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/15 transition-colors"
              title="New session"
            >
              <RefreshCw size={15} />
            </button>
          )}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold hover:bg-white/25 transition-colors border border-white/20"
          >
            <Globe size={11} />
            {language === 'en' ? '🇬🇧 EN' : '🇬🇭 TW'}
          </button>
        </div>
      </header>

      {/* Risk Banner — shows when risk is assessed */}
      {currentRisk && currentRisk.level !== 'UNKNOWN' && (
        <div className="flex-shrink-0">
          <RiskBanner risk={currentRisk} />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-sm" style={{ background: '#F5E6DF' }}>
              💛
            </div>
            <div>
              <p className="text-gray-700 font-semibold text-base">
                {language === 'tw' ? 'Akwaaba. Wɔ dɛn na ɛyɛ wo ya?' : 'Hello. How are you feeling?'}
              </p>
              <p className="text-gray-400 text-sm mt-1 max-w-xs">
                {language === 'tw'
                  ? 'Tap chip biara anaa ka wo ho sɛn'
                  : 'Tap a symptom below or describe how you feel in your own words'}
              </p>
            </div>

            {/* Feature hints */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs mt-2">
              {[
                { icon: '🚨', text: '4-level risk triage' },
                { icon: '🌍', text: 'English & Twi' },
                { icon: '💬', text: 'Plain language' },
                { icon: '🏥', text: 'CHW alerts' },
              ].map((f) => (
                <div key={f.text} className="bg-white/70 rounded-xl px-3 py-2.5 flex items-center gap-2 text-xs text-gray-600 border border-gray-100">
                  <span>{f.icon}</span> {f.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Streaming bubble */}
        {isLoading && streamingText && (
          <div className="flex items-end gap-2">
            <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-sm" style={{ background: '#B5451B' }}>
              🤱
            </div>
            <div className="max-w-[78%] bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100">
              <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                {cleanResponseText(streamingText)}
                <span className="inline-block w-0.5 h-4 ml-0.5 bg-gray-400 animate-pulse rounded-sm align-middle" />
              </p>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isLoading && !streamingText && (
          <div className="flex items-end gap-2">
            <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-sm" style={{ background: '#B5451B' }}>
              🤱
            </div>
            <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1 items-center h-4">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: '#B5451B', animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Symptom Chips */}
      <div className="flex-shrink-0 px-3 pb-2 pt-1">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {symptoms.map((chip) => (
            <button
              key={chip.label}
              onClick={() => sendMessage(chip.value)}
              disabled={isLoading}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors whitespace-nowrap"
              style={{ borderColor: '#B5451B', color: '#B5451B' }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-3 pb-4">
        <div className="flex gap-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none bg-transparent text-gray-800 placeholder-gray-400 text-sm focus:outline-none py-2 px-2"
            style={{ minHeight: '38px', maxHeight: '96px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 self-end hover:opacity-90 active:scale-95"
            style={{ background: '#B5451B' }}
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-1.5">
          This does not replace professional medical care
        </p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-dvh" style={{ background: '#F5F0EB' }}>
          <div className="text-center">
            <div className="text-5xl mb-3">🤱</div>
            <p className="text-gray-500 text-sm">Loading MomAlert...</p>
          </div>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
