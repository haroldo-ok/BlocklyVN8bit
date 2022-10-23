#include <stdarg.h>

#include "unity.h"
#include "vn_engine.h"

#define MENU_ENTRY_COUNT 8

typedef struct _menuEntry {
	unsigned char *s;
	unsigned char idx;
} menuEntry;

menuEntry menuEntries[MENU_ENTRY_COUNT];
unsigned char usedMenuEntries;
unsigned char menuCursor;
struct {
	unsigned char x, y;
	unsigned char width, height;
} menuConfig;

struct {
	unsigned char x, y;
	unsigned char width, height;
	unsigned char** lines;
} msgLines;

char characterName[32];

char *backgroundImage;
char *actorImage;

void initMenu() {
	usedMenuEntries = 0;
	menuCursor = 1;	
}

unsigned char addMenuItem(char *s) {
	menuEntry *m = menuEntries + usedMenuEntries;
	usedMenuEntries++;

	m->s = s;
	m->idx = usedMenuEntries;
	
	return m->idx;
}

unsigned char menuTop() {
	return menuConfig.y - (usedMenuEntries >> 1);
}

void drawMenuLine(int number) {
	int y = menuTop() + number - 1;
	#ifdef __LYNX__
		PrintStr(menuConfig.x, y, number == menuCursor ? "*" : " ");
	#else
		PrintNum(menuConfig.x, y, number);
	#endif
	PrintStr(menuConfig.x + 2, y, menuEntries[number - 1].s);
}

unsigned char drawMenu() {
	menuEntry *m = menuEntries;
	int i, y;
	char selected;
	
	y = menuTop();
	Panel(menuConfig.x, y - 1, menuConfig.width, usedMenuEntries + 1, "");
	
	for (i = 1; i <= usedMenuEntries; i++) {
		drawMenuLine(i);
	}
}

unsigned int menuItemCount() {
	return usedMenuEntries;
}

char *bufferWrappedTextLine(char *s, char x, char y, char w) {
	char *o, ch;
	char tx = x;
	
	char *startOfLine, *endOfLine;
	char currW, bestW, charW, spaceW;
	
	startOfLine = s;
	
	currW = 0;
	bestW = 0;

	// Skips initial spaces for current line
	for (o = startOfLine; *o == ' '; o++) {
		msgLines.lines[y][tx] = ' ';
		tx++;
		currW++;
		bestW = currW;
	}
	startOfLine = o;
	
	if (!*o || currW >= w) {
		msgLines.lines[y][tx] = 0;
		return 0;
	}

	// Scans words that fit the maximum width
	endOfLine = startOfLine;
	for (o = startOfLine; *o && *o != '\n' && currW <= w; o++) {
		ch = *o;
		if (ch == ' ') {
			currW++;
			if (currW <= w) {
				endOfLine = o;
				bestW = currW;
			}
		} else {
			currW++;
		}
	}
	
	// Corner cases: last word in string, and exceedingly long words
	if (currW <= w || !bestW) {
		endOfLine = o;
		bestW = currW;		
	}

	// Renders the line of text
	for (o = startOfLine; o <= endOfLine; o++) {
		ch = *o;
		if (ch && ch != '\n') {
			msgLines.lines[y][tx] = ch;
			tx++;
		}
	}
	
	// Skips spaces at end of line.
	while (*endOfLine == ' ') {
		endOfLine++;
	}

	// Skips one line break, if necessary.
	if (*endOfLine == '\n') {
		endOfLine++;
	}

	msgLines.lines[y][tx] = 0;
	return *endOfLine ? endOfLine : 0;
}

char *bufferWrappedText(char *s, char x, char y, char w, char h) {
	char *o = s;
	char ty = y;
	char maxY = y + h;
	
	while (o && *o && ty < maxY) {
		o = bufferWrappedTextLine(o, x, ty, w);
		ty++;
	}
	
	return o;
}

void bufferResize(char width, char height) {
	unsigned char i;
	
	// Deallocate existing buffers
	if (msgLines.lines) {
		for (i = 0; i != msgLines.height; i++) {
			free(msgLines.lines[i]);
		}
		free(msgLines.lines);
		msgLines.lines = 0;
	}

	// Reallocate according to the new size
	
	msgLines.width = width;
	msgLines.height = height;
	msgLines.lines = calloc(msgLines.height, sizeof(char *));
	
	for (i = 0; i != msgLines.height; i++) {
		msgLines.lines[i] = malloc(msgLines.width + 1);
		msgLines.lines[i][0] = 0;
	}	
}

void bufferClear() {
	unsigned char i;
	
	for (i = 0; i != msgLines.height; i++) {
		msgLines.lines[i][0] = 0;
	}
}

void waitJoyButtonRelease() {
	// Wait until the joystick button is released
	while (!(GetJoy(0) & JOY_BTN1));
}

void waitNextButtonRelease() {
	#ifdef __LYNX__
		waitJoyButtonRelease();
	#else
		while (kbhit()) cgetc();
	#endif
}

void drawScene() {
	unsigned char* chunk = 0;
	
    LoadBitmap(backgroundImage);
	
	LoadChunk(&chunk, actorImage);
	if (chunk) {
		SetChunk(chunk, 12, 8);
		free(chunk);
	}
}

void initGfx() {
	unsigned char i;
    int mn_option_1, mn_choice_2, mn_choice_3;
	
	// Reset screen
	clrscr();
	bordercolor(COLOR_BLACK);
    bgcolor(COLOR_BLACK);

	// Initialize modules
	InitBitmap();
	
	EnterBitmapMode();
}

int convertCoordinate(int coord, int max, char unit) {
	// Percent to chars
	if (unit == WND_UNIT_PERCENT) coord = coord * max / 100;
	
	// Negative coordinates
	if (coord < 0) coord = max + coord;
	
	return coord;
}

void initVN() {
	initGfx();
	InitJoy();
	initMenu();
	
	backgroundImage = 0;
	actorImage = 0;
	
	msgLines.lines = 0;
	vnWindowReset();
	
	strcpy(characterName, "");
}

void vnScene(char *scene) {
	backgroundImage = scene;
    drawScene();
}

void vnShow(char *actor) {
	actorImage = actor;
    drawScene();
}

void vnChar(char *charName) {
	strcpy(characterName, charName);
}

void vnWindowFrom(char target, int x, int y, char unit) {
	x = convertCoordinate(x, CHR_COLS, unit);
	y = convertCoordinate(y, CHR_ROWS, unit);
		
	if (target == WND_TARGET_MENU) {
		menuConfig.x = x;
		menuConfig.y = y;
	} else {
		msgLines.x = x;
		msgLines.y = y;
	}
}

void vnWindowSize(char target, int width, int height, char unit) {
	if (width < 0) {
		if (target == WND_TARGET_MENU) {
			menuConfig.x -= convertCoordinate(width, CHR_COLS, unit);
		} else {
			msgLines.x -= convertCoordinate(width, CHR_COLS, unit);
		}
		width = -width;
	}
	
	if (height < 0) {
		if (target == WND_TARGET_MENU) {
			menuConfig.y -= convertCoordinate(height, CHR_ROWS, unit);
		} else {
			msgLines.y -= convertCoordinate(height, CHR_ROWS, unit);
		}
		height = -height;
	}
	
	width = convertCoordinate(width, CHR_COLS, unit);
	height = convertCoordinate(height, CHR_ROWS, unit);
		
	if (target == WND_TARGET_MENU) {
		menuConfig.width = width;
		menuConfig.height = height;
	} else {
		bufferResize(width, height);
	}
}

void vnWindowTo(char target, int x, int y, char unit) {
	int width, height;
	
	x = convertCoordinate(x, CHR_COLS, unit);
	y = convertCoordinate(y, CHR_ROWS, unit);		

	if (target == WND_TARGET_MENU) {
		width = x - menuConfig.x + 1;
		height = y - menuConfig.y + 1;
	} else {
		width = x - msgLines.x + 1;
		height = y - msgLines.y + 1;
	}
	
	vnWindowSize(target, width, height, WND_UNIT_CHARS);
}

void vnWindowReset() {
	// Text window
	vnWindowFrom(WND_TARGET_TEXT, 1, -8, WND_UNIT_CHARS);
	vnWindowSize(WND_TARGET_TEXT, CHR_COLS - 2, 4, WND_UNIT_CHARS);
	
	// Menu window
	vnWindowFrom(WND_TARGET_MENU, 1, (CHR_ROWS - 2) >> 1, WND_UNIT_CHARS);
	vnWindowSize(WND_TARGET_MENU, CHR_COLS - 2, MENU_ENTRY_COUNT, WND_UNIT_CHARS);
}

void vnText(char *text) {
	char *textToDisplay;
	
	for (textToDisplay = text; textToDisplay;) {
		waitNextButtonRelease();
		
		bufferClear();
		textToDisplay = bufferWrappedText(textToDisplay, 0, 0, msgLines.width, msgLines.height);			
		
		ListBox(msgLines.x, msgLines.y, msgLines.width, msgLines.height + 2, characterName, msgLines.lines, msgLines.height);	

		#ifdef __LYNX__
			// Wait until the joystick button is pressed
			while (GetJoy(0) & JOY_BTN1);
			waitJoyButtonRelease();
		#else
			cgetc();
			waitNextButtonRelease();
		#endif
	}
}

void vnTextF(char *format, ...) {
	va_list aptr;
	
	char buffer[256];
	char *o = format;
	char *d = buffer;
	char ch;
	int number;
	char number_buffer[12];
	char *oi;
	
	va_start(aptr, format);
	
	while ((ch = *(o++))) {		
		if (ch != '%') {
			*(d++) = ch;
		} else {
			char ch2 = *(o++);
			
			switch (ch2) {
				case '%':
					*(d++) = '%';
					break;
					
				case 'd': {
					number = va_arg(aptr, int);
					
					itoa(number, number_buffer, 10);
					
					oi = number_buffer;
					for (; *oi; oi++, d++) {
						*d = *oi;
					}
					
					break;
				}
					
			}
		}
	}
	*d = 0;
	
	va_end(aptr);
	
	vnText(buffer);
}

char vnMenu() {
	char ch;
	int option;
	#ifdef __LYNX__	
		unsigned char joy, lastJoy = 0;
		unsigned char originalInk = inkColor;
		char oldCursor = 1;
		
		menuCursor = 1;
	#endif
	
	drawMenu();
	
	option = 0;
	while (!option) {		
		#ifdef __LYNX__
			// Joystick operated menu
			joy = GetJoy(0);
			if (joy != lastJoy) {							
				if (!(joy & JOY_BTN1)) {
					option = menuCursor;
					waitJoyButtonRelease();
				} else if (!(joy & JOY_UP)) {
					menuCursor--;
					if (menuCursor < 1) menuCursor = menuItemCount();
				} else if (!(joy & JOY_DOWN)) {
					menuCursor++;
					if (menuCursor > menuItemCount()) menuCursor = 1;
				}
				
				drawMenuLine(oldCursor);
				inkColor = YELLOW;
				drawMenuLine(menuCursor);
				inkColor = originalInk;
				
				oldCursor = menuCursor;				
				lastJoy = joy;
			}
		#else
			// Number key menu: checks if the user pressed a numeric key within the acceptable range
			ch = cgetc();
			option = ch - '0';
			if (option < 0 || option > menuItemCount()) {
				option = 0;
			}
		#endif
	}
	
	drawScene();
	
	return option;
}
