Canteen Grab & Go Android launcher icon assets

Copy the contents of this ZIP's app/src/main/res/ folder into:
canteen-grab-go-main/android/app/src/main/res/

Allow Windows to merge folders and replace files with the same names.
This package includes mipmap PNGs and adaptive icon XML files.

Then, from the project root (canteen-grab-go-main), run:
  npx cap sync android
  cd android
  .\gradlew.bat assembleDebug

APK output:
  android\app\build\outputs\apk\debug\app-debug.apk

Note: This updates the launcher icon only; it does not change the in-app splash screen.
