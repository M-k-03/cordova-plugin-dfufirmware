package com.cloakedninjas.cordova.plugins;

//import java.net.URI;
//import java.net.URISyntaxException;
import android.net.Uri;
import android.util.Log;
import java.util.Locale;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.apache.cordova.CordovaArgs;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;
import com.aiotlabs.app.efitpro.R;
import com.aiotlabs.cordova.plugin.bluetooth.smablelib.component.*;

import no.nordicsemi.android.dfu.DfuProgressListener;
import no.nordicsemi.android.dfu.DfuProgressListenerAdapter;
import no.nordicsemi.android.dfu.DfuServiceInitiator;
import no.nordicsemi.android.dfu.DfuServiceListenerHelper;


public class DfuFirmware extends CordovaPlugin {
    //private SmaManager mSmaManager;
    //private SmaCallback mSmaCallback;
    private final static String TAG = "UPGRADE_FIRMWARE";
    private CallbackContext dfuCallback;
    private final DfuProgressListener progressListener = new DfuProgressListener();
    private String deviceName = null;
    private String deviceMacAddress = null;

    public boolean execute(String action, CordovaArgs args, final CallbackContext callbackContext) throws JSONException {
        if (action.equals("get")) {
            String result = Locale.getDefault().getCountry();
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, result));
            return true;
        }
        else if (action.equals("getDeviceName")) {
            deviceName = args.getString(0);
            Log.d(TAG, "Duf Device Name ======>" + deviceName);
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, deviceName));
            return true;
        }
        else if (action.equals("getDeviceMacAddress")) {
                deviceMacAddress = args.getString(0);
                Log.d(TAG, "Setting Duf Device Mac Address ======>" + deviceMacAddress);
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, deviceMacAddress));
            return true;
        }
        else if(action.equals("upgradeFirmware")){
            Log.d(TAG, "After Setting Duf Device Mac Address ======>" + deviceMacAddress);
            Log.d(TAG, "After Duf Device Name ======>" + deviceName);
            final String deviceId = args.getString(0);
            System.out.println(deviceId);
            Log.d(TAG, "Duf Device Mac Address ======>" + deviceId);

            cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    callbackContext.sendPluginResult(setAndroidPreferences(callbackContext, deviceId));
                }
            });


            return true;
        }
        callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR));
        return false;
    }

    private void sendDfuNotification(String message) {
        JSONObject json = new JSONObject();
        try {
            json.put("name", "EFit pro max");
            json.put("id", "D3:60:B6:96:D8:8D");
            json.put("status", message);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        Log.d(TAG, "Firmware Notification ======>" + message);
        PluginResult result = new PluginResult(PluginResult.Status.OK, json);
        result.setKeepCallback(true);
        dfuCallback.sendPluginResult(result);
    }


    private PluginResult setAndroidPreferences(final CallbackContext callbackContext, String deviceId)  {
        dfuCallback = callbackContext;
       // final DfuServiceInitiator starter = new DfuServiceInitiator("D3:60:B6:96:D8:8E")
        final DfuServiceInitiator starter = new DfuServiceInitiator(deviceId)
                .setDeviceName("EfitPro Max")
                .setKeepBond(false)
                .setForceDfu(false)
                .setPacketsReceiptNotificationsEnabled(true)
                .setPacketsReceiptNotificationsValue(10)
                .setUnsafeExperimentalButtonlessServiceInSecureDfuEnabled(true)
                .setDisableNotification(false);
        String uribase = "file:///data/user/0/com.aiotlabs.app.efitpro/files/files/FirmwareFolder/dfupdate.zip";
        Uri uriBase = Uri.parse(uribase);
        starter.setZip(uriBase);
        //starter.setZip(R.raw.dfupdate);
        //*DfuServiceController controller = *//*
        starter.start(this.cordova.getActivity(), DfuService.class);

        DfuServiceListenerHelper.registerProgressListener(this.cordova.getActivity(), progressListener);

        PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
        result.setKeepCallback(true);
        callbackContext.sendPluginResult(result);
        return result;
    }

    private void unregisterDfuProgressListener() {
        DfuServiceListenerHelper.unregisterProgressListener(this.cordova.getActivity(), progressListener);
        dfuCallback = null;
    }

    private class DfuProgressListener extends DfuProgressListenerAdapter {
        @Override
        public void onDeviceConnecting(String deviceAddress) {
            sendDfuNotification("deviceConnecting");
        }

        @Override
        public void onDeviceConnected(String deviceAddress) {
            sendDfuNotification("deviceConnected");
        }

        @Override
        public void onDfuProcessStarting(String deviceAddress) {
            sendDfuNotification("dfuProcessStarting");
        }

        @Override
        public void onDfuProcessStarted(String deviceAddress) {
            sendDfuNotification("dfuProcessStarted");
        }

        @Override
        public void onEnablingDfuMode(String deviceAddress) {
            sendDfuNotification("enablingDfuMode");
        }

        @Override
        public void onFirmwareValidating(String deviceAddress) {
            sendDfuNotification("firmwareValidating");
        }

        @Override
        public void onDeviceDisconnecting(String deviceAddress) {
            sendDfuNotification("deviceDisconnecting");
        }

        @Override
        public void onDeviceDisconnected(String deviceAddress) {
            sendDfuNotification("deviceDisconnected");
        }

        @Override
        public void onDfuCompleted(String deviceAddress) {
            sendDfuNotification("dfuCompleted");
            unregisterDfuProgressListener();
        }

        @Override
        public void onDfuAborted(String deviceAddress) {
            sendDfuNotification("dfuAborted");
            unregisterDfuProgressListener();
        }

        @Override
        public void onError(String deviceAddress, int error, int errorType, String message) {
            dfuCallback.error(asJSONObject(message));
            unregisterDfuProgressListener();
        }

        @Override
        public void onProgressChanged(String deviceAddress, int percent, float speed, float avgSpeed, int currentPart, int partsTotal) {
            Log.d(TAG, "sendDfuProgress: " + percent);


            JSONObject json = new JSONObject();
            JSONObject progress = new JSONObject();

            try {
                progress.put("percent", percent);
                progress.put("speed", speed);
                progress.put("avgSpeed", avgSpeed);
                progress.put("currentPart", currentPart);
                progress.put("partsTotal", partsTotal);

                //json.put("name", device.getName());
               // json.put("id", device.getAddress());
                json.put("status", "progressChanged");
                json.put("progress", progress);
            } catch (JSONException e) {
                e.printStackTrace();
            }

            PluginResult result = new PluginResult(PluginResult.Status.OK, json);
            result.setKeepCallback(true);
            dfuCallback.sendPluginResult(result);
        }


    }

    public JSONObject asJSONObject(String errorMessage)  {

        JSONObject json = new JSONObject();

        try {
           // json.put("name", device.getName());
           // json.put("id", device.getAddress()); // mac address
            json.put("errorMessage", errorMessage);
        } catch (JSONException e) { // this shouldn't happen
            e.printStackTrace();
        }

        return json;
    }
}
