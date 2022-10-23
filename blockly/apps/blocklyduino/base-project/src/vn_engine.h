#ifndef _VN_ENGINE_H
#define _VN_ENGINE_H

#define WND_TARGET_TEXT (1)
#define WND_TARGET_MENU (2)
#define WND_UNIT_CHARS (1)
#define WND_UNIT_PERCENT (2)

extern void initVN();

extern void vnWindowFrom(char target, int x, int y, char unit);
extern void vnWindowSize(char target, int width, int height, char unit);
extern void vnWindowTo(char target, int x, int y, char unit);
extern void vnWindowTo(char target, int x, int y, char unit);
extern void vnWindowReset();

extern void vnScene(char *scene);
extern void vnShow(char *actor);
extern void vnChar(char *charName);
extern void vnText(char *text);
extern void vnTextF(char *format, ...);

extern void initMenu();
extern unsigned char addMenuItem(char *s);
extern char vnMenu();

typedef void * (*scriptFunction)();

#endif /* _VN_ENGINE_H */
