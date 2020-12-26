# How to Contribute

#### Code of Conduct

This project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.

#### Questions

Have questions? Ask them in our [forum]!

#### Table of Contents

- [Reporting Bugs](#reporting-bugs)
- [Suggesting Improvements](#suggesting-improvements)
- [Submitting Changes](#submitting-changes)
  - [Getting Started](#getting-started)
  - [Creating a Pull Request](#creating-a-pull-request)
  - [Code Organization](#code-organization)
- [Styleguides](#styleguides)
  - [Code](#code)
  - [Commit Messages](#commit-messages)
  - [Tests](#tests)
  - [Documentation](#documentation)
- [Issue Labels](#issue-labels)

## Reporting Bugs

Before reporting a bug, please perform the following troubleshooting steps:

1.  Check to see if the problem has already been reported
    - Take a look through the list of [known bugs][search-label-bug] to see if someone has already created an issue that describes the problem you’re experiencing. If an issue already exists, consider adding any additional context you have about the problem in a comment on that issue.
2.  Try the latest stable version of Excalibur
    - If you’re not using the latest [release][releases], the problem may already be fixed. Please upgrade to the latest stable version and see if you still experience the problem.
    - Alternatively, if you’re using a new unstable release, try rolling back to the latest stable release.
3.  Try using older versions of Excalibur
    - If you’re already using the latest release, try out the previous few versions. This will help us determine where the problem first appeared.
4.  Try different browsers
    - The problem you’re seeing may only appear in certain browsers or mobile devices. If you can, please try several different browsers/platforms to see if the issue persists.

## Suggesting Improvements

Please do a quick search through our [backlog][issues] to see if your improvement has already been suggested. If so, feel free to provide additional comments or thoughts on the existing issue.

## Submitting Changes

### Getting Started

Below is the general workflow for submitting changes:

1.  [Discuss an issue you want to contribute to](#discussing-a-contribution)
2.  Create a fork of Excalibur
3.  Commit to your fork with your initial changes
4.  [Submit a work-in-progress pull request to discuss with the maintainers](#creating-a-pull-request)
5.  Make changes to your pull request as needed
6.  Once your changes are merged, celebrate!

If you’re not sure where to start, take a look at the "good first issue" or "help wanted" [issue labels](#issue-labels).

- Issues tagged with "good first issue" are designed as an introduction to contributing to open source and the Excalibur project as a whole.
- Issues tagged with "help wanted" tend to be more involved than good first issues.

#### Discussing a Contribution

It's helpful to let us know that you'd like to contribute for an issue, to prevent duplicate work. Ask us any questions you have about the issue, so that we can clarify the work you'll need to do. We're here to help!

#### Creating a Pull Request

- Please ensure that there is an issue created for what you're working on. This helps us track the work being done!
- Open a pull request as soon as you feel you have the beginning of something workable, or if you have design ideas to discuss. Getting feedback from us early will help you with your work! We will flag the pull request as Work-In-Progress while we work with you on your contribution.
- Do all of your work in a new git branch. Only include code in the branch for the single issue you are working on.
- Include Jasmine tests for your changes, following our [styleguide](#tests). Put them in the src/spec folder.
- Document new public methods and properties based on the [styleguide](#documentation).
- If you've modified Excalibur code (i.e. not just tests or documentation), update CHANGELOG.md with your changes. The changelog is reserved for concise consumer-centric changes; all other information should be included appropriately as code comments, API documentation, or additional documentation. The categories we use are adapted from [Keep a Changelog][keep-a-changelog]:
  - `Breaking Changes` for changes to the existing API that are not backwards compatible
  - `Added` for new features
  - `Changed` for changes in existing functionality
  - `Deprecated` for features that will be removed in an upcoming release (see also [deprecating code](#deprecating-code))
  - `Fixed` for bug fixes
- Please follow our [styleguide](#commit-messages) for your commit messages.
- Send a pull request via Github.
  - Format your pull request title as: [#issue_number] Your commit message (where issue_number is the issue you're closing), and fill out the pull request template that automatically populates the editor window. Please format your pull request title according to our [commit message styleguide](#commit-messages).

#### Deprecating Code

If you've replaced a piece of Excalibur's API, please mark it as `@obsolete` and provide the new preferred method of performing the same task. Don't forget to include which release it will be removed in! Deprecations are typically performed during the next release, so if your changes are made for the 0.1.0 release, they will be removed in 0.2.0.

If the code you are deprecating is called anywhere else in Excalibur, or in any documentation, please update those places to use the new code you've written.

example:

```ts
/** @obsolete use [[SomeClass]].someNewFunction instead **/
@obsolete({message: 'ex.SomeClass.someFunction is deprecated, and will be removed in 0.2.0',
	alternateMethod: 'SomeClass.someNewFunction'})
public someFunction() {...}
```

#### Code Organization

Excalibur uses an AMD bundler using TypeScript to generate a browser self-bootstrapping bundle.

The Excalibur public API (i.e. `ex.*`) is defined in `src/engine/index.ts`. Any new classes or APIs that should be made available publicly should be exported there. The AMD bundler will then ensure the APIs or classes are exposed in the browser.

An example of exporting all public members from a new `MyClass.ts` that contains a `MyClass` ES6 class:

```ts
export * from './MyClass';
// ex.MyClass will be exposed
```

If the members should be aliased under a different name (namespaced) such as `ex.Feature.*`, you can import-export the members as a new name:

```ts
// ex.Feature namespace
import * as feature from './MyClass';
export { feature as Feature };
// ex.Feature.MyClass will be exposed
```

## Styleguides

#### Code

A number of our code formatting rules are enforced via linting. When you build Excalibur on your computer, the linter will make sure that certain aspects of your code are formatted properly. Additionally:

- Use 3 spaces for indenting
- All methods must explicitly specify their access modifier (public, private, etc.)
- Use the CamelCase naming convention, with a lowercase first letter for variables.

#### Commit Messages

Follow the guidelines below to help maintain a readable and informative git history:

- Use present tense verbs (“Fix bug where…” instead of “Fixed bug where…”)
- Use imperative mood (“Add new feature” instead of “Adds new feature”)
- Capitalize the first letter of the first line
- Limit the first line to 50 characters or less
- Separate the message subject from the rest of the commit with a blank line
- Limit lines in the message body to 72 characters or less
- Reference issue and pull request numbers as appropriate
- Use hyphens for bulleted lists
- If your change is small, you may only need to write a single line commit message, e.x. “Fix typo in documentation”

Here are the guidelines applied in a sample commit message, along with some additional helpful hints:

```
Summarize what the commit does in <=50 characters

Here is where you would put additional context if you needed to explain
what your changes are doing in more detail. Lines in the body shouldn't
be more than 72 characters long. Don't forget to add a blank line
between the subject and the body!

Explain what problem this commit is solving. Why are you making this
change? Does your change introduce potential issues?

 - If you need a bulleted list, use hyphens
 - Here’s another item for the list

If you feel like you need another paragraph, go ahead and add one. Add
another blank line between each paragraph.

Referencing relevant issue and pull request numbers is very important
to help everyone understand what you're working on. Add them at the
bottom of your commit message.

Resolves: #100
See also: #200, #300
```

#### Tests

All features, changes, and bug fixes must be tested by specifications (unit tests). Write tests to cover any potential scenarios your code introduces.

Here’s an example:

```javascript
describe('a monkey', () => {
  it('climbs trees', () => {
    // put your spec here to show that monkeys climb trees
  });
  describe('when the monkey is hungry', () => {
    it('eats a banana', () => {
      // put your spec here to show that this is true
    });
  });
});
```

#### Documentation

- Add JSDoc comments to all public and protected methods
- Link to other classes using the TypeDoc double bracket notation.

## Issue Labels

- [good first issue][search-label-good first issue]: issues that are good starting points for new contributors to open source
- [help wanted][search-label-help wanted]: issues that are more in-depth and may require a certain platform or skillset to implement
- [bug][search-label-bug]: a problem or an unexpected behavior

If you'd like to contribute, these labels are good places to start. Our remaining labels are documented on the [Labels page](https://github.com/excaliburjs/Excalibur/labels).

[forum]: https://github.com/excaliburjs/Excalibur/discussions
[releases]: https://github.com/excaliburjs/Excalibur/releases
[issues]: https://github.com/excaliburjs/Excalibur/issues
[keep-a-changelog]: http://keepachangelog.com/en/0.3.0/
[search-label-good first issue]: https://github.com/excaliburjs/Excalibur/labels/good%20first%20issue
[search-label-help wanted]: https://github.com/excaliburjs/Excalibur/labels/help%20wanted
[search-label-bug]: https://github.com/excaliburjs/Excalibur/labels/bug
[search-label-api change]: https://github.com/excaliburjs/Excalibur/labels/api%20change
[search-label-feature]: https://github.com/excaliburjs/Excalibur/labels/feature
[search-label-enhancement]: https://github.com/excaliburjs/Excalibur/labels/enhancement
[search-label-optimization]: https://github.com/excaliburjs/Excalibur/labels/optimization
[search-label-extension]: https://github.com/excaliburjs/Excalibur/labels/extension
[search-label-tools]: https://github.com/excaliburjs/Excalibur/labels/tools
[search-label-docs]: https://github.com/excaliburjs/Excalibur/labels/docs
[search-label-organization]: https://github.com/excaliburjs/Excalibur/labels/organization
[search-label-on-deck]: https://github.com/excaliburjs/Excalibur/labels/on-deck
[search-label-duplicate]: https://github.com/excaliburjs/Excalibur/labels/duplicate
[search-label-invalid]: https://github.com/excaliburjs/Excalibur/labels/invalid
[search-label-wontfix]: https://github.com/excaliburjs/Excalibur/labels/wontfix
