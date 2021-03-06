/**
 * @description       :
 * @author            : ErickSixto
 * @group             :
 * @last modified on  : 01-20-2022
 * @last modified by  : ErickSixto
 **/
import { LightningElement, api } from "lwc";
const POPOVER_SIZES = {
  valid: ["small", "medium", "large"],
  default: "medium"
};

const POPOVER_PLACEMENTS = {
  valid: [
    "auto",
    "left",
    "center",
    "right",
    "bottom-left",
    "bottom-center",
    "bottom-right"
  ],
  default: "left"
};

const BUTTON_VARIANTS = {
  valid: [
    "bare",
    "container",
    "brand",
    "border",
    "border-filled",
    "bare-inverse",
    "border-inverse"
  ],
  default: "border"
};

const BUTTON_SIZES = {
  validBare: ["x-small", "small", "medium", "large"],
  validNonBare: ["xx-small", "x-small", "small", "medium"],
  default: "medium"
};

const BUTTON_TRIGGERS = {
  valid: ["click", "hover", "focus"],
  default: "click"
};

const POPOVER_VARIANTS = {
  valid: ["base", "warning", "error", "walkthrough"],
  default: "base"
};

const DEFAULT_LOADING_STATE_ALTERNATIVE_TEXT = "Loading";

/**
 * The button icon popover display a lightning button. On click, open the popover.
 *
 * @class
 * @name ButtonIconPopover
 * @public
 * @storyId example-button-icon-popover--base-with-popover-base
 * @descriptor -button-icon-popover
 */
export default class EsButtonIconPopover extends LightningElement {
  /**
   * The keyboard shortcut for the button.
   *
   * @type {string}
   * @public
   */
  @api accessKey;

  /**
   * The assistive text for the button.
   *
   * @type {string}
   * @public
   */
  @api alternativeText;

  /**
   * The tile can include text, and is displayed in the header.
   * To include additional markup or another component, use the title slot.
   *
   * @type {string}
   * @public
   */
  @api title;

  /**
   * The Lightning Design System name of the icon. Names are written in the format 'utility:down' where 'utility' is the category, and 'down' is the specific icon to be displayed.
   * Only utility icons can be used in this component.
   *
   * @type {string}
   * @public
   */
  @api iconName;

  /**
   * The class to be applied to the contained icon element.
   *
   * @type {string}
   * @public
   */
  @api iconClass;

  /**
   * Text to display when the user mouses over or focuses on the button.
   * The tooltip is auto-positioned relative to the button and screen space.
   *
   * @type {string}
   * @public
   */
  @api tooltip;

  _disabled = false;
  _hideCloseButton = false;
  _isLoading = false;
  _loadingStateAlternativeText = DEFAULT_LOADING_STATE_ALTERNATIVE_TEXT;
  _size = BUTTON_SIZES.default;
  _placement = POPOVER_PLACEMENTS.default;
  _variant = BUTTON_VARIANTS.default;
  _popoverSize = POPOVER_SIZES.default;
  _triggers = BUTTON_TRIGGERS.default;
  _popoverVariant = POPOVER_VARIANTS.default;
  popoverVisible = false;
  showTitle = true;
  showFooter = true;
  _boundingRect = {};

  connectedCallback() {
    this.classList.add("slds-dropdown-trigger", "slds-dropdown-trigger_click");
    this._connected = true;
  }

  renderedCallback() {
    if (this.popoverVisible) {
      this.classList.add("slds-is-open");
    } else {
      this.classList.remove("slds-is-open");
    }

    if (this.titleSlot) {
      this.showTitle = this.titleSlot.assignedElements().length !== 0;
    }
    if (this.footerSlot) {
      this.showFooter = this.footerSlot.assignedElements().length !== 0;
    }

    if (this.triggers === "click") {
      this.focusOnPopover();
    }
  }

  /**
   * Title slot.
   *
   * @type {element}
   */
  get titleSlot() {
    return this.template.querySelector("slot[name=title]");
  }

  /**
   * Footer slot.
   *
   * @type {element}
   */
  get footerSlot() {
    return this.template.querySelector("slot[name=footer]");
  }

  /**
   * The size of the button icon. For the bare variant,
   * options include x-small, small, medium, and large.
   * For non-bare variants, options include xx-small, x-small, small, and medium.
   *
   * @type {string}
   * @default medium
   * @public
   */
  @api
  get size() {
    return this._size;
  }

  set size(size) {
    if (this._variant === "bare" || this._variant === "bare-inverse") {
      this._size = this.normalizeString(size, {
        fallbackValue: BUTTON_SIZES.default,
        validValues: BUTTON_SIZES.validBare
      });
    } else {
      this._size = this.normalizeString(size, {
        fallbackValue: BUTTON_SIZES.default,
        validValues: BUTTON_SIZES.validNonBare
      });
    }
  }

  /**
   * Determines the alignment of the popover relative to the button.
   * Available options are: auto, left, center, right, bottom-left, bottom-center, bottom-right.
   * The auto option aligns the popover based on available space.
   *
   * @type {string}
   * @default left
   * @public
   */
  @api
  get placement() {
    return this._placement;
  }

  set placement(placement) {
    this._placement = this.normalizeString(placement, {
      fallbackValue: POPOVER_PLACEMENTS.default,
      validValues: POPOVER_PLACEMENTS.valid
    });
  }

  /**
   * The variant changes the appearance of button icon.
   * Accepted variants include bare, container, brand, border,
   * border-filled, bare-inverse, and border-inverse.
   *
   * @type {string}
   * @default border
   * @public
   */
  @api
  get variant() {
    return this._variant;
  }

  set variant(variant) {
    this._variant = this.normalizeString(variant, {
      fallbackValue: BUTTON_VARIANTS.default,
      validValues: BUTTON_VARIANTS.valid
    });
  }

  /**
   * Width of the popover. Accepted values include small, medium and large.
   *
   * @type {string}
   * @default medium
   * @public
   */
  @api
  get popoverSize() {
    return this._popoverSize;
  }

  set popoverSize(popoverSize) {
    this._popoverSize = this.normalizeString(popoverSize, {
      fallbackValue: POPOVER_SIZES.default,
      validValues: POPOVER_SIZES.valid
    });
  }

  /**
   * Specify which triggers will show the popover. Supported values are 'click', 'hover', 'focus'.
   *
   * @type {string}
   * @default click
   * @public
   */
  @api
  get triggers() {
    return this._triggers;
  }

  set triggers(triggers) {
    this._triggers = this.normalizeString(triggers, {
      fallbackValue: BUTTON_TRIGGERS.default,
      validValues: BUTTON_TRIGGERS.valid
    });
  }

  /**
   * The variant changes the appearance of the popover.
   * Accepted variants include base, warning, error, walkthrough.
   *
   * @type {string}
   * @default base
   * @public
   */
  @api
  get popoverVariant() {
    return this._popoverVariant;
  }

  set popoverVariant(popoverVariant) {
    this._popoverVariant = this.normalizeString(popoverVariant, {
      fallbackValue: POPOVER_VARIANTS.default,
      validValues: POPOVER_VARIANTS.valid
    });
  }

  /**
   * If present, the close button inside of the popover is hidden.
   *
   * @type {boolean}
   * @default false
   * @public
   */
  @api
  get hideCloseButton() {
    return this._hideCloseButton;
  }

  set hideCloseButton(value) {
    this._hideCloseButton = this.normalizeBoolean(value);
  }

  /**
   * If present, the popover can't be opened by users.
   *
   * @type {boolean}
   * @default false
   * @public
   */
  @api
  get disabled() {
    return this._disabled;
  }

  set disabled(value) {
    this._disabled = this.normalizeBoolean(value);
  }

  /**
   * If present, the popover is in a loading state and shows a spinner.
   *
   * @type {boolean}
   * @default false
   * @public
   */
  @api
  get isLoading() {
    return this._isLoading;
  }

  set isLoading(value) {
    this._isLoading = this.normalizeBoolean(value);
  }

  /**
   * Message displayed while the popover is in the loading state.
   *
   * @type {string}
   * @default Loading
   * @public
   */
  @api
  get loadingStateAlternativeText() {
    return this._loadingStateAlternativeText;
  }
  set loadingStateAlternativeText(value) {
    this._loadingStateAlternativeText =
      typeof value === "string"
        ? value.trim()
        : DEFAULT_LOADING_STATE_ALTERNATIVE_TEXT;
  }

  /**
   * True if there is a title.
   *
   * @type {boolean}
   */
  get hasStringTitle() {
    return !!this.title;
  }

  /**
   * Return a true string if the popover is visible and a false string if not.
   *
   * @type {string}
   */
  get computedAriaExpanded() {
    return String(this.popoverVisible);
  }

  /**
   * Computed Popover Header Class styling.
   *
   * @type {string}
   */
  get computedPopoverHeaderClass() {
    return this.classSet("slds-popover__header")
      .add({
        "es-button-icon-popover_space-between": !this.hideCloseButton
      })
      .toString();
  }

  /**
   * Computed Popover Class styling.
   *
   * @type {string}
   */
  get computedPopoverClass() {
    return this.classSet("slds-popover")
      .add({
        "slds-dropdown_left":
          this._placement === "left" || this.isAutoAlignment(),
        "slds-dropdown_center": this._placement === "center",
        "slds-dropdown_right": this._placement === "right",
        "slds-dropdown_bottom": this._placement === "bottom-center",
        "slds-dropdown_bottom slds-dropdown_right slds-dropdown_bottom-right":
          this._placement === "bottom-right",
        "slds-dropdown_bottom slds-dropdown_left slds-dropdown_bottom-left":
          this._placement === "bottom-left",
        "slds-nubbin_top-left": this._placement === "left",
        "slds-nubbin_top-right": this._placement === "right",
        "slds-nubbin_top": this._placement === "center",
        "slds-nubbin_bottom-left": this._placement === "bottom-left",
        "slds-nubbin_bottom-right": this._placement === "bottom-right",
        "slds-nubbin_bottom": this._placement === "bottom-center",
        "slds-p-vertical_large": this._isLoading
      })
      .add({
        "slds-popover_warning": this._popoverVariant === "warning",
        "slds-popover_error": this._popoverVariant === "error",
        "slds-popover_walkthrough": this._popoverVariant === "walkthrough",
        "slds-show": this.popoverVisible,
        "slds-hide": !this.popoverVisible
      })
      .add(`slds-popover_${this._popoverSize}`)
      .toString();
  }

  /**
   * Simulates a mouse click on the button.
   *
   * @public
   */
  @api
  click() {
    if (this._connected) {
      this.clickOnButton();
    }
    /**
     * The event fired when the popover is clicked.
     *
     * @event
     * @name click
     * @public
     */
    this.dispatchEvent(new CustomEvent("click"));
  }

  /**
   * Sets focus on the button.
   *
   * @public
   */
  @api
  focus() {
    if (this._connected) {
      this.focusOnButton();
    }
  }

  /**
   * Opens the popover.
   *
   * @public
   */
  @api
  open() {
    if (!this.popoverVisible) {
      this.toggleMenuVisibility();
    }
  }

  /**
   * Closes the popover.
   *
   * @public
   */
  @api
  close() {
    if (this.popoverVisible) {
      this.toggleMenuVisibility();
    }
    /**
     * The event fired when the popover is closed.
     *
     * @event
     * @name close
     * @public
     */
    this.dispatchEvent(new CustomEvent("close"));
  }

  /**
   * Sets the focus on the button-icon.
   * If the trigger is click, it toggles the menu visibility and blurs the button-icon.
   */
  clickOnButton() {
    if (!this._disabled) {
      this.cancelBlur();
      this.focusOnButton();

      if (this._triggers === "click") {
        this.toggleMenuVisibility();
      }
    }
  }

  /**
   * Sets the focus on the button-icon.
   * If the trigger is focus, it toggles the menu visibility.
   */
  focusOnButton() {
    this.allowBlur();
    this.template
      .querySelector('[data-element-id="lightning-button-icon-main"]')
      .focus();
    if (this._triggers === "focus" && !this.popoverVisible && !this._disabled) {
      this.toggleMenuVisibility();
    }
  }

  /**
   * Sets the focus on the popover.
   */
  focusOnPopover() {
    this.template.querySelector(".slds-popover").focus();
  }

  /**
   * If the trigger is hover or focus, it toggles the menu visibility.
   */
  handleBlur() {
    if (this._cancelBlur) {
      return;
    }
    if (this.triggers !== "click") {
      this.toggleMenuVisibility();
    }
  }

  /**
   * If the trigger is click, it toggles the menu visibility.
   */
  handlePopoverBlur(event) {
    const isButton =
      this.template.querySelector(
        '[data-element-id="lightning-button-icon-main"]'
      ) === event.relatedTarget;
    if (this._cancelBlur) {
      return;
    }
    if (this.triggers === "click" && !isButton) {
      this.toggleMenuVisibility();
    }
  }

  /**
   * If the trigger is hover and the popover is not visible, it toggles the menu visibility.
   * If the trigger is hover and the popover is visible, it sets the variable cancelBlur to true.
   */
  handleMouseEnter() {
    if (
      this._triggers === "hover" &&
      this.popoverVisible &&
      !this._disabled &&
      !this._cancelBlur
    ) {
      this.cancelBlur();
    }
    if (this._triggers === "hover" && !this.popoverVisible && !this._disabled) {
      this.allowBlur();
      this.toggleMenuVisibility();
    }
  }

  /**
   * If the trigger is hover and the popover is visible, it toggles the menu visibility.
   */
  handleMouseLeave() {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(
      function () {
        if (
          !this._cancelBlur &&
          this._triggers === "hover" &&
          this.popoverVisible &&
          !this._disabled
        ) {
          this.cancelBlur();
          this.toggleMenuVisibility();
        }
        if (
          this._cancelBlur &&
          this._triggers === "hover" &&
          this.popoverVisible &&
          !this._disabled
        ) {
          this.allowBlur();
        }
      }.bind(this),
      250
    );
  }

  /**
   * If the trigger is hover and the popover is visible and the mouse enters the popover,
   * it sets the variable cancelBlur to true.
   */
  handleMouseEnterBody() {
    if (this._triggers === "hover" && this.popoverVisible && !this._disabled) {
      this.cancelBlur();
    }
  }

  /**
   * If the trigger is hover and the popover is visible and the mouse leaves the popover,
   * it sets the variable cancelBlur to true.
   */
  handleMouseLeaveBody() {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(
      function () {
        if (
          !this._cancelBlur &&
          this._triggers === "hover" &&
          this.popoverVisible &&
          !this._disabled
        ) {
          this.cancelBlur();
          this.toggleMenuVisibility();
        }
        if (
          this._cancelBlur &&
          this._triggers === "hover" &&
          this.popoverVisible &&
          !this._disabled
        ) {
          this.allowBlur();
        }
      }.bind(this),
      250
    );
  }

  /**
   * Handles mouse down on popover.
   */
  handlePopoverMouseDown(event) {
    const mainButton = 0;
    if (event.button === mainButton) {
      this.cancelBlur();
    }
  }

  /**
   * Sets the variable cancelBlur to false.
   */
  handlePopoverMouseUp() {
    this.allowBlur();
  }

  /**
   * If variable cancelBlur is false, it sets the variable cancelBlur to true.
   */
  handlePopoverKeyDown() {
    if (!this._cancelBlur) {
      this.cancelBlur();
    }
  }

  /**
   * If variable cancelBlur is true, it sets the variable cancelBlur to false.
   */
  handlePopoverKeyPress() {
    if (this._cancelBlur) {
      this.allowBlur();
    }
  }

  /**
   * If trigger is focus, sets the focus on the button when click on a slot.
   * If trigger is click, keeps the popover visible when click on a slot.
   */
  handleSlotClick() {
    if (this.triggers === "focus") {
      this.focusOnButton();
    }
    if (this.triggers === "click") {
      this.popoverVisible = true;
    }
  }

  /**
   * Sets the variable cancelBlur to false.
   */
  allowBlur() {
    this._cancelBlur = false;
  }

  /**
   * Sets the variable cancelBlur to false.
   */
  cancelBlur() {
    this._cancelBlur = true;
  }

  /**
   * Toggles the popover visibility depending on if it's visible or not.
   * Adds class slds-is-open if popover visible and removes if not.
   */
  toggleMenuVisibility() {
    if (!this.disabled) {
      this.popoverVisible = !this.popoverVisible;

      if (this.popoverVisible) {
        this._boundingRect = this.getBoundingClientRect();
        this.pollBoundingRect();
      }

      this.classList.toggle("slds-is-open");
    }
  }

  /**
   * Poll for change in bounding rectangle
   * only if it is placement=auto since that is
   * position:fixed and is opened.
   */
  pollBoundingRect() {
    if (this.isAutoAlignment() && this.popoverVisible) {
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      setTimeout(() => {
        if (this._connected) {
          this.observePosition(this, 300, this._boundingRect, () => {
            this.close();
          });

          this.pollBoundingRect();
        }
      }, 250);
    }
  }

  /**
   * Returns true if the placement is auto.
   */
  isAutoAlignment() {
    return this._placement.startsWith("auto");
  }

  //! Utility Methods

  observePosition(target, threshold = 5, originalRect, callback) {
    const newBoundingRect = target.getBoundingClientRect();
    const newLeft = newBoundingRect.left;
    const newTop = newBoundingRect.top;

    const oldLeft = originalRect.left;
    const oldTop = originalRect.top;

    const horizontalShiftDelta = Math.abs(newLeft - oldLeft);
    const verticalShiftDelta = Math.abs(newTop - oldTop);

    if (horizontalShiftDelta >= threshold || verticalShiftDelta >= threshold) {
      callback();
    }
  }

  normalizeString(value, config = {}) {
    const { fallbackValue = "", validValues, toLowerCase = true } = config;
    let normalized = (typeof value === "string" && value.trim()) || "";
    normalized = toLowerCase ? normalized.toLowerCase() : normalized;
    if (validValues && validValues.indexOf(normalized) === -1) {
      normalized = fallbackValue;
    }
    return normalized;
  }

  normalizeBoolean(value) {
    return typeof value === "string" || !!value;
  }
  classSet(config) {
    const proto = {
      add(className) {
        if (typeof className === "string") {
          this[className] = true;
        } else {
          Object.assign(this, className);
        }
        return this;
      },
      invert() {
        Object.keys(this).forEach((key) => {
          this[key] = !this[key];
        });
        return this;
      },
      toString() {
        return Object.keys(this)
          .filter((key) => this[key])
          .join(" ");
      }
    };
    if (typeof config === "string") {
      const key = config;
      config = {};
      config[key] = true;
    }
    return Object.assign(Object.create(proto), config);
  }
}
