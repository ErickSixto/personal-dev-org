import { LightningElement, api, wire } from "lwc";
import LEAD from "@salesforce/schema/Lead";
import BERUFSSTATUS_FIELD from "@salesforce/schema/Lead.Berufsstatus__c";
import PARTNER_BERUFSSTATUS_FIELD from "@salesforce/schema/Lead.Partner_Berufsstatus__c";
import EINWERTUNG_FIELD from "@salesforce/schema/Lead.Einwertung__c";
import { getRecord } from "lightning/uiRecordApi";

const RECORD_FIELDS = [
  BERUFSSTATUS_FIELD,
  PARTNER_BERUFSSTATUS_FIELD,
  EINWERTUNG_FIELD
];

const FIELDS = [
  "aktuelle_Selbstauskunft__c",
  "Einwertungsbogen__c",
  "Gehaltsnachweis__c",
  "Eigenkapitalnachweis__c",
  "Steuerbescheid__c",
  "aktuelle_betriebswirtschaftliche_Auswert__c",
  "letzte_zwei_Bilanzen__c"
];
export default class EsLeadFileGridUploader extends LightningElement {
  @api recordId;
  @api objectApiName;
  fields = null;

  connectedCallback() {
    this.fields = FIELDS.join();
  }

  //* --------- WIRE METHODS ---------*//
  @wire(getRecord, {
    recordId: "$recordId",
    fields: RECORD_FIELDS
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
      this.recordFields = data.fields;
      console.log(
        "Fields From Parent",
        JSON.parse(JSON.stringify(this.recordFields))
      );
    }
  }
}
