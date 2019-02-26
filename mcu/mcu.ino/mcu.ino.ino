//just for test the board!
//the parameter is "NodeMCU 1.0(ESP-12E Module), 80MHz, Flash 4M(3MSPIFF), v2 Lower Memory, Disabled, None, Only sketch 115200"
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const char *ssid = "********";
const char *password = "********";
ESP8266WebServer server(80);
String pattern;
int counting = 0;
float previous_data[4] = {0, 0, 0, 50};

void actions(float dx, float dy, float dz, float motor, bool oriented)
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

void handle_message()
{
  if (server.hasArg("p"))
  {
    String p = server.arg("p");
    if (pattern != "" && (p == pattern) && server.arg("x") != "d")
      actions(server.arg("x").toFloat(), server.arg("y").toFloat(), server.arg("z").toFloat(), server.arg("m").toFloat(), true);
    else if (pattern != "" && (p == pattern) && server.arg("x") == "d")
      pattern = "";
    else if (pattern == "" && (server.arg("x").toInt() + server.arg("y").toInt() + server.arg("z").toInt() + server.arg("m").toInt()) == 0)
      pattern = p;
    else
      server.send(403, "text/html", "");

    server.send(200, "text/html", "");
    return;
  }

  else if (WiFi.status() != WL_CONNECTED)
  {
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED)
      actions(previous_data[0]/10, previous_data[1]/10, previous_data[2]/10, previous_data[3]/10, false);
  } //it lost link, reconnection and go back
  else
    actions(previous_data[0], previous_data[1], previous_data[2], previous_data[3], true);
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
