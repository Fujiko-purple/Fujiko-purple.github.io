---
category: linux
---
## LVM核心组卷

物理卷PV
实际硬盘分区 类似砖块

卷组VG
由多个物理卷组成的卷池 类似砖块砌成的墙

逻辑卷LV
从卷组中划分的分区 类似从墙上划分的房间

查找是否安装逻辑卷

```shell
rpm -qa | grep lvm2

yum -y install lvm2	#安装
```

```shell
lsblk	#查看磁盘情况
```

<img src="C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20251212170436455.png" alt="image-20251212170436455" style="zoom:50%;" />

在设置中 添加->下一步->默认->大小设置->点击完成 硬盘添加成功

```shell
#初始为磁盘 要创建成物理卷
pvcreate /dev/磁盘名称

pvs	#查看简略信息

pvdisplay	#查看详细信息
```

```shell
#创建卷组
vgcreate 卷组名 /dev/物理卷

vgs	#简略查看

vgdisplay	#详细查看
```

```shell
#创建逻辑卷
lvcreate -L 3G -n lv_mysql 卷组名
-L 定义容量大小
-n 赋予名称

lvs	#查看简略信息

lvdisplay	#查看详细信息

```

```shell
#格式化逻辑卷
mkfs.xfs /dev/卷组名/逻辑卷名
```

```shell
#格式化后 创建目录并挂载
mkdir 创建目录

mount /dev/卷组名/逻辑卷名 挂载的目录

df -h	#查看是否挂载成功
```

```shell
#启动自动挂载
vim /etc/fstab

/dev/vg_data/lv_mysql   /mnt/mysql_data xfs.defaults    0 0

mount -a 
#没有报错 说明挂载成功
```

------



## 动态扩展逻辑卷

```shell
#扩容卷组
vgextend 已经存在的卷组 /dev/要扩容的磁盘
pvs	#查看扩容是否成功

#扩容逻辑卷
lvextend -L +2G /dev/vg_data/lv_mysql#要扩容的逻辑卷

#进行格式化
xfs_growfs /dev/vg_data/lv_mysql

df -h	#查看逻辑卷是否扩容成功
```

------



## 缩减逻辑卷

### 1.卸载文件系统

```shell
umount /dev/挂载的文件
df -h	#查看是否卸载成功
```



### 2.强制检查文件系统

```shell
e2fsck -f /dev/卷组名/逻辑卷名
```



### 3.调整文件系统大小

```shell
resize2fs /dev/vg_data/lv_chenlei 3G
调整大小的命令：resize2fs 
卷组名/逻辑卷名
```



### 4.调整逻辑卷大小

```shell
lvreduce -L 4G /dev/vg_data/lv_chenlei 
缩减4G
```

### 5.重新挂载逻辑卷

```shell
mount 挂载的目录
df -h
```

------



## 创建逻辑卷快照卷



```shell
#删除逻辑卷
lvs
lvremove /dev/vg_data/lv_mysql /dev/vg_data/lv_chenlei
#可以同时删除多个逻辑卷

#删除卷组
vgs
vgremove 卷组名字

#删除物理卷
pvs
pyremove /dev/物理卷名字

lsblk	#查看磁盘
#通过设置来移除磁盘
```


