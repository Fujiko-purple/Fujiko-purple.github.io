---
category: linux
---
## docker简介与作用

打包程序和环境 确保在任何地方都能运行
提高隔离性与效率
启动快 资源占用少

### 工作原理

将程序和依赖环境打包成镜像
镜像启动后为容器——容器运行镜像实例
docker引擎负责容器的创建和管理
仓库负责存储和分发

### 镜像

静态的 只读的打包模板 装好了程序 依赖 环境 配置

### 容器

镜像的运行实例 相当于把程序放在容器中运行 实现环境隔离

### 仓库

集中存放和分发镜像的地方 分为私有和公用

### docker引擎作用

docker引擎负责打包 运送和运行容器 

### docker运行场景

一键启动测试环境
搭建本地网站环境
项目部署与测试

------



## docker安装与容器实战

### 安装依赖工具

```shell
yum install -y yum-utils
#工具包 能够帮助配置软件源
```

### 添加docker官方仓库

```shell
#添加官方仓库
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

#安装docker命令
 yum install -y docker-ce docker-ce-cli containerd.io

#查看docker版本
docker --version

#启动命令 设置docker开机自启
systemctl start docker
systemctl enable docker


#查看docker状态说明
docker info

#拉取想要的包
docker pull nginx:1.24
#拉取镜像文件到服务器 需要VPN


```

### 运行容器

```shell
#使用镜像创建容器并运行
docker run hello-world

#查看镜像
docker images

#查看运行的容器
docker ps -a
```

### 运行nginx

```shell
docker run -d -p 8080:80 nginx:1.24：运行nginx的版本
-d：后台运行
-p 8080:80：表示将本机的8080端口映射到容器的80端口 端口打通 访问本服务器8080端口时相当于访问容器80端口
nginx:1.24：运行nginx的版本

curl 127.0.0.1:8080
#访问是否部署成功
```


