import { forwardRef, useImperativeHandle } from "react"
import { BasicTextStyleButton, BlockTypeSelect, FormattingToolbar, useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import { VersionManager, type SavedVersion } from "../utils/versionManager"

export interface RichTextEditorRef {
  getPlainText: () => Promise<string>
  getContent: () => Promise<string>
  saveVersion: (name: string) => Promise<SavedVersion>
  loadVersion: (versionId: string) => Promise<void>
  getSavedVersions: () => SavedVersion[]
  deleteVersion: (versionId: string) => void
}

interface RichTextEditorProps {
  className?: string
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ className }, ref) => {
    // Create BlockNote editor instance
    const editor = useCreateBlockNote({
      initialContent: [
        {
          type: "paragraph",
          content: [],
        },
      ],

    })

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      getPlainText: async () => {
        // Use markdown conversion to preserve block structure, then strip markdown formatting
        const markdown = await editor.blocksToMarkdownLossy(editor.document)
        // Remove markdown formatting but keep line breaks
        return markdown
          .replace(/^#{1,6}\s+/gm, '') // Remove headers
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
          .replace(/\*(.*?)\*/g, '$1') // Remove italic
          .replace(/`(.*?)`/g, '$1') // Remove inline code
          .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
          .replace(/^\s*[-*+]\s+/gm, '') // Remove bullet points
          .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
          .replace(/^\s*>\s+/gm, '') // Remove blockquotes
          .replace(/```[\s\S]*?```/g, '') // Remove code blocks
          .replace(/---+/g, '') // Remove horizontal rules
          .trim()
      },
      getContent: async () => {
        return await editor.blocksToFullHTML(editor.document)
      },
      saveVersion: async (name: string) => {
        const content = await editor.blocksToFullHTML(editor.document)
        // Use the improved plain text extraction for preview
        const plainText = await (async () => {
          const markdown = await editor.blocksToMarkdownLossy(editor.document)
          return markdown
            .replace(/^#{1,6}\s+/gm, '') // Remove headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/`(.*?)`/g, '$1') // Remove inline code
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
            .replace(/^\s*[-*+]\s+/gm, '') // Remove bullet points
            .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
            .replace(/^\s*>\s+/gm, '') // Remove blockquotes
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/---+/g, '') // Remove horizontal rules
            .trim()
        })()
        return VersionManager.saveVersion(name, content, plainText)
      },
      loadVersion: async (versionId: string) => {
        const version = VersionManager.getVersion(versionId)
        if (!version) {
          throw new Error('Version not found')
        }
        
        try {
          // Try to parse the content as HTML and replace the editor content
          const blocks = await editor.tryParseHTMLToBlocks(version.content)
          editor.replaceBlocks(editor.document, blocks)
        } catch (error) {
          console.error('Error loading version:', error)
          throw new Error('Failed to load version content')
        }
      },
      getSavedVersions: () => {
        return VersionManager.getSavedVersions()
      },
      deleteVersion: (versionId: string) => {
        VersionManager.deleteVersion(versionId)
      }
    }))

    return (
      <div className={className} style={{ paddingInline: "10px" }}>
        <BlockNoteView
          editor={editor}
          sideMenu={false}
          formattingToolbar={false}
          linkToolbar={false}
          data-theming-css-variables={{
            dark: {
              "--bn-colors-editor-background": "#18181b",
              "--bn-colors-editor-text": "#ffffff",
              "--bn-colors-menu-background": "#27272a",
              "--bn-colors-menu-text": "#ffffff",
              "--bn-colors-tooltip-background": "#3f3f46",
              "--bn-colors-tooltip-text": "#ffffff",
              "--bn-colors-hovered-background": "#3f3f46",
              "--bn-colors-selected-background": "#44fc75",
              "--bn-colors-selected-text": "#000000",
              "--bn-colors-border": "#44fc75",
              "--bn-colors-side-menu": "#27272a",
              "--bn-colors-highlights-gray-background": "#3f3f46",
              "--bn-colors-highlights-gray-text": "#ffffff",
            },
          }}
          theme="dark"
        >
          <FormattingToolbar>
            <BlockTypeSelect key={"blockTypeSelect"} />


            <BasicTextStyleButton
              basicTextStyle={"bold"}
              key={"boldStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"italic"}
              key={"italicStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"underline"}
              key={"underlineStyleButton"}
            />
          </FormattingToolbar>
        </BlockNoteView>
      </div>
    )
  }
)

RichTextEditor.displayName = "RichTextEditor" 