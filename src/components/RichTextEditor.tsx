import { forwardRef, useImperativeHandle } from "react"
import { BasicTextStyleButton, BlockTypeSelect, FormattingToolbar, useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"

export interface RichTextEditorRef {
  getPlainText: () => Promise<string>
  getContent: () => Promise<string>
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
        const content = await editor.blocksToFullHTML(editor.document)
        return content.replace(/<[^>]*>/g, '').trim() // Strip HTML tags for plain text
      },
      getContent: async () => {
        return await editor.blocksToFullHTML(editor.document)
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