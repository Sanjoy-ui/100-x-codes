package java_dsa;
// import java.util.*;


public class swapArray {
    public static void reverse(int numbers[]){
        int first = numbers[0];
        int last = numbers.length - 1;
        while (first < last) {
            int temp = numbers[first] ;
            numbers[first] = numbers[last] ;
            numbers[last] = temp ;
            first++;
            last--;
        }
    }
    public static void main(String[] args) {
        int numbers[] = {2,4,6,8,10};
        reverse(numbers);
        for (int i = 0; i < numbers.length; i++) {
            System.out.println(numbers[i]);
        }
    }
}
