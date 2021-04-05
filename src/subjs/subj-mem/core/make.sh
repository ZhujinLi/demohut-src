#!/bin/bash

options=(
	mountain.c measure.c # Source code in C
	-o core.js
	-O3 # We need optimization to eliminate non-memory-access operation effects
    -s WASM=1 # Generates WebAssembly rather than asm.js
	-s NO_EXIT_RUNTIME=1
	-s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall']"
	-s EXPORTED_FUNCTIONS='["_main","_run"]'
	-s ALLOW_MEMORY_GROWTH=1 # To allow malloc of that big array
	-s BINARYEN_ASYNC_COMPILATION=0 -s SINGLE_FILE=1 # See https://stackoverflow.com/questions/61498612/emscripten-c-functions-not-ready-when-called-asynchronously-in-node-js
)

emcc "${options[@]}"
