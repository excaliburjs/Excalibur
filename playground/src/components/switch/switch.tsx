import type { ReactNode } from 'react';
import { Switch as SwitchPrimitive } from '@base-ui/react/switch';

import styles from './switch.module.css';
import clsx from 'clsx';

type Props = {
  checked: boolean;
  children?: ReactNode;
  icon?: ReactNode;
  onCheckedChange: (checked: boolean) => void;
  // inactive renders the thumb as grey when off, active renders the thumb as purple when off
  variant?: 'inactive' | 'active';
};

export function Switch(props: Props) {
  const { checked, children, icon, onCheckedChange, variant = 'inactive' } = props;

  return (
    <label className={clsx(styles.root, styles[variant])}>
      <SwitchPrimitive.Root defaultChecked className={styles.switch} checked={checked} onCheckedChange={onCheckedChange}>
        <SwitchPrimitive.Thumb className={styles.thumb}>{icon}</SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>
      {children}
    </label>
  );
}
