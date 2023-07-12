class HTMLLazyLoaderElement extends HTMLElement {
  #hasRendered;
  #hasSlotChangeEventFired;
  #placeholderAnimation;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#addEventListeners();
  }
  /**
   * @type {number[]}
   * @readonly
   */
  get threshold() {
    return this.getAttribute('threshold')
      ? [parseFloat(this.getAttribute('threshold'))]
      : [0];
  }
  /**
   * @method
   * @returns {void}
   */
  connectedCallback() {
    if (this.#hasRendered) {
      return;
    }
    this.render();
  }
  /**
   * @method
   * @returns {void}
   */
  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(document.createElement('slot'));
    this.#hasRendered = true;
  }
  /**
   * @method
   * @private
   * @returns {void}
   */
  #addEventListeners() {
    this.shadowRoot.addEventListener('slotchange', this.#onSlotChange.bind(this));
  }
  /**
   * @method
   * @private
   * @param {HTMLImageElement} imageElement
   * @returns {Animation} placeholderAnimation
   */
  #animateImagePlaceholder(imageElement) {
    return imageElement.animate([
      { filter: 'brightness(1)' },
      { filter: 'brightness(1.5)' },
      { filter: 'brightness(1)' }
    ], {
      duration: 2000,
      iterations: Infinity
    });
  }
  /**
   * @method
   * @private
   * @returns {IntersectionObserver}
   */
  #createIntersectionObserverForImageElement() {
    const intersectionObserver = new IntersectionObserver(async (entries) => {
      if (!entries[0].isIntersecting) {
        return;
      }
      intersectionObserver.unobserve(entries[0].target);
      await this.#loadImage(entries[0].target);
      this.#placeholderAnimation.cancel();
    }, {
      threshold: this.threshold
    });
    return intersectionObserver;
  }
  /**
   * @method
   * @private
   * @param {HTMLPictureElement} pictureElement
   * @returns {IntersectionObserver}
   */
  #createIntersectionObserverForPictureElement(pictureElement) {
    const intersectionObserver = new IntersectionObserver(async (entries) => {
      if (!entries[0].isIntersecting) {
        return;
      }
      intersectionObserver.unobserve(entries[0].target);
      await this.#loadPicture(pictureElement);
      this.#placeholderAnimation.cancel();
    }, {
      threshold: this.threshold
    });
    return intersectionObserver;
  }
  /**
   * @method
   * @private
   * @param {number} width
   * @param {number} height
   * @returns {string} dataURL
   */
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
    // ------------------------------
    // Generate random pastel shades
    // ------------------------------
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
  /**
   * @method
   * @private
   * @param {HTMLImageElement} element
   * @returns {void}
   */
  #handleImageElement(element) {
    const { src, width, height } = element;
    element.dataset.src = src;
    element.src = this.#createPlaceholderImageURL(width, height);
    this.#placeholderAnimation = this.#animateImagePlaceholder(element);
    this.#createIntersectionObserverForImageElement().observe(element);
  }
  /**
   * @method
   * @private
   * @param {HTMLPictureElement}
   * @returns {void}
   */
  #handlePictureElement(pictureElement) {
    const imageElement = pictureElement.querySelector('img');
    const { width, height } = imageElement;
    const placeholderImageURL = this.#createPlaceholderImageURL(width, height);
    pictureElement.querySelectorAll('source').forEach((sourceElement) => {
      sourceElement.dataset.srcset = sourceElement.srcset;
      sourceElement.srcset = placeholderImageURL;
    });
    this.#placeholderAnimation = this.#animateImagePlaceholder(imageElement);
    this.#createIntersectionObserverForPictureElement(pictureElement).observe(imageElement);
  }
  /**
   * @method
   * @private
   * @param {HTMLImageElement} imageElement
   * @returns {Promise<void>}
   */
  #loadImage(imageElement) {
    return new Promise((resolve) => {
      imageElement.onload = resolve;
      imageElement.src = imageElement.dataset.src;
      delete imageElement.dataset.src;
    });
  }
  /**
   * @method
   * @private
   * @param {HTMLPictureElement} pictureElement
   * @returns {Promise<void>}
   */
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
  /**
   * @method
   * @private
   * @param {Event} event
   * @returns {void}
   */
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
