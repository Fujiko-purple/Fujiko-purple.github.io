---
category: linux
---
## nginx作用

```
让网站更快 更稳 更省资源
具有高并发处理能力
支持反向代理 负载均衡 配置灵活
```

## 场景

```
静态资源服务
反向代理
负载均衡 nginx实现 平均分担压力
动静分离
```

------



## 启动与配置

### 安装

```shell
yum install -y epel-release
yum install -y nginx
```

### 启动

```shell
systemctl start nginx.service	#启动
systemctl enable nginx.service	#开机自启
curl 127.0.0.1	#访问ip
```



## 配置文件解析

```shell
#配置文件地址
/etc/nginx/nginx.conf

user nginx;	#使用的人用户名叫nginx
worker_processes auto;	#工人进程 auto是自动匹配cpu的核心数  auto为默认

events {
    worker_connections 1024;
}
#每个工人最多同时处理的连接数 

include             /etc/nginx/mime.types;

listen       80;	#监听ipv4端口
listen       [::]:80;	#监听ipv6的端口
server_name  _;	#默认接收任何主机名
root         /usr/share/nginx/html;	#设置网页文件的根目录
```

## nginx结构图

```

```



------

## nginx安装与基础
