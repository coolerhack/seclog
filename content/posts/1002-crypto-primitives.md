---
id: 1002
title: 密码学笔记：对称加密、非对称加密与哈希的工程实践
date: 2026-09-03
tags: [密码学, 笔记]
status: published
author: K4
cover: null
---

加密不是银弹，但**用错加密等于没加密**。这篇笔记梳理三类基础原语，以及工程上最常见的误用。

## 对称加密：一把钥匙

AES-256-GCM 是当前的首选：快、且自带完整性校验（AEAD）。

```python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

key = AESGCM.generate_key(bit_length=256)
nonce = os.urandom(12)  # 96-bit nonce，绝不可重用！
aes = AESGCM(key)
ciphertext = aes.encrypt(nonce, b"top secret", None)
plaintext = aes.decrypt(nonce, ciphertext, None)
```

> ⚠️ nonce 重用会直接摧毁 GCM 模式的安全性。每次加密都要重新生成。

## 非对称加密：公钥与私钥

RSA / ECC 解决密钥分发问题，也用于数字签名。TLS 1.3 中密钥交换使用 ECDHE：

```text
Client                                           Server
  | ----- ClientHello (支持的曲线、随机数) --------> |
  | <---- ServerHello (选定曲线、证书、随机数) ---- |
  | ----- 用服务端公钥完成密钥交换 ---------------> |
  | <======== 双方独立计算出相同会话密钥 ========> |
```

## 哈希：完整性 ≠ 加密

MD5 和 SHA-1 已被实战攻破，**不要再用它们做安全用途**。口令存储请使用慢哈希：

```text
推荐：argon2id > scrypt > bcrypt > PBKDF2
不推荐：MD5 / SHA-1 / SHA-256(裸奔) / SHA-256(加盐单轮)
```

## 常见误用清单

1. **ECB 模式**：相同明文块产生相同密文块，会泄露结构（著名企鹅图）。改用 GCM / CBC+HMAC。
2. **自研加密算法**：不要。经过同行评审的标准算法才是安全的。
3. **硬编码密钥**：密钥进代码仓库 = 密钥公开。使用 KMS / 环境变量 / 密钥管理服务。
4. **校验和当作签名**：CRC32 不是完整性证明，MD5 也不是。

## 一图流总结

```text
机密性 → 对称加密 (AES-GCM)
密钥分发 / 签名 → 非对称加密 (RSA / ECC)
完整性 / 口令存储 → 慢哈希 (argon2id)
随机性 → CSPRNG，永远不要用 Math.random()
```

工程上的黄金法则：**优先使用经过验证的高级 API，而不是自己组装原语**。
