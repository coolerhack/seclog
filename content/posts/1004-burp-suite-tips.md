---
id: 1004
title: Burp Suite 实战技巧：提升渗透测试效率的 10 个配置
date: 2026-10-08
tags: [渗透测试, 工具]
status: published
author: K4
cover: null
---

Burp Suite 是渗透测试的主力工具。以下是我日常工作中最常用的配置与技巧，按使用频率排序。

## 1. 设置上游代理 + 范围（Scope）

先把目标加进 Scope，再开启 `Proxy → HTTP history` 过滤，避免测试流量淹没日志。

## 2. 常用快捷键

```text
Ctrl+R      Send to Repeater
Ctrl+I      Send to Intruder
Ctrl+Shift+U  URL 编解码
```

## 3. Match and Replace 自动替换 Token

在 `Proxy → Match and Replace` 中配置自动替换请求头，免去每个包手动改 Cookie。

## 4. Intruder 攻击类型选择

| 场景 | 攻击类型 |
| --- | --- |
| 遍历 ID / 目录 | Sniper |
| 用户名 × 密码字典 | Cluster bomb |
| 单位置多载荷 | Battering ram |

> 提示：设置 `Grep - Extract` 自动提取响应中的 Token，用于遍历需要登录的接口。

## 5. 用好 Session 规则

`Project options → Sessions` 中配置宏（Macro），让 Intruder / Scanner 自动保持登录态。

## 6. Collaborator 测带外漏洞

SSRF、盲 XXE、盲 SQL 注入的 OOB 检测都依赖 Collaborator：

```text
Burp → Burp Collaborator → Copy to clipboard
# 把生成的域名插入载荷，等待 DNS/HTTP 回连
```

## 7. 扩展插件推荐

- **Autorize**：自动化越权检测
- **Turbo Intruder**：高速并发爆破
- **JSON Web Tokens**：JWT 解析与篡改
- **Hackvertor**：编码 / 标签切换

## 8. Logger++ 过滤噪音

用正则过滤静态资源，让 `Logger` 只留下有价值的响应。

## 9. 自定义快捷键发送到插件

右键菜单 → `Send to` 可以把任意请求转发到插件或外部脚本，串联自动化流程。

## 10. 导出报告

测试结束后 `Target → Site map → 右键 Report selected issues`，选择 HTML / XML 格式交付给客户。

---

工具只是放大器，**思路才是核心**。熟练之后，把更多时间花在理解业务与攻击面上。
