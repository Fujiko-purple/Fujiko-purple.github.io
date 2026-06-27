---
category: linux
---
## 压缩

```shell
tar -zcvf xxx.tar.gz 目录名
c: create (创建) -> 关键
```



## 解压

```shell
tar -zxvf xxx.tar.gz
z: gzip属性
x: extract (解压) -> 关键
v: verbose (显示过程)
f: file (文件名)
```

### 指定目录解压

```shell
tar -xvf 解压文件 -C 指定解压到的目录
```




