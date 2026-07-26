---
title: Java 语法速查
date: 2026-07-24
category: algorithm
---

# Java 语法速查（算法刷题用）

> 持续更新，每次遇到新语法就追加

---

## 1. 变量与数组

```java
int a = 0;                    // 变量必须先声明类型
int[] arr = new int[n];       // 一维数组（n 是长度）
int[][] matrix = new int[n][n]; // 二维数组
```

## 2. 数学方法（Math 类）

```java
Math.min(a, b)    // 返回 a 和 b 中较小的    → min(3, 5) = 3
Math.max(a, b)    // 返回 a 和 b 中较大的    → max(3, 5) = 5
Math.abs(x)       // 返回 x 的绝对值         → abs(-4) = 4
```

## 3. 特殊常量

```java
Integer.MAX_VALUE   // int 的最大值，约 21 亿
                    // 用途：初始化"找最小值"的变量
                    // 对比：int minVal = Integer.MAX_VALUE;
                    //      然后 minVal = Math.min(minVal, 新值);
```

## 4. 三元运算符

```java
// 格式：条件 ? 值1 : 值2
// 条件成立 → 值1，不成立 → 值2

int result = (a == 0) ? prefix[b] : prefix[b] - prefix[a-1];
// 等价于：
if (a == 0) { result = prefix[b]; }
else        { result = prefix[b] - prefix[a-1]; }
```

## 5. 自增运算符

```java
num++    // 先用当前值，再 +1（后缀自增）
++num    // 先 +1，再用新值（前缀自增）

// 示例：
int a = 1;
matrix[i][j] = a++;   // matrix[i][j] = 1, 然后 a 变成 2
matrix[i][j] = ++a;   // a 先变成 3, 然后 matrix[i][j] = 3
```

## 6. 输入处理（Scanner · 卡码网/ACM 模式用）

```java
import java.util.Scanner;          // 导入

Scanner sc = new Scanner(System.in);  // 创建扫描器

int n = sc.nextInt();              // 读一个整数
sc.hasNextInt()                    // 还有下一个整数吗？true/false
                                   // 用于 while 循环读直到文件结束
sc.close();                        // 用完关闭
```

## 7. 输出

```java
System.out.println(值);    // 打印并换行
System.out.print(值);      // 打印不换行
```

## 8. 链表节点（ListNode · LeetCode 已定义）

```java
// LeetCode 自动提供，不用自己写：
class ListNode {
    int val;           // 节点的值
    ListNode next;     // 指向下一个节点的绳子（null = 末尾）
}

// 常用操作：
ListNode dummy = new ListNode(0, head);  // 创建虚拟头节点（0 是占位，无意义）
curr.next = curr.next.next;              // 删除 curr 的下一个节点
curr = curr.next;                        // 指针后移
```

## 9. 循环结构

```java
// for 循环：知道次数
for (int i = 0; i < n; i++) { ... }

// while 循环：不知道次数（条件控制）
while (num <= n * n) { ... }        // 当条件成立时一直循环
while (sc.hasNextInt()) { ... }     // 当还有输入时一直循环
```

## 10. 取余（取模）

```java
a % b    // a 除以 b 的余数

// 用途：循环数组下标
dir = (dir + 1) % 4;   // dir 在 0,1,2,3 之间循环
```

---

## 11. 哈希表（HashMap / HashSet）

```java
// 导入
import java.util.HashMap;
import java.util.HashSet;

// === HashMap：存"键 → 值" ===
HashMap<String, Integer> map = new HashMap<>();
map.put("a", 1);                    // 存入键值对
int v = map.get("a");               // 取值 → 1
boolean has = map.containsKey("a"); // 有这个键吗？→ true
map.getOrDefault("a", 0);           // 取，没有则返回默认值 0

// === HashSet：只存不重复的值（无键） ===
HashSet<Integer> set = new HashSet<>();
set.add(5);                         // 放入
boolean has = set.contains(5);      // 有吗？→ true

// === 常用模式：统计字符频率 ===
HashMap<Character, Integer> freq = new HashMap<>();
for (char c : str.toCharArray()) {
    freq.put(c, freq.getOrDefault(c, 0) + 1);
}
```

## 12. 字符串遍历

```java
String s = "hello";
s.length()              // 字符串长度
s.charAt(i)             // 取第 i 个字符
s.toCharArray()         // 转成字符数组

// 遍历方式
for (int i = 0; i < s.length(); i++) {
    char c = s.charAt(i);
}
// 或者
for (char c : s.toCharArray()) { ... }
```

---

---

## 13. 数组初始化（字面量）

```java
// ✅ 正确：大括号直接赋值
return new int[]{a, b};
return new int[]{1, 2, 3};

// ❌ 错误：
return new int(a, b);          // 不能用小括号
return new int[] num = {a, b}; // 不能给返回值命名
```

## 14. Arrays 工具类

```java
import java.util.Arrays;

Arrays.sort(nums);                    // 数组升序排序，原地修改
Arrays.asList(a, b, c);               // 快速创建 List → [a, b, c]
```

## 15. 增强 for 循环（foreach）

```java
// 不需要下标时用，更简洁
for (int x : arr) { ... }             // 遍历数组
for (char c : str.toCharArray()) { ... } // 遍历字符串
for (int n : count) { if (n < 0) ... }  // 遍历检查

// 等价于：
for (int i = 0; i < arr.length; i++) {
    int x = arr[i];
    ...
}
```

## 16. ArrayList 与嵌套泛型

```java
import java.util.ArrayList;
import java.util.List;

// ArrayList 跟 HashMap 一样用，new 的时候 <> 里不用重复写类型
ArrayList<Integer> list = new ArrayList<>();
List<List<Integer>> result = new ArrayList<>();  // 嵌套：外层 List 的元素又是一个 List

list.add(值);  // 往末尾加元素
```

---

## 17. void 无返回值

```java
// 大多数方法：需要 return 东西
public int[] twoSum(int[] nums, int target) {
    return new int[]{a, b};   // 必须有 return
}

// void：原地修改，不需要返回
public void reverseString(char[] s) {
    // 直接改 s，不用 return
}
```

## 18. long 类型（防溢出）

```java
// int 范围：约 ±21 亿。四个大数相加可能超出
long sum = (long) a + b + c + d;  // 只在第一个数前加 (long) 即可

// long 范围：约 ±9×10¹⁸，远大于 int，不会溢出
```

---

## 19. 字符串常用操作

```java
// substring 截取子串
s.substring(1, s.length() - 1);   // 掐头去尾 → 从下标1到倒数第二个
s.substring(0, 3);                // 截取 [0, 3) → 下标 0,1,2

// contains 判断是否包含
s.contains("abc");                // s 是否包含 "abc" → true/false
                                  // 内部调用 strStr，跟 KMP 那道题一样

// char 数组 → String
new String(arr);                  // 整个数组
new String(arr, start, len);      // 从 start 开始取 len 个字符
```

## 20. 字符判断

```java
// 判断是否是数字
if (c >= '0' && c <= '9') { ... }   // 字符比较，不是 isDigit()

// 判断是否是空格
if (c == ' ') { ... }               // 单引号空格
```

## 21. Scanner 读字符串

```java
Scanner sc = new Scanner(System.in);
int n = sc.nextInt();     // 读整数（已会）
String s = sc.next();     // 读一个字符串（空格/换行结束）
```

## 22. 栈（Stack — 后进先出 LIFO）

```java
// Deque 当栈用（推荐，比 Stack 类快）
Deque<Character> stack = new ArrayDeque<>();

stack.push('a');       // 压入栈顶
stack.pop();           // 弹出栈顶并返回
stack.peek();          // 看一眼栈顶，不弹出
stack.isEmpty();       // 判断是否为空 → true/false
stack.size();          // 栈里有多少元素

// ⚠️ pop/peek 前务必判空，否则抛异常
```

## 23. 队列（Queue — 先进先出 FIFO）

```java
// LinkedList 实现队列
Queue<Integer> queue = new LinkedList<>();

queue.offer(1);        // 入队（加到队尾）
queue.poll();          // 出队（拿走队头），空时返回 null
queue.peek();          // 看一眼队头，不拿走，空时返回 null
queue.isEmpty();       // 是否为空

// ⚠️ 别用 add/remove —— 空了会抛异常，offer/poll 更安全
```

## 23b. Deque 两端操作（单调队列用）

```java
// Deque = 双端队列，两头都能操作
Deque<Integer> dq = new ArrayDeque<>();

// 头 ↓                  ↓ 尾
//  ┌─────────────────────┐
//  │  a    b    c    d    │
//  └─────────────────────┘

// 头操作
dq.peekFirst();      // 看队头
dq.removeFirst();    // 弹出队头
dq.addFirst(x);      // 往头加（不常用）

// 尾操作
dq.peekLast();       // 看队尾（最新入的）
dq.removeLast();     // 弹出队尾（踢掉小的）
dq.addLast(x);       // 往尾加（常规入队）

// ⚠️ 空队列操作会抛异常，先判 isEmpty()
```

## 24. StringBuilder（高效拼字符串）

```java
StringBuilder sb = new StringBuilder();

sb.append('a');        // 追加一个字符
sb.append("hello");    // 追加一个字符串
sb.reverse();          // 翻转整个内容
sb.toString();         // 转成 String 返回

// 场景：循环里频繁拼接 → 比 String + 快得多
// 场景：栈 pop 出来拼字符串，顺序是反的 → reverse() 纠正
```

## 25. 字符串比较 equals()

```java
// String 是引用类型，不能用 == 比较内容
"hello".equals("world");   // → false
"abc".equals("abc");       // → true

// 跟变量比
String s = tokens[i];
if (s.equals("+")) { ... }   // ✅
if (s == "+") { ... }        // ❌ 不靠谱（比的是地址）
```

## 26. Integer.parseInt() 字符串转整数

```java
String s = "42";
int n = Integer.parseInt(s);   // → 42

// 场景：ACM 模式读字符串转数字
// 场景：逆波兰表达式里把字符串数字转整数
```

## 27. 优先队列（PriorityQueue — 自动排序的队列）

```java
// 默认小顶堆：队头最小
PriorityQueue<Integer> pq = new PriorityQueue<>();

// 自定义排序：按频次从小到大
PriorityQueue<Integer> pq = new PriorityQueue<>(
    (a, b) -> map.get(a) - map.get(b)
);

pq.offer(5);         // 入队（自动排到合适位置）
pq.peek();           // 看队头（最小/优先级最高）
pq.poll();           // 拿走队头
pq.size();           // 当前数量
```

## 28. Lambda 表达式（简写箭头函数）

```java
// 格式：(参数) -> 返回值
// 用于告诉排序/堆"怎么比大小"

(a, b) -> map.get(a) - map.get(b)
// 含义：a 和 b 比的是 map 里的频次
// 负数 → a 更小放前面
// 正数 → b 更小放前面
// 0    → 相等

// 先用 `new Comparator{...}` 理解，lambda 只是简写
```

## 29. TreeNode 二叉树节点（LeetCode 已定义）

```java
// LeetCode 自动提供，不用自己写：
class TreeNode {
    int val;           // 节点的值
    TreeNode left;     // 左孩子（null = 没有）
    TreeNode right;    // 右孩子
}

// 递归遍历模板：
void traverse(TreeNode root) {
    if (root == null) return;    // 到底了，回头
    // ① 前序位置：处理 root.val
    traverse(root.left);
    // ② 中序位置：处理 root.val
    traverse(root.right);
    // ③ 后序位置：处理 root.val
}
```

## 30. keySet() — 取 HashMap 所有 key

```java
HashMap<Integer, Integer> map = new HashMap<>();
map.keySet()    // → 返回所有 key 的集合（无序）
map.values()    // → 返回所有 value 的集合

// 场景：遍历去重后的数字
for (int n : map.keySet()) { ... }
```

---

> 新增语法随时追加到文末
