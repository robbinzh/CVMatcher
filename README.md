<div align="center">

# 简历匹配器 (CV Matcher)
### 基于 Resume Matcher 的中文化改造版本

[![Apache License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/robbinzh/CVMatcher?style=for-the-badge&color=c20a71&labelColor=black)](https://github.com/robbinzh/CVMatcher)
[![GitHub Forks](https://img.shields.io/github/forks/robbinzh/CVMatcher?style=for-the-badge&color=c20a71&labelColor=black)](https://github.com/robbinzh/CVMatcher/forks)

**告别 ATS 系统的自动拒绝。** 简历匹配器是一个 AI 驱动的平台，通过逆向工程招聘算法，精确显示如何调整您的简历。获取真正能让您通过初筛并进入人工审核的关键词、格式和洞察。

**致力于打造"简历制作的 VS Code"。**

</div>

---

## 📋 项目说明

本项目是基于 [Resume Matcher](https://github.com/srbhr/Resume-Matcher) 的**独立中文化改造版本**，专门为中文简历优化和中国求职市场量身定制。

> **重要提醒**：这是一个独立的开源项目，与原始 Resume Matcher 项目分别维护和开发。

### 🎯 核心改进

- **🇨🇳 中文简历支持**：专门优化中文简历的解析和分析算法
- **🤖 双模型 AI 支持**：
  - 中文简历使用 `Qwen3:8B` 模型进行分析
  - 英文简历使用 `Gemma3:4B` 模型进行分析
- **🎨 中文界面**：完全本地化的用户界面
- **📊 本土化匹配算法**：针对中国企业 HR 习惯优化的匹配逻辑

---

## ✨ 主要功能

- **🏠 本地运行**：无需上传简历到服务器，所有处理都在本地完成，保护隐私安全
- **🔍 ATS 兼容性分析**：深度分析简历与申请者跟踪系统的兼容性
- **⚡ 即时匹配评分**：上传简历和职位描述，快速获得匹配分数和关键改进领域
- **🎯 关键词优化器**：将简历与职位关键词对齐，识别关键内容缺口
- **📈 指导性改进**：提供清晰的建议，让您的简历脱颖而出
- **🌐 双语支持**：同时支持中文和英文简历分析

---

## 🛠 技术栈

| 技术         | 版本/信息                    |
|-------------|----------------------------|
| Python      | 3.12+                      |
| Next.js     | 15+                        |
| Ollama      | 0.6.7                      |
| FastAPI     | 后端 API 服务               |
| Tailwind CSS| 样式框架                    |
| SQLite      | 数据库                      |

---

## 🚀 快速开始

### 系统要求

- Python 3.12 或更高版本
- Node.js 18 或更高版本
- Ollama（用于本地 AI 模型）

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/robbinzh/CVMatcher.git
   cd CVMatcher
   ```

2. **按照安装指南操作**
   ```bash
   # 查看详细安装说明
   cat SETUP.md
   ```

3. **配置 Ollama 模型**
   ```bash
   # 拉取中文模型
   ollama pull qwen3:8b

   # 拉取英文模型  
   ollama pull gemma3:4b
   ```

更多详细信息请参阅 [SETUP.md](SETUP.md) 文件。

---

## 📚 使用指南

1. **上传简历**：支持 PDF、Word 等格式
2. **输入职位描述**：粘贴您感兴趣的职位要求
3. **获取分析报告**：查看匹配度、关键词建议和改进方向
4. **优化简历**：根据 AI 建议调整简历内容

---

## 🗺 开发路线图

- [ ] 可视化关键词高亮
- [ ] AI 画布功能，帮助制作有影响力的、以指标为驱动的简历内容
- [ ] 多职位描述优化
- [ ] 简历模板库
- [ ] 行业特定的优化建议
- [ ] 批量简历分析

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论您是开发者、设计师，还是想要提供建议的用户。

**注意**：这里的贡献是针对本中文化改造版本，不是原始 Resume Matcher 项目。

### 如何贡献

1. Fork 本仓库
2. 创建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

### 当前维护者

- [@robbinzh](https://github.com/robbinzh) - 项目创建者和主要维护者

---

## 📄 许可证

本项目基于 Apache License 2.0 开源协议分发。详情请见 [LICENSE](LICENSE) 文件。

### 原始项目归属

本项目基于 [Resume Matcher](https://github.com/srbhr/Resume-Matcher) 进行中文化改造和功能增强。感谢原始项目的所有贡献者。

原始项目版权归属：
- 原始项目：Resume Matcher
- 原始作者：[@srbhr](https://github.com/srbhr)
- 原始仓库：https://github.com/srbhr/Resume-Matcher

---

## 🙏 致谢

- 感谢 [Resume Matcher](https://github.com/srbhr/Resume-Matcher) 项目提供的优秀开源基础
- 感谢开源社区的无私奉献精神

---

## 📞 联系我们

如果您有任何问题、建议或合作意向，请通过以下方式联系：

- 提交 [Issue](https://github.com/robbinzh/CVMatcher/issues)
- 发起 [Discussion](https://github.com/robbinzh/CVMatcher/discussions)

---

<div align="center">

**如果这个项目对您有帮助，请给我们一个 ⭐**

Made with ❤️ for the Chinese job market

</div>
