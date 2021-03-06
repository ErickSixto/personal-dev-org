import { LightningElement, track } from "lwc";
import USER_ID from "@salesforce/user/Id";
import getNotes from "@salesforce/apex/esActivityStreamController.getNotes";
import updateNote from "@salesforce/apex/esActivityStreamController.updateNote";
import { subscribe } from "lightning/empApi";
const OBJECT_OPTIONS = [
  { label: "Contacts", value: "contact" },
  { label: "Leads", value: "lead" },
  { label: "Accounts", value: "account" }
];
export default class EsActivityStream extends LightningElement {
  objectOptions = OBJECT_OPTIONS;
  selectedObject = "account";
  channelName = "/event/Activity_Stream__e";

  @track sections = [];
  @track notes;

  //*LIFE CYCLE
  connectedCallback() {
    this.fillDateArray();
    this.getStreamNotes();
    this.handleSubscribe();
  }

  getStreamNotes() {
    getNotes({ objectApiName: "account" })
      .then((data) => {
        console.log("Data", JSON.parse(JSON.stringify(data)));
        let notes = data.map((note) => ({
          ...note,
          isLoading: false,
          time: new Date(note.LastModifiedDate).toLocaleTimeString(),
          url: "/" + note.RecordId
        }));
        this.notes = notes;
        this.arrangeSections();
      })
      .catch((error) => console.error(error));
  }

  //*GETTERS AND SETTERS
  get icon() {
    return "standard:" + this.selectedObject;
  }

  //*UTILITY

  handleSubscribe() {
    // Callback invoked whenever a new event message is received
    const messageCallback = function (response) {
      console.log(
        "New message received: ",
        JSON.parse(JSON.stringify(response))
      );

      if (response.data.payload.CreatedById === USER_ID) {
        this.getStreamNotes();
      }
      // Response contains the payload of the new message received
    };

    // Invoke subscribe method of empApi. Pass reference to messageCallback
    subscribe(this.channelName, -1, messageCallback.bind(this)).then(
      (response) => {
        // Response contains the subscription information on subscribe call
        console.log(
          "Subscription request sent to: ",
          JSON.stringify(response.channel)
        );
        this.subscription = response;
        this.toggleSubscribeButton(true);
      }
    );
  }

  arrangeSections() {
    this.sections = this.sections.map((section) => ({
      ...section,
      length: this.notes.filter((note) =>
        this.isSameDay(section.date, new Date(note.LastModifiedDate))
      ).length,
      notes: this.notes.filter((note) =>
        this.isSameDay(section.date, new Date(note.LastModifiedDate))
      )
    }));
  }
  handleComboboxChange(event) {
    this.selectedObject = event.detail.value;
  }

  handleClick(event) {
    let noteId = event.target.name;
    let note = this.notes.find((note) => note.Id === noteId);
    note.isLoading = true;
    updateNote({ recordId: noteId, value: note.Content })
      .then(() => {
        note.isModified = false;
        note.LastModifiedDate = new Date();
        note.time = new Date(note.LastModifiedDate).toLocaleTimeString();
        this.notes.sort((a, b) =>
          new Date(b.LastModifiedDate) > new Date(a.LastModifiedDate) ? 1 : -1
        );
        this.arrangeSections();
      })
      .finally(() => (note.isLoading = false));
  }

  handleChange(event) {
    let noteId = event.target.name;
    let value = event.target.value;
    let note = this.notes.find((filteredNote) => filteredNote.Id === noteId);
    note.Content = value;
    note.isModified = note.originalValue !== value;
  }

  isSameDay(d1, d2) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
  fillDateArray() {
    let today = new Date();
    let priorDate = new Date().setDate(today.getDate() - 90);
    priorDate = new Date(priorDate);
    while (priorDate <= today) {
      this.sections.push({
        date: new Date(priorDate),
        title: new Date(priorDate).toLocaleDateString(),
        length: 0
      });
      priorDate.setDate(priorDate.getDate() + 1);
    }
    this.sections.reverse();
    this.sections[0].title = "Today";
    this.sections[1].title = "Yesterday";
  }
}
