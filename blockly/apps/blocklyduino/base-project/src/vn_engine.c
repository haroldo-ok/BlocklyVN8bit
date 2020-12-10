#include <stdio.h>
#include <stdarg.h>

#include "unity.h"
#include "vn_engine.h"

#define MSG_COL_COUNT (CHR_COLS - 2)
#define MSG_LINE_COUNT 4
#define MENU_ENTRY_COUNT 8

typedef struct _menuEntry {
	unsigned char *s;
	unsigned char idx;
} menuEntry;

menuEntry menuEntries[MENU_ENTRY_COUNT];
unsigned char usedMenuEntries;
unsigned char menuCursor;

unsigned char* msgLines[MSG_LINE_COUNT];
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
	return (CHR_ROWS - usedMenuEntries - 2) >> 1;
}

void drawMenuLine(int number) {
	int y = menuTop() + number - 1;
	#ifdef __LYNX__
		PrintStr(1, y, number == menuCursor ? "*" : " ");
	#else
		PrintNum(1, y, number);
	#endif
	PrintStr(3, y, menuEntries[number - 1].s);
}

unsigned char drawMenu() {
	menuEntry *m = menuEntries;
	int i, y;
	char selected;
	
	y = menuTop();
	Panel(1, y - 1, CHR_COLS - 2, usedMenuEntries + 1, "");
	
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
		msgLines[y][tx] = ' ';
		tx++;
		currW++;
		bestW = currW;
	}
	startOfLine = o;
	
	if (!*o || currW >= w) {
		msgLines[y][tx] = 0;
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
			msgLines[y][tx] = ch;
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

	msgLines[y][tx] = 0;
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

void bufferClear() {
	unsigned char i;
	
	for (i = 0; i != MSG_LINE_COUNT; i++) {
		msgLines[i][0] = 0;
	}
}

void waitJoyButtonRelease() {
	// Wait until the joystick button is released
	while (!(GetJoy(0) & JOY_BTN1));
}

void drawScene() {
    LoadBitmap(backgroundImage);
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
	
	for (i = 0; i != MSG_LINE_COUNT; i++) {
		msgLines[i] = malloc(MSG_COL_COUNT);
	}
	bufferClear();	
}

void initVN() {
	initGfx();
	InitJoy();
	initMenu();
	
	backgroundImage = 0;
	actorImage = 0;
	strcpy(characterName, "");
}

void vnScene(char *scene) {
	backgroundImage = scene;
    drawScene();
}

void vnShow(char *actor) {
	actorImage = actor;
}

void vnChar(char *charName) {
	strcpy(characterName, charName);
}

void vnText(char *text) {
	char *textToDisplay;
	
	for (textToDisplay = text; textToDisplay;) {
		bufferClear();
		textToDisplay = bufferWrappedText(textToDisplay, 0, 0, MSG_COL_COUNT, MSG_LINE_COUNT);			
		
		ListBox(1, CHR_ROWS - MSG_LINE_COUNT - 4, MSG_COL_COUNT, MSG_LINE_COUNT + 2, "Character name", msgLines, MSG_LINE_COUNT);	

		#ifdef __LYNX__
			// Wait until the joystick button is pressed
			while (GetJoy(0) & JOY_BTN1);
			waitJoyButtonRelease();
		#else
			cgetc();
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
