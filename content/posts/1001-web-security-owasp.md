---
id: 1001
title: Web 安全入门：从 OWASP Top 10 看常见漏洞原理
date: 2026-08-12
tags: [Web安全, 渗透测试, OWASP]
status: published
author: K4
cover: null
---

安全的核心是理解系统**为什么会被攻破**。OWASP Top 10 是一份很好的入门地图，本文挑其中最常见、面试也最常问的几类漏洞，讲清楚原理与防御。

## 1. 注入类漏洞（Injection）

当不可信数据作为命令或查询的一部分被发送给解释器时，就会发生注入。最典型的是 SQL 注入：

```sql
-- 永远不要这样拼接 SQL
SELECT * FROM users WHERE name = '" + userName + "';
-- 攻击者输入：' OR '1'='1
SELECT * FROM users WHERE name = '' OR '1'='1';
```

**防御**：使用参数化查询（预编译语句），并对输入做白名单校验。以 Node.js 为例：

```js
// 安全：参数化查询
const { data } = await db
  .from('users')
  .select('*')
  .eq('name', userName)
```

## 2. 失效的访问控制（Broken Access Control）

水平越权与垂直越权都属此类。常见场景：只在前端隐藏了按钮，后端却没有校验权限。

```http
# 攻击者直接请求他人资源
GET /api/orders/10086 HTTP/1.1
```

**防御**：权限校验必须放在服务端；数据行级安全（RLS）是最后一道防线。

## 3. 安全配置错误（Security Misconfiguration）

默认账号未修改、目录列表暴露、调试接口未关闭、详细的错误堆栈返回给前端……

**防御**：建立基线配置清单，最小化安装，关闭一切非必要端口与接口。

## 4. 跨站脚本 XSS

反射型、存储型、DOM 型三类。本质都是**把用户输入当成了代码执行**。

```html
<!-- 危险：直接渲染用户输入 -->
<div id="msg"></div>
<script>
  // 从 URL 取参数直接写入页面
  document.getElementById('msg').innerHTML = location.hash.slice(1)
</script>
```

**防御**：输出编码 + CSP，前端框架默认转义，慎用 `innerHTML` / `v-html` / `dangerouslySetInnerHTML`。

## 5. 组件与依赖漏洞（Vulnerable Components）

Log4Shell（CVE-2021-44228）提醒我们：依赖即攻击面。

```bash
# 定期审计依赖漏洞
npm audit
# 或使用 SCA 工具持续监控
```

## 小结

| 漏洞 | 根因 | 第一道防线 |
| --- | --- | --- |
| SQL 注入 | 数据与代码混淆 | 参数化查询 |
| 越权 | 服务端未鉴权 | RLS / 后端校验 |
| XSS | 输入被执行为代码 | 输出编码 + CSP |

记住一句话：**永远不要信任客户端输入**。
