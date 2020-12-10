#ifndef _VN_ENGINE_H
#define _VN_ENGINE_H

extern void initVN();
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
