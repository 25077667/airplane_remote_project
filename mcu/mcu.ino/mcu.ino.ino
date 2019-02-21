//just for test the board!
//the parameter is "NodeMCU 1.0(ESP-12E Module), 80MHz, Flash 4M(3MSPIFF), v2 Lower Memory, Disabled, None, Only sketch 115200"
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const char *ssid = "********";
const char *password = "********";
ESP8266WebServer server(80);
String pattern;
int counting = 0;
int previous_data[4] = {0, 0, 0, 50};

void actions(int dx, int dy, int dz, int motor)
{
  //if motor == 0, it is default speed; if motor > 0, it is add speed; if motor > 0, it is decrease speed;
  Serial.print("Action!");
  Serial.println(counting);
  counting++;
  //save previous action to reduce packages for transmittion
  previous_data[0] = dx;
  previous_data[1] = dy;
  previous_data[2] = dz;
  previous_data[3] = motor;
}

bool check_pattern(String data)
{
  if (pattern == "")
    return false;

  String copied;
  copied = data.substring(data.length() - 8, data.length());

  bool is_same = true;
  if (pattern != copied)
    is_same = false;
  return is_same;
}

void handle_message()
{
  if (server.hasArg("msg"))
  {

    String data = server.arg("msg");

    if (pattern != "" && check_pattern(data) == false)
    {
      server.send(403, "text/html", "permission denied");
      return;
    }

    if (data.length() == 8)
    {                 //set pattern
      pattern = data; //this is the pattern of client,first time client in
      Serial.print("set pattern as : ");
      Serial.println(pattern);
    }

    else if (pattern == "")
    {
      server.send(403, "text/html", "Data lost or be attacked.");
      return;
    }

    else if (data.length() == 11 + 8)
    { //disconnect, form 0000000000:pattern
      pattern = "";
    }

    else if (data.length() == 40)
    {
      /*form dx:dy:dz:motor:pattern
        will decrypt all msg
        check_pattern = check_pattern XOR pattern
      */
      String raw_dx;
      String raw_dy;
      String raw_dz;
      String raw_motor;
      raw_dx = data.substring(0, 7);
      raw_dy = data.substring(8, 14);
      raw_dz = data.substring(15, 21);
      raw_motor = data.substring(22, 28);
      Serial.println(raw_dx + ":" + raw_dy + ":" + raw_dz + ":" + raw_motor);
      actions(raw_dx.toInt(), raw_dy.toInt(), raw_dz.toInt(), raw_motor.toInt());
    }

    server.send(200, "text/html", "Data received");
  }
  else
    actions(previous_data[0], previous_data[1], previous_data[2], previous_data[3]);
}

void setup()
{
  Serial.begin(115200);
  delay(10);
  counting = 0;

  // We start by connecting to a WiFi network
  Serial.println();
  Serial.println();
  Serial.print("wifi is connecting to : ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  pinMode(D0, OUTPUT);

  while (WiFi.status() != WL_CONNECTED)
  {
    digitalWrite(D0, HIGH);
    delay(800);
    digitalWrite(D0, LOW);
  }

  Serial.println("\nWiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  server.on("/data/", HTTP_GET, handle_message);
  server.begin();
  Serial.println("server is on.");
}

void loop()
{
  server.handleClient();
}
