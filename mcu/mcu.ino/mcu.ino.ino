//just for test the board!
//the parameter is "NodeMCU 1.0(ESP-12E Module), 80MHz, Flash 4M(3MSPIFF), v2 Lower Memory, Disabled, None, Only sketch 115200"
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const char* ssid     = "********";
const char* password = "********";
ESP8266WebServer server(80);
String pattern;

void actions(int dx, int dy, int dz, int motor){

}

bool check_pattern(String data){
  String copied;
  copied = data.substring(data.length()-8, data.length()-1);

  bool is_same = true;
  int len = pattern.length();
  while(len--)
    if(pattern[len]!=copied[len]){
      is_same = false;
      break;
    }//check every index of pattern
  return is_same;
}

void handle_message(){
  if(server.hasArg("msg")){

    String data = server.arg("msg");
    Serial.println(data);

    if(pattern!="" && check_pattern(data)==false)
      return;

    if(data.length() == 8){//set pattern
      memcpy(&pattern,&data,sizeof(data));  //this is the pattern of client,first time client in
      Serial.print("set pattern as : ");Serial.println(pattern);
    }

    else if(data.length() == 11+8 ){ //disconnect, form 0000000000:pattern
      pattern = "";
    }

    else if(data.length() == 36){
      /*form dx:dy:dz:motor:pattern
        will decrypt all msg
        check_pattern = check_pattern XOR pattern
      */
      String raw_dx;
      String raw_dy;
      String raw_dz;
      String raw_motor;
      memcpy(&(raw_dx[0]), &(data[0]), sizeof(char)*6);
      memcpy(&(raw_dy[0]), &(data[7]), sizeof(char)*6);
      memcpy(&(raw_dz[0]), &(data[14]), sizeof(char)*6);
      memcpy(&(raw_motor[0]), &(data[21]), sizeof(char)*6);

      actions(raw_dx.toInt(), raw_dy.toInt(), raw_dz.toInt(), raw_motor.toInt());
    }
    else{
      Serial.print("Data lost or be attacked.");
    }
    server.send(200, "text/html", "Data received");
  }
}

void setup() {
  Serial.begin(115200);
  delay(10);

  // We start by connecting to a WiFi network
  Serial.println();
  Serial.println();
  Serial.print("wifi is connecting to : ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  pinMode(D0, OUTPUT);

  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(D0, HIGH);delay(800);digitalWrite(D0, LOW);
  }

  Serial.println("\nWiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  server.on("/data/",HTTP_GET,handle_message);
  server.begin();
  Serial.println("server is on.");
}

void loop() {
  server.handleClient();
}
