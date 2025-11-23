import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3,
  Link2,
  Quote,
  Undo,
  Redo
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Escribe tu contenido aquí...',
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const url = window.prompt('URL del enlace:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-700">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-600 bg-gray-800">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-600 ${
            editor.isActive('bold') ? 'bg-techno-purple text-white' : 'text-gray-300'
          }`}
          type="button"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-600 ${
            editor.isActive('italic') ? 'bg-techno-purple text-white' : 'text-gray-300'
          }`}
          type="button"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-8 bg-gray-600 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-600 ${
            editor.isActive('heading', { level: 1 }) ? 'bg-techno-purple text-white' : 'text-gray-300'
          }`}
          type="button"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-600 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-techno-purple text-white' : 'text-gray-300'
          }`}
          type="button"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-600 ${
            editor.isActive('heading', { level: 3 }) ? 'bg-techno-purple text-white' : 'text-gray-300'
          }`}
          type="button"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <div className="w-px h-8 bg-gray-600 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-600 ${
            editor.isActive('bulletList') ? 'bg-techno-purple text-white' : 'text-gray-300'
          }`}
          type="button"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-600 ${
            editor.isActive('orderedList') ? 'bg-techno-purple text-white' : 'text-gray-300'
          }`}
          type="button"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-600 ${
            editor.isActive('blockquote') ? 'bg-techno-purple text-white' : 'text-gray-300'
          }`}
          type="button"
        >
          <Quote className="w-4 h-4" />
        </button>
        <div className="w-px h-8 bg-gray-600 mx-1" />
        <button
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-600 ${
            editor.isActive('link') ? 'bg-techno-purple text-white' : 'text-gray-300'
          }`}
          type="button"
        >
          <Link2 className="w-4 h-4" />
        </button>
        <div className="w-px h-8 bg-gray-600 mx-1" />
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-600 text-gray-300"
          type="button"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-600 text-gray-300"
          type="button"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="prose prose-invert max-w-none p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
