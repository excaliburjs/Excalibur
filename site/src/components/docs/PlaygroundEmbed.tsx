import * as lz from "lz-string";

type Props =  {
  autoplay?: boolean;
  code: string;
  title?: string;
}

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
}

const PLAYGROUND_URL = 'https://excaliburjs.com/excalibur-playground';

export default ({ autoplay = true, code, title }: Props) => {
  const params = new URLSearchParams({
    embed: 'true',
    code: lz.compressToEncodedURIComponent(code)
  });
  
  if (autoplay) {
    params.set('autoplay', 'true');
  }
  
  const src = `${PLAYGROUND_URL}/?${params.toString()}`;

  return <iframe src={src} style={style} title={title} />
}