#include <stdio.h>
#include <stdlib.h>
#define DEFAULT_SIZE 5  

// 定义了链表中每个节点的结构。
typedef struct StaticLinkNode {  
    char data;
    int next;
} *NodePtr;

// 定义了整个静态链表的数据结构。
typedef struct StaticLinkList {  
    NodePtr nodes;
    int* used;
} *ListPtr;

// 初始化静态链表
ListPtr initLinkedList() {
    ListPtr tempPtr = (ListPtr)malloc(sizeof(struct StaticLinkList));
    if (tempPtr == NULL) {
        printf("Memory allocation failed for list.\n");
        exit(1);
    }

    tempPtr->nodes = (NodePtr)malloc(sizeof(struct StaticLinkNode) * DEFAULT_SIZE);
    tempPtr->used = (int*)malloc(sizeof(int) * DEFAULT_SIZE);

    if (tempPtr->nodes == NULL || tempPtr->used == NULL) {
        printf("Memory allocation failed for nodes or used array.\n");
        exit(1);
    }

    tempPtr->nodes[0].data = '\0';
    tempPtr->nodes[0].next = -1;

    tempPtr->used[0] = 1;
    for (int i = 1; i < DEFAULT_SIZE; i++) {
        tempPtr->used[i] = 0;
    }
    return tempPtr;
}

// 遍历并打印链表
void printList(ListPtr paraListPtr) {
    if (paraListPtr == NULL) {
        printf("List is NULL.\n");
        return;
    }

    int p = paraListPtr->nodes[0].next;
    printf("List contents: ");
    while (p != -1) {
        printf("%c", paraListPtr->nodes[p].data);
        p = paraListPtr->nodes[p].next;
    }
    printf("\n");
}

// 在指定位置插入元素
void insertElement(ListPtr paraListPtr, char paraChar, int paraPosition) {
    if (paraListPtr == NULL) {
        printf("List is NULL.\n");
        return;
    }

    int p = 0, q = -1;  // 初始化q为-1

    // 搜索到指定位置
    for (int i = 0; i < paraPosition; i++) {
        p = paraListPtr->nodes[p].next;
        if (p == -1) {
            printf("The position %d is beyond the scope of the list.\n", paraPosition);  // 修正：添加参数
            return;
        }
    }

    // 构造新节点
    for (int i = 1; i < DEFAULT_SIZE; i++) {
        if (paraListPtr->used[i] == 0) {
            printf("Space at %d allocated.\n", i);
            paraListPtr->used[i] = 1;
            q = i;
            break;
        }
    }

    if (q == -1) {  
        printf("No space.\n");  
        return;
    }

    paraListPtr->nodes[q].data = paraChar;

    printf("Linking node %d after node %d\n", q, p);
    paraListPtr->nodes[q].next = paraListPtr->nodes[p].next;
    paraListPtr->nodes[p].next = q;
}

// 删除指定元素
void deleteElement(ListPtr paraListPtr, char paraChar) {
    if (paraListPtr == NULL) {
        printf("List is NULL.\n");
        return;
    }

    int p = 0, q;
    while ((paraListPtr->nodes[p].next != -1) &&
        (paraListPtr->nodes[paraListPtr->nodes[p].next].data != paraChar)) {
        p = paraListPtr->nodes[p].next;
    }

    if (paraListPtr->nodes[p].next == -1) {
        printf("Cannot delete '%c'\n", paraChar);
        return;
    }

    q = paraListPtr->nodes[p].next;
    printf("Deleting node %d (data: '%c')\n", q, paraListPtr->nodes[q].data);
    paraListPtr->nodes[p].next = paraListPtr->nodes[q].next;

    // 释放节点空间
    paraListPtr->used[q] = 0;
    paraListPtr->nodes[q].data = '\0';
    paraListPtr->nodes[q].next = -1;
}

// 输出内存状态
void outputMemory(ListPtr paraListPtr) {
    if (paraListPtr == NULL) {
        printf("List is NULL.\n");
        return;
    }

    printf("\nMemory Status:\n");
    printf("List address: %p\n", (void*)paraListPtr);
    printf("Nodes address: %p\n", (void*)paraListPtr->nodes);
    printf("Used array address: %p\n", (void*)paraListPtr->used);
    printf("[Index] Data | Next | Used\n");

    for (int i = 0; i < DEFAULT_SIZE; i++) {
        printf("[%2d]    %3c | %4d | %4d\n",
            i,
            paraListPtr->nodes[i].data == '\0' ? ' ' : paraListPtr->nodes[i].data,
            paraListPtr->nodes[i].next,
            paraListPtr->used[i]);
    }
    printf("\n");
}

// 释放链表内存
void freeLinkedList(ListPtr paraListPtr) {
    if (paraListPtr == NULL) return;

    if (paraListPtr->nodes != NULL) {
        free(paraListPtr->nodes);
    }

    if (paraListPtr->used != NULL) {
        free(paraListPtr->used);
    }

    free(paraListPtr);
}

// 测试函数
void appendInsertDeleteTest() {
    printf("Initializing list...\n");
    ListPtr tempList = initLinkedList();
    printList(tempList);
    outputMemory(tempList);

    printf("\nInserting elements...\n");
    insertElement(tempList, 'H', 0);
    outputMemory(tempList);

    insertElement(tempList, 'e', 1);
    outputMemory(tempList);

    insertElement(tempList, 'l', 2);
    outputMemory(tempList);

    insertElement(tempList, 'l', 3);
    outputMemory(tempList);

    insertElement(tempList, 'o', 4);
    printList(tempList);
    outputMemory(tempList);

    printf("\nDeleting elements...\n");
    printf("Deleting 'e'.\n");
    deleteElement(tempList, 'e');
    printList(tempList);
    outputMemory(tempList);

    printf("Deleting 'a'.\n");
    deleteElement(tempList, 'a');
    printList(tempList);

    printf("Deleting 'o'.\n");
    deleteElement(tempList, 'o');
    printList(tempList);
    outputMemory(tempList);

    printf("\nInserting 'x' at position 2...\n");
    insertElement(tempList, 'x', 2);
    printList(tempList);
    outputMemory(tempList);

    // 释放内存
    freeLinkedList(tempList);
}

int main() {
    appendInsertDeleteTest();
    printf("Program completed.\n");
    return 0;
}