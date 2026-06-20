import { Audio } from '../icons/audio';

import styles from './file-browser.module.css';

type Type = 'image' | 'audio';

type File = {
  name: string;
  path: string;
  type: Type;
  credit?: string;
  creditUrl?: string;
};

const files: Array<File> = [
  {
    name: 'playerRun',
    path: import.meta.env.VITE_PLAYGROUND_PATH + '/player-run.png',
    type: 'image'
  },
  {
    name: 'tinytown',
    path: import.meta.env.VITE_PLAYGROUND_PATH + '/tiny-town/tilemap/tilemap.png',
    type: 'image',
    credit: 'Kenney',
    creditUrl: 'https://kenney.nl/assets'
  },
  {
    name: 'coins',
    path: import.meta.env.VITE_PLAYGROUND_PATH + '/rpg-audio/audio/handleCoins.ogg',
    type: 'audio',
    credit: 'Kenney',
    creditUrl: 'https://kenney.nl/assets'
  },
  {
    name: 'planet00',
    path: import.meta.env.VITE_PLAYGROUND_PATH + '/planets/planet00.png',
    type: 'image',
    credit: 'Kenney',
    creditUrl: 'https://kenney.nl/assets'
  },
  {
    name: 'planet01',
    path: import.meta.env.VITE_PLAYGROUND_PATH + '/planets/planet01.png',
    type: 'image',
    credit: 'Kenney',
    creditUrl: 'https://kenney.nl/assets'
  },
  {
    name: 'planet02',
    path: import.meta.env.VITE_PLAYGROUND_PATH + '/planets/planet02.png',
    type: 'image',
    credit: 'Kenney',
    creditUrl: 'https://kenney.nl/assets'
  }
];

const snippets: Record<Type, (name: string, path: string) => string> = {
  audio: (name: string, path: string) =>
    `
const resources = {
  ${name}: new ex.Sound('${path}'),
} as const;
  `.trim(),
  image: (name: string, path: string) =>
    `
const resources = {
  ${name}: new ex.ImageSource('${path}'),
} as const;
  `.trim()
};

export function FileBrowser() {
  return (
    <div className={styles.root}>
      <div className={styles.info}>
        The following assets can be used in the playground. <br />
        Simply copy the snippet below to the editor.
      </div>

      <ul className={styles.list}>
        {files.map((file, index) => (
          <li key={index} className={styles.item}>
            <div className={styles.header}>{file.name}</div>
            <div className={styles.source}>
              {file.type === 'image' ? <img className={styles.image} src={file.path} /> : null}
              {file.type === 'audio' ? (
                <div className={styles.audio}>
                  <Audio />
                </div>
              ) : null}
            </div>
            <pre className={styles.snippet}>{snippets[file.type](file.name, file.path)}</pre>
            {file.credit ? (
              <div className={styles.credit}>
                Credit:
                <a href={file.creditUrl} target="_blank" referrerPolicy="no-referrer">
                  {file.credit}
                </a>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
