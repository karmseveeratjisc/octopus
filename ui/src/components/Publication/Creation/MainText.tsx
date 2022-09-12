import React, { useState } from 'react';

import * as Components from '@components';
import * as Helpers from '@helpers';
import * as OutlineIcons from '@heroicons/react/outline';
import * as Stores from '@stores';
import * as Types from '@types';
import * as tiptap from '@tiptap/react';
import * as Interfaces from '@interfaces';
import * as FAIcons from 'react-icons/fa';
import * as Config from '@config';

import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import cuid from 'cuid';

const menuIconStyles = 'p-2 hover:bg-grey-100 hover:rounded focus:outline-yellow-500';
const activeMenuIconStyles = 'p-2 bg-grey-100 rounded focus:outline-yellow-500';

interface MenuBarProps {
    editor: tiptap.Editor;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const MenuBar: React.FC<MenuBarProps> = (props) => {
    return (
        props.editor && (
            <div className="flex items-center">
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

                <button
                    type="button"
                    onClick={() => props.editor.chain().focus().toggleUnderline().run()}
                    className={props.editor.isActive('underline') ? activeMenuIconStyles : menuIconStyles}
                >
                    <FAIcons.FaUnderline className="h-3 w-3 text-grey-700" aria-hidden="true" />
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
        )
    );
};

type AddReferencesProps = {
    addReferences: (editorContent: string) => void;
};

const AddReferences: React.FC<AddReferencesProps> = ({ addReferences }) => {
    const [loading, setLoading] = useState(true);
    const textEditor = tiptap.useEditor({
        extensions: [StarterKit, Underline],
        onSelectionUpdate: () => setLoading(true),
        editorProps: {
            attributes: {
                class: `${Config.values.HTMLStylesTiptapEditor} mt-6 outline-none min-h-[100px] xl:min-h-[200px] dark:text-grey-800`
            }
        }
    });

    return (
        <>
            {textEditor && (
                <div className="w-full rounded-md border border-grey-100 bg-white-50 p-4 shadow focus-within:ring-2 focus-within:ring-yellow-500">
                    <MenuBar editor={textEditor} loading={loading} setLoading={setLoading} />
                    <tiptap.EditorContent editor={textEditor} />
                </div>
            )}

            <Components.Button
                link
                onClick={(e) => {
                    if (!textEditor) {
                        return;
                    }

                    // don't add empty paragraphs
                    if (!textEditor?.getText().trim()) {
                        return;
                    }

                    addReferences(textEditor.getHTML());
                    textEditor?.commands.clearContent(true);
                }}
                title={'Add references'}
                iconPosition={'RIGHT'}
                icon={
                    <OutlineIcons.PlusCircleIcon className="h-6 w-6 text-teal-500 transition-colors duration-500 dark:text-white-50" />
                }
            />
        </>
    );
};

const MainText: React.FC = (): React.ReactElement | null => {
    const {
        id: publicationId,
        updateDescription,
        keywords,
        updateKeywords,
        content,
        description,
        updateContent,
        language,
        updateLanguage,
        references,
        updateReferences
    } = Stores.usePublicationCreationStore();
    const [selectedReference, setSelectedReference] = useState<Interfaces.Reference | null>(null);
    const [deleteModalVisibility, setDeleteModalVisibility] = React.useState(false);

    const addReferences = (editorContent: string) => {
        const paragraphsArray = editorContent.match(/<p>(.*?)<\/p>/g) || [];

        if (!paragraphsArray.length) {
            return;
        }

        let referencesArray = references || [];

        for (let i = 0; i < paragraphsArray.length; i++) {
            const currentParagraph = paragraphsArray[i].trim();
            const paragraphElement = new DOMParser().parseFromString(currentParagraph, 'text/html').querySelector('p');
            const textContent = paragraphElement?.textContent?.trim();

            if (!textContent) {
                continue;
            }

            const URL_REGEX = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g;

            const urlMatches = textContent.match(URL_REGEX) || [];
            if (!urlMatches?.length) {
                // no urls have been found
                referencesArray.push({
                    id: cuid(),
                    publicationId,
                    type: 'TEXT',
                    text: currentParagraph,
                    location: null
                });
                // skip the other checks
                continue;
            }

            // reverse the order for easier access
            const reversedUrlMatches = urlMatches.reverse(); // we only need the last DOI/URL

            // get the last valid DOI url
            const DOI_REGEX = /(10\.[0-9a-zA-Z]+\/(?:(?!["&\'])\S)+)\b/g;
            const doiUrl = reversedUrlMatches.find((match) => DOI_REGEX.test(match));

            if (doiUrl) {
                referencesArray.push({
                    id: cuid(),
                    publicationId,
                    type: 'DOI',
                    text: currentParagraph,
                    location: doiUrl
                });
                continue;
            }

            // extract the last URL
            const lastUrl = reversedUrlMatches[0];
            referencesArray.push({
                id: cuid(),
                publicationId,
                type: 'URL',
                text: currentParagraph,
                location: lastUrl
            });
        }
        updateReferences(referencesArray);
    };

    const destroyReference = (id: string) => {
        updateReferences(references.filter((item) => item.id !== id));
        setSelectedReference(null)
        setDeleteModalVisibility(false);
    };

    const handleDeleteReference = (reference: Interfaces.Reference) => {
        setSelectedReference(reference);
        setDeleteModalVisibility(true);
    }


    return (
        <>
            <Components.Modal
                open={deleteModalVisibility}
                setOpen={setDeleteModalVisibility}
                positiveActionCallback={() => {
                    if(selectedReference) {
                        destroyReference(selectedReference.id);                
                    }
                }}
                positiveButtonText="Delete"
                cancelButtonText="Cancel"
                title="Are you sure you want to delete this reference"
                icon={<OutlineIcons.TrashIcon className="h-10 w-10 text-grey-600" aria-hidden="true" />}
            >
                <p className="text-gray-500 text-sm"> Deleting a reference may affect the accuracy of your reference numbering and in-text references. Are you sure you want to delete this reference? This action cannot be undone. </p>
            </Components.Modal>
            <div className="space-y-12 2xl:space-y-16">
                <div>
                    <Components.PublicationCreationStepTitle text="Main text" required />
                    {publicationId && (
                        <Components.TextEditor
                            defaultContent={content}
                            contentChangeHandler={updateContent}
                            references={references}
                        />
                    )}
                </div>

                <div>
                    <Components.PublicationCreationStepTitle text="Language" required />
                    <select
                        name="language"
                        id="language"
                        onChange={(e) => updateLanguage(e.target.value as Types.Languages)}
                        className="mb-4 block w-full rounded-md border border-grey-100 bg-white-50 text-grey-800 shadow outline-0 focus:ring-2 focus:ring-yellow-400 lg:mb-0 xl:w-1/2"
                        required
                        defaultValue={
                            Config.values.octopusInformation.languages.find((entry) => entry.code === language)?.code ||
                            'en'
                        }
                    >
                        {Config.values.octopusInformation.languages.map((entry) => (
                            <option key={entry.code} value={entry.code}>
                                {entry.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4">
                    <Components.PublicationCreationStepTitle text="References" />
                    <span className="mb-2 block text-sm leading-snug text-grey-700 transition-colors duration-500 dark:text-white-50">
                        Include your reference list for this publication. References should be line-separated and include a
                        DOI or other URL. Once you have added your references, you can create reference links in the main
                        text editor.
                    </span>
                    <div className="flex flex-col items-end space-y-4">
                        <AddReferences addReferences={addReferences} />
                        {references && references.length > 0 && (
                            <div className="w-full overflow-hidden pt-8 shadow ring-1 ring-black ring-opacity-5 dark:ring-transparent md:rounded-lg">
                                <table className="min-w-full table-fixed divide-y divide-grey-100 dark:divide-teal-300">
                                    <thead className="bg-grey-50 transition-colors duration-500 dark:bg-grey-700">
                                        <tr>
                                            <th className="whitespace-pre py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-grey-900 transition-colors duration-500 dark:text-grey-50 sm:pl-6 ">
                                                Title
                                            </th>
                                            <th className="whitespace-pre py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-grey-900 transition-colors duration-500 dark:text-grey-50 sm:pl-6">
                                                Location
                                            </th>
                                            <th className="whitespace-pre py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-grey-900 transition-colors duration-500 dark:text-grey-50 sm:pl-6 "></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-grey-100 bg-white-50 transition-colors duration-500 dark:divide-teal-300 dark:bg-grey-600">
                                        {references.map((reference) => (
                                            <tr key={reference.id}>
                                                <td className="space-nowrap py-4 pl-4 pr-3 text-sm text-grey-900 transition-colors duration-500 children:text-sm dark:text-white-50 sm:pl-6">
                                                    <Components.ParseHTML
                                                        content={
                                                            reference.location
                                                                ? reference.text.replaceAll(
                                                                    reference.location,
                                                                    `<a href="${reference.location}" target="_blank" rel="noreferrer noopener">${reference.location}</a>`
                                                                )
                                                                : reference.text
                                                        }
                                                    ></Components.ParseHTML>
                                                </td>
                                                <td className="space-nowrap py-4 pl-4 pr-3 text-sm text-grey-900 underline transition-colors duration-500 dark:text-white-50 sm:pl-6">
                                                    {reference.location && (
                                                        <Components.Link href={reference.location} openNew>
                                                            {reference.location}
                                                        </Components.Link>
                                                    )}
                                                </td>
                                                <td className="space-nowrap py-4 px-8 text-center text-sm font-medium text-grey-900 transition-colors duration-500 dark:text-white-50">
                                                    <button
                                                        onClick={(e) => handleDeleteReference(reference)}
                                                        className="rounded-full"
                                                    >
                                                        <OutlineIcons.TrashIcon className="h-6 w-6 text-teal-600 transition-colors duration-500 dark:text-teal-400" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <Components.PublicationCreationStepTitle text="Short description" />
                    <span className="mb-2 block text-sm leading-snug text-grey-700 transition-colors duration-500 dark:text-white-50">
                        Include a short description of your publication to aid discovery. This can be no more than 160
                        characters in length.
                    </span>
                    <textarea
                        required
                        rows={3}
                        maxLength={160}
                        value={description}
                        onChange={(e) => updateDescription(e.target.value)}
                        className="block w-full rounded-md border border-grey-100 bg-white-50 text-grey-800 shadow outline-0 transition-colors duration-500 focus:ring-2 focus:ring-yellow-400"
                    />
                    <div className="mt-2 flex justify-end">
                        <span className="text-xs text-grey-500 dark:text-white-50">{description.length} / 160</span>
                    </div>
                </div>

                <div>
                    <Components.PublicationCreationStepTitle text="Keywords" />
                    <span className="mb-2 block text-sm leading-snug text-grey-700 transition-colors duration-500 dark:text-white-50">
                        Include up to 10 keywords relating to your content. These can be comma-separated and/or line
                        separated.
                    </span>
                    <textarea
                        required
                        rows={5}
                        value={keywords}
                        onChange={(e) => updateKeywords(e.target.value)}
                        className="block w-full rounded-md border border-grey-100 bg-white-50 text-grey-800 shadow outline-0 transition-colors duration-500 focus:ring-2 focus:ring-yellow-400"
                    />
                    <div className="mt-2 flex justify-end">
                        <span className="text-xs text-grey-500 dark:text-white-50">
                            {Helpers.formatKeywords(keywords).length} / 10
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MainText;
