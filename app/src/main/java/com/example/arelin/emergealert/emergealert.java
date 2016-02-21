package com.example.arelin.emergealert;

import android.app.Application;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import io.smooch.core.Smooch;
import io.smooch.core.User;

/**
 * Created by arelin on 2/20/16.
 */
public class emergealert extends Application {
    @Override
    public void onCreate() {
        super.onCreate();

        // Initialize Smooch with your app token
        // Get your own at https://app.smooch.io/
        // and paste it here!
        Smooch.init(this, "e0i1tnsh9gww93g5jx2m1eok8");
        addSomeProperties(User.getCurrentUser());
    }

    private void addSomeProperties(final User user) {
        final Map<String, Object> customProperties = new HashMap<>();

        // Identify user with default properties
        user.setFirstName("Demo");
        user.setLastName("App");
        user.setEmail("demo.app@smooch.io");
        user.setSignedUpAt(new Date(1420070400000l));

        // Add your own custom properties
        customProperties.put("Last Seen", new Date());
        customProperties.put("Awesome", true);
        customProperties.put("Karma", 1337);
        user.addProperties(customProperties);
    }
}
