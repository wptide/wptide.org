# Tide Contributing Guide

There are many ways to contribute to Tide. You can help us champion the adoption of quality testing results in the WordPress project. You can also help by contributing code or documentation to Tide itself.

Note that you can also contribute to [WordPress meta](https://make.wordpress.org/meta/handbook/documentation/contributing-with-git/) to improve the WordPress plugin directory.

Before submitting your contribution, please make sure to take a moment and read through the following guidelines.

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](../code-of-conduct/README.md). By participating, you are expected to uphold this code. Please report unacceptable behavior by [contacting us](../README.md#contact-us).

## Issue Reporting Guidelines

- The Issue list of this repo is **exclusively** for bug reports and feature requests.
- Try to search for your issue, it may have already been answered or even fixed in the `develop` branch.
- Check if the issue is reproducible with the latest stable version. If you are using a pre-release, please indicate the specific version you are using.
- It is **required** that you clearly describe the steps necessary to reproduce the issue you are running into. Issues without clear reproducible steps will be closed immediately.
- If your issue is resolved but still open, don't hesitate to close it. In case you found a solution by yourself, it could be helpful to explain how you fixed it.

## Pull Request Guidelines

- Checkout a topic branch from `develop` and merge back against `develop`.
  - If you are not familiar with branching please read [_A successful Git branching model_](http://nvie.com/posts/a-successful-git-branching-model/) before you go any further.
- If adding a new feature:
  - Add accompanying test case.
  - Provide convincing reason to add this feature. Ideally you should open a suggestion issue first and have it green-lit before working on it.
- If fixing a bug:
  - Provide detailed description of the bug in the PR. Live demo preferred.
  - Add appropriate test coverage if applicable.

GitHub Actions will run the unit tests and linter whenever you push changes to your PR. All jobs are required to pass successfully for a merge to be considered.

## Coding standards

All contributions to this project will be checked against the [Airbnb Javascript Style Guide](https://github.com/airbnb/javascript) using ESLint.

To verify your code meets the requirements, use the following command:

    npm run lint

_A `pre-commit` hook should run each time you attempt to commit code, which will automatically run the linter._

To fix linting issues, use the following command:

    npm run lint:fix

## Tests

[Jest](https://jestjs.io/) is used as the JavaScript unit testing framework.

To run the tests, use the following command:

    npm run test

_A `pre-push` hook should run each time you attempt to push code, which will automatically run the tests._

To run tests while watching for code changes, use the following command:

    npm run test:watch

To run tests with coverage, use the following command:

    npm run test:coverage

## Profile Badges

As outlined in [the announcement post](https://make.wordpress.org/tide/2019/06/20/tide-profile-badges/), badges related to work on Tide are awarded as follows:

### Tide Team

![](../../.vuepress/public/assets/img/Tide-Team.png)

The Tide Team badge will be manually assigned to all active Tide maintainers – i.e those who are listed as “Maintainers” on [this page](../README.md#maintainers).

### Tide Contributor

![](../../.vuepress/public/assets/img/Tide-Contributor.png)

The Tide Contributor badge will be manually assigned to those who provide valuable contributions to Tide -- i.e. those who are listed as “Contributors” on [this page](../README.md#contributors)).

*The easiest way to have the Tide Team or Tide Contributor badges assigned to you is for you to request them (the system doesn’t allow us to add the badge to your profile until you submit a request). To make this request please go the [Tide Team](https://profiles.wordpress.org/associations/tide-team/) or [Tide Contributor](https://profiles.wordpress.org/associations/tide-contributor/) pages and request membership for the group.*
