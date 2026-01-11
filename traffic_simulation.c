#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define FILE_NAME "queue.txt"

struct Vehicle {
    int id;
    char type[20];
    int arrival;     // seconds since midnight
    int priority;    // 1 = emergency, 0 = normal
};

/* Utility */
int vehicleExists(int id) {
    FILE *fp=fopen(FILE_NAME,"r");
    if(!fp) return 0;
    struct Vehicle v;
    while(fscanf(fp,"%d %s %d %d",&v.id,v.type,&v.arrival,&v.priority)!=EOF)
        if(v.id==id){ fclose(fp); return 1; }
    fclose(fp);
    return 0;
}

/* Insert */
void insertVehicle(struct Vehicle v){
    if(vehicleExists(v.id)){
        printf("ERROR: Vehicle ID exists\n");
        return;
    }
    if(strcmp(v.type, "Ambulance")==0 || strcmp(v.type,"Fire_Brigade")==0){
    v.priority = 2;   // Emergency
}
else if(strcmp(v.type, "VIP_Car")==0){
    v.priority = 1;   // VIP
}
else{
    v.priority = 0;   // Normal
}
    FILE *fp=fopen(FILE_NAME,"a");
    fprintf(fp,"%d %s %d %d\n",v.id,v.type,v.arrival,v.priority);

    fclose(fp);
    printf("INSERTED %d %s\n",v.id,v.type);
}

/* Remove */
void removeVehicle(){
    FILE *fp=fopen(FILE_NAME,"r");
    if(!fp){ printf("QUEUE EMPTY\n"); return; }

    struct Vehicle v[100]; int n=0;
    while(fscanf(fp,"%d %s %d %d",&v[n].id,v[n].type,&v[n].arrival,&v[n].priority)!=EOF) n++;
    fclose(fp);
    if(n==0){ printf("QUEUE EMPTY\nCOUNT 0\n"); return; }

    int removeIndex=-1;
    for(int i=0;i<n;i++) if(v[i].priority==2){ removeIndex=i; break; }

    if(removeIndex==-1){
        for(int i=0;i<n;i++)
            if(v[i].priority==1){ removeIndex=i; break; }
    }
    if(removeIndex==-1) removeIndex=0;

    time_t t=time(NULL);
    struct tm tm=*localtime(&t);
    int nowSec=tm.tm_hour*3600 + tm.tm_min*60 + tm.tm_sec;
    int waitSec=nowSec - v[removeIndex].arrival;
    if(waitSec<0) waitSec=0;

    FILE *fw=fopen(FILE_NAME,"w");
    for(int i=0;i<n;i++) if(i!=removeIndex)
        fprintf(fw,"%d %s %d %d\n",v[i].id,v[i].type,v[i].arrival,v[i].priority);
    fclose(fw);

    printf("SERVED %d %s %d\n",v[removeIndex].id,v[removeIndex].type,waitSec);
}

/* Display */
void displayQueue(){
    FILE *fp=fopen(FILE_NAME,"r");
    if(!fp){ printf("EMPTY\nCOUNT 0\n"); return; }
    struct Vehicle v; int count=0;
    printf("ID TYPE ARRIVAL PRIORITY\n");
    while(fscanf(fp,"%d %s %d %d",&v.id,v.type,&v.arrival,&v.priority)!=EOF){
        printf("%d %s %d %d\n",v.id,v.type,v.arrival,v.priority);
        count++;
    }
    fclose(fp);
    printf("COUNT %d\n",count);
}

/* Reset */
void resetQueue(){
    FILE *fp=fopen(FILE_NAME,"w");
    if(fp) fclose(fp);
    printf("QUEUE RESET SUCCESSFULLY\n");
}

/* Main */
int main(int argc,char *argv[]){
    if(argc<2) return 0;
    if(strcmp(argv[1],"add")==0){
        struct Vehicle v;
        v.id=atoi(argv[2]);
        strcpy(v.type,argv[3]);
        v.arrival=atoi(argv[4]);
        v.priority=atoi(argv[5]);
        insertVehicle(v);
    }
    else if(strcmp(argv[1],"remove")==0) removeVehicle();
    else if(strcmp(argv[1],"display")==0) displayQueue();
    else if(strcmp(argv[1],"reset")==0) resetQueue();
    return 0;
}
