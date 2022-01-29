import { LightningElement, api, track, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";

export default class EsFileGridUploader extends LightningElement {
  //* --------- VARIABLES ---------*//
  @api recordId;
  @api objectApiName;
  @track fieldApiNamesList;
  @api fieldApiNames;
  fields = [this.objectApiName + ".Name"];
  record;
  get isRenderList() {
    return this.record && this.fieldApiNamesList;
  }
  //* --------- LIFE CYCLE ---------*//
  connectedCallback() {
    this.fieldApiNamesList = this.fieldApiNames
      .split(",")
      .map((field) => ({ apiname: field.trim(), label: " " }));
    this.recordFields = [this.objectApiName + ".Name"];
  }
  //* --------- WIRE METHODS ---------*//
  @wire(getRecord, {
    recordId: "$recordId",
    fields: "$recordFields"
  })
  wiredRecord({ error, data }) {
    if (error) {
      let message = "Unknown error";
      if (Array.isArray(error.body)) {
        message = error.body.map((e) => e.message).join(", ");
      } else if (typeof error.body.message === "string") {
        message = error.body.message;
      }
      console.error(error);
      console.log(message);
    } else if (data) {
      this.record = data;
    }
  }
  @wire(getObjectInfo, { objectApiName: "$objectApiName" })
  objectInfoWire({ error, data }) {
    if (error) {
      console.error(error);
    } else if (data) {
      this.fieldApiNamesList = this.fieldApiNamesList.map((field) => ({
        ...field,
        label: data.fields[field.apiname].label
      }));
    }
  }
}
