#include <iostream>
#include <stdio.h>
#include <cmath>
#include <random>
#include <time.h>
#include <pthread.h>
using namespace std;

int collsions=0;

int get_random_number(int module){
    random_device seed;
    mt19937_64 mt_rand(seed());
    return mt_rand()%module;
}

void* actions(void*){

}

void create_devices(int device_mounts){
    pthread_t* new_divice;
    new_divice = (pthread_t*)malloc(sizeof(pthread_t)*device_mounts);
    for(int i=0;i<device_mounts;i++)
        pthread_create(&(new_divice[i]), NULL, actions,NULL);
    for(int i=0;i<device_mounts;i++)
        pthread_join((new_divice[i]),NULL);
}

int main(){
    FILE* file_pointer = fopen();
    for(int i=1;i<=20;i++){
        collsions = 0;
        create_devices(i);
        cout<<"collisions : "<<collsions<<endl;
    }
    return 0;
}
