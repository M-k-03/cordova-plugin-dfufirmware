import { Component,NgZone } from '@angular/core';
import { IonicPage, NavController, LoadingController, AlertController, ModalController, NavParams } from 'ionic-angular';
import { Bluetooth1Page } from '../bluetooth1/bluetooth1';
import { AddbandPage } from '../addband/addband';
import { NativeStorage } from '@ionic-native/native-storage';
import { STORAGE } from '../../providers/storage/storage-keys';
import { BluetoothProvider } from '../../providers/bluetooth/bluetooth.provider';
import {CountryProvider} from '../../providers/country/country';
import { BLE } from '@ionic-native/ble';
import { File } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';

//import { ChangeDetectorRef } from '@angular/core';

@IonicPage()
@Component({
  selector: 'page-firmware',
  templateUrl: 'firmware.html',
})
export class FirmwarePage {

  color: any;
  bandsname: any;

  noband: boolean = true;
  bandfound: boolean = false;

  BandModel:any;
  bVersion:string;
  appVersion:string;
  dfuData:string;
  public loadProgress : number = 0;
  public upgradeStatus:string;
  public dfuAddress :string = "DfuEfitpro";
  fileTransfer: FileTransferObject = null;
  blueToothFileFound:boolean;

  private pairDfuService: any;

  constructor(public navCtrl: NavController,
    public model: ModalController, 
    public navParams: NavParams,
    private alertController:AlertController,
    private nativeStorage :NativeStorage,
    private ble: BLE,
    private countryProvider:CountryProvider,
    private bluetoothProvider: BluetoothProvider,
    private ngzone: NgZone,
    private file: File, 
    private transfer : FileTransfer,
    public loadingCtrl: LoadingController) 
    {
      // this.color = navParams.get('value');
      // this.bandsname = navParams.get('bandNames');
      // console.log("color", this.color);
      // console.log("band", this.bandsname);
      this.fileTransfer = this.transfer.create();
    }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BanddetailsPage');

    this.getBandDetails();
     // Test interval to show the progress bar
    
  }

  getBandDetails(){
    this.nativeStorage.getItem(STORAGE.APP_DEVICE).then(res=>{
      if(res.deviceAddress != null){
        console.log(res.deviceAddress)
        this.noband = false;
        this.bandfound = true;

        this.BandModel = res.deviceName;

        this.nativeStorage.getItem(STORAGE.APP_BAND_VERSION).then(band=>{
          console.log(band);
          this.bVersion = band.bandVersion;
        })

    
        this.nativeStorage.getItem(STORAGE.APP_VERSION).then(appVers =>{
          console.log(appVers)
          this.appVersion = appVers.appVersion;
        })

        this.nativeStorage.getItem(STORAGE.APP_DEV_NAME).then(res =>{
          
          this.noband = false;
          this.bandfound = true;
          
          // this.color = res.value;
          this.bandsname = res.bandName;

          this.nativeStorage.getItem(STORAGE.APP_DEV_COLOR).then(res=>{
            this.color = res.value;
          })
          console.log(this.color);
          console.log(this.bandsname);
        })
      }
      
      
    })
  }

  remove(){
    let loading = this.loadingCtrl.create({
      content: "Removing Band...",
      spinner: 'ios'
    });
    
    loading.present();

    setTimeout(() => {
      loading.dismiss();

      this.bluetoothProvider.unBind().subscribe(()=>{});
      this.nativeStorage.getItem(STORAGE.APP_DEVICE).then(res=>{
        this.nativeStorage.setItem(STORAGE.APP_UNPAIRED_BAND,{deviceAddress:res.deviceAddress});
      })
      this.nativeStorage.remove(STORAGE.APP_DEVICE); //
      // this.navCtrl.setRoot(AddbandPage);
      this.noband = true;
      this.bandfound = false;

    }, 8000);

    
  }

  addBand(){
    this.navCtrl.setRoot(Bluetooth1Page);
  }



  callUpdateBand(){  
    this.ngzone.run(()=>{ 
      this.createDirectory();  
    })          
   }

  

   callBluetoothScan(){
      return new Promise((resolve, reject) => {       
        this.bluetoothProvider.scanDevices().subscribe((result)=>{
          for(var i = 0; i < result.LatestResult.data.length; i++){
            resolve(result.LatestResult.data[i].deviceAddress);
            /*console.log(result.LatestResult.data[i].deviceName.replace(/\s/g, ""));
    
            if(result.LatestResult.data[i].deviceName.replace(/\s/g, "") == "DfuEfitpro"){
              this.upgradeStatus = "Searching for Dfu Service"; 
              console.log(result.LatestResult.data[i].deviceName.replace(/\s/g, ""));
              console.log(result.LatestResult.data[i].deviceAddress);
              this.upgradeStatus = "Resolving Dfu Service"; 
              this.dfuData = result.LatestResult.data[i].deviceAddress;
              resolve({"deviceAddress": this.dfuData}); 
              //this.callFirmware(result.LatestResult.data[i].deviceAddress);
            }      */      
          }         
        });
      })
   }

   callFirmware(deviceAddress){
          this.countryProvider.upgradeFirmware(deviceAddress).subscribe(peripheralData => {          
            this.ngzone.run(()=>{            
                  setTimeout(() => { 
                    this.upgradeStatus = peripheralData.status;
                    this.loadProgress = peripheralData.progress.percent;
                    console.log(JSON.stringify(peripheralData));
                  },1) 
            })     
        },
          peripheralData => {
            console.log('disconnected');
      });
   }

   enterOta(){
      return new Promise((resolve, reject) => {
        this.bluetoothProvider.enterOta().subscribe(result=>{         
          this.upgradeStatus = "DfuMode";  
          resolve({"Message":"OTA"});         
        });  
      })
   }

  


   dwnloadImg() {
    this.upgradeStatus = "Getting Firmware Updates from Server..please wait";
    console.log("====================Started Downloading File ========================");    
    const url = 'https://billaboyz.000webhostapp.com/Dfuservice/dfupdate.zip';
    this.fileTransfer.download(url, this.file.dataDirectory + "files/FirmwareFolder/" + 'dfupdate.zip').then((entry) => {
      console.log('download complete: ' + entry.toURL());
      console.log(entry.toURL());
      console.log("====================Downloaded File Successfully ========================");
      this.upgradeStatus = "Downloaded Firmware update files..";
       this.retriveFile(); 
    }, (error) => {
      // handle error
      console.log(error);
      alert(error);
    });
}

devices: any[] = [];
obj1:string;
user:any;
parsedDevice:any;

scanBleDevices(){    
    this.devices = [];
    this.ble.scan([], 5).subscribe(
      device => this.onDeviceDiscovered(device), 
      error => this.scanError(error)
    );
}


onDeviceDiscovered(device) {  
  var devicesID = [];
      devicesID.push(device);      
  for (var key in devicesID) {
    if (devicesID.hasOwnProperty(key)) {           
       if(devicesID[key].name && typeof devicesID[key].name !== 'undefined'){            
           if(devicesID[key].name.toString().trim() == "DfuEfitpro"){
               console.log(devicesID[key].name);
               console.log(devicesID[key].id);
               this.callFirmware(devicesID[key].id);
           }
       }
       else{
         console.log("No key name" + devicesID[key].id);
       }
    }
    else{
      devicesID[key].name = devicesID[key].id;
    }
 }
}

// If location permission is denied, you'll end up here
scanError(error) {
  alert(JSON.stringify(error));
  alert("error" + error);
}



retriveFile() {
   console.log("======================List Files=======================================");
   this.upgradeStatus = "Received Firmware Updates from server";
   this.upgradeStatus = "Configuration Started do not disconnect";
   this.file.checkFile(this.file.dataDirectory +'files/FirmwareFolder/', 'dfupdate.zip')
        .then(() => {
           console.log('dfuupdate.zip' + "File Found at" + this.file.dataDirectory+'files/FirmwareFolder/');
           this.enterOta().then(data => {
              console.log(JSON.stringify(data));
              this.upgradeStatus = "Installation Started.....:)";               
              this.scanBleDevices();                           
          });
           
        })
        .catch((err) => {
           alert(JSON.stringify(err));
        });
}

createDirectory(){
  this.file.checkDir(this.file.dataDirectory+'/files', 'FirmwareFolder').then(response => {
    console.log('Directory exists'+response);
    this.cleanFolder();    
  }).catch(err => {
    this.file.createDir(this.file.dataDirectory+'/files', 'FirmwareFolder', false).then(response => {
      console.log('Directory created'+response);
      console.log('Directory created'+response);
      console.log("Directory response:" + JSON.stringify(response));
      this.dwnloadImg();
    }).catch(err => {
      console.log('Path Already Exists'+JSON.stringify(err));
      this.cleanFolder();
    }); 
  });
}

cleanFolder(){
 this.file.listDir(this.file.dataDirectory+'/files','FirmwareFolder').then((result)=>{
       console.log('Started Clearing Existing Files from Firmware Folder' + this.file.dataDirectory);
       console.log('Started Clearing Existing Files from Firmware Folder' + this.file.dataDirectory + '/files/FirmwareFolder');
       this.upgradeStatus = "Setting Firmware Folder";
       for(let file of result){
           if(file.isFile == true){
               this.file.removeFile(this.file.dataDirectory+'/files/FirmwareFolder/', file.name).then( data => {                  
                   console.log('File name' + file.name);                   
                   data.fileRemoved.getMetadata(function (metadata) {
                       let name = data.fileRemoved.name;
                       let size = metadata.size ;
                       let fullPath = data.fileRemoved.fullPath;
                       console.log(JSON.stringify(metadata));
                       console.log("name" + name);
                       console.log("size" + size);
                       console.log("Full Path" + fullPath);
                   });
               }).catch( error => {
                   file.getMetadata(function (metadata) {
                       let name = file.name ;
                       let size = metadata.size ;
                       console.log('Error deleting file from cache folder: ' +  error) ;
                       alert('Error deleting file from Firmware folder: ' +  error);
                   }) ;
             });
         }
     }
     //Cleaned Folder and Initializing Firmware Image
     this.dwnloadImg();
 });
}

   //File Transfer - for firmware & Creating folder for firmware to load - end
}
