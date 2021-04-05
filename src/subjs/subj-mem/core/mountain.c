/* mountain.c - Generate the memory mountain. */
#include <emscripten/emscripten.h>
#include <stdio.h>
#include <stdlib.h>

#include "measure.h"

#define ELEMTYPE long long

#define MINBYTES (1 << 14) /* First working set size */
#define MAXBYTES (1 << 27) /* Last working set size */
#define MAXSTRIDE 15       /* Stride x8 bytes */
#define MAXELEMS MAXBYTES / sizeof(ELEMTYPE)

ELEMTYPE *data; /* The array we'll be traversing. */

void init_data();
int test(int elems, int stride, int repeat);
double run(int size, int stride);

int main() {
  init_data(); /* Initialize each element in data */
  return 0;
}

void init_data() {
  int i;

  printf("Initializing data with element size %d...", (int)sizeof(ELEMTYPE));
  data = (ELEMTYPE *)malloc(MAXBYTES);
  for (i = 0; i < MAXELEMS; i++) data[i] = i;
  printf("Done.\n");
}

/* test - Iterate over first "elems" elements of array "data" with
 *        stride of "stride", using 4x4 loop unrolling.
 */
int test(int elems, int stride, int repeat) {
  int r;
  ELEMTYPE i, sx2 = stride * 2, sx3 = stride * 3, sx4 = stride * 4;
  ELEMTYPE acc0 = 0, acc1 = 0, acc2 = 0, acc3 = 0;
  ELEMTYPE length = elems;
  ELEMTYPE limit = length - sx4;

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

  return (int)((acc0 + acc1) + (acc2 + acc3));
}

/* run - Run test() and return read throughput (MB/s).
 *       "size" is in bytes, "stride" is in array elements.
 */
EMSCRIPTEN_KEEPALIVE double run(int size, int stride) {
  int elems = size / sizeof(ELEMTYPE);
  double time;

  /* The measured time precision is inexplicably low after compiled as
     WebAssembly, so I have to repeat a large amount of times to get a
     satisfying precision.
   */
  int repeat = MAXBYTES / size * stride * 10;

  test(elems, stride,
       repeat); /* Warm up the cache (might be unnecessary now) */
  time = measure_time(test, elems, stride, repeat);
  return ((double)size / stride * repeat / (1 << 20)) / time;
}
