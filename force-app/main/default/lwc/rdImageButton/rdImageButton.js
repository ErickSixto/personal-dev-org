import { LightningElement, api } from "lwc";

export default class RdImageButton extends LightningElement {
  @api buttonId;
  @api isMultiselect;
  @api image;
  @api theme = "light";
  @api size = "small";
  @api variant = "overlay";
  @api darkColor = "#343a40";
  @api lightColor = "#e9ecef";
  @api label;
  state = false;

  //* GETTERS AND SETTERS
  @api
  get buttonData() {
    return {
      id: this.id,
      state: this.state
    };
  }

  //* LIFECYCLE

  renderedCallback() {
    //? Set background img
    if (this.image) {
      this.template.querySelector(".container").style.backgroundImage =
        "url(" + this.image + ")";
    }

    //?Change Colors and Height
    let r = this.template.querySelector("*");
    r.style.setProperty("--color-light", this.lightColor);
    r.style.setProperty("--color-dark", this.darkColor);

    //? Set classes
    let container = this.template.querySelector(".container");
    container.classList.add(this.theme);
    container.classList.add(this.size);

    let labelContainer = this.template.querySelector(".label-container");
    labelContainer.style.setProperty("--color-light", this.lightColor);
    labelContainer.style.setProperty("--color-dark", this.darkColor);
    labelContainer.classList.add(this.theme);
    labelContainer.classList.add(this.variant);

    let label = this.template.querySelector(".label");
    label.classList.add(this.size);
    label.classList.add(this.theme);
    label.classList.add(this.variant);
  }

  //*UTILITY

  toggleState() {
    this.state = !this.state;
    this.template.querySelector(".container").classList.toggle("active");
  }
}
