import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Toast Types with Icon + Color Config ─────────────────────
const TOAST_CONFIG = {
  success: {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" stroke="url(#successGrad)" strokeWidth="2" opacity="0.3"/>
        <path d="M9 14.5L12.5 18L19 10" stroke="url(#successGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="successGrad" x1="0" y1="0" x2="28" y2="28">
            <stop stopColor="#34d399"/>
            <stop offset="1" stopColor="#6ee7b7"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.05))',
    borderColor: 'rgba(52, 211, 153, 0.35)',
    glowColor: '0 0 40px rgba(16, 185, 129, 0.15), 0 0 80px rgba(16, 185, 129, 0.05)',
    accentColor: '#34d399',
    progressColor: 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)',
  },
  error: {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" stroke="url(#errorGrad)" strokeWidth="2" opacity="0.3"/>
        <path d="M10 10L18 18M18 10L10 18" stroke="url(#errorGrad)" strokeWidth="2.5" strokeLinecap="round"/>
        <defs>
          <linearGradient id="errorGrad" x1="0" y1="0" x2="28" y2="28">
            <stop stopColor="#f43f5e"/>
            <stop offset="1" stopColor="#fb7185"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(251, 113, 133, 0.05))',
    borderColor: 'rgba(244, 63, 94, 0.35)',
    glowColor: '0 0 40px rgba(244, 63, 94, 0.15), 0 0 80px rgba(244, 63, 94, 0.05)',
    accentColor: '#f43f5e',
    progressColor: 'linear-gradient(90deg, #e11d48, #f43f5e, #fb7185)',
  },
  info: {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" stroke="url(#infoGrad)" strokeWidth="2" opacity="0.3"/>
        <circle cx="14" cy="9" r="1.8" fill="url(#infoGrad)"/>
        <path d="M14 13V20" stroke="url(#infoGrad)" strokeWidth="2.5" strokeLinecap="round"/>
        <defs>
          <linearGradient id="infoGrad" x1="0" y1="0" x2="28" y2="28">
            <stop stopColor="#818cf8"/>
            <stop offset="1" stopColor="#a5b4fc"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(129, 140, 248, 0.05))',
    borderColor: 'rgba(129, 140, 248, 0.35)',
    glowColor: '0 0 40px rgba(99, 102, 241, 0.15), 0 0 80px rgba(99, 102, 241, 0.05)',
    accentColor: '#818cf8',
    progressColor: 'linear-gradient(90deg, #6366f1, #818cf8, #a5b4fc)',
  },
  warning: {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3L26 25H2L14 3Z" stroke="url(#warnGrad)" strokeWidth="2" strokeLinejoin="round" opacity="0.3"/>
        <path d="M14 11V17" stroke="url(#warnGrad)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="14" cy="21" r="1.5" fill="url(#warnGrad)"/>
        <defs>
          <linearGradient id="warnGrad" x1="0" y1="0" x2="28" y2="28">
            <stop stopColor="#fbbf24"/>
            <stop offset="1" stopColor="#fcd34d"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(252, 211, 77, 0.05))',
    borderColor: 'rgba(251, 191, 36, 0.35)',
    glowColor: '0 0 40px rgba(251, 191, 36, 0.15), 0 0 80px rgba(251, 191, 36, 0.05)',
    accentColor: '#fbbf24',
    progressColor: 'linear-gradient(90deg, #f59e0b, #fbbf24, #fcd34d)',
  },
};

const AUTOCLOSE_MS = 3000;

// ─── Single Toast Item ────────────────────────────────────────
function ToastItem({ toast, onDismiss }) {
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const progressRef = useRef(null);

  useEffect(() => {
    // Trigger CSS animation after mount
    requestAnimationFrame(() => {
      if (progressRef.current) {
        progressRef.current.style.transform = 'scaleX(0)';
      }
    });
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.85, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 80, scale: 0.9, filter: 'blur(4px)' }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 28,
        mass: 0.8 
      }}
      onClick={() => onDismiss(toast.id)}
      style={{
        background: `${config.gradient}, rgba(8, 8, 14, 0.88)`,
        border: `1px solid ${config.borderColor}`,
        boxShadow: `${config.glowColor}, 0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)`,
        backdropFilter: 'blur(24px) saturate(200%)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
        cursor: 'pointer',
        overflow: 'hidden',
        position: 'relative',
      }}
      className="rounded-2xl min-w-[320px] max-w-[480px]"
    >
      {/* Shimmer Effect */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(105deg, transparent 40%, ${config.accentColor}08 50%, transparent 60%)`,
        animation: 'toastShimmer 3s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '18px 22px 20px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Icon Container */}
        <div style={{
          flexShrink: 0,
          width: 44,
          height: 44,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${config.accentColor}12`,
          border: `1px solid ${config.accentColor}20`,
          boxShadow: `0 0 20px ${config.accentColor}15`,
        }}>
          {config.icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: config.accentColor,
            marginBottom: 5,
            lineHeight: 1,
            fontFamily: "'Outfit', 'Inter', sans-serif",
          }}>
            {toast.type === 'success' ? '✓ Success' : 
             toast.type === 'error' ? '✕ Error' : 
             toast.type === 'warning' ? '⚠ Warning' : 'ℹ Info'}
          </div>
          <div style={{
            fontSize: 14,
            fontWeight: 500,
            color: '#e2e8f0',
            lineHeight: 1.45,
            fontFamily: "'Outfit', 'Inter', sans-serif",
            wordBreak: 'break-word',
          }}>
            {toast.message}
          </div>
        </div>

        {/* Close hint */}
        <div style={{
          flexShrink: 0,
          opacity: 0.3,
          fontSize: 16,
          lineHeight: 1,
          marginTop: 2,
          transition: 'opacity 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}
        >
          ×
        </div>
      </div>

      {/* Auto-close progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        background: 'rgba(255,255,255,0.04)',
        overflow: 'hidden',
      }}>
        <div
          ref={progressRef}
          style={{
            height: '100%',
            background: config.progressColor,
            transformOrigin: 'left',
            transform: 'scaleX(1)',
            transition: `transform ${AUTOCLOSE_MS}ms linear`,
            boxShadow: `0 0 8px ${config.accentColor}60`,
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── Toast Container ──────────────────────────────────────────
export function ToastContainer({ toasts, dismissToast }) {
  return (
    <>
      {/* Inject shimmer keyframe */}
      <style>{`
        @keyframes toastShimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: 80,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 12,
        pointerEvents: 'none',
      }}>
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <div key={toast.id} style={{ pointerEvents: 'auto' }}>
              <ToastItem toast={toast} onDismiss={dismissToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
