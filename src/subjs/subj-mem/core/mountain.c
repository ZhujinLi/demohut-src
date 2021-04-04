/* mountain.c - Generate the memory mountain. */
#include <stdio.h>
#include <stdlib.h>

#include "measure.h"

#define MINBYTES (1 << 14) /* First working set size */
#define MAXBYTES (1 << 27) /* Last working set size */
#define MAXSTRIDE 15       /* Stride x8 bytes */
#define MAXELEMS MAXBYTES / sizeof(long)

long *data; /* The array we'll be traversing. */

void init_data();
void free_data();
int test(int elems, int stride, int repeat);
double run(int size, int stride);

int main() {
  int size;   /* Working set size (in bytes) */
  int stride; /* Stride (in array elements) */

  init_data(); /* Initialize each element in data */
  printf("Memory mountain (MB/sec)\n");

  printf("\t");
  for (stride = 1; stride <= MAXSTRIDE; stride++) printf("s%d\t", stride);
  printf("\n");

  for (size = MAXBYTES; size >= MINBYTES; size >>= 1) {
    if (size > (1 << 20))
      printf("%dm\t", size / (1 << 20));
    else
      printf("%dk\t", size / 1024);

    for (stride = 1; stride <= MAXSTRIDE; stride++) {
      printf("%.0f\t", run(size, stride));
    }
    printf("\n");
  }

  free_data();
  return 0;
}

void init_data() {
  int i;
  data = (long *)malloc(MAXBYTES);
  for (i = 0; i < MAXELEMS; i++) data[i] = i;
}

void free_data() { free(data); }

/* test - Iterate over first "elems" elements of array "data" with
 *        stride of "stride", using 4x4 loop unrolling.
 */
int test(int elems, int stride, int repeat) {
  int r;
  long i, sx2 = stride * 2, sx3 = stride * 3, sx4 = stride * 4;
  long acc0 = 0, acc1 = 0, acc2 = 0, acc3 = 0;
  long length = elems;
  long limit = length - sx4;

  for (r = 0; r < repeat; r++) {
    /* Combine 4 elements at a time */
    for (i = 0; i < limit; i += sx4) {
      acc0 = acc0 + data[i];
      acc1 = acc1 + data[i + stride];
      acc2 = acc2 + data[i + sx2];
      acc3 = acc3 + data[i + sx3];
    }

    /* Finish any remaining elements */
    for (; i < length; i += stride) {
      acc0 = acc0 + data[i];
    }
  }

  return ((acc0 + acc1) + (acc2 + acc3));
}

/* run - Run test() and return read throughput (MB/s).
 *       "size" is in bytes, "stride" is in array elements.
 */
double run(int size, int stride) {
  int elems = size / sizeof(double);
  double time;

  /* As we are measuring time instead of CPU clocks,
   * we need to repeat the iteration for small sizes
   * to ensure the accuracy.
   */
  int repeat;
  if (size <= 128 * 1024) {
    repeat = 100;
  } else {
    repeat = 1;
  }

  test(elems, stride, repeat); /* Warm up the cache */
  time = measure_time(test, elems, stride, repeat);
  return ((double)size / stride * repeat / (1 << 20)) / time;
}
