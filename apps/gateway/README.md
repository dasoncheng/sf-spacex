# Gateway

## 镜像

```bash
docker build --platform=linux/arm64,linux/amd64 --pull --rm -f "Dockerfile" -t ccr.ccs.tencentyun.com/sfnet/gateway:0.0.1 "." --push
```
