import { Injectable } from '@angular/core';
import { Plugin, Cordova , CordovaProperty , CordovaInstance ,IonicNativePlugin } from '@ionic-native/core';
import { Observable } from 'rxjs/Observable';

@Plugin(
  {
    pluginName:"DfuFirmware",
    plugin:"cordova-plugin-dfufirmware",
    pluginRef:"plugins.dfufirmware",
    repo:"https://github.com/M-k-03/cordova-plugin-dfufirmware",
    platforms:['Android']
  }
)


@Injectable()
export class DfuFirmwareProvider extends IonicNativePlugin{


  @Cordova()
  get():Promise<any>{
    return;
  }
    
  
  @Cordova({
    observable: true,
    clearWithArgs: true
  })
  upgradeFirmware(deviceId: string):Observable<any> {
    return;
  }

  @Cordova({
    observable: true,
    clearWithArgs: true
  })
  getDeviceName(getDeviceName: string):Observable<any> {
    return;
  }

  @Cordova({
    observable: true,
    clearWithArgs: true
  })
  getDeviceMacAddress(getDeviceMacAddress: string):Observable<any> {
    return;
  }


}
