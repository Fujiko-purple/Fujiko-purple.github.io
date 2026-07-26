---
title: 27. 实现strStr()
date: 2026-07-20
category: algorithm
---

# 实现 strStr() — 学习笔记

- **日期：** 2026-07-20
- **题目：** [28. Find the Index of the First Occurrence in a String](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/)
- **难度：** 简单（暴力）/ 困难（KMP）
- **模式归类：** 字符串匹配（暴力滑动窗口 / KMP）
- **题解：** [B站视频](https://www.bilibili.com/video/BV1PD4y1o7nd/)

---

## 核心思想

在 haystack 中找 needle 第一次出现的位置。

---

## 解法一：暴力匹配（简单，面试够用）

```java
public int strStr(String h, String n) {
    int lenH = h.length(), lenN = n.length();
    for (int i = 0; i <= lenH - lenN; i++) {
        int j = 0;
        while (j < lenN && h.charAt(i + j) == n.charAt(j)) {
            j++;
        }
        if (j == lenN) return i;
    }
    return -1;
}
```

时间 O(m×n)，空间 O(1)。

---

## 解法二：KMP（高效，难理解）

**核心：匹配失败时不从头开始，利用 needle 自身的重复信息跳过。**

分两步：
1. 构建 next 表（needle 跟自己匹配）
2. 用 next 表做匹配（失配时查表跳转）

```java
public int strStr(String haystack, String needle) {
    int n = haystack.length(), m = needle.length();
    if (m == 0) return 0;

    // ① 构建 next 表
    int[] next = new int[m];
    int j = 0;
    for (int i = 1; i < m; i++) {
        while (j > 0 && needle.charAt(i) != needle.charAt(j)) {
            j = next[j - 1];          // 回退
        }
        if (needle.charAt(i) == needle.charAt(j)) {
            j++;
        }
        next[i] = j;
    }

    // ② 用 next 表做匹配
    j = 0;
    for (int i = 0; i < n; i++) {
        while (j > 0 && haystack.charAt(i) != needle.charAt(j)) {
            j = next[j - 1];           // 失配 → 跳
        }
        if (haystack.charAt(i) == needle.charAt(j)) {
            j++;
        }
        if (j == m) return i - m + 1;
    }
    return -1;
}
```

时间 O(m+n)，空间 O(m)。

---

## KMP 图解

```
needle = "aabaaf"
next   = [0,1,0,1,2,0]

每个 next[i] 表示：needle[0..i] 的前后缀最长相同长度
  "aa"  → 前后都是 a → 1
  "aab" → 没有相同 → 0
  "aaba" → 前后都是 a → 1
  "aabaa" → 前后都是 aa → 2
```

匹配时失配 → `j = next[j-1]`，把 j 跳到能接上的位置。

---

## 暴力 vs KMP 对比

| | 暴力 | KMP |
|------|:--:|:--:|
| 失配后 | j 归零，i 只移 1 | j 跳 next[j-1]，i 不动 |
| 时间 | O(m×n) | O(m+n) |
| 面试 | 可以写 | 加分项 |
| 理解难度 | ⭐ | ⭐⭐⭐⭐⭐ |
