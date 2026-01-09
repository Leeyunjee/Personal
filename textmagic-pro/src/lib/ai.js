import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors
let openaiClient = null;

function getOpenAIClient() {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openaiClient;
}

export const TOOLS = {
  summarize: {
    name: '텍스트 요약',
    description: '긴 텍스트를 간결하게 요약합니다',
    icon: '📝',
    prompt: (text, options = {}) => `다음 텍스트를 ${options.length || '짧게'} 요약해주세요:\n\n${text}`
  },
  grammar: {
    name: '문법 검사',
    description: '영문 문법을 검사하고 교정합니다',
    icon: '✓',
    prompt: (text) => `Check the grammar of the following text and provide corrections with explanations:\n\n${text}`
  },
  email: {
    name: '이메일 작성',
    description: '전문적인 비즈니스 이메일을 작성합니다',
    icon: '✉️',
    prompt: (text, options = {}) => `Write a professional ${options.tone || 'formal'} email about the following topic:\n\n${text}\n\nFormat it properly with subject line, greeting, body, and signature.`
  },
  social: {
    name: '소셜 미디어 포스트',
    description: 'SNS용 매력적인 포스트를 생성합니다',
    icon: '📱',
    prompt: (text, options = {}) => `Create an engaging ${options.platform || 'general'} social media post about:\n\n${text}\n\nInclude relevant hashtags and make it attention-grabbing.`
  },
  seo: {
    name: 'SEO 메타 태그',
    description: '검색 최적화된 메타 태그를 생성합니다',
    icon: '🔍',
    prompt: (text) => `Generate SEO-optimized meta tags for the following content:\n\n${text}\n\nProvide: title tag (60 chars max), meta description (155 chars max), and 5-7 keywords.`
  },
  headline: {
    name: '제목 생성',
    description: '클릭을 유도하는 제목을 생성합니다',
    icon: '🎯',
    prompt: (text, options = {}) => `Generate 5 compelling ${options.style || 'engaging'} headlines for:\n\n${text}\n\nMake them attention-grabbing and click-worthy.`
  },
  translate: {
    name: '번역',
    description: '다국어 번역을 제공합니다',
    icon: '🌐',
    prompt: (text, options = {}) => `Translate the following text to ${options.targetLang || 'English'}:\n\n${text}`
  },
  rewrite: {
    name: '콘텐츠 리라이터',
    description: '기존 콘텐츠를 새롭게 재작성합니다',
    icon: '🔄',
    prompt: (text, options = {}) => `Rewrite the following content in a ${options.style || 'more engaging'} style while keeping the same meaning:\n\n${text}`
  },
  expand: {
    name: '텍스트 확장',
    description: '짧은 아이디어를 자세히 확장합니다',
    icon: '📈',
    prompt: (text) => `Expand the following idea into a detailed, well-structured paragraph:\n\n${text}`
  },
  simplify: {
    name: '간단하게 설명',
    description: '복잡한 내용을 쉽게 설명합니다',
    icon: '💡',
    prompt: (text) => `Explain the following in simple terms that anyone can understand:\n\n${text}`
  }
};

export async function processText(toolId, text, options = {}) {
  const tool = TOOLS[toolId];
  if (!tool) {
    throw new Error('Invalid tool');
  }

  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = tool.prompt(text, options);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that processes text professionally. Provide clear, high-quality results.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to process text. Please try again.');
  }
}

// Demo mode for when API key is not available
export async function processTextDemo(toolId, text, options = {}) {
  const tool = TOOLS[toolId];
  if (!tool) {
    throw new Error('Invalid tool');
  }

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const demoResponses = {
    summarize: `**요약 결과:**\n\n원문의 핵심 내용을 3문장으로 요약했습니다:\n\n1. ${text.substring(0, 50)}...에 대한 주요 포인트입니다.\n2. 이 내용은 중요한 정보를 담고 있습니다.\n3. 결론적으로, 핵심 메시지가 전달되었습니다.`,

    grammar: `**Grammar Check Results:**\n\n✅ Overall Score: 85/100\n\n**Corrections:**\n- No major errors found\n- Consider using more varied sentence structures\n- Good use of punctuation\n\n**Improved Version:**\n${text}`,

    email: `**Subject:** Professional Follow-up Regarding ${text.substring(0, 30)}...\n\nDear [Recipient],\n\nI hope this email finds you well. I am writing to discuss ${text.substring(0, 50)}...\n\nI would appreciate the opportunity to discuss this matter further at your earliest convenience.\n\nBest regards,\n[Your Name]`,

    social: `🚀 ${text.substring(0, 100)}...\n\n✨ Don't miss out on this amazing opportunity!\n\n#trending #viral #mustread #amazing #inspiration`,

    seo: `**Meta Title:** ${text.substring(0, 60)}\n\n**Meta Description:** Discover everything about ${text.substring(0, 100)}. Learn more about this topic and get expert insights.\n\n**Keywords:** keyword1, keyword2, keyword3, keyword4, keyword5`,

    headline: `**5 Compelling Headlines:**\n\n1. "The Ultimate Guide to ${text.substring(0, 30)}..."\n2. "Why Everyone Is Talking About ${text.substring(0, 25)}..."\n3. "10 Things You Need to Know About ${text.substring(0, 20)}..."\n4. "How ${text.substring(0, 30)}... Changed Everything"\n5. "The Secret Behind ${text.substring(0, 25)}..."`,

    translate: `**Translation:**\n\n${text}\n\n(This is a demo. Connect your OpenAI API key for actual translation.)`,

    rewrite: `**Rewritten Content:**\n\n${text.split('').reverse().join('').substring(0, 50)}... \n\nIn other words, the content has been professionally rewritten to be more engaging while maintaining the original meaning.`,

    expand: `**Expanded Content:**\n\n${text}\n\nFurthermore, this topic encompasses several important aspects that deserve deeper exploration. The implications extend beyond the surface level, touching on fundamental principles that affect how we understand and interact with this subject matter.`,

    simplify: `**Simplified Explanation:**\n\nIn simple terms: ${text.substring(0, 100)}...\n\nThink of it like this: It's basically a straightforward concept that anyone can understand with a little context.`
  };

  return demoResponses[toolId] || `Processed: ${text}`;
}
