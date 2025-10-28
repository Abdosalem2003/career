/**
 * أمثلة عملية لاستخدام خدمات الترجمة
 * Practical Examples for Translation Services
 */

import {
  GoogleTranslateService,
  LibreTranslateService,
  MyMemoryService,
  SmartTranslator,
  BatchTranslator,
  CachingTranslator,
  TranslationServices
} from './translation-services';

// ============ مثال 1: ترجمة بسيطة ============
export async function example1_SimpleTranslation() {
  console.log('=== Example 1: Simple Translation ===');

  const text = 'Hello, this is a professional translation service';
  
  // استخدم Google Translate
  const result = await GoogleTranslateService.translate(text, 'ar');
  console.log('Original:', text);
  console.log('Translated:', result);
  // النتيجة: "مرحبا، هذه خدمة ترجمة احترافية"
}

// ============ مثال 2: ترجمة ذكية (تختار الأفضل) ============
export async function example2_SmartTranslation() {
  console.log('=== Example 2: Smart Translation ===');

  const texts = [
    'Artificial Intelligence',
    'Machine Learning',
    'Deep Learning',
    'Natural Language Processing'
  ];

  for (const text of texts) {
    const translated = await SmartTranslator.translate(text, 'ar');
    console.log(`${text} → ${translated}`);
  }
}

// ============ مثال 3: ترجمة جماعية ============
export async function example3_BatchTranslation() {
  console.log('=== Example 3: Batch Translation ===');

  const articles = [
    'The future of technology is artificial intelligence',
    'Machine learning models require large datasets',
    'Natural language processing enables human-computer interaction',
    'Deep learning revolutionizes computer vision'
  ];

  // ترجم الكل دفعة واحدة
  const translated = await BatchTranslator.translateBatch(articles, 'ar', 'smart');
  
  articles.forEach((original, index) => {
    console.log(`[${index + 1}] ${original}`);
    console.log(`    → ${translated[index]}\n`);
  });
}

// ============ مثال 4: ترجمة مع تتبع التقدم ============
export async function example4_TranslationWithProgress() {
  console.log('=== Example 4: Translation with Progress ===');

  const documents = Array(10).fill(null).map((_, i) => 
    `Document ${i + 1}: This is a sample text for translation`
  );

  const results = await BatchTranslator.translateWithProgress(
    documents,
    'ar',
    (current, total) => {
      const percentage = Math.round((current / total) * 100);
      console.log(`Progress: ${current}/${total} (${percentage}%)`);
    }
  );

  console.log(`\nTranslated ${results.length} documents`);
}

// ============ مثال 5: ترجمة مع كاش ============
export async function example5_CachedTranslation() {
  console.log('=== Example 5: Cached Translation ===');

  const text = 'Professional translation service';

  // الترجمة الأولى (من الخدمة)
  console.time('First translation');
  const result1 = await CachingTranslator.translate(text, 'ar');
  console.timeEnd('First translation');
  console.log('Result 1:', result1);

  // الترجمة الثانية (من الكاش - أسرع بكثير)
  console.time('Cached translation');
  const result2 = await CachingTranslator.translate(text, 'ar');
  console.timeEnd('Cached translation');
  console.log('Result 2:', result2);

  // إحصائيات الكاش
  const stats = CachingTranslator.getCacheStats();
  console.log(`Cache stats: ${stats.size}/${stats.maxSize}`);
}

// ============ مثال 6: مقارنة الخدمات المختلفة ============
export async function example6_CompareServices() {
  console.log('=== Example 6: Compare Services ===');

  const text = 'Artificial Intelligence is transforming the world';

  const services = [
    { name: 'Google', service: GoogleTranslateService },
    { name: 'LibreTranslate', service: LibreTranslateService },
    { name: 'MyMemory', service: MyMemoryService }
  ];

  console.log(`Original: "${text}"\n`);

  for (const { name, service } of services) {
    try {
      const start = Date.now();
      const result = await service.translate(text, 'ar');
      const time = Date.now() - start;
      console.log(`${name} (${time}ms):`);
      console.log(`  ${result}\n`);
    } catch (error) {
      console.log(`${name}: Error\n`);
    }
  }
}

// ============ مثال 7: ترجمة مع معالجة الأخطاء ============
export async function example7_ErrorHandling() {
  console.log('=== Example 7: Error Handling ===');

  const texts = [
    'Valid text for translation',
    '', // نص فارغ
    'Another valid text',
    null, // null
    'Final text'
  ];

  for (const text of texts) {
    try {
      if (!text || typeof text !== 'string') {
        console.log(`Skipping invalid text: ${text}`);
        continue;
      }

      const result = await SmartTranslator.translate(text, 'ar');
      console.log(`✓ ${text} → ${result}`);
    } catch (error) {
      console.log(`✗ Error translating: ${text}`);
    }
  }
}

// ============ مثال 8: ترجمة لغات متعددة ============
export async function example8_MultiLanguageTranslation() {
  console.log('=== Example 8: Multi-Language Translation ===');

  const text = 'Professional Translation Service';
  const languages = {
    ar: 'العربية',
    fr: 'الفرنسية',
    es: 'الإسبانية',
    de: 'الألمانية',
    zh: 'الصينية',
    ja: 'اليابانية'
  };

  console.log(`Original: "${text}"\n`);

  for (const [langCode, langName] of Object.entries(languages)) {
    const result = await SmartTranslator.translate(text, langCode);
    console.log(`${langName} (${langCode}): ${result}`);
  }
}

// ============ مثال 9: ترجمة مع إعادة محاولة ============
export async function example9_RetryTranslation() {
  console.log('=== Example 9: Retry Translation ===');

  const text = 'This text will be translated with retry logic';

  try {
    const result = await SmartTranslator.translateWithFallback(text, 'ar', 3);
    console.log('Success:', result);
  } catch (error) {
    console.log('Failed after retries:', error);
  }
}

// ============ مثال 10: ترجمة محتوى ديناميكي ============
export async function example10_DynamicContentTranslation() {
  console.log('=== Example 10: Dynamic Content Translation ===');

  // محاكاة محتوى ديناميكي
  const dynamicContent = {
    title: 'Welcome to Our Platform',
    description: 'This is a professional translation service',
    features: [
      'Fast and accurate translations',
      'Support for multiple languages',
      'Real-time translation'
    ],
    cta: 'Get Started Now'
  };

  // ترجم جميع الحقول
  const translated: any = {};

  for (const [key, value] of Object.entries(dynamicContent)) {
    if (typeof value === 'string') {
      translated[key] = await CachingTranslator.translate(value, 'ar');
    } else if (Array.isArray(value)) {
      translated[key] = await BatchTranslator.translateBatch(value, 'ar', 'smart');
    }
  }

  console.log('Original:', dynamicContent);
  console.log('Translated:', translated);
}

// ============ مثال 11: React Hook للترجمة ============
export function useTranslation() {
  return {
    translate: async (text: string, lang: string = 'ar') => {
      return CachingTranslator.translate(text, lang);
    },
    translateBatch: async (texts: string[], lang: string = 'ar') => {
      return BatchTranslator.translateBatch(texts, lang, 'smart');
    },
    clearCache: () => CachingTranslator.clearCache()
  };
}

// ============ مثال 12: استخدام في مكون React ============
export async function example12_ReactComponent() {
  console.log('=== Example 12: React Component Usage ===');

  // في مكون React:
  /*
  import { useTranslation } from '@/lib/translation-examples';

  export function MyComponent() {
    const { translate, translateBatch } = useTranslation();
    const [translated, setTranslated] = useState('');

    const handleTranslate = async () => {
      const result = await translate('Hello World', 'ar');
      setTranslated(result);
    };

    return (
      <div>
        <button onClick={handleTranslate}>Translate</button>
        <p>{translated}</p>
      </div>
    );
  }
  */

  console.log('See code comments for React component example');
}

// ============ تشغيل جميع الأمثلة ============
export async function runAllExamples() {
  console.log('🚀 Running all translation examples...\n');

  try {
    await example1_SimpleTranslation();
    console.log('\n---\n');

    await example2_SmartTranslation();
    console.log('\n---\n');

    await example3_BatchTranslation();
    console.log('\n---\n');

    await example4_TranslationWithProgress();
    console.log('\n---\n');

    await example5_CachedTranslation();
    console.log('\n---\n');

    await example6_CompareServices();
    console.log('\n---\n');

    await example7_ErrorHandling();
    console.log('\n---\n');

    await example8_MultiLanguageTranslation();
    console.log('\n---\n');

    await example9_RetryTranslation();
    console.log('\n---\n');

    await example10_DynamicContentTranslation();
    console.log('\n---\n');

    console.log('✅ All examples completed!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}
