import styles from './file-browser.module.css';

const files = [
  { name: 'tinytown', path: import.meta.env.VITE_PLAYGROUND_PATH + '/tiny-town/tilemap/tilemap.png' },
  { name: 'playerRun', path: import.meta.env.VITE_PLAYGROUND_PATH + '/player-run.png' }
] as const;

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
            <img className={styles.image} src={file.path} />
            <div className={styles.contents}>
              {file.name}
              <pre>
                <div>const resources = &#123;</div>
                <div>
                  &nbsp;&nbsp;{file.name}: new ex.ImageSource('{file.path}'),
                </div>
                <div>&#125; as const;</div>
              </pre>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
