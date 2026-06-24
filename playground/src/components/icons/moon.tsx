import type { SVGProps } from 'react';

export function Moon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15" {...props}>
      {/* Icon from Teenyicons by smhmd - https://github.com/teenyicons/teenyicons/blob/master/LICENSE */}
      <path fill="currentColor" d="M7.707.003a.5.5 0 0 0-.375.846a6 6 0 0 1-5.569 10.024a.5.5 0 0 0-.519.765A7.5 7.5 0 1 0 7.707.003" />
    </svg>
  );
}
