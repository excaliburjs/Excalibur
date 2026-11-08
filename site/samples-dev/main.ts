// Lists every blog sample and runs the one named in ?sample=<post>/<name>.
// Each sample boots its own ex.Engine against #preview-canvas, so switching samples reloads the page.
const samples = import.meta.glob('../blog/**/samples/*.ts');

type Entry = { key: string; post: string; name: string; load: () => Promise<unknown> };
const entries: Entry[] = Object.entries(samples)
  .map(([file, load]) => {
    const match = /\.\.\/blog\/(.+?)\/samples\/(.+)\.ts$/.exec(file)!;
    const post = match[1].split('/').pop()!;
    return { key: `${post}/${match[2]}`, post, name: match[2], load };
  })
  .sort((a, b) => a.key.localeCompare(b.key));

const selected = new URLSearchParams(location.search).get('sample') ?? entries[0]?.key;

const nav = document.getElementById('nav')!;
let currentPost = '';
for (const entry of entries) {
  if (entry.post !== currentPost) {
    currentPost = entry.post;
    const heading = document.createElement('h2');
    heading.textContent = entry.post;
    nav.appendChild(heading);
  }
  const link = document.createElement('a');
  link.href = `?sample=${encodeURIComponent(entry.key)}`;
  link.textContent = entry.name;
  if (entry.key === selected) {
    link.classList.add('active');
  }
  nav.appendChild(link);
}

const current = entries.find((entry) => entry.key === selected);
if (current) {
  document.title = `${current.name} · Excalibur blog samples`;
  current.load().catch((error) => {
    console.error(error);
    document.getElementById('preview')!.innerHTML = `<pre style="color:#f88;padding:16px;white-space:pre-wrap">${String(error)}</pre>`;
  });
} else {
  document.getElementById('preview')!.innerHTML = '<p id="hint">No blog samples found under site/blog/**/samples/*.ts</p>';
}
