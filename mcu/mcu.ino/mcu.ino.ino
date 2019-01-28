//just for test the board!
//the parameter is "NodeMCU 1.0(ESP-12E Module), 80MHz, Flash 4M(3MSPIFF), v2 Lower Memory, Disabled, None, Only sketch 115200"
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const char* ssid     = "********";
const char* password = "********";

String pattern;

void actions(int dx, int dy, int dz, int motor){

}

void handle_message(){
  if(server.hasArg("msg")){
    String data = server.arg("msg");

    if(data.length() == 8 && pattern.length()!=0){
      //form pattern
      memcpy(pattern,data,sizeof(data));  //this is the pattern of client,first time client in
    }

    else if(data.length() == 11+8 ){
      //form 0000000000:pattern
      String check_pattern;
      if(data[10]==':' && data[0].toInt()+data[1].toInt()+data[2].toInt() == 0)
        memcpy(check_pattern, &(data[11]), sizeof(char)*8 );
      else
        return;

      if(check_pattern == pattern)
        pattern = ""; //disconnect
      else{
        Serial.print("Data lost or be attacked.");
        return;
      }
    }

    else{
      //form dx:dy:dz:motor:pattern
      String check_pattern;
      int pattern_index = sizeof(data)-8;
      //will decrypt all msg
      memcpy(check_pattern, &(data[pattern_index]), sizeof(char)*8 );
      /*
        check_pattern = check_pattern XOR with pattern
      */
      if(check_pattern != pattern)
        return;

      String raw_dx;
      String raw_dy;
      String raw_dz;
      String raw_motor;
      int index = 0;
      while (data[index] != ':') {
        raw_dx += data[index];
        index ++;
      }
      index++;
      while (data[index] != ':') {
        raw_dy += data[index];
        index ++;
      }
      index++;
      while (data[index] != ':') {
        raw_dz += data[index];
        index ++;
      }
      index++;
      while (data[index] != ':') {
        raw_motor += data[index];
        index ++;
      }

      actions(raw_dx.toInt(), raw_dy.toInt(), raw_dz.toInt(), raw_motor.toInt());
    }

  }
}

void setup() {
  Serial.begin(115200);
  delay(10);

  // We start by connecting to a WiFi network
  Serial.println();
  Serial.println();
  Serial.print("wifi Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  server.on("/data/",HTTP_GET,handle_message);
  server.begin();
  Serial.print("server is on.");
  println();
}

void loop() {
  server.handleClient();
}
