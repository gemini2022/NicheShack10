import { ElementRef } from "@angular/core";
import { ExitEditType, SecondarySelectionType } from "./enums";
import { Subject } from "rxjs/internal/Subject";

export class ListItem {
  public hasSecondarySelection!: boolean;
  public isDisabled!: boolean;
  public hasPrimarySelection!: boolean;
  public htmlElement!: ElementRef<HTMLElement>;
  public secondarySelectionType!: SecondarySelectionType;

  public isPivot!: boolean;

  public hasUnselection!: boolean;

  public isNew!: boolean;
  public inEditMode!: boolean;

  public onListItemAdded: Subject<void> = new Subject<void>();
  public onListItemEdited: Subject<void> = new Subject<void>();

  constructor(public id: string, public text: string) {

  }







  onExitListItemEdit(exitEditType: ExitEditType) {

    // As long as the list item is in edit mode
    if (this.inEditMode) {

      // If the edited item has text written in it
      if (this.htmlElement!.nativeElement.innerText.trim().length > 0) {

        // If we pressed the [ESCAPE] key
        if (exitEditType == ExitEditType.Escape) {

          // Cancel the edit
          this.cancelListItemEdit();

          // If we did (NOT) press the [ESCAPE] key
          // But the [ENTER] key was pressed or the item was {BLURRED}
        } else {

          // Complete the edit
          this.completeListItemEdit();
        }

        // But if the item is empty
      } else {

        // If the [ESCAPE] key was pressed or the item was {BLURRED}
        if (exitEditType == ExitEditType.Escape || exitEditType == ExitEditType.Blur) {
          // Cancel the edit
          this.cancelListItemEdit();
        }
      }
    }
  }














  private cancelListItemEdit(): void {
    // Reset the item back to the way it was before the edit
    this.htmlElement!.nativeElement.innerText = this.text.trim();
    this.reselectItem();
  }






  completeListItemEdit(): void {
    const oldText = this.text;
    this.text = this.getCaseType(this);
    this.htmlElement!.nativeElement.innerText = this.text;

    // If the edited text is different from what it was before the edit
    if (this.text!.trim() != oldText) {
      if (this.isNew) {
        this.onListItemAdded.next();
      } {
        this.onListItemEdited.next();
      }
    }

    this.reselectItem();
  }




  getCaseType(listItem: ListItem): string {
    let text: string;

    // switch (listItem.caseType) {

    //   // Capitalized Case
    //   case CaseType.CapitalizedCase:
    //     const capCase = new CapitalizedCase();
    //     text = capCase.getCase(this.htmlElement.nativeElement.innerText.trim());
    //     break;

    //   // Title Case
    //   case CaseType.TitleCase:
    //     const titleCase = new TitleCase();
    //     text = titleCase.getCase(this.htmlElement.nativeElement.innerText.trim());
    //     break;

    //   // Lower Case
    //   case CaseType.LowerCase:
    //     text = this.htmlElement.nativeElement.innerText.trim().toLowerCase();
    //     break;

    //   // No Case
    //   default:
    //     text = this.htmlElement.nativeElement.innerText.trim();
    //     break;
    // }


    text = this.htmlElement!.nativeElement.innerText.trim(); // ****** Temporary ****** \\

    return text;
  }






  private reselectItem(): void {
    this.isNew = false;
    this.inEditMode = false;
    this.hasPrimarySelection = true;
    this.htmlElement!.nativeElement.focus();
  }

}