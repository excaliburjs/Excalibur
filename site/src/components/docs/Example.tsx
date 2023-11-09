import React from 'react'
import useBaseUrl from '@docusaurus/useBaseUrl'
import { usePluginData } from '@docusaurus/useGlobalData';

const FRAME_STYLE = {
  border: '1px solid #aaa',
}

/**
 * Embeds a Storybook example
 *
 * @prop story The story ID in the URL to navigate to
 */
export default function Example({ story = '' }) {
  const { devServerAddress, basePath } = usePluginData('storybook-plugin') as { devServerAddress?: string; basePath: string; };
  const buildUrl = useBaseUrl(`/${basePath}/?nav=0&path=/docs/${story}`);
  const devUrl = `${devServerAddress}?nav=0&path=/docs/${story}`;
  http://localhost:3000/examples/iframe.html?args=&id=audio--playing-a-sound
  return (
    <iframe
      title="Excalibur Storybook Example"
      allowFullScreen
      src={devServerAddress ? devUrl : buildUrl}
      frameBorder={0}
      width="100%"
      height="600"
      style={FRAME_STYLE}
    ></iframe>
  )
}
