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
  const { address } = usePluginData('storybook-plugin') as { address?: string };
  const buildUrl = useBaseUrl(`/examples/?nav=0&path=/docs/${story}`);
  const devUrl = `${address}?nav=0&path=/docs/${story}`;

  return (
    <iframe
      title="Excalibur Storybook Example"
      allowFullScreen
      src={address ? devUrl : buildUrl}
      frameBorder={0}
      width="100%"
      height="600"
      style={FRAME_STYLE}
    ></iframe>
  )
}
