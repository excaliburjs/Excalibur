import type { SVGProps } from 'react';

export function Audio(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15" {...props}>
      {/* Icon from Teenyicons by smhmd - https://github.com/teenyicons/teenyicons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M13.5 3.5h.5v-.207l-.146-.147zm-3-3l.354-.354L10.707 0H10.5zm-3 4l.4-.3a.5.5 0 0 0-.9.3zm.3.4l.4-.3zm4.7 9.1h-10v1h10zM2 13.5v-12H1v12zm11-10v10h1v-10zM2.5 1h8V0h-8zm7.646-.146l3 3l.708-.708l-3-3zM2.5 14a.5.5 0 0 1-.5-.5H1A1.5 1.5 0 0 0 2.5 15zm10 1a1.5 1.5 0 0 0 1.5-1.5h-1a.5.5 0 0 1-.5.5zM2 1.5a.5.5 0 0 1 .5-.5V0A1.5 1.5 0 0 0 1 1.5zM6 11a1 1 0 0 1-1-1H4a2 2 0 0 0 2 2zm1-1a1 1 0 0 1-1 1v1a2 2 0 0 0 2-2zM6 9a1 1 0 0 1 1 1h1a2 2 0 0 0-2-2zm0-1a2 2 0 0 0-2 2h1a1 1 0 0 1 1-1zm1-1.5V10h1V6.5zM8 7V4.5H7V7zm-.9-2.2l.3.4l.8-.6l-.3-.4zm.3.4A4.5 4.5 0 0 0 11 7V6a3.5 3.5 0 0 1-2.8-1.4z"
      />
    </svg>
  );
}
