// Test program for apLib image decoding
// SEGA 32X version
// Mic, 2010

#include "script.h"

scriptFunction nextScript;

int main() {
	initVN();
	
	nextScript = vn_start;
	
    for(;;) {
		nextScript = nextScript();
    }

	return 0;
}
