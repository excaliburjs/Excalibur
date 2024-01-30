import React from 'react'

const FRAME_STYLE = {
  border: '1px solid #aaa',
}

/**
 * Embeds a Storybook example
 *
 * @prop story The story ID in the URL to navigate to
 */
export default function Example({ story = '' }) {
  const url = `/examples/?nav=0&path=/docs/${story}`;

  return (
    <iframe
      title="Excalibur Storybook Example"
      allowFullScreen
      src={url}
      frameBorder={0}
      width="100%"
      height="600"
      style={FRAME_STYLE}
    ></iframe>
  )
}
