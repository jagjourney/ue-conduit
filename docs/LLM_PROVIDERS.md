# LLM Providers — UE Conduit

UE Conduit supports **six LLM providers** out of the box, giving users full control over which AI powers their game development workflow.

## Quick Start

Set environment variables before starting the MCP server:

```bash
# Claude (default)
export LLM_PROVIDER=claude
export LLM_API_KEY=sk-ant-...
export LLM_MODEL=claude-sonnet-4-6

# OpenAI
export LLM_PROVIDER=openai
export LLM_API_KEY=sk-...
export LLM_MODEL=gpt-4o

# xAI (Grok)
export LLM_PROVIDER=xai
export LLM_API_KEY=xai-...
export LLM_MODEL=grok-3

# Google Gemini
export LLM_PROVIDER=gemini
export LLM_API_KEY=AIza...
export LLM_MODEL=gemini-2.5-flash

# Ollama (local, free)
export LLM_PROVIDER=ollama
export LLM_MODEL=llama3.1

# Custom (OpenAI-compatible API)
export LLM_PROVIDER=custom
export LLM_API_KEY=your-key
export LLM_MODEL=your-model
export LLM_BASE_URL=https://your-api.com/v1
```

You can also configure the provider from within the UE5 editor panel (Window > Developer Tools > UE Conduit > LLM Provider Settings).

---

## Supported Providers

### 1. Anthropic Claude

| Setting | Value |
|---------|-------|
| Provider ID | `claude` |
| Package | `@anthropic-ai/sdk` |
| API Key Env | `LLM_API_KEY` or `ANTHROPIC_API_KEY` |
| Get Key | [console.anthropic.com](https://console.anthropic.com/) |

**Available Models:**

| Model | Context Window | Vision | Tools | Cost (per 1K input tokens) |
|-------|---------------|--------|-------|---------------------------|
| `claude-opus-4-6` | 200K | Yes | Yes | $0.015 |
| `claude-sonnet-4-6` | 200K | Yes | Yes | $0.003 |
| `claude-haiku-4-5` | 200K | Yes | Yes | $0.00025 |

**Best for:** Complex architecture decisions, multi-file refactoring, deep reasoning about game systems. Claude Sonnet 4 is the recommended default for a balance of quality and cost.

---

### 2. OpenAI

| Setting | Value |
|---------|-------|
| Provider ID | `openai` |
| Package | `openai` |
| API Key Env | `LLM_API_KEY` |
| Get Key | [platform.openai.com](https://platform.openai.com/api-keys) |

**Available Models:**

| Model | Context Window | Vision | Tools | Cost (per 1K input tokens) |
|-------|---------------|--------|-------|---------------------------|
| `gpt-4o` | 128K | Yes | Yes | $0.005 |
| `gpt-4-turbo` | 128K | Yes | Yes | $0.010 |
| `gpt-4o-mini` | 128K | Yes | Yes | $0.00015 |
| `o1-preview` | 128K | No | No | $0.015 |
| `o3-mini` | 200K | No | Yes | $0.0011 |

**Best for:** Broad ecosystem support, GPT-4o-mini for cost-efficient quick tasks, o1/o3 for complex reasoning.

---

### 3. xAI (Grok)

| Setting | Value |
|---------|-------|
| Provider ID | `xai` |
| Package | `openai` (compatible API) |
| Base URL | `https://api.x.ai/v1` |
| API Key Env | `LLM_API_KEY` |
| Get Key | [console.x.ai](https://console.x.ai/) |

**Available Models:**

| Model | Context Window | Vision | Tools | Cost (per 1K input tokens) |
|-------|---------------|--------|-------|---------------------------|
| `grok-3` | 131K | Yes | Yes | $0.003 |
| `grok-3-mini` | 131K | No | Yes | $0.0005 |
| `grok-2` | 131K | Yes | Yes | $0.002 |

**Best for:** Real-time information awareness, competitive alternative to Claude/GPT-4o.

---

### 4. Google Gemini

| Setting | Value |
|---------|-------|
| Provider ID | `gemini` |
| Package | `@google/generative-ai` |
| API Key Env | `LLM_API_KEY` |
| Get Key | [aistudio.google.com](https://aistudio.google.com/apikey) |

**Available Models:**

| Model | Context Window | Vision | Tools | Cost (per 1K input tokens) |
|-------|---------------|--------|-------|---------------------------|
| `gemini-2.5-pro` | 1M | Yes | Yes | $0.00125 |
| `gemini-2.5-flash` | 1M | Yes | Yes | $0.000075 |

**Best for:** Extremely long context (1M tokens), processing entire codebases at once, cost-effective with Gemini Flash.

---

### 5. Ollama (Local)

| Setting | Value |
|---------|-------|
| Provider ID | `ollama` |
| Package | None (native HTTP) |
| Base URL | `http://localhost:11434` |
| API Key | Not required |
| Get Started | [ollama.ai](https://ollama.ai/) |

**Common Models (install with `ollama pull <model>`):**

| Model | Context Window | Vision | Cost |
|-------|---------------|--------|------|
| `llama3.1` | 128K | No | Free |
| `llama3.2` | 128K | No | Free |
| `mistral` | 32K | No | Free |
| `codellama` | 16K | No | Free |
| `deepseek-coder-v2` | 128K | No | Free |
| `qwen2.5-coder` | 131K | No | Free |
| `llava` | 4K | Yes | Free |

**Setup:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.1

# Start the server (if not already running)
ollama serve

# Configure UE Conduit
export LLM_PROVIDER=ollama
export LLM_MODEL=llama3.1
```

**Best for:** Free, private, offline development. No data leaves your machine. Great for experimentation and privacy-sensitive projects.

---

### 6. Custom (OpenAI-compatible)

| Setting | Value |
|---------|-------|
| Provider ID | `custom` |
| Package | `openai` (compatible API) |
| Base URL | **Required** — set via `LLM_BASE_URL` |
| API Key | Depends on service |

Works with any service that implements the OpenAI chat completions API format:
- [Together.ai](https://together.ai) — `https://api.together.xyz/v1`
- [Groq](https://groq.com) — `https://api.groq.com/openai/v1`
- [Fireworks.ai](https://fireworks.ai) — `https://api.fireworks.ai/inference/v1`
- [LM Studio](https://lmstudio.ai) — `http://localhost:1234/v1`
- [vLLM](https://docs.vllm.ai) — `http://localhost:8000/v1`
- [Anyscale](https://anyscale.com) — `https://api.endpoints.anyscale.com/v1`

**Example:**
```bash
export LLM_PROVIDER=custom
export LLM_BASE_URL=https://api.together.xyz/v1
export LLM_API_KEY=your-together-key
export LLM_MODEL=meta-llama/Llama-3.1-70B-Instruct-Turbo
```

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_PROVIDER` | `claude` | Provider: claude, openai, xai, gemini, ollama, custom |
| `LLM_API_KEY` | `$ANTHROPIC_API_KEY` | API key for the selected provider |
| `LLM_MODEL` | `claude-sonnet-4-6` | Model ID |
| `LLM_BASE_URL` | (provider default) | Override API endpoint |
| `LLM_TEMPERATURE` | `0.7` | Sampling temperature (0.0 = deterministic, 1.0 = creative) |
| `LLM_MAX_TOKENS` | `4096` | Maximum tokens per response |

---

## MCP Tools

Once configured, these MCP tools are available:

| Tool | Description |
|------|-------------|
| `ue5_llm_chat` | Send a message to the LLM with optional editor state context |
| `ue5_llm_analyze_screenshot` | Take a viewport screenshot and send to vision LLM |
| `ue5_llm_generate_code` | Generate UE5 C++/Blueprint/Python code |
| `ue5_llm_set_provider` | Switch provider at runtime |
| `ue5_llm_list_providers` | List all available providers |
| `ue5_llm_list_models` | List models for the current provider |

---

## In-Editor Configuration

Open the UE Conduit panel (Window > Developer Tools > UE Conduit) and expand "LLM Provider Settings" to:

1. **Select Provider** — Dropdown with all six providers
2. **Enter API Key** — Masked password field
3. **Select Model** — Auto-populated with defaults when you switch providers
4. **Custom Base URL** — For custom/self-hosted providers
5. **Temperature Slider** — 0.0 (deterministic) to 1.0 (creative)
6. **Apply** — Sends `llm/set_provider` to switch immediately

---

## Which Provider Should I Use?

| Use Case | Recommended Provider | Why |
|----------|---------------------|-----|
| Best overall quality | Claude (Sonnet 4) | Excellent code generation, deep reasoning |
| Cheapest cloud option | Gemini 2.5 Flash | $0.000075/1K tokens, 1M context |
| Free / offline | Ollama (Llama 3.1) | No API costs, total privacy |
| Vision / screenshot analysis | Claude, GPT-4o, Gemini | All support image inputs |
| Maximum context window | Gemini 2.5 Pro | 1M token context |
| Fastest inference | Groq via Custom provider | Ultra-fast Llama inference |
| Self-hosted / air-gapped | Ollama or vLLM via Custom | No external API calls |
