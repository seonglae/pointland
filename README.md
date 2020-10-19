# Build Setup

```bash
# 1. install dependencies
$ npm i

# 2. serve with hot reload at localhost:3333
$ yarn dev
```

# Production

```bash
$ sudo yarn production
```

# Target
## Linux
```
conda create -n gis python=3.6 -y
conda activate gis
pip install pylas
sudo mount -t cifs "\\\\10.2.0.108\\mms_test2\\mms_test2" /mnt/10.2.0.108/mms_test2 -o user='stryx',pass='emfRoskfk!23',vers=2.0 
```

## Windows
```cmd
mklink /d "c:\mnt\10.2.0.108\mms_test2" "\\10.1.0.112\mms_test2"
```
