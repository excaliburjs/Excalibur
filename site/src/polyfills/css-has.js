import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  require('css-has-pseudo/browser').cssHasPseudo(document);
}