/* --------------------------- */
/* @zooduck/lazy-loader v0.0.1 */
/* --------------------------- */
class HTMLLazyLoaderElement extends HTMLElement {
  #hasRendered;
  #hasSlotChangeEventFired;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#addEventListeners();
  }
  get threshold() {
    return this.getAttribute('threshold')
      ? [parseFloat(this.getAttribute('threshold'))]
      : [0];
  }
  connectedCallback() {
    if (this.#hasRendered) {
      return;
    }
    this.render();
  }
  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(document.createElement('slot'));
    this.#hasRendered = true;
  }
  #addEventListeners() {
    this.shadowRoot.addEventListener('slotchange', this.#onSlotChange.bind(this));
  }
  #createIntersectionObserverForImageElement() {
    const intersectionObserver = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) {
        return;
      }
      this.#loadImage(entries[0].target);
      intersectionObserver.unobserve(entries[0].target);
    }, {
      threshold: this.threshold
    });
    return intersectionObserver;
  }
  #createIntersectionObserverForPictureElement(pictureElement) {
    const intersectionObserver = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) {
        return;
      }
      this.#loadPicture(pictureElement);
      intersectionObserver.unobserve(entries[0].target);
    }, {
      threshold: this.threshold
    });
    return intersectionObserver;
  }
  #createPlaceholderImageURL(width, height) {
    const canvas = document.createElement('canvas');
    if (!width || !height) {
      canvas.width = 1;
      canvas.height = 1;
    } else {
      canvas.width = width;
      canvas.height = height;
    }
    const context = canvas.getContext('2d');
    const rgba = [0, 0, 0, 255].map((value) => {
      if (value === 0) {
        return Math.floor((Math.random() * 100) + 100);
      }
      return value;
    });
    context.fillStyle = `rgba(${[...rgba]})`;
    context.fillRect(0, 0, width, height);
    return canvas.toDataURL();
  }
  #handleImageElement(element) {
    const { src, width, height } = element;
    element.dataset.src = src;
    element.src = this.#createPlaceholderImageURL(width, height);
    this.#createIntersectionObserverForImageElement().observe(element);
  }
  #handlePictureElement(pictureElement) {
    const imageElement = pictureElement.querySelector('img');
    const { width, height } = imageElement;
    const placeholderImageURL = this.#createPlaceholderImageURL(width, height);
    pictureElement.querySelectorAll('source').forEach((sourceElement) => {
      sourceElement.dataset.srcset = sourceElement.srcset;
      sourceElement.srcset = placeholderImageURL;
    });
    this.#createIntersectionObserverForPictureElement(pictureElement).observe(imageElement);
  }
  #loadImage(imageElement) {
    return new Promise((resolve) => {
      imageElement.onload = resolve;
      imageElement.src = imageElement.dataset.src;
      delete imageElement.dataset.src;
    });
  }
  #loadPicture(pictureElement) {
    return new Promise((resolve) => {
      const imageElement = pictureElement.querySelector('img');
      imageElement.onload = resolve;
      pictureElement.querySelectorAll('source').forEach((sourceElement) => {
        sourceElement.srcset = sourceElement.dataset.srcset;
        delete sourceElement.dataset.srcset;
      });
    });
  }
  #onSlotChange(event) {
    if (this.#hasSlotChangeEventFired) {
      return;
    }
    this.#hasSlotChangeEventFired = true;
    const slottedElement = event.target.assignedElements()[0];
    const isPictureElement = slottedElement instanceof HTMLPictureElement;
    const isImageElement = slottedElement instanceof HTMLImageElement;
    if (isImageElement) {
      this.#handleImageElement(slottedElement);
    } else if (isPictureElement) {
      this.#handlePictureElement(slottedElement);
    }
  }
}
customElements.define('lazy-loader', HTMLLazyLoaderElement);