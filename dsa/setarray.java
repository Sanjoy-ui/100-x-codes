package dsa;

public class setarray {
    public static void array(int arr[]){
        for (int i = 0; i < arr.length; i++) {
            for (int j = i +1 ; j < arr.length; j++) {
                System.out.println("("+ arr[i] + "," + arr[j] +")");
            }
        }
    }

    public static void subarray(int arr[]){
        for (int i = 0; i < arr.length; i++) {
            for (int j = i +1 ; j < arr.length; j++) {
                for (int j2 = i; j2 <= j ; j2++) {
                    System.out.print(arr[j2] + " ");
                }
            }
        }
    }

    public static void maxsubarraySum(int arr[]){ // brute force time complexity O(n3) bad approach
        int sum = 0;
        int maxSum = Integer.MIN_VALUE;
        for (int i = 0; i < arr.length; i++) {
            for (int j = i; j < arr.length; j++) {
                sum = 0;
                for (int j2 = i; j2 <= j ; j2++) {
                    sum += arr[j2];
                    
                }
                System.out.println(sum);
                    if (sum > maxSum) {
                        maxSum = sum;
                        
                    }
                
            }
            
        }
        System.out.println("max sum " + maxSum);
        
    }

    public static void kadanceAlgo(int arr[]){ // O(n) best case
        int currSum =0 ;
        int maxSum = Integer.MIN_VALUE;
        for (int i = 0; i < arr.length; i++) {
            currSum += arr[i];
            if (currSum < 0) {
                currSum = 0;
            }
            // if (currSum > maxSum) {
            //     maxSum = currSum;
            // }
            maxSum = Math.max(currSum,  maxSum);
            
        }
        System.out.println("max Sum is " + maxSum);
    }
    public static void main(String[] args) {
        int arr[] = {-2,-3,4,-1,-2,1,5,-3};
        kadanceAlgo(arr);

    }
}
