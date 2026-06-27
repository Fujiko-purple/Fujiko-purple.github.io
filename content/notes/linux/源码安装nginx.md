---
category: linux
---
## 源码安装

```shell
wget http://nginx.org/download/nginx-1.25.3.tar.gz	#源码包下载

#安装依赖
yum -y install gcc pcre-devel zlib-developenssl-devel

#进行解压
tar -zxvf nginx-1.25.3.tar.gz

#进入目录	
cd nginx目录

#指定安装目录
例如：
mkdir /opt/nginx

./configure --prefix=/opt/nginx/	#指定安装目录
								 #检查系统环境 ./configure 检查依赖并生成编译规则

make	#进行源码编译
make install 	#源码安装
ls /opt/nginx	#查看文件是否安装

/opt/nginx/sbin/nginx	#启动nginx服务
ps -ef | grep nginx	#查看是否有nginx进程

curl 127.0.0.1	#查看nginx网页 检查返回welcome

ip a s
192.168.100.130	#访问IP
```

![image-20251213235457950](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20251213235457950.png)

```shell
/opt/nginx/sbin/nginx -t	#查看nginx配置文件是否成功 文件是否正常

#创建软链接可以直接使用nginx -t查看
ln /opt/nginx/sbin/nginx /usr/local/sbin/nginx
nginx -t	#此时可直接查看

rm /usr/local/sbin/nginx	#删除软链接

#添加全局变量
cd
vim .bashrc
export PATH=$PATH:/opt/nginx/sbin	#在最后一行添加
source .bashrc
nginx -t	#此时也可以直接使用
```


