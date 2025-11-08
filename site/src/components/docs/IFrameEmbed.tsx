import React, { IframeHTMLAttributes } from 'react'

const style = {
  width: '100%',
  maxWidth: '640px',
  borderRadius: '12px',
  outline: '1px solid var(--ifm-color-emphasis-300)',
  outlineOffset: '4px',
  margin: '60px auto',
  display: 'block',
  height: '900px',
  border: 0,
  overflow: 'hidden',
} as const

type Props = IframeHTMLAttributes<HTMLIFrameElement>

export default ({ src, ...props }: Props) => (
  <iframe src={src} style={style} {...props}></iframe>
)
