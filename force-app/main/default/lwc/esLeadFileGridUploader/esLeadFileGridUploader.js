import { LightningElement, api, wire } from "lwc";
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
    //Do nothing
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
    } else if (data) {
      this.recordFields = data.fields;
      this.setConditionalFields();
    }
  }

  //* ---------UTILITY ---------*//
  setConditionalFields() {
    console.log("Conditional Logic", this.recordFields);
    let berufsstatus = this.recordFields.Berufsstatus__c.value;
    let partnerBerufsstatus = this.recordFields.Partner_Berufsstatus__c.value;
    let einwertung = this.recordFields.Einwertung__c.value;
    berufsstatus = berufsstatus ? berufsstatus.toLowerCase() : null;
    partnerBerufsstatus = partnerBerufsstatus
      ? partnerBerufsstatus.toLowerCase()
      : null;
    einwertung = einwertung ? einwertung.toLowerCase() : null;
    //? Second Scenario
    if (
      (berufsstatus === "selbstständig" && einwertung === "alleine") ||
      (einwertung === "gemeinsam" &&
        berufsstatus === "selbstständig" &&
        partnerBerufsstatus === "selbstständig")
    ) {
      this.fields =
        "aktuelle_Selbstauskunft__c, Einwertungsbogen__c, Eigenkapitalnachweis__c, Steuerbescheid__c, aktuelle_betriebswirtschaftliche_Auswert__c, letzte_zwei_Bilanzen__c";
    }
    //? First Scenario
    else if (
      partnerBerufsstatus === "selbstständig" ||
      berufsstatus === "selbstständig"
    ) {
      this.fields =
        "aktuelle_Selbstauskunft__c, Einwertungsbogen__c, Gehaltsnachweis__c, Eigenkapitalnachweis__c, Steuerbescheid__c, aktuelle_betriebswirtschaftliche_Auswert__c, letzte_zwei_Bilanzen__c";
    }

    //? Third Scenario
    else if (einwertung === "alleine" && berufsstatus === "arbeitslos") {
      this.fields =
        "aktuelle_Selbstauskunft__c, Einwertungsbogen__c, Eigenkapitalnachweis__c, Steuerbescheid__c";
    }

    //? Fourth Scenario Goes Here
    else {
      this.fields =
        "aktuelle_Selbstauskunft__c, Einwertungsbogen__c, Gehaltsnachweis__c, Eigenkapitalnachweis__c, Steuerbescheid__c";
    }
  }
}
