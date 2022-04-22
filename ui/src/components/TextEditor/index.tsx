import React from 'react';
import Image from 'next/image';
import * as tiptap from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { default as TipTapImage } from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import * as SolidIcon from '@heroicons/react/solid';
import * as HeadlessUi from '@headlessui/react';
import * as FAIcons from 'react-icons/fa';

import * as Interfaces from '@interfaces';
import * as Components from '@components';
import * as Helpers from '@helpers';
import * as Stores from '@stores';
import * as Config from '@config';
import * as Types from '@types';
import * as api from '@api';

type LetterIconType = {
    letter: string;
};

const LetterIcon: React.FC<LetterIconType> = (props) => (
    <span className="mx-auto block font-bold leading-none tracking-wide text-grey-700">{props.letter}</span>
);

const menuIconStyles = 'p-2 hover:bg-grey-100 hover:rounded focus:outline-yellow-500';
const activeMenuIconStyles = 'p-2 bg-grey-100 rounded focus:outline-yellow-500';

interface MenuBarProps {
    editor: tiptap.Editor;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const MenuBar: React.FC<MenuBarProps> = (props) => {
    const user = Stores.useAuthStore((state) => state.user);

    const headingOptions = React.useMemo(
        () => [
            {
                name: 'Paragraph',
                onClick: () => props.editor.chain().focus().setParagraph().run(),
                className: 'text-normal'
            },
            {
                name: 'Heading 1',
                onClick: () => props.editor.chain().focus().toggleHeading({ level: 1 }).run(),
                className: 'text-2xl'
            },
            {
                name: 'Heading 2',
                onClick: () => props.editor.chain().focus().toggleHeading({ level: 2 }).run(),
                className: 'text-xl'
            },
            {
                name: 'Heading 3',
                onClick: () => props.editor.chain().focus().toggleHeading({ level: 3 }).run(),
                className: 'text-lg'
            },
            {
                name: 'Heading 4',
                onClick: () => props.editor.chain().focus().toggleHeading({ level: 4 }).run(),
                className: 'text-md'
            },
            {
                name: 'Heading 5',
                onClick: () => props.editor.chain().focus().toggleHeading({ level: 5 }).run(),
                className: 'text-sm'
            },
            {
                name: 'Heading 6',
                onClick: () => props.editor.chain().focus().toggleHeading({ level: 6 }).run(),
                className: 'text-xs text-grey-500'
            }
        ],
        [props.editor]
    );

    const [activeImageUploadType, setActiveImageUploadType] = React.useState<Types.ImageUploadTypes>('FILE_UPLOAD');
    const [selected, setSelected] = React.useState(headingOptions[0]);
    const [linkModalVisible, setLinkModalVisible] = React.useState(false);
    const [imageModalVisible, setImageModalVisible] = React.useState(false);
    const [linkUrl, setLinkUrl] = React.useState('');
    const [image, setImage] = React.useState<Interfaces.TextEditorImage>({
        name: '',
        alt: '',
        base64: null,
        url: null,
        libraryUrl: null,
        width: null
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<null | string>(null);

    const openLinkModal = React.useCallback(() => {
        setLinkUrl(props.editor.getAttributes('link').href);
        setLinkModalVisible(true);
    }, [props.editor]);

    const closeLinkModal = React.useCallback(() => {
        setLinkModalVisible(false);
        setLinkUrl('');
    }, []);

    const saveLink = React.useCallback(() => {
        if (linkUrl) {
            props.editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl, target: '_blank' }).run();
        } else {
            props.editor.chain().focus().extendMarkRange('link').unsetLink().run();
        }
        closeLinkModal();
    }, [props.editor, linkUrl, closeLinkModal]);

    // TODO wire up remove link if we want to add this in the near future.
    const removeLink = React.useCallback(() => {
        props.editor.chain().focus().extendMarkRange('link').unsetLink().run();
        closeLinkModal();
    }, [props.editor, closeLinkModal]);

    // For File upload
    const handleUploadImage = async (files: Interfaces.ImagePreview[]) => {
        setLoading(true);

        for (const file of files) {
            try {
                const response = await api.post(
                    '/images',
                    {
                        name: file.name,
                        image: file.base64
                    },
                    user?.token
                );

                props.editor.commands.setImage({
                    src: `http://localhost:4566/science-octopus-publishing-images-local/${response.data.id}`,
                    alt: file.name,
                    title: image.name
                });

                setImageModalVisible(false);
            } catch (err) {
                console.log(err);
                setError('Some message');
            }
        }

        setLoading(false);
    };

    // For URL source upload
    const handleURLSourceUpload = (url: string) => {
        props.editor.commands.setImage({
            src: url,
            alt: image.alt,
            title: image.name
        });

        clearImageAndCloseModal();
    };

    // Clears the image state and closes the modal
    const clearImageAndCloseModal = () => {
        setImageModalVisible(false);
        setImage({
            name: '',
            alt: '',
            base64: null,
            url: null,
            width: '',
            libraryUrl: null
        });
    };

    React.useEffect(() => {
        if (props.editor) {
            if (props.editor.isActive('heading', { level: 1 })) {
                const option = headingOptions.find((option) => option.name === 'Heading 1');
                if (option) setSelected(option);
                props.setLoading(false);
            }

            if (props.editor.isActive('heading', { level: 2 })) {
                const option = headingOptions.find((option) => option.name === 'Heading 2');
                if (option) setSelected(option);
                props.setLoading(false);
            }

            if (props.editor.isActive('heading', { level: 3 })) {
                const option = headingOptions.find((option) => option.name === 'Heading 3');
                if (option) setSelected(option);
                props.setLoading(false);
            }

            if (props.editor.isActive('heading', { level: 4 })) {
                const option = headingOptions.find((option) => option.name === 'Heading 4');
                if (option) setSelected(option);
                props.setLoading(false);
            }

            if (props.editor.isActive('heading', { level: 5 })) {
                const option = headingOptions.find((option) => option.name === 'Heading 5');
                if (option) setSelected(option);
                props.setLoading(false);
            }

            if (props.editor.isActive('heading', { level: 6 })) {
                const option = headingOptions.find((option) => option.name === 'Heading 6');
                if (option) setSelected(option);
                props.setLoading(false);
            }

            if (props.editor.isActive('paragraph')) {
                const option = headingOptions.find((option) => option.name === 'Normal text');
                if (option) setSelected(option);
                props.setLoading(false);
            }
        }
    }, [props.loading, props.setLoading, props.editor, headingOptions]);

    return (
        props.editor && (
            <>
                <div className="flex items-center">
                    <HeadlessUi.Listbox value={selected} onChange={setSelected}>
                        <div className="relative mt-1">
                            <HeadlessUi.Listbox.Button className="relative w-full cursor-default rounded-lg py-2 pl-3 pr-10 text-left hover:cursor-pointer hover:bg-grey-100 focus:outline-yellow-500 sm:text-sm">
                                <span className="block truncate">{selected.name}</span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <SolidIcon.SelectorIcon className="h-5 w-5 text-grey-400" aria-hidden="true" />
                                </span>
                            </HeadlessUi.Listbox.Button>
                            <HeadlessUi.Transition
                                as={React.Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <HeadlessUi.Listbox.Options className="absolute z-40 mt-1 max-h-60 w-fit rounded-md bg-white-50 py-1 text-base shadow-sm sm:text-sm">
                                    {headingOptions.map((heading, index) => (
                                        <HeadlessUi.Listbox.Option
                                            key={index}
                                            className={({ active }) =>
                                                `${active ? 'text-slate-800  bg-grey-50' : 'text-slate-600'}
                          relative cursor-default select-none py-2 px-4 ${heading.className}`
                                            }
                                            value={heading}
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span
                                                        className={`${
                                                            selected ? 'font-medium' : 'font-normal'
                                                        } block truncate`}
                                                        onClick={heading.onClick}
                                                    >
                                                        {heading.name}
                                                    </span>
                                                </>
                                            )}
                                        </HeadlessUi.Listbox.Option>
                                    ))}
                                </HeadlessUi.Listbox.Options>
                            </HeadlessUi.Transition>
                        </div>
                    </HeadlessUi.Listbox>

                    <span className="mx-2 inline-block h-6 w-[1px] bg-grey-300" />

                    <div className="flex">
                        <button
                            type="button"
                            onClick={() => props.editor.chain().focus().toggleBold().run()}
                            className={props.editor.isActive('bold') ? activeMenuIconStyles : menuIconStyles}
                        >
                            <FAIcons.FaBold className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => props.editor.chain().focus().toggleItalic().run()}
                            className={props.editor.isActive('italic') ? activeMenuIconStyles : menuIconStyles}
                        >
                            <FAIcons.FaItalic className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => props.editor.chain().focus().toggleStrike().run()}
                            className={props.editor.isActive('strike') ? activeMenuIconStyles : menuIconStyles}
                        >
                            <FAIcons.FaStrikethrough className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <span className="mx-2 inline-block h-6 w-[1px] bg-grey-300" />
                        <button
                            type="button"
                            onClick={() => props.editor.chain().focus().setTextAlign('left').run()}
                            className={
                                props.editor.isActive({ textAlign: 'left' }) ? activeMenuIconStyles : menuIconStyles
                            }
                        >
                            <FAIcons.FaAlignLeft className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => props.editor.chain().focus().setTextAlign('center').run()}
                            className={
                                props.editor.isActive({ textAlign: 'center' }) ? activeMenuIconStyles : menuIconStyles
                            }
                        >
                            <FAIcons.FaAlignCenter className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => props.editor.chain().focus().setTextAlign('right').run()}
                            className={
                                props.editor.isActive({ textAlign: 'right' }) ? activeMenuIconStyles : menuIconStyles
                            }
                        >
                            <FAIcons.FaAlignRight className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <span className="mx-2 inline-block h-6 w-[1px] bg-grey-300" />
                        <button
                            type="button"
                            onClick={() => props.editor.chain().focus().toggleBulletList().run()}
                            className={props.editor.isActive('bulletList') ? activeMenuIconStyles : menuIconStyles}
                        >
                            <FAIcons.FaListUl className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => props.editor.chain().focus().toggleOrderedList().run()}
                            className={props.editor.isActive('orderedList') ? activeMenuIconStyles : menuIconStyles}
                        >
                            <FAIcons.FaListOl className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <span className="mx-2 inline-block h-6 w-[1px] bg-grey-300" />
                        <button
                            type="button"
                            onClick={() => props.editor.chain().focus().toggleCodeBlock().run()}
                            className={props.editor.isActive('codeBlock') ? activeMenuIconStyles : menuIconStyles}
                        >
                            <FAIcons.FaCode className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => props.editor.chain().focus().toggleBlockquote().run()}
                            className={props.editor.isActive('blockquote') ? activeMenuIconStyles : menuIconStyles}
                        >
                            <FAIcons.FaQuoteRight className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <span className="mx-2 inline-block h-6 w-[1px] bg-grey-300" />
                        <button
                            type="button"
                            onClick={openLinkModal}
                            className={props.editor.isActive('link') ? activeMenuIconStyles : menuIconStyles}
                        >
                            <FAIcons.FaLink className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <span className="mx-2 inline-block h-6 w-px bg-grey-300" />
                        <button
                            type="button"
                            onClick={() => {
                                setImage({
                                    name: props.editor.getAttributes('image').title,
                                    alt: props.editor.getAttributes('image').alt,
                                    base64: null,
                                    url: null,
                                    width: '',
                                    libraryUrl: null
                                });
                                setImageModalVisible(true);
                            }}
                            className={props.editor.isActive('image') ? activeMenuIconStyles : menuIconStyles}
                        >
                            <FAIcons.FaImage className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <span className="mx-2 inline-block h-6 w-px bg-grey-300" />
                        <button
                            type="button"
                            className={props.editor.isActive('horizontalRule') ? activeMenuIconStyles : menuIconStyles}
                            onClick={() => props.editor.chain().focus().setHorizontalRule().run()}
                        >
                            <FAIcons.FaRulerHorizontal className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <span className="mx-2 inline-block h-6 w-px bg-grey-300" />
                        <button
                            type="button"
                            title="insertTable"
                            className={props.editor.isActive('insertTable') ? activeMenuIconStyles : menuIconStyles}
                            onClick={() =>
                                props.editor
                                    ?.chain()
                                    .focus()
                                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                                    .run()
                            }
                        >
                            <FAIcons.FaTable className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className={props.editor.isActive('addColumnBefore') ? activeMenuIconStyles : menuIconStyles}
                            onClick={() => props.editor?.chain().focus().addColumnBefore().run()}
                        >
                            <FAIcons.FaColumns className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className={props.editor.isActive('deleteColumn') ? activeMenuIconStyles : menuIconStyles}
                            onClick={() => props.editor?.chain().focus().deleteColumn().run()}
                        >
                            <FAIcons.FaStop className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className={props.editor.isActive('addRowBefore') ? activeMenuIconStyles : menuIconStyles}
                            onClick={() => props.editor?.chain().focus().addRowBefore().run()}
                        >
                            <FAIcons.FaPlusSquare className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className={props.editor.isActive('deleteRow') ? activeMenuIconStyles : menuIconStyles}
                            onClick={() => props.editor?.chain().focus().deleteRow().run()}
                        >
                            <FAIcons.FaMinusSquare className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className={props.editor.isActive('deleteTable') ? activeMenuIconStyles : menuIconStyles}
                            onClick={() => props.editor?.chain().focus().deleteTable().run()}
                        >
                            <LetterIcon letter="X" />
                        </button>
                        <span className="mx-2 inline-block h-6 w-px bg-grey-300" />
                        <button
                            type="button"
                            className={props.editor.isActive('undo') ? activeMenuIconStyles : menuIconStyles}
                            onClick={() => props.editor.chain().focus().undo().run()}
                        >
                            <FAIcons.FaUndo className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className={props.editor.isActive('redo') ? activeMenuIconStyles : menuIconStyles}
                            onClick={() => props.editor.chain().focus().redo().run()}
                        >
                            <FAIcons.FaRedo className="h-3 w-3 text-grey-700" aria-hidden="true" />
                        </button>
                    </div>
                </div>
                {/* Link modal */}
                <HeadlessUi.Dialog
                    open={linkModalVisible}
                    onClose={() => setLinkModalVisible(false)}
                    className="fixed inset-0 z-10 overflow-y-auto"
                >
                    <HeadlessUi.Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

                    <div className="relative top-[30%] mx-auto max-w-sm rounded bg-white-50 p-4 shadow-sm">
                        <HeadlessUi.Dialog.Title className="sr-only">Add your link</HeadlessUi.Dialog.Title>
                        <HeadlessUi.Dialog.Description>
                            <label htmlFor="link" className="mt-4 block text-sm font-medium text-grey-700">
                                Enter your link
                            </label>
                            <div className="mt-2">
                                <input
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    type="text"
                                    name="link"
                                    id="link"
                                    accept="image/png, image/jpeg, image/jpg"
                                    className="block w-full rounded-md border-grey-300 shadow-sm placeholder:font-light focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 sm:text-sm"
                                />
                            </div>
                        </HeadlessUi.Dialog.Description>

                        <div className="mt-6 flex justify-between">
                            <button
                                className="border-1 inline-flex items-center rounded border border-grey-300 bg-white-50 py-1.5 text-xs font-medium text-grey-700 first:px-2.5 hover:bg-grey-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                                onClick={closeLinkModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-sky-50 text-sky-900 hover:bg-sky-100 inline-flex items-center rounded border px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                                onClick={saveLink}
                            >
                                Add link
                            </button>
                        </div>
                    </div>
                </HeadlessUi.Dialog>

                {/* Image upload modal */}
                <HeadlessUi.Dialog
                    open={imageModalVisible}
                    onClose={() => setImageModalVisible(false)}
                    className="fixed inset-0 z-10 overflow-y-auto"
                >
                    <HeadlessUi.Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

                    <div className="relative top-[30%] mx-auto w-11/12 rounded bg-white-50 p-4 shadow-sm md:w-9/12 lg:w-160 xl:w-192">
                        <HeadlessUi.Dialog.Title className="sr-only">Add an image</HeadlessUi.Dialog.Title>
                        <HeadlessUi.Dialog.Description>
                            <Components.Tabs
                                tabHead={['File upload', 'URL source']}
                                tabBody={[
                                    <Components.FileUpload
                                        key="file-upload"
                                        positiveActionCallback={handleUploadImage}
                                        negativeActionCallback={clearImageAndCloseModal}
                                        loading={loading}
                                    />,
                                    <Components.URLSourceUpload
                                        key="url-source-upload"
                                        image={image}
                                        positiveActionCallback={handleURLSourceUpload}
                                        negativeActionCallback={clearImageAndCloseModal}
                                    />
                                ]}
                            />
                        </HeadlessUi.Dialog.Description>
                    </div>
                </HeadlessUi.Dialog>
            </>
        )
    );
};

// handleURLSourceUpload(e.target.value)

interface TextEditorProps {
    contentChangeHandler: (editor: any) => void;
    defaultContent: string;
}

const TextEditor: React.FC<TextEditorProps> = (props) => {
    const [loading, setLoading] = React.useState(true);

    const textEditor = tiptap.useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right']
            }),
            Table.configure({
                resizable: true
            }),
            TableRow,
            TableHeader,
            TableCell,
            TipTapImage.configure({
                inline: true
            })
        ],
        onUpdate: ({ editor }) => props.contentChangeHandler(editor.getHTML()),
        onSelectionUpdate: () => setLoading(true),
        editorProps: {
            attributes: {
                class: `${Config.values.HTMLStyles} prose max-w-none mt-6 outline-none min-h-[80px] xl:min-h-[150px] 2xl:min-h-[350px] dark:text-grey-800`
            }
        },
        content: props.defaultContent
    });

    // Focus the editor on render
    React.useEffect(() => {
        if (textEditor) textEditor.commands.focus('start');
    }, [textEditor]);

    return textEditor ? (
        <div className="mb-4 rounded-md border border-grey-100 bg-white-50 px-4 pt-2 pb-4 shadow focus-within:ring-2 focus-within:ring-yellow-500">
            <MenuBar editor={textEditor} loading={loading} setLoading={setLoading} />
            <tiptap.EditorContent editor={textEditor} />
        </div>
    ) : null;
};

export default TextEditor;
