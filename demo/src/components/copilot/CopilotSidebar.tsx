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

function ProposedChangeCard({
  change,
  onApply,
  onDiscard,
  applied,
  discarded,
}: {
  change: ProposedChange;
  onApply: () => void;
  onDiscard: () => void;
  applied: boolean;
  discarded: boolean;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E4E8ED',
        borderRadius: 8,
        padding: 12,
        marginTop: 10,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#64707A',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: 6,
        }}
      >
        Proposed Change
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#1B2D3D',
          marginBottom: 8,
        }}
      >
        {change.field}
      </div>
      <div
        style={{
          borderTop: '1px solid #EEF1F4',
          paddingTop: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div style={{ fontSize: 11 }}>
          <span style={{ fontWeight: 600, color: '#64707A' }}>Before: </span>
          <span style={{ color: '#C60C30', fontWeight: 500 }}>{change.before}</span>
        </div>
        <div style={{ fontSize: 11 }}>
          <span style={{ fontWeight: 600, color: '#64707A' }}>After: </span>
          <span style={{ color: '#1A7A4A', fontWeight: 500 }}>{change.after}</span>
        </div>
        {change.description && (
          <div style={{ fontSize: 10, color: '#98A1A8', marginTop: 2 }}>
            {change.description}
          </div>
        )}
      </div>
      {!applied && !discarded && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button
            onClick={onApply}
            style={{
              height: 28,
              padding: '0 14px',
              borderRadius: 6,
              border: 'none',
              background: '#1A7A4A',
              color: '#fff',
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Apply Change
          </button>
          <button
            onClick={onDiscard}
            style={{
              height: 28,
              padding: '0 14px',
              borderRadius: 6,
              border: '1px solid #DCE2E8',
              background: '#fff',
              color: '#64707A',
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Discard
          </button>
        </div>
      )}
      {applied && (
        <div
          style={{
            marginTop: 10,
            fontSize: 10,
            fontWeight: 600,
            color: '#1A7A4A',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#E6F4ED',
              fontSize: 10,
            }}
          >
            &#10003;
          </span>
          Applied
          <span
            style={{
              marginLeft: 6,
              fontSize: 8,
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 3,
              background: '#F0EEFE',
              color: '#5A45C7',
            }}
          >
            AI-assisted
          </span>
        </div>
      )}
      {discarded && (
        <div
          style={{
            marginTop: 10,
            fontSize: 10,
            fontWeight: 600,
            color: '#98A1A8',
          }}
        >
          Discarded
        </div>
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

  // Track which proposed changes have been applied/discarded by message index
  const [appliedChanges, setAppliedChanges] = useState<Record<number, 'applied' | 'discarded'>>({});

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!open) return null;

  const chips = pathname.includes('new-business')
    ? ["What's missing?", 'Explain rate formula', 'Model Flat $500', 'Summarize this CAP']
    : ["What's blocking handoff?", 'Summarize changes', 'Help'];

  const handleApply = (msgIndex: number, change: ProposedChange) => {
    setAppliedChanges((prev) => ({ ...prev, [msgIndex]: 'applied' }));

    // Apply the actual change to the store if applicable
    if (change.field === 'Contribution Strategy' && change.after.includes('Flat Dollar')) {
      useNewBusinessStore.getState().setContribStrategy('flat_dollar');
    }

    // Log to audit trail via system message
    addSystemMessage(
      `✓ Applied: ${change.field} changed to ${change.after}`
    );

    // CP7: Log copilot interaction to audit store
    useDataStore.getState().addAudit({
      actor: 'CAP Copilot',
      actorType: 'system',
      action: `applied change: ${change.field} from "${change.before}" to "${change.after}" (AI-assisted)`,
      entity: 'cap',
      entityId: 'cap-itafos-001',
      before: change.before,
      after: change.after,
    });
  };

  const handleDiscard = (msgIndex: number) => {
    setAppliedChanges((prev) => ({ ...prev, [msgIndex]: 'discarded' }));
    addSystemMessage('Change discarded.');

    // CP7: Log copilot discard to audit store
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield',
      actorType: 'user',
      action: 'discarded proposed Copilot change',
      entity: 'copilot',
      entityId: 'copilot-session',
    });
  };

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 380,
      background: '#fff', borderLeft: '1px solid #E4E8ED',
      boxShadow: '-8px 0 30px rgba(16,32,45,.08)', zIndex: 100,
      display: 'flex', flexDirection: 'column',
      animation: 'slide-in .22s cubic-bezier(.4,0,.2,1)',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #EEF1F4', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg, #5A45C7, #8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 14,
        }}>&#10022;</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>CAP Copilot</div>
          <div style={{ fontSize: 9, color: '#98A1A8' }}>CP1-CP7 &middot; Context-aware AI assistant</div>
        </div>
        <button onClick={toggle} style={{
          width: 28, height: 28, borderRadius: 7, border: 'none',
          background: 'transparent', color: '#98A1A8', fontSize: 14,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>&times;</button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg, i) => {
          if (msg.role === 'system') {
            return (
              <div key={i} style={{
                background: 'linear-gradient(135deg, #F8F6FE, #F0EEFE)',
                border: '1px solid #E4DDF7', borderRadius: 10, padding: 12,
              }}>
                <div style={{ fontSize: 10.5, color: '#64707A', lineHeight: 1.55 }}
                  dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                {msg.actions && msg.actions.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                    {msg.actions.map((action, j) => (
                      <button key={j} onClick={() => ask(action.query)} style={{
                        height: 26, padding: '0 10px', borderRadius: 6,
                        background: '#fff', border: '1px dashed #E4DDF7',
                        color: '#5A45C7', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      }}>{action.label}</button>
                    ))}
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
                borderRadius: '10px 10px 2px 10px', padding: '10px 12px',
                fontSize: 11, lineHeight: 1.5,
              }}>{msg.content}</div>
            );
          }
          if (msg.role === 'agent') {
            const changeState = appliedChanges[i];
            return (
              <div key={i} style={{
                background: '#F7F9FB', border: '1px solid #EEF1F4',
                borderRadius: 10, padding: 12,
              }}>
                <div style={{ fontSize: 11, color: '#1B2D3D', lineHeight: 1.55 }}
                  dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                {msg.citation && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                    <span style={{ fontSize: 8, fontWeight: 600, color: '#0074B8', background: '#E7F1FA', padding: '2px 6px', borderRadius: 3 }}>
                      {msg.citation}
                    </span>
                  </div>
                )}
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
      </div>

      {/* Prompt chips */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid #EEF1F4', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {chips.map((chip) => (
          <button key={chip} onClick={() => ask(chip)} style={{
            height: 24, padding: '0 9px', borderRadius: 12,
            background: '#F8F6FE', border: '1px solid #E4DDF7',
            color: '#5A45C7', fontSize: 9, fontWeight: 600,
            whiteSpace: 'nowrap', cursor: 'pointer',
          }}>{chip}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid #EEF1F4', display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          placeholder="Ask about rates, validation, contribution..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          style={{
            flex: 1, height: 36, border: '1px solid #DCE2E8', borderRadius: 8,
            padding: '0 10px', background: '#FBFCFD', fontSize: 11, outline: 'none',
          }}
        />
        <button onClick={send} style={{
          width: 36, height: 36, borderRadius: 8, border: 'none',
          background: 'linear-gradient(135deg, #5A45C7, #8B5CF6)',
          color: '#fff', fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>&rarr;</button>
      </div>
    </div>
  );
}
