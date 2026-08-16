import React, {useState, useRef, useEffect, useCallback} from 'react';
import OriginalMermaid from '@theme-original/Mermaid';
import type {Props} from '@theme/Mermaid';

/**
 * Wraps the docusaurus mermaid renderer with a click-to-zoom lightbox so dense
 * sequence diagrams (like the Lifecycle Events reference) remain readable even
 * when shrunk to fit the doc column.
 *
 * Behavior:
 * - Hovering the diagram reveals a small "expand" button in the top-right corner.
 * - Clicking either the diagram or the button opens a fullscreen overlay.
 * - The overlay renders the SVG at its intrinsic (native) size inside a
 *   scrollable container, so wide diagrams pan horizontally and vertically.
 * - Close on ESC, backdrop click, or the X button.
 */
export default function MermaidZoomable(props: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [svgHtml, setSvgHtml] = useState<string>('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback(() => {
    const container = wrapperRef.current?.querySelector('.docusaurus-mermaid-container');
    const svg = container?.querySelector('svg');
    if (svg) {
      const clone = svg.cloneNode(true) as SVGElement;

      // Mermaid sets width/height to "100%" and a style attribute with
      // max-width constraints. In the lightbox (no sized parent) those
      // collapse to 0×0. Pull the intrinsic size from the viewBox, fall
      // back to the rendered bounding rect, and set explicit pixel
      // dimensions on the clone so it renders at its natural size.
      let w = 0;
      let h = 0;
      const viewBox = clone.getAttribute('viewBox');
      if (viewBox) {
        const parts = viewBox.split(/\s+/);
        if (parts.length === 4) {
          w = parseFloat(parts[2]);
          h = parseFloat(parts[3]);
        }
      }
      if (!w || !h) {
        const rect = svg.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
      }
      clone.setAttribute('width', String(w));
      clone.setAttribute('height', String(h));
      clone.removeAttribute('style');
      clone.style.maxWidth = 'none';
      clone.style.width = `${w}px`;
      clone.style.height = `${h}px`;

      const serializer = new XMLSerializer();
      setSvgHtml(serializer.serializeToString(clone));
      setIsOpen(true);
    }
  }, []);

  // Lock background scroll while overlay is open
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <>
      <div
        className="mermaid-zoomable"
        ref={wrapperRef}
        onClick={handleOpen}
        title="Click to zoom">
        <OriginalMermaid {...props} />
        <button
          type="button"
          className="mermaid-zoom-button"
          aria-label="Zoom diagram"
          onClick={(e) => {
            e.stopPropagation();
            handleOpen();
          }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div
          className="mermaid-zoom-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed diagram"
          onClick={() => setIsOpen(false)}>
          <button
            type="button"
            className="mermaid-zoom-close"
            aria-label="Close zoom"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div
            className="mermaid-zoom-content"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{__html: svgHtml}}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}