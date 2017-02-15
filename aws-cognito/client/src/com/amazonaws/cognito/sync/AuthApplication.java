package com.amazonaws.cognito.sync;

import android.app.Application;

import com.google.firebase.FirebaseApp;

public class AuthApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        FirebaseApp.initializeApp(this);
    }
}