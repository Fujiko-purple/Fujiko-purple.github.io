---
category: database
---
# 数据库基础笔记

## 什么是数据库

数据库就是**有组织地存储数据的仓库**，常见的数据库有 MySQL、PostgreSQL、SQLite 等。

## SQL 基础

### 查询数据

```sql
SELECT * FROM users WHERE age > 18;
```

### 插入数据

```sql
INSERT INTO users (name, age) VALUES ('Fujiko', 22);
```

### 更新数据

```sql
UPDATE users SET age = 23 WHERE name = 'Fujiko';
```

> 数据库是后端开发的核心技能，一定要打好基础。

