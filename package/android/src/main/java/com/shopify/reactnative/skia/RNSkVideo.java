package com.shopify.reactnative.skia;

import android.content.Context;
import android.graphics.ImageFormat;
import android.hardware.HardwareBuffer;
import android.media.Image;
import android.media.ImageReader;
import android.media.MediaCodec;
import android.media.MediaExtractor;
import android.media.MediaFormat;
import android.net.Uri;
import android.os.Build;
import android.view.Surface;

import androidx.annotation.RequiresApi;

import com.facebook.jni.annotations.DoNotStrip;

import java.io.IOException;
import java.nio.ByteBuffer;

public class RNSkVideo {
    private final Uri uri;
    private final Context context;

    private MediaExtractor extractor;
    private MediaCodec decoder;
    private ImageReader imageReader;
    private Surface outputSurface;
    private double durationMs;
    private double frameRate;

    RNSkVideo(Context context, String localUri) {
        this.uri = Uri.parse(localUri);
        this.context = context;
        this.initializeReader();
    }

    private void initializeReader() {
        extractor = new MediaExtractor();
        try {
            extractor.setDataSource(context, this.uri, null);
            int trackIndex = selectVideoTrack(extractor);
            if (trackIndex < 0) {
                throw new RuntimeException("No video track found in " + this.uri);
            }
            extractor.selectTrack(trackIndex);
            MediaFormat format = extractor.getTrackFormat(trackIndex);
            // Retrieve and store video properties
            if (format.containsKey(MediaFormat.KEY_DURATION)) {
                durationMs = format.getLong(MediaFormat.KEY_DURATION) / 1000;  // Convert microseconds to milliseconds
            }
            if (format.containsKey(MediaFormat.KEY_FRAME_RATE)) {
                frameRate = format.getInteger(MediaFormat.KEY_FRAME_RATE);
            }
            int width = format.getInteger(MediaFormat.KEY_WIDTH);
            int height = format.getInteger(MediaFormat.KEY_HEIGHT);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                imageReader = ImageReader.newInstance(
                        width,
                        height,
                        ImageFormat.PRIVATE,
                        2,
                        HardwareBuffer.USAGE_GPU_SAMPLED_IMAGE
                );
            } else {
                imageReader = ImageReader.newInstance(width, height,
                        ImageFormat.PRIVATE, 2);
            }
            outputSurface = imageReader.getSurface();

            // Create a decoder for the format
            String mime = format.getString(MediaFormat.KEY_MIME);
            decoder = MediaCodec.createDecoderByType(mime);

            // Note: Use an output Surface for rendering if necessary, otherwise handle buffers
            decoder.configure(format, outputSurface, null, 0);
            decoder.start();
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize extractor or decoder", e);
        }
    }

    @DoNotStrip
    public double getDuration() {
        return durationMs;
    }

    @DoNotStrip

    public double getFrameRate() {
        return frameRate;
    }

    @DoNotStrip
    public HardwareBuffer nextImage() {
        if (!decoderOutputAvailable()) {
            decodeFrame();
        }

        Image image = imageReader.acquireLatestImage();
        if (image != null) {
            HardwareBuffer hardwareBuffer = image.getHardwareBuffer();
            image.close();  // Make sure to close the Image to free up the buffer
            return hardwareBuffer;
        }
        return null;
    }

    @DoNotStrip
    public void seek(long timestamp) {
        // Seek to the closest sync frame at or before the specified time
        extractor.seekTo(timestamp * 1000, MediaExtractor.SEEK_TO_PREVIOUS_SYNC);
        // Flush the codec to reset internal state and buffers
        if (decoder != null) {
            decoder.flush();
        }
    }

    private int selectVideoTrack(MediaExtractor extractor) {
        int numTracks = extractor.getTrackCount();
        for (int i = 0; i < numTracks; i++) {
            MediaFormat format = extractor.getTrackFormat(i);
            String mime = format.getString(MediaFormat.KEY_MIME);
            if (mime.startsWith("video/")) {
                return i;
            }
        }
        return -1;
    }

    private boolean decoderOutputAvailable() {
        MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();
        int outputBufferId = decoder.dequeueOutputBuffer(info, 0);
        if (outputBufferId >= 0) {
            // If a buffer is available, release it immediately back since we are just checking
            decoder.releaseOutputBuffer(outputBufferId, true);
            return true;
        }
        return false;
    }

    private void decodeFrame() {
        MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();
        long timeoutUs = 10000;
        boolean isEOS = false;

        int inputBufferId = decoder.dequeueInputBuffer(timeoutUs);
        if (inputBufferId >= 0) {
            ByteBuffer inputBuffer = decoder.getInputBuffer(inputBufferId);
            int sampleSize = extractor.readSampleData(inputBuffer, 0);
            if (sampleSize < 0) {
                // End of stream, make sure to send this information to the decoder
                decoder.queueInputBuffer(inputBufferId, 0, 0, 0L, MediaCodec.BUFFER_FLAG_END_OF_STREAM);
                isEOS = true;
            } else {
                long presentationTimeUs = extractor.getSampleTime();
                decoder.queueInputBuffer(inputBufferId, 0, sampleSize, presentationTimeUs, 0);
                extractor.advance();
            }
        }

        int outputBufferId = decoder.dequeueOutputBuffer(info, timeoutUs);
        if (outputBufferId >= 0) {
            // If we have a valid buffer, release it to make it available to the ImageReader's surface
            decoder.releaseOutputBuffer(outputBufferId, true);

            if ((info.flags & MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) {
                isEOS = true;
            }
        }
    }

    public void release() {
        if (decoder != null) {
            decoder.stop();
            decoder.release();
            decoder = null;
        }
        if (extractor != null) {
            extractor.release();
            extractor = null;
        }
    }
}
