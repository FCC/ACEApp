mkdir cordova
cd cordova
call cordova create ACEQUILL org.organization.ACEQUILL "ACE Quill"
cd ACEQUILL
call cordova platform add android
call cordova plugin add cordova-plugin-device
call cordova plugin add cordova-plugin-insomnia
call cordova plugin add cordova-plugin-secure-storage
call cordova plugin add cordova-plugin-whitelist
cd ..
cd ..
echo done
