#include <iostream>
#include <stdio.h>
#include <cmath>
#include <random>
#include <time.h>
#include <string.h>
#include <pthread.h>
#include <unistd.h>

int collsions=0;
int* channel;

class Device{
    public:
        int id;
        int coordinate_x;
        int coordinate_y;
        int select_channel;
}device[20];

int get_random_number(int module){
    std::random_device seed;
    std::mt19937_64 mt_rand(seed());
    return mt_rand()%module;
}

int distance(Device a, Device b){
    int x = a.coordinate_x - b.coordinate_x;
    int y = a.coordinate_y - b.coordinate_y;
    return round(sqrt(x*x + y*y));
}

bool everybody_out_of_rang3(int test_id){
    for(int i=0;i<test_id;i++){
        if(distance(device[i],device[test_id])<15)// && device[i].select_channel == device[test_id].select_channel
            return false;
    }
    return true;
}

void* actions(void* id){
    //assume 10m radius of all access point
    int test_id = *(int*)(id);
    device[test_id].id = test_id;
    device[test_id].select_channel = get_random_number(14)+1;
    device[test_id].coordinate_x = get_random_number(80);   //total 80m
    device[test_id].coordinate_y = get_random_number(80);   //total 80m

    int people_at_selection = channel[device[test_id].select_channel];

    if(people_at_selection==0 || everybody_out_of_rang3(test_id)){
        channel[device[test_id].select_channel] = test_id;
        usleep(1000);//0.001s
        channel[device[test_id].select_channel] = 0;
    }
    else{
        collsions++;
        usleep(1000);
    }
}

void create_devices(int device_mounts){
    pthread_t* new_divice;
    new_divice = (pthread_t*)malloc(sizeof(pthread_t)*device_mounts);
    for(int i=0;i<device_mounts;i++)
        pthread_create(&(new_divice[i]), NULL, actions, &i);
    for(int i=0;i<device_mounts;i++)
        pthread_join((new_divice[i]),NULL);
}

int main(){
    FILE* file_pointer = fopen("out3.txt","w");
    channel = (int*)malloc(sizeof(int)*14);
    memset(channel,0,sizeof(channel));
    for(int i=1;i<=20;i++){
        collsions = 0;
        create_devices(i);
        std::cout<<i<<" collisions : "<<collsions<<std::endl;
        fprintf(file_pointer,"%d\t%d\r\n",i,collsions);
    }
    fclose(file_pointer);
    return 0;
}
