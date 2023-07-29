# zooduck/lazy-loader

A functional component for lazy loading images.

Automatically generates image placeholders and defers loading of images until they are visible in the viewport.

Supports `<img>` and `<picture>` elements.

## Demo

Visit [Github Pages](https://zooduck.github.io/lazy-loader/) to see this component in action.

## Getting started

Simply add the following script tag to your document head:

```html
<script src="https://cdn.jsdelivr.net/gh/zooduck/lazy-loader@master/dist/index.module.js" type="module"></script>
```

Or import using a module file:

```javascript
import 'https://cdn.jsdelivr.net/gh/zooduck/lazy-loader@master/dist/index.module.js'
```

## Prerequisites

*Always* include `width` and `height` attributes on your `<img>` element (or each `<source>` element when using `<picture>`).

Aside from being best practice, this information is critical for creating placeholders with the correct aspect ratio.

## Use

### &lt;img&gt;

Simply wrap your `<img>` element in a `<lazy-loader>` element:

```html
<lazy-loader>
  <img
    src="assets/example.jpg"
    width="100"
    height="50"
    alt="Example image">
</lazy-loader>
```

### &lt;picture&gt;

For `<picture>` elements, wrap the `<picture>` element and ***not*** the `<img>` element:

```html
<lazy-loader>
  <picture>
    <source
      media="(max-width: 320px)"
      src="assets/portrait.jpg"
      width="480"
      height="640">
    <source
      media="(min-width: 321px)"
      src="assets/landscape.jpg"
      width="640"
      height="480">
    <img
      src="assets/portrait.jpg"
      width="480"
      height="640"
      alt="Example image">
  </picture>
</lazy-loader>
```

**Warning!** Don't forget to provide `width` and `height` attributes for *each* `<source>` element!

## Setting a threshold

By default, images start loading as soon as their placeholder enters the viewport. This should be suitable for the majority of use cases.

However, you may want to delay loading until x% of the placeholder is visible in the viewport.

In that case, there is an optional `threshold` attribute which accepts floating point values between `0` and `1`.

In the following example, loading is deferred until 50% of the image placeholder is visible in the viewport:

```html
<lazy-loader threshold="0.5">
  <img
    src="assets/example.jpg"
    width="100"
    height="50"
    alt="Example image">
</lazy-loader>
```

**Warning!** Only use the `threshold` attribute if you have very specific requirements and know what you are doing. If an image exceeds the height of the viewport, setting this attribute can result in the image never loading!

## Self hosting

The easiest way to use this component is via CDN (as explained in the "Getting Started" section near the top of this file).

*Unless you have a specific reason to host the component yourself, you can ignore the following instructions.*

## Installation

### For users with an access token

Add a `.npmrc` file to your project, with the following lines:

```text
@zooduck:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_ACCESS_TOKEN
```

Install from the command line:

```node
npm install @zooduck/lazy-loader@latest
```

Install via package.json:

```json
"@zooduck/lazy-loader": "latest"
```

### For users without an access token

Clone or [Download](https://github.com/zooduck/lazy-loader/archive/refs/heads/master.zip) the repository to your machine.

## Next

Copy the `lazy-loader` folder to your project.

## Import

Using a module file:

```javascript
import 'path/to/lazy-loader/dist/index.module.js'
```

Using a module script:

```html
<script src="path/to/lazy-loader/dist/index.module.js" type="module"></script>
```
