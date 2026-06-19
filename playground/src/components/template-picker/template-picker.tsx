import { Dialog } from '@base-ui/react/dialog';
import { Separator } from '@base-ui/react/separator';

import defaultTemplate from '../../templates/default';
import tilesetTemplate from '../../templates/tileset';
import spritesheetTemplate from '../../templates/spritesheet';
import audioTemplate from '../../templates/audio';

import styles from './template-picker.module.css';

type Props = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  setCode: (code: string) => void;
};

export function TemplatePicker(props: Props) {
  const { onOpenChange, open, setCode } = props;

  const loadTemplate = (template: string) => {
    setCode(template);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={styles.popup}>
          <div className={styles.intro}>
            <Dialog.Title className={styles.title}>Templates</Dialog.Title>
            <Dialog.Description className={styles.description}>This will replace the current code in the eidotr.</Dialog.Description>

            <button className={styles.button} onClick={() => loadTemplate(defaultTemplate)}>
              Bare bones template
            </button>
            <button className={styles.button} onClick={() => loadTemplate(tilesetTemplate)}>
              Tileset template
            </button>
            <button className={styles.button} onClick={() => loadTemplate(spritesheetTemplate)}>
              Spritesheet template
            </button>
            <button className={styles.button} onClick={() => loadTemplate(audioTemplate)}>
              Audio template
            </button>
          </div>
          <Separator orientation="horizontal" className={styles.separator} />
          <div className={styles.actions}>
            <Dialog.Close className={styles.button}>Close</Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
