---
category: linux
---
## 禁止root登录

```shell
#在root账号下
vim /etc/ssh/sshd_config

#修改PermitRootLogin
PermitRootLogin no	#取消注释

#重启
systemctl restart sshd

#此时禁止root远程登录
```

## 限制并发数

```shell
vim /etc/security/limits.conf

#在最后一行修改
# End of file
root    hard    maxlogins       3
#表示限制最大登录root数为3个

#重启
systemctl restart sshd

#查看登录的数量
w

#限制时 没有限制秘钥的并发数
#只限制密码登录并发数
```

## 超时退出设置

```shell
vim /etc/ssh/sshd_config

ClientAliveInterval 设置超时的时间

#全局会话的超时限制
vim /etc/profile
#在最底下添加
export TMOUT=3600	#没有操作的时间超过了3600秒就会退出

source /etc/profile	#重启文件
```

##  密码复杂度设置

```

```

## 密码时效性设置

```shell
vim /etc/login.defs
PASS_MAX_DAYS   99999 #密码最长有效期
PASS_MIN_DAYS   0	#最小修改天数间隔
PASS_WARN_AGE   7	#过期前多少天提醒修改密码
```

## 




