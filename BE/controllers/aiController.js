const axios = require("axios");
const multer = require("multer");
const path = require("path");

const toBase64DataUrl = (binaryBuffer) => {
	const base64 = Buffer.from(binaryBuffer, 'binary').toString('base64');
	return `data:image/png;base64,${base64}`;
};

// Multer for receiving a reference image
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 8 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		const isImage = /jpeg|jpg|png|gif|webp/.test(file.mimetype);
		if (isImage) cb(null, true);
		else cb(new Error("Only image files are allowed"));
	},
}).single("image");

exports.generateImageFromPrompt = async (req, res) => {
	try {
		const { prompt, provider } = req.body || {};
		if (!prompt || !prompt.trim()) {
			return res.status(400).json({ message: "Prompt is required" });
		}

		// ---------- Helper: Pollinations.ai (Primary Free Service) ----------
		const generateViaPollinations = async () => {
			console.log("[AI] Attempting Pollinations.ai generation...");
			try {
				// Pollinations.ai is completely free and doesn't require API keys
				// It uses a simple URL-based API
				const encodedPrompt = encodeURIComponent(prompt);
				const width = Number(req.body?.width) || 1024;
				const height = Number(req.body?.height) || 1024;
				
				// Pollinations.ai supports various models and styles
				const model = "sdxl"; // You can change this to: sdxl, sd15, kandinsky, deepfloyd, etc.
				const style = "cinematic"; // You can change this to: cinematic, artistic, realistic, etc.
				
				const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&style=${style}`;
				
				console.log("[AI][Pollinations] Generating image with URL:", pollinationsUrl);
				
				// Pollinations.ai generates images directly, so we fetch the result
				const response = await axios.get(pollinationsUrl, { 
					responseType: 'arraybuffer',
					timeout: 60000, // 60 second timeout
					headers: {
						'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
					}
				});
				
				if (response.data && response.data.length > 0) {
					return toBase64DataUrl(response.data);
				}
				throw new Error("Pollinations.ai returned no image data");
			} catch (error) {
				console.error("[AI][Pollinations] Error details:", {
					status: error?.response?.status,
					data: error?.response?.data,
					message: error?.message
				});
				throw new Error(`Pollinations.ai error: ${error?.message || 'Failed to generate image'}`);
			}
		};

		// ---------- Helper: ModelsLab (Secondary) ----------
		const modelslabKey = process.env.MODELSLAB_API_KEY;
		const modelslabModelId = process.env.MODELSLAB_MODEL_ID || "realistic-vision-v51";

		// Determine dimensions (ModelsLab typically wants multiples of 64). Default 1024x1024
		const getRequestedDimensions = () => {
			const requestedWidth = Number(req.body?.width) || 1024;
			const requestedHeight = Number(req.body?.height) || 1024;
			const round64 = (n) => Math.max(64, Math.round(n / 64) * 64);
			return { width: round64(requestedWidth), height: round64(requestedHeight) };
		};

		const generateViaModelsLab = async () => {
			if (!modelslabKey) {
				throw new Error("Missing MODELSLAB_API_KEY");
			}
			const { width, height } = getRequestedDimensions();
			
			try {
				const response = await axios.post(
					"https://modelslab.com/api/v6/images/text2img",
					{
						key: modelslabKey,
						model_id: modelslabModelId,
						prompt,
						width,
						height,
						samples: 1,
						num_inference_steps: 30,
						guidance_scale: 7.5,
						safety_checker: "no",
						enhance_prompt: "yes",
						seed: null,
						multi_lingual: "no",
						panorama: "no",
						self_attention: "no",
						upscale: "no",
						tomesd: "yes",
						clip_skip: 2,
						use_karras_sigmas: "yes",
						scheduler: "UniPCMultistepScheduler",
					},
					{ headers: { "Content-Type": "application/json" } }
				);
				
				const data = response?.data || {};
				
				// Check for billing/quota errors
				if (data.error || data.message) {
					const errorMsg = data.error || data.message;
					if (errorMsg.toLowerCase().includes('billing') || 
						errorMsg.toLowerCase().includes('quota') || 
						errorMsg.toLowerCase().includes('limit') ||
						errorMsg.toLowerCase().includes('credit')) {
						throw new Error(`ModelsLab billing/quota error: ${errorMsg}`);
					}
				}
				
				// Direct result path
				let output = data?.output || data?.images || [];
				if (Array.isArray(output) && output.length > 0) {
					const imageUrl = output[0];
					if (typeof imageUrl === "string" && /^https?:\/\//i.test(imageUrl)) {
						const imgResp = await axios.get(imageUrl, { responseType: "arraybuffer" });
						return toBase64DataUrl(imgResp.data);
					}
				}
				// Async job path: poll fetch_result
				const fetchUrl = data?.fetch_result || data?.fetch_url || null;
				const jobId = data?.id || data?.job || null;
				const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
				if (fetchUrl) {
					for (let attempt = 0; attempt < 20; attempt++) {
						try {
							const pollResp = await axios.get(fetchUrl, { params: { key: modelslabKey } });
							const pr = pollResp?.data || {};
							const prOutput = pr?.output || pr?.images || [];
							if (Array.isArray(prOutput) && prOutput.length > 0) {
								const url = prOutput[0];
								const imgResp = await axios.get(url, { responseType: "arraybuffer" });
								return toBase64DataUrl(imgResp.data);
							}
							if (pr?.status === "failed" || pr?.status === "error") {
								throw new Error(pr?.message || "ModelsLab job failed");
							}
						} catch (_) { /* ignore and retry */ }
						await sleep(3000);
					}
					throw new Error("ModelsLab fetch timed out");
				}
				throw new Error("ModelsLab returned no image");
			} catch (error) {
				console.error("[AI][ModelsLab] Error details:", {
					status: error?.response?.status,
					data: error?.response?.data,
					message: error?.message
				});
				throw error;
			}
		};

		// ---------- Helper: OpenAI (Hidden/Disabled - Last Resort) ----------
		// OpenAI API is now hidden and only used as a last resort fallback
		const openaiKey = process.env.OPENAI_API_KEY;
		const generateViaOpenAI = async () => {
			console.log("[AI] OpenAI API is hidden/disabled - using as last resort only");
			if (!openaiKey) {
				throw new Error("OpenAI API is disabled - no API key available");
			}
			
			try {
				const response = await axios.post(
					"https://api.openai.com/v1/images/generations",
					{
						model: "dall-e-3",
						prompt,
						size: "1024x1024",
						quality: "standard",
						n: 1,
					},
					{
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${openaiKey}`,
						},
					}
				);
				
				console.log("[AI][OpenAI] Response status:", response.status);
				
				const imageObj = response?.data?.data?.[0];
				if (imageObj?.b64_json) {
					return `data:image/png;base64,${imageObj.b64_json}`;
				}
				if (imageObj?.url) {
					const imgResp = await axios.get(imageObj.url, { responseType: "arraybuffer" });
					return toBase64DataUrl(imgResp.data);
				}
				throw new Error("OpenAI returned no image");
			} catch (error) {
				console.error("[AI][OpenAI] Error details:", {
					status: error?.response?.status,
					data: error?.response?.data,
					message: error?.message
				});
				
				// Check for billing/quota errors
				if (error?.response?.data?.error?.message) {
					const errorMsg = error.response.data.error.message.toLowerCase();
					if (errorMsg.includes('billing') || 
						errorMsg.includes('quota') || 
						errorMsg.includes('limit') ||
						errorMsg.includes('credit') ||
						errorMsg.includes('insufficient')) {
						throw new Error(`OpenAI billing/quota error: ${error.response.data.error.message}`);
					}
				}
				
				throw error;
			}
		};

		// ---------- Helper: Hugging Face (Disabled) ----------
		const generateViaHuggingFace = async () => {
			console.log("[AI] Hugging Face is disabled");
			throw new Error("Hugging Face API is disabled");
		};

		// ---------- Helper: Replicate (Disabled) ----------
		const generateViaReplicate = async () => {
			console.log("[AI] Replicate is disabled");
			throw new Error("Replicate API is disabled");
		};

		// ---------- Helper: Free Alternative (Stable Diffusion WebUI) ----------
		const generateViaFreeAPI = async () => {
			console.log("[AI] Attempting free API generation...");
			try {
				// Using a free Stable Diffusion API
				const response = await axios.post(
					"https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
					{
						text_prompts: [
							{
								text: prompt,
								weight: 1
							},
							{
								text: "blurry, low quality, distorted, blue, ugly",
								weight: -1
							}
						],
						cfg_scale: 7,
						height: 512,
						width: 512,
						samples: 1,
						steps: 30,
					},
					{
						headers: {
							"Content-Type": "application/json",
							"Accept": "application/json",
							"Authorization": `Bearer ${process.env.STABILITY_API_KEY || 'sk-free'}`,
						},
						timeout: 30000
					}
				);
				
				if (response.data.artifacts && response.data.artifacts[0]) {
					const imageData = response.data.artifacts[0].base64;
					return `data:image/png;base64,${imageData}`;
				}
				throw new Error("No image generated");
			} catch (error) {
				console.error("[AI][FreeAPI] Error:", error?.response?.data || error?.message);
				throw new Error(`Free API error: ${error?.response?.data || error?.message}`);
			}
		};

		// ---------- Helper: Free Alternative (Placeholder) ----------
		const generatePlaceholderImage = async () => {
			console.log("[AI] Using placeholder image due to all services failing");
			// Return a simple 1x1 transparent PNG as placeholder
			return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
		};

		let imageDataUrl;
		
		// New priority order: Pollinations.ai first, then ModelsLab, then others as fallbacks
		if (provider === "pollinations") {
			try {
				imageDataUrl = await generateViaPollinations();
			} catch (e) {
				console.warn("[AI] Pollinations.ai failed, attempting ModelsLab fallback...", e?.message);
				if (modelslabKey) {
					try {
						imageDataUrl = await generateViaModelsLab();
					} catch (modelslabError) {
						console.warn("[AI] ModelsLab failed, attempting Free API...", modelslabError?.message);
						try {
							imageDataUrl = await generateViaFreeAPI();
						} catch (freeApiError) {
							console.warn("[AI] All services failed, using placeholder...", freeApiError?.message);
							imageDataUrl = await generatePlaceholderImage();
						}
					}
				} else {
					console.warn("[AI] No ModelsLab key, attempting Free API...");
					try {
						imageDataUrl = await generateViaFreeAPI();
					} catch (freeApiError) {
						console.warn("[AI] Free API failed, using placeholder...", freeApiError?.message);
						imageDataUrl = await generatePlaceholderImage();
					}
				}
			}
		} else if (provider === "modelslab") {
			try {
				imageDataUrl = await generateViaModelsLab();
			} catch (e) {
				console.warn("[AI] ModelsLab failed, attempting Pollinations.ai fallback...", e?.message);
				try {
					imageDataUrl = await generateViaPollinations();
				} catch (pollinationsError) {
					console.warn("[AI] Pollinations.ai failed, attempting Free API...", pollinationsError?.message);
					try {
						imageDataUrl = await generateViaFreeAPI();
					} catch (freeApiError) {
						console.warn("[AI] All services failed, using placeholder...", freeApiError?.message);
						imageDataUrl = await generatePlaceholderImage();
					}
				}
			}
		} else {
			// Default priority: Pollinations.ai first, then ModelsLab, then Free API, then OpenAI as last resort
			try {
				imageDataUrl = await generateViaPollinations();
			} catch (pollinationsError) {
				console.warn("[AI] Pollinations.ai failed, attempting ModelsLab...", pollinationsError?.message);
				if (modelslabKey) {
					try {
						imageDataUrl = await generateViaModelsLab();
					} catch (modelslabError) {
						console.warn("[AI] ModelsLab failed, attempting Free API...", modelslabError?.message);
						try {
							imageDataUrl = await generateViaFreeAPI();
						} catch (freeApiError) {
							console.warn("[AI] Free API failed, attempting OpenAI as last resort...", freeApiError?.message);
							if (openaiKey) {
								try {
									imageDataUrl = await generateViaOpenAI();
								} catch (openaiError) {
									console.warn("[AI] OpenAI failed, using placeholder...", openaiError?.message);
									imageDataUrl = await generatePlaceholderImage();
								}
							} else {
								console.warn("[AI] No OpenAI key, using placeholder...");
								imageDataUrl = await generatePlaceholderImage();
							}
						}
					}
				} else {
					console.warn("[AI] No ModelsLab key, attempting Free API...");
					try {
						imageDataUrl = await generateViaFreeAPI();
					} catch (freeApiError) {
						console.warn("[AI] Free API failed, attempting OpenAI as last resort...", freeApiError?.message);
						if (openaiKey) {
							try {
								imageDataUrl = await generateViaOpenAI();
							} catch (openaiError) {
								console.warn("[AI] OpenAI failed, using placeholder...", openaiError?.message);
								imageDataUrl = await generatePlaceholderImage();
							}
						} else {
							console.warn("[AI] No OpenAI key, using placeholder...");
							imageDataUrl = await generatePlaceholderImage();
						}
					}
				}
			}
		}
		return res.json({ imageBase64: imageDataUrl });
	} catch (err) {
		const status = err?.response?.status || 500;
		const data = err?.response?.data;
		let message = err?.message || "Generation error";
		if (data) {
			if (typeof data === "string") {
				message = data;
			} else if (typeof data?.message === "string") {
				message = data.message;
			} else if (typeof data?.error === "string") {
				message = data.error;
			} else if (typeof data?.error?.message === "string") {
				message = data.error.message;
			} else if (Array.isArray(data?.errors) && data.errors.length) {
				message = data.errors.map((e) => (e?.message || JSON.stringify(e))).join("; ");
			} else {
				try { message = JSON.stringify(data); } catch (_) {}
			}
		}
		console.error("[AI][generateImageFromPrompt]", message);
		return res.status(status).json({ message });
	}
};

exports.generatePromptsFromIdea = async (req, res) => {
	try {
		const { idea } = req.body || {};
		if (!idea || !idea.trim()) {
			return res.status(400).json({ message: "Idea is required" });
		}
		const apiKey = process.env.GEMINI_API_KEY;
		if (!apiKey) {
			return res.status(500).json({ message: "Missing GEMINI_API_KEY" });
		}

		const prompt = `You are a creative prompt generator for AI image models. Given this idea: "${idea}", produce 6 diverse, high-quality prompts suitable for Stable Diffusion or SDXL. Each prompt should be one sentence, richly descriptive with style, lighting, lens details, and aspect cues.`;

		const response = await axios.post(
			"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
			{ contents: [{ parts: [{ text: prompt }] }] },
			{ params: { key: apiKey } }
		);

		const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
		const lines = text
			.split(/\n+/)
			.map((l) => l.replace(/^[-*]\s*/, "").trim())
			.filter(Boolean)
			.slice(0, 6);

		return res.json({ prompts: lines.length ? lines : [text].filter(Boolean) });
	} catch (err) {
		console.error("[AI][generatePromptsFromIdea]", err?.response?.data || err?.message);
		return res.status(500).json({ message: "Prompt generation error" });
	}
};

exports.generatePromptsFromImage = async (req, res) => {
	upload(req, res, async (err) => {
		if (err) {
			return res.status(400).json({ message: err.message || "Upload error" });
		}
		try {
			const apiKey = process.env.GEMINI_API_KEY;
			if (!apiKey) {
				return res.status(500).json({ message: "Missing GEMINI_API_KEY" });
			}
			const idea = req.body?.idea || "";
			const file = req.file;
			if (!file) {
				return res.status(400).json({ message: "Image is required" });
			}
			const base64 = file.buffer.toString("base64");
			const parts = [];
			if (idea) parts.push({ text: `Idea: ${idea}` });
			parts.push({
				inline_data: {
					mime_type: file.mimetype,
					data: base64,
				},
			});
			parts.push({ text: "Generate 6 creative, detailed prompts based on this image content." });

			const response = await axios.post(
				"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
				{ contents: [{ parts }] },
				{ params: { key: apiKey } }
			);

			const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
			const lines = text
				.split(/\n+/)
				.map((l) => l.replace(/^[-*]\s*/, "").trim())
				.filter(Boolean)
				.slice(0, 6);

			return res.json({ prompts: lines.length ? lines : [text].filter(Boolean) });
		} catch (e) {
			console.error("[AI][generatePromptsFromImage]", e?.response?.data || e?.message);
			return res.status(500).json({ message: "Prompt generation error" });
		}
	});
}; 