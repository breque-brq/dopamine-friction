package com.brqmobile

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import android.util.Log

class BRQAccessibilityService : AccessibilityService() {

    /**
     * Internal counter tracking the number of times a scroll event is fired.
     */
    private var scrollCount = 0
    
    /**
     * Threshold for friction. After this many scroll events, the BRQ-01 brake screen is summoned.
     * Note: 50 is an algorithmic approximation, as Android fires multiple events per physical swipe.
     */
    private val SCROLL_LIMIT = 50 
    
    /**
     * Set of targeted social media package names. 
     * These are the applications where the infinite scroll syndrome is most prevalent.
     */
    private val TARGET_PACKAGES = setOf(
        "com.instagram.android",      // Instagram
        "com.twitter.android",        // X / Twitter
        "com.zhiliaoapp.musically",   // TikTok
        "com.facebook.katana",        // Facebook
        "com.google.android.youtube"  // YouTube Shorts / Feed
    )

    /**
     * Called by the Android system exactly when an accessibility event occurs in any app.
     * We filter this stream to only parse 'TYPE_VIEW_SCROLLED' events originating from our TARGET_PACKAGES.
     */
    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (event.eventType == AccessibilityEvent.TYPE_VIEW_SCROLLED) {
            val packageName = event.packageName?.toString() ?: return
            
            if (TARGET_PACKAGES.contains(packageName)) {
                scrollCount++
                Log.d("BRQ-01", "Scroll detected in $packageName. Count: $scrollCount")

                if (scrollCount >= SCROLL_LIMIT) {
                    triggerFriction()
                }
            }
        }
    }

    /**
     * Executes the Friction Protocol.
     * Resets the scroll counter and fires an Intent to bring the BRQ React Native app to the foreground,
     * passing the 'FORCE_BRAKE' flag to trigger the brutalist lock screen.
     */
    private fun triggerFriction() {
        Log.d("BRQ-01", "Friction limit reached! Launching Brake Screen.")
        scrollCount = 0 // Reset
        
        // Launch the main React Native activity
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
            putExtra("FORCE_BRAKE", true) // Signal to RN logic
        }
        startActivity(intent)
    }

    override fun onInterrupt() {
        Log.d("BRQ-01", "Service Interrupted")
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d("BRQ-01", "Service Connected")
    }
}
