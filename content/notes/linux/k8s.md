---
category: linux
---
## k8s作用

解决容器管理痛点
提升部署效率
支持多副本部署

### **核心作用**

容器调度总管
自动化配置管理
支持服务编排

自动部署
负载均衡
自动修复

### 核心组件

**pod**：容器实际工作的地方 一个pod包含多个容器

**Node：**真实服务器 pod运行的物理或虚拟机

**Deployment**：定义应用的期望状态

**Service**：提供访问Pod的统一入口 实现负载均衡

**kube-apiserver**：所有指令通过kube-apiserver进入 是集群控制平面

**etcd**：集群当前状态数据库 存储所有集群数据

**kube-scheduler**：决定Pod放在哪台机器上运行

**kubelet：**负责监听Pod的运行状态 启动容器 上报情况

**Namespace：**提供项目隔离 确保不同的项目之间互不干扰

------

## 本地部署k8s

### 准备工具

docker
kubectl
kind

### 安装docker

```shell
yum install docker -y

#启动docker服务
systemctl start docker

#设置开机自启动 
systemctl enable docker

#注意 podman不需要手动启动和设置开机自启动 可以替换docker
```

### 安装kubectl

```shell
#需要VPN
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

#设置kubectl权限
chmod +x kubectl 

#移动kubectl到系统路径
mv kubectl /usr/local/bin

#检查kubectl版本 	
kubectl version --client

```

### 安装kind

```shell
#需要VPN
curl -Lo ./kind https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64

#设置kind权限
chmod +x ./kind

#移动kind到系统路径
mv ./kind /usr/local/bin/kind

#检查kind版本
kind version
```

### 启动k8s集群

```shell
#使用kind创建集群
kind create cluster
#几分钟后本地会有单节点的k8s集群

#检查集群状态
kubectl get nodes
#返回节点名称 状态 角色 年龄和版本信息
如：
NAME                 STATUS   ROLES           AGE   VERSION
kind-control-plane   Ready    control-plane   71s   v1.34.0

#检查集群组件
kubectl get pods -A
#查看各个组件是否正常运行

```

### 创建Deployment

使用kubectl创建Deployment

```shell
#拉取某个镜像 如nginx
podman pull nginx：1.24

#将镜像上传到kind节点
kind load docker-image nginx:1.24

#写一个yaml文件
vim yaml文件名

#启动yaml文件
kubectl apply -f yaml文件名

curl 127.0.0.1:端口号	#通过本地地址访问部署的应用
#注意编写的yaml文件是否暴露端口号
ss -nulpt | grep 暴露的端口号

```

### 查看Pod启动状态

```shell
#检查Pod启动情况
kubectl get pods

#获取Pod列表
kubectl get svc
#查看服务端口号

#删除集群
kubectl delete cluster

#使用kind创建集群时指定yaml文件
kind create cluster --name kind --config yaml文件名
```

### 清理环境

```shell
kubectl delete deployment
#删除deployment

kubectl delete service 
#删除service

kind delete cluster
#删除集群

#查看集群状态 删除集群后都是error
kubectl get nodes
```


