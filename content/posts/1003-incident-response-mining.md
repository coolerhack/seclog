---
id: 1003
title: 一次应急响应实录：Linux 服务器挖矿木马处置全流程
date: 2026-09-25
tags: [应急响应, 安全运维, Linux]
status: published
author: K4
cover: null
---

一次真实的应急响应：客户报警 CPU 长期 100%。本文按**检测 → 遏制 → 根除 → 恢复 → 复盘**五步走完整记录。

## Step 1 · 检测与定级

```bash
# 谁在吃 CPU？
top -c
# 挖矿进程常见特征
ps aux | grep -E "xmrig|minerd|kdevtmpfsi|/tmp/"
```

发现异常进程 `kdevtmpfsi` 从 `/tmp` 运行，且 `sshd` 存在可疑定时任务，初步判定：**入侵 + 挖矿持久化**。

## Step 2 · 遏制（先止血）

```bash
# 网络层面隔离（保留 SSH 便于排查）
iptables -A INPUT -p tcp --dport 22 -s <管理IP> -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j DROP

# 杀掉恶意进程并记录现场（取证！）
cat /proc/<pid>/cmdline > /evidence/cmdline.txt
kill -9 <pid>
```

> 经验：**先取证再杀进程**，否则内存中的线索会丢失。

## Step 3 · 根除（清理持久化）

排查项清单：

```bash
# 1. 定时任务
crontab -l; ls -la /etc/cron*
# 2. SSH 公钥后门
cat /root/.ssh/authorized_keys
# 3. 系统服务
systemctl list-units --type=service --state=running
# 4. 计划任务与 init
ls -la /etc/rc*.d/
# 5. 可疑文件
find /tmp /var/tmp /dev/shm -type f -exec ls -la {} \;
```

本次发现三处持久化：`/etc/cron.d/update`、`authorized_keys` 中被追加的公钥、以及一个伪装成系统服务的 systemd unit。全部清除。

## Step 4 · 恢复与加固

1. 修改所有凭证，吊销旧密钥
2. 打补丁（入口是一个未修复的中间件 RCE）
3. 部署 HIDS，对 `/tmp`、`authorized_keys`、crontab 做变更监控
4. SSH 禁用密码登录，仅允许密钥

```bash
# /etc/ssh/sshd_config
PasswordAuthentication no
PermitRootLogin no
AllowUsers deploy@10.0.0.0/8
```

## Step 5 · 复盘

| 环节 | 问题 | 改进 |
| --- | --- | --- |
| 入口 | 中间件未打补丁 | 建立补丁 SLA |
| 检测 | 无 CPU 告警 | 增加基线告警 |
| 响应 | 缺预案 | 编写 IR Playbook |

**结论**：应急响应的上限是平时的准备——监控、基线、备份，三者缺一不可。
