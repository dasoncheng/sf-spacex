# Gateway

## 镜像

```bash
docker build --platform=linux/arm64,linux/amd64 --pull --rm -f "Dockerfile" -t registry.cn-hangzhou.aliyuncs.com/weidge/sf-gateway:0.0.1 "." --push
```
