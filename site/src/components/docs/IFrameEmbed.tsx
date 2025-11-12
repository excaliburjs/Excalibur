import React, { IframeHTMLAttributes } from 'react'

const DEFAULT_FRAME_STYLES = {
  regular: {
    width: '100%',
    height: '420px',
    border: 0,
    overflow: 'hidden',
  },
  playground: {
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
  },
} as const

type Props = IframeHTMLAttributes<HTMLIFrameElement> & {
  variant: 'regular' | 'playground'
}

export default ({ src, variant, ...props }: Props) => (
  <iframe src={src} style={DEFAULT_FRAME_STYLES[variant]} {...props}></iframe>
)
