# cordova-plugin-dfufirmware

Update's Device Firmware using OTA - Ionic 3

## Usage #

//TypeScript Files need to be added from Extras folder

1. copy files from extras to Provider folder
2. Install the following plugin dependency plugin
    $ ionic cordova plugin add cordova-plugin-ble-central
    $ npm install --save @ionic-native/ble@4
    
    $ ionic cordova plugin add cordova-plugin-file
    $ npm install --save @ionic-native/file@4

    $ ionic cordova plugin add cordova-plugin-file-transfer
    $ npm install --save @ionic-native/file-transfer@4

3. Add following below in app.module.ts (In order to Detect Provider)
import { DfuFirmwareProvider } from '../providers/dfufirmware/dfufirmware';
import { BLE } from '@ionic-native/ble';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';

4. Add Provider Dependencies:
providers: [
  BLE,
  FileTransfer, 
  FileTransferObject,
  File,
  DfuFirmwareProvider 
]

//Firmware pages:
1. copy dfufirmware folder from extras to pages folder.
2. Add following below in app.module.ts (In order to Detect Firmware Page)
   import {FirmwarePage} from '../pages/firmware/firmware';
3. Add in Declaration part in app.module.ts:
    @NgModule({
      declarations: [FirmwarePage],
      entryComponents:[FirmwarePage]
      })

//Settings Trigger:
<ion-row class="row_border">
    <ion-col no-padding>
        <button ion-item  class="ios2" (click)="goBandUpgradePage()">
            <ion-row>
              <ion-col  class="center-content1" col-11>
                <p class="LabelText">Band Upgrade</p>
              </ion-col>      
              <ion-col no-padding text-right col-1 class="centercontent6">
                  <ion-icon style="font-size:2.8rem" name="ios-arrow-forward-outline" item-end></ion-icon>
              </ion-col>
            </ion-row>
          </button>
    </ion-col>
  </ion-row>

//Settings1.ts
1. add import
   import {FirmwarePage} from '../firmware/firmware';
2. add Click Event for Firmware upgrade
goBandUpgradePage(){   
    const animationsOptions = {
      animation: 'ios-transition',
      duration: 1000
      }
      this.app.getRootNav().push(FirmwarePage,{},animationsOptions);
  }
```
