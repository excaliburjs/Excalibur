import React from 'react'
import IFrameEmbed from './IFrameEmbed'

export default ({ src, title, ...props }) => (
  <IFrameEmbed
    src={src}
    style={{
      width: '100%',
      height: '700px',
      border: 0,
      borderRadius: '4px',
      overflow: 'hidden',
    }}
    title={title}
    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
    {...props}
  />
)
