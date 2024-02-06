import { MessageService } from 'primeng/api';
import { NgModule } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {PasswordModule} from 'primeng/password';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {ToastModule} from 'primeng/toast';
import {RippleModule} from 'primeng/ripple';
import {ChartModule} from 'primeng/chart';

import {DialogService, DynamicDialogModule} from 'primeng/dynamicdialog';
import {TableModule} from 'primeng/table';
import {KnobModule} from 'primeng/knob';
import {MenuModule} from 'primeng/menu';
import {AvatarModule} from 'primeng/avatar';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {CalendarModule} from 'primeng/calendar';
import {BadgeModule} from 'primeng/badge';
import {DialogModule} from 'primeng/dialog';
import {SplitterModule} from 'primeng/splitter';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {ToolbarModule} from 'primeng/toolbar';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {BlockUIModule} from 'primeng/blockui';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import { RatingModule } from 'primeng/rating';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import {PanelModule} from 'primeng/panel';
import {DividerModule} from 'primeng/divider';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {StepsModule} from 'primeng/steps';
import {InputMaskModule} from 'primeng/inputmask';
import {ToggleButtonModule} from 'primeng/togglebutton';
//import {AutoFocusModule} from 'primeng/autofocus';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import {SplitButtonModule} from 'primeng/splitbutton';
import {SpeedDialModule} from 'primeng/speeddial';
import {TooltipModule} from 'primeng/tooltip';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {InplaceModule} from 'primeng/inplace';
import {GMapModule} from 'primeng/gmap';
import {MultiSelectModule} from 'primeng/multiselect';
import {TabViewModule} from 'primeng/tabview';
import {KeyFilterModule} from 'primeng/keyfilter';
import {ContextMenuModule} from 'primeng/contextmenu';
import {ImageModule} from 'primeng/image';
import {DataViewModule} from 'primeng/dataview';
import {SelectButtonModule} from 'primeng/selectbutton';
import {EditorModule} from 'primeng/editor';
import {CarouselModule} from 'primeng/carousel';

@NgModule({
  declarations: [],
  imports: [
    AccordionModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    PasswordModule,
    MessagesModule,
    MessageModule,
    ToastModule,
    RippleModule,
    ChartModule,
    DynamicDialogModule,
    TableModule,
    KnobModule,
    MenuModule,
    AvatarModule,
    ConfirmDialogModule,
    CalendarModule,
    BadgeModule,
    DialogModule,
    SplitterModule,
    ScrollPanelModule,
    ToolbarModule,
    DropdownModule,
    InputTextareaModule,
    BlockUIModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    RatingModule,
    CommonModule,
    FormsModule,
    FileUploadModule,
    RadioButtonModule,
    InputNumberModule,
    PanelModule,
    DividerModule,
    AutoCompleteModule,
    StepsModule,
    InputMaskModule,
    ToggleButtonModule,
    //AutoFocusModule
    TagModule,
    ChipModule,
    SplitButtonModule,
    SpeedDialModule,
    TooltipModule,
    OverlayPanelModule,
    InplaceModule,
    GMapModule,
    MultiSelectModule,
    TabViewModule,
    KeyFilterModule,
    ContextMenuModule,
    ImageModule,
    DataViewModule,
    SelectButtonModule,
    EditorModule,
    CarouselModule
  ],
  exports: [
    AccordionModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    PasswordModule,
    MessagesModule,
    MessageModule,
    ToastModule,
    RippleModule,
    ChartModule,
    DynamicDialogModule,
    TableModule,
    KnobModule,
    MenuModule,
    AvatarModule,
    ConfirmDialogModule,
    CalendarModule,
    BadgeModule,
    DialogModule,
    SplitterModule,
    ScrollPanelModule,
    ToolbarModule,
    DropdownModule,
    InputTextareaModule,
    BlockUIModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    PanelModule,
    FileUploadModule,
    InputNumberModule,
    DividerModule,
    AutoCompleteModule,
    StepsModule,
    InputMaskModule,
    ToggleButtonModule,
    //AutoFocusModule
    TagModule,
    ChipModule,
    SplitButtonModule,
    SpeedDialModule,
    TooltipModule,
    OverlayPanelModule,
    InplaceModule,
    GMapModule,
    MultiSelectModule,
    TabViewModule,
    KeyFilterModule,
    ContextMenuModule,
    ImageModule,
    DataViewModule,
    SelectButtonModule,
    EditorModule,
    CarouselModule
  ],
  providers: [MessageService, DialogService ],
})
export class PrimeNgModule {}
