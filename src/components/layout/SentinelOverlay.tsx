import { motion, type Variants } from 'framer-motion';
import { TopNav } from './TopNav';
import { ContextPanel } from './ContextPanel';
import { AuxPanel } from './AuxPanel';
import { CommandPalette } from './CommandPalette';
import { useLayoutStore } from '../../stores/layoutStore';

interface ShellProps {
  children: React.ReactNode;
}

const shellVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const topBarVariant: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { 
    opacity: 1, y: 0, 
    transition: { type: 'spring' as const, damping: 30, stiffness: 300 } 
  },
};

const sidePanelVariant: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { 
    opacity: 1, x: 0, 
    transition: { type: 'spring' as const, damping: 28, stiffness: 200 } 
  },
};

const mainStageVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.25 } 
  },
};

const footerVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.3 } },
};

export function Shell({ children }: ShellProps) {
  const { activeTab, contextPanelOpen, auxPanelOpen } = useLayoutStore();

  return (
    <motion.div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{ background: 'var(--color-surface-base)' }}
      variants={shellVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={topBarVariant}>
        <TopNav />
      </motion.div>

      <div className="flex flex-1 overflow-hidden">
        {contextPanelOpen && (
          <motion.div variants={sidePanelVariant}>
            <ContextPanel activeTab={activeTab} />
          </motion.div>
        )}

        <motion.main
          className="flex-1 overflow-hidden flex flex-col"
          style={{ background: 'var(--color-surface-component)' }}
          variants={mainStageVariant}
        >
          {children}
        </motion.main>

        {auxPanelOpen && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring' as const, damping: 28, stiffness: 200 }}
          >
            <AuxPanel />
          </motion.div>
        )}
      </div>

      <motion.footer
        className="h-6 flex-shrink-0 flex items-center px-3 gap-4 select-none"
        style={{
          background: 'var(--color-surface-section)',
          borderTop: '1px solid var(--color-border-ghost)',
        }}
        variants={footerVariant}
      >
        <span className="label-tag">autarch v0.1.0</span>
        <span className="label-tag" style={{ color: 'var(--color-accent-dim)' }}>hermes::acp</span>
        <div className="flex-1" />
        <span className="label-tag">rust 1.94 · react 19 · tauri 2</span>
      </motion.footer>

      {/* Global Command Palette — floats above everything */}
      <CommandPalette />
    </motion.div>
  );
}
