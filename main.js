async function recognize(base64, lang, options) {
    const { config, utils } = options;
    const { tauriFetch } = utils;
    
    let { 
        api_format, 
        api_url, 
        api_key, 
        model,
        backup_api_url,
        backup_api_key,
        backup_model
    } = config;

    // 格式化与自动补全 URL 的逻辑处理
    function formatUrl(url, format) {
        if (!url || url.trim() === '') {
            if (format === 'siliconflow') {
                return "https://api.siliconflow.cn/v1/chat/completions";
            }
            return "https://api.openai.com/v1/chat/completions";
        }
        url = url.trim();
        // 如果是硅基流动预设但没填完整，帮用户修正
        if (format === 'siliconflow' && (url === 'https://api.siliconflow.cn' || url === 'api.siliconflow.cn')) {
            return "https://api.siliconflow.cn/v1/chat/completions";
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        if (!url.includes('/v1/chat/completions') && !url.includes('/v1/completions')) {
            if (url.endsWith('/')) {
                url += 'v1/chat/completions';
            } else {
                url += '/v1/chat/completions';
            }
        }
        return url;
    }

    // 处理主副节点 URL
    api_url = formatUrl(api_url, api_format);
    if (backup_api_url) {
        backup_api_url = formatUrl(backup_api_url, api_format);
    }
    
    if (!api_key) {
        throw new Error("请在插件设置中填写主 API Key");
    }
    if (!model) {
        model = "gpt-4o";
    }

    let imageUrl = `data:image/png;base64,${base64}`;

    async function sendRequest(url, key, reqModel) {
        let payload = {
            model: reqModel,
            // 硅基流动与 OpenAI Vision 兼容该格式
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Please extract all text from this image. Output only the exact text present in the image without any extra formatting, explanations, or translations."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl
                            }
                        }
                    ]
                }
            ],
            max_tokens: 4096
        };

        let res = await tauriFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`
            },
            body: {
                type: "Json",
                payload: payload
            }
        });

        if (res.ok) {
            const data = res.data;
            if (data.error) {
                // 如果是标准 OpenAI 错误结构
                throw new Error(data.error.message || JSON.stringify(data.error));
            }
            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                return data.choices[0].message.content;
            } else {
                throw new Error("无效的 API 返回响应: " + JSON.stringify(data));
            }
        } else {
            throw new Error(`网络请求错误 (状态码 ${res.status}): ${JSON.stringify(res.data)}`);
        }
    }

    // 【1】首先尝试主模型和主线路
    try {
        return await sendRequest(api_url, api_key, model);
    } catch (error) {
        // 【2】失败后执行灾备 (Fallback) 逻辑
        if (backup_api_key && backup_api_key.trim() !== '') {
            // 如果备用 API URL 未填，则沿用主机的（可能只是换一个高可用模型）
            let b_url = backup_api_url || api_url; 
            // 同理，没填备用模型就沿用主模型
            let b_model = backup_model || model;
            
            try {
                return await sendRequest(b_url, backup_api_key, b_model);
            } catch (backupError) {
                throw new Error(`【主节点崩溃】${error.message}\n【备节点崩溃】${backupError.message}`);
            }
        } else {
            // 没有填写灾备 API Key，直抛错误
            throw error;
        }
    }
}