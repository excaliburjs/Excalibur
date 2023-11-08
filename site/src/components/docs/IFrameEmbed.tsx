import React, { IframeHTMLAttributes } from 'react'

const DEFAULT_FRAME_STYLE = {
  width: '100%',
  height: '420px',
  border: 0,
  overflow: 'hidden',
}

export default ({ src, ...props }: IframeHTMLAttributes<HTMLIFrameElement>) => (
  <iframe src={src} style={DEFAULT_FRAME_STYLE} {...props}></iframe>
)
