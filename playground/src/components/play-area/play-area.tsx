import { Tabs } from '../tabs/tabs';

export function PlayArea() {
  return (
    <Tabs
      value="preview"
      onChange={() => {}}
      items={[
        {
          label: 'Preview',
          value: 'preview',
          content: <canvas id="preview-canvas" />
        }
      ]}
    />
  );
}
