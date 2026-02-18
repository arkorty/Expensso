# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# ─── React Native ─────────────────────────────────────────────────────
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.** { *; }
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
}

# ─── React Native Reanimated ─────────────────────────────────────────
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# ─── React Native Gesture Handler ────────────────────────────────────
-keep class com.swmansion.gesturehandler.** { *; }

# ─── React Native SQLite Storage ─────────────────────────────────────
-keep class org.pgsqlite.** { *; }

# ─── React Native MMKV ───────────────────────────────────────────────
-keep class com.tencent.mmkv.** { *; }

# ─── React Native Screens ────────────────────────────────────────────
-keep class com.swmansion.rnscreens.** { *; }

# ─── React Native SVG ────────────────────────────────────────────────
-keep class com.horcrux.svg.** { *; }

# ─── React Native Vector Icons ───────────────────────────────────────
-keep class com.oblador.vectoricons.** { *; }

# ─── General Android optimisation ────────────────────────────────────
-dontwarn javax.annotation.**
-dontwarn sun.misc.**
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes SourceFile,LineNumberTable
