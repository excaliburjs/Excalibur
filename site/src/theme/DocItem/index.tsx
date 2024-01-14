import React from 'react';
import DocItem from '@theme-original/DocItem';
import type { Props } from '@theme/DocItem';

export default function DocItemWrapper(props: Props) {
  const { metadata: { tags } } = props.content;
  const displayTags = tags.filter(t => !t.label.startsWith('#'));

  // HACK: Mutate the JSX element directly
  props.content.metadata.tags = displayTags;

  return (
    <DocItem {...props} />
  );
}
