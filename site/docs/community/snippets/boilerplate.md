---
title: Snippet Contribution Boilerplate
description: Instructions and template for creating a community snippet.
hide_table_of_contents: true
---

# 🛠️ How to Contribute a Community Snippet

This guide explains **how to structure, write, and submit a snippet** so it appears correctly in the ExcaliburJS community snippets library.

---

## 1️⃣ Directory Structure

Each snippet should live in its **own folder** under the appropriate category:
Any images or downloadable modules should reside in the assets folder

```bash
docs/community/snippets/<category>/<your-snippet-name>/
index.md <-- main snippet file
/assets/demo.gif <-- optional visual demonstration or static assets
/assets/myComponent.ts  <-- optional downloadable module
```

**Categories** might include:

- `components-systems`  
- `ui-hud`  
- `misc-utilities`  
- `materials-postprocessors`  

For example:

```
docs/community/snippets/ui-hud/button-effects/index.md
docs/community/snippets/ui-hud/button-effects/assets/demo.gif
```

## 2️⃣ Your markdown file should have a header and include this content:

```
//index.md
---
title: Button Effects
description: Adds hover and click effects to buttons in ExcaliburJS.
tags: [ui, component]
author: Jane Doe
date: 2025-10-18
---
```

Field explanations:

| Field         | Purpose                                             |
| ------------- | --------------------------------------------------- |
| `title`       | Name of the snippet (shows in cards & page headers) |
| `description` | Short summary (shows in cards)                      |
| `tags`        | Array of relevant tags (used for filtering/search)  |
| `author`      | Contributor name                                    |
| `date`        | Submission date                                     |

There should be a title, feature description, code blocks demonstrating usage, and optionally, embedded demonstrations of snippet's usage

```
# Button Effects

This snippet demonstrates hover and click effects for buttons in ExcaliburJS.

---

## Code Example

```ts
import * as ex from 'excalibur';

class Button extends ex.ScreenElement {
    // snippet code here
}

```


---

## 3️⃣ Managing Images / GIFs

- Place images or GIFs **inside your local assets folder**.  
- Reference them with a **relative path** in the `demo` frontmatter or Markdown content.  
- Example: `demo: ./assets/demo.gif` or `![Demo](./assets/demo.gif)`  

---

## 4️⃣ Submitting Your Snippet

1. Fork the [ExcaliburJS repository](https://github.com/excaliburjs/Excalibur).  
2. Add your snippet folder with `index.md` and any media.  
3. Push to your fork and submit a pull request.  

Once approved, your snippet will automatically appear in the **community snippets gallery**.

---

## 5️⃣ Best Practices

- Discuss - reach out and discuss on the discord server with the core contributors
- Keep **titles and descriptions clear**.  
- Include **tags** for discoverability.  
- Demo images are optional but recommended.  
- Code examples should be **minimal, copy-paste-ready, and functional**.  
- Follow the **directory structure** closely to avoid broken links or missing cards.
