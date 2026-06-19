import { Button } from '../button/button';
import { Moon } from '../icons/moon';
import { shareCode } from '../../utils/share';
import { Sun } from '../icons/sun';
import { Switch } from '../switch/switch';
import { TemplatePicker } from '../template-picker/template-picker';

import styles from './header.module.css';

type Props = {
  autoPlay: boolean;
  code: string;
  isLightMode: boolean;
  onPlay: () => void;
  setAutoPlay: (autoPlay: boolean) => void;
  setCode: (code: string) => void;
  setIsLightMode: (open: boolean) => void;
  setTemplatePickerOpen: (open: boolean) => void;
  templatePickerOpen: boolean;
};

export function Header(props: Props) {
  const { autoPlay, code, isLightMode, onPlay, setAutoPlay, setCode, setIsLightMode, setTemplatePickerOpen, templatePickerOpen } = props;

  return (
    <>
      <header className={styles.root}>
        <div className={styles.left}>
          <img className={styles.logo} src={isLightMode ? '/logo@2x.png' : '/logo-white@2x.png'} alt="Excalibur Playground" />
          <span className="sr-only">Excalibur Playground</span>
        </div>

        <div className={styles.right}>
          <div className={styles.group}>
            <Button variant="outline" onClick={() => shareCode(code)}>
              Share
            </Button>
            <Button variant="outline" onClick={() => setTemplatePickerOpen(true)}>
              Load
            </Button>
          </div>

          <div className={styles.group}>
            <Switch checked={isLightMode} onCheckedChange={setIsLightMode} variant="active" icon={isLightMode ? <Sun /> : <Moon />} />
          </div>

          <div className={styles.group}>
            <Switch checked={autoPlay} onCheckedChange={setAutoPlay}>
              Auto Play
            </Switch>
            <Button variant="primary" disabled={autoPlay} onClick={onPlay}>
              Run
            </Button>
          </div>
        </div>
      </header>

      <TemplatePicker open={templatePickerOpen} onOpenChange={setTemplatePickerOpen} setCode={setCode} />
    </>
  );
}
