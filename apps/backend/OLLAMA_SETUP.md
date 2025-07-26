# Ollama 模型管理指南

## 当前错误解决方案

如果遇到 `Ollama Model 'nomic-embed-text:137m-v1.5-fp16' is not found` 错误，说明系统中缺少所需的嵌入模型。

## 解决方法

### 方法1：下载特定版本的模型（推荐）
```bash
ollama pull nomic-embed-text:137m-v1.5-fp16
```

### 方法2：使用当前可用的模型
系统中已有的可用模型：
- `qwen3:8b`
- `gemma3:4b` 
- `nomic-embed-text:latest`

我们已经将代码修改为使用 `nomic-embed-text:latest`，这样可以直接使用现有模型。

## 验证模型安装

检查当前已安装的模型：
```bash
ollama list
```

## 所需模型列表

### 生成模型
- `gemma3:4b` ✅ (已安装) - 用于结构化数据提取
- `qwen3:8b` ✅ (已安装) - 备用生成模型

### 嵌入模型  
- `nomic-embed-text:latest` ✅ (已安装) - 用于文本嵌入和相似度计算
- `nomic-embed-text:137m-v1.5-fp16` ⚠️ (可选) - 特定版本的嵌入模型

## 性能优化建议

1. **使用GPU加速**（如果可用）：
   ```bash
   ollama run gemma3:4b --gpu
   ```

2. **内存优化**：
   ```bash
   # 设置模型并发数
   export OLLAMA_NUM_PARALLEL=2
   
   # 设置最大模型加载数
   export OLLAMA_MAX_LOADED_MODELS=2
   ```

3. **网络配置**：
   ```bash
   # 如果需要远程连接
   export OLLAMA_HOST=0.0.0.0:11434
   ```

## 故障排除

### 1. 模型下载失败
```bash
# 清理并重新下载
ollama rm nomic-embed-text:latest
ollama pull nomic-embed-text:latest
```

### 2. 内存不足
```bash
# 停止所有模型
ollama stop --all

# 重启 Ollama 服务
ollama serve
```

### 3. 连接问题
```bash
# 检查 Ollama 服务状态
curl http://localhost:11434/api/tags

# 重启服务
pkill ollama
ollama serve
```

## 模型更新

定期更新模型以获得最佳性能：
```bash
# 更新所有模型
ollama list | grep -v "NAME" | awk '{print $1}' | xargs -I {} ollama pull {}

# 或者单独更新
ollama pull nomic-embed-text:latest
ollama pull gemma3:4b
```
