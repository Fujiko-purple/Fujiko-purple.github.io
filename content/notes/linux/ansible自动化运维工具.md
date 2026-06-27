---
category: linux
---
```shell
#安装epel仓库
yum install epel-release -y

#安装ansible
yum -y install ansible

#验证安装完成
ansible --version	#安装版本 位置等等信息

#ansible配置文件 ansible.cfg 在 /etc/ansible/
#添加被管控节点的IP地址
vim /hosts
#添加受控节点的信息

```

## ssh免密登录

```shell
#配置密钥对
ssh-keygen -t rsa
#会生成路径

cd #路径
ls
#公钥和私钥

#将公钥分发到所有被管理服务器
ssh-copy-id
root@IP地址
#输入目标服务器密码

#测试免密登录
ssh root@IP地址
#不输入密码直接进入即成功

#查看
ansible all -m ping
```



## ansible常用配置

```

```


