import * as lz from 'lz-string';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useEffect, useRef, useState } from 'react';

type Props = {
  autoplay?: boolean;
  code: string;
  title?: string;
  mount?: 'immediately' | 'visible';
};

const rootStyle = {
  width: '100%',
  maxWidth: '640px',
  borderRadius: '12px',
  outline: '1px solid var(--ifm-color-emphasis-300)',
  outlineOffset: '4px',
  margin: '60px auto',
  display: 'block',
  height: '900px',
  border: 0,
  overflow: 'hidden'
};

const iframeStyle = {
  width: '100%',
  display: 'block',
  height: '100%',
  border: 0,
  overflow: 'hidden'
};

export default (props: Props) => {
  const { autoplay = true, code, title, mount = 'immediately' } = props;

  const [isReady, setIsReady] = useState(mount === 'immediately');
  const ref = useRef<HTMLDivElement>(null);

  const params = new URLSearchParams({
    embed: 'true',
    code: lz.compressToEncodedURIComponent(code)
  });

  const { siteConfig } = useDocusaurusContext();
  const { customFields } = siteConfig;
  const { playgroundUrl } = customFields;

  if (autoplay) {
    params.set('autoplay', 'true');
  }

  const src = `${playgroundUrl}/?${params.toString()}`;

  useEffect(() => {
    if (mount !== 'visible') {
      return;
    }

    const updateEntry = (entries: IntersectionObserverEntry[]): void => {
      // This is a one-way gate: 
      // Exiting the viewpoint will _not_ unmount the Playground
      if (!entries.every((entry) => entry.isIntersecting)) {
        return;
      }

      setIsReady(true);
    };

    const node = ref?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!node || !hasIOSupport) return;

    // When 25% of the Playground is visible it is considered and mounted. 
    const observer = new IntersectionObserver(updateEntry, { threshold: 0.25 });
    observer.observe(node);

    return () => observer.disconnect();
  }, [mount]);

  return (
    <div ref={ref} style={rootStyle}>
      {isReady ? <iframe src={src} style={iframeStyle} title={title} /> : null}
    </div>
  );
};
