'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCopilotStore } from '@/stores/copilotStore';
import { useNewBusinessStore } from '@/stores/newBusinessStore';
import { useDataStore } from '@/stores/dataStore';
import { ProposedChange } from '@/lib/types';

function renderContent(content: string) {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

function AgentActivity({ visible }: { visible: boolean }) {
  const [steps, setSteps] = useState<{ label: string; done: boolean }[]>([]);

  useEffect(() => {
    if (!visible) { setSteps([]); return; }
    const allSteps = [
      'Retrieving CAP data',
      'Reading renewal history',
      'Analyzing contribution strategy',
      'Running pricing calculations',
      'Generating recommendation',
    ];
    let i = 0;
    setSteps([{ label: allSteps[0], done: false }]);
    const interval = setInterval(() => {
      i++;
      if (i >= allSteps.length) { clearInterval(interval); return; }
      setSteps(prev => [
        ...prev.map(s => ({ ...s, done: true })),
        { label: allSteps[i], done: false },
      ]);
    }, 400);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible || steps.length === 0) return null;

  return (
    <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--type-caption)', color: s.done ? '#1A7A4A' : '#5A45C7' }}>
          {s.done ? (
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#E4F2EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--type-badge)', color: '#1A7A4A', flexShrink: 0 }}>✓</span>
          ) : (
            <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(90,69,199,0.3)', borderTopColor: '#5A45C7', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
          )}
          <span style={{ fontWeight: s.done ? 400 : 500 }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function CitationBar({ citations }: { citations: string[] }) {
  if (!citations || citations.length === 0) return null;
  return (
    <div style={{ marginTop: 8, padding: '8px 10px', background: '#F7F9FB', borderRadius: 8, border: '1px solid #EEF1F4' }}>
      <div style={{ fontSize: 'var(--type-badge)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Sources Used</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {citations.map((c, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 'var(--type-badge)', fontWeight: 600,
            color: '#0074B8', background: '#E7F1FA',
            padding: '2px 8px', borderRadius: 4,
          }}>
            <span style={{ color: '#1A7A4A', fontSize: 'var(--type-badge)' }}>✓</span>
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProposedChangeCard({
  change, onApply, onDiscard, applied, discarded,
}: {
  change: ProposedChange; onApply: () => void; onDiscard: () => void; applied: boolean; discarded: boolean;
}) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #E4E8ED', borderRadius: 8,
      padding: 12, marginTop: 10, borderLeft: '3px solid #5A45C7',
    }}>
      <div style={{ fontSize: 'var(--type-badge)', fontWeight: 700, color: '#5A45C7', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
        Proposed Change
      </div>
      <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D', marginBottom: 8 }}>
        {change.field}
      </div>
      <div style={{ borderTop: '1px solid #EEF1F4', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 'var(--type-body)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 600, color: '#374151', fontSize: 'var(--type-badge)' }}>BEFORE</span>
          <span style={{ color: '#C60C30', fontWeight: 500, textDecoration: 'line-through', background: '#FDECEF', padding: '1px 6px', borderRadius: 4, fontSize: 'var(--type-body-sm)' }}>{change.before}</span>
        </div>
        <div style={{ fontSize: 'var(--type-body)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 600, color: '#374151', fontSize: 'var(--type-badge)' }}>AFTER</span>
          <span style={{ color: '#1A7A4A', fontWeight: 600, background: '#E4F2EA', padding: '1px 6px', borderRadius: 4, fontSize: 'var(--type-body-sm)' }}>{change.after}</span>
        </div>
        {change.description && (
          <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginTop: 2, lineHeight: 1.5 }}>
            {change.description}
          </div>
        )}
      </div>
      {!applied && !discarded && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button onClick={onApply} style={{
            height: 30, padding: '0 14px', borderRadius: 7, border: 'none',
            background: '#1A7A4A', color: '#fff', fontSize: 'var(--type-body-sm)',
            fontWeight: 600, cursor: 'pointer', transition: 'background 0.12s',
          }}>Apply Change</button>
          <button onClick={onDiscard} style={{
            height: 30, padding: '0 14px', borderRadius: 7,
            border: '1px solid #DCE2E8', background: '#fff', color: '#374151',
            fontSize: 'var(--type-body-sm)', fontWeight: 600, cursor: 'pointer',
          }}>Discard</button>
        </div>
      )}
      {applied && (
        <div style={{ marginTop: 10, fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#1A7A4A', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', background: '#E4F2EA', fontSize: 'var(--type-badge)' }}>&#10003;</span>
          Applied
          <span style={{ marginLeft: 6, fontSize: 8, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: '#F0EEFE', color: '#5A45C7' }}>AI-assisted</span>
        </div>
      )}
      {discarded && (
        <div style={{ marginTop: 10, fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#374151' }}>Discarded</div>
      )}
    </div>
  );
}

export default function CopilotSidebar() {
  const open = useCopilotStore((s) => s.open);
  const messages = useCopilotStore((s) => s.messages);
  const input = useCopilotStore((s) => s.input);
  const setInput = useCopilotStore((s) => s.setInput);
  const send = useCopilotStore((s) => s.send);
  const ask = useCopilotStore((s) => s.ask);
  const toggle = useCopilotStore((s) => s.toggle);
  const addSystemMessage = useCopilotStore((s) => s.addSystemMessage);
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const step = useNewBusinessStore((s) => s.step);

  const [appliedChanges, setAppliedChanges] = useState<Record<number, 'applied' | 'discarded'>>({});
  const [showActivity, setShowActivity] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'agent') {
      setShowActivity(false);
    }
  }, [messages]);

  if (!open) return null;

  const stepLabels = ['Intake', 'AI Extraction', 'Assembly', 'Plan Design & Rates', 'Readiness', 'Preview & Submit'];
  const currentStage = pathname.includes('new-business') ? stepLabels[step - 1] || 'Intake' : pathname.includes('renewal') ? 'Renewal Diff' : pathname.includes('esign') ? 'E-Signature' : 'Dashboard';

  const chips = pathname.includes('new-business')
    ? ['Summarize Changes', 'Explain Rate Formula', 'Model Flat $500', 'Review CAP', 'Show Missing Fields', 'Prepare Handoff']
    : pathname.includes('renewal')
    ? ['Show Renewal Risks', 'Summarize Changes', 'Explain Rate Formula', 'Compare Versions']
    : ["What's blocking?", 'Summarize', 'Help'];

  const handleApply = (msgIndex: number, change: ProposedChange) => {
    setAppliedChanges((prev) => ({ ...prev, [msgIndex]: 'applied' }));
    if (change.field === 'Contribution Strategy' && change.after.includes('Flat Dollar')) {
      useNewBusinessStore.getState().setContribStrategy('flat_dollar');
    }
    addSystemMessage(`✓ Applied: ${change.field} changed to ${change.after}`);
    useDataStore.getState().addAudit({
      actor: 'CAP Copilot', actorType: 'system',
      action: `applied change: ${change.field} from "${change.before}" to "${change.after}" (AI-assisted)`,
      entity: 'cap', entityId: 'cap-itafos-001',
      before: change.before, after: change.after,
    });
  };

  const handleDiscard = (msgIndex: number) => {
    setAppliedChanges((prev) => ({ ...prev, [msgIndex]: 'discarded' }));
    addSystemMessage('Change discarded.');
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: 'discarded proposed Copilot change',
      entity: 'copilot', entityId: 'copilot-session',
    });
  };

  const handleSend = () => {
    setShowActivity(true);
    send();
  };

  const handleAsk = (q: string) => {
    setShowActivity(true);
    ask(q);
  };

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 400,
      background: '#fff', borderLeft: '1px solid var(--border-primary)',
      boxShadow: 'var(--shadow-drawer)', zIndex: 100,
      display: 'flex', flexDirection: 'column',
      animation: 'slide-in .22s cubic-bezier(.4,0,.2,1)',
    }}>
      {/* Header — enterprise context bar */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border-primary)',
        background: 'linear-gradient(180deg, #FAFBFF, #fff)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #5A45C7, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 'var(--type-body-sm)', boxShadow: '0 2px 8px rgba(90,69,199,0.3)',
          }}>✦</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: 'var(--text-primary)' }}>CAP Copilot</div>
            <div style={{ fontSize: 'var(--type-caption)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Itafos Conda &middot; CAP-2026-0847
            </div>
          </div>
          <button onClick={toggle} style={{
            width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border-primary)',
            background: '#fff', color: 'var(--text-secondary)', fontSize: 'var(--type-body)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.1s',
          }}>&times;</button>
        </div>
        {/* Context chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 'var(--type-badge)', fontWeight: 600,
            color: '#5A45C7', background: '#F8F6FE',
            padding: '3px 8px', borderRadius: 6, border: '1px solid var(--color-cap-purple-border)',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#1A7A4A', flexShrink: 0 }} />
            {currentStage}
          </span>
          <span style={{ fontSize: 'var(--type-badge)', color: 'var(--text-tertiary)' }}>Context-aware &middot; Grounded</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => {
          if (msg.role === 'system') {
            return (
              <div key={i} style={{
                background: 'linear-gradient(135deg, #F8F6FE, #F0EEFE)',
                border: '1px solid var(--color-cap-purple-border)', borderRadius: 10, padding: 12,
              }}>
                <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', lineHeight: 1.55 }}
                  dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                {msg.actions && msg.actions.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10, borderTop: '1px solid var(--color-cap-purple-border)', paddingTop: 10 }}>
                    <div style={{ fontSize: 'var(--type-badge)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Recommended Actions</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {msg.actions.map((action, j) => (
                        <button key={j} onClick={() => handleAsk(action.query)} style={{
                          height: 26, padding: '0 10px', borderRadius: 6,
                          background: '#fff', border: '1px solid var(--color-cap-purple-border)',
                          color: '#5A45C7', fontSize: 'var(--type-badge)', fontWeight: 600, cursor: 'pointer',
                          transition: 'all 0.1s',
                        }}>{action.label}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }
          if (msg.role === 'user') {
            return (
              <div key={i} style={{
                alignSelf: 'flex-end', maxWidth: '85%',
                background: '#13212C', color: '#fff',
                borderRadius: '12px 12px 3px 12px', padding: '10px 14px',
                fontSize: 'var(--type-body-sm)', lineHeight: 1.5,
              }}>{msg.content}</div>
            );
          }
          if (msg.role === 'agent') {
            const changeState = appliedChanges[i];
            const defaultCitations = ['PrismHR Census', 'CAP Workbook', 'F4 Pricing Stack'];
            return (
              <div key={i} style={{
                background: '#F7F9FB', border: '1px solid #EEF1F4',
                borderRadius: 10, padding: 12,
              }}>
                <div style={{ fontSize: 'var(--type-body-sm)', color: '#1B2D3D', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                <CitationBar citations={msg.citation ? [msg.citation, ...defaultCitations.slice(0, 2)] : defaultCitations} />
                {msg.proposedChange && (
                  <ProposedChangeCard
                    change={msg.proposedChange}
                    onApply={() => handleApply(i, msg.proposedChange!)}
                    onDiscard={() => handleDiscard(i)}
                    applied={changeState === 'applied'}
                    discarded={changeState === 'discarded'}
                  />
                )}
              </div>
            );
          }
          return null;
        })}
        <AgentActivity visible={showActivity} />
      </div>

      {/* Suggested prompts — horizontal scroll chips */}
      <div style={{
        padding: '8px 16px', borderTop: '1px solid var(--border-secondary)',
        display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0,
        scrollbarWidth: 'none',
      }}>
        {chips.map((chip) => (
          <button key={chip} onClick={() => handleAsk(chip)} style={{
            height: 28, padding: '0 12px', borderRadius: 14,
            background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
            color: 'var(--text-secondary)', fontSize: 'var(--type-badge)', fontWeight: 600,
            whiteSpace: 'nowrap', cursor: 'pointer',
            transition: 'all 0.1s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F8F6FE'; e.currentTarget.style.color = '#5A45C7'; e.currentTarget.style.borderColor = 'var(--color-cap-purple-border)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
          >{chip}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 16px', borderTop: '1px solid var(--border-primary)',
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#fff',
      }}>
        <input
          placeholder="Ask about rates, validation, contribution..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          style={{
            flex: 1, height: 38, border: '1px solid var(--border-primary)', borderRadius: 10,
            padding: '0 12px', background: 'var(--bg-secondary)', fontSize: 'var(--type-body-sm)', outline: 'none',
            transition: 'border-color 0.12s',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#5A45C7'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-primary)'}
        />
        <button onClick={handleSend} style={{
          width: 38, height: 38, borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg, #5A45C7, #8B5CF6)',
          color: '#fff', fontSize: 'var(--type-body)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(90,69,199,0.25)',
          transition: 'transform 0.1s',
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >&rarr;</button>
      </div>
    </div>
  );
}
