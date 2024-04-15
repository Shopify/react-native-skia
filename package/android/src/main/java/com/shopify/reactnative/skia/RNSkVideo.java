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

import java.io.IOException;
import java.nio.ByteBuffer;

public class RNSkVideo {
    private final Uri uri;
    private final Context context;

    private MediaExtractor extractor;
    private MediaCodec decoder;
    private ImageReader imageReader;
    private Surface outputSurface;

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
            int width = format.getInteger(MediaFormat.KEY_WIDTH);
            int height = format.getInteger(MediaFormat.KEY_HEIGHT);
            imageReader = ImageReader.newInstance(width, height, ImageFormat.YUV_420_888, 2);
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

    @RequiresApi(api = Build.VERSION_CODES.P)
    public HardwareBuffer nextFrame() throws InterruptedException {
        Image image = imageReader.acquireNextImage();
        if (image != null) {
            return image.getHardwareBuffer();
        }
        return null; // Modify this according to how you handle AHardwareBuffer
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

    private void decode() {
        MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();
        boolean isEOS = false;
        long timeoutUs = 10000; // Timeout for dequeue operations

        while (!isEOS) {
            if (!isEOS) {
                int inputBufferId = decoder.dequeueInputBuffer(timeoutUs);
                if (inputBufferId >= 0) {
                    ByteBuffer inputBuffer = decoder.getInputBuffer(inputBufferId);
                    int sampleSize = extractor.readSampleData(inputBuffer, 0);
                    if (sampleSize < 0) {
                        decoder.queueInputBuffer(inputBufferId, 0, 0, 0L, MediaCodec.BUFFER_FLAG_END_OF_STREAM);
                        isEOS = true;
                    } else {
                        long presentationTimeUs = extractor.getSampleTime();
                        decoder.queueInputBuffer(inputBufferId, 0, sampleSize, presentationTimeUs, 0);
                        extractor.advance();
                    }
                }
            }

            int outputBufferId = decoder.dequeueOutputBuffer(info, timeoutUs);
            if (outputBufferId >= 0) {
                if ((info.flags & MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) {
                    isEOS = true;
                }
                // Release the buffer so it can be rendered to the surface (ImageReader's surface)
                decoder.releaseOutputBuffer(outputBufferId, true);
            }
        }

        release();  // Ensure resources are cleaned up
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
