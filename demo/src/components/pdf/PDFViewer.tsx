'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

interface Highlight {
  page_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

interface PageData {
  imgSrc: string;
  width: number;
  height: number;
  textItems: TextItem[];
}

interface PDFViewerProps {
  url: string;
  pageNumber: number;
  searchText?: string;
  highlight?: Highlight | null;
  fieldLabel?: string;
  onPageChange?: (page: number) => void;
  filename?: string;
}

const HL_COLOR = 'rgba(253, 232, 100, 0.55)';
const HL_BORDER = '2px solid rgba(245, 180, 0, 0.7)';

/**
 * 3-tier text matcher — finds bounding boxes for search text within PDF.js text items.
 * Tier 1: Exact substring match within a single text item
 * Tier 2: Word-run match — consecutive items containing search words
 * Tier 3: Loose word match — any item containing significant search words
 */
function findTextHighlights(
  textItems: TextItem[],
  searchText: string,
  pageWidth: number,
  pageHeight: number,
  scale: number,
): Highlight[] {
  if (!searchText || searchText.length < 2 || !textItems.length) return [];

  const searchLower = searchText.toLowerCase().trim();
  const searchWords = searchLower
    .split(/[\s,|:;()\[\]{}]+/)
    .filter(w => w.length >= 2 && !['the', 'and', 'for', 'per', 'not'].includes(w));

  const highlights: Highlight[] = [];
  const addedPositions = new Set<string>();

  const toHighlight = (item: TextItem): Highlight => {
    // PDF.js text items: transform[4]=x, transform[5]=y in UNSCALED PDF coords
    // pageWidth/pageHeight are SCALED (viewport) dimensions
    // So we need: (pdfCoord * scale / viewportSize) * 100
    const rawX = item.transform[4];  // PDF points from left
    const rawY = item.transform[5];  // PDF points from bottom
    const rawW = item.width;         // PDF points width
    const rawH = item.height || 10;  // PDF points height

    // Convert to percentage of the rendered page image
    const x = (rawX * scale / pageWidth) * 100;
    const y = (1 - (rawY * scale / pageHeight)) * 100 - (rawH * scale / pageHeight) * 100;
    const w = (rawW * scale / pageWidth) * 100;
    const h = (rawH * scale / pageHeight) * 100;

    return {
      page_number: 0,
      x: Math.max(0, x - 0.5),
      y: Math.max(0, y - 0.3),
      width: Math.min(98 - x, Math.max(w + 1, 10)),
      height: Math.min(98 - y, Math.max(h + 0.5, 1.5)),
    };
  };

  const posKey = (hl: Highlight) => `${Math.round(hl.x)}-${Math.round(hl.y)}`;

  // Tier 1: Exact substring match — search text found inside a text item, or item found inside search
  for (const item of textItems) {
    const itemLower = item.str.toLowerCase().trim();
    if (!itemLower || itemLower.length < 2) continue;
    // Item contains the search text
    if (itemLower.includes(searchLower)) {
      const hl = toHighlight(item);
      const key = posKey(hl);
      if (!addedPositions.has(key)) { highlights.push(hl); addedPositions.add(key); }
    }
    // Search text contains the item text (item is a fragment of the value)
    // Only if item is substantial (>= 3 chars) and not a common word
    else if (searchLower.includes(itemLower) && itemLower.length >= 3 && !['the', 'and', 'for', 'per', 'not', 'one'].includes(itemLower)) {
      const hl = toHighlight(item);
      const key = posKey(hl);
      if (!addedPositions.has(key)) { highlights.push(hl); addedPositions.add(key); }
    }
  }

  if (highlights.length > 0) return highlights;

  // Tier 2: Word-run — items containing multiple search words
  for (const item of textItems) {
    const itemLower = item.str.toLowerCase();
    const matchCount = searchWords.filter(w => itemLower.includes(w)).length;
    if (matchCount >= 2 || (matchCount >= 1 && searchWords.length <= 2)) {
      const hl = toHighlight(item);
      const key = posKey(hl);
      if (!addedPositions.has(key)) {
        highlights.push(hl);
        addedPositions.add(key);
      }
    }
  }

  if (highlights.length > 0) return highlights;

  // Tier 3: Loose — any single significant word match (only use words > 4 chars)
  const significantWords = searchWords.filter(w => w.length > 4);
  if (significantWords.length === 0) return [];

  for (const item of textItems) {
    const itemLower = item.str.toLowerCase();
    if (significantWords.some(w => itemLower.includes(w))) {
      const hl = toHighlight(item);
      const key = posKey(hl);
      if (!addedPositions.has(key)) {
        highlights.push(hl);
        addedPositions.add(key);
      }
    }
  }

  return highlights.slice(0, 5); // cap loose matches
}

export default function PDFViewer({ url, pageNumber, searchText, highlight, fieldLabel, onPageChange, filename }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);

  // Load PDF — render all pages + extract text positions
  useEffect(() => {
    let cancelled = false;
    async function loadPdf() {
      try {
        setLoading(true);
        setError(null);
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
        const pdf = await pdfjsLib.getDocument(url).promise;
        if (cancelled) return;
        setTotalPages(pdf.numPages);

        const pageDataList: PageData[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          if (cancelled) return;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx, viewport }).promise;
          if (cancelled) return;

          const textContent = await page.getTextContent();
          const textItems: TextItem[] = textContent.items
            .filter((item: any) => item.str && item.str.trim())
            .map((item: any) => ({
              str: item.str,
              transform: item.transform,
              width: item.width,
              height: item.height || 10,
            }));

          pageDataList.push({
            imgSrc: canvas.toDataURL('image/png'),
            width: viewport.width,
            height: viewport.height,
            textItems,
          });
        }
        setPages(pageDataList);
        setLoading(false);
      } catch (err: any) {
        if (!cancelled) { setError(err?.message || 'Failed to load PDF'); setLoading(false); }
      }
    }
    loadPdf();
    return () => { cancelled = true; };
  }, [url, scale]);

  // Scroll to page
  useEffect(() => {
    if (pageNumber < 1 || !containerRef.current || pages.length === 0) return;
    setCurrentPage(pageNumber);
    const tryScroll = () => {
      const el = containerRef.current?.querySelector(`[data-page="${pageNumber}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    tryScroll();
    setTimeout(tryScroll, 300);
  }, [pageNumber, pages.length]);

  // Track visible page
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const els = containerRef.current.querySelectorAll('[data-page]');
    const top = containerRef.current.scrollTop + 60;
    let vis = 1;
    els.forEach(el => { if ((el as HTMLElement).offsetTop <= top) vis = parseInt(el.getAttribute('data-page') || '1'); });
    if (vis !== currentPage) setCurrentPage(vis);
  }, [currentPage]);

  // Compute text-based highlights using 3-tier matcher
  const computedHighlights = useMemo(() => {
    if (!searchText || pages.length === 0 || pageNumber < 1) return {};
    const result: Record<number, Highlight[]> = {};

    // Only search the target page
    const targetIdx = pageNumber - 1;
    if (targetIdx < pages.length) {
      const pg = pages[targetIdx];
      const hls = findTextHighlights(pg.textItems, searchText, pg.width, pg.height, scale);
      if (hls.length > 0) result[pageNumber] = hls;
    }

    return result;
  }, [searchText, pages, pageNumber, scale]);

  const goToPage = (pg: number) => {
    const p = Math.max(1, Math.min(pg, totalPages));
    setCurrentPage(p);
    onPageChange?.(p);
    const el = containerRef.current?.querySelector(`[data-page="${p}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (error) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: '#98A1A8', background: '#525659' }}>
        <i className="fa-solid fa-file-circle-exclamation" style={{ fontSize: 32 }} />
        <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>PDF not available</div>
        <div style={{ fontSize: 11, color: '#999' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#525659' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#323639', flexShrink: 0, borderBottom: '1px solid #1a1a1a' }}>
        <i className="fa-solid fa-file-pdf" style={{ fontSize: 13, color: '#ff6b6b' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#ddd', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{filename || 'Document'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1} style={{ ...tbtn, opacity: currentPage <= 1 ? 0.3 : 1 }}><i className="fa-solid fa-chevron-left" style={{ fontSize: 10 }} /></button>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#ccc', minWidth: 50, textAlign: 'center' }}>{currentPage} / {totalPages || '…'}</span>
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages} style={{ ...tbtn, opacity: currentPage >= totalPages ? 0.3 : 1 }}><i className="fa-solid fa-chevron-right" style={{ fontSize: 10 }} /></button>
        </div>
        <div style={{ width: 1, height: 18, background: '#555', margin: '0 4px' }} />
        <button onClick={() => setScale(s => Math.max(0.6, s - 0.2))} style={tbtn} title="Zoom out"><i className="fa-solid fa-magnifying-glass-minus" style={{ fontSize: 11 }} /></button>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#aaa', minWidth: 34, textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(s => Math.min(3, s + 0.2))} style={tbtn} title="Zoom in"><i className="fa-solid fa-magnifying-glass-plus" style={{ fontSize: 11 }} /></button>
        <div style={{ width: 1, height: 18, background: '#555', margin: '0 4px' }} />
        <a href={url} download title="Download" style={{ ...tbtn, textDecoration: 'none' }}><i className="fa-solid fa-download" style={{ fontSize: 11 }} /></a>
        <a href={url} target="_blank" rel="noopener noreferrer" title="Open in new tab" style={{ ...tbtn, textDecoration: 'none' }}><i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 11 }} /></a>
      </div>

      {/* All pages */}
      <div ref={containerRef} onScroll={handleScroll} style={{ flex: 1, overflow: 'auto', padding: '12px 8px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#aaa', height: '100%' }}>
            <div style={{ width: 18, height: 18, border: '2px solid #888', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <span style={{ fontSize: 13 }}>Rendering PDF…</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {pages.map((pg, idx) => {
              const pgNum = idx + 1;
              // Backend bbox highlight (from LlamaParse OCR item positions)
              const backendHL = highlight && highlight.page_number === pgNum ? [highlight] : [];
              // Frontend text highlights (only works on PDFs with real text layer)
              const textHL = computedHighlights[pgNum] || [];
              // Combine both — backend bbox is primary, text search is supplementary
              const allHL = [...backendHL, ...textHL];

              return (
                <div key={pgNum} data-page={pgNum} style={{ position: 'relative', boxShadow: '0 2px 12px rgba(0,0,0,0.3)', background: '#fff' }}>
                  <img src={pg.imgSrc} alt={`Page ${pgNum}`} style={{ display: 'block', width: '100%', height: 'auto' }} draggable={false} />
                  {allHL.map((hl, i) => (
                    <div key={`hl-${pgNum}-${i}`} style={{
                      position: 'absolute',
                      left: `${hl.x}%`,
                      top: `${hl.y}%`,
                      width: `${hl.width}%`,
                      height: `${hl.height}%`,
                      backgroundColor: HL_COLOR,
                      mixBlendMode: 'multiply' as any,
                      borderRadius: 2,
                      border: HL_BORDER,
                      pointerEvents: 'none',
                    }} />
                  ))}
                  <div style={{ position: 'absolute', bottom: 4, right: 8, fontSize: 9, fontWeight: 600, color: '#999', background: 'rgba(255,255,255,0.8)', padding: '1px 6px', borderRadius: 3 }}>{pgNum}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const tbtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 4,
  border: 'none', background: 'transparent',
  color: '#ccc', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
