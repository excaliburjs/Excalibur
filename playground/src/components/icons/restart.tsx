import type { SVGProps } from 'react';

export function Restart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15" {...props}>
      {/* Icon from Teenyicons by smhmd - https://github.com/teenyicons/teenyicons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 7.5A6.5 6.5 0 007.5 1V0a7.5 7.5 0 015.099 13H15v1h-4v-4h1v2.19a6.48 6.48 0 002-4.69zM2.4 2H0V1h4v4H3V2.81A6.5 6.5 0 007.5 14v1A7.5 7.5 0 012.4 2z"
      />
    </svg>
  );
}