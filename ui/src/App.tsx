import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import './index.css';
import './App.css';
import sheikhImg from './assets/sheikh.png';

// ─── Constants ────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || '/api/v1/chat';
const DAILY_LIMIT = 5;
const MAX_LIMIT = 6;
const STORAGE_KEY = 'sheikhna_quota';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

interface Quota {
  remaining: number;
  date: string; // ISO date string yyyy-mm-dd
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Obfuscation layer ───────────────────────────────────────────────────────
const _K = 'SheikhnaQ2025!';

function _xor(text: string, key: string): string {
  return Array.from(text)
    .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
    .join('');
}

function _hash(data: string): string {
  let h = 0x9e3779b9;
  for (let i = 0; i < data.length; i++) {
    h = ((h << 5) - h + data.charCodeAt(i)) | 0;
    h = (h ^ (h >>> 16)) | 0;
  }
  return (h >>> 0).toString(36);
}

function _encode(q: Quota): string {
  const json = JSON.stringify(q);
  const sig = _hash(json + _K);
  const payload = sig + '.' + json;
  return btoa(_xor(payload, _K));
}

function _decode(encoded: string): Quota | null {
  try {
    const payload = _xor(atob(encoded), _K);
    const dotIdx = payload.indexOf('.');
    if (dotIdx < 0) return null;
    const sig = payload.slice(0, dotIdx);
    const json = payload.slice(dotIdx + 1);
    if (_hash(json + _K) !== sig) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function loadQuota(): Quota {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = _decode(raw);
      if (!parsed) {
        // Tampered or corrupted → reset
        localStorage.removeItem(STORAGE_KEY);
        return { remaining: DAILY_LIMIT, date: today() };
      }
      // New day → reset, but never exceed MAX_LIMIT
      if (parsed.date !== today()) {
        return { remaining: Math.min(DAILY_LIMIT, MAX_LIMIT), date: today() };
      }
      return { ...parsed, remaining: Math.min(parsed.remaining, MAX_LIMIT) };
    }
  } catch {/* ignore */}
  return { remaining: DAILY_LIMIT, date: today() };
}

function saveQuota(q: Quota) {
  localStorage.setItem(STORAGE_KEY, _encode(q));
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Suggestions ──────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  'ما هي أركان الإسلام؟',
  'فضل قراءة القرآن',
  'ماهي الأصول الثلاثة الواجب تعلمها على كل مسلم ؟ ',
  'أدعية الصباح والمساء',
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
       strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const DotsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .322.218.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState<Quota>(loadQuota);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  // Show error briefly
  const showError = (msg: string) => {
    setError(msg);
    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setError(null), 3500);
  };

  const canSend = quota.remaining > 0 && !loading && input.trim().length > 0;

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || quota.remaining <= 0) return;

    // Deduct quota
    const newQuota: Quota = {
      remaining: Math.max(quota.remaining - 1, 0),
      date: today(),
    };
    setQuota(newQuota);
    saveQuota(newQuota);

    // Add user message
    const userMsg: Message = { id: uid(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msg: text }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      const answer = data?.answer ?? 'لم أتمكن من الإجابة، حاول مجدداً.';

      setMessages(prev => [...prev, { id: uid(), role: 'bot', text: answer }]);
    } catch (err) {
      // Restore one quota on failure
      const restored: Quota = {
        remaining: Math.min(newQuota.remaining + 1, MAX_LIMIT),
        date: today(),
      };
      setQuota(restored);
      saveQuota(restored);
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      showError('حدث خطأ في الاتصال، يرجى المحاولة مجدداً.');
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }, [input, loading, quota]);

  // Send on Enter (Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) handleSend();
    }
  };

  const handleSuggestion = (s: string) => {
    setInput(s);
    textareaRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([]);
    setMenuOpen(false);
  };

  // Quota badge variant
  const badgeClass =
    quota.remaining === 0 ? 'empty'
    : quota.remaining <= 2 ? 'low'
    : '';

  const isIdle = messages.length === 0 && !loading;

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <img src={sheikhImg} alt="Sheikhna" className="header-avatar" />
          <div>
            <div className="header-title">شيخنا</div>
            <div className="header-subtitle">Islamic RAG Assistant</div>
          </div>
        </div>

        {/* ── Kebab menu ── */}
        <div className="menu-wrapper" ref={menuRef}>
          <button
            className={`menu-dots-btn${menuOpen ? ' active' : ''}`}
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="القائمة"
          >
            <DotsIcon />
          </button>

          <div className={`menu-dropdown ${menuOpen ? ' open' : ''}`}>
            <a
              href="https://github.com/Amar-Dev1/Sheikhna"
              target="_blank"
              rel="noopener noreferrer"
              className="menu-item"
              onClick={() => setMenuOpen(false)}
            >
              <GitHubIcon />
              <span>⭐ ادعمنا بنجمة على GitHub</span>
            </a>

            <button
              className="menu-item"
              onClick={handleClearChat}
              disabled={messages.length === 0}
            >
              <TrashIcon />
              <span>مسح المحادثة</span>
            </button>

            <div className="menu-divider" />

            <div className="menu-item menu-info">
              <InfoIcon />
              <span>الإصدار 1.0.0 </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="main">
        {isIdle ? (
          /* Idle / Welcome state */
          <div className="idle-state">
            <div className="idle-avatar-wrap">
              <img src={sheikhImg} alt="Sheikhna" className="idle-avatar" />
            </div>
            <div className="idle-title">أهلاً بك في شيخنا</div>
            <p className="idle-desc">
              مساعدك الذكي للأسئلة الإسلامية المستنِد إلى الكتاب و السنة.
              اسألني ما تشاء
            </p>
            <div className="idle-suggestions">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  className="suggestion-chip"
                  onClick={() => handleSuggestion(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat messages */
          <div className="chat-area">
            {messages.map(m => (
              <div
                key={m.id}
                className={`message message-${m.role}`}
              >
                {m.role === 'bot' ? (
                  <>
                    <img src={sheikhImg} alt="bot" className="bot-avatar" />
                    <div className="bubble-bot" dir="auto">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                  </>
                ) : (
                  <div className="bubble-user" dir="auto">{m.text}</div>
                )}
              </div>
            ))}

            {/* Thinking dots */}
            {loading && (
              <div className="message message-bot">
                <img src={sheikhImg} alt="bot" className="bot-avatar" />
                <div className="thinking">
                  <span className="thinking-dot" />
                  <span className="thinking-dot" />
                  <span className="thinking-dot" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </main>

      {/* ── Input area ── */}
      <div className="input-area">
        <div className="input-container">
          <div className={`input-wrap${quota.remaining === 0 ? ' disabled' : ''}`}>
            {/* Lightning badge (bottom-left inside input) */}
            <div className={`lightning-badge${badgeClass ? ' ' + badgeClass : ''}`}>
              <span className="lightning-icon">⚡</span>
              <span className="lightning-count">{quota.remaining}</span>
            </div>

            <textarea
              ref={textareaRef}
              className="input-field"
              placeholder={
                quota.remaining === 0
                  ? 'لقد استنفذت أسئلتك اليوم، عُد غداً...'
                  : 'اسأل شيخنا...'
              }
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={resizeTextarea}
              rows={1}
              disabled={quota.remaining === 0 || loading}
              dir="auto"
            />

            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!canSend}
              aria-label="إرسال"
            >
              <SendIcon />
            </button>
          </div>

          {/* Limit notice */}
          {quota.remaining === 0 && (
            <p className="limit-notice">
              انتهت أسئلتك اليومية. ستتجدد{' '}
              <span>غداً</span> بإذن الله.
            </p>
          )}
          {quota.remaining > 0 && quota.remaining <= 2 && (
            <p className="limit-notice">
              تبقّى لك <span>{quota.remaining}</span>{' '}
              {quota.remaining === 1 ? 'سؤال' : 'أسئلة'} اليوم.
            </p>
          )}
        </div>
      </div>

      {/* ── Error toast ── */}
      {error && <div className="error-toast">{error}</div>}
    </div>
  );
}
