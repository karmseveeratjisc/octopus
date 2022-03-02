import React from 'react';
import parse from 'html-react-parser';
import * as Router from 'next/router';
import * as OutlineIcons from '@heroicons/react/outline';

import * as Interfaces from '@interfaces';
import * as Components from '@components';
import * as Stores from '@stores';
import * as Config from '@config';
import * as Types from '@types';
import * as api from '@api';

type NavigationButtonProps = {
    text: string;
    disabled?: boolean;
    onClick: () => void;
};

const NavigationButton: React.FC<NavigationButtonProps> = (props) => (
    <button
        disabled={props.disabled}
        onClick={props.onClick}
        className="rounded bg-teal-500 px-3 py-1 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:hover:cursor-not-allowed"
    >
        {props.text}
    </button>
);

type BuildPublicationProps = {
    steps: { title: string; subTitle: string }[];
    currentStep: number;
    setStep: any; //Not sure what type we can use for a state setter than has access tp previous state
    publication: Interfaces.Publication;
    token: string;
    children: React.ReactNode;
};

const BuildPublication: React.FC<BuildPublicationProps> = (props) => {
    const router = Router.useRouter();
    const title = Stores.usePublicationCreationStore((state: Types.PublicationCreationStoreType) => state.title);
    const content = Stores.usePublicationCreationStore((state: Types.PublicationCreationStoreType) => state.content);
    const licence = Stores.usePublicationCreationStore((state: Types.PublicationCreationStoreType) => state.licence);
    const conflictOfInterestStatus = Stores.usePublicationCreationStore(
        (state: Types.PublicationCreationStoreType) => state.conflictOfInterestStatus
    );
    const conflictOfInterestText = Stores.usePublicationCreationStore(
        (state: Types.PublicationCreationStoreType) => state.conflictOfInterestText
    );

    const [confirmSaveExit, setConfirmSaveExit] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const prev = () => props.setStep((prevState: number) => prevState - 1);
    const next = () => props.setStep((prevState: number) => prevState + 1);

    const publish = () => {
        // update all fields with store data & change status to live
        alert('Please confirm etc...');
    };

    const saveExit = async () => {
        setError(null);
        try {
            await api.patch(
                `${Config.endpoints.publications}/${props.publication.id}`,
                {
                    title,
                    content,
                    licence,
                    conflictOfInterestStatus,
                    conflictOfInterestText
                },
                props.token
            );

            // no status check on response, assume all went well. Error is handled seperately.
            router.push({
                pathname: Config.urls.browsePublications.path
            });
        } catch (err) {
            const { message } = err as Interfaces.JSONResponseError;
            setError(message);
            console.log(err);
        }

        setConfirmSaveExit(false);
    };

    return (
        <>
            <Components.Modal
                open={confirmSaveExit}
                setOpen={setConfirmSaveExit}
                positiveActionCallback={saveExit}
                positiveButtonText="Save and exit"
                negativeButtonText="Cancel"
                title="Are you sure you want to leave?"
                icon={<OutlineIcons.SaveIcon className="text-green-600 h-6 w-6" aria-hidden="true" />}
            >
                <p className="text-gray-500 text-sm">
                    Changes to your publication will be saved and it&apos;s status kept as draft.
                </p>
            </Components.Modal>
            <div className="bg-teal-50 transition-colors duration-500 dark:bg-grey-800">
                <Components.Header fixed={true} />
                <main className="container mx-auto grid min-h-screen grid-cols-12 lg:pt-24">
                    <section className="col-span-12 p-8 lg:col-span-9">
                        <div className="mb-12 flex flex-col items-center lg:flex-row lg:justify-between">
                            <span className="mb-4 block text-xxs font-bold uppercase tracking-widest text-grey-800 transition-colors duration-500 dark:text-grey-100">
                                {Object.values(props.steps)[props.currentStep].subTitle}
                            </span>
                            <div className="grid grid-cols-3 gap-4">
                                <NavigationButton text="Save and exit" onClick={() => setConfirmSaveExit(true)} />
                                <NavigationButton text="Previous" disabled={props.currentStep <= 0} onClick={prev} />
                                {props.currentStep < props.steps.length - 1 && (
                                    <NavigationButton
                                        text="Next"
                                        disabled={props.currentStep >= props.steps.length - 1}
                                        onClick={next}
                                    />
                                )}
                                {props.currentStep === props.steps.length - 1 && (
                                    <NavigationButton text="Publish" onClick={publish} />
                                )}
                            </div>
                        </div>
                        <div className="mb-12">{props.children}</div>
                        {!!error && (
                            <Components.Alert severity="ERROR" title={error} allowDismiss={true} className="w-fit" />
                        )}
                    </section>
                    <aside className="hidden pt-8 pl-12 lg:col-span-3 lg:block">
                        <ul className="space-y-4">
                            {props.steps.map((step, index) => (
                                <li key={step.title}>
                                    <button
                                        onClick={() => props.setStep(index)}
                                        className={`${
                                            index === props.currentStep ? 'bg-teal-500 text-white' : ''
                                        } dark:hovertext-white w-full rounded py-1 pl-2 text-left text-base outline-0 transition-colors duration-150 hover:bg-teal-600 hover:text-grey-50 focus:ring-2 focus:ring-yellow-400 dark:text-grey-50`}
                                    >
                                        {parse(step.title)}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </aside>
                </main>
            </div>
        </>
    );
};

export default BuildPublication;
