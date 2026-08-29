netsh interface ip set dns name="WiFi" static 1.1.1.1
netsh interface ip add dns name="WiFi" 1.0.0.1 index=2
ipconfig /flushdns
