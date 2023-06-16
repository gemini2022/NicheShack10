import { SecondarySelectionType } from "./enums";

export class ListItem {
    public id!: string;
    public text!: string;
    public selected?: boolean;
    public secondarySelectionType?: SecondarySelectionType;
}