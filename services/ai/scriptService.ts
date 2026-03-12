/**
 * 剧本处理服务
 * 包含剧本解析、分镜生成、续写、改写等功能
 */

import { ScriptData, Shot, Scene, ArtDirection } from "../../types";
import { addRenderLogWithTokens } from '../renderLogService';
import {
  retryOperation,
  cleanJsonString,
  chatCompletion,
  chatCompletionStream,
  logScriptProgress,
} from './apiCore';
import { getStylePrompt } from './promptConstants';
import { ensureStylesLoaded } from '../visualStyleService';
import { generateArtDirection, generateAllCharacterPrompts, generateVisualPrompts } from './visualService';

// Re-export 日志回调函数（保持外部 API 兼容）
export { setScriptLogCallback, clearScriptLogCallback, logScriptProgress } from './apiCore';

// ============================================
// 剧本解析
// ============================================

/**
 * Agent 1 & 2: Script Structuring & Breakdown
 * 解析原始文本为结构化剧本数据
 */
export const parseScriptToData = async (
  rawText: string,
  language: string = '中文',
  model?: string,
  visualStyle: string = 'live-action'
): Promise<ScriptData> => {
  console.log('📝 parseScriptToData 调用 - 使用模型:', model || '(active)', '视觉风格:', visualStyle);
  logScriptProgress('正在解析剧本结构...');
  const startTime = Date.now();

  const prompt = `
    Analyze the text and output a JSON object in the language: ${language}.
    
    Tasks:
    1. Extract title, genre, logline (in ${language}).
    2. Extract characters (id, name, gender, age, personality).
       - personality MUST include appearance prototype if anthropomorphic/animal-based (e.g. 以猫为原型、拟人化狐狸、猫耳少女).
    3. Extract scenes (id, location, time, atmosphere).
    4. Break down the story into paragraphs linked to scenes.
    
    Input:
    "${rawText.slice(0, 30000)}" // Limit input context if needed
    
    Output ONLY valid JSON with this structure:
    {
      "title": "string",
      "genre": "string",
      "logline": "string",
      "characters": [{"id": "string", "name": "string", "gender": "string", "age": "string", "personality": "string"}],
      "scenes": [{"id": "string", "location": "string", "time": "string", "atmosphere": "string"}],
      "storyParagraphs": [{"id": number, "text": "string", "sceneRefId": "string"}]
    }
  `;

  try {
    const responseText = await retryOperation(() => chatCompletion(prompt, model, 0.7, 8192, 'json_object'));

    let parsed: any = {};
    try {
      const text = cleanJsonString(responseText);
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse script data JSON:", e);
      parsed = {};
    }

    // Enforce String IDs for consistency and init variations
    const characters = Array.isArray(parsed.characters) ? parsed.characters.map((c: any) => ({
      ...c,
      id: String(c.id),
      variations: []
    })) : [];
    const scenes = Array.isArray(parsed.scenes) ? parsed.scenes.map((s: any) => ({ ...s, id: String(s.id) })) : [];
    const storyParagraphs = Array.isArray(parsed.storyParagraphs) ? parsed.storyParagraphs.map((p: any) => ({ ...p, sceneRefId: String(p.sceneRefId) })) : [];

    const genre = parsed.genre || "通用";

    // ========== Phase 1: 生成全局美术指导文档 ==========
    console.log("🎨 正在为角色和场景生成视觉提示词...", `风格: ${visualStyle}`);
    logScriptProgress(`正在生成角色与场景的视觉提示词（风格：${visualStyle}）...`);

    let artDirection: ArtDirection | undefined;
    try {
      artDirection = await generateArtDirection(
        parsed.title || '未命名剧本',
        genre,
        parsed.logline || '',
        characters.map((c: any) => ({ name: c.name, gender: c.gender, age: c.age, personality: c.personality })),
        scenes.map((s: any) => ({ location: s.location, time: s.time, atmosphere: s.atmosphere })),
        visualStyle,
        language,
        model
      );
      console.log("✅ 全局美术指导文档生成完成，风格关键词:", artDirection.moodKeywords.join(', '));
    } catch (e) {
      console.error("⚠️ 全局美术指导文档生成失败，将使用默认风格:", e);
    }

    // ========== Phase 2: 批量生成角色视觉提示词 ==========
    if (characters.length > 0 && artDirection) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const batchResults = await generateAllCharacterPrompts(
          characters, artDirection, genre, visualStyle, language, model
        );

        for (let i = 0; i < characters.length; i++) {
          if (batchResults[i] && batchResults[i].visualPrompt) {
            characters[i].visualPrompt = batchResults[i].visualPrompt;
            characters[i].negativePrompt = batchResults[i].negativePrompt;
          }
        }

        // Fallback: individually generate failed characters
        const failedCharacters = characters.filter((c: any) => !c.visualPrompt);
        if (failedCharacters.length > 0) {
          console.log(`⚠️ ${failedCharacters.length} 个角色需要单独重新生成提示词`);
          logScriptProgress(`${failedCharacters.length} 个角色需要单独重新生成...`);
          for (const char of failedCharacters) {
            try {
              await new Promise(resolve => setTimeout(resolve, 1500));
              console.log(`  重新生成角色提示词: ${char.name}`);
              logScriptProgress(`重新生成角色视觉提示词：${char.name}`);
              const prompts = await generateVisualPrompts('character', char, genre, model, visualStyle, language, artDirection);
              char.visualPrompt = prompts.visualPrompt;
              char.negativePrompt = prompts.negativePrompt;
            } catch (e) {
              console.error(`Failed to generate visual prompt for character ${char.name}:`, e);
            }
          }
        }
      } catch (e) {
        console.error("批量角色提示词生成失败，回退到逐个生成模式:", e);
        for (let i = 0; i < characters.length; i++) {
          try {
            if (i > 0) await new Promise(resolve => setTimeout(resolve, 1500));
            console.log(`  生成角色提示词: ${characters[i].name}`);
            logScriptProgress(`生成角色视觉提示词：${characters[i].name}`);
            const prompts = await generateVisualPrompts('character', characters[i], genre, model, visualStyle, language, artDirection);
            characters[i].visualPrompt = prompts.visualPrompt;
            characters[i].negativePrompt = prompts.negativePrompt;
          } catch (e2) {
            console.error(`Failed to generate visual prompt for character ${characters[i].name}:`, e2);
          }
        }
      }
    } else if (characters.length > 0) {
      for (let i = 0; i < characters.length; i++) {
        try {
          if (i > 0) await new Promise(resolve => setTimeout(resolve, 1500));
          console.log(`  生成角色提示词: ${characters[i].name}`);
          logScriptProgress(`生成角色视觉提示词：${characters[i].name}`);
          const prompts = await generateVisualPrompts('character', characters[i], genre, model, visualStyle, language);
          characters[i].visualPrompt = prompts.visualPrompt;
          characters[i].negativePrompt = prompts.negativePrompt;
        } catch (e) {
          console.error(`Failed to generate visual prompt for character ${characters[i].name}:`, e);
        }
      }
    }

    // ========== Phase 3: 生成场景视觉提示词 ==========
    for (let i = 0; i < scenes.length; i++) {
      try {
        if (i > 0 || characters.length > 0) await new Promise(resolve => setTimeout(resolve, 1500));
        console.log(`  生成场景提示词: ${scenes[i].location}`);
        logScriptProgress(`生成场景视觉提示词：${scenes[i].location}`);
        const prompts = await generateVisualPrompts('scene', scenes[i], genre, model, visualStyle, language, artDirection);
        scenes[i].visualPrompt = prompts.visualPrompt;
        scenes[i].negativePrompt = prompts.negativePrompt;
      } catch (e) {
        console.error(`Failed to generate visual prompt for scene ${scenes[i].location}:`, e);
      }
    }

    console.log("✅ 视觉提示词生成完成！");
    logScriptProgress('视觉提示词生成完成');

    const result = {
      title: parsed.title || "未命名剧本",
      genre: genre,
      logline: parsed.logline || "",
      language: language,
      artDirection,
      characters,
      scenes,
      props: [],
      storyParagraphs
    };

    addRenderLogWithTokens({
      type: 'script-parsing',
      resourceId: 'script-parse-' + Date.now(),
      resourceName: result.title,
      status: 'success',
      model: model,
      prompt: prompt.substring(0, 200) + '...',
      duration: Date.now() - startTime
    });

    return result;
  } catch (error: any) {
    addRenderLogWithTokens({
      type: 'script-parsing',
      resourceId: 'script-parse-' + Date.now(),
      resourceName: '剧本解析',
      status: 'failed',
      model: model,
      prompt: prompt.substring(0, 200) + '...',
      error: error.message,
      duration: Date.now() - startTime
    });
    throw error;
  }
};

// ============================================
// 分镜生成
// ============================================

/**
 * 生成分镜列表
 * 根据剧本数据和目标时长，为每个场景生成适量的分镜头
 */
export const generateShotList = async (scriptData: ScriptData, model?: string): Promise<Shot[]> => {
  console.log('🎬 generateShotList 调用 - 使用模型:', model || '(active)', '视觉风格:', scriptData.visualStyle);
  logScriptProgress('正在生成分镜列表...');
  const overallStartTime = Date.now();

  if (!scriptData.scenes || scriptData.scenes.length === 0) {
    return [];
  }

  const lang = scriptData.language || '中文';
  const visualStyle = scriptData.visualStyle || 'live-action';
  await ensureStylesLoaded();
  const stylePrompt = getStylePrompt(visualStyle);
  const artDir = scriptData.artDirection;

  const artDirectionBlock = artDir ? `
      ⚠️ GLOBAL ART DIRECTION (MANDATORY for ALL visualPrompt fields):
      ${artDir.consistencyAnchors}
      Color Palette: Primary=${artDir.colorPalette.primary}, Secondary=${artDir.colorPalette.secondary}, Accent=${artDir.colorPalette.accent}
      Color Temperature: ${artDir.colorPalette.temperature}, Saturation: ${artDir.colorPalette.saturation}
      Lighting Style: ${artDir.lightingStyle}
      Texture: ${artDir.textureStyle}
      Mood Keywords: ${artDir.moodKeywords.join(', ')}
      Character Proportions: ${artDir.characterDesignRules.proportions}
      Line/Edge Style: ${artDir.characterDesignRules.lineWeight}
      Detail Level: ${artDir.characterDesignRules.detailLevel}
` : '';

  const processScene = async (scene: Scene, index: number): Promise<Shot[]> => {
    const sceneStartTime = Date.now();
    const paragraphs = scriptData.storyParagraphs
      .filter(p => String(p.sceneRefId) === String(scene.id))
      .map(p => p.text)
      .join('\n');

    if (!paragraphs.trim()) return [];

    const targetDurationStr = scriptData.targetDuration || '60s';
    const targetSeconds = parseInt(targetDurationStr.replace(/[^\d]/g, '')) || 60;
    const totalShotsNeeded = Math.round(targetSeconds / 10);
    const scenesCount = scriptData.scenes.length;
    const shotsPerScene = Math.max(1, Math.round(totalShotsNeeded / scenesCount));

    const prompt = `
      Act as a professional cinematographer. Generate a detailed shot list (Camera blocking) for Scene ${index + 1}.
      Language for Text Output: ${lang}.
      
      IMPORTANT VISUAL STYLE: ${stylePrompt}
      All 'visualPrompt' fields MUST describe shots in this "${visualStyle}" style.
${artDirectionBlock}
      Scene Details:
      Location: ${scene.location}
      Time: ${scene.time}
      Atmosphere: ${scene.atmosphere}
      
      Scene Action:
      "${paragraphs.slice(0, 5000)}"
      
      Context:
      Genre: ${scriptData.genre}
      Visual Style: ${visualStyle} (${stylePrompt})
      Target Duration (Whole Script): ${scriptData.targetDuration || 'Standard'}
      Total Shots Budget: ${totalShotsNeeded} shots (Each shot = 10 seconds of video)
      Shots for This Scene: Approximately ${shotsPerScene} shots
      
      Characters:
      ${JSON.stringify(scriptData.characters.map(c => ({ id: c.id, name: c.name, desc: c.visualPrompt || c.personality })))}

      Professional Camera Movement Reference (Choose from these categories):
      - Horizontal Left Shot (向左平移) - Camera moves left
      - Horizontal Right Shot (向右平移) - Camera moves right
      - Pan Left Shot (平行向左扫视) - Pan left
      - Pan Right Shot (平行向右扫视) - Pan right
      - Vertical Up Shot (向上直线运动) - Move up vertically
      - Vertical Down Shot (向下直线运动) - Move down vertically
      - Tilt Up Shot (向上仰角运动) - Tilt upward
      - Tilt Down Shot (向下俯角运动) - Tilt downward
      - Zoom Out Shot (镜头缩小/拉远) - Pull back/zoom out
      - Zoom In Shot (镜头放大/拉近) - Push in/zoom in
      - Dolly Shot (推镜头) - Dolly in/out movement
      - Circular Shot (环绕拍摄) - Orbit around subject
      - Over the Shoulder Shot (越肩镜头) - Over shoulder perspective
      - Pan Shot (摇镜头) - Pan movement
      - Low Angle Shot (仰视镜头) - Low angle view
      - High Angle Shot (俯视镜头) - High angle view
      - Tracking Shot (跟踪镜头) - Follow subject
      - Handheld Shot (摇摄镜头) - Handheld camera
      - Static Shot (静止镜头) - Fixed camera position
      - POV Shot (主观视角) - Point of view
      - Bird's Eye View Shot (俯瞰镜头) - Overhead view
      - 360-Degree Circular Shot (360度环绕) - Full circle
      - Parallel Tracking Shot (平行跟踪) - Side tracking
      - Diagonal Tracking Shot (对角跟踪) - Diagonal tracking
      - Rotating Shot (旋转镜头) - Rotating movement
      - Slow Motion Shot (慢动作) - Slow-mo effect
      - Time-Lapse Shot (延时摄影) - Time-lapse
      - Canted Shot (斜视镜头) - Dutch angle
      - Cinematic Dolly Zoom (电影式变焦推轨) - Vertigo effect

      Instructions:
      1. Create EXACTLY ${shotsPerScene} shots (or ${shotsPerScene - 1} to ${shotsPerScene + 1} shots if needed for story flow) for this scene.
      2. CRITICAL: Each shot will be 10 seconds. Total shots must match the target duration formula: ${targetSeconds} seconds ÷ 10 = ${totalShotsNeeded} total shots across all scenes.
      3. DO NOT exceed ${shotsPerScene + 1} shots for this scene. Select the most important moments only.
      4. 'cameraMovement': Can reference the Professional Camera Movement Reference list above for inspiration, or use your own creative camera movements. You may use the exact English terms (e.g., "Dolly Shot", "Pan Right Shot", "Zoom In Shot", "Tracking Shot") or describe custom movements.
      5. 'shotSize': Specify the field of view (e.g., Extreme Close-up, Medium Shot, Wide Shot).
      6. 'actionSummary': Detailed description of what happens in the shot (in ${lang}).
      7. 'visualPrompt': Detailed description for image generation in ${visualStyle} style (OUTPUT IN ${lang}). Include style-specific keywords.${artDir ? ' MUST follow the Global Art Direction color palette, lighting, and mood.' : ''} Keep it under 50 words.
      
      Output ONLY a valid JSON OBJECT with this exact structure (no markdown, no extra text):
      {
        "shots": [
          {
            "id": "string",
            "sceneId": "${scene.id}",
            "actionSummary": "string",
            "dialogue": "string (empty if none)",
            "cameraMovement": "string",
            "shotSize": "string",
            "characters": ["string"],
            "keyframes": [
              {"id": "string", "type": "start|end", "visualPrompt": "string (MUST include ${visualStyle} style keywords${artDir ? ' and follow Art Direction' : ''})"}
            ]
          }
        ]
      }
    `;

    let responseText = '';
    try {
      console.log(`  📡 场景 ${index + 1} API调用 - 模型:`, model);
      responseText = await retryOperation(() => chatCompletion(prompt, model, 0.5, 8192, 'json_object'));
      const text = cleanJsonString(responseText);
      const parsed = JSON.parse(text);

      const shots = Array.isArray(parsed)
        ? parsed
        : (parsed && Array.isArray((parsed as any).shots) ? (parsed as any).shots : []);

      const validShots = Array.isArray(shots) ? shots : [];
      const result = validShots.map((s: any) => ({
        ...s,
        sceneId: String(scene.id)
      }));

      addRenderLogWithTokens({
        type: 'script-parsing',
        resourceId: `shot-gen-scene-${scene.id}-${Date.now()}`,
        resourceName: `分镜生成 - 场景${index + 1}: ${scene.location}`,
        status: 'success',
        model: model,
        prompt: prompt.substring(0, 200) + '...',
        duration: Date.now() - sceneStartTime
      });

      return result;
    } catch (e: any) {
      console.error(`Failed to generate shots for scene ${scene.id}`, e);
      try {
        console.error(`  ↳ sceneId=${scene.id}, sceneIndex=${index}, responseText(snippet)=`, String(responseText || '').slice(0, 500));
      } catch {
        // ignore
      }

      addRenderLogWithTokens({
        type: 'script-parsing',
        resourceId: `shot-gen-scene-${scene.id}-${Date.now()}`,
        resourceName: `分镜生成 - 场景${index + 1}: ${scene.location}`,
        status: 'failed',
        model: model,
        prompt: prompt.substring(0, 200) + '...',
        error: e.message || String(e),
        duration: Date.now() - sceneStartTime
      });

      return [];
    }
  };

  // Process scenes sequentially
  const BATCH_SIZE = 1;
  const allShots: Shot[] = [];

  for (let i = 0; i < scriptData.scenes.length; i += BATCH_SIZE) {
    if (i > 0) await new Promise(resolve => setTimeout(resolve, 1500));

    const batch = scriptData.scenes.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((scene, idx) => processScene(scene, i + idx))
    );
    batchResults.forEach(shots => allShots.push(...shots));
  }

  if (allShots.length === 0) {
    throw new Error('分镜生成失败：AI返回为空（可能是 JSON 结构不匹配或场景内容未被识别）。请打开控制台查看分镜生成日志。');
  }

  return allShots.map((s, idx) => ({
    ...s,
    id: `shot-${idx + 1}`,
    keyframes: Array.isArray(s.keyframes) ? s.keyframes.map((k: any) => ({
      ...k,
      id: `kf-${idx + 1}-${k.type}`,
      status: 'pending'
    })) : []
  }));
};

// ============================================
// 剧本续写/改写
// ============================================

/**
 * AI续写功能 - 基于已有剧本内容续写后续情节
 */
export const continueScript = async (existingScript: string, language: string = '中文', model?: string): Promise<string> => {
  console.log('✍️ continueScript 调用 - 使用模型:', model || '(active)');
  const startTime = Date.now();

  const prompt = `
你是一位资深剧本创作者。请在充分理解下方已有剧本内容的基础上，续写后续情节。

续写要求：
1. 严格保持原剧本的风格、语气、人物性格和叙事节奏，确保无明显风格断层。
2. 情节发展需自然流畅，逻辑严密，因果关系合理，避免突兀转折。
3. 有效增加戏剧冲突和情感张力，使故事更具吸引力和张力。
4. 续写内容应为原有剧本长度的30%-50%，字数适中，避免过短或过长。
5. 保持剧本的原有格式，包括场景描述、人物对白、舞台指示等，确保格式一致。
6. 输出语言为：${language}，用词准确、表达流畅。
7. 仅输出续写剧本内容，不添加任何说明、前缀或后缀。

已有剧本内容：
${existingScript}

请直接续写剧本内容。（不要包含"续写："等前缀）：
`;

  try {
    const result = await retryOperation(() => chatCompletion(prompt, model, 0.8, 4096));
    const duration = Date.now() - startTime;

    await addRenderLogWithTokens({
      type: 'script-parsing',
      resourceId: 'continue-script',
      resourceName: 'AI续写剧本',
      status: 'success',
      model,
      duration,
      prompt: existingScript.substring(0, 200) + '...'
    });

    return result;
  } catch (error) {
    console.error('❌ 续写失败:', error);
    throw error;
  }
};

/**
 * AI续写功能（流式）
 */
export const continueScriptStream = async (
  existingScript: string,
  language: string = '中文',
  model?: string,
  onDelta?: (delta: string) => void
): Promise<string> => {
  console.log('✍️ continueScriptStream 调用 - 使用模型:', model || '(active)');
  const startTime = Date.now();

  const prompt = `
你是一位资深剧本创作者。请在充分理解下方已有剧本内容的基础上，续写后续情节。

续写要求：
1. 严格保持原剧本的风格、语气、人物性格和叙事节奏，确保无明显风格断层。
2. 情节发展需自然流畅，逻辑严密，因果关系合理，避免突兀转折。
3. 有效增加戏剧冲突和情感张力，使故事更具吸引力和张力。
4. 续写内容应为原有剧本长度的30%-50%，字数适中，避免过短或过长。
5. 保持剧本的原有格式，包括场景描述、人物对白、舞台指示等，确保格式一致。
6. 输出语言为：${language}，用词准确、表达流畅。
7. 仅输出续写剧本内容，不添加任何说明、前缀或后缀。

已有剧本内容：
${existingScript}

请直接续写剧本内容。（不要包含"续写："等前缀）：
`;

  try {
    const result = await retryOperation(() => chatCompletionStream(prompt, model, 0.8, undefined, 600000, onDelta));
    const duration = Date.now() - startTime;

    await addRenderLogWithTokens({
      type: 'script-parsing',
      resourceId: 'continue-script',
      resourceName: 'AI续写剧本（流式）',
      status: 'success',
      model,
      duration,
      prompt: existingScript.substring(0, 200) + '...'
    });

    return result;
  } catch (error) {
    console.error('❌ 续写失败（流式）:', error);
    throw error;
  }
};

/**
 * AI改写功能 - 对整个剧本进行改写
 */
export const rewriteScript = async (originalScript: string, language: string = '中文', model?: string): Promise<string> => {
  console.log('🔄 rewriteScript 调用 - 使用模型:', model || '(active)');
  const startTime = Date.now();

  const prompt = `
你是一位顶级剧本编剧顾问，擅长提升剧本的结构、情感和戏剧张力。请对下方提供的剧本进行系统性、创造性改写，目标是使剧本在连贯性、流畅性和戏剧冲突等方面显著提升。

改写具体要求如下：

1. 保留原剧本的核心故事线和主要人物设定，不改变故事主旨。
2. 优化情节结构，确保事件发展具有清晰的因果关系，逻辑严密。
3. 增强场景之间的衔接与转换，使整体叙事流畅自然。
4. 丰富和提升人物对话，使其更具个性、情感色彩和真实感，避免生硬或刻板。
5. 强化戏剧冲突，突出人物之间的矛盾与情感张力，增加情节的吸引力和感染力。
6. 深化人物内心活动和情感描写，提升剧本的情感深度。
7. 优化整体节奏，合理分配高潮与缓和段落，避免情节拖沓或推进过快。
8. 保持或适度增加剧本内容长度，确保内容充实但不过度冗长。
9. 严格遵循剧本格式规范，包括场景标注、人物台词、舞台指示等。
10. 输出语言为：${language}，确保语言风格与剧本类型相符。

原始剧本内容如下：
${originalScript}

请根据以上要求，输出经过全面改写、结构优化、情感丰富的完整剧本文本。
`;

  try {
    const result = await retryOperation(() => chatCompletion(prompt, model, 0.7, 8192));
    const duration = Date.now() - startTime;

    await addRenderLogWithTokens({
      type: 'script-parsing',
      resourceId: 'rewrite-script',
      resourceName: 'AI改写剧本',
      status: 'success',
      model,
      duration,
      prompt: originalScript.substring(0, 200) + '...'
    });

    return result;
  } catch (error) {
    console.error('❌ 改写失败:', error);
    throw error;
  }
};

/**
 * AI改写功能（流式）
 */
export const rewriteScriptStream = async (
  originalScript: string,
  language: string = "中文",
  model?: string,
  onDelta?: (delta: string) => void,
): Promise<string> => {
  console.log("🔄 rewriteScriptStream 调用 - 使用模型:", model || "(active)");
  const startTime = Date.now();

  const prompt = `
你是一位顶级剧本编剧顾问，擅长提升剧本的结构、情感和戏剧张力。请对下方提供的剧本进行系统性、创造性改写，目标是使剧本在连贯性、流畅性和戏剧冲突等方面显著提升。

改写具体要求如下：

1. 保留原剧本的核心故事线和主要人物设定，不改变故事主旨。
2. 优化情节结构，确保事件发展具有清晰的因果关系，逻辑严密。
3. 增强场景之间的衔接与转换，使整体叙事流畅自然。
4. 丰富和提升人物对话，使其更具个性、情感色彩和真实感，避免生硬或刻板。
5. 强化戏剧冲突，突出人物之间的矛盾与情感张力，增加情节的吸引力和感染力。
6. 深化人物内心活动和情感描写，提升剧本的情感深度。
7. 优化整体节奏，合理分配高潮与缓和段落，避免情节拖沓或推进过快。
8. 保持或适度增加剧本内容长度，确保内容充实但不过度冗长。
9. 严格遵循剧本格式规范，包括场景标注、人物台词、舞台指示等。
10. 输出语言为：${language}，确保语言风格与剧本类型相符。

原始剧本内容如下：
${originalScript}

请根据以上要求，输出经过全面改写、结构优化、情感丰富的完整剧本文本。
`;

  try {
    const result = await retryOperation(() =>
      chatCompletionStream(prompt, model, 0.7, undefined, 600000, onDelta),
    );
    const duration = Date.now() - startTime;

    await addRenderLogWithTokens({
      type: "script-parsing",
      resourceId: "rewrite-script",
      resourceName: "AI改写剧本（流式）",
      status: "success",
      model,
      duration,
      prompt: originalScript.substring(0, 200) + "...",
    });

    return result;
  } catch (error) {
    console.error("❌ 改写失败（流式）:", error);
    throw error;
  }
};

// ============================================
// 分镜质量校验与自动修复
// ============================================

import { QualityCheck, ShotQualityAssessment } from "../../types";

interface GenerateShotListOptions {
  abortSignal?: AbortSignal;
  previousScriptData?: ScriptData | null;
  previousShots?: Shot[];
  reuseUnchangedScenes?: boolean;
  enableQualityCheck?: boolean;
}

const SCRIPT_STAGE_QUALITY_SCHEMA_VERSION = 1;

const normalizeMatchText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
    .trim();
};

const pickQualityCheck = (
  key: string,
  label: string,
  score: number,
  weight: number,
  details?: string,
): QualityCheck => ({
  key,
  label,
  score: Math.max(0, Math.min(100, Math.round(score))),
  weight,
  passed: score >= 70,
  details,
});

const getWeightedScore = (checks: QualityCheck[]): number => {
  const weightedSum = checks.reduce(
    (sum, check) => sum + check.score * check.weight,
    0,
  );
  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0) || 1;
  return Math.round(weightedSum / totalWeight);
};

const getGrade = (score: number): ShotQualityAssessment["grade"] => {
  if (score >= 80) return "pass";
  if (score >= 60) return "warning";
  return "fail";
};

const resolveSupportsEndFrame = (modelId?: string): boolean => {
  const id = (modelId || '').toLowerCase();
  if (!id) return false;
  if (id.startsWith('sora') || id.startsWith('doubao-seedance')) return false;
  return true;
};

const evaluatePromptReadiness = (shot: Shot): QualityCheck => {
  const startPrompt = shot.keyframes?.find((frame) => frame.type === 'start')?.visualPrompt?.trim() || '';
  const endPrompt = shot.keyframes?.find((frame) => frame.type === 'end')?.visualPrompt?.trim() || '';
  const videoPrompt = shot.interval?.videoPrompt?.trim() || '';
  const actionSummaryLen = shot.actionSummary.trim().length;

  let startScore = 0;
  if (startPrompt.length >= 40) startScore = 45;
  else if (startPrompt.length >= 16) startScore = 30;
  else if (startPrompt.length > 0) startScore = 15;

  let endScore = 0;
  if (endPrompt.length >= 30) endScore = 25;
  else if (endPrompt.length > 0) endScore = 10;

  let videoScore = 0;
  if (videoPrompt.length >= 30) videoScore = 20;
  else if (videoPrompt.length > 0) videoScore = 10;

  const actionScore = actionSummaryLen >= 12 ? 10 : 0;
  const score = startScore + endScore + videoScore + actionScore;

  const details = [
    '规则：起始提示词45分 + 结束提示词25分 + 视频提示词20分 + 动作摘要10分',
    `起始提示词长度 ${startPrompt.length} 字符 -> ${startScore} 分（>=40 得45；16-39 得30；1-15 得15）`,
    `结束提示词长度 ${endPrompt.length} 字符 -> ${endScore} 分（>=30 得25；1-29 得10）`,
    `视频提示词长度 ${videoPrompt.length} 字符 -> ${videoScore} 分（>=30 得20；1-29 得10）`,
    `动作摘要长度 ${actionSummaryLen} 字符 -> ${actionScore} 分（>=12 得10）`,
  ].join('\n');

  return pickQualityCheck(
    'prompt-readiness',
    '提示词准备度',
    score,
    30,
    details
  );
};

const evaluateAssetCoverage = (shot: Shot, scriptData?: ScriptData | null): QualityCheck => {
  if (!scriptData) {
    return pickQualityCheck(
      'asset-coverage',
      '资产覆盖',
      35,
      20,
      '未检测到剧本资产数据，无法核验场景/角色/道具参考图，按保守分 35 计算。'
    );
  }

  const scene = scriptData.scenes.find((s) => String(s.id) === String(shot.sceneId));
  const sceneScore = scene?.referenceImage ? 35 : 10;

  const charIds = shot.characters || [];
  const charDetails: string[] = [];
  const charScoreParts = charIds.map((charId) => {
    const char = scriptData.characters.find((entry) => String(entry.id) === String(charId));
    if (!char) {
      charDetails.push(`角色 ${charId}：未找到角色数据（0分）`);
      return 0;
    }
    const variationId = shot.characterVariations?.[charId];
    if (variationId) {
      const variation = char.variations?.find((entry) => entry.id === variationId);
      if (variation?.referenceImage) {
        charDetails.push(`${char.name}(${variation.name})：有变体参考图（25分）`);
        return 25;
      }
    }
    if (char.referenceImage) {
      charDetails.push(`${char.name}：有角色参考图（25分）`);
      return 25;
    }
    charDetails.push(`${char.name}：缺少角色参考图（5分）`);
    return 5;
  });
  const characterScore = charScoreParts.length
    ? charScoreParts.reduce((sum, value) => sum + value, 0) / charScoreParts.length
    : 20;

  const props = shot.props || [];
  const propDetails: string[] = [];
  const propScoreParts = props.map((propId) => {
    const prop = scriptData.props?.find((entry) => String(entry.id) === String(propId));
    if (!prop) {
      propDetails.push(`道具 ${propId}：未找到道具数据（0分）`);
      return 0;
    }
    if (prop.referenceImage) {
      propDetails.push(`${prop.name}：有参考图（10分）`);
      return 10;
    }
    propDetails.push(`${prop.name}：缺少参考图（4分）`);
    return 4;
  });
  const propScore = propScoreParts.length
    ? propScoreParts.reduce((sum, value) => sum + value, 0) / propScoreParts.length
    : 10;

  const totalScore = sceneScore + characterScore + propScore;
  const details = [
    '规则：场景参考图最高35分 + 角色参考图平均最高25分 + 道具参考图平均最高10分',
    `场景「${scene?.location || shot.sceneId}」：${scene?.referenceImage ? '有参考图（35分）' : '无参考图（10分）'}`,
    charIds.length
      ? `角色(${charIds.length})：${charDetails.join('；')} -> 平均 ${Math.round(characterScore)} 分`
      : '角色：本镜头未绑定角色，按默认 20 分',
    props.length
      ? `道具(${props.length})：${propDetails.join('；')} -> 平均 ${Math.round(propScore)} 分`
      : '道具：本镜头未绑定道具，按默认 10 分',
    `总分：${Math.round(totalScore)}/100`,
  ].join('\n');

  return pickQualityCheck(
    'asset-coverage',
    '资产覆盖',
    totalScore,
    20,
    details
  );
};

const evaluateKeyframeExecution = (shot: Shot): QualityCheck => {
  const startFrame = shot.keyframes?.find((frame) => frame.type === 'start');
  const endFrame = shot.keyframes?.find((frame) => frame.type === 'end');
  const supportsEndFrame = resolveSupportsEndFrame(shot.videoModel);

  const describeFrame = (label: string, frame?: Shot['keyframes'][number]) => {
    const status = frame?.status || 'pending';
    const hasImage = !!frame?.imageUrl;
    const hasPrompt = !!frame?.visualPrompt;
    return `${label}：状态 ${status}，${hasImage ? '已出图' : '未出图'}，${hasPrompt ? '有提示词' : '无提示词'}`;
  };

  let startScore = 0;
  if (startFrame?.imageUrl) startScore = 55;
  else if (startFrame?.status === 'generating') startScore = 25;
  else if (startFrame?.visualPrompt) startScore = 15;

  let endScore = 0;
  if (supportsEndFrame) {
    if (endFrame?.imageUrl) endScore = 35;
    else if (endFrame?.status === 'generating') endScore = 15;
    else if (endFrame?.visualPrompt) endScore = 10;
  } else {
    endScore = 30;
  }

  let penalty = 0;
  if (startFrame?.status === 'failed' || endFrame?.status === 'failed') {
    penalty = -20;
  }

  const score = startScore + endScore + penalty;
  const details = [
    '规则：首帧最高55分 + 尾帧最高35分（若模型不支持尾帧则固定30分）+ 失败惩罚20分',
    describeFrame('首帧', startFrame),
    supportsEndFrame
      ? describeFrame('尾帧', endFrame)
      : `尾帧：当前模型 ${shot.videoModel || '未设置'} 不支持尾帧插值，按固定 30 分处理`,
    penalty < 0 ? '检测到关键帧失败状态：额外扣 20 分' : '未检测到关键帧失败状态：不扣分',
    `总分：${Math.round(score)}/100`,
  ].join('\n');

  return pickQualityCheck(
    'keyframe-execution',
    '关键帧执行',
    score,
    30,
    details
  );
};

const evaluateVideoExecution = (shot: Shot): QualityCheck => {
  const interval = shot.interval;
  if (!interval) {
    return pickQualityCheck(
      'video-execution',
      '视频执行',
      30,
      20,
      '未检测到视频生成记录：当前镜头还未发起视频生成，因此按基础分 30 计算。'
    );
  }

  let score = 0;
  let reason = '';
  if (interval.videoUrl && interval.status === 'completed') score = 100;
  else if (interval.status === 'generating') score = 55;
  else if (interval.status === 'pending') score = 35;
  else if (interval.status === 'failed') score = 10;

  if (interval.videoUrl && interval.status === 'completed') {
    reason = '视频已成功生成并回填URL（100分）。';
  } else if (interval.status === 'generating') {
    reason = '视频仍在生成中（55分）。';
  } else if (interval.status === 'pending') {
    reason = '视频任务处于待生成状态（35分）。';
  } else if (interval.status === 'failed') {
    reason = '视频生成失败（10分）。';
  } else {
    reason = `视频状态为 ${interval.status}，按保守分 ${score} 处理。`;
  }

  const details = [
    '规则：completed=100，generating=55，pending=35，failed=10',
    `当前状态：${interval.status}，${interval.videoUrl ? '已存在视频URL' : '无视频URL'}`,
    reason,
  ].join('\n');

  return pickQualityCheck(
    'video-execution',
    '视频执行',
    score,
    20,
    details
  );
};

const evaluateContinuity = (shot: Shot): QualityCheck => {
  const startFrame = shot.keyframes?.find((frame) => frame.type === 'start');
  const endFrame = shot.keyframes?.find((frame) => frame.type === 'end');
  const supportsEndFrame = resolveSupportsEndFrame(shot.videoModel);
  const hasCharacters = (shot.characters?.length || 0) > 0;

  let baseScore = 40;
  let startBonus = 0;
  let endBonus = 0;
  let modelCompensation = 0;
  let charPenalty = 0;
  let charEndPenalty = 0;

  if (startFrame?.imageUrl) startBonus = 25;
  if (supportsEndFrame && endFrame?.imageUrl) endBonus = 25;
  if (!supportsEndFrame) modelCompensation = 20;

  if (hasCharacters && !startFrame?.imageUrl) charPenalty = -20;
  if (supportsEndFrame && hasCharacters && !endFrame?.imageUrl) charEndPenalty = -10;

  const score = baseScore + startBonus + endBonus + modelCompensation + charPenalty + charEndPenalty;
  const details = [
    '规则：基础40分 + 首帧锚点25分 + 尾帧锚点25分（模型不支持尾帧时补偿20分）+ 角色缺锚点惩罚',
    `模型：${shot.videoModel || '未设置'}，${supportsEndFrame ? '支持尾帧插值' : '不支持尾帧插值'}`,
    `首帧锚点：${startFrame?.imageUrl ? '已提供（+25）' : '未提供（+0）'}`,
    supportsEndFrame
      ? `尾帧锚点：${endFrame?.imageUrl ? '已提供（+25）' : '未提供（+0）'}`
      : '尾帧锚点：模型不支持，使用补偿分（+20）',
    hasCharacters
      ? `角色镜头惩罚：${!startFrame?.imageUrl ? '缺少首帧锚点（-20）' : '首帧锚点完整（0）'}${supportsEndFrame && !endFrame?.imageUrl ? '；缺少尾帧锚点（-10）' : ''}`
      : '非角色镜头：不触发角色锚点惩罚',
    `总分：${Math.round(score)}/100`,
  ].join('\n');

  return pickQualityCheck(
    'continuity-risk',
    '连续性风险',
    score,
    10,
    details
  );
};

const buildSummary = (checks: QualityCheck[], grade: ShotQualityAssessment['grade']): string => {
  const failedChecks = checks.filter((check) => !check.passed).map((check) => check.label);
  if (!failedChecks.length) {
    return '可进入生产，核心检查项已通过。';
  }

  const prefix =
    grade === 'fail'
      ? '风险较高：'
      : grade === 'warning'
        ? '需要优化：'
        : '轻微问题：';
  return `${prefix}${failedChecks.join('、')}`;
};

const assessScriptStageShotQuality = (input: {
  shot: Shot;
  scriptData?: ScriptData | null;
}): ShotQualityAssessment => {
  const { shot, scriptData } = input;

  const checks: QualityCheck[] = [
    evaluatePromptReadiness(shot),
    evaluateAssetCoverage(shot, scriptData),
    evaluateKeyframeExecution(shot),
    evaluateVideoExecution(shot),
    evaluateContinuity(shot),
  ];

  const score = getWeightedScore(checks);
  const grade = getGrade(score);

  return {
    version: SCRIPT_STAGE_QUALITY_SCHEMA_VERSION,
    score,
    grade,
    generatedAt: Date.now(),
    checks,
    summary: buildSummary(checks, grade),
  };
};

const normalizeShotKeyframes = (
  shot: Shot,
  shotIndex: number,
  visualStyle: string,
): any[] => {
  const startFrame = shot.keyframes?.find((f) => f.type === "start") || {
    id: `keyframe-${shot.id}-start`,
    type: "start",
    visualPrompt: `${shot.actionSummary}，起始构图，${visualStyle}风格`,
    status: "pending",
  };
  const endFrame = shot.keyframes?.find((f) => f.type === "end") || {
    id: `keyframe-${shot.id}-end`,
    type: "end",
    visualPrompt: `${shot.actionSummary}，结束构图，${visualStyle}风格`,
    status: "pending",
  };
  return [startFrame, endFrame];
};

const repairShotForScriptStage = (input: {
  shot: Shot;
  shotIndex: number;
  visualStyle: string;
  usedActionKeys: Set<string>;
  validCharacterIds: Set<string>;
  validPropIds: Set<string>;
  forcePromptRewrite?: boolean;
}): Shot => {
  const {
    shot,
    shotIndex,
    visualStyle,
    usedActionKeys,
    validCharacterIds,
    validPropIds,
    forcePromptRewrite = false,
  } = input;
  const actionFallback = `镜头 ${shotIndex + 1} 推进`;
  let actionSummary = String(shot.actionSummary || "").trim() || actionFallback;
  const normalizedAction = normalizeMatchText(actionSummary);
  if (normalizedAction && usedActionKeys.has(normalizedAction)) {
    actionSummary = `${actionSummary}（镜头${shotIndex + 1}）`;
  }
  usedActionKeys.add(normalizeMatchText(actionSummary));

  const cameraMovement =
    String(shot.cameraMovement || "").trim() || "Static Shot";
  const shotSize = String(shot.shotSize || "").trim() || "Medium Shot";

  const characters = Array.from(
    new Set(
      (shot.characters || [])
        .map((id) => String(id))
        .filter((id) => validCharacterIds.has(id)),
    ),
  );
  const props = Array.from(
    new Set(
      (shot.props || [])
        .map((id) => String(id))
        .filter((id) => validPropIds.has(id)),
    ),
  );

  const keyframes = normalizeShotKeyframes(
    { ...shot, actionSummary },
    shotIndex,
    visualStyle,
  );
  if (
    forcePromptRewrite ||
    String(keyframes[0]?.visualPrompt || "").trim().length < 12
  ) {
    keyframes[0].visualPrompt = `${actionSummary}，起始构图，主体清晰，${visualStyle}风格，光影明确`;
  }
  if (
    forcePromptRewrite ||
    String(keyframes[1]?.visualPrompt || "").trim().length < 12
  ) {
    keyframes[1].visualPrompt = `${actionSummary}，结束构图，动作收束，${visualStyle}风格，镜头节奏完整`;
  }

  return {
    ...shot,
    actionSummary,
    cameraMovement,
    shotSize,
    characters,
    props,
    keyframes,
  };
};

const applyScriptStageQualityPipeline = (
  shots: Shot[],
  scriptData: ScriptData,
  validCharacterIds: Set<string>,
  validPropIds: Set<string>,
  visualStyle: string,
): Shot[] => {
  const usedActionKeysByScene = new Map<string, Set<string>>();
  const repairedShots = shots.map((shot, index) => {
    const sceneId = String(shot.sceneId || "");
    const usedActionKeys =
      usedActionKeysByScene.get(sceneId) || new Set<string>();
    if (!usedActionKeysByScene.has(sceneId)) {
      usedActionKeysByScene.set(sceneId, usedActionKeys);
    }

    let candidate = repairShotForScriptStage({
      shot,
      shotIndex: index,
      visualStyle,
      usedActionKeys,
      validCharacterIds,
      validPropIds,
      forcePromptRewrite: false,
    });

    let assessment = assessScriptStageShotQuality({
      shot: candidate,
      scriptData,
    });

    const requiredFieldsPassed = assessment.checks.find(
      (item) => item.key === "prompt-readiness",
    )?.passed;
    const keyframePassed = assessment.checks.find(
      (item) => item.key === "keyframe-execution",
    )?.passed;
    if (
      assessment.grade === "fail" ||
      !requiredFieldsPassed ||
      !keyframePassed
    ) {
      candidate = repairShotForScriptStage({
        shot: candidate,
        shotIndex: index,
        visualStyle,
        usedActionKeys,
        validCharacterIds,
        validPropIds,
        forcePromptRewrite: true,
      });
      assessment = assessScriptStageShotQuality({
        shot: candidate,
        scriptData,
      });
    }

    const withAssessment: Shot = {
      ...candidate,
      qualityAssessment: assessment,
    };
    return withAssessment;
  });

  const warnings = repairedShots.filter(
    (shot) => shot.qualityAssessment?.grade === "warning",
  ).length;
  const fails = repairedShots.filter(
    (shot) => shot.qualityAssessment?.grade === "fail",
  ).length;
  logScriptProgress(
    `分镜质量校验完成：${repairedShots.length}条（warning ${warnings}，fail ${fails}）`,
  );

  return repairedShots;
};

// 重写generateShotList函数以支持质量校验
export const generateShotListWithQualityCheck = async (
  scriptData: ScriptData,
  model: string = 'gpt-5.2',
  options?: GenerateShotListOptions
): Promise<Shot[]> => {
  const abortSignal = options?.abortSignal;
  const enableQualityCheck = options?.enableQualityCheck !== false;
  
  console.log('🎬 generateShotListWithQualityCheck 调用 - 使用模型:', model, '视觉风格:', scriptData.visualStyle);
  logScriptProgress('正在生成分镜列表...');
  const overallStartTime = Date.now();

  const ensureNotAborted = () => {
    if (abortSignal?.aborted) {
      throw new Error('请求已取消');
    }
  };

  const processScene = async (scene: Scene, index: number): Promise<Shot[]> => {
    ensureNotAborted();
    const sceneStartTime = Date.now();
    const sceneProgressLabel = `场景 ${index + 1}/${scriptData.scenes.length}：${scene.location}`;
    logScriptProgress(`正在处理 ${sceneProgressLabel}`);

    const prompt = `
你是专业的分镜导演，负责将剧本场景转换为详细的分镜列表。

请基于以下场景信息，生成分镜列表：

场景ID: ${scene.id}
场景地点: ${scene.location}
场景时间: ${scene.time}
场景氛围: ${scene.atmosphere}

剧本内容参考:
${scriptData.storyParagraphs
  .filter(p => p.sceneRefId === scene.id)
  .map(p => p.text)
  .join('\n')}

分镜要求：
1. 每个分镜必须包含：actionSummary（动作摘要）、cameraMovement（镜头运动）、shotSize（景别）、characters（角色ID数组）
2. 每个分镜必须包含keyframes数组，包含start和end两个关键帧，每个关键帧包含visualPrompt（视觉提示词）
3. 分镜数量要合理，能够完整表现场景内容
4. 保持镜头之间的连贯性和节奏感

请输出JSON格式，包含一个shots数组：
{
  "shots": [
    {
      "actionSummary": "...",
      "cameraMovement": "...",
      "shotSize": "...",
      "characters": ["character1", "character2"],
      "props": ["prop1"],
      "keyframes": [
        {
          "type": "start",
          "visualPrompt": "..."
        },
        {
          "type": "end",
          "visualPrompt": "..."
        }
      ]
    }
  ]
}
`;

    try {
      const result = await retryOperation(() => chatCompletion(prompt, model, 0.7, 4096, 'json_object'), 2, 2000);
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      const shots = Array.isArray(parsed?.shots) ? parsed.shots : [];
      
      await addRenderLogWithTokens({
        type: 'script-parsing',
        resourceId: `shot-gen-scene-${scene.id}-${Date.now()}`,
        resourceName: `分镜生成 - 场景${index + 1}: ${scene.location}`,
        status: 'success',
        model: model,
        prompt: prompt.substring(0, 200) + '...',
        duration: Date.now() - sceneStartTime
      });

      return shots;
    } catch (e) {
      console.error(`❌ 场景 ${index + 1} 分镜生成失败:`, e);
      
      await addRenderLogWithTokens({
        type: 'script-parsing',
        resourceId: `shot-gen-scene-${scene.id}-${Date.now()}`,
        resourceName: `分镜生成 - 场景${index + 1}: ${scene.location}`,
        status: 'failed',
        model: model,
        prompt: prompt.substring(0, 200) + '...',
        error: (e as Error).message || String(e),
        duration: Date.now() - sceneStartTime
      });

      return [];
    }
  };

  // Process scenes sequentially
  const BATCH_SIZE = 1;
  const allShots: Shot[] = [];

  for (let i = 0; i < scriptData.scenes.length; i += BATCH_SIZE) {
    if (i > 0) await new Promise(resolve => setTimeout(resolve, 1500));

    const batch = scriptData.scenes.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((scene, idx) => processScene(scene, i + idx))
    );
    batchResults.forEach(shots => allShots.push(...shots));
  }

  if (allShots.length === 0) {
    throw new Error('分镜生成失败：AI返回为空（可能是 JSON 结构不匹配或场景内容未被识别）。请打开控制台查看分镜生成日志。');
  }

  const normalizedShots = allShots.map((s, idx) => ({
    ...s,
    id: `shot-${idx + 1}`,
    keyframes: Array.isArray(s.keyframes) ? s.keyframes.map((k: any) => ({
      ...k,
      id: `kf-${idx + 1}-${k.type}`,
      status: 'pending'
    })) : []
  }));

  // 应用质量校验和自动修复
  if (enableQualityCheck) {
    logScriptProgress('已启用分镜质量校验与自动修复。');
    console.log('🔍 开始应用质量校验，镜头数量:', normalizedShots.length);
    const validCharacterIds = new Set(scriptData.characters.map(c => String(c.id)));
    const validPropIds = new Set(scriptData.props?.map(p => String(p.id)) || []);
    const visualStyle = scriptData.visualStyle || 'live-action';
    
    console.log('🔧 调用 applyScriptStageQualityPipeline 函数');
    const qualityCheckedShots = applyScriptStageQualityPipeline(
      normalizedShots,
      scriptData,
      validCharacterIds,
      validPropIds,
      visualStyle
    );
    console.log('✅ 质量校验完成，返回的镜头数量:', qualityCheckedShots.length);
    // 检查第一个镜头是否有质量评估数据
    if (qualityCheckedShots.length > 0) {
      console.log('📊 第一个镜头的质量评估数据:', qualityCheckedShots[0].qualityAssessment);
    }
    return qualityCheckedShots;
  } else {
    logScriptProgress('分镜质量校验已关闭，跳过自动打分与修复。');
    console.log('⚠️  质量检查已关闭，跳过质量评估生成');
    return normalizedShots.map(shot => {
      if (!('qualityAssessment' in shot)) return shot;
      const { qualityAssessment, ...rest } = shot as Shot & { qualityAssessment?: ShotQualityAssessment };
      return rest as Shot;
    });
  }
};

export { assessScriptStageShotQuality };
