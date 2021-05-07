#include <iostream>
using namespace std;
#include<unistd.h>

void f(short a){
    cout<< "short \n";
}

void f(long a){
    cout<<"long \n";
}

void f(char a){
    cout<<"char \n";
}

int main(){
    f('a');
    f(1000000000000000000);
    f(100);
    f(1000000000);
}