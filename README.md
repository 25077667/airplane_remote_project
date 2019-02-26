# airplane_remote_project
飛機控制專案

## 注意事項
1. 瀏覽器請盡量更新，因為這使用的API比較新，硬體設備的話基本上在2012以後出廠都支援，其他支援與否僅會因為瀏覽器版本而出現問題
2. Chrome 請更新至67以後
3. 此專案將會搭配 nodeMCU 與 手機Access Point 來實作，web的部分應該是另架主機
4. 有些 library 如果需要另外 include 我注意到的話會提醒，沒有注意到的話就請見諒了
5. 走過路過麻煩留下星星，歡迎大神幫忙發 pr
6. 目前確定不支援Firefox (絕對不是我偷懶，而是firefox不支援Accelerometer這個API) about main.js line 11 (目前只有chrome支援Accelerometer這個API)
7. 提供chrome 69版apk給android手機用戶下載

=======
尚未解決問題
1. 超距去連到別人
2. 多台裝置同時連到某一台AP
3. 如何自動讓裝置連到你的手機
4. 可能會設計成不ack，只有在 error 或 return IP才會送資料回來
5. nodeMCU 上的 action 還沒做
6. 如果在t時刻內沒有指令，則啟用穩定模式，穩定降落

======
已解決問題
1. 處理 如果Wi-Fi突然斷線(可能超距)
> 反向已原速度1/10移動，直到重新連線
