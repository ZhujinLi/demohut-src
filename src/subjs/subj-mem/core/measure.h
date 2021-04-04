
/* Function to be tested takes three integer arguments */
typedef int (*test_funct)(int, int, int);

/* Find elapsed time of a function */
double measure_time(test_funct f, int param1, int param2, int param3);
