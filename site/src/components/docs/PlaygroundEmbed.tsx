import * as lz from "lz-string";

type Props =  {
  code: string;
}

const style = {
  width: '100%',
  height: '600px',
  border: 0,
  overflow: 'hidden',
}

const PLAYGROUND_URL = 'https://excaliburjs.com/excalibur-playground';

export default ({ code }: Props) => {
  const src = `${PLAYGROUND_URL}/?embed=true&code=${lz.compressToEncodedURIComponent(code)}`

  return <iframe src={src} style={style} />
}