import type { SVGProps } from 'react';

export function Sun(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15" {...props}>
      {/* Icon from Teenyicons by smhmd - https://github.com/teenyicons/teenyicons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M8 2V0H7v2zm-4.793.498L1.5.792L.793 1.5L2.5 3.206zm9.293.708L14.207 1.5L13.5.792l-1.707 1.706zm-5 .791a3.499 3.499 0 1 0 0 6.996a3.499 3.499 0 1 0 0-6.996M2 6.995H0v1h2zm13 0h-2v1h2zM1.5 14.199l1.707-1.707l-.707-.707l-1.707 1.706zm12.707-.708L12.5 11.785l-.707.707L13.5 14.2zM8 14.99v-1.998H7v1.999z"
      />
    </svg>
  );
}
