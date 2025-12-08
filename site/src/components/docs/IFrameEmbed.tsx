import React, { IframeHTMLAttributes } from 'react'

const style = {
  width: '100%',
  height: '420px',
  border: 0,
  overflow: 'hidden',
} as const

type Props = IframeHTMLAttributes<HTMLIFrameElement>

export default ({ src, ...props }: Props) => (
  <iframe src={src} style={style} {...props}></iframe>
)
