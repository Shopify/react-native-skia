package com.shopify.reactnative.skia;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.Choreographer;

import com.facebook.jni.HybridData;
import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.bridge.ReactContext;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;

public class PlatformContext {
    @DoNotStrip
    private final HybridData mHybridData;

    private final ReactContext mContext;

    private final String TAG = "PlatformContext";

    public PlatformContext(ReactContext reactContext) {
        mContext = reactContext;
        float density = mContext.getResources().getDisplayMetrics().density;
        //Log.d(TAG, "density=" + Float.toString(density));
        mHybridData = initHybrid(density);
    }

    @DoNotStrip
    public Object createVideo(String url) {
        return new RNSkVideo(mContext, url);
    }

    private byte[] getStreamAsBytes(InputStream is) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        int nRead;
        byte[] data = new byte[4 * 0x400];
        while ((nRead = is.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }
        return buffer.toByteArray();
    }

    @DoNotStrip
    Object takeScreenshotFromViewTag(int tag) {
        return ViewScreenshotService.makeViewScreenshotFromTag(mContext, tag);
    }

    @DoNotStrip
    public byte[] getJniStreamFromSource(String sourceUri) throws IOException {
        // First try loading the input as a resource directly
        int resourceId = mContext.getResources().getIdentifier(sourceUri, "drawable", mContext.getPackageName());

        // Test to see if we have a raw resource (for SVG)
        if (resourceId == 0) {
            resourceId = mContext.getResources().getIdentifier(sourceUri, "raw", mContext.getPackageName());
        }

        if (resourceId != 0) {
            // We can just return the input stream directly
            return getStreamAsBytes(mContext.getResources().openRawResource(resourceId));
        }

        // We should try to open a connection and return a stream to download this
        // object
        URI uri = null;
        try {
            uri = new URI(sourceUri);

            String scheme = uri.getScheme();

            if (scheme == null)
                throw new Exception("Invalid URI scheme");

            // TODO: Base64??

            URL url = uri.toURL();
            URLConnection connection = url.openConnection();
            connection.connect();

            BufferedInputStream b = new BufferedInputStream(url.openStream(), 8192);
            return getStreamAsBytes(b);

        } catch (URISyntaxException e) {
            e.printStackTrace();
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    void onResume() {
        _isPaused = false;
        Log.i(TAG, "Resume");

        float density = mContext.getResources().getDisplayMetrics().density;
        //Log.d(TAG, "density=" + Float.toString(density));
        setPixelDensity(density);
    }

    @Override
    protected void finalize() throws Throwable {
        mHybridData.resetNative();
        super.finalize();
    }

    // Private c++ native methods
    private native HybridData initHybrid(float pixelDensity);
    private native float getPixelDensity();
    private native void setPixelDensity(float pixelDensity);
}