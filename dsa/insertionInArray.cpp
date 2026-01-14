#include <iostream>
using namespace std;

int main(){

    int array[] = {10,20,30,40,50};
    int n = 5;
    int element ;
    int position ;

    cout << "before inserting array : \n";
    for (int i = 0; i < n; i++)
    {
        cout << array[i] << "\n";
    }
    

    cout << "Enter element to insert : \n";
    cin >> element ;
    cout << "Enter desired position where you want to insert :";
    cin >> position;

    if (n >= 20)
    {
       cout << "cant insert element array is full";
       return 0; 
    }
    
    
    if (position < 1 || position > n + 1)
    {
        cout << "invalid position !";
    }

    for (int i = n ; i >= position ; i--)
    {
        array[i]= array[i-1];
    }


    array[position - 1] = element;
    n++ ;

    cout << "Array after insertion : ";
    for (int i = 0; i < n; i++)
    {
       // cout << array[i] << "\n";
    }
    
    
    

    return 0;
}
