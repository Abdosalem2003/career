import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import { 
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Undo, Redo, Link as LinkIcon, Image as ImageIcon,
  Highlighter, Type, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  language?: 'ar' | 'en';
}

export function RichTextEditor({ content, onChange, placeholder, language = 'ar' }: RichTextEditorProps) {
  const { toast } = useToast();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000',
    '#FFC0CB', '#A52A2A', '#808080', '#FFFFFF'
  ];

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || (language === 'ar' ? 'ابدأ الكتابة...' : 'Start writing...'),
      }),
      CharacterCount,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] p-4',
        dir: language === 'ar' ? 'rtl' : 'ltr',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt(language === 'ar' ? 'أدخل رابط الصورة:' : 'Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        // Upload to server
        const response = await fetch('/api/admin/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            base64,
            fileName: file.name,
            mimeType: file.type
          }),
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          editor.chain().focus().setImage({ src: data.url }).run();
          toast({
            title: language === 'ar' ? 'تم الرفع' : 'Uploaded',
            description: language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully',
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadImage(file);
      }
    };
    input.click();
  };

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const wordCount = editor.storage.characterCount.words();
  const charCount = editor.storage.characterCount.characters();
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <Button
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title={language === 'ar' ? 'عريض' : 'Bold'}
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title={language === 'ar' ? 'مائل' : 'Italic'}
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('strike') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title={language === 'ar' ? 'يتوسطه خط' : 'Strikethrough'}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('code') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          title={language === 'ar' ? 'كود' : 'Code'}
        >
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* Headings */}
        <Button
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title={language === 'ar' ? 'عنوان 1' : 'Heading 1'}
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title={language === 'ar' ? 'عنوان 2' : 'Heading 2'}
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title={language === 'ar' ? 'عنوان 3' : 'Heading 3'}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* Lists */}
        <Button
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title={language === 'ar' ? 'قائمة نقطية' : 'Bullet List'}
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title={language === 'ar' ? 'قائمة مرقمة' : 'Ordered List'}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title={language === 'ar' ? 'اقتباس' : 'Quote'}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* Colors */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowHighlightPicker(false);
            }}
            title={language === 'ar' ? 'لون النص' : 'Text Color'}
          >
            <Type className="h-4 w-4" />
          </Button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg z-50 grid grid-cols-7 gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setShowColorPicker(false);
                  }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker);
              setShowColorPicker(false);
            }}
            title={language === 'ar' ? 'لون الخلفية' : 'Highlight'}
          >
            <Highlighter className="h-4 w-4" />
          </Button>
          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg z-50 grid grid-cols-7 gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color }).run();
                    setShowHighlightPicker(false);
                  }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Image & Link */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImageUpload}
          title={language === 'ar' ? 'إضافة صورة' : 'Add Image'}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLinkInput(!showLinkInput)}
          title={language === 'ar' ? 'إضافة رابط' : 'Add Link'}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title={language === 'ar' ? 'تراجع' : 'Undo'}
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title={language === 'ar' ? 'إعادة' : 'Redo'}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="border-b p-2 flex gap-2">
          <input
            type="url"
            placeholder={language === 'ar' ? 'أدخل الرابط...' : 'Enter URL...'}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setLink()}
            className="flex-1 px-3 py-1 text-sm border rounded"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          />
          <Button size="sm" onClick={setLink}>
            {language === 'ar' ? 'إضافة' : 'Add'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowLinkInput(false)}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} className="min-h-[400px]" />

      {/* Stats */}
      <div className="border-t bg-muted/30 px-4 py-2 flex justify-between text-xs text-muted-foreground">
        <div className="flex gap-4">
          <span>{language === 'ar' ? 'الكلمات' : 'Words'}: {wordCount}</span>
          <span>{language === 'ar' ? 'الأحرف' : 'Characters'}: {charCount}</span>
          <span>{language === 'ar' ? 'وقت القراءة' : 'Reading time'}: {readingTime} {language === 'ar' ? 'دقيقة' : 'min'}</span>
        </div>
      </div>
    </div>
  );
}
