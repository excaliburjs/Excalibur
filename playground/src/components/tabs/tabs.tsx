import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import type { ReactNode } from 'react';

import styles from './tabs.module.css';

type Props = {
  value: string;
  onChange: (value: string) => void;
  items: Array<{
    label: string;
    value: string;
    content: ReactNode;
  }>;
};

export function Tabs(props: Props) {
  const { items, value, onChange } = props;
  return (
    <TabsPrimitive.Root className={styles.root} value={value} onValueChange={onChange}>
      <TabsPrimitive.List className={styles.list}>
        {items.map((item) => (
          <TabsPrimitive.Tab className={styles.tab} value={item.value} key={item.value}>
            {item.label}
          </TabsPrimitive.Tab>
        ))}
      </TabsPrimitive.List>
      <div className={styles.panelViewport}>
        {items.map((item) => (
          <TabsPrimitive.Panel className={styles.panel} value={item.value} key={item.value}>
            {item.content}
          </TabsPrimitive.Panel>
        ))}
      </div>
    </TabsPrimitive.Root>
  );
}
