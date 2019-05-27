package com.cloakedninjas.cordova.plugins;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

public class DfuNotificationActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // If this activity is the root activity of the task, the app is not running
        if (isTaskRoot()) {
            launchApp();
        }

        // Now finish, which will drop you to the activity at which you were at the top of the task stack
        finish();
    }
    private void launchApp() {
        Context context = getApplicationContext();
        String pkgName  = context.getPackageName();

        Intent intent = context
                .getPackageManager()
                .getLaunchIntentForPackage(pkgName);

        intent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);

        context.startActivity(intent);
    }
}
