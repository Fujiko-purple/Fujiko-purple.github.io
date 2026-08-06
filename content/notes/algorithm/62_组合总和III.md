---
title: 62. 组合总和III
date: 2026-08-04
category: algorithm
---

# 组合总和 III — 学习笔记

- **日期：** 2026-08-04
- **题目：** [216. Combination Sum III](https://leetcode.cn/problems/combination-sum-iii/)
- **难度：** 中等
- **模式归类：** 回溯-组合（加和约束）
- **题解：** [B站视频](https://www.bilibili.com/video/BV1wg411873x)

---

## 题目

找出所有相加之和为 `n` 的 k 个数的组合，且满足：

- 只使用数字 1 到 9
- 每个数字**最多使用一次**

**示例**：k=3, n=9 → `[[1,2,6],[1,3,5],[2,3,4]]`

## 核心思想（一句话）

在 61 组合的模板上，多一个 **`sum` 跟着 path 走** + 一个**条件收获**：选满 k 个还要看和是否等于 n，和不对直接返回换路。

## 与 61 的对比（只改 3 处）

| 61 组合 | 62 组合总和 III |
|--------|--------|
| 候选 `1 ~ n` | 候选 **`1 ~ 9`** |
| 无 sum | 多一个 `sum`，递归传 `sum + i` |
| `size==k` 无条件收获 | `size==k` 还要判 **`sum==n`**；`sum>n` 提前剪枝 |

## 关键步骤（三件套 + 两处判断）

```
backtrack(k, n, 1, 0, path)   // 起手 sum = 0

if (sum > n) return;                      // 剪枝：和已超目标，后面只会更大
if (path.size() == k) {                   // 选满 k 个
    if (sum == n) res.add(...);           // 和对了才收获
    return;                               // 和不对也必须返回！（不能再多选）
}
for (int i = startIndex; i <= 9; i++) {
    path.add(i);
    backtrack(k, n, i + 1, sum + i, path);
    path.remove(path.size() - 1);
}
```

## 关键理解：为什么"和不对也要 return"

选满 k 个后，题目要求**恰好 k 个**——再多选一个就超过 k 了，所以必须停。返回后交给 `path.remove` 撤销，换下一个数重新组合。**"个数正好但和不对"不是失败，只是这条路走到底了，回头换一条。**

## 易错点

1. `sum` 必须作为参数传递（`sum + i`），不是全局变量累积——否则撤销时不会回退
2. `path.remove(path.size()-1)` 永远删最后一个，与 k 是几无关（`size()` 是动态的）
3. 循环上界是 `9`，不是 `n`——62 的数字范围是 1~9
4. `sum > n` 剪枝别忘了：不加它也对，但会多做无用的深层递归

## 时空复杂度

| 项目 | 复杂度 | 推导 |
|------|--------|------|
| 时间 | O(C(9,k) × k) | 从 9 个数里选 k 个，每个组合复制 O(k) |
| 空间 | O(k) | path 深度 k，递归栈深度 k |

## Java 代码

```java
class Solution {
    List<List<Integer>> res = new ArrayList<>();

    public List<List<Integer>> combinationSum3(int k, int n) {
        backtrack(k, n, 1, 0, new ArrayList<>());
        return res;
    }

    void backtrack(int k, int n, int startIndex, int sum, List<Integer> path) {
        if (sum > n) return;                 // 剪枝：和已超目标
        if (path.size() == k) {              // 选满 k 个
            if (sum == n) {
                res.add(new ArrayList<>(path));   // 和正好 → 收获
            }
            return;                          // 和不对也返回
        }
        for (int i = startIndex; i <= 9; i++) {
            path.add(i);
            backtrack(k, n, i + 1, sum + i, path);
            path.remove(path.size() - 1);
        }
    }
}
```

## 一句话应用场景

限定范围 + 限定个数 + 限定总和的所有选法——凑数购物券（必须选满 N 张、总价正好 M 元）。

---
模式归类：回溯-组合（加和约束）
